const { exec } = require("child_process");
const path = require("path");

function clickMouse() {
  const scriptPath = path.join(__dirname, "loading.ps1");
  exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
}

setInterval(clickMouse, 20000);
