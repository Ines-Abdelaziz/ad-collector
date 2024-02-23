/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {API_KEY} from '../env.ts'


const apiKey = API_KEY

console.log('Content script loaded.');

interface VideoData {
    video_id: string;
    published_at: Date;
    channel_id: string;
    title: string;
    description: string;
    region_restriction_allowed: string[];
    region_restriction_blocked: string[];
    cnc_rating: string;
    csa_rating: string;
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
async function postVideoData(videoData: VideoData): Promise<void> {
    try {
        const response = await fetch('https://ad-collector.onrender.com/videos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoData)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch');
        }

        const responseData = await response.json();
        console.log('Response:', responseData);
    } catch (error) {
        console.error('Error:', error);
    }
}
async function postChannelData(channelData: ChannelData): Promise<void> {
    try {
        const response = await fetch('https://ad-collector.onrender.com/channels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(channelData)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch');
        }

        const responseData = await response.json();
        console.log('Response:', responseData);
    } catch (error) {
        console.error('Error:', error);
    }
}
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
            console.log('Channel Data:', channelData);
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
// Fetch video details using the YouTube Data API
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
                made_for_kids: made_for_kids,
                view_count: view_count,
                like_count: like_count,
                dislike_count: dislike_count,
                favorite_count: favorite_count,
                comment_count: comment_count,
                topic_categories: topic_categories
            };
           
            const channelData = await fetchChannelDetails(channelId);
            if (channelData) {
                console.log('Channel Data found and need to be posted');
                 await postChannelData(channelData);
                 
            }
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

// Main function to check and retrieve information
async function checkYouTubeVideo(): Promise<void> {
    if (isYouTube() && isVideoPlaying()) {
        const videoId = getVideoId();

        if (videoId) {
            console.log('YouTube video is playing. Video ID:', videoId);
            const videoData = await fetchVideoDetails(videoId); // Await the fetchVideoDetails function call
            //if videoData is not null then post the data
            if (videoData) {
               await postVideoData(videoData);
            } else {
                console.log('Unable to post video .');
            }
        } else {
            console.log('No YouTube video is currently playing.');
        }
}
}


// Run the initial check

// Observe changes in the document, and run the check only when relevant changes occur
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        // Check for changes to the video element or its attributes
        if (
            mutation.type === 'attributes' &&
            mutation.target instanceof Element &&
            mutation.target.tagName.toLowerCase() === 'video'
        ) {
            checkYouTubeVideo();
            break;
        }
    }
});

// Specify the target node and the configuration options for the observer
const config = { attributes: true, attributeFilter: ['src'], childList: true, subtree: true };

// Start observing the target node for configured mutations
observer.observe(document.body, config);


