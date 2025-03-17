const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const path = require("path");

let win;
let nextProcess;
const PORT = 4210; // 공통 포트 변수로 정의

function startNextServer() {
  nextProcess = exec(
    `cd ${path.join(__dirname, "next")} && npm run start -p ${PORT}`,
    (err) => {
      if (err) console.error("Next.js start failed in bapp1:", err);
    }
  );
  return new Promise((resolve) => setTimeout(() => resolve(PORT), 2000));
}

async function createWindow() {
  win = new BrowserWindow({
    width: 390,
    height: 844,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: false,
  });

  win.webContents.on("did-finish-load", () => {
    const url = win.webContents.getURL();
    const isLoginPage = url.includes("/login");

    win.webContents.insertCSS(`
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 844px;
        overflow-x: hidden;
        overflow-y: ${isLoginPage ? "hidden" : "auto"};
      }
      body {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
        max-width: 390px;
        margin: 0 auto;
      }
    `);
    win.webContents.setZoomFactor(1.0);
  });

  const port = await startNextServer();
  win.loadURL(`http://localhost:${port}/login`);
}

// 커스텀 프로토콜 등록
app.setAsDefaultProtocolClient("bapp1");

// 딥 링크 처리
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

app.on("second-instance", (event, argv) => {
  if (process.platform !== "darwin") {
    const url = argv.find((arg) => arg.startsWith("bapp1://"));
    if (url) handleDeepLink(url);
  }
  if (win) win.focus();
});

function handleDeepLink(url) {
  console.log("Received deep link:", url); // 디버깅용 로그
  const path = url.replace("bapp1://", "").toLowerCase(); // 대소문자 무시
  if (!win) {
    // 창이 없으면 새로 생성
    createWindow().then(() => {
      if (path === "sales/dashboard") {
        win.loadURL(`http://localhost:${PORT}/sales/dashboard`);
      } else if (path === "products") {
        win.loadURL(`http://localhost:${PORT}/products`);
      }
    });
  } else {
    // 창이 있으면 바로 이동
    if (path === "sales/dashboard") {
      win.loadURL(`http://localhost:${PORT}/sales/dashboard`);
    } else if (path === "products") {
      win.loadURL(`http://localhost:${PORT}/products`);
    }
    win.focus();
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (nextProcess) nextProcess.kill();
  if (process.platform !== "darwin") app.quit();
});
