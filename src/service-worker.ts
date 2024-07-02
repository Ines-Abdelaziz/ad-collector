console.log('Service Worker Loaded');
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

console.log('Service Worker Loaded');   
let userId: string;
chrome.storage.local.get('userId').then((data: any) => userId = data.userId);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getUserId') {
        console.log('User ID1:', userId);
        sendResponse({ userId: userId });
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.userId) {
        console.log('User ID:', message.userId);
    }
});

import { YoutubeTranscript } from 'youtube-transcript';
let currentVideoId: string | null = null;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateVideoId") {
    currentVideoId = message.updatedVideoId;
  }
});

const processedVideoIds = new Set();
function decodeHtmlEntities(encodedString: string): string {
  const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      // Add more entities as needed
  };


  return   encodedString.replace(/&#39;/g, "'")  ;
}

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if (details.url.startsWith("https://www.youtube.com/ptracking?html5=1&video_id=")) {
      const urlParams = new URLSearchParams(new URL(details.url).search);
      const AdIdParam = urlParams.get('video_id');
      let subtitles: string[] = [];
      console.log("found a network call of new video id");

      if (AdIdParam && !processedVideoIds.has(AdIdParam) && AdIdParam !== currentVideoId && currentVideoId !== null) {
        processedVideoIds.add(AdIdParam);
        console.log("the video id is an AD id:", AdIdParam);
        console.log("subtitles are : ")

        YoutubeTranscript.fetchTranscript(AdIdParam).then(transcript => {
            // Save the raw transcripts without decoding HTML entities
            subtitles = transcript.map(sub => sub.text);

            // Concatenate all subtitles into a single string
            let concatenatedSubtitles = subtitles.join(' ');

            // Encode single quotes '&#39;' entities back to '&#39;'
            concatenatedSubtitles = concatenatedSubtitles.replace(/&amp;#39;/g, "'");
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].id !== undefined) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "newAdDetected",
                adVideoId: AdIdParam,
                sub: subtitles
              });
            }
          })
        }).catch(error => {
          console.error("Error fetching transcript:", error);
          // Still send the message with empty values
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].id !== undefined) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "newAdDetected",
                adVideoId: AdIdParam,
                sub: []
              });
            }
          });
        });
      }
    }
  },
  { urls: ["<all_urls>"] }
);
