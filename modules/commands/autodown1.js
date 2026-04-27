const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "autodown1",
        version: "5.0.0",
        hasPermssion: 0,
        credits: "Gemini",
        description: "Tự động tải TikTok, Facebook, YouTube, CapCut",
        commandCategory: "tiện ích",
        usages: "",
        cooldowns: 2
    },

    handleEvent: async function ({ api, event }) {
        const { threadID, messageID, body, senderID } = event;
        if (!body || senderID == api.getCurrentUserID()) return;

        // Regex bắt link cực nhạy
        const regEx = /(https?:\/\/[^\s]+)/g;
        const urls = body.match(regEx);
        if (!urls) return;

        const url = urls[0];
        // Kiểm tra nền tảng hỗ trợ
        const isSupported = /tiktok\.com|facebook\.com|fb\.watch|youtube\.com|youtu\.be|capcut\.com/g.test(url);
        if (!isSupported) return;

        try {
            // Thả icon đang xử lý
            api.setMessageReaction("⏳", messageID, () => {}, true);

            // Gọi API lấy link
            const res = await axios.get(`https://subhatde.id.vn/downall?url=${encodeURIComponent(url)}`);
            const data = res.data;

            // CHIẾN THUẬT LẤY LINK VIDEO VÉT CẠN
            let videoUrl = data.data || data.url;
            
            // Nếu không thấy ở ngoài, đào sâu vào mảng medias (Dành cho Youtube/CapCut)
            if (!videoUrl && data.medias && data.medias.length > 0) {
                const mp4File = data.medias.find(m => m.extension === 'mp4' || m.type === 'video');
                videoUrl = mp4File ? mp4File.url : data.medias[0].url;
            }

            // Nếu vẫn không thấy, quét toàn bộ chuỗi JSON để tìm link .mp4
            if (!videoUrl) {
                const rawJson = JSON.stringify(data);
                const matchMp4 = rawJson.match(/https?:\/\/[^"']+\.mp4[^"']*/g);
                if (matchMp4) videoUrl = matchMp4[0];
            }

            if (!videoUrl) {
                return api.setMessageReaction("❌", messageID, () => {}, true);
            }

            // Đường dẫn lưu file tạm
            const cacheDir = path.join(__dirname, 'cache');
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
            const filePath = path.join(cacheDir, `auto_${Date.now()}.mp4`);

            // Tiến hành tải video dưới dạng stream
            const response = await axios({
                method: 'get',
                url: videoUrl,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            writer.on('finish', () => {
                const stats = fs.statSync(filePath);
                // Giới hạn 25MB của Messenger
                if (stats.size > 26214400) { 
                    api.sendMessage(`📁 Video quá nặng (${(stats.size / 1024 / 1024).toFixed(1)}MB). Không thể gửi qua Messenger!`, threadID, messageID);
                    api.setMessageReaction("⚠️", messageID, () => {}, true);
                    return fs.unlinkSync(filePath);
                }

                api.sendMessage({
                    body: `✅ [AUTODOWN]\n📝 Tiêu đề: ${data.title || "Video"}`,
                    attachment: fs.createReadStream(filePath)
                }, threadID, () => {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    api.setMessageReaction("✅", messageID, () => {}, true);
                }, messageID);
            });

        } catch (error) {
            console.error("Lỗi Autodown:", error);
            api.setMessageReaction("❌", messageID, () => {}, true);
        }
    },

    run: async function ({ api, event }) {
        // Lệnh này chỉ để thông báo trạng thái khi người dùng gõ tên lệnh
        return api.sendMessage("Hệ thống AutoDown (TikTok/FB/YT/CapCut) đang chạy ngầm 24/7!", event.threadID);
    }
};
