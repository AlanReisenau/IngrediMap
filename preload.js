// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Renderer to Main (one-way)
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    // Main to Renderer
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    // Renderer to Main and back (invoke/handle)
    invoke: (channel, data) => {
        return ipcRenderer.invoke(channel, data);
    }
});