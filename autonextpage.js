(async function () {

  const totalPages = parseInt(prompt("Enter total pages to collect:"));

  if (!totalPages || isNaN(totalPages)) {
    alert("Invalid number");
    return;
  }

  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* 🔹 SCROLL + COLLECT (PAGE UNIQUE ONLY) */
  async function scrollAndCollectUnique() {

    const viewport = document.querySelector('.ag-body-viewport');
    if (!viewport) {
      console.log("❌ Grid viewport not found");
      return [];
    }

    const pageMap = new Map();

    let lastScrollTop = -1;
    let sameCount = 0;

    while (true) {

      // 🔹 COLLECT VISIBLE
      document.querySelectorAll('.ag-center-cols-container .ag-row').forEach(row => {
        const cells = [...row.querySelectorAll('.ag-cell-value')]
          .map(c => c.innerText.trim());

        if (!cells.length) return;

        const key = cells.join("|");

        if (!pageMap.has(key)) {
          pageMap.set(key, cells); // ✅ only page duplicate remove
        }
      });

      // 🔹 SCROLL LITTLE
      viewport.scrollTop += 300;
      await wait(50);

      // 🔹 STOP CONDITION
      if (viewport.scrollTop === lastScrollTop) {
        sameCount++;
      } else {
        sameCount = 0;
      }

      if (sameCount > 5) break;

      lastScrollTop = viewport.scrollTop;
    }

    viewport.scrollTop = 0;
    await wait(300);

    return [...pageMap.values()];
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
  function clickNext() {
    const btns = document.querySelectorAll("li.pagination-next.page-item a.page-link");
    const btn = btns[btns.length - 1];

    if (btn) {
      btn.click();
      return true;
    }

    return false;
  }

  /* 🔥 MAIN LOOP */
  for (let i = 1; i <= totalPages; i++) {

    console.log(`📄 Page ${i}`);

    // 🔥 STEP 1: SCROLL + COLLECT
    const pageRows = await scrollAndCollectUnique();

    // 🔥 STEP 2: DIRECT STORE (NO GLOBAL CHECK)
    await new Promise(resolve => {
      chrome.storage.local.get(["rows"], res => {
        const allRows = res.rows || [];

        pageRows.forEach(r => {
          allRows.push(r); // ✅ direct push (no duplicate check)
        });

        chrome.storage.local.set({ rows: allRows }, () => {
          console.log(`✅ Page ${i}: ${pageRows.length} rows added`);
          resolve();
        });
      });
    });

    if (i === totalPages) break;

    // 🔥 STEP 3: NEXT PAGE
    if (!clickNext()) {
      alert("❌ Next button not found");
      break;
    }

    // 🔥 STEP 4: WAIT
    await wait(800);
    await waitForLoader();
  }

  alert("🎉 All pages collected (Page duplicate only)");

})();