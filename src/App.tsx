/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState,useEffect, } from 'react';
import { Link } from 'react-router-dom';
import * as ls from "local-storage";
//import './App.css';
//import Logo from './assets/logo.png';
import Logo from './Logo/logo.svg';
import LogoDark from './Logo/logo-dark.svg';
import { getAccessToken,Signout  } from "./auth";
import { checkUserExists,postUserData ,UserInfo} from './user-info';
import axios from 'axios';
import { access } from 'fs';
import Select from "react-select";
import CheckboxOne from './CheckboxOne';
import { userInfo } from 'os';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false); // Track if user is new
  const [country, setCountry] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [isChecked, setIsChecked] = useState(false);


  // Handle form submission
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    chrome.storage.local.get('userId', async function (result) {
      const userId = result.userId;
      const UserInfo: UserInfo = {
        id: userId,
        age: String(age),
        gender,
        country
      };
      console.log(UserInfo);
      await postUserData(UserInfo);
      setIsLoggedIn(true);
      setIsNewUser(false);
    }
     );   

  };


  async function handleLoginClick() {
    setIsLoggedIn(true);
    let accessToken ='' ;
    let userId='';
    chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
      if (token) {
        accessToken = token;
        chrome.storage.local.set({accessToken: accessToken});

        console.log('Access token:', accessToken);
      } else {
        console.error('Failed to retrieve access token');
      }
    });
    chrome.identity.getProfileUserInfo(async function(userInfo) {
      userId=userInfo.id;
      console.log('User Id:', userId);
      chrome.storage.local.set({userId: userId});
      if (await checkUserExists(userId)){
        setIsNewUser(false);
      }
      else{
        setIsNewUser(true);
      }
    });
      
  }
  let accessToken = '';
  chrome.storage.local.get('accessToken', function (result) {
    accessToken = result.accessToken;
  });


  


  useEffect(() => {
   
    chrome.storage.local.get('accessToken', function (result) {
      setIsLoggedIn(!!result.accessToken);
    });
    console.log('accessToken:',accessToken);
     
     

      
  }, [accessToken]);

  // function handleDashboardClick() {
  //  //get user info and redirect to dashboard
  //  console.log('Dashboard clicked');
  //  const userId=ls.get<string>('userId');
  //  const accessToken=ls.get<string>('accessToken');

  //  const authresponse={token:accessToken,userId:userId};
   
  //  console.log(authresponse);
  //  redirectDashboard(authresponse);
 
  // }
  // interface AuthResponse{
  //   token: string;
  //   userId: string;
  // }
//     async function redirectDashboard(authresponse:AuthResponse) {
//         //post request to the server to get the user dashboard
//         //https://adcollector-youtube-dashboard-1.onrender.com
//         axios.post('https://ad-collector.onrender.com/user/authenticate', { token: authresponse.token, userId: authresponse.userId })
//         .then(function (response) {
//             console.log(response);
//             if (response.data) {
//                 window.open(`https://adcollector-youtube-dashboard.onrender.com/${userId}`, '_blank');
//             }
//         }).catch(function (error) {
//                 console.log(error);
//                 });
        
// }


  async function handleSignoutClick() {
    chrome.identity.getAuthToken({ 'interactive': false }, function (token) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
  
      if (token) {
        // Revoke token from Google servers
        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
          .then(() => {
            console.log('Token revoked');
            chrome.identity.removeCachedAuthToken({ token: token }, function () {
              console.log('Cached token removed');
              chrome.identity.clearAllCachedAuthTokens(() => {
                console.log('All cached tokens cleared');
              });
            });
          })
          .catch((error) => console.error('Error revoking token:', error));
      }
    });
    chrome.storage.local.remove('accessToken', function () {
      console.log('Token removed from storage');
    });
    chrome.storage.local.remove('userId', function () {
      console.log('userId removed from storage');
    });
    setIsLoggedIn(false);

  }

  if (isNewUser) {
    // Render the signup page if the user is new
    return (
      <form onSubmit={handleSubmit}>

      <div className='  rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark" '>
     <div className="flex flex-wrap items-center">
     <div className=" w-full xl:block ">
            <div className="py-17.5 px-20 text-center">
              <div className=" w-70 inline-block">
                <img className="hidden dark:block" src={Logo} alt="Logo" />
                <img className="  dark:hidden" src={LogoDark} alt="Logo" />
              </div>
              <div className='text-title-sm font-bold m-4'>Join Our Research Study</div>
            
              <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white text-left">
    Your Country
  </label> 
  <div
    className="relative z-20 bg-white dark:bg-form-input"
  >
   
    <span className="absolute left-4 top-1/2 z-30 -translate-y-1/2">
      <svg
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.0007 2.50065C5.85852 2.50065 2.50065 5.85852 2.50065 10.0007C2.50065 14.1428 5.85852 17.5007 10.0007 17.5007C14.1428 17.5007 17.5007 14.1428 17.5007 10.0007C17.5007 5.85852 14.1428 2.50065 10.0007 2.50065ZM0.833984 10.0007C0.833984 4.93804 4.93804 0.833984 10.0007 0.833984C15.0633 0.833984 19.1673 4.93804 19.1673 10.0007C19.1673 15.0633 15.0633 19.1673 10.0007 19.1673C4.93804 19.1673 0.833984 15.0633 0.833984 10.0007Z"
            fill="#637381"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.833984 9.99935C0.833984 9.53911 1.20708 9.16602 1.66732 9.16602H18.334C18.7942 9.16602 19.1673 9.53911 19.1673 9.99935C19.1673 10.4596 18.7942 10.8327 18.334 10.8327H1.66732C1.20708 10.8327 0.833984 10.4596 0.833984 9.99935Z"
            fill="#637381"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.50084 10.0008C7.55796 12.5632 8.4392 15.0301 10.0006 17.0418C11.5621 15.0301 12.4433 12.5632 12.5005 10.0008C12.4433 7.43845 11.5621 4.97153 10.0007 2.95982C8.4392 4.97153 7.55796 7.43845 7.50084 10.0008ZM10.0007 1.66749L9.38536 1.10547C7.16473 3.53658 5.90275 6.69153 5.83417 9.98346C5.83392 9.99503 5.83392 10.0066 5.83417 10.0182C5.90275 13.3101 7.16473 16.4651 9.38536 18.8962C9.54325 19.069 9.76655 19.1675 10.0007 19.1675C10.2348 19.1675 10.4581 19.069 10.6159 18.8962C12.8366 16.4651 14.0986 13.3101 14.1671 10.0182C14.1674 10.0066 14.1674 9.99503 14.1671 9.98346C14.0986 6.69153 12.8366 3.53658 10.6159 1.10547L10.0007 1.66749Z"
            fill="#637381"
          />
        </g>
      </svg>
    </span>
    <select    
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white" >
      
  <option value="" disabled className="text-body">Select Country</option>
  <option value="USA" className="text-body">USA</option>
  <option value="France" className="text-body">France</option>
  <option value="Canada" className="text-body">Canada</option>
    </select>
    <span className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
            fill="#637381"
          />
        </g>
      </svg>
    </span>
  </div>

</div>
<div>
  <label className="my-3 block text-sm font-medium text-black dark:text-white text-left">
    Your Gender
  </label>
  <div
    x-data="{ isOptionSelected: false }"
    className="relative z-20 bg-white dark:bg-form-input"
  >
    <select 
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 pl-5 pr-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
  <option value="" disabled className="text-body">Select Gender</option>
  <option value="female" className="text-body">Female</option>
  <option value="male" className="text-body">Male</option>
    </select>
    <span className="absolute right-4 top-1/2 z-20 -translate-y-1/2">
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
            fill="#637381"
          />
        </g>
      </svg>
    </span>
  </div>
</div>
<div>
  <div>
  <label className="my-3 block text-sm font-medium text-black dark:text-white text-left">
    Your Age
  </label>
  <input
    value={age}
    onChange={(e) => setAge(e.target.value)}
    type="number"
    placeholder="Enter your age"
    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:bg-form-input dark:text-white"
  />
</div>

</div>
<div className='mt-5'>
<CheckboxOne 
    checked={isChecked}
    onChange={(checked) => setIsChecked(checked)}
  />
</div>
<div className='my-5'>
<button
  type="submit"
  disabled={!isChecked}
  className={`w-full rounded-lg border p-4 font-medium text-white transition ${
    isChecked 
      ? "cursor-pointer border-primary bg-primary hover:bg-opacity-90"
      : "cursor-not-allowed border-gray-300 bg-gray-300 dark:bg-gray-700"
  }`}
>
  Create Account </button>

</div>




              

              </div>
              </div>
    </div>
    </div>
    </form>
    );
  }


  return (
    <>
     <div className='  rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark" '>
     <div className="flex flex-wrap items-center">
          <div className=" w-full xl:block ">
            <div className="py-17.5 px-20 text-center">
              <div className=" w-70 inline-block">
                <img className="hidden dark:block" src={Logo} alt="Logo" />
                <img className="  dark:hidden" src={LogoDark} alt="Logo" />
              </div>
              < p className='text-base py-10 w-full'>
              Ads Collector is a research tool that Collects and analyzes YouTube ads to understand their targeting strategies.<br />
              All data collected is anonymized and used solely for research purposes.
              </p>
              {isLoggedIn ? (
                <>
          
                <button className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90" >View Dashboard</button>
                {/* <button className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90" onClick={handleDashboardClick}>View Dashboard</button> */}

                <div className=" text-sm mt-6 text-center">
                  <p>
                  {/* <button    className="text-primary"> Sign Out </button> */}
                  <button onClick={handleSignoutClick}   className="text-primary"> Sign Out </button>

                  </p>
                </div>
                </>
                ) : (
                    <>
            
              <button onClick={handleLoginClick} className="flex w-full items-center justify-center gap-3.5 rounded-lg border border-stroke bg-gray p-3 hover:bg-opacity-50 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-opacity-50">
                  <span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_191_13499)">
                        <path
                          d="M19.999 10.2217C20.0111 9.53428 19.9387 8.84788 19.7834 8.17737H10.2031V11.8884H15.8266C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.9986 13.2661 19.9986 10.2217"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.2055 19.9999C12.9605 19.9999 15.2734 19.111 16.9629 17.5777L13.7429 15.1331C12.8813 15.7221 11.7248 16.1333 10.2055 16.1333C8.91513 16.1259 7.65991 15.7205 6.61791 14.9745C5.57592 14.2286 4.80007 13.1801 4.40044 11.9777L4.28085 11.9877L1.13101 14.3765L1.08984 14.4887C1.93817 16.1456 3.24007 17.5386 4.84997 18.5118C6.45987 19.4851 8.31429 20.0004 10.2059 19.9999"
                          fill="#34A853"
                        />
                        <path
                          d="M4.39899 11.9777C4.1758 11.3411 4.06063 10.673 4.05807 9.99996C4.06218 9.32799 4.1731 8.66075 4.38684 8.02225L4.38115 7.88968L1.19269 5.4624L1.0884 5.51101C0.372763 6.90343 0 8.4408 0 9.99987C0 11.5589 0.372763 13.0963 1.0884 14.4887L4.39899 11.9777Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M10.2059 3.86663C11.668 3.84438 13.0822 4.37803 14.1515 5.35558L17.0313 2.59996C15.1843 0.901848 12.7383 -0.0298855 10.2059 -3.6784e-05C8.31431 -0.000477834 6.4599 0.514732 4.85001 1.48798C3.24011 2.46124 1.9382 3.85416 1.08984 5.51101L4.38946 8.02225C4.79303 6.82005 5.57145 5.77231 6.61498 5.02675C7.65851 4.28118 8.9145 3.87541 10.2059 3.86663Z"
                          fill="#EB4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_191_13499">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  Sign in with Google
                </button>
                <div className=" text-sm mt-6 text-center">
                  <p>
                    Check the   
                    <span  className="text-primary"> Privacy Policy </span>
                  </p>
                </div>
                </>
                )}
            </div>
          </div>
    </div>
    </div>
    </>
  );
}

const CountrySelect = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState<{ label: string; value: string } | null>(null);

  useEffect(() => {
    fetch(
      "https://valid.layercode.workers.dev/list/countries?format=select&flags=true&value=code"
    )
      .then((response) => response.json())
      .then((data) => {
        setCountries(data.countries);
        setSelectedCountry(data.userSelectValue || null);
      });
  }, []);
  return (
    <Select
      options={countries}
      value={selectedCountry}
      onChange={(selectedOption) => setSelectedCountry(selectedOption)}
    />
  );
};
export default App;
{/* <div >
{session ? (
 <>
   <h2>Welcome User!</h2>
   <p>This extension collects the ads that are shown to you for research purposes.</p>
   <button onClick={handleDashboardClick}>View Dashboard</button>
   <button onClick={handleSignoutClick}>Sign out</button>
 </>
) : (
 <>

   <h2>Video Ad Research Extension</h2>
   <p>Log in with Google to get started.</p>
   <div className="flex justify-center items-center m-5">

   <button className="inline-flex  items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"  onClick={handleLoginClick}>Log in with Google</button>
   </div>
 </>
)} 
</div> */}


