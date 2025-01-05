//getting token form the chrome local storage
const getTokenFromWebpageLocalStorage = () => {
  const token = localStorage.getItem("userToken");
  console.log("Token from webpage localStorage:", token);
  return token;
};
//sending the token to background.js script
const sendTokenToBackgroundScript = (token) => {                                        
  chrome.runtime.sendMessage({ action: "storeToken", token: token }, (response) => {
    if (response.status === "success") {
      console.log("Token successfully saved to extension storage");
    } else {
      console.error("Failed to save token to extension storage");
    }
  });
};
const token = getTokenFromWebpageLocalStorage();
if (token) {
  sendTokenToBackgroundScript(token);
} else {
  console.error("No token found in webpage localStorage");
}
