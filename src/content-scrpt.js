/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { API_KEY } from '../env.ts';
const apiKey = API_KEY;
console.log('Content script loaded.');
// Check if the current website is YouTube
function isYouTube() {
    return window.location.hostname.includes('youtube.com');
}
// Check if a video is playing
function isVideoPlaying() {
    const videoElement = document.querySelector('video');
    return videoElement !== null && !videoElement.paused;
}
// Get the video ID from the YouTube URL
function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}
// Fetch video details using the YouTube Data API
async function fetchVideoDetails(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const videoDetails = data.items[0].snippet;
            console.log('Video Title:', videoDetails.title);
            console.log('Video Description:', videoDetails.description);
        }
        else {
            console.log('Unable to fetch video details.');
        }
    }
    catch (error) {
        console.error('Error fetching video details:', error);
    }
}
// Main function to check and retrieve information
function checkYouTubeVideo() {
    if (isYouTube() && isVideoPlaying()) {
        const videoId = getVideoId();
        if (videoId) {
            console.log('YouTube video is playing. Video ID:', videoId);
            fetchVideoDetails(videoId);
        }
        else {
            console.log('Unable to retrieve video ID.');
        }
    }
    else {
        console.log('No YouTube video is currently playing.');
    }
}
// Run the initial check
checkYouTubeVideo();
// Observe changes in the document, and run the check only when relevant changes occur
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        // Check for changes to the video element or its attributes
        if (mutation.type === 'attributes' &&
            mutation.target instanceof Element &&
            mutation.target.tagName.toLowerCase() === 'video') {
            checkYouTubeVideo();
            break;
        }
    }
});
// Specify the target node and the configuration options for the observer
const config = { attributes: true, attributeFilter: ['src'], childList: true, subtree: true };
// Start observing the target node for configured mutations
observer.observe(document.body, config);
