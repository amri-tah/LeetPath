chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "storeToken" && message.token) {
    chrome.storage.local.set({ userToken: message.token }, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to save token:", chrome.runtime.lastError);
        sendResponse({ status: "error", message: "Failed to save token" });
      } else {
        console.log("Token saved to extension storage:", message.token);
        sendResponse({ status: "success" });
      }
    });
    return true;
  }

  if (message.action === "getUserToken") {
    chrome.storage.local.get(["userToken"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving token:", chrome.runtime.lastError);
        sendResponse({ status: "error", message: "Failed to retrieve token" });
        return;
      }

      const token = result.userToken;
      if (token) {
        console.log("Token retrieved from extension storage:", token);
        sendResponse({ status: "success", token: token });
      } else {
        console.log("No token found in extension storage");
        sendResponse({ status: "error", message: "No token found" });
      }
    });
    return true;
  }
});
