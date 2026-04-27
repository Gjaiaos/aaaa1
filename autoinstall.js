const { execSync } = require("child_process");

function run(cmd) {
  try {
    execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
  } catch (e) {
    console.log("[AUTO-INSTALL] Lỗi khi chạy:", cmd);
  }
}

console.log("[AUTO-INSTALL] Gỡ @dongdev/fca-unofficial (nếu có)...");
run("/usr/bin/npm uninstall @dongdev/fca-unofficial || true");

console.log("[AUTO-INSTALL] Cài fca-horizon-remake...");
run("/usr/bin/npm install fca-horizon-remake --no-save");

const pkgs = [
  "axios",
  "moment-timezone",
  "fs-extra",
  "cheerio",
  "request",
  "request-promise",
  "ytdl-core"
];

function isInstalled(pkg) {
  try {
    require.resolve(pkg);
    return true;
  } catch {
    return false;
  }
}

for (const pkg of pkgs) {
  if (!isInstalled(pkg)) {
    console.log(`[AUTO-INSTALL] Đang cài: ${pkg}`);
    run(`/usr/bin/npm install ${pkg} --no-save`);
  } else {
    console.log(`[AUTO-INSTALL] Đã có: ${pkg}`);
  }
}

console.log("[AUTO-INSTALL] Xong.");
