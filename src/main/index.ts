import {app, shell, BrowserWindow, ipcMain, dialog, protocol} from 'electron'
import {join, dirname, basename} from 'path'
import {electronApp, optimizer, is} from '@electron-toolkit/utils'
import {existsSync} from "fs";
import icon from '../../resources/icon.png?asset'

import {execFile} from 'child_process';

import appRootDir from 'app-root-dir';

import getPlatform from "./get-platform";

const isProd = process.env.NODE_ENV === 'production'

let mainWindow

function createWindow(): void {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 800,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? {icon} : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false,
            nodeIntegrationInWorker: true,
            webSecurity: false,
            devTools: !app.isPackaged,
        },
        resizable: false,
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return {action: 'deny'}
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

function registerListeners() {
    ipcMain.on('open-dialog', (event) => {
        dialog
            .showOpenDialog(mainWindow!, {

                properties: ['openFile'],
                filters: [
                    {name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm',]},
                    {name: 'All Files', extensions: ['*']}
                ]
            })
            .then(({filePaths}) => {
                if (filePaths.length) {
                    event.reply('on-file-select', filePaths[0]);
                }
            });
    })
}

function makeClipVideo(data, event) {

    const execPath = isProd ?
        join(dirname(appRootDir.get()), 'resources', 'bin') :
        join(appRootDir.get(), 'resources', getPlatform());

    const cmd = `${join(execPath, 'ffmpeg')}`;
    const clipLength = data.end - data.start;
    const clipPath = join(dirname(data.path), basename(data.name));
    if (existsSync(clipPath)) {
        event.reply('clip-exists', clipPath);
        return;
    }
    execFile(cmd, ["-ss", data.start, "-i", data.path, "-c", "copy", "-to", clipLength, clipPath], (err, stdout, stderr) => {
        if (err) {
            event.reply('clip-error', err);
            return;
        }
        event.reply('extracted', clipPath);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()
    registerListeners()

    ipcMain.on('extract', (event, data) => {
        makeClipVideo(data, event);
    })
    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURI(request.url.replace('file:///', ''));
        callback(pathname);
    });

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
