const cooldown = new Map();

module.exports.config = {
  name: "dich",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Zz Tiến",
  description: "Reply + dịch (có chống spam)",
  commandCategory: "Tiện ích",
  usages: "Reply + dịch",
  cooldowns: 5
};

module.exports.run = async function() {};

module.exports.handleEvent = async function({ api, event }) {
  try {
    const { body, messageReply, threadID, messageID, senderID } = event;

    // Không cho bot tự kích hoạt
    if (senderID == api.getCurrentUserID()) return;

    // Phải có reply
    if (!messageReply || !messageReply.body) return;

    if (!body) return;
    const content = body.trim().toLowerCase();

    if (!content.startsWith("dịch")) return;

    // 🔥 CHỐNG SPAM 10 GIÂY
    const now = Date.now();
    const timeCooldown = 10000; // 10 giây

    if (cooldown.has(senderID)) {
      const expiration = cooldown.get(senderID);
      if (now < expiration) {
        return; // chưa hết cooldown thì bỏ qua
      }
    }

    cooldown.set(senderID, now + timeCooldown);

    // Lấy tên
    const userInfo = await api.getUserInfo(senderID);
    const name = userInfo[senderID]?.name || "Người dùng";

    // Giờ VN
    const dateObj = new Date();
    const time = dateObj.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh"
    });
    const date = dateObj.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh"
    });

    const text = encodeURIComponent(messageReply.body);

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${text}`
    );

    const data = await res.json();
    if (!data || !data[0]) {
      return api.sendMessage("❌ Không thể dịch nội dung.", threadID);
    }

    const translated = data[0].map(i => i[0]).join("");
    const detectedLang = data[2] || "unknown";

    return api.sendMessage(
`🧑 Người yêu cầu: ${name}
🌐 Ngôn ngữ: ${detectedLang} → 🇻🇳 Tiếng Việt
⏰ Thời gian: ${time} | ${date}

📄 Nội dung:
${translated}`,
      threadID,
      messageID
    );

  } catch (err) {
    console.log("Lỗi lệnh dich:", err);
  }
};
