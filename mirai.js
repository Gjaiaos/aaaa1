// ===== FIX FACEBOOK BLOCK 1357004 - 1 FILE DUY NHẤT =====

const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");

const { join, resolve } = require("path");

const login = require("fca-horizon-remake");

const fs = require("fs-extra");

const chalk = require("chalk");

const figlet = require("figlet");

const moment = require("moment-timezone");

const logger = require("./utils/log.js");

if (!fs.existsSync('./utils/data')) fs.mkdirSync('./utils/data', { recursive: true });

global.client = {

  commands: new Map(),

  events: new Map(),

  cooldowns: new Map(),

  eventRegistered: [],

  handleReaction: [],

  handleReply: [],

  mainPath: process.cwd(),

  configPath: "",

  getTime: o => moment.tz("Asia/Ho_Chi_Minh").format({ fullTime: "HH:mm:ss DD/MM/YYYY" }[o])

};

global.data = {

  threadInfo: new Map(),

  threadData: new Map(),

  userName: new Map(),

  userBanned: new Map(),

  threadBanned: new Map(),

  commandBanned: new Map(),

  threadAllowNSFW: [],

  allUserID: [],

  allCurrenciesID: [],

  allThreadID: []

};

global.utils = require("./utils/func");

global.config = require("./config.json");

async function onBot({ models }) {

  let appState = null;

  try {

    if (fs.existsSync('./appstate.json')) {

      appState = JSON.parse(fs.readFileSync('./appstate.json', 'utf8'));

    } else if (fs.existsSync('./cookie.txt')) {

      appState = global.utils.parseCookies(fs.readFileSync('./cookie.txt', 'utf8'));

    }

  } catch (e) {

    console.log("❌ Lỗi đọc cookie/appstate:", e);

  }

  if (!appState || !Array.isArray(appState)) {

    console.log("❌ AppState/Cookie lỗi hoặc rỗng. Bot dừng.");

    return;

  }

  login({ appState }, async (err, api) => {

    if (err) {

      console.log("❌ Login error:", err);

      return;

    }

    api.setOptions(global.config.FCAOption || {});

    global.client.api = api;

    global.client.timeStart = Date.now();

    logger("Login thành công (bỏ getUserInfo để tránh block Facebook)", "[ LOGIN ]");

    console.log(chalk.yellow(figlet.textSync("START BOT", { horizontalLayout: "full" })));

    // LOAD MODULE

    const loadModules = (path, map) => {

      for (const file of readdirSync(path).filter(f => f.endsWith(".js"))) {

        try {

          const m = require(join(path, file));

          if (m?.config?.name) map.set(m.config.name, m);

        } catch (e) {

          console.log("❌ Lỗi load module:", file, e.message);

        }

      }

    };

    loadModules(join(process.cwd(), "modules", "commands"), global.client.commands);

    loadModules(join(process.cwd(), "modules", "events"), global.client.events);

    logger(`Loaded ${global.client.commands.size} commands`, "[ MODULE ]");

    const listener = require("./includes/listen")({ api, models });

    api.listenMqtt((err, event) => {

      if (err) return console.log("⚠️ MQTT warning:", err.message || err);

      listener(event);

    });

    logger("Bot đã online (Facebook block API thì vẫn chạy bình thường)", "[ READY ]");

  });

}

(async () => {

  try {

    const { Sequelize, sequelize } = require("./includes/database");

    await sequelize.authenticate();

    const models = require("./includes/database/model")({ Sequelize, sequelize });

    logger("Kết nối database thành công", "[ DATABASE ]");

    onBot({ models });

  } catch (e) {

    console.log("❌ Lỗi database:", e);

  }

})();

