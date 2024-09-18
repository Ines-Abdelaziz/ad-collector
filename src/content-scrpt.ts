/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { set } from 'local-storage';
import {API_KEY} from '../env.ts'
const apiKey = API_KEY
let loggedin=false;
import * as ls from "local-storage";
import { YoutubeTranscript } from 'youtube-transcript';

// //profile 
// let loggedin=true;
let userId : string ;
// content_script.js

console.log('Content script loaded 2');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Content received message:', message);
  if (message.action === "userId") {
    console.log('Received userId from background script:', message.userId);
    userId=message.userId
    // Handle the userId as needed
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "newAdDetected") {
        console.log("new ad detected")
        const adButton = document.querySelector<HTMLElement>('.ytp-ad-button.ytp-ad-button-link.ytp-ad-clickable[aria-label="My Ad Center"]');
        console.log("ad button", adButton);
        
        if (adButton) {
            // Click the ad button
            adButton.click();
            const iframe = document.querySelector<HTMLIFrameElement>('iframe[src*="aboutthisad"]');
                    const popupContainer = document.querySelector<HTMLElement>('ytd-popup-container');
                    
                    if (iframe) {
                        // Hide the iframe or the popup container when it's detected
                        iframe.style.display = 'none';
                        console.log("Ad iframe hidden");
                    }

                    if (popupContainer) {
                        // Hide the popup container
                        popupContainer.style.display = 'none';
                        console.log("Popup container hidden");
                    }
            // Optional: Click the play button to continue video after ad
            const playButton = document.querySelector<HTMLElement>('.ytp-play-button.ytp-button[title*="Play (k)"]');
            if (playButton) {
                playButton.click();
            }

        }
    }
});



/////////////////////////////////////////////////////////



function incrementVideoCount(userId:string): void {
    try {
        fetch('https://ad-collector.onrender.com/increment-watch-count', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userId:userId})
        });

    } catch (error) {
        console.error('Error:', error);
    }
}
function postWatchHistory(userId:string,videoId:string): void {
    try {
        fetch('https://ad-collector.onrender.com/watch-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user_id:userId,video_id:videoId})
        });

    } catch (error) {
        console.error('Error:', error);
    }
}


// Content script

//// Function to get video ID from the YouTube URL
function getVideoId(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    return videoId ? videoId : null;
}


// Function to send the updated video ID to the background script
function sendUpdatedVideoIdToBackground(video_id: string | null) {
  
        chrome.runtime.sendMessage({
            action: "updateVideoId",
            updatedVideoId: video_id // Ensure property name matches the one expected by the background script
        });
    
}


// Function to update the video ID and send it to the background script whenever it changes
function updateAndSendVideoId() {
    const video_id = getVideoId();
    sendUpdatedVideoIdToBackground(video_id);
}
let url='';
const observer = new MutationObserver(async (mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
        if (loggedin){
            //check location href if its a youtube video 
            
            if (window.location.href.includes('youtube.com/watch') && url!==window.location.href){ 
            url=window.location.href;
            await incrementVideoCount(userId);
            await postWatchHistory(userId,getVideoId() as string);



            }}}
        if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
            const targetElement = mutation.target as HTMLAnchorElement;
            if (targetElement.href) {
                updateAndSendVideoId();
            }
            // Break to avoid redundant updates
            break;
        }
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Iterate over the added nodes
            mutation.addedNodes.forEach((node: Node) => {
                // Check if the added node is an element and if it matches the tp-yt-iron-overlay-backdrop
                if (node instanceof HTMLElement && node.matches('tp-yt-iron-overlay-backdrop')) {
                    // Remove the dark overlay of the popup
                    const element = node as HTMLElement;
                    element.remove();
                }
            });
        }
    }
});

// Start observing mutations on the document

observer.observe(document, { attributes: true, childList: true, subtree: true, attributeFilter: ['href'] });
// Initial sending of the video ID when the content script is loaded
updateAndSendVideoId();

function convertToBigInt(viewCount: string): number {
    // Remove all non-digit characters
    if (viewCount){
    const numericString = viewCount.replace(/\D/g, ''); 
    return Number(numericString);}
    else return 0
    
}