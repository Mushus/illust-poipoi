chrome.browserAction.onClicked.addListener(function(tab) {
  // var ls = localStorage;
  // var users = ls.getItem('users');
  // if (users === null || users.length == 0) {
  //   chrome.tabs.create({"url": "./view/option.html"});
  // } else {
    chrome.tabs.create({"url": "./view/uploader.html"});
  // }
});
