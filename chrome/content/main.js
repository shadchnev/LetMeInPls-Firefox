var cache = [];

function init() {
  dumpn("starting LetMeInPls!");
  if (typeof(JSON) == "undefined") {  
    Components.utils.import("resource://gre/modules/JSON.jsm");  
    JSON.parse = JSON.fromString;  
    JSON.stringify = JSON.toString;  
  }
  IH$ = jQuery.noConflict(true);		
  var appcontent = document.getElementById("appcontent"); 
  if (appcontent) {
    appcontent.addEventListener("DOMContentLoaded", onDOMLoad, true); 
  }
  var container = gBrowser.tabContainer;
  container.addEventListener("TabSelect", onTabSelected, false);
}

function dumpn(str) {
  var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
  aConsoleService.logStringMessage(str + "\n");
  dump(str + "\n");
}

function onDOMLoad(event) {
  if (!triggeredByTab(event)) // and not by iframe
    return;
  handleUrlChange();
}

function triggeredByTab(event) {
  var url = event.originalTarget.location.href;
  var num = gBrowser.browsers.length;
  for (var i = 0; i < num; i++) {
    var b = gBrowser.getBrowserAtIndex(i);
    try {
      if (b.currentURI.spec == url) {
        return true;
      }
    } catch(e) {
      Components.utils.reportError(e);
    }    
  }
  return false;
}


function onTabSelected(event) {
  dumpn('tab switched');
  handleUrlChange();
}


function uninit() {
  var appcontent = document.getElementById("appcontent"); 
  if (appcontent)
    appcontent.removeEventListener("DOMContentLoaded", onDOMLoad, true);  
    var container = gBrowser.tabContainer;
    container.removeEventListener("TabSelect", onTabSelected, false);   
}


function simpleNotification(text) {
  removeNotification();
  var notificationBox = gBrowser.getNotificationBox();    
  const priority = notificationBox.PRIORITY_INFO_HIGH;
  notificationBox.appendNotification(text, 
                                     "letmeinpls",
                                     null,
                                     priority, 
                                     null);	
}

function removeNotification() {
  var notification = gBrowser.getNotificationBox().getNotificationWithValue('letmeinpls');
  if (notification == undefined) {
    return;
  } else {
    gBrowser.getNotificationBox().removeNotification(notification);
  }
}

function handleUrlChange() {
  var address = gBrowser.selectedTab.linkedBrowser.currentURI.spec;
  if (cache[address] == undefined)    
    IH$.getJSON('http://localhost:3000/sites/search',  
        {url: address},
        function(data) { accountsQueryCallback(data, address); });          
  else
    showAccount(address);
}

function accountsQueryCallback(data, address) {
  cache[address] = data;
  showAccount(address);
}

function showAccount(address) {
  simpleNotification('Let Me In, Please! Login: ' + cache[address][0][0] + ', password: ' + cache[address][0][1]);
}