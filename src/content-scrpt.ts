/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {API_KEY} from '../env.ts'
const apiKey = API_KEY
let userId:string = 'N/A';
console.log('Content script loaded.');
chrome.runtime.sendMessage({ action: "getUserId" }).then((response) => {
    userId = response.userId;
    console.log(userId);
});
//inerfaces for the data ///////////////////////////////////////
interface adinfo{
    advertiser:string;
    advertiser_link:string;
    advertiser_location:string;
    topic:string[];
    google_information:string[];
    other_information:string[];

}
interface VideoData {
    video_id: string;
    published_at: Date;
    channel_id: string;
    title: string;
    description: string;
    region_restriction_allowed: string[];
    region_restriction_blocked: string[];
    //france rating
    cnc_rating: string;
    csa_rating: string;
    //british rating
    bbfc_rating: string;
    //switzerland rating
    chfilm_rating: string;
    //belguim rating
    cicf_rating: string;
    //germany rating
    fsk_rating: string;
    //spain rating
    icaa_rating: string;
    //italy rating
    mibac_rating: string;
    //canadian rating
    catv_rating: string;
    catvfr_rating: string;
    chvrs_rating: string;
    //usa rating
    mpaa_rating: string;
    mpaat_rating: string;
    //youtube rating
    yt_rating: string;
    made_for_kids: boolean;
    view_count: number;
    like_count: number;
    dislike_count: number;
    favorite_count: number;
    comment_count: number;
    topic_categories: string[];
}
interface ChannelData{
    id:string;
    title:string;
    description:string;
    keywords:string;
    topic_categories:string[];
    made_for_kids:boolean;
    default_language:string;
    country:string;
    view_count:number;
    subscriber_count:number;
    video_count:number;

}

/////////////////////////////////////////////////////////
// MutationObserver to detect ad popups//////////////////
//this function detects the ad then simulates a click on the ad center button, hides the popup and gets the ad url

// Callback function to handle mutations in the DOM
function handleMutations(mutationsList: any[], observer: any) {
    mutationsList.forEach((mutation: {
        addedNodes: any; target: { nodeType: number; classList: { contains: (arg0: string) => any; }; }; type: any; oldValue: any; 
}) => {
      // Check if mutation concerns an element node and if it has the class "ytp-ad-module"
      if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE && mutation.target.classList.contains('ytp-ad-module')) {
     
            let collected= false;
            let adurl;
            //check if the ad center button is present
            if (document.querySelector('[aria-label="My Ad Center"]')) {
                const adButton = document.querySelector('[aria-label="My Ad Center"]') as HTMLElement;
                if (adButton) {
                   
                    adButton.addEventListener('click', (event) => {
                        //check if the click is made by the script not the user
                        if(event.screenX === 0 && event.screenY === 0){                       
                        const popupContainer = document.querySelector('ytd-popup-container') as HTMLElement;
                        //check if the popup container is present
                        if (popupContainer) {
                            popupContainer.style.display = 'none';
                            //add timeout to wait for iframe to load
                            setTimeout(() => {
                                const iframe = document.getElementById('iframe') as HTMLElement;
                                if (iframe) {
                                    //get the ad url
                                    adurl= iframe.getAttribute('src');
                                    //make sure the ad url is not null and not about:blank 
                                    if (adurl!==null && adurl!=='about:blank'){
                                        //collect the ad
                                        collected=true;
                                        collectAd(adurl);
                                    }
                                   
                                } else {
                                    adButton.click();
                                }
                            }, 3000);
                           
                        }else{
                            adButton.click();}
                        if(!collected){
                            adButton.click();
                        }
                        
                   
                    }
                }
                     
                    );
                    adButton.click();
                }
                
            }

            collected=false;

          }
    // if mutation concerns an element node being added
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Iterate over the added nodes
        mutation.addedNodes.forEach((node: Node) => {
            //check if the added node is an element and if it matches the tp-yt-iron-overlay-backdrop
          if (node instanceof HTMLElement && node.matches('tp-yt-iron-overlay-backdrop')) {
                // remove the dark overlay of the popup that we stopped
                const element = node as HTMLElement;
                element.remove();
               
            }
        });
    }}
    
    );
  }
  

  // Configuration for the MutationObserver
  const config = { attributes: true, childList: true, subtree: true, characterData: true };
  
  // Create a MutationObserver instance
  const observer = new MutationObserver(handleMutations);
  
  // Start observing the entire DOM
  observer.observe(document.documentElement, config);
  

/////////////////////////////////////////////////////////
//Main function to collect the ad and  save it////
async function collectAd(adurl: string ){

    //get  the ad info
    let ad_id : number;
    let channel_id:string;
    const user_id=userId;
    
    await fetchAdDetails(adurl).then(async adinfo => {
        if (adinfo) {
            //post the ad info to the backend
            const adreponse=await postAdData(adinfo);
            if(adreponse){
                if(adreponse.status===202 || adreponse.status===201){
                    if (adreponse.status===202){console.log('Ad already exists in db');}
                    if (adreponse.status===201){console.log('Ad added to db');}
                    //ad already exists in db
                    const ad= await adreponse.json();
                    ad_id=ad.ad_id;
                    const video_id=getVideoId();
                    await fetchVideoDetails(video_id as string).then(async videoinfo => {
                        if (videoinfo) {
                            channel_id=videoinfo.channel_id;
                            await fetchChannelDetails(channel_id).then(async channelinfo => {
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
function fetchAdDetails(url: string): Promise<adinfo|null> {
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
            if (advertiserlinkMatch){advertiserlink = advertiserlinkMatch[1];}else {advertiserlink= 'N/A';}
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
                advertiser: advertiser,
                advertiser_link: advertiserlink,
                advertiser_location: location,
                topic: topic,
                google_information: googleinfo,
                other_information: otherinfo
            };

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
            const videocontentDetails = data.items[0].contentDetails;
            const videocontentRating = data.items[0].contentDetails.contentRating;
            const videoStatus = data.items[0].status;
            const videoStatistics = data.items[0].statistics;
            const videoTopicDetails = data.items[0].topicDetails;
            const published_at= (videosnippet.publishedAt)?videosnippet.publishedAt : 'N/A';
            const channelId = (videosnippet.channelId)?videosnippet.channelId : 'N/A';
            const title = (videosnippet.title)?videosnippet.title : 'N/A';
            const description = (videosnippet.description)?videosnippet.description : 'N/A';
            const region_restriction_allowed = (videocontentDetails.regionRestriction && videocontentDetails.regionRestriction.allowed)?videocontentDetails.regionRestriction.allowed : ['N/A'];
            const region_restriction_blocked = (videocontentDetails.regionRestriction && videocontentDetails.regionRestriction.blocked)?videocontentDetails.regionRestriction.blocked : ['N/A'];
            const cnc_rating = (videocontentRating && videocontentRating.cncRating)?videocontentRating.cncRating : 'N/A';
            const csa_rating = (videocontentRating && videocontentRating.csaRating)?videocontentRating.csaRating : 'N/A';
            const bbfc_rating = (videocontentRating && videocontentRating.bbfcRating)?videocontentRating.bbfcRating : 'N/A';
            const chfilm_rating = (videocontentRating && videocontentRating.chfilmRating)?videocontentRating.chfilmRating : 'N/A';
            const cicf_rating = (videocontentRating && videocontentRating.cicfRating)?videocontentRating.cicfRating : 'N/A';
            const fsk_rating = (videocontentRating && videocontentRating.fskRating)?videocontentRating.fskRating : 'N/A';
            const icaa_rating = (videocontentRating && videocontentRating.icaaRating)?videocontentRating.icaaRating : 'N/A';
            const mibac_rating = (videocontentRating && videocontentRating.mibacRating)?videocontentRating.mibacRating : 'N/A';
            const catv_rating = (videocontentRating && videocontentRating.catvRating)?videocontentRating.catvRating : 'N/A';
            const catvfr_rating = (videocontentRating && videocontentRating.catvfrRating)?videocontentRating.catvfrRating : 'N/A';
            const chvrs_rating = (videocontentRating && videocontentRating.chvrsRating)?videocontentRating.chvrsRating : 'N/A';
            const mpaa_rating = (videocontentRating && videocontentRating.mpaaRating)?videocontentRating.mpaaRating : 'N/A';
            const mpaat_rating = (videocontentRating && videocontentRating.mpaatRating)?videocontentRating.mpaatRating : 'N/A';
            const yt_rating = (videocontentRating && videocontentRating.ytRating)?videocontentRating.ytRating : 'N/A';
            const made_for_kids = (videoStatus.madeForKids)?videoStatus.madeForKids : false;
            const view_count = (videoStatistics.viewCount)?videoStatistics.viewCount : Number(0);
            const like_count = (videoStatistics.likeCount)?videoStatistics.likeCount : Number(0);
            const dislike_count = (videoStatistics.dislikeCount)?videoStatistics.dislikeCount : Number(0);
            const favorite_count = (videoStatistics.favoriteCount)?videoStatistics.favoriteCount : Number(0);
            const comment_count = (videoStatistics.commentCount)?videoStatistics.commentCount : Number(0);
            const topic_categories = (videoTopicDetails.topicCategories)?videoTopicDetails.topicCategories : ['N/A'];
            const videoData: VideoData = {
                video_id: videoId,
                published_at: published_at,
                channel_id: channelId,
                title: title,
                description: description,
                region_restriction_allowed: region_restriction_allowed,
                region_restriction_blocked: region_restriction_blocked,
                cnc_rating: cnc_rating,
                csa_rating: csa_rating,
                yt_rating: yt_rating,
                bbfc_rating: bbfc_rating,
                chfilm_rating: chfilm_rating,
                cicf_rating: cicf_rating,
                fsk_rating: fsk_rating,
                icaa_rating: icaa_rating,
                mibac_rating: mibac_rating,
                catv_rating: catv_rating,
                catvfr_rating: catvfr_rating,
                chvrs_rating: chvrs_rating,
                mpaa_rating: mpaa_rating,
                mpaat_rating: mpaat_rating,
                made_for_kids: made_for_kids,
                view_count: view_count,
                like_count: like_count,
                dislike_count: dislike_count,
                favorite_count: favorite_count,
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
                topic_categories: (channelSnippet.topicCategories)?channelSnippet.topicCategories : ['N/A'],
                made_for_kids: (channelBrandingSettings.channel && channelBrandingSettings.channel.madeForKids)?channelBrandingSettings.channel.madeForKids : false,
                default_language: (channelBrandingSettings.channel && channelBrandingSettings.channel.defaultLanguage)?channelBrandingSettings.channel.defaultLanguage : 'N/A',
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


/////////////////////////////////////////////////////////
// Get the video ID from the YouTube URL
function getVideoId(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

//send message to background script to get the user id










