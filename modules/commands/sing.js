const ytdl = require("ytdl-core");
const fs = require("fs");
const axios = require("axios");

module.exports.config = {
  name: "sing",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Fix by ChatGPT",
  description: "Phát nhạc từ link YouTube",
  commandCategory: "media",
  usages: "[link youtube]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  try {
    if (!args[0]) 
      return api.sendMessage("⚠️ Vui lòng nhập link YouTube!", event.threadID);

    const url = args[0];

    if (!ytdl.validateURL(url)) 
      return api.sendMessage("❌ Link YouTube không hợp lệ!", event.threadID);

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;

    const path = __dirname + "/cache/sing.mp3";

    api.sendMessage("🎵 Đang tải nhạc...", event.threadID);

    const stream = ytdl(url, {
      filter: "audioonly",
      quality: "highestaudio"
    });

    const writeStream = fs.createWriteStream(path);

    stream.pipe(writeStream);

    writeStream.on("finish", () => {
      api.sendMessage(
        {
          body: `🎶 ${title}`,
          attachment: fs.createReadStream(path)
        },
        event.threadID,
        () => fs.unlinkSync(path)
      );
    });

  } catch (err) {
    console.log(err);
    api.sendMessage("❌ Đã xảy ra lỗi khi tải nhạc!", event.threadID);
  }
};
