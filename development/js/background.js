chrome.browserAction.onClicked.addListener(function(a) {
    chrome.tabs.create({url: "views/index.html"});
});