const state = {};
// window.slideify_stat = state; // uncomment for debugging

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "toggle") {
        if (window.location.origin.endsWith(".reddit.com")) {
            state.images = [...document.querySelectorAll("div.media-lightbox-img > img:not([role])")];
            if (state.images.length > 0) {
                state.index = 0;
                state.image = state.images[0];
            }
        }

        if (state.image) {
            if (state.image.hasAttribute("slideify")) {
                state.image.removeAttribute("slideify");
                document.body.removeAttribute("slideify");

                if (state.timer) {
                    clearInterval(state.timer);
                    delete state.timer;
                }
                if (state.images) {
                    delete state.images;
                    delete state.image;
                    delete state.index;
                }
            } else {
                if (state.image.nodeName == "IMG") {
                    window.addEventListener("keydown", event => {
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
                    });
                }

                document.body.setAttribute("slideify", "");
                state.image.setAttribute("slideify", "");
            }
        }
    }
    sendResponse({});
});
