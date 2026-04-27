module.exports.config = {
  name: "boxinfo",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Zz Tiến x GPT PRO",
  description: "Box Info Noprefix Full Stable",
  commandCategory: "box",
  usages: "box info",
  cooldowns: 5
};

module.exports.handleEvent = async function({ api, event }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;
  if (body.toLowerCase() !== "box info") return;

  // Anti spam 5s
  if (!global.boxinfoCooldown) global.boxinfoCooldown = {};
  if (global.boxinfoCooldown[senderID] && Date.now() - global.boxinfoCooldown[senderID] < 5000) {
    return api.sendMessage("⏳ Đợi 5 giây rồi dùng lại!", threadID, messageID);
  }
  global.boxinfoCooldown[senderID] = Date.now();

  try {
    const threadInfo = await api.getThreadInfo(threadID);
    const moment = require("moment-timezone");
    const timeVN = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss DD/MM/YYYY");

    const name = threadInfo.threadName || "Không có tên";
    const id = threadID;
    const memberCount = threadInfo.participantIDs.length;
    const adminIDs = threadInfo.adminIDs.map(e => e.id);
    const adminCount = adminIDs.length;
    const emoji = threadInfo.emoji || "Không có";
    const approvalMode = threadInfo.approvalMode ? "Bật" : "Tắt";
    const isGroup = threadInfo.isGroup ? "Nhóm Messenger" : "Chat riêng";
    const messageCount = threadInfo.messageCount || "Không xác định";

    // Lấy tên admin
    let adminNames = [];
    for (let admin of adminIDs) {
      let user = await api.getUserInfo(admin);
      adminNames.push(user[admin].name);
    }

    // Đếm online
    let online = 0;
    threadInfo.userInfo.forEach(u => {
      if (u.isOnline) online++;
    });

    // Tỉ lệ admin
    let adminPercent = ((adminCount / memberCount) * 100).toFixed(1);

    let msg =
`╔══════════════════╗
       📦 𝗕𝗢𝗫 𝗜𝗡𝗙𝗢
╚══════════════════╝

🏷 Tên box: ${name}
🆔 ID: ${id}
📌 Loại: ${isGroup}

👥 Thành viên: ${memberCount}
👑 Admin: ${adminCount} (${adminPercent}%)
🟢 Đang online: ${online}

📋 Danh sách Admin:
- ${adminNames.join("\n- ")}

💬 Tổng tin nhắn: ${messageCount}
🎭 Emoji: ${emoji}
🔒 Duyệt thành viên: ${approvalMode}

🌏 GMT+7 Việt Nam
⏰ ${timeVN}

💎 Bot quản lý chuyên nghiệp
`;

    return api.sendMessage(msg, threadID, messageID);

  } catch (err) {
    console.log(err);
    return api.sendMessage("❌ Lỗi khi lấy thông tin box!", threadID, messageID);
  }
};

module.exports.run = function() {};
