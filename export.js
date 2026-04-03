(function () {

  chrome.storage.local.get(["headers", "rows"], res => {
    const headers = res.headers || [];
    const rows = res.rows || [];

    if (!rows.length) {
      alert("No collected data to export");
      return;
    }

    const csv = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(r =>
        r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `AGGRID_COMBINED_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    alert(` CSV Exported\nRows: ${rows.length}`);
  });

})();
