/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
Fetch the user's info, passing in the access token in the Authorization
HTTP request header.
*/

import { API_KEY, ipinfoToken } from "../env";
import * as ls from "local-storage";

//interface for user info
export interface UserInfo {
    id: string;
    age: string;
    gender: string;
    country: string;
}


const currentYear = new Date().getFullYear();

//get user info from google people api  using the access token from google sign in    
export function getUserInfo(token: string) {
       
      }
// Post user data to the server  
export async function postUserData (userData:UserInfo): Promise<void> {
        try {
            const response = await fetch('https://ad-collector.onrender.com/users', {
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
  
    export async function checkUserExists(id:string) {
        try {
            const response = await fetch('https://ad-collector.onrender.com/users/'+id , {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
           if (response.status==404){
                console.log('user does not exist');
                return false;
           }
           else if(response.status==200){
               console.log('user exists');
               return true;}
        } catch (error) {
            console.error('Error:', error);
        }
    }


