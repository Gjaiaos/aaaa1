const fs = require('fs-extra');
const path = require('path');

const folderPath = path.join(__dirname, 'cache', 'data');
const pathReaction = path.join(folderPath, 'autoreaction.txt');
const pathSeen = path.join(folderPath, 'autoseen.txt');

// Tạo thư mục nếu chưa có
fs.ensureDirSync(folderPath);

// Tạo file mặc định
if (!fs.existsSync(pathReaction)) fs.writeFileSync(pathReaction, 'true');
if (!fs.existsSync(pathSeen)) fs.writeFileSync(pathSeen, 'true');

module.exports.config = {
  name: "auto",
  version: "2.0.0",
  hasPermssion: 3,
  credits: "Fix by Assistant",
  description: "Tự động seen + thả cảm xúc",
  commandCategory: "Hệ Thống",
  usages: "reaction on/off | seen on/off",
  cooldowns: 5,
  eventType: ["message"]
};

const messageStats = {};
const lastSeenTime = {};

module.exports.handleEvent = async ({ api, event }) => {
  try {
    if (!event.body) return;

    const isReactionEnabled = fs.readFileSync(pathReaction, 'utf8').trim() === 'true';
    const isSeenEnabled = fs.readFileSync(pathSeen, 'utf8').trim() === 'true';

    const { threadID, messageID, senderID } = event;
    const botID = api.getCurrentUserID();

    if (senderID == botID) return;

    // ================= REACTION =================
    if (isReactionEnabled) {
      if (!messageStats[threadID]) {
        messageStats[threadID] = {
          count: 0,
          threshold: Math.floor(Math.random() * 16) + 15
        };
      }

      messageStats[threadID].count++;

      if (messageStats[threadID].count >= messageStats[threadID].threshold) {
        const reactions = ['😹','😻','😼','😽','🙀','😿','😾'];
        const react = reactions[Math.floor(Math.random() * reactions.length)];

        messageStats[threadID] = {
          count: 0,
          threshold: Math.floor(Math.random() * 16) + 15
        };

        api.setMessageReaction(react, messageID, () => {}, true);
      }
    }

    // ================= SEEN =================
    if (isSeenEnabled) {
      const now = Date.now();
      const delay = 120000;

      if (!lastSeenTime[threadID] || now - lastSeenTime[threadID] > delay) {
        api.markAsRead(threadID);
        lastSeenTime[threadID] = now;
      }
    }

  } catch (err) {
    console.log("AUTO ERROR:", err);
  }
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (args[0] == "reaction") {
    if (args[1] == "on") {
      fs.writeFileSync(pathReaction, 'true');
      return api.sendMessage('✅ Đã bật auto reaction', threadID, messageID);
    }
    if (args[1] == "off") {
      fs.writeFileSync(pathReaction, 'false');
      return api.sendMessage('🛑 Đã tắt auto reaction', threadID, messageID);
    }
  }

  if (args[0] == "seen") {
    if (args[1] == "on") {
      fs.writeFileSync(pathSeen, 'true');
      return api.sendMessage('✅ Đã bật auto seen', threadID, messageID);
    }
    if (args[1] == "off") {
      fs.writeFileSync(pathSeen, 'false');
      return api.sendMessage('🛑 Đã tắt auto seen', threadID, messageID);
    }
  }

  return api.sendMessage(
    "Dùng:\nauto reaction on/off\nauto seen on/off",
    threadID,
    messageID
  );
};
