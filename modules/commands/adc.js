module.exports.config = {

    name: "adc",

    version: "4.2.0",

    hasPermssion: 2,

    credits: "NoLib Fix",

    description: "Up module lên Pastebin & áp dụng code từ link",

    commandCategory: "Admin",

    usages: "adc <file> hoặc reply link",

    cooldowns: 0

};

const https = require("https");

const fs = require("fs");

const path = require("path");

const querystring = require("querystring");

function uploadPaste(code, callback) {

    if (!global.config.PASTEBIN_API_KEY)

        return callback("Thiếu PASTEBIN_API_KEY.");

    const postData = querystring.stringify({

        api_dev_key: global.config.PASTEBIN_API_KEY,

        api_option: "paste",

        api_paste_code: code,

        api_paste_private: 1,

        api_paste_expire_date: "N"

    });

    const options = {

        hostname: "pastebin.com",

        path: "/api/api_post.php",

        method: "POST",

        headers: {

            "Content-Type": "application/x-www-form-urlencoded",

            "Content-Length": Buffer.byteLength(postData)

        }

    };

    const req = https.request(options, res => {

        let data = "";

        res.on("data", chunk => data += chunk);

        res.on("end", () => callback(null, data));

    });

    req.on("error", err => callback(err));

    req.write(postData);

    req.end();

};

// ===== NO PREFIX =====

module.exports.handleEvent = async function ({ api, event }) {

    if (!event.body) return;

    const body = event.body.trim();

    const args = body.split(/\s+/);

    if (args[0].toLowerCase() !== "adc") return;

    const { threadID, messageID, senderID, messageReply, type } = event;

    const ADMIN = "100003516351912";

    if (senderID !== ADMIN)

        return api.sendMessage("Chỉ quản trị viên mới được dùng!", threadID, messageID);

    const fileName = args[1];

    // UP MODULE

    if (!messageReply && fileName) {

        const filePath = path.join(__dirname, fileName + ".js");

        if (!fs.existsSync(filePath))

            return api.sendMessage("Không tìm thấy module.", threadID, messageID);

        const code = fs.readFileSync(filePath, "utf8");

        uploadPaste(code, (err, link) => {

            if (err) return api.sendMessage("Lỗi upload.", threadID, messageID);

            api.sendMessage(

                "Link: " + link.replace("pastebin.com/", "pastebin.com/raw/"),

                threadID,

                messageID

            );

        });

        return;

    }

    // APPLY CODE

    if (type === "message_reply" && messageReply.body) {

        const match = messageReply.body.match(/https?:\/\/[^\s]+/);

        if (!match)

            return api.sendMessage("Reply link hợp lệ.", threadID, messageID);

        if (!fileName)

            return api.sendMessage("Nhập tên file.", threadID, messageID);

        const url = match[0];

        const savePath = path.join(__dirname, fileName + ".js");

        https.get(url, res => {

            let data = "";

            res.on("data", chunk => data += chunk);

            res.on("end", () => {

                fs.writeFileSync(savePath, data);

                api.sendMessage(`Đã ghi code vào ${fileName}.js`, threadID, messageID);

            });

        }).on("error", () => {

            api.sendMessage("Link lỗi.", threadID, messageID);

        });

        return;

    }

    api.sendMessage("Sai cú pháp.", threadID, messageID);

};

// BẮT BUỘC PHẢI CÓ RUN ĐỂ KHÔNG LỖI LOADER

module.exports.run = function () {};

