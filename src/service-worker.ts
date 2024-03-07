/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

console.log('Service Worker Loaded');   
let userId: string;
chrome.storage.local.get('userId').then((data: any) => userId = data.userId);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getUserId') {
        sendResponse({ userId: userId });
    }
});



async function scrape(url: string): Promise<any> {
    try {
        const response = await fetch('http://localhost:5000/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching scraped data:', error);
        return null;
    }
}
  
  
 
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchData') {
        const { url, bgimglink } = request;

        // Perform actions with the URL and video ID
        console.log('URL:', url);
        console.log('Video ID:', bgimglink);

        scrape(url);

        // Return true to indicate that sendResponse will be called asynchronously
        return true;
    }
});