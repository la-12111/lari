// Request notification permission when extension loads
chrome.runtime.onInstalled.addListener(() => {
  chrome.permissions.contains(
    { permissions: ["notifications"] },
    (result) => {
      if (!result) {
        chrome.permissions.request({ permissions: ["notifications"] });
      }
    }
  );

  chrome.notifications.getPermissionLevel((permissionLevel) => {
    console.log("Notification permission level:", permissionLevel);
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "take_a_break") {
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "alarm.png",
        title: "Take a Break!",
        message: "Time to rest your eyes and stretch a bit.",
        priority: 2,
        requireInteraction: true,
      },
      (notificationId) => {
        console.log("Notification sent:", notificationId);
        if (chrome.runtime.lastError) {
          console.error("Notification error:", chrome.runtime.lastError);
        }
      }
    );
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === "reset") {
      chrome.alarms.clear("take_a_break", () => {
        if (chrome.runtime.lastError) {
          console.error("Error clearing alarm:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          sendResponse({ success: true });
        }
      });
      return true;
    }

    if (request.time) {
      const minutes = parseInt(request.time);
      if (isNaN(minutes) || minutes <= 0 || minutes > 999) {
        sendResponse({ success: false, error: "Invalid time value" });
        return true;
      }

      createAlarm(minutes);
      sendResponse({ success: true });
    }
  } catch (error) {
    console.error("Error in message handler:", error);
    sendResponse({ success: false, error: error.message });
  }
  return true;
});

function createAlarm(minutes) {
  console.log("Creating alarm for", minutes, "minutes");
  chrome.alarms.clear("take_a_break", () => {
    chrome.alarms.create("take_a_break", {
      delayInMinutes: minutes,
      periodInMinutes: minutes,
    });
    console.log("Alarm created successfully");

    chrome.alarms.get("take_a_break", (alarm) => {
      console.log("Current alarm:", alarm);
    });
  });
}
