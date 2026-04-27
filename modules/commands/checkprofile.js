module.exports.config = {
  name: "checkprofile",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "Fix by ChatGPT",
  description: "Check profile + bài viết công khai (noprefix, reply) - tải ảnh qua trung gian",
  commandCategory: "Tiện ích",
  usages: "reply + checkprofile",
  cooldowns: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const antiSpam = {};
const COOLDOWN = 8 * 1000;

module.exports.run = async function () {};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { body, threadID, messageID, senderID, messageReply } = event;
  if (!body) return;

  // noprefix, không phân biệt hoa thường
  if (!/^checkprofile$/i.test(body.trim())) return;

  if (!messageReply)
    return api.sendMessage("❌ Reply vào 1 tin nhắn hoặc 1 bài viết công khai để checkprofile.", threadID, messageID);

  if (antiSpam[senderID] && Date.now() - antiSpam[senderID] < COOLDOWN)
    return api.sendMessage("⏳ Đợi vài giây rồi dùng lại nha.", threadID, messageID);

  antiSpam[senderID] = Date.now();

  try {
    let uid = messageReply.senderID;
    let postURL = null;

    // nếu reply link bài viết
    if (messageReply.body && messageReply.body.includes("facebook.com")) {
      postURL = messageReply.body.trim();
    }

    const userName = await Users.getNameUser(uid).catch(() => "Không rõ");

    let msg = `🎯 CHECK PROFILE (NOPREFIX)\n\n👤 Tên: ${userName}\n🆔 UID: ${uid}\n`;

    if (postURL) {
      msg += `📝 Bài viết công khai:\n${postURL}\n`;
    } else {
      msg += `📝 Bài viết công khai: (reply link bài viết để check)\n`;
    }

    msg += `\n⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`;

    // thử tải avatar qua trung gian (imgproxy)
    const avatarURL = `https://graph.facebook.com/${uid}/picture?height=512&width=512&access_token=`;
    const proxyURL = `https://images.weserv.nl/?url=${encodeURIComponent(avatarURL)}`;

    const imgPath = path.join(__dirname, `cache_${uid}.jpg`);

    try {
      const res = await axios.get(proxyURL, { responseType: "arraybuffer", timeout: 10000 });
      fs.writeFileSync(imgPath, Buffer.from(res.data, "binary"));

      api.sendMessage(
        {
          body: msg,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    } catch (e) {
      // nếu không tải được ảnh thì chỉ gửi text
      api.sendMessage(msg + "\n\n⚠️ Không tải được ảnh (FB chặn), đã gửi link thay thế.", threadID, messageID);
    }
  } catch (err) {
    api.sendMessage("❌ Lỗi khi checkprofile.", threadID, messageID);
  }
};
