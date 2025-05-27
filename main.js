// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

// This function creates the browser window.
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            // The preload script is not strictly necessary for this app,
            // but it's a good practice for security.
            // We can leave it out for simplicity here.
        }
    });

    // Load your app's index.html file.
    win.loadFile(path.join(__dirname, 'src/index.html'));

    // Optional: Open the DevTools for debugging.
    // win.webContents.openDevTools();
};

// This method is called when Electron has finished initialization
// and is ready to create browser windows.
app.whenReady().then(() => {
    createWindow();

    // Handle macOS specific behavior (optional but good practice).
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed (except on macOS).
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});