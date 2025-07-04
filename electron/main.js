const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let djangoProcess;

function log(msg) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${msg}`);
}

function createWindow() {
  log('Creating Electron window...');
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:5173'); // React dev server
  log('Loaded React dev server at http://localhost:5173');

  // Log renderer (frontend) console messages in the main process
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message} (${sourceId}:${line})`);
  });
}

app.whenReady().then(() => {
  log('App is ready. Launching Django backend...');
  // Launch Django backend
  djangoProcess = spawn('python', ['manage.py', 'runserver'], {
    cwd: path.join(__dirname, '..'), // Adjusted path to root for manage.py
    shell: true,
  });

  djangoProcess.stdout.on('data', (data) => {
    log(`Django: ${data}`);
  });

  djangoProcess.stderr.on('data', (data) => {
    const str = data.toString();
    if (!str.includes('GET /api/metrics/ HTTP/1.1" 200')) {
      log(`Django stderr: ${str}`);
    }
  });

  djangoProcess.on('close', (code) => {
    log(`Django process exited with code ${code}`);
  });

  createWindow();
});

app.on('window-all-closed', () => {
  log('All windows closed. Killing Django process and quitting app.');
  if (djangoProcess) {
    djangoProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
