(function () {

  const grid = document.querySelector('ag-grid-angular');

  if (!grid) {
    alert("AG-Grid not found");
    return;
  }

  grid.style.height = '15000px';
  //grid.style.maxHeight = '9000px';
  //grid.style.minHeight = '9000px';

  alert("✅ Grid expanded to height 9000px");

})();
