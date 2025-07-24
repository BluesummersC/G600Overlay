const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
// import { Conf } from 'electron-conf/main'

// const confPath = path.join(app.getPath('userData'), 'layouts.json')
const confPath = path.join('layouts.json')

let win;

// const schema = {
// 	type: 'object',
// 	properties: {
// 		layout: {
// 			type: 'object',
// 		},
// 		bars: {
// 			type: 'object'
// 		},
// 		width: { type: 'integer' },
// 		height: { type: 'integer' },
// 		offsetBottom: { type: 'integer' },
// 		offsetLeft: { type: 'integer' },
// 		bar: {
// 			type: 'array'
// 		},
// 		marginLeft: { type: 'integer' },
// 		borderColor: { type: 'string' }
// 	},
// 	required: ['layout', 'bars', 'width', 'height', 'offsetBottom', 'offsetLeft', 'bar', 'marginLeft', 'borderColor']

// }
// const conf = new Conf({ schema })


const createWindow = () => {
	win = new BrowserWindow({
		frame: false,
		autoHideMenubar: true,
		transparent: true,
		alwaysOnTop: true,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegrationInWorker: true
		}
	})

	win.setFullScreen(true);
	win.setIgnoreMouseEvents(true);
	// win.webContents.openDevTools()
	win.loadFile('index.html');
	win.show();
}

app.whenReady().then(() => {
	createWindow();
	
	win.webContents.on('before-input-event', (event, input) => {
	if (input.control && input.key.toLowerCase() === 'r') {
	  console.log('Pressed Control+r')
	  win.webContents.reloadIgnoringCache()
	  event.preventDefault()
	}
  })

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

ipcMain.on("toMain", (event, args) => {

	console.log("on toMain");
	fs.readFile(confPath, 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		const config = JSON.parse(data);
		// console.log(config);
		win.webContents.send("fromMain", config);
	})
})
