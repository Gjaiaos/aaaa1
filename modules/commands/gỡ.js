module.exports.config = {
  name: "unsendbot",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Assistant",
  description: "Reply tin bot + gõ 'gỡ' để thu hồi (noprefix)",
  commandCategory: "Tiện ích",
  usages: "gỡ",
  cooldowns: 3
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const text = event.body.toLowerCase().trim();
  if (text !== "gỡ" && text !== "go" && text !== "unsend") return;

  // Phải reply tin nhắn
  if (!event.messageReply) return;

  const botID = api.getCurrentUserID();

  // Chỉ gỡ nếu đó là tin nhắn của bot
  if (event.messageReply.senderID != botID) return;

  try {
    await api.unsendMessage(event.messageReply.messageID);
  } catch (e) {
    console.log("UNSEND ERROR:", e);
  }
};

module.exports.run = () => {};
