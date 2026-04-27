module.exports.config = {
    name: "hello",
    version: "2.7.0",
    hasPermssion: 0,
    credits: "Gemini AI",
    description: "Chào hỏi siêu ngắn + Full từ khóa + Fix lỗi 100%",
    commandCategory: "Tiện ích",
    usages: "",
    cooldowns: 2
};

const cooldown = new Map();

module.exports.handleEvent = async function ({ api, event }) {
    if (!event.body) return;

    const msg = event.body.toLowerCase().trim();
    
    // 🌟 Danh sách từ khóa đầy đủ nhất (Teencode, viết tắt, số...)
    const keywords = [
        "hi", "hello", "hí", "helo", "hellu", "hii", "helooo", "hai",
        "chào", "chao", "xin chào", "sin chao", "lô", "alo", "alô", "hú", 
        "hey", "ê", "ê bot", "bot ơi", "bot oi", "hú bot",
        "2", "3", "22", "33", "hiii", "chào bot"
    ];

    const firstWord = msg.split(" ")[0];
    const isGreeting = keywords.includes(firstWord) || keywords.includes(msg);
    
    if (!isGreeting) return;

    // 🔒 Chống spam: 2 giây
    const now = Date.now();
    if (now - (cooldown.get(event.threadID) || 0) < 2000) return;
    cooldown.set(event.threadID, now);

    // 💬 Câu trả lời siêu ngắn gọn theo ý bạn
    const replies = [
        "Chào bạn nha",
        "Hi hi",
        "Hello nè",
        "Chào nha",
        "Hí chào cậu",
        "Lô bạn",
        "Hi",
        "Chào nhé"
    ];

    // 🎭 Emoji đi kèm (Thay cho sticker để không bao giờ lỗi)
    const icons = ["👋", "✨", "🐰", "😆", "❤️", "🌸", "😎", "🐾"];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    return api.sendMessage(`${randomReply} ${randomIcon}`, event.threadID, event.messageID);
};

module.exports.run = function () {};
