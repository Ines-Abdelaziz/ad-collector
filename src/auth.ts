/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient, User } from "@supabase/supabase-js";
import {API_KEY, SUPABASE_KEY,SUPABASE_URL,googleClientId} from '../env.ts'
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* exported getAccessToken */

const REDIRECT_URL = chrome.identity.getRedirectURL();
const CLIENT_ID = "852662586348-50t7sehl92p5m9vkb97rnggbcp5pvvgh.apps.googleusercontent.com";
const SCOPES = ["openid", "email", "profile",'https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/user.birthday.read','https://www.googleapis.com/auth/user.gender.read'];
const AUTH_URL =
`https://accounts.google.com/o/oauth2/auth\
?client_id=${CLIENT_ID}\
&response_type=token\
&redirect_uri=${encodeURIComponent(REDIRECT_URL)}\
&scope=${encodeURIComponent(SCOPES.join(' '))}`;
const VALIDATION_BASE_URL="https://www.googleapis.com/oauth2/v3/tokeninfo";

function extractAccessToken(redirectUri:string) {
  const m = redirectUri.match(/[#?](.*)/);
  if (!m || m.length < 1)
    return null;
  const params = new URLSearchParams(m[1].split("#")[0]);
  return params.get("access_token");
}

/**
Validate the token contained in redirectURL.
This follows essentially the process here:
https://developers.google.com/identity/protocols/OAuth2UserAgent#tokeninfo-validation
- make a GET request to the validation URL, including the access token
- if the response is 200, and contains an "aud" property, and that property
matches the clientID, then the response is valid
- otherwise it is not valid

Note that the Google page talks about an "audience" property, but in fact
it seems to be "aud".
*/
export async function validate(redirectURL: string) {
  const accessToken = extractAccessToken(redirectURL);
  if (!accessToken) {
    throw "Authorization failure";
  }
  const validationURL = `${VALIDATION_BASE_URL}?access_token=${accessToken}`;
  const validationRequest = new Request(validationURL, {
    method: "GET"
  });

 function checkResponse(response: Response) {
    return new Promise((resolve, reject) => {
      if (response.status != 200) {
        reject("Token validation error");
      }
      response.json().then((json) => {
        if (json.aud && (json.aud === CLIENT_ID)) {
          resolve(accessToken);
        } else {
          reject("Token validation error");
        }
      });
    });
  }

   return fetch(validationRequest).then(checkResponse);
}

/**
Authenticate and authorize using browser.identity.launchWebAuthFlow().
If successful, this resolves with a redirectURL string that contains
an access token.
*/
export function authorize() {
  return chrome.identity.launchWebAuthFlow({
    interactive: true,
    url: AUTH_URL
  });
}
      //convert promise<string to string typescript

export async function checkForAccessToken(): Promise<string> {
  const url = await chrome.identity.launchWebAuthFlow({
    interactive: false,
    url: AUTH_URL
  });
  const accessToken = extractAccessToken(url!);
  return accessToken as string;
}

export function getAccessToken() {
  return authorize().then((redirectURL: string | undefined) => validate(redirectURL!));
}
export async function Signout(token:string) {
  chrome.identity.launchWebAuthFlow(
    { 'url': 'https://accounts.google.com/logout' }
);
    
  


}



    // const { data, error } = await supabase.auth.signInWithOAuth({
    //   provider: 'google',
    //   options: {
    //     redirectTo: chrome.identity.getRedirectURL(),
    //   },
    // });
    // if (error) throw error;
    // await chrome.tabs.create({ url: data.url });

