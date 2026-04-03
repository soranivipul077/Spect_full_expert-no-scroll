const countBox = document.getElementById("countBox");
const scrollBtn = document.getElementById("scrollToggleBtn");
let totalPages = 0;

/* Load saved state */
chrome.storage.local.get(["scrollEnabled"], (res) => {
  const enabled = res.scrollEnabled !== false;
  updateScrollBtn(enabled);
});

/* Toggle click */
scrollBtn.onclick = async () => {
  chrome.storage.local.get(["scrollEnabled"], (res) => {
    const enabled = res.scrollEnabled !== false;
    const newState = !enabled;

    chrome.storage.local.set({ scrollEnabled: newState }, () => {
      updateScrollBtn(newState);
      //applyScrollState(newState);
    });
  });
};

function updateScrollBtn(enabled) {
  scrollBtn.textContent = enabled ? " Scroll: ON" : " Scroll: OFF";
}

function refreshCount() {
  chrome.storage.local.get(["rows"], (res) => {
    const count = res.rows ? res.rows.length : 0;
    countBox.textContent = `Collected Rows: ${count}`;
  });
}

async function runScript(file) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [file],
  });
}




/* 🔹 On popup open */
refreshCount();

/* 🔹 Collect */
document.getElementById("collectBtn").onclick = () => {
  runScript("content.js");

  // little delay then refresh
  setTimeout(refreshCount, 800);
};

/* 🔹 Export */
document.getElementById("exportBtn").onclick = () => {
  runScript("export.js");
};

/* 🔹 Clear */
document.getElementById("clearBtn").onclick = () => {
  chrome.storage.local.clear(() => {
    refreshCount();
    alert(" All stored data cleared");
  });
};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "REFRESH_COUNT") {
    refreshCount();
  }
});

document.getElementById("expandBtn").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["expand-grid.js"],
  });
};

document.getElementById("autoallpage").onclick = async () => {

    runScript("autonext.js");

   

};
