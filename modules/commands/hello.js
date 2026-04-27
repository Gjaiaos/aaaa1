module.exports.config = {
    name: "hello",
    version: "2.5.2",
    hasPermssion: 0,
    credits: "Gemini AI",
    description: "Chào hỏi ngắn gọn, fix lỗi hiển thị",
    commandCategory: "Tiện ích",
    usages: "",
    cooldowns: 2
};

const cooldown = new Map();

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body) return;

    const msg = event.body.toLowerCase().trim();
    const keywords = ["hi", "hello", "hí", "helo", "chào", "alo", "2", "3"];

    const firstWord = msg.split(" ")[0];
    if (!keywords.includes(firstWord)) return;

    const now = Date.now();
    if (now - (cooldown.get(event.threadID) || 0) < 3000) return;
    cooldown.set(event.threadID, now);

    const replies = ["Chào bạn nha 👋", "Hi hi 🐰", "Hello ✨", "Chào đằng ấy 😆", "Hí chào cậu ❤️"];
    const icons = ["👋", "😆", "🐰", "🌸", "✨", "❤️"]; // Emoji thay cho sticker
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    // Gửi tin nhắn kèm emoji ở cuối, đảm bảo 100% hiện
    return api.sendMessage(`${randomReply} ${randomIcon}`, event.threadID, event.messageID);
};

module.exports.run = function () {};
