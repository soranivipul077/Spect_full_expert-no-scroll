(async function () {
  const pageRows = [];
  let headers = [];

  /* 🔹 HEADERS (read but not forced) */
  const headerCells = document.querySelectorAll(".ag-header-cell-text");
  headers = [...headerCells].map((h) => h.innerText.trim()).filter(Boolean);

  /* 🔹 COLLECT VISIBLE ROWS */
  function collectVisibleRows() {
    document
      .querySelectorAll(".ag-center-cols-container .ag-row")
      .forEach((row) => {
        const cells = [...row.querySelectorAll(".ag-cell-value")].map((c) =>
          c.innerText.trim(),
        );

         if (!cells.length) return;

        const key = cells.join("|");

        if (!pageRows.has(key)) {
          pageRows.set(key, cells); // ✅ only page duplicate remove
        }
      });
  }

  /* 🔹 AUTO SCROLL */
  const viewport = document.querySelector(".ag-body-viewport");
  if (!viewport) {
    alert("AG-Grid viewport not found");
    return;
  }

  let lastScrollTop = -1;

  while (true) {
    collectVisibleRows();

    viewport.scrollTop += 800; // fast scroll
    await new Promise((r) => setTimeout(r, 120));

    if (viewport.scrollTop === lastScrollTop) break;
    lastScrollTop = viewport.scrollTop;
  }

  if (!pageRows.length) {
    alert("No data collected on this page");
    return;
  }

  /* 🔹 SAVE TO STORAGE (AS-IS) */
  chrome.storage.local.get(["headers", "rows"], (res) => {
    const allRows = res.rows || [];
    const storedHeaders = res.headers || headers;

    pageRows.forEach((r) => {
      allRows.push(r); // ✅ ALWAYS push
    });

    chrome.storage.local.set({ headers: storedHeaders, rows: allRows }, () => {
      alert(
        `✅ Page collected\n` +
          `This page: ${pageRows.length}\n` +
          `Total stored: ${allRows.length}`,
      );
    });
  });
})();

chrome.runtime.sendMessage({ type: "REFRESH_COUNT" });
