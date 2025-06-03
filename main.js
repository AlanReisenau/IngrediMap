// main.js

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs'); // File System module for reading/writing files

// This function creates the browser window.
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'icon.ico'), // Ensure icon.ico is in the root
        webPreferences: {
            // Preload script to bridge main and renderer processes securely
            preload: path.join(__dirname, 'preload.js'), // Make sure preload.js is in the root directory
            nodeIntegration: false, // Disable Node.js integration in renderer for security
            contextIsolation: true, // Enable context isolation for security
        }
    });

    // Load your app's index.html file from the 'src' directory
    win.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Optional: Open the DevTools for debugging.
    // win.webContents.openDevTools();
};

// This method is called when Electron has finished initialization
// and is ready to create browser windows.
app.whenReady().then(() => {
    createWindow();

    // --- Create Application Menu ---
    const menuTemplate = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Import Recipes...',
                    accelerator: 'CmdOrCtrl+O', // Keyboard shortcut
                    click: async () => {
                        const focusedWindow = BrowserWindow.getFocusedWindow();
                        if (!focusedWindow) return;

                        const { canceled, filePaths } = await dialog.showOpenDialog(focusedWindow, {
                            title: 'Import Recipes',
                            buttonLabel: 'Import',
                            filters: [{ name: 'JSON Files', extensions: ['json'] }],
                            properties: ['openFile']
                        });

                        if (!canceled && filePaths.length > 0) {
                            try {
                                const filePath = filePaths[0];
                                const fileContent = fs.readFileSync(filePath, 'utf-8');
                                const recipesToImport = JSON.parse(fileContent);
                                // Send recipes to renderer process
                                focusedWindow.webContents.send('import-recipes-data', recipesToImport);
                                dialog.showMessageBox(focusedWindow, {
                                    type: 'info',
                                    title: 'Import Initiated',
                                    message: 'Recipe import process started. Check application for confirmation.'
                                });
                            } catch (error) {
                                console.error('Failed to read or parse import file:', error);
                                dialog.showMessageBox(focusedWindow, {
                                    type: 'error',
                                    title: 'Import Failed',
                                    message: `Could not read or parse the recipe file: ${error.message}`
                                });
                            }
                        }
                    }
                },
                {
                    label: 'Export Recipes...',
                    accelerator: 'CmdOrCtrl+S', // Keyboard shortcut
                    click: async () => {
                        const focusedWindow = BrowserWindow.getFocusedWindow();
                        if (!focusedWindow) return;

                        // 1. Ask renderer for recipe data.
                        // The renderer will listen for 'request-recipes-for-export'
                        // and respond with 'response-recipes-for-export'.
                        console.log("Main: Requesting recipes from renderer for export.");
                        focusedWindow.webContents.send('request-recipes-for-export');
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' }, // Useful for debugging
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://www.electronjs.org');
                    }
                }
            ]
        }
    ];

    // On macOS, the first menu item is often the app name.
    if (process.platform === 'darwin') {
        menuTemplate.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
    // --- End Application Menu ---

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Handler for Exporting Recipes ---
// Listen for the renderer sending back the recipe data.
ipcMain.on('response-recipes-for-export', async (event, recipesToExport) => {
    console.log("Main: Received recipes from renderer for export:", recipesToExport ? recipesToExport.length : 0, "recipes.");
    const focusedWindow = BrowserWindow.getFocusedWindow(); // Or event.sender.getOwnerBrowserWindow()
    if (!focusedWindow) {
        console.error("Main: No focused window to show save dialog.");
        return;
    }

    if (recipesToExport && recipesToExport.length > 0) {
        const { canceled, filePath } = await dialog.showSaveDialog(focusedWindow, {
            title: 'Export Recipes',
            defaultPath: `ingredimap-recipes-backup-${new Date().toISOString().slice(0,10)}.json`,
            buttonLabel: 'Export',
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (!canceled && filePath) {
            try {
                fs.writeFileSync(filePath, JSON.stringify(recipesToExport, null, 2)); // Pretty print JSON
                dialog.showMessageBox(focusedWindow, {
                    type: 'info',
                    title: 'Export Successful',
                    message: `Recipes exported successfully to:\n${filePath}`
                });
            } catch (error) {
                console.error('Main: Failed to export recipes:', error);
                dialog.showMessageBox(focusedWindow, {
                    type: 'error',
                    title: 'Export Failed',
                    message: `Could not export recipes: ${error.message}`
                });
            }
        }
    } else {
        dialog.showMessageBox(focusedWindow, {
            type: 'warning',
            title: 'Export Canceled',
            message: 'No recipe data to export or export was canceled by the application.'
        });
    }
});
