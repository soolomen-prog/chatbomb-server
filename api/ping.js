// api/ping.js
module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ ok: true, pong: true, time: Date.now() });
};
