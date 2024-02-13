/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState,useEffect } from 'react';
import './App.css';
import Logo from './assets/logo.png';
import { getAccessToken,Signout,checkForAccessToken  } from "./auth";
import { getUserInfo } from './user-info';
function App() {
  const [session,setSession] = useState(null);
 

  useEffect(() => {
    async function checkSession() {
      const accessToken = await checkForAccessToken();
      console.log(accessToken);
      
      setSession(accessToken as any)
    }
    checkSession();
    
    
     
    }, []);
  async function handleLoginClick() {
      //get the data of this promise 
     const accessToken = await getAccessToken();
     setSession(accessToken as any);
     getUserInfo(accessToken as any);
      
  }
  function handleDashboardClick() {
    // Navigate to dashboard or perform relevant action
    console.log("Redirecting to user dashboard...");
  }
  async function handleSignoutClick() {
    const { session } = await chrome.storage.local.get('session');
    Signout(session);
    setSession(null);
  }

  return (
    <>
      <div>
        <img src={Logo} className="logo" alt="Logo" />
      </div>
      <div className="card">
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
            <button id='google' onClick={handleLoginClick}>Log in with Google</button>
            
          </>
        )}
      </div>
    </>
  );
}

export default App;
