const contextBridge = require('electron').contextBridge;
const ipcRenderer = require('electron').ipcRenderer;

contextBridge.exposeInMainWorld(
    'bridge', {
        send: (channel, data) => {
            let validChannels = ["toMain", "updateActive"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["fromMain", "configReturn"];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
)