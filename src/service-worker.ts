console.log('Service Worker Loaded');
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import {API_KEY} from '../env.ts'
const apiKey = API_KEY
let loggedin=false;
import * as ls from "local-storage";
import { YoutubeTranscript } from 'youtube-transcript';


console.log('Service Worker Loaded');   
let userId: string;
let adVideoId : string
//inerfaces for the data /////////////////////////////////////// 
interface adinfo{
  id:string;
  advertiser:string;
  advertiser_link:string;
  advertiser_location:string;
  topic:string[];
  brand : any
}
interface transcript{
  ad_id:string;
  transcript:string[];

}
interface VideoData {
  id: string;
  published_at: Date;
  channel_id: string;
  title: string;
  description: string;
  view_count: number;
  made_for_kids: boolean;
  like_count: number;
  comment_count: number;
  topic_categories: string[];
}
interface ChannelData{
  id:string;
  title:string;
  description:string;
  keywords:string;
  country:string;
  view_count:number;
  subscriber_count:number; 
  video_count:number;

}
let proceed = false ; 
// Listen for messages in the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'USER_ID') {
    console.log('User ID received:', message.userId);
    userId = message.userId;

    // After setting userId, send it to the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id !== undefined) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "userId",
          userId: userId,
        });
      }
    });
  }
});



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

      if (AdIdParam && !processedVideoIds.has(AdIdParam) && AdIdParam !== currentVideoId && currentVideoId !== null) {
        processedVideoIds.add(AdIdParam);
        console.log("the video id is an AD id:", AdIdParam);
        proceed = true;
        adVideoId = AdIdParam;

        // Check if we have the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          console.log("I entered the new ad detection");
          console.log("tab[0]",tabs[0],tabs[0].id);
         if (tabs[0] && tabs[0].id !== undefined) {
            console.log("Sending message to tab:", tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "new AdDetected",
              adVideoId: adVideoId,
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error sending message to content script:", chrome.runtime.lastError.message);
              } else {
                console.log("Message sent successfully to content script for ad:", adVideoId);
              }
            });
          } else {
            console.error("No active tab found!");
          }
        });
      }
    }
  },
  { urls: ["<all_urls>"] }
);

chrome.webRequest.onCompleted.addListener(
  function (details) {
    if ((details.url.startsWith("https://www.youtube.com/aboutthisad?pf=web&source=youtube&reasons=")) && (proceed)) {
      collectAd(details.url,adVideoId);
      let subtitles : string[];
      YoutubeTranscript.fetchTranscript(adVideoId).then(transcript => {
        console.log("I entred fetch transcripts");
        // Save the raw transcripts without decoding HTML entities
        subtitles = transcript.map(sub => sub.text);
        console.log("subtitles are",subtitles);
        // Concatenate all subtitles into a single string
        let concatenatedSubtitles = subtitles.join(' ');
        // Encode single quotes '&#39;' entities back to '&#39;'
        concatenatedSubtitles = concatenatedSubtitles.replace(/&amp;#39;/g, "'");
        var transcriptData: transcript = {
          ad_id: adVideoId, // Assuming adVideoId is the adlink
          transcript: subtitles}; // Assuming subtitles is an array of strings representing the transcript
          console.log("transcript data is",transcriptData);
          postTranscript(transcriptData);

      })
      .catch(error => {
      console.error("Error fetching transcript:", error);
      })

      proceed=false
  }},
  { urls: ["<all_urls>"] }
);

// Main function to collect the ad and save it
// Main function to collect the ad and save it
async function collectAd(url: string, adVideoId: string) {
  let ad_id: string;
  let channel_id: string;

  // Define the function to fetch ad details and extract relevant data
  async function fetchAdDetails(url: string, adVideoId: string): Promise<{
    adinfo: adinfo | null;
    googleInfo: string[] | null;
    otherInfo: string[] | null;
  }> {

    try {
      // Fetch the data from the URL
      const response = await fetch(url);
      const data = await response.text();

      let location = 'N/A';
      let topic = ['N/A'];
      let advertiser = 'N/A';
      let advertiserLink = 'N/A';
      let googleInfo = ['N/A'];
      let otherInfo = ['N/A'];
      let brand = 'N/A';
      // Extract advertiser information
      const advertiserMatch = /<div class="ieH75d-fmcmS">([^<]+)<\/div>/g.exec(data);
      if (advertiserMatch) {
        advertiser = advertiserMatch[1].replace(/'&%39;/g, "'");
      }

      const advertiserLinkMatch = /<div class="ZSvcT-uQPRwe-hSRGPd-haAclf">.*?<a href="(.*?)".*?<\/div>/g.exec(data);
      if (advertiserLinkMatch) {
        advertiserLink = advertiserLinkMatch[1];
      }

      // Extract location information
      const locationMatch = /<div class="ieH75d-fmcmS">([^<]+)<\/div>.*?<div class="ieH75d-fmcmS">([^<]+)<\/div>/g.exec(data);
      if (locationMatch) {
        location = locationMatch[2];
      }

      // Extract topic information
      const topicMatch = /<div jscontroller="uAxnV".*?<div class="MDBbYe">(.*?)<\/div>/g.exec(data);
      if (topicMatch) {
        topic = topicMatch[1].includes('&amp;') ? topicMatch[1].split('&amp;') : [topicMatch[1]];
      } else {
        const alternativeTopicMatch = /<div class="PErocb"[^>]*>(.*?)<\/div>/g.exec(data);
        if (alternativeTopicMatch) {
          topic = alternativeTopicMatch[1].includes('&amp;') ? alternativeTopicMatch[1].split('&amp;') : [alternativeTopicMatch[1]];
        }
      }

      // Extract brand information
      const brandMatch = /<div jscontroller="Xsftjc".*?<div class="MDBbYe">(.*?)<\/div>/g.exec(data);
      if (brandMatch) {
        // Convert brand to a string if it's an array
        brand = brandMatch[1].replace(/&amp;/g, ''); // Remove HTML entities
      }


      // Extract Google Information
      const googleInfoRegex = /<div class="QVfAMd-wPzPJb-xPjCTc-ibnC6b"[^>]*>(.*?)<\/div>/g;
      const googleInfoMatches = data.match(googleInfoRegex);
      if (googleInfoMatches) {
        googleInfo = googleInfoMatches.map(div => div.replace(/<\/?[^>]+(>|$)/g, ""));
      }

      // Extract Other Information
      const otherInfoRegex = /<li class="zpMl8e-C2o4Ve-wPzPJb-xPjCTc-ibnC6b"[^>]*>(.*?)<\/li>/g;
      const otherInfoMatches = data.match(otherInfoRegex);
      if (otherInfoMatches) {
        otherInfo = otherInfoMatches.map(li => li.replace(/<\/?[^>]+(>|$)/g, ""));
      }
      console.log("other info",otherInfo);
      // Return the extracted information
      return {
        adinfo: {
          id: adVideoId,
          advertiser,
          brand,
          advertiser_location: location,
          topic,
          advertiser_link: advertiserLink,
        },
        googleInfo,
        otherInfo
      };
    } catch (error) {
      console.error('Error fetching URL:', error);
      return {
        adinfo: null,
        googleInfo: null,
        otherInfo: null
      };
    }
  }

  // Call the fetchAdDetails function and await its result
  const results = await fetchAdDetails(url, adVideoId);

  // Log and process the results
      if (results.adinfo) {
          //post the ad info to the backend
          console.log("ad data",results.adinfo);
          const adreponse=await postAdData(results.adinfo);
          if(adreponse){
              if((adreponse.status===201)||((adreponse.status===202))){
                  if (adreponse.status===202){console.log('Ad already exists in db');}
                  if (adreponse.status===201){console.log('Ad added to db'); }
                  if (currentVideoId) {
                  let videoid =currentVideoId;
                  await fetchVideoDetails(currentVideoId ).then(async videoinfo => {
                      if (videoinfo) {
                          channel_id=videoinfo.channel_id;
                          await fetchChannelDetails(channel_id,videoid).then(async channelinfo => {
                              if (channelinfo) {
                                  //post the channel info to the backend
                                  const channelresponse= await postChannelData(channelinfo);
                                  if(channelresponse){
                                      if(channelresponse.status===202 || channelresponse.status===201){
                                          if (channelresponse.status===202){console.log('Channel already exists in db');}
                                          if (channelresponse.status===201){console.log('Channel added to db');}
                                          const videoreponse=await postVideoData(videoinfo);

                                          if(videoreponse){
                                              if(videoreponse.status===201 || videoreponse.status===202){
                                                  if (videoreponse.status===202){console.log('Video already exists in db');}
                                                  if (videoreponse.status===201){console.log('Video added to db');}
                                                  await postWatchHistory(userId,videoid);
                                                  if(adVideoId && currentVideoId && channel_id && userId && results.googleInfo && results.otherInfo){
                                                      linkAdToUser(adVideoId, videoinfo.id, channel_id, userId ,true,results.googleInfo,results.otherInfo);
                                                      console.log(adVideoId, videoinfo.id, channel_id, userId,results.googleInfo,results.otherInfo);
                                                      console.log('Ad collected');
                                                  }
                                                 
                                                  
                                              }
                                          }
                                          //link the ad to the user
                                         
                                      }
                                  }
                              }
                          });
                          //post the video info to the backend
                          
                         
                      }
                  });
                }
              }
             
          }
      }
      else 
      {console.log(" ad info is null")}
}



// Fetch video details using video Id with the YouTube Data API
async function fetchVideoDetails(videoId: string): Promise<VideoData | null> {
  console.log(" I entered fetch video details");
  const api=`https://youtubescrapingapi.onrender.com/video_data?video_id=${videoId}`
  try {
      //const response = await fetch(apiUrl);
      const response= await fetch(api,{
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }});
      var data = await response.json();
      data=data.video_data
      if (data) {
          if (data.made_for_kids=='N/A'){data.made_for_kids=false}
          data.view_count=convertToBigInt(data.view_count)
          data.like_count=convertToBigInt(data.like_count)
          data.comment_count=convertToBigInt(data.comment_count)
          const videoData: VideoData = {
              id: data.video_id,
              published_at: data.published_at,
              channel_id: data.channel_id,
              title: data.title,
              description: data.description,
              made_for_kids: data.made_for_kids,
              view_count: data.view_count,
              like_count: data.like_count,
              comment_count: data.comment_count,
              topic_categories: data.topic_categories
          };
          console.log("video data",videoData);

          return videoData;
      } else {
          //return error saying no data found
          console.log('No data found');
          return null;
      }
  } catch (error) {
      console.error('Error fetching video details:', error);
      return null;
  }
}
//fetching the channel details using the channel Id with youtube data api
async function fetchChannelDetails(channelId: string,currentVideoId:string): Promise<ChannelData | null> {
  const apiUrl = `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,statistics,brandingSettings&key=${apiKey}`;
  const api=`https://youtubescrapingapi.onrender.com/video_data?video_id=${currentVideoId}`
  try {
      //const response = await fetch(apiUrl);
      const response = await fetch(api);
      var data = await response.json();
      data=data.channel_data
      if (data) {
          // const channelSnippet = data.items[0].snippet;
          // const channelStatistics = data.items[0].statistics;
          // const channelBrandingSettings = data.items[0].brandingSettings;
          // const channelData: ChannelData = {
          //     id: channelId,
          //     title: (channelSnippet.title)?channelSnippet.title : 'N/A',
          //     description: (channelSnippet.description)?channelSnippet.description : 'N/A',
          //     keywords: (channelBrandingSettings.channel && channelBrandingSettings.channel.keywords)?channelBrandingSettings.channel.keywords : 'N/A',
          //     country: (channelSnippet.country)?channelSnippet.country : 'N/A',
          //     view_count: (channelStatistics.viewCount)?channelStatistics.viewCount : Number(0),
          //     video_count: (channelStatistics.videoCount)?channelStatistics.videoCount : Number(0),
          //     subscriber_count: (channelStatistics.subscriberCount)?channelStatistics.subscriberCount : Number(0)
          // };
            data.view_count=convertToBigInt(data.view_count)
            data.video_count=convertToBigInt(data.video_count)
            const channelData: ChannelData = {
              id: data.id,
              title: data.title,
              description: data.description,
              keywords: data.keywords ,
              country: data.country,
              view_count: data.view_count ,
              video_count: data.video_count ,
              subscriber_count: data.subscriber_count 
          };
          console.log("channel data",channelData)
          return channelData;
      } else {
          console.log('No data found');
          return null;
      }
  } catch (error) {
      console.error('Error fetching channel details:', error);
      return null;
  }

}




//saving the data in the database////////////////////////

// Post video data to the backend

async function postChannelData(channelData:ChannelData){
  try {
      const response = await fetch('http://localhost:3000/channel', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(channelData)
      });

      if (response.status!==202 && response.status!==201){ 
          throw new Error('Failed to fetch');
      }

     return response;
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}

async function postVideoData(videoData:VideoData) {
  try {
      const response = await fetch('http://localhost:3000/video', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(videoData)
      });

      if (response.status!==202 && response.status!==201){ 
          throw new Error('Failed to fetch');
      }

      return response;
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}


async function postAdData(adData:adinfo) {
  try {
      const response = await fetch('http://localhost:3000/ad', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(adData)
      });

      if (response.status!==202 && response.status!==201){ 
          throw new Error('Failed to fetch');
      }

      return response;
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}
async function postTranscript(transcriptData :transcript) {
  try {
      const response = await fetch('http://localhost:3000/transcript', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(transcriptData)
      });

      if (response.status !== 201) { 
          throw new Error('Failed to post transcript data');
      }
      console.log("transcript response",response);
      return response.json(); // Return the response body as JSON
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}


function linkAdToUser(ad_id:string,video_id:string,channel_id:string, user_id:string,original:boolean, google_information:string[], other_information:string[]) {
  try {
      fetch('http://localhost:3000/user-ad-video', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ad_id,video_id,channel_id,user_id,original,google_information,other_information})
      });
      console.log("I am linking ad to user succesfully and user id is ",user_id);
  } catch (error) {
      console.error('Error:', error);
  }
}
function convertToBigInt(viewCount: string): number {
  // Remove all non-digit characters
  if (viewCount){
  const numericString = viewCount.replace(/\D/g, ''); 
  return Number(numericString);}
  else return 0
  
}

function postWatchHistory(userId:string,videoId:string): void {
  try {
      fetch('http://localhost:3000/watch-history', {
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
