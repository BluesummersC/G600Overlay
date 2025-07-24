const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
// import { Conf } from 'electron-conf/main'

// const confPath = path.join(app.getPath('userData'), 'layouts.json')
const confPath = path.join('layouts.json')

let MainWin
let overlayWins = new Array
let config
let activeLayout

function readConfig() {
	let contents = fs.readFileSync(confPath, 'utf8')
	config = JSON.parse(contents)
	// return JSON.parse(contents)
}

function parseConfig() {
	if (Object.hasOwn(config, 'last_active')) {
		if (config.last_active !== ""){
			activeLayout = config.last_active
		} else {
			activeLayout = ""
		}
	}
}

function writeConfig() {
	let contents = JSON.stringify(config, null, 4)
	fs.writeFileSync(confPath, contents)
}

const createMain = () => {
	MainWin = new BrowserWindow({
		show: false,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegrationInWorker: true
		}
	})

	// MainWin.webContents.openDevTools()
	MainWin.loadFile('app.html');
	MainWin.show();
	
	MainWin.on('closed', () => app.quit())
}

const createOverlay = () => {
	let overlayWin = new BrowserWindow({
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

	overlayWin.setFullScreen(true);
	// overlayWin.setIgnoreMouseEvents(true);
	overlayWin.webContents.openDevTools()
	overlayWin.loadFile('overlay.html');
	overlayWin.show();
	overlayWins.push(overlayWin)
}

app.whenReady().then(() => {
	readConfig()
	parseConfig()
	createMain();
	
	MainWin.webContents.on('before-input-event', (event, input) => {
		if (input.control && input.key.toLowerCase() === 'r') {
			MainWin.webContents.reloadIgnoringCache()
			event.preventDefault()
		}
	})

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMain();
		}
	})
})


app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

ipcMain.on("toMain", (event, args) => {
	console.log("toMain args = " + args);
	let cmd = args[0]
	if (cmd == "readConfig") {
		console.log(config.layouts[activeLayout])
		overlayWins[0].webContents.send("fromMain", config.layouts[activeLayout])
	}
	if (cmd == "requestConfig") {
		MainWin.webContents.send("configReturn", config)
	}
	if (cmd == "updateActive") {
		config.last_active = args[1]
		writeConfig()
		readConfig()
		parseConfig()
	}
	if (cmd == "refresh") {
	  MainWin.webContents.reloadIgnoringCache()
	  event.preventDefault()
	}
	if (cmd == "activate") {
		let name = args[1]
		let newValues = args[2]
		console.log(config.layouts[name])
		config.layouts[name] = newValues
		console.log(config.layouts[name])

		if (overlayWins[0]) {
			overlayWins[0].show()
			overlayWins[0].webContents.send("fromMain", config.layouts[activeLayout])
		}
		else {
			createOverlay()
		}
	}
	if (cmd == "save") {
		writeConfig()
	}
	if (cmd == "deactivate") {
		if (overlayWins[0]) {
			overlayWins[0].close()
			overlayWins.splice(0, 1)
		}
	}
})
