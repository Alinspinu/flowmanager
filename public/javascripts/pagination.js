
const table = document.getElementById("myTable");
const rows = table.querySelectorAll("tr");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNum = document.getElementById("pageNum");
const rowsPerPage = 10;
let currentPage = 1;
function paginate() {
    // hide all rows
    for (let i = 0; i < rows.length; i++) {
        rows[i].style.display = "none";
    }

    // determine the start and end rows for the current page
    let startRow = (currentPage - 1) * rowsPerPage;
    let endRow = startRow + rowsPerPage - 1;

    // show only the rows for the current page
    for (let i = startRow; i <= endRow; i++) {
        rows[i].style.display = "table-row";
    }

    // update the current page number
    pageNum.innerHTML = currentPage;

    // enable/disable the navigation buttons
    if (currentPage == 1) {
        prevBtn.disabled = true;
    } else {
        prevBtn.disabled = false;
    }

    if (currentPage == numPages()) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}
function numPages() {
    return Math.ceil(rows.length / rowsPerPage);
}
prevBtn.addEventListener("click", function () {
    currentPage--;
    paginate();
});

nextBtn.addEventListener("click", function () {
    currentPage++;
    paginate();
});
paginate();
