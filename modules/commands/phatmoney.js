const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "phatmoney",
  version: "1.0.0",
  hasPermssion: 1, // chỉ admin
  credits: "Zz Tiến x ChatGPT",
  description: "Phát tiền cho toàn bộ thành viên trong box (noprefix)",
  commandCategory: "Money",
  usages: "phatmoney <số tiền>",
  cooldowns: 10
};

const dataPath = path.join(__dirname, "cache", "money.json");
const cooldown = new Map();

function loadMoney() {
  if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {});
  return fs.readJsonSync(dataPath);
}

function saveMoney(data) {
  fs.writeJsonSync(dataPath, data, { spaces: 2 });
}

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, body } = event;
  if (!body) return;

  if (!body.toLowerCase().startsWith("phatmoney")) return;

  // chống spam
  const now = Date.now();
  if (cooldown.has(senderID) && now - cooldown.get(senderID) < 10000) {
    return api.sendMessage("⏳ Đợi 10 giây rồi dùng lại lệnh phát tiền nhé!", threadID);
  }
  cooldown.set(senderID, now);

  const args = body.split(" ").slice(1);
  const money = parseInt(args[0]);

  if (!money || money <= 0) {
    return api.sendMessage("❌ Dùng đúng cú pháp:\n👉 phatmoney <số tiền>", threadID);
  }

  const threadInfo = await api.getThreadInfo(threadID);
  const members = threadInfo.participantIDs;

  let data = loadMoney();
  let count = 0;

  for (const id of members) {
    if (!data[id]) data[id] = 0;
    data[id] += money;
    count++;
  }

  saveMoney(data);

  return api.sendMessage(
`💸 𝗣𝗛𝗔́𝗧 𝗧𝗜𝗘̂̀𝗡 𝗧𝗛𝗔̀𝗡𝗛 𝗖𝗢̂𝗡𝗚 💸

👥 Số người nhận: ${count}
💰 Mỗi người nhận: +${money.toLocaleString()}$
📦 Tổng phát: ${(money * count).toLocaleString()}$

✨ Tiền đã được cộng vào ví của toàn bộ thành viên!`,
    threadID
  );
};

module.exports.run = async () => {};
