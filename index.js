require("./autoinstall");


const { spawn } = require("child_process");
const logger = require("./utils/log");

global.countRestart = 0;
const maxRestart = 5;

function startBot(message) {
    if (message) logger(message, "[ Starting ]");

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "mirai.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit !== 0) {
            if (global.countRestart < maxRestart) {
                global.countRestart++;
                logger(`Bot crashed. Restart lần ${global.countRestart}/${maxRestart}`, "[ Restart ]");
                setTimeout(() => startBot("Restarting..."), 3000);
            } else {
                logger("Đã vượt quá số lần restart cho phép. Dừng bot.", "[ STOP ]");
            }
        }
    });

    child.on("error", (error) => {
        logger("Lỗi khi start bot: " + error.message, "[ ERROR ]");
    });
}

process.on("unhandledRejection", err => {
    console.log("Unhandled Rejection:", err);
});

process.on("uncaughtException", err => {
    console.log("Uncaught Exception:", err);
});

startBot();
