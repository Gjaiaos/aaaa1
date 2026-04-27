const moment = require("moment-timezone");
const os = require("os");

module.exports.config = {
  name: "onl",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "GPT Format Fix",
  description: "System info đẹp (no prefix)",
  commandCategory: "Hệ thống",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  if (event.body.toLowerCase() !== "onl") return;

  try {
    const uptime = process.uptime();
    const h = String(Math.floor(uptime / 3600)).padStart(2, '0');
    const m = String(Math.floor((uptime % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(uptime % 60)).padStart(2, '0');

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const toGB = (bytes) => (bytes / 1024 / 1024 / 1024).toFixed(2);
    const percent = ((usedMem / totalMem) * 100).toFixed(2);

    const msg = `🤖 𝗦𝘆𝘀𝘁𝗲𝗺 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻 🤖

⏱️ 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲:
${h}:${m}:${s}

💻 𝗦𝘆𝘀𝘁𝗲𝗺 𝗗𝗲𝘁𝗮𝗶𝗹𝘀:
• Platform: ${os.platform()}
• Hostname: ${os.hostname()}
• CPU: ${os.cpus()[0].model}

🔋 𝗠𝗲𝗺𝗼𝗿𝘆 𝗨𝘀𝗮𝗴𝗲:
• Total: ${toGB(totalMem)} GB
• Used: ${toGB(usedMem)} GB
• Free: ${toGB(freeMem)} GB
• Usage: ${percent}%`;

    return api.sendMessage(msg, event.threadID, event.messageID);

  } catch (e) {
    return api.sendMessage("❌ Không lấy được thông tin hệ thống.", event.threadID);
  }
};

module.exports.run = async () => {};
