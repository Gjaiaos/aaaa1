module.exports.config = {

  name: "joinNoti",

  eventType: ["log:subscribe"],

  version: "5.0.0",

  credits: "Assistant Fix",

  description: "Welcome text only + time + uptime + member count",

};

module.exports.run = async function ({ api, event, Users }) {

  const { threadID, logMessageData } = event;

  // ===== BOT ĐƯỢC THÊM =====

  if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {

    api.changeNickname(

      `[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || "Mirai Bot"}`,

      threadID,

      api.getCurrentUserID()

    );

    return api.sendMessage("🤖 Bot đã vào nhóm và sẵn sàng hoạt động!", threadID);

  }

  try {

    const { threadName, participantIDs } = await api.getThreadInfo(threadID);

    // ===== GIỜ VIỆT NAM =====

    const timeVN = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    // ===== UPTIME BOT =====

    const up = process.uptime();

    const uptime = `${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m ${Math.floor(up%60)}s`;

    let names = [];

    let mentions = [];

    let memberNum = participantIDs.length;

    for (let u of logMessageData.addedParticipants) {

      names.push(u.fullName);

      mentions.push({ tag: u.fullName, id: u.userFbId });

      if (!global.data.allUserID.includes(u.userFbId)) {

        await Users.createData(u.userFbId, { name: u.fullName, data: {} });

        global.data.allUserID.push(u.userFbId);

      }

    }

    const msg =

`🌸 Xin chào ${names.join(", ")} 🌸

Chào mừng đến với ${threadName}

👥 Bạn là thành viên thứ ${memberNum}

🕒 Thời gian: ${timeVN}

⏳ Bot online: ${uptime}

Chúc bạn trò chuyện vui vẻ cùng mọi người 😆`;

    return api.sendMessage({ body: msg, mentions }, threadID);

  } catch (err) {

    console.log("JOIN NOTI ERROR:", err);

  }

};

