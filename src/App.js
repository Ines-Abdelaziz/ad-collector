import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// App.tsx
import './App.css';
import Logo from './assets/logo.png';
import { loginWithGoogle } from './auth';
function App() {
    async function checklocalstorage() {
        await chrome.storage.local.get(null).then((result) => {
            console.log(JSON.stringify(result));
        });
    }
    checklocalstorage();
    return (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsx("img", { src: Logo, className: "logo" }) }), _jsx("div", { className: "card", children: _jsxs(_Fragment, { children: [_jsx("h2", { children: "Video Ad Research Extension" }), _jsx("p", { children: "Log in with Google to get started." }), _jsx("button", { id: 'google', onClick: loginWithGoogle, children: "Log in with Google" })] }) })] }));
}
export default App;
