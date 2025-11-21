const electron = require("electron")
const { app, BrowserWindow, screen, ipcMain, nativeImage } = electron;
const path = require("path")

// allow camera:... from browser

const protocol = "camera";

if (!app.isDefaultProtocolClient(protocol)) {
    app.setAsDefaultProtocolClient(protocol);
}

// save launch url is needed
let launchUrl;

app.on("will-finish-launching", function () {
    app.on("open-url", function (event, url) {
        event.preventDefault()
        launchUrl = url
        console.log("launcUrl", launchUrl);
    })
});


// force single instance

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
    return;
} else {
    app.on("second-instance", (e, argv) => {
        console.log("second-instance", argv);
        const launch = argv.find((arg) => arg.startsWith(protocol + ":"));
        // TODO: does not work on osx packaged app, launched from browser
        if (launch == "camera:stop") {
            win.close();
        } else if (win) {
            if (win.isMinimized()) {
                win.restore();
            }
            win.focus();
        }
    });
}

// launching the app, creating and loading initial window

let win;

function launchApp() {
    createWindow();
    loadWindow();
}

function createWindow() {
    console.log("createWindow");

    // default to show in bottom left
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const diameter = 200, gap = 10;
    let position = {
        x: gap, y: height - diameter - gap, width: diameter, height: diameter
    };

    const options = {
        ...position,
        show: false, transparent: true, resizable: true, movable: true, frame: false, 
        roundedCorners: false, skipTaskbar: true, hasShadow: false, enableLargerThanScreen: true,
        webPreferences: { nodeIntegration: true, contextIsolation: false, nativeWindowOpen: true }
    };

    // // does not seem to work
    // options.icon = nativeImage.createFromPath(path.join(__dirname, "icon-color.png"));

    win = new BrowserWindow(options);

    // reposition based on previous
    let localStorage = {};
    win.webContents
        .executeJavaScript('({...localStorage});', true)
        .then(value => {
            console.log("localStorage", value);
            localStorage = value;
            const str = localStorage["position"];
            if (str) {
                console.log("position=", str);
                try {
                    position = JSON.parse(str);
                    sanitizePosition(position, {width, height});
                    win.setPosition(position.x, position.y);
                    win.setSize(position.width, position.height);
                } catch (e) { } // ignore
            }
            win.show();
        });


    win.setAlwaysOnTop(true);
    win.setAspectRatio(1);

    let closing = false;
    win.on("close", (event) => {
        if (!closing) {
            closing = true;
            event.preventDefault();
            const [x, y] = win.getPosition();
            const [width, height] = win.getSize();
            Object.assign(position, {x, y, width, height});
            console.log("close position=" + JSON.stringify(position));
            const command = `localStorage.setItem("position", JSON.stringify(${JSON.stringify(position)}));`
            console.log("command", command);

            win.webContents
                .executeJavaScript(command, true)
                .then(value => {
                    console.log("saved position");
                    win.close();
                })
                .catch(error => {
                    console.log("failed to save position", error);
                    win.close();
                });
        }
    });

    win.on("closed", () => {
        console.log("closed");
    });
}

function loadWindow() {
    win.loadURL("file://" + __dirname + "/index.html" + (launchUrl ? "?" + encodeURIComponent(launchUrl) : ""));
}

// launch on startup. boilerplate code.

app.whenReady().then(() => {
    console.log(process.argv);
    const last = process.argv.length > 1 && process.argv[process.argv.length-1] || null;
    if (last && last.startsWith(protocol + ':')) {
        console.log('last arg', last);
        if (!launchUrl) {
            console.log('setting last arg to launchUrl');
            launchUrl = last;
        }
    }

    if (launchUrl && launchUrl == "camera:stop") {
        console.log("quitting the app");
        app.quit();
    } else {
        launchApp();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                launchApp()
            }
        });
    }
});

// other functions

// update position, based on screen size limit
function sanitizePosition(position, limit) {
    if (position.width > limit.width) {
        position.width = limit.width;
    }
    if (position.height > limit.height) {
        position.height = limit.height;
    }
    if (position.x + position.width > limit.width) {
        position.x = limit.width - position.width;
    }
    if (position.y + position.height > limit.height) {
        position.y = limit.height - position.height;
    }
    if (position.x < 0) {
        position.x = 0;
    }
    if (position.y < 0) {
        position.y = 0;
    }
}

// close app when all windows are closed.

app.on("window-all-closed", () => {
    if (win) {
        app.quit()
        win = null;
    }
});
