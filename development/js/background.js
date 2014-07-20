var extension_id = "nlapmchppjchhlogaaonmpeomchiplje";
var extension_url = "chrome-extension://"+extension_id+"/views/index.html";
chrome.browserAction.onClicked.addListener(function(a) {
    chrome.tabs.create({ url : extension_url });
});