chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {type: "toggle"});
});

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
