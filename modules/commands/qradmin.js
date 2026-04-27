const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "qradmin",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Fix by ChatGPT",
  description: "Gửi QR chuyển khoản cho admin (noprefix)",
  commandCategory: "Tiện ích",
  usages: "qradmin",
  cooldowns: 5
};

// chống spam theo thread
const lastUse = {};

module.exports.run = async function () {};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, threadID, messageID, senderID } = event;
  if (!body) return;
  if (senderID == api.getCurrentUserID()) return;

  // không phân biệt hoa thường
  if (!/^qradmin$/i.test(body.trim())) return;

  // chống spam 1 lần / 10s / box
  const now = Date.now();
  if (lastUse[threadID] && now - lastUse[threadID] < 10000) return;
  lastUse[threadID] = now;

  const imgPath = path.join(__dirname, "qr", "qr.jpg");

  if (!fs.existsSync(imgPath)) {
    return api.sendMessage(
      "❌ Không tìm thấy ảnh QR.\nKiểm tra: /modules/commands/qr/qr.jpg",
      threadID,
      messageID
    );
  }

  const time = new Date().toLocaleTimeString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh"
  });
  const date = new Date().toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh"
  });

  const uptime = Math.floor(process.uptime());
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = uptime % 60;

  api.sendMessage(
    {
      body:
`💳 CHUYỂN KHOẢN CHO ADMIN
━━━━━━━━━━━━━━━━━━
⏰ Thời gian: ${time} | ${date}
🤖 Uptime bot: ${h}h ${m}m ${s}s
━━━━━━━━━━━━━━━━━━
📌 Quét QR bên dưới để chuyển khoản nhé!`,
      attachment: fs.createReadStream(imgPath)
    },
    threadID,
    messageID
  );
};
