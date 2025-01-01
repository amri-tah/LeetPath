const getTokenFromWebStorage = () => {
  const token = localStorage.getItem('userToken'); 
  console.log('Retrieved token from web page localStorage:', token);
  return token;
};
const saveTokenToExtensionStorage = (token) => {
  chrome.storage.local.set({ userToken: token }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to save token to extension local storage:', chrome.runtime.lastError);
    } else {
      console.log('Token saved to extension localStorage');
    }
  });
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getAndStoreToken') {
    const token = getTokenFromWebStorage();
    if (token) {
      saveTokenToExtensionStorage(token); 
      sendResponse({ status: 'success', token });
    } else {
      console.error("Token not found in web page's localStorage");
      sendResponse({ status: 'error', message: 'Token not found' });
    }
    return true;
  }
});
