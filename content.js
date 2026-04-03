(async function () {

  chrome.storage.local.get(["scrollEnabled", "headers", "rows"], async res => {

    const scrollEnabled = res.scrollEnabled !== false; // default ON
    const pageRows = [];
    const allRows = res.rows || [];
    let headers = res.headers || [];

    /* 🔹 READ HEADERS (only once if empty) */
    if (!headers.length) {
      const headerCells = document.querySelectorAll('.ag-header-cell-text');
      headers = [...headerCells].map(h => h.innerText.trim()).filter(Boolean);
    }


    /* 🔹 COLLECT VISIBLE ROWS */
    function collectVisibleRows(removeDuplicate) {
      document.querySelectorAll('.ag-center-cols-container .ag-row').forEach(row => {
        const cells = [...row.querySelectorAll('.ag-cell-value')]
          .map(c => c.innerText.trim());

        if (!cells.length) return;

        if (removeDuplicate) {
          const key = cells.join("|");
          if (!pageRows.some(r => r.join("|") === key)) {
            pageRows.push(cells);
          }
        } else {
          pageRows.push(cells); // raw
        }
      });
    }


    

    /* 🔹 AUTO SCROLL MODE */
    if (scrollEnabled) {
      const viewport = document.querySelector('.ag-body-viewport');
      if (!viewport) {
        alert("AG-Grid viewport not found");
        return;
      }

      let lastScrollTop = -1;

      while (true) {
        collectVisibleRows(true); // duplicate REMOVE

        viewport.scrollTop += 1200;
        await new Promise(r => setTimeout(r, 120));

        if (viewport.scrollTop === lastScrollTop) break;
        lastScrollTop = viewport.scrollTop;
      }

    } else {
      /* 🔴 NO SCROLL MODE */
      collectVisibleRows(false); // duplicate OFF
    }

    if (!pageRows.length) {
      alert("No data collected");
      return;
    }

    /* 🔹 SAVE TO STORAGE */
    pageRows.forEach(r => {
      allRows.push(r);
    });






    chrome.storage.local.set(
      { headers, rows: allRows },
      () => {
        alert(
          ` Data Collected\n` +
          `Mode: ${scrollEnabled ? "AUTO SCROLL (Unique)" : "VISIBLE ONLY (Raw)"}\n` +
          `This page: ${pageRows.length}\n` +
          `Total stored: ${allRows.length}`
        );
      }
    );

  });

})();

chrome.runtime.sendMessage({ type: "REFRESH_COUNT" });