const cooldown = new Map();
let globalLock = false;

// Lưu tương tác admin theo box
const adminStats = {};

module.exports.config = {
  name: "admininfo",
  version: "7.0.0",
  hasPermssion: 0,
  credits: "Assistant Pro",
  description: "Gõ admin xem info + mức độ tương tác",
  commandCategory: "Hệ thống",
  usages: "admin",
  cooldowns: 5
};

// ===== GHI NHẬN TIN NHẮN =====
module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  if (event.senderID == api.getCurrentUserID()) return;

  const adminIDs = global.config.ADMINBOT || [];
  const { threadID, senderID } = event;

  // Lưu tương tác admin
  if (adminIDs.includes(senderID)) {
    if (!adminStats[threadID]) adminStats[threadID] = {};
    if (!adminStats[threadID][senderID]) adminStats[threadID][senderID] = 0;
    adminStats[threadID][senderID]++;
  }

  const text = event.body.trim().toLowerCase();
  if (text !== "admin") return;

  if (globalLock) return;
  globalLock = true;

  const now = Date.now();
  const limit = 15000;
  if (cooldown.has(senderID) && now - cooldown.get(senderID) < limit) {
    globalLock = false;
    return;
  }
  cooldown.set(senderID, now);

  try {
    const timeVN = new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh"
    });

    const up = process.uptime();
    const uptime = `${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${Math.floor(up%60)}s`;

    const threads = await api.getThreadList(100, null, ["INBOX"]);
    const boxCount = threads.length;

    let adminNames = [];
    let adminLinks = [];
    let interactText = [];

    for (let id of adminIDs) {
      try {
        const info = await api.getUserInfo(id);
        adminNames.push(info[id].name);
        adminLinks.push(`https://facebook.com/${id}`);

        const count = adminStats[threadID]?.[id] || 0;

        let rank = "🌱 Ít hoạt động";
        if (count > 200) rank = "🔥 Hoạt động mạnh";
        else if (count > 50) rank = "⚡ Năng nổ";

        interactText.push(`${info[id].name}: ${count} tin • ${rank}`);

      } catch {}
    }

    const msg =
`╔══════════════╗
     🤖 𝐀𝐃𝐌𝐈𝐍 𝐕𝐈𝐏 𝐈𝐍𝐅𝐎
╚══════════════╝

⏳ Uptime: ${uptime}
🕒 Giờ VN: ${timeVN}
💬 Số box: ${boxCount}

👑 ADMIN BOT
👤 ${adminNames.join(", ")}

🔗 Link Admin
${adminLinks.join("\n")}

📊 TƯƠNG TÁC ADMIN TRONG BOX
${interactText.join("\n") || "Chưa có dữ liệu"}

🏆 Danh hiệu đặc biệt:
“Linh hồn của hệ thống” ✨

🛡 Anti-spam: ON`;

    await api.sendMessage(msg, threadID);

  } catch (e) {
    console.log("ADMIN ERROR:", e);
  }

  globalLock = false;
};

module.exports.run = () => {};
