module.exports.config = {

  name: "joinNoti",

  eventType: ["log:subscribe", "log:unsubscribe"],

  version: "7.0.0",

  credits: "Assistant",

  description: "Welcome + Leave + Kick detect",

};

module.exports.run = async function ({ api, event, Users }) {

  const { threadID } = event;

  // ================= NGƯỜI VÀO =================

  if (event.logMessageType == "log:subscribe") {

    const { logMessageData } = event;

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

      const timeVN = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

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

⏳ Bot online: ${uptime}`;

      return api.sendMessage({ body: msg, mentions }, threadID);

    } catch (err) {

      console.log("JOIN ERROR:", err);

    }

  }

  // ================= NGƯỜI RỜI / BỊ KICK =================

  if (event.logMessageType == "log:unsubscribe") {

    try {

      const leftID = event.logMessageData.leftParticipantFbId;

      const authorID = event.author;

      if (leftID == api.getCurrentUserID()) return;

      const timeVN = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

      const fbLink = `https://facebook.com/${leftID}`;

      let msg;

      if (leftID == authorID) {

        msg =

`🚪 Một người đã tự rời nhóm

🔗 Facebook: ${fbLink}

🕒 Thời gian: ${timeVN}`;

      } else {

        msg =

`⛔ Một người đã bị xóa khỏi nhóm

🔗 Facebook: ${fbLink}

🕒 Thời gian: ${timeVN}`;

      }

      return api.sendMessage(msg, threadID);

    } catch (err) {

      console.log("LEAVE ERROR:", err);

    }

  }

};