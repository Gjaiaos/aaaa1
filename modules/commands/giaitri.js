const axios = require("axios");

const cooldown = new Map();

module.exports.config = {
  name: "giaitri",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Gemini AI",
  description: "Bói tình yêu & Tương lai (Giao diện đẹp + Fix 100%)",
  commandCategory: "Giải trí",
  usages: "boitinhyeu (reply) | tuonglai",
  cooldowns: 3
};

module.exports.handleEvent = async function ({ api, event }) {
  const { body, senderID, threadID, messageID, messageReply } = event;
  if (!body) return;

  const content = body.toLowerCase().trim();
  const now = Date.now();

  if (cooldown.has(senderID) && cooldown.get(senderID) > now) return;

  // -------------------------------------------------------------------
  // 🔮 LỆNH: TUONGLAI (Fix undefined + Giao diện cực đẹp)
  // -------------------------------------------------------------------
  if (content === "tuonglai") {
    cooldown.set(senderID, now + 5000);
    
    // Lấy thời gian chuẩn không lỗi
    const d = new Date();
    const timeVN = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} | ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    const lucky = Math.floor(Math.random() * 101);
    const love = Math.floor(Math.random() * 101);
    const money = Math.floor(Math.random() * 101);

    const getBar = (val) => {
        const filled = Math.round(val / 10);
        return "🟢".repeat(filled) + "⚪".repeat(10 - filled);
    };

    const getStatus = (val) => {
      if (val < 30) return "🚨 Vận số đang thấp, hãy cẩn trọng!";
      if (val < 70) return "✨ Mọi thứ đang ở mức ổn định.";
      return "🌟 Đại cát đại lợi, tiến tới ngay!";
    };

    const msg = `✨ ━━━ 🔮 𝐃Ự Đ𝐎Á𝐍 𝐓ƯƠ𝐍𝐆 𝐋𝐀𝐈 🔮 ━━━ ✨\n\n` +
      `⏰ 𝐓𝐡ờ𝐢 𝐠𝐢𝐚𝐧: ${timeVN}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `🍀 𝐌𝐚𝐲 𝐦ắ𝐧: ${lucky}%\n` +
      `[ ${getBar(lucky)} ]\n` +
      `└ ${getStatus(lucky)}\n\n` +
      `❤️ 𝐓ình 𝐝𝐮𝐲ê𝐧: ${love}%\n` +
      `[ ${getBar(love)} ]\n` +
      `└ ${getStatus(love)}\n\n` +
      `💰 𝐓à𝐢 𝐜𝐡í𝐧𝐡: ${money}%\n` +
      `[ ${getBar(money)} ]\n` +
      `└ ${getStatus(money)}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📌 𝐋ờ𝐢 𝐤𝐡𝐮𝐲ê𝐧: Đừng quá lo lắng về tương lai, hãy sống tốt cho hiện tại. Mọi nỗ lực của bạn sẽ được đền đáp xứng đáng! 🌈`;

    return api.sendMessage(msg, threadID, messageID);
  }

  // -------------------------------------------------------------------
  // 💘 LỆNH: BOITINHYEU (Bỏ nhạc - Fix nội dung)
  // -------------------------------------------------------------------
  if (content === "boitinhyeu") {
    if (!messageReply) return api.sendMessage("💘 Hãy reply tin nhắn của người bạn muốn bói cùng nhé!", threadID, messageID);
    
    cooldown.set(senderID, now + 5000);
    try {
      const info1 = await api.getUserInfo(senderID);
      const info2 = await api.getUserInfo(messageReply.senderID);
      const name1 = info1[senderID].name;
      const name2 = info2[messageReply.senderID].name;

      const percent = Math.floor(Math.random() * 101);
      const loveBar = "💖".repeat(Math.round(percent/10)) + "🤍".repeat(10 - Math.round(percent/10));

      let message = "";
      if (percent > 80) message = "Đúng là cặp trời sinh, cưới ngay kẻo lỡ! 💍";
      else if (percent > 50) message = "Tình cảm tiến triển khá tốt, cố gắng lên nhé! 😍";
      else message = "Cần thấu hiểu nhau nhiều hơn nữa nhé! ☕";

      const msg = `🌸 ━━━ 💘 𝐓Ì𝐍𝐇 𝐘Ê𝐔 ĐÔ𝐈 𝐋Ứ𝐀 💘 ━━━ 🌸\n\n` +
        `👤 ${name1}\n` +
        `   ⚡ Kết hợp cùng\n` +
        `👤 ${name2}\n\n` +
        `📊 ĐỘ HỢP NHAU: ${percent}%\n` +
        `[ ${loveBar} ]\n\n` +
        `💬 𝐍𝐡ậ𝐧 𝐱é𝐭: ${message}\n` +
        `━━━━━━━━━━━━━━━━━━━━`;

      return api.sendMessage(msg, threadID, messageID);

    } catch (e) {
      return api.sendMessage("❌ Không thể lấy dữ liệu để bói, thử lại sau nhé!", threadID, messageID);
    }
  }
};

module.exports.run = function() {};
