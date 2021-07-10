'use strict';
const { app, BrowserWindow, Menu } = require('electron');
const { is } = require('electron-util');
const unhandled = require('electron-unhandled');
const menu = require('./menu.js');

unhandled();

app.setAppUserModelId('com.nramabad.duckduckelectron');

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 600,
		height: 400
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	win.webContents.on('will-navigate', function(e, url) {
		if (!/https?:\/\/(www\.)?duckduckgo\.com/.test(url) &&
			url !== win.webContents.getURL()) {
			e.preventDefault();
			const [x, y] = BrowserWindow
				.getFocusedWindow()
				.getPosition()
				.map(pos => pos + 22);
			(new BrowserWindow(
				{ 
					width: 600,
					height: 400, 
					x,
					y
				})
			).loadURL(url);
		} 
	});

	await win.loadURL('https://duckduckgo.com/');

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
})();
