chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {type: "toggle"});
});

handler = (info) => {
    if (info.tabId) {
        chrome.tabs.get(info.tabId, (tab) => {
            let match = (tab.url || "").match(/https:\/\/((.+\.reddit.com)|(xkcd.com)\/)/);
            let icon = match ? "icon48.png" : "icon48-bw.png";
            chrome.action.setIcon({path: icon, tabId: info.tabId});
        });
    }
};

chrome.tabs.onActivated.addListener(handler);
chrome.tabs.onUpdated.addListener(handler);

// this does not seem to work
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.disable();
  
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        let rule1 = {
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostSuffix: '.reddit.com', schemes: ["https"]},
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostSuffix: 'xkcd.com', schemes: ["https"]},
                })
            ],
            actions: [new chrome.declarativeContent.ShowAction()],
        };
        chrome.declarativeContent.onPageChanged.addRules([rule1]);
    });
});
