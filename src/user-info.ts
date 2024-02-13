/**
Fetch the user's info, passing in the access token in the Authorization
HTTP request header.
*/

import { API_KEY } from "../env";

/* exported getUserInfo */

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
            `https://people.googleapis.com/v1/people/me?alt=json&personFields=birthdays&key=${API_KEY}&access_token=${token}`,
            init)
            .then((response) => response.json())
            .then(function(data) {
              console.log(data)
            });
      }
      
  
  