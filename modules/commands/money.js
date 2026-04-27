const moment = require("moment-timezone");

module.exports.config = {
  name: "money",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "Fix Full by ChatGPT",
  description: "Money + SetMoney + Top (Currencies chung data)",
  commandCategory: "Economy",
  cooldowns: 3
};

function vnd(n) {
  return (n || 0).toLocaleString("vi-VN") + "đ";
}

async function getMoney(Currencies, uid) {
  const data = await Currencies.getData(uid);
  return data.money || 0;
}

async function setMoney(Currencies, uid, money) {
  await Currencies.setData(uid, { money });
  return money;
}

async function getTop(Currencies, Users) {
  const all = await Users.getAll();
  const list = [];
  for (const u of all) {
    const data = await Currencies.getData(u.userID);
    list.push({
      id: u.userID,
      name: u.name || "Người dùng",
      money: data.money || 0
    });
  }
  return list.sort((a, b) => b.money - a.money).slice(0, 10);
}

module.exports.handleEvent = async function ({ api, event, Users, Currencies, permssion }) {
  const { body, senderID, threadID, messageReply } = event;
  if (!body) return;

  const text = body.toLowerCase().trim();

  // ========== SET MONEY (ADMIN - NOPREFIX) ==========
  if (text.startsWith("setmoney")) {
    if (permssion < 1)
      return api.sendMessage("❌ Chỉ admin mới set tiền được!", threadID);

    const money = parseInt(body.replace(/[^0-9]/g, ""));
    if (isNaN(money))
      return api.sendMessage("❌ Dùng: setmoney 1000000", threadID);

    const uid = messageReply ? messageReply.senderID : senderID;
    const name = await Users.getNameUser(uid);

    await setMoney(Currencies, uid, money);

    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");

    return api.sendMessage(
`💸 SET MONEY THÀNH CÔNG
━━━━━━━━━━━━━━━
👤 ${name}
💰 ${vnd(money)}
⏰ ${time}`, threadID);
  }

  // ========== XEM TIỀN ==========
  if (text === "money") {
    const uid = messageReply ? messageReply.senderID : senderID;
    const name = await Users.getNameUser(uid);
    const money = await getMoney(Currencies, uid);
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");

    return api.sendMessage(
`💳 TÀI KHOẢN
━━━━━━━━━━━━━━━
👤 ${name}
💰 ${vnd(money)}
⏰ ${time}`, threadID);
  }

  // ========== TOP GIÀU ==========
  if (text === "money top" || text === "money list" || text === "top money") {
    const top = await getTop(Currencies, Users);
    let msg = "🏆 TOP NGƯỜI GIÀU\n━━━━━━━━━━━━━━━\n";
    top.forEach((u, i) => {
      msg += `${i + 1}. ${u.name}\n💰 ${vnd(u.money)}\n\n`;
    });
    return api.sendMessage(msg.trim(), threadID);
  }
};

module.exports.run = () => {};
