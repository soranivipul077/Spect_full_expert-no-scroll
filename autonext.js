(async function () {
  const totalPages = parseInt(prompt("Enter total pages to collect:"));

  if (!totalPages || isNaN(totalPages)) {
    alert("Invalid number");
    return;
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  /* 🔹 LOADER */
  function isLoaderVisible() {
    const loader = document.querySelector("#loading");
    return loader && loader.offsetParent !== null;
  }

  async function waitForLoader() {
    let attempts = 0;

    while (isLoaderVisible()) {
      await wait(300);
      if (++attempts > 150) break;
    }
  }

  /* 🔹 NEXT BUTTON */
  async function clickNext() {
    const btns = document.querySelectorAll(
      "li.pagination-next.page-item a.page-link",
    );
    const btn = btns[btns.length - 1];

    if (btn) {
      btn.click();
      return true;
    }

    return false;
  }

  async function grind_expend(params) {
    const grid = document.querySelector("ag-grid-angular");

    if (!grid) {
      alert("AG-Grid not found");
      return;
    }

    grid.style.height = "15000px";
    //grid.style.maxHeight = '9000px';
    //grid.style.minHeight = '9000px';
  }

  chrome.storage.local.get(
    ["scrollEnabled", "headers", "rows"],
    async (res) => {
      const scrollEnabled = res.scrollEnabled !== false; // default ON
      let pageRows = [];
      const allRows = res.rows || [];
      let headers = res.headers || [];

      /* 🔹 READ HEADERS (only once if empty) */
      if (!headers.length) {
        const headerCells = document.querySelectorAll(".ag-header-cell-text");
        headers = [...headerCells]
          .map((h) => h.innerText.trim())
          .filter(Boolean);
      }

      /* 🔹 COLLECT VISIBLE ROWS */
      function collectVisibleRows(removeDuplicate) {
        document
          .querySelectorAll(".ag-center-cols-container .ag-row")
          .forEach((row) => {
            const cells = [...row.querySelectorAll(".ag-cell-value")].map((c) =>
              c.innerText.trim(),
            );

            if (!cells.length) return;

            if (removeDuplicate) {
              const key = cells.join("|");
              if (!pageRows.some((r) => r.join("|") === key)) {
                pageRows.push(cells);
              }
            } else {
              pageRows.push(cells); // raw
            }
          });
      }

      for (let i = 1; i <= totalPages; i++) {
        console.log(`📄 Page ${i}`);
        pageRows = [];
        await grind_expend();
        await wait(800);


        /* 🔹 AUTO SCROLL MODE */
        if (scrollEnabled) {
          const viewport = document.querySelector(".ag-body-viewport");
          if (!viewport) {
            alert("AG-Grid viewport not found");
            return;
          }

          let lastScrollTop = -1;

          while (true) {
            collectVisibleRows(true); // duplicate REMOVE

            viewport.scrollTop += 1200;
            await wait(180);

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
        pageRows.forEach((r) => {
          allRows.push(r);
        });

        console.log(
          ` Data Collected in this Page\n` +
            `Mode: ${scrollEnabled ? "AUTO SCROLL (Unique)" : "VISIBLE ONLY (Raw)"}\n` +
            `This page: ${pageRows.length}\n` +
            `Total stored: ${allRows.length}`,
        );

        await wait(1000); // wait before next page
        await clickNext();
        await wait(800); // wait for page transition
        await waitForLoader();
        await wait(1000); // wait after loader
        
      }

      chrome.storage.local.set({ headers, rows: allRows }, () => {
        alert(
          ` Full Data Collected\n` +
            `Mode: ${scrollEnabled ? "AUTO SCROLL (Unique)" : "VISIBLE ONLY (Raw)"}\n` +
            `Total stored: ${allRows.length}`,
        );
      });
    },
  );
})();

chrome.runtime.sendMessage({ type: "REFRESH_COUNT" });
