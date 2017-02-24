var inject = document.createElement("script");
inject.src = chrome.extension.getURL("index.js");
(document.head||document.documentElement).appendChild(inject);
