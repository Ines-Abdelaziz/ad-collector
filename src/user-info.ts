/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
Fetch the user's info, passing in the access token in the Authorization
HTTP request header.
*/

import { API_KEY, ipinfoToken } from "../env";
import * as ls from "local-storage";

//interface for user info
interface UserInfo {
    id: string;
    age: string;
    gender: string;
    country: string;
}

//get user country from adress ip 
async function getCountryFromIP(): Promise<string> {
    try {
        const response = await fetch(`https://ipinfo.io/json?token=${ipinfoToken}`);
        const jsonResponse = await response.json();
        return jsonResponse.country;
    } catch (error) {
        console.error('Error fetching country:', error);
        return 'N/A'; // Or handle the error according to your requirement
    }
}


const currentYear = new Date().getFullYear();

//get user info from google people api  using the access token from google sign in    
export function getUserInfo(token: string) {
        const init = {
          method: 'GET',
          async: true,
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          'contentType': 'json'};
        
       
        fetch(
            `https://people.googleapis.com/v1/people/me?alt=json&personFields=birthdays,genders,Addresses,metadata&key=${API_KEY}&access_token=${token}`,
            init)
            .then((response) => response.json())
            .then(async function(data) {
                ls.set('userId',  data.metadata.sources[0].id);
                const userInfo: UserInfo = {
                    id: data.metadata.sources[0].id,
                     // You may want to consider if token hashing is the appropriate way to generate user IDs
                    age: (
                        data.birthdays && 
                        data.birthdays.length > 0 && 
                        data.birthdays[0].date && 
                        data.birthdays[0].date.year
                    ) ? (currentYear - data.birthdays[0].date.year).toString() : 'N/A', // Provide default value if data is not available
                    gender: (
                        data.genders && 
                        data.genders.length > 0 && 
                        data.genders[0].formattedValue
                    ) ? data.genders[0].formattedValue : 'N/A', // Provide default value if data is not available
                    country: (
                        data.addresses && 
                        data.addresses.length > 0 && 
                        data.addresses[0].country
                    ) ? data.addresses[0].country :await getCountryFromIP()  // Provide default value if data is not available
                };
       
                
                postUserData(userInfo);
            });
      }
// Post user data to the server  
async function postUserData (userData:UserInfo): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
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
  
export function getUserId() {
    return ls.get<string>('userId');
}


