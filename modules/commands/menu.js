module.exports.config = {
    name: 'menu',
    version: '1.2.5',
    hasPermssion: 0,
    credits: 'Gemini Fix',
    description: 'Xem danh sách nhóm lệnh kèm thời gian online',
    commandCategory: 'Box',
    usages: '[...name commands|all]',
    cooldowns: 2,
    envConfig: {
        autoUnsend: {
            status: true,
            timeOut: 60
        }
    }
};

const { autoUnsend = this.config.envConfig.autoUnsend } = global.config == undefined ? {} : global.config.menu == undefined ? {} : global.config.menu;
const { findBestMatch } = require('string-similarity');

// ===== CHẾ ĐỘ NOPREFIX =====
module.exports.handleEvent = async function ({ api, event }) {
    const { body, threadID, messageID } = event;
    if (!body) return;
    if (body.toLowerCase() == "menu") {
        return this.run({ api, event, args: [], noprefix: true });
    }
};

// ===== CHÍNH =====
module.exports.run = async function ({ api, event, args }) {
    const moment = require("moment-timezone");
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    const cmds = global.client.commands;

    // Tính thời gian bot online
    const uptime = process.uptime();
    const hours = Math.floor(uptime / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeString = `${hours}h ${minutes}p ${seconds}s`;

    const timeStr = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

    if (args.length >= 1) {
        if (typeof cmds.get(args.join(' ')) == 'object') {
            const body = infoCmds(cmds.get(args.join(' ')).config);
            return send(body, tid, mid);
        } else {
            if (args[0] == 'all') {
                const data = cmds.values();
                var txt = '╭─────────────⭓\n', count = 0;
                for (const cmd of data) txt += `│ ${++count}. ${cmd.config.name} | ${cmd.config.description}\n`;
                txt += `\n├────────⭔\n│ ⏳ Tự động gỡ sau: ${autoUnsend.timeOut}s\n╰─────────────⭓`;
                return send(txt, tid, (a, b) => autoUnsend.status ? setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID) : '');
            } else {
                const cmdsValue = cmds.values();
                const arrayCmds = [];
                for (const cmd of cmdsValue) arrayCmds.push(cmd.config.name);
                const similarly = findBestMatch(args.join(' '), arrayCmds);
                if (similarly.bestMatch.rating >= 0.3) return send(`⚠️ "${args.join(' ')}" gần giống lệnh "${similarly.bestMatch.target}"`, tid, mid);
            }
        }
    } else {
        const data = commandsGroup();
        var txt = '╭─────────────⭓\n', count = 0;
        for (const { commandCategory, commandsName } of data) txt += `│ ${++count}. ${commandCategory} | ${commandsName.length} lệnh\n`;
        txt += `├────────⭔\n`;
        txt += `│ 📝 Tổng: ${global.client.commands.size} lệnh\n`;
        txt += `│ ⏱️ Uptime: ${uptimeString}\n`; // Thêm dòng này
        txt += `│ ⏰ Time: ${timeStr}\n`;
        txt += `│ 🔎 Reply số để chọn\n`;
        txt += `│ ⏳ Tự động gỡ sau: ${autoUnsend.timeOut}s\n╰─────────────⭓`;
        
        return send(txt, tid, (a, b) => {
            global.client.handleReply.push({ name: this.config.name, messageID: b.messageID, author: sid, 'case': 'infoGr', data });
            if (autoUnsend.status) setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID);
        }, mid);
    }
};

module.exports.handleReply = async function ({ handleReply: $, api, event }) {
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid } = event;

    if (sid != $.author) return; // Không cần báo lỗi để tránh spam

    switch ($.case) {
        case 'infoGr': {
            var data = $.data[(+event.body) - 1];
            if (data == undefined) return send(`❎ Số thứ tự không hợp lệ`, tid, mid);

            un($.messageID);
            var txt = `╭─────────────⭓\n│ Nhóm: ${data.commandCategory}\n├─────⭔\n`, count = 0;
            for (const name of data.commandsName) {
                const cmdInfo = global.client.commands.get(name).config;
                txt += `│ ${++count}. ${name} | ${cmdInfo.description}\n`;
            }
            txt += `├────────⭔\n│ 🔎 Reply số để xem chi tiết\n│ ⏳ Tự động gỡ sau: ${autoUnsend.timeOut}s\n╰─────────────⭓`;
            return send(txt, tid, (a, b) => {
                global.client.handleReply.push({ name: this.config.name, messageID: b.messageID, author: sid, 'case': 'infoCmds', data: data.commandsName });
                if (autoUnsend.status) setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID);
            });
        }
        case 'infoCmds': {
            var data = global.client.commands.get($.data[(+event.body) - 1]);
            if (typeof data != 'object') return send(`⚠️ Số thứ tự không hợp lệ`, tid, mid);

            const { config = {} } = data || {};
            un($.messageID);
            return send(infoCmds(config), tid, mid);
        }
    }
};

function commandsGroup() {
    const array = [], cmds = global.client.commands.values();
    for (const cmd of cmds) {
        const { name, commandCategory } = cmd.config;
        const find = array.find(i => i.commandCategory == commandCategory);
        !find ? array.push({ commandCategory, commandsName: [name] }) : find.commandsName.push(name);
    }
    array.sort((a, b) => b.commandsName.length - a.commandsName.length);
    return array;
}

function infoCmds(a) {
    return `╭── INFO ────⭓\n│ 📔 Tên lệnh: ${a.name}\n│ 🔐 Quyền: ${premssionTxt(a.hasPermssion)}\n│ 🌾 Mô tả: ${a.description}\n│ 📎 Nhóm: ${a.commandCategory}\n│ 📝 Dùng: ${a.usages}\n│ ⏳ Chờ: ${a.cooldowns}s\n╰─────────────⭓`;
}

function premssionTxt(a) {
    return a == 0 ? 'Thành Viên' : a == 1 ? 'Quản Trị Viên' : a == 2 ? 'ADMINBOT' : 'Hệ Thống';
}
