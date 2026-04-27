const cooldown = new Map();

module.exports.config = {
  name: "kicktv",
  version: "1.0.0",
  hasPermssion: 1, // chỉ admin
  credits: "Zz Tiến",
  description: "Reply + kicktv để kick thành viên khỏi box (noprefix)",
  commandCategory: "Quản trị viên",
  usages: "Reply + kicktv",
  cooldowns: 5
};

module.exports.run = async function() {};

module.exports.handleEvent = async function({ api, event, Threads }) {
  try {
    const { body, messageReply, threadID, senderID } = event;

    // Không cho bot tự kích hoạt
    if (senderID == api.getCurrentUserID()) return;

    // Phải reply
    if (!messageReply || !messageReply.senderID) return;

    // Phải có nội dung
    if (!body) return;
    const content = body.trim().toLowerCase();

    // noprefix: kicktv (hoa thường đều chạy)
    if (!content.startsWith("kicktv")) return;

    // 🔒 Check quyền admin nhóm
    const threadInfo = await api.getThreadInfo(threadID);
    const isAdmin = threadInfo.adminIDs.some(e => e.id == senderID);

    if (!isAdmin) {
      return api.sendMessage("❌ Chỉ quản trị viên mới được dùng lệnh này!", threadID);
    }

    const targetID = messageReply.senderID;

    // Không kick bot
    if (targetID == api.getCurrentUserID()) {
      return api.sendMessage("🤖 Không thể kick bot.", threadID);
    }

    // 🔥 Chống spam 10 giây / người
    const now = Date.now();
    const timeCooldown = 10000;

    if (cooldown.has(senderID)) {
      if (now < cooldown.get(senderID)) return;
    }
    cooldown.set(senderID, now + timeCooldown);

    // Thực hiện kick
    await api.removeUserFromGroup(targetID, threadID);

    return api.sendMessage("✅ Đã kick thành viên khỏi box.", threadID);

  } catch (err) {
    console.log("Lỗi lệnh kicktv:", err);
    return api.sendMessage("❌ Không thể kick thành viên. Kiểm tra quyền admin của bot.", event.threadID);
  }
};
