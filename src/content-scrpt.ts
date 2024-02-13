/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {API_KEY,SUPABASE_KEY,SUPABASE_URL} from '../env.ts'


const apiKey = API_KEY

console.log('Content script loaded.');


// Check if the current website is YouTube
function isYouTube(): boolean {
        return window.location.hostname.includes('youtube.com');
}

// Check if a video is playing
function isVideoPlaying(): boolean {
    const videoElement = document.querySelector('video');
    return videoElement !== null && !videoElement.paused;
}

// Get the video ID from the YouTube URL
function getVideoId(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

// Fetch video details using the YouTube Data API
async function fetchVideoDetails(videoId: string): Promise<void> {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const videoDetails = data.items[0].snippet;
            console.log('Video Title:', videoDetails.title);
            console.log('Video Description:', videoDetails.description);
        } else {
            console.log('Unable to fetch video details.');
        }
    } catch (error) {
        console.error('Error fetching video details:', error);
    }
}

// Main function to check and retrieve information
function checkYouTubeVideo(): void {
    if (isYouTube() && isVideoPlaying()) {
        const videoId = getVideoId();

        if (videoId) {
            console.log('YouTube video is playing. Video ID:', videoId);
           fetchVideoDetails(videoId);
        } else {
            console.log('Unable to retrieve video ID.');
        }
    } else {
        console.log('No YouTube video is currently playing.');
    }
}

function isAdDisplaying(): boolean {
    const adElement = document.querySelector('.ytp-ad-player-overlay');
    if (adElement !== null) {
        console.log('An ad is currently displaying.');
    }
    return adElement !== null;
}
console.log('ad',isAdDisplaying());
// Run the initial check
function simulateButtonClick(button: HTMLButtonElement) {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    button.dispatchEvent(event);
  }
  let adIsCurrentlyDisplaying = isAdDisplaying();
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // Process each mutation (addedNodes, removedNodes, etc.)
        if (!adIsCurrentlyDisplaying && isAdDisplaying()) {
            adIsCurrentlyDisplaying = true;
            console.log('An ad is currently displaying.');

            // Simulate click on ad button but hidden in the background
            const adButton = document.querySelector('.ytp-ad-button.ytp-ad-button-link.ytp-ad-clickable') as HTMLButtonElement;
            simulateButtonClick(adButton);
            adIsCurrentlyDisplaying = false;
        } else if (adIsCurrentlyDisplaying && !isAdDisplaying()) {
            adIsCurrentlyDisplaying = false;
            console.log('No ad is currently displaying.');
        }
    });
});
  
  // Configuration of the observer:
  const config = { attributes: true, childList: true, subtree: true };
  
  // Select the target node you want to observe
  const targetNode = document.body;
  
  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);


// // Observe changes in the document, and run the check only when relevant changes occur
// const observer = new MutationObserver((mutations) => {
//     for (const mutation of mutations) {
//         // Check for changes to the video element or its attributes
       
//             isAdDisplaying();
//             break;
        
//     }
// });

// // Specify the target node and the configuration options for the observer
// const config = { childList: true, subtree: true };

// // Start observing the target node for configured mutations
// observer.observe(document.body, config);
