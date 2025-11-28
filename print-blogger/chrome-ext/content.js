chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == "toggle") {
        if (document.body.hasAttribute("print")) {
            document.body.removeAttribute("print");
            let items = [...document.querySelectorAll("[print-only]")];
            items.forEach(div => {
                div.removeAttribute("print-only");
            })

            items = [...document.querySelectorAll("[print-remove]")].reverse();
            items.forEach(item => {
                const parentNode = item.parentNode;
                try {
                    parentNode.removeChild(item);
                } catch (e) { console.error(e); }
            });

            let posts = document.querySelectorAll("div.post");
            posts.forEach(post => {
                let footer = post.querySelector("div.post-footer");
                post.removeChild(footer);
                post.appendChild(footer);
            });
        } else if (window.location.pathname && window.location.pathname != "/") {
            document.body.setAttribute("print", "");
            let posts = document.querySelectorAll("div.post");
            let footers = [];
            posts.forEach(post => {
                for (let div = post; div != document.body; div = div.parentNode) {
                    div.setAttribute("print-only", "");
                }
                let footer = post.querySelector("div.post-footer");
                let header = post.querySelector("h1, h2, h3");
                post.removeChild(footer);
                footers.push([post, header, footer]);
            });

            let links = [...document.querySelectorAll("a[href]")];
            links.filter(item => {
                let text = item.innerText.trim(), img = item.querySelector("img, video");
                let href = item.getAttribute("href");
                return text && !img && text.trim() != href;
            }).forEach(item => {
                let parentNode = item.parentNode;
                let text = document.createElement("span");
                text.setAttribute("print-remove", "");
                text.setAttribute("style", "overflow-wrap: anywhere; word-wrap: break-word; word-break: break-all;")
                text.innerText = ' (' + item.getAttribute("href").trim() + ')';
                if (item.nextSibling) {
                    parentNode.insertBefore(text, item.nextSibling);
                } else {
                    parentNode.appendChild(text);
                }
            });

            footers.forEach(([post, header, footer]) => {
                post.insertBefore(footer, header.nextElementSibling);
            });


            setTimeout(() => {
                print();
            }, 500);
        }
    }
    sendResponse({});
});
