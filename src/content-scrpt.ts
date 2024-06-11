/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { set } from 'local-storage';
import {API_KEY} from '../env.ts'
import * as he from 'he';
const apiKey = API_KEY
let loggedin=false;
let userId:string = 'N/A';

console.log('Content script loaded.');

chrome.runtime.sendMessage({ action: "getUserId" }).then((response) => {
    userId = response.userId;
    console.log(userId);
    if (userId!=='N/A'){
        loggedin=true;
        console.log(loggedin);
    }
 });

//inerfaces for the data /////////////////////////////////////// 
interface adinfo{
    adlink:string;
    advertiser:string;
    advertiser_link:string;
    advertiser_location:string;
    topic:string[];
    google_information:string[];
    other_information:string[];

}
interface transcript{
    adlink:string;
    transcript:string[];

}
interface VideoData {
    video_id: string;
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
function observeDOMForIframe(adVideoId: string, className: string, state: { collected: boolean }) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.target.nodeName === 'IFRAME' && mutation.target instanceof HTMLIFrameElement) {
                const iframe = mutation.target as HTMLIFrameElement;
                if (iframe.className == className) {
                    checkIframeSrc(iframe, adVideoId, observer, state);
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
}

function checkIframeSrc(iframe: HTMLIFrameElement, adVideoId: string, observer: MutationObserver, state: { collected: boolean }) {
    const iframeSrc = iframe.src;
    if (iframeSrc && iframeSrc !== 'about:blank') {
        const regex = /https:\/\/www\.youtube\.com\/aboutthisad\?pf=web.*?theme=/i;
        const match = iframeSrc.match(regex);

        if (match) {
            let adurl = match[0];
            // Replace URL-encoded characters with their corresponding characters
            adurl = adurl.replace(/\\u0026/g, '&');

            // Call your functions to fetch and collect ad details
            collectAd(adurl, adVideoId);
            state.collected = true;
            observer.disconnect(); // Stop observing once the URL is collected
        } else {
            console.log('No match found for the specified pattern.');
        }
    }
}

function checkAndClickAdButton(adVideoId: string) {
    const state = { collected: false };
    const adButton = document.querySelector<HTMLElement>('.ytp-ad-button.ytp-ad-button-link.ytp-ad-clickable[aria-label="My Ad Center"]');

    if (adButton) {  // Check if the button is visible
        adButton.addEventListener('click', (event) => {
            console.log("Ad button clicked");
            const popupContainer = document.querySelector('ytd-popup-container') as HTMLElement;
            const display = popupContainer.style.display;
            // Check if the click is made by the script (screen coordinates 0, 0)
            if (event.screenX === 0 && event.screenY === 0) {
                if (popupContainer) {
                    popupContainer.style.display = 'none';
                }
                observeDOMForIframe(adVideoId, 'style-scope yt-about-this-ad-renderer', state); // Start observing the DOM for iframe right after clicking the ad button

                const playButton = document.querySelector<HTMLElement>('.ytp-play-button.ytp-button[title*="Play (k)"]');
                if (playButton) {
                    playButton.click();
                }
            } else {
                popupContainer.style.display = display;
            }
        });
        setTimeout(() => {
            adButton.click();
        }, 1000);
        if (!state.collected) {
            adButton.click();

        }
    }
}


// Function to handle new ad detection
function handleNewAd(adVideoId: string, subtitles: string) {
    console.log(`Processing ad video ID: ${adVideoId} with subtitles: ${subtitles}`);
    checkAndClickAdButton(adVideoId);
}

// Listen for new ad detection messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "newAdDetected") {
        const adVideoId = message.adVideoId;
        const subtitles = message.sub;

        console.log("New ad detected:");
        console.log("Video ID:", adVideoId);
        console.log("Subtitles:", subtitles);
        var transcriptData: transcript = {
            adlink: adVideoId, // Assuming adVideoId is the adlink
            transcript: subtitles // Assuming subtitles is an array of strings representing the transcript
        };
        postTranscript(transcriptData);
        handleNewAd(adVideoId, subtitles);
    }
});


  

/////////////////////////////////////////////////////////
//Main function to collect the ad and  save it////
async function collectAd(adurl: string,adVideoId:string ){

    //get  the ad info
    let ad_id : number;
    let channel_id:string;
    const user_id=userId;
    
    await fetchAdDetails(adurl,adVideoId).then(async adinfo => {
        if (adinfo) {
            console.log(adinfo);
            //post the ad info to the backend
            const adreponse=await postAdData(adinfo);
            if(adreponse){
                if(adreponse.status===202 || adreponse.status===201){
                    if (adreponse.status===202){console.log('Ad already exists in db');}
                    if (adreponse.status===201){console.log('Ad added to db');}
                    //ad already exists in db
                    const ad= await adreponse.json();
                    ad_id=ad.ad_id;
                    var video_id=getVideoId();
                    const updatedVideoId = video_id;
                    sendUpdatedVideoIdToBackground(updatedVideoId);
                  
                    await fetchVideoDetails(video_id as string).then(async videoinfo => {
                        if (videoinfo) {
                            console.log(videoinfo);
                            channel_id=videoinfo.channel_id;
                            await fetchChannelDetails(channel_id).then(async channelinfo => {
                                if (channelinfo) {
                                    console.log(channelinfo);
                                    //post the channel info to the backend
                                    console.log(channelinfo); 
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
                                                    console.log(ad_id, video_id, channel_id, user_id);
                                                    if(ad_id && video_id && channel_id && user_id){


                                                        linkAdToUser(ad_id, video_id, channel_id, user_id );
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
    });
    
    
       

}
/////////////////////////////////////////////////////////
//fetchig the data////////////////////////////////////////

//fetching the ad details from the ad url using scraping 
function fetchAdDetails(url: string,adVideoId:string): Promise<adinfo|null> {
    return fetch(url)
        .then(response => response.text())
        .then(data => {
            let location;
            let topic;
            let advertiser;
            let advertiserlink;
            // Extract advertiser information
            const advertiserMatch = /<div class="ieH75d-fmcmS">([^<]+)<\/div>/g.exec(data);
            if (advertiserMatch){advertiser = advertiserMatch[1];  advertiser = advertiser.replace(/'&%39;/g, "'");}else {advertiser= 'N/A';}
            const advertiserlinkMatch = /<div class="ZSvcT-uQPRwe-hSRGPd-haAclf">.*?<a href="(.*?)".*?<\/div>/g.exec(data);
            if (advertiserlinkMatch){
                advertiserlink = advertiserlinkMatch[1];
                const url = advertiserlink+'&format=VIDEO';
                //scrape(url,adVideoId)
            
            
            }else {advertiserlink= 'N/A';}
            const locationMatch = /<div class="ieH75d-fmcmS">([^<]+)<\/div>.*?<div class="ieH75d-fmcmS">([^<]+)<\/div>/g.exec(data);
            if (locationMatch){location = locationMatch[2];}else {location= 'N/A';}
            // Extract topic information
            const topicMatch = /<div class="MDBbYe"[^>]*>(.*?)<\/div>/g.exec(data);
            if (topicMatch){
                if(topicMatch[1].includes('&amp;')){
                    topic = topicMatch[1].split('&amp;');
                }else{
                    topic = [topicMatch[1]];
                }
            }else {topic= ['N/A'];}
        
            let googleinfo;
            let otherinfo;
            //extract the info used to target the ad
            const yourGoogleInfoRegex = /<div class="QVfAMd-wPzPJb-xPjCTc-ibnC6b"[^>]*>(.*?)<\/div>/g;
            const yourGoogleInfoMatch = data.match(yourGoogleInfoRegex);
            if (yourGoogleInfoMatch) {
                 googleinfo = yourGoogleInfoMatch.map(div => div.replace(/<\/?[^>]+(>|$)/g, ""));
            }else{ googleinfo= ['N/A']; }
            const otherInfoRegex = /<li class="zpMl8e-C2o4Ve-wPzPJb-xPjCTc-ibnC6b"[^>]*>(.*?)<\/li>/g;
            const otherInfoMatch = data.match(otherInfoRegex);
            if (otherInfoMatch) {
                otherinfo = otherInfoMatch.map(div => div.replace(/<\/?[^>]+(>|$)/g, ""));
            }else{ otherinfo= ['N/A']; }

            const adinfo: adinfo = {
                adlink: adVideoId,
                advertiser: advertiser,
                advertiser_link: advertiserlink,
                advertiser_location: location,
                topic: topic,
                google_information: googleinfo,
                other_information: otherinfo
            };
            console.log(adinfo);

            return adinfo;
            

        })
        .catch(error => {
            console.error('Error fetching URL:', error);
            return null;
        });
}

// Fetch video details using video Id with the YouTube Data API
async function fetchVideoDetails(videoId: string): Promise<VideoData | null> {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,status,statistics,topicDetails&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.items && data.items.length > 0) {

            const videosnippet = data.items[0].snippet;
          
            const videoStatus = data.items[0].status;
            const videoStatistics = data.items[0].statistics;
            const videoTopicDetails = data.items[0].topicDetails;
            const published_at= (videosnippet.publishedAt)?videosnippet.publishedAt : 'N/A';
            const channelId = (videosnippet.channelId)?videosnippet.channelId : 'N/A';
            const title = (videosnippet.title)?videosnippet.title : 'N/A';
            const description = (videosnippet.description)?videosnippet.description : 'N/A';
           
            const made_for_kids = (videoStatus.madeForKids)?videoStatus.madeForKids : false;
            const view_count = (videoStatistics.viewCount)?videoStatistics.viewCount : Number(0);
            const like_count = (videoStatistics.likeCount)?videoStatistics.likeCount : Number(0);
            const comment_count = (videoStatistics.commentCount)?videoStatistics.commentCount : Number(0);
            const topic_categories = (videoTopicDetails.topicCategories)?videoTopicDetails.topicCategories : ['N/A'];
            const videoData: VideoData = {
                video_id: videoId,
                published_at: published_at,
                channel_id: channelId,
                title: title,
                description: description,
                made_for_kids: made_for_kids,
                view_count: view_count,
                like_count: like_count,
                comment_count: comment_count,
                topic_categories: topic_categories
            };
           
           
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
async function fetchChannelDetails(channelId: string): Promise<ChannelData | null> {
    const apiUrl = `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,statistics,brandingSettings&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const channelSnippet = data.items[0].snippet;
            const channelStatistics = data.items[0].statistics;
            const channelBrandingSettings = data.items[0].brandingSettings;
            const channelData: ChannelData = {
                id: channelId,
                title: (channelSnippet.title)?channelSnippet.title : 'N/A',
                description: (channelSnippet.description)?channelSnippet.description : 'N/A',
                keywords: (channelBrandingSettings.channel && channelBrandingSettings.channel.keywords)?channelBrandingSettings.channel.keywords : 'N/A',
                country: (channelSnippet.country)?channelSnippet.country : 'N/A',
                view_count: (channelStatistics.viewCount)?channelStatistics.viewCount : Number(0),
                video_count: (channelStatistics.videoCount)?channelStatistics.videoCount : Number(0),
                subscriber_count: (channelStatistics.subscriberCount)?channelStatistics.subscriberCount : Number(0)
            };
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



async function scrape(url: string, adVideoId: string): Promise<void> {
        const bgimglink='https://i.ytimg.com/vi/'+adVideoId+'/maxresdefault.jpg'
        chrome.runtime.sendMessage({ action: 'fetchData',url:url,bgimglink:bgimglink }, response => {
        console.log('Data received:', response);
        });
   
       
    
}
/////////////////////////////////////////////////////////

//saving the data in the database////////////////////////

// Post video data to the backend
async function postVideoData(videoData: VideoData): Promise<Response |null> {
    try {
        const response = await fetch('https://ad-collector.onrender.com/videos', {
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
// Post channel data to the backend
async function postChannelData(channelData: ChannelData): Promise<Response|null> {
    try {
        const response = await fetch('https://ad-collector.onrender.com/channels', {
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

//post ad data to the backend
async function postAdData(adData: adinfo): Promise<Response |null> {
    try {
        const response = await fetch('https://ad-collector.onrender.com/ad', {
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

async function postTranscript(transcriptData : transcript) {
    try {
        const response = await fetch('https://ad-collector.onrender.com/transcripts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transcriptData)
        });

        if (response.status !== 201) { 
            throw new Error('Failed to post transcript data');
        }

        return response.json(); // Return the response body as JSON
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}



//link ad with user 
function linkAdToUser(ad_id:number,video_id:string,channel_id:string, user_id:string): void {
    try {
        fetch('https://ad-collector.onrender.com/user-ad-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ad_id:ad_id,video_id:video_id,channel_id:channel_id,user_id:user_id})
        });

    } catch (error) {
        console.error('Error:', error);
    }
}
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
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
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
