const state = {};
// window.slideify_stat = state; // uncomment for debugging

const get_domain = () => window.location.origin.match(/\b((reddit)|(xkcd))\.com\b/)[1];

function reddit_start() {
    if (window.location.origin.endsWith(".reddit.com")) {
        state.images = [...document.querySelectorAll("div.media-lightbox-img > img:not([role])")];
        if (state.images.length > 0) {
            state.index = 0;
            state.image = state.images[0];
        }
    }

    if (state.image) {
        if (state.image.hasAttribute("slideify")) {
            delete state.domain;
            reddit_stop();
        } else {
            if (state.image.nodeName == "IMG") {
                let handler = state.handler = event => {
                    if (state.timer) {
                        // wait for timer to finish.
                    } else if (event.key == "ArrowDown" || event.key == "ArrowRight") {
                        if (state.index < state.images.length - 1) {
                            state.image.removeAttribute("slideify");
                            state.index += 1;
                            state.image = state.images[state.index];
                            state.image.setAttribute("slideify", "");
                        } else {
                            window.scrollTo(0, document.body.scrollHeight);
                            state.timer = setInterval(() => {
                                let images = [...document.querySelectorAll("div.media-lightbox-img > img:not([role])")];
                                let index = images.findIndex(i => i.hasAttribute("slideify"));
                                if (index >= 0) {
                                    images.splice(0, index+1);
                                    state.images.push(...images);
                                }
                                if (state.index < state.images.length - 1) {
                                    clearInterval(state.timer);
                                    delete state.timer;
                                    state.image.removeAttribute("slideify");
                                    state.index += 1;
                                    state.image = state.images[state.index];
                                    state.image.setAttribute("slideify", "");
                                } // else reached the end, keep retrying
                            }, 1000);
                        }
                    } else if (event.key == "ArrowUp" || event.key == "ArrowLeft") {
                        if (state.index > 0) {
                            state.image.removeAttribute("slideify");
                            state.index -= 1;
                            state.image = state.images[state.index];
                            state.image.setAttribute("slideify", "");
                        } // else at first
                    }
                };

                window.addEventListener("keydown", handler);
            }

            document.body.setAttribute("slideify", "");
            state.image.setAttribute("slideify", "");
        }
    }
}

function reddit_stop() {
    if (state.image) {
        state.image.removeAttribute("slideify");
        document.body.removeAttribute("slideify");
    }
    if (state.timer) {
        clearInterval(state.timer);
        delete state.timer;
    }
    if (state.images) {
        delete state.images;
        delete state.image;
        delete state.index;
    }
    if (state.handler) {
        let handler = state.handler;
        delete state.handler;
        window.removeEventListener("keydown", handler);
    }
}


function xkcd_start() {
    localStorage["slideify"] = "true";
    document.body.setAttribute("slideify", "");

    let img = document.querySelector("div#comic img");
    if (img) {
        img.setAttribute("slideify", "");
    }
    let div = document.querySelector("div#ctitle");
    if (div) {
        div.setAttribute("slideify", "");
    }
    let handler = state.handler = event => {
        if (event.key == "ArrowDown" || event.key == "ArrowRight") {
            document.querySelector("a[rel='next']")?.click();
        } else if (event.key == "ArrowUp" || event.key == "ArrowLeft") {
            document.querySelector("a[rel='prev']")?.click();
        }
    };

    window.addEventListener("keydown", handler);

}

function xkcd_stop() {
    delete localStorage["slideify"];
    document.body.removeAttribute("slideify");

    if (state.handler) {
        let handler = state.handler;
        delete state.handler;
        window.removeEventListener("keydown", handler);
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "toggle") {
        if (state.domain) {
            const domain = state.domain;
            console.log("stop", domain);
            delete state.domain;
            if (domain === "xkcd") {
                xkcd_stop();
            } else {
                reddit_stop();
            }
        } else {
            let domain = state.domain = get_domain();
            console.log("start", domain);
            if (domain === "xkcd") {
                xkcd_start();
            } else {
                reddit_start();
            }
        }
    }
    sendResponse({});
});

if (localStorage["slideify"] == "true") {
    let domain = state.domain = get_domain();
    console.log("start", domain);
    if (domain === "xkcd") {
        xkcd_start();
    }
}
