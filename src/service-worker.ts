/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

console.log('Service Worker Loaded');   
let userId:string;
chrome.storage.local.get('userId').then((data:any)=>userId=data.userId);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getUserId') {
      sendResponse({ userId: userId });
    }
  });