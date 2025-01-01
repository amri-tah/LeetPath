chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getUserToken') {
    chrome.storage.local.get(['userToken'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving token from extension storage:', chrome.runtime.lastError);
        sendResponse({ status: 'error', message: 'Failed to retrieve token' });
        return;
      }

      const token = result.userToken;
      if (token) {
        console.log('Token retrieved from extension storage:', token);
        sendResponse({ status: 'success', token });
      } else {
        console.log('No token found in extension storage');
        sendResponse({ status: 'error', message: 'No token found' });
      }
    });
    return true; 
  }
});
