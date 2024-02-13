/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
console.log('Service Worker Loaded');   




// Listen for network requests
chrome.webRequest.onCompleted.addListener(
  function(details) {
    // Check if the URL starts with the specified pattern
    if (details.url.startsWith("https://www.youtube.com/aboutthisad?")) {
      console.log("Request completed: ", details);
      //add url to local storage 
      chrome.storage.local.set({url: details.url});
      
      console.log(chrome.storage.local.get('url'));
      
      // Send message to content script
   
    }
  },
  {urls: ["https://www.youtube.com/aboutthisad?*"]}, // Adjust the URL pattern here
  ["responseHeaders"]
);
function logStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, area: string) {
  console.log(`Change in storage area: ${area}`);

  const changedItems = Object.keys(changes);

  for (const item of changedItems) {
    console.log(`${item} has changed:`);
    console.log("Old value: ", changes[item].oldValue);
    console.log("New value: ", changes[item].newValue);
  }
}

chrome.storage.onChanged.addListener(logStorageChange);