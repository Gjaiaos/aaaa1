module.exports.config = {
  name: "chuinyc",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Tiến x ChatGPT",
  description: "Chửi người yêu cũ cực thấm",
  commandCategory: "Noprefix",
  usages: "chuinyc @tag",
  cooldowns: 5
};

module.exports.run = () => {};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, body, senderID } = event;
  if (!body || !body.toLowerCase().startsWith("chuinyc")) return;

  let mentionID = null;

  if (event.mentions && Object.keys(event.mentions).length > 0) {
    mentionID = Object.keys(event.mentions)[0];
  }

  if (!mentionID && event.messageReply && event.messageReply.senderID) {
    mentionID = event.messageReply.senderID;
  }

  if (!mentionID) {
    return api.sendMessage("Tag hoặc reply nyc vô đi 🙂", threadID, messageID);
  }

  const senderInfo = await api.getUserInfo(senderID);
  const targetInfo = await api.getUserInfo(mentionID);

  const senderName = senderInfo[senderID].name;
  const targetName = targetInfo[mentionID].name;

  const timeVN = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh"
  });

  const list = [

`💔 ${senderName} gửi ${targetName}
Yêu bạn xong mới hiểu… phí thanh xuân là có thật`,

`🗑 ${senderName} nói ${targetName}
Chia tay xong đời tôi lên hẳn, chắc do bớt nghiệp`,

`🐍 ${senderName} gửi ${targetName}
Diễn viên còn phải gọi bạn là sư phụ`,

`🤡 ${senderName} nói ${targetName}
Hồi đó yêu bạn chắc do tôi bị che mắt bởi nghiệp`,

`🚮 ${senderName} gửi ${targetName}
Bạn hợp với quá khứ hơn là tương lai của ai đó`,

`💢 ${senderName} nói ${targetName}
Tình yêu với bạn chắc là trò chơi… mà tôi là người thua ngu`,

`📉 ${senderName} gửi ${targetName}
Rời bạn xong vận may tôi tăng hẳn`,

`🧠 ${senderName} nói ${targetName}
Giờ nghĩ lại mới thấy mình từng thiếu tỉnh táo dữ vậy`,

`🔥 ${senderName} gửi ${targetName}
Không quay lại đâu, vì tôi có não rồi`,

`💀 ${senderName} nói ${targetName}
Bạn không xấu, chỉ là không hợp làm người tử tế thôi`,

`🎭 ${senderName} gửi ${targetName}
Oscar chắc nên trao cho bạn vì vai “người yêu giả tạo”`,

`🚪 ${senderName} nói ${targetName}
Ra khỏi đời tôi là quyết định thông minh nhất tôi từng làm`,

`🧻 ${senderName} gửi ${targetName}
Bạn dạy tôi 1 bài học: đừng tin lời ngọt hơn mật`,

`⚠️ ${senderName} nói ${targetName}
Yêu lại bạn chắc phải đăng ký bảo hiểm tinh thần trước`,

`💣 ${senderName} gửi ${targetName}
Bạn là kiểu người khiến người ta yêu xong phải đi trưởng thành`,

`📦 ${senderName} nói ${targetName}
Kỷ niệm với bạn tôi gói lại dán nhãn: “Sai lầm”`,

`🪞 ${senderName} gửi ${targetName}
Hy vọng 1 ngày bạn soi gương và thấy… vấn đề`,

`⏳ ${senderName} nói ${targetName}
Thời gian yêu bạn là thời gian tôi ngu nhất`,

`🧨 ${senderName} gửi ${targetName}
Bạn không phản bội, bạn chỉ sống đúng bản chất thôi`,

`🌪 ${senderName} nói ${targetName}
Đi ngang đời tôi như cơn bão… mà là bão rác`

  ];

  const msg = list[Math.floor(Math.random() * list.length)] + `\n🕒 ${timeVN}`;

  return api.sendMessage(msg, threadID, messageID);
};
