module.exports.config = {
    name: "checktt",
    version: "2.5.0",
    hasPermssion: 0,
    credits: "DungUwU, Nghĩa, tpk & Gemini",
    description: "Check tương tác + Auto báo cáo 0h VN + Lọc thành viên (Admin)",
    commandCategory: "Quản Lý Box",
    usages: "checktt [all/week/day] | checktt locmem [số tin]",
    cooldowns: 5,
    dependencies: {
        "moment-timezone": "",
        "fs-extra": ""
    }
};

const fs = require("fs");
const fse = require("fs-extra");
const moment = require("moment-timezone");
const path = __dirname + '/tuongtac/checktt/';

// ================== TỰ ĐỘNG BÁO CÁO 00:00 VN ==================
module.exports.onLoad = ({ api }) => {
    if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

    setInterval(async () => {
        const now = moment.tz("Asia/Ho_Chi_Minh");
        if (now.hour() === 0 && now.minute() === 0) {
            const files = fs.readdirSync(path).filter(file => file.endsWith('.json'));
            for (const file of files) {
                try {
                    const threadID = file.replace('.json', '');
                    const data = JSON.parse(fs.readFileSync(path + file));
                    if (!data.day || data.day.length === 0) continue;
                    data.day.sort((a, b) => b.count - a.count);
                    let msg = `[ BÁO CÁO TƯƠNG TÁC NGÀY ]\n────────────────\n⏰ Ngày: ${now.format("DD/MM/YYYY")}\n\n`;
                    let mentionData = [];
                    for (let i = 0; i < data.day.length; i++) {
                        const name = global.data.userName.get(data.day[i].id) || "Người dùng Facebook";
                        msg += `${i + 1}. ${name}: ${data.day[i].count} tin\n`;
                        if (i === 0) mentionData.push({ tag: name, id: data.day[i].id });
                    }
                    msg += `\n🏆 Vinh danh TOP 1: ${mentionData[0].tag} 🎊\n────────────────\n🔎 Người yêu cầu: Hệ thống tự động\n🌅 Chúc cả nhóm ngày mới tốt lành!`;
                    api.sendMessage({ body: msg, mentions: mentionData }, threadID);
                } catch (e) { console.log(e) }
            }
        }
    }, 60 * 1000);
};

// ================== ĐẾM TIN NHẮN ==================
module.exports.handleEvent = async function ({ api, event }) {
    if (!event.senderID || event.type == "message_unsend") return;
    const { threadID, senderID } = event;
    const today = moment.tz("Asia/Ho_Chi_Minh").day();
    if (!fs.existsSync(path + threadID + '.json')) {
        const newData = { total: [], week: [], day: [], time: today };
        fs.writeFileSync(path + threadID + '.json', JSON.stringify(newData, null, 4));
    }
    const data = JSON.parse(fs.readFileSync(path + threadID + '.json'));
    if (data.time != today) {
        data.day = [];
        if (today == 1) data.week = [];
        data.time = today;
    }
    const update = (arr, id) => {
        const i = arr.findIndex(e => e.id == id);
        if (i == -1) arr.push({ id: id, count: 1 });
        else arr[i].count++;
    };
    update(data.total, senderID);
    update(data.week, senderID);
    update(data.day, senderID);
    fs.writeFileSync(path + threadID + '.json', JSON.stringify(data, null, 4));
};

// ================== LỆNH CHẠY ==================
module.exports.run = async function ({ api, event, args, Users, Threads }) {
    const { threadID, senderID, messageReply, mentions } = event;
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${Math.floor(uptime%60)}s`;
    const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");
    const requesterName = await Users.getNameUser(senderID);

    if (!fs.existsSync(path + threadID + '.json')) return api.sendMessage("⚠️ Chưa có dữ liệu.", threadID);
    const data = JSON.parse(fs.readFileSync(path + threadID + '.json'));

    // --- TÍNH NĂNG LỌC THÀNH VIÊN (CHỈ ADMIN BOX) ---
    if (args[0] == "locmem") {
        const threadInfo = await Threads.getInfo(threadID);
        if (!threadInfo.adminIDs.some(item => item.id == senderID)) 
            return api.sendMessage("⚠️ Chỉ Quản trị viên nhóm mới có quyền lọc thành viên!", threadID);
        
        const minCount = parseInt(args[1]);
        if (isNaN(minCount)) return api.sendMessage("⚠️ Vui lòng nhập số tin nhắn tối thiểu để lọc. Ví dụ: checktt locmem 10", threadID);

        let countKick = 0;
        const allMembers = threadInfo.participantIDs;
        
        api.sendMessage(`🚀 Đang tiến hành lọc thành viên có dưới ${minCount} tin nhắn...`, threadID);

        for (const id of allMembers) {
            // Không lọc bot và người dùng hiện tại (người gõ lệnh)
            if (id == api.getCurrentUserID() || id == senderID) continue;
            
            const userTotal = (data.total.find(e => e.id == id) || { count: 0 }).count;
            if (userTotal < minCount) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay để tránh bị spam block
                api.removeUserFromGroup(id, threadID);
                countKick++;
            }
        }
        return api.sendMessage(`✅ Đã lọc thành công ${countKick} thành viên không tích cực.`, threadID);
    }

    // --- CHECK DANH SÁCH ---
    if (args[0] && ["all", "week", "day"].includes(args[0].toLowerCase())) {
        const type = args[0].toLowerCase();
        let list = type == "day" ? data.day : type == "week" ? data.week : data.total;
        list.sort((a, b) => b.count - a.count);

        let msg = `📊 TOP TƯƠNG TÁC ${type.toUpperCase()}\n────────────────\n`;
        for (let i = 0; i < list.length; i++) {
            const name = await Users.getNameUser(list[i].id);
            msg += `${i + 1}. ${name} (${list[i].count})\n`;
        }
        msg += `────────────────\n⏱️ Uptime: ${uptimeStr}\n⏰ Time: ${timeNow}\n🔎 Người check: ${requesterName}`;
        return api.sendMessage(msg, threadID);
    }

    // --- CHECK CÁ NHÂN ---
    let targetID = messageReply ? messageReply.senderID : (Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID);
    const name = await Users.getNameUser(targetID);
    const total = (data.total.find(e => e.id == targetID) || { count: 0 }).count;
    const week = (data.week.find(e => e.id == targetID) || { count: 0 }).count;
    const day = (data.day.find(e => e.id == targetID) || { count: 0 }).count;
    data.total.sort((a, b) => b.count - a.count);
    const rank = data.total.findIndex(e => e.id == targetID) + 1;

    let msg = `╭─── CHECK INFO ───⭓\n│ 👤 Tên: ${name}\n│ 🏆 Hạng: ${rank}\n│ 📩 Tổng: ${total}\n│ 📅 Tuần: ${week}\n│ 🕒 Ngày: ${day}\n├───────⭔\n│ ⏱️ Uptime: ${uptimeStr}\n│ ⏰ Time VN: ${timeNow}\n│ 🔎 Người check: ${requesterName}\n╰─────────────⭓`;
    return api.sendMessage(msg, threadID);
};
