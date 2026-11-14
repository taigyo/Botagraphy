// ボタグラフィ オンライン対戦サーバー（Cloudflare Workers + Durable Objects）
//   /ws/match        … ランダムマッチ待機所（Lobby・全員で1つ）
//   /ws/room/<CODE>  … 1対戦ぶんの部屋（Room・合言葉ごとに1つ）
//   /api/room/new    … 新しい合言葉を発行
//   それ以外         … public/ の静的ファイル（ゲーム本体）
import { DurableObject } from "cloudflare:workers";

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 0/O/1/I を除外
const ROOM_TTL = 30 * 60 * 1000; // 部屋は最後の操作から30分で自動削除
const mkCode = () => {
  const a = new Uint8Array(4);
  crypto.getRandomValues(a);
  return [...a].map((x) => ALPHA[x % ALPHA.length]).join("");
};
const json = (o, s = 200) =>
  new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const send = (ws, o) => { try { ws.send(JSON.stringify(o)); } catch {} };
const clean = (s, n = 24) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, "").slice(0, n);
const isWs = (req) => req.headers.get("Upgrade") === "websocket";

async function newRoom(env) {
  for (let i = 0; i < 8; i++) {
    const code = mkCode();
    const r = await env.ROOM.get(env.ROOM.idFromName(code)).fetch("https://room/init", { method: "POST" });
    if (r.status === 200) return code;
  }
  return null;
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === "/api/room/new" && req.method === "POST") {
      const code = await newRoom(env);
      return code ? json({ code }) : json({ error: "busy" }, 503);
    }
    if (u.pathname === "/ws/match") {
      if (!isWs(req)) return new Response("WebSocket only", { status: 426 });
      return env.LOBBY.get(env.LOBBY.idFromName("main")).fetch(req);
    }
    const m = u.pathname.match(/^\/ws\/room\/([A-Za-z0-9]{4})$/);
    if (m) {
      if (!isWs(req)) return new Response("WebSocket only", { status: 426 });
      return env.ROOM.get(env.ROOM.idFromName(m[1].toUpperCase())).fetch(req);
    }
    return env.ASSETS.fetch(req);
  },
};

// ---------- ランダムマッチ待機所 ----------
export class Lobby extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }
  async fetch() {
    const [c, s] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(s);
    s.serializeAttachment({ q: 0, pid: "" });
    return new Response(null, { status: 101, webSocket: c });
  }
  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    const a = ws.deserializeAttachment() || {};
    if (m.t === "queue") {
      a.q = Date.now(); a.pid = clean(m.pid, 40); a.name = clean(m.name, 12); a.deck = clean(m.deck);
      ws.serializeAttachment(a);
      const partner = this.ctx.getWebSockets()
        .filter((w) => w !== ws)
        .map((w) => [w, w.deserializeAttachment()])
        .filter(([, x]) => x && x.q && x.pid !== a.pid)
        .sort((x, y) => x[1].q - y[1].q)[0];
      if (!partner) return send(ws, { t: "queued" });
      // 先に両者を待機解除（await の間に別の人とペアにならないように）
      const [pw, px] = partner;
      a.q = 0; ws.serializeAttachment(a);
      px.q = 0; pw.serializeAttachment(px);
      const code = await newRoom(this.env);
      if (!code) { send(ws, { t: "err", msg: "サーバーが混み合っています。もう一度お試しください。" }); return; }
      send(ws, { t: "matched", room: code });
      send(pw, { t: "matched", room: code });
    } else if (m.t === "cancel") {
      a.q = 0; ws.serializeAttachment(a); send(ws, { t: "cancelled" });
    }
  }
  async webSocketClose(ws, code, reason) { try { ws.close(code, reason); } catch {} }
}

// ---------- 対戦の部屋 ----------
// ・席(seat)ごとに「届けたいメッセージの履歴」を持ち、番号(q)を振って確実に届ける（切断→再接続でも取りこぼさない）
// ・同時公開：両者の「配置の計画(plan)」がそろってから、同時に配る
// ・相手の手札や山札は一切持たない（持つのは公開情報の通信だけ）
const okItem = (x) =>
  x && typeof x.n === "string" && x.n.length <= 24 && Number.isInteger(x.c) && x.c >= 0 && x.c <= 30 &&
  Number.isInteger(x.cell) && x.cell >= -1 && x.cell < 36 && (x.tg == null || (Number.isInteger(x.tg) && x.tg >= 0 && x.tg < 36));
const LOG_MAX = 600;

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }
  async fetch(req) {
    const u = new URL(req.url);
    const st = this.ctx.storage;
    if (u.pathname === "/init") {
      if (await st.get("created")) return new Response("exists", { status: 409 });
      await st.put({ created: Date.now(), phase: "lobby", seats: [null, null], log: [[], []], seq: [0, 0], cseq: [0, 0], plans: {} });
      await st.setAlarm(Date.now() + ROOM_TTL);
      return new Response("ok");
    }
    const [c, s] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(s);
    s.serializeAttachment({ pid: "", side: -1 });
    if (!(await st.get("created"))) {
      send(s, { t: "err", msg: "その合言葉のルームは見つかりません。" });
      s.close(1000, "not found");
    }
    return new Response(null, { status: 101, webSocket: c });
  }
  async touch() { await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL); }
  live(pid) { return this.ctx.getWebSockets().filter((w) => (w.deserializeAttachment() || {}).pid === pid); }
  liveSide(side) { return this.ctx.getWebSockets().filter((w) => (w.deserializeAttachment() || {}).side === side); }
  // 席 side 宛てのメッセージを、番号つきで履歴に積んで届ける
  async push(side, msg) {
    const st = this.ctx.storage;
    const seq = (await st.get("seq")) || [0, 0];
    const log = (await st.get("log")) || [[], []];
    msg.q = ++seq[side];
    log[side].push(msg);
    if (log[side].length > LOG_MAX) log[side].splice(0, log[side].length - LOG_MAX);
    await st.put({ seq, log });
    for (const w of this.liveSide(side)) send(w, msg);
  }
  async broadcast() {
    const seats = (await this.ctx.storage.get("seats")) || [null, null];
    const phase = await this.ctx.storage.get("phase");
    const players = seats.map((p, i) => p && { side: i, name: p.name, deck: p.deck, ready: p.ready, online: this.live(p.pid).length > 0 });
    for (const w of this.ctx.getWebSockets()) {
      const a = w.deserializeAttachment() || {};
      if (a.side >= 0) send(w, { t: "state", phase, you: a.side, players });
    }
  }
  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    const st = this.ctx.storage;
    const a = ws.deserializeAttachment() || { pid: "", side: -1 };
    const seats = (await st.get("seats")) || [null, null];
    const phase = await st.get("phase");
    if (m.t === "hello") {
      const pid = clean(m.pid, 40);
      if (!pid) return;
      let idx = seats.findIndex((p) => p && p.pid === pid);
      if (idx < 0) {
        if (phase !== "lobby") return send(ws, { t: "err", msg: "このルームはすでに対戦中です。" }), ws.close(1000, "busy");
        idx = seats.findIndex((p) => !p);
        if (idx < 0) return send(ws, { t: "err", msg: "このルームは満員です。" }), ws.close(1000, "full");
        seats[idx] = { pid, name: clean(m.name, 12) || "プレイヤー", deck: clean(m.deck), ready: false };
      } else {
        seats[idx].name = clean(m.name, 12) || seats[idx].name;
        seats[idx].deck = clean(m.deck) || seats[idx].deck;
      }
      for (const w of this.live(pid)) if (w !== ws) { send(w, { t: "err", msg: "別の画面で入室されました。" }); w.close(4001, "replaced"); }
      ws.serializeAttachment({ pid, side: idx });
      await st.put("seats", seats);
      await this.touch();
      await this.broadcast();
      if (phase === "playing") {
        send(ws, { t: "start", seed: await st.get("seed"), first: await st.get("first"), you: idx });
        // 取りこぼしたメッセージを再送（クライアントが最後に受けた番号 ack より後ろ）
        const ack = Number.isInteger(m.ack) ? m.ack : 0;
        const log = ((await st.get("log")) || [[], []])[idx];
        for (const x of log) if (x.q > ack) send(ws, x);
      }
      return;
    }
    if (a.side < 0) return;
    const me = a.side, op = 1 - me;
    if (m.t === "ready" && phase === "lobby") {
      seats[me].ready = !!m.v;
      await st.put("seats", seats);
      if (seats[0] && seats[1] && seats[0].ready && seats[1].ready) {
        const seed = crypto.getRandomValues(new Uint32Array(1))[0];
        const first = crypto.getRandomValues(new Uint8Array(1))[0] & 1;
        await st.put({ phase: "playing", seed, first, log: [[], []], seq: [0, 0], cseq: [0, 0], plans: {} });
        await this.broadcast();
        for (const w of this.ctx.getWebSockets()) {
          const x = w.deserializeAttachment() || {};
          if (x.side >= 0) send(w, { t: "start", seed, first, you: x.side });
        }
      } else await this.broadcast();
      await this.touch();
    } else if (m.t === "relay" && phase === "playing") {
      // 公開情報の通信（選択・結果・同期チェック）。送信番号 s で二重送信を防ぐ。
      const cseq = (await st.get("cseq")) || [0, 0];
      if (Number.isInteger(m.s)) { if (m.s <= cseq[me]) return; cseq[me] = m.s; await st.put("cseq", cseq); }
      const d = m.d;
      if (!d || typeof d !== "object" || JSON.stringify(d).length > 400) return;
      await this.push(op, { t: "relay", d });
      await this.touch();
    } else if (m.t === "plan" && phase === "playing") {
      // 同時公開：両者の計画がそろうまで預かる
      const items = Array.isArray(m.items) ? m.items.slice(0, 12) : null;
      const turn = Number.isInteger(m.turn) && m.turn >= 1 && m.turn <= 40 ? m.turn : 0;
      if (!items || !turn || !items.every(okItem)) return;
      const plans = (await st.get("plans")) || {};
      const row = plans[turn] || [null, null];
      if (row[me]) return; // 同じターンの再送は無視
      row[me] = items.map((x) => ({ n: x.n, c: x.c, cell: x.cell, tg: x.tg ?? null }));
      plans[turn] = row;
      for (const k of Object.keys(plans)) if (+k < turn - 2) delete plans[k];
      await st.put("plans", plans);
      if (row[0] && row[1]) { await this.push(0, { t: "plans", turn, p: row }); await this.push(1, { t: "plans", turn, p: row }); }
      await this.touch();
    } else if (m.t === "done" && phase === "playing") {
      await st.put({ phase: "over", log: [[], []], plans: {} });
      await this.broadcast();
    } else if (m.t === "leave") {
      await this.drop(ws, true);
    }
  }
  async drop(ws, explicit) {
    const st = this.ctx.storage;
    const a = ws.deserializeAttachment() || {};
    if (a.side < 0) return;
    const phase = await st.get("phase");
    const seats = (await st.get("seats")) || [null, null];
    if (phase === "lobby") {
      seats[a.side] = null;
      seats.forEach((p) => p && (p.ready = false));
      await st.put("seats", seats);
    } else if (explicit && phase === "playing") {
      await this.push(1 - a.side, { t: "opp_left", forfeit: true });
    }
    ws.serializeAttachment({ pid: "", side: -1 });
    try { ws.close(1000, "left"); } catch {}
    await this.broadcast();
  }
  async webSocketClose(ws, code, reason) {
    try { await this.drop(ws, false); } catch {}
    try { ws.close(code, reason); } catch {}
  }
  async webSocketError(ws) { try { await this.drop(ws, false); } catch {} }
  async alarm() {
    for (const w of this.ctx.getWebSockets()) { try { w.close(1000, "expired"); } catch {} }
    await this.ctx.storage.deleteAll();
  }
}
