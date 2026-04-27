const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "taixiu",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "UI đẹp by ChatGPT",
  description: "Tài xỉu đẹp - nổi bật - xúc xắc nhỏ",
  commandCategory: "Game",
  usages: "taixiu <tiền> <tài|xỉu>",
  cooldowns: 0
};

const cd = new Map();
const diceDir = path.join(__dirname, "data", "taixiu");

const diceLinks = {
  1: "https://files.catbox.moe/oz358o.jpg",
  2: "https://files.catbox.moe/p02rx4.jpg",
  3: "https://files.catbox.moe/w2ssqy.jpg",
  4: "https://files.catbox.moe/4d5gak.jpg",
  5: "https://files.catbox.moe/6117i2.jpg",
  6: "https://files.catbox.moe/qaxytv.jpg"
};

function vnd(n) {
  return n.toLocaleString("vi-VN") + "₫";
}

async function ensureDiceImages() {
  if (!fs.existsSync(diceDir)) fs.mkdirSync(diceDir, { recursive: true });
  for (let i = 1; i <= 6; i++) {
    const file = path.join(diceDir, `${i}.jpg`);
    if (!fs.existsSync(file)) {
      const res = await axios.get(diceLinks[i], { responseType: "arraybuffer" });
      fs.writeFileSync(file, res.data);
    }
  }
}

function roll() {
  return Math.floor(Math.random() * 6) + 1;
}

module.exports.handleEvent = async function ({ event, api, Currencies }) {
  try {
    const { body, senderID, threadID, messageID, messageReply } = event;
    if (!body) return;

    const text = body.toLowerCase().trim();
    if (!text.startsWith("taixiu") && !text.startsWith("tx")) return;

    const now = Date.now();
    if (cd.has(senderID) && now - cd.get(senderID) < 5000) {
      return api.sendMessage("⏳ Chờ 5 giây nữa rồi hãy chơi tiếp nhaaa 😆", threadID, messageID);
    }
    cd.set(senderID, now);

    const args = body.split(" ");
    if (args[1] === "tien") {
      const data = await Currencies.getData(senderID);
      return api.sendMessage(`💎 𝗦𝗢̂́ 𝗗𝗨̛ 𝗛𝗜𝗘̣̂𝗡 𝗧𝗔̣𝗜\n━━━━━━━━━━━━━━\n💰 ${vnd(data.money || 0)}`, threadID);
    }

    if (args.length < 3)
      return api.sendMessage("🎯 𝗖𝗔́𝗖𝗛 𝗖𝗛𝗢̛𝗜\n👉 taixiu <tiền> <tài|xỉu>", threadID, messageID);

    const bet = parseInt(args[1]);
    const choose = args[2].toLowerCase();

    const data = await Currencies.getData(senderID);
    if (bet <= 0 || bet > data.money)
      return api.sendMessage("❌ 𝗦𝗼̂́ 𝘁𝗶𝗲̂̀𝗻 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̣̂!", threadID, messageID);

    await ensureDiceImages();

    api.sendMessage("🎲 Đang lắc xúc xắc... 🔥", threadID);

    setTimeout(async () => {
      const d1 = roll();
      const d2 = roll();
      const d3 = roll();
      const sum = d1 + d2 + d3;
      const result = sum >= 11 ? "TÀI" : "XỈU";

      let msg = `🎰 𝗧𝗔̀𝗜 𝗫𝗜̉𝗨 𝗢𝗡𝗟𝗜𝗡𝗘\n━━━━━━━━━━━━━━\n`;
      msg += `🎲 Xúc xắc: ${d1} - ${d2} - ${d3}\n`;
      msg += `📊 Tổng: ${sum} → ${result}\n`;

      let newMoney = data.money;

      if (
        (result === "TÀI" && (choose === "tài" || choose === "tai")) ||
        (result === "XỈU" && (choose === "xỉu" || choose === "xiu"))
      ) {
        newMoney += bet;
        msg += `🎉 𝗖𝗛𝗨́𝗖 𝗠𝗨̛̀𝗡𝗚! +${vnd(bet)}\n`;
      } else {
        newMoney -= bet;
        msg += `💀 𝗧𝗛𝗨𝗔 𝗥𝗢̂̀𝗜! -${vnd(bet)}\n`;
      }

      msg += `💎 Số dư: ${vnd(newMoney)}`;

      await Currencies.setData(senderID, { money: newMoney });

      api.sendMessage({
        body: msg,
        attachment: [
          fs.createReadStream(path.join(diceDir, `${d1}.jpg`)),
          fs.createReadStream(path.join(diceDir, `${d2}.jpg`)),
          fs.createReadStream(path.join(diceDir, `${d3}.jpg`))
        ]
      }, threadID);
    }, 1500);
  } catch (e) {
    console.log("TAIXIU ERROR:", e);
  }
};

module.exports.run = () => {};
