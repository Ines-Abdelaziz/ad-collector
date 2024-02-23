/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
console.log('Service Worker Loaded');   





// function logStorageChange(changes: { [key: string]: chrome.storage.StorageChange }, area: string) {
//   console.log(`Change in storage area: ${area}`);

//   const changedItems = Object.keys(changes);

//   for (const item of changedItems) {
//     console.log(`${item} has changed:`);
//     console.log("Old value: ", changes[item].oldValue);
//     console.log("New value: ", changes[item].newValue);
//   }
// }

// chrome.storage.onChanged.addListener(logStorageChange);