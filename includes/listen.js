module.exports = function({ api, models }) {

  const fs = require('fs-extra');

  const path = require('path');

  const Users = require("./controllers/users")({ models, api });

  const Threads = require("./controllers/threads")({ models, api });

  const Currencies = require("./controllers/currencies")({ models });

  const logger = require("../utils/log.js");

  const pathBan = path.join(__dirname, '../modules/commands/cache/bannedUsers.json');

  const pathSleep = path.join(__dirname, '../modules/commands/cache/boxSleep.json');

  if (!fs.existsSync(path.dirname(pathBan))) fs.mkdirSync(path.dirname(pathBan), { recursive: true });

  if (!fs.existsSync(pathBan)) fs.writeFileSync(pathBan, JSON.stringify([]));

  if (!fs.existsSync(pathSleep)) fs.writeFileSync(pathSleep, JSON.stringify({}));

  (async () => {

    try {

      const [threads, users, currencies] = await Promise.all([

        Threads.getAll(),

        Users.getAll(['userID', 'name', 'data']),

        Currencies.getAll(['userID'])

      ]);

      for (let data of threads) {

        const id = String(data.threadID);

        global.data.allThreadID.push(id);

        global.data.threadData.set(id, data.data || {});

        global.data.threadInfo.set(id, data.threadInfo || {});

      }

      for (let dataU of users) {

        const idU = String(dataU.userID);

        global.data.allUserID.push(idU);

        global.data.userName.set(idU, dataU.name || "");

      }

      logger.loader(`Tải thành công dữ liệu hệ thống.`);

    } catch (e) { logger(`Lỗi tải dữ liệu: ${e}`, 'error'); }

  })();

  const handlers = fs.readdirSync(path.join(__dirname, './handle')).reduce((acc, file) => {

    return { ...acc, [path.basename(file, '.js')]: require(`./handle/${file}`)({ api, models, Users, Threads, Currencies }) };

  }, {});

  return async function(event) {

    const adminIDs = global.config.ADMINBOT || [];

    

    // --- CHỐT CHẶN TỔNG (Cấm cãi) ---

    if (!adminIDs.includes(event.senderID)) {

      const bannedUsers = JSON.parse(fs.readFileSync(pathBan, 'utf-8'));

      if (bannedUsers.includes(event.senderID)) return;

      const sleepData = JSON.parse(fs.readFileSync(pathSleep, 'utf-8'));

      if (sleepData[event.threadID] === true) return;

    }

    await handlers['handleCreateDatabase']({ event });

    switch (event.type) {

      case "message":

      case "message_reply":

        await Promise.all([

          handlers['handleCommand']({ event }),

          handlers['handleReply']({ event }),

          handlers['handleCommandEvent']({ event })

        ]);

        break;

      case "event":

        await handlers['handleEvent']({ event });

        break;

      case "message_reaction":

        await handlers['handleReaction']({ event });

        break;

      default:

        break;

    }

  };

};

