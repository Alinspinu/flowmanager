let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'


//*********************TABS SCRIPTS****************************** */

document.addEventListener('DOMContentLoaded', function () {
    const tabs = document.querySelectorAll('#myTab .nav-link');

    const activeTab = localStorage.getItem('activeTab');

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            const activeTabId = this.getAttribute('id');
            localStorage.setItem('activeTab', activeTabId);
        });
    });

    if (activeTab) {
        const tabToActivate = document.getElementById(activeTab);
        if (tabToActivate) {
            tabToActivate.classList.add('active');
            const tabContentId = tabToActivate.getAttribute('data-bs-target');
            document.querySelector(tabContentId).classList.add('show', 'active');
        } else {
            const productTab = document.getElementById('bill-tab')
            const productTabContent = document.getElementById('bill-tab-pane')
            productTab.classList.add('active')
            productTabContent.classList.add('show', 'active')


        }
    } else {
        const productTab = document.getElementById('bill-tab')
        const productTabContent = document.getElementById('bill-tab-pane')
        productTab.classList.add('active')
        productTabContent.classList.add('show', 'active')
    }
});

//************************************************************* */
//NOMENCLATOR SCRIPTS********

const nomenclator = document.querySelector('.nomenclator')
const produsLink = nomenclator.querySelectorAll('li')
const searchBar = document.getElementById('cauta');
const nomenclator1 = document.querySelector('.nomenclator1')
const searchBar1 = document.querySelector('#cauta1')
const ingLink = nomenclator1.querySelectorAll('li')

produsLink.forEach(function (item) {
    item.addEventListener('click', function () {
        let link = item.querySelector('a');
        window.location = link.href;
    });
});



searchBar.addEventListener('input', function () {
    let searchTerm = this.value.toLowerCase();
    Array.from(produsLink).forEach(function (item) {
        let itemText = item.textContent;
        if (itemText.toLowerCase().indexOf(searchTerm) != -1) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

ingLink.forEach(function (item) {
    item.addEventListener('click', function () {
        let link = item.querySelector('a');
        window.location = link.href;
    });
});

searchBar1.addEventListener('input', function () {
    let searchTerm = this.value.toLowerCase();
    Array.from(ingLink).forEach(function (item) {
        let itemText = item.textContent;
        if (itemText.toLowerCase().indexOf(searchTerm) != -1) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});
// ********************************

//STOCK SCRIPTS*************************************

const searchInput = document.querySelector('#cauta2');
const searchButton = document.querySelector('#search-button1')
const searchButtonsWrapper = document.querySelector('.icons')
const searchBar2 = document.querySelector('.search-input')
const closeSearch = document.querySelector('.search-close1')
const total = document.getElementsByClassName('all')



searchInput.addEventListener('keyup', (e) => {
    const searchValue = document.getElementById("cauta2").value.toLowerCase();

    // Get all table rows
    const rows = document.getElementsByClassName("stoc-line");
    // Loop through the rows and hide/show based on the search value
    for (let i = 0; i < rows.length; i++) {
        const name = rows[i].getElementsByTagName("td")[0].innerText.toLowerCase(); // Assuming name is in the first column

        if (name.includes(searchValue)) {
            rows[i].style.display = "";
            total[0].style.display = ''
        } else {
            rows[i].style.display = "none";
            total[0].style.display = 'none'
        }
    }
})


searchButtonsWrapper.onclick = () => {
    searchBar2.classList.toggle('show-search')

}

searchButton.onclick = () => {
    searchInput.focus()
}

closeSearch.onclick = () => {
    console.log('close')
    const inp = document.getElementById("cauta2")
    inp.value = ''
    var event = new KeyboardEvent("keyup", {
        key: "Backspace",
        keyCode: 8,
        bubbles: true,
        cancelable: true
    });
    inp.dispatchEvent(event)

    searchInput.blur()
}

// ****************************************************************

// **************************CASH-REGISTER SCRIPTS****************************

const entryDate = document.getElementById('entry-date')
const currentDate = new Date().toISOString().split("T")[0];  // Get the current date in ISO format (YYYY-MM-DD)
document.getElementById('entry-date').value = currentDate;  // Set the value of the date input to the current date
document.getElementById("entry-date").setAttribute("max", currentDate);

// Global variables to keep track of the current start date and end date
let startDate;
let endDate;

// Function to create and display the calendar tabs
function createCalendarTabs() {

    const tabsContainer = document.getElementById("dayTab");
    const contentContainer = document.getElementById("dayTabContent");

    // Clear previous tabs and content
    tabsContainer.innerHTML = "";
    contentContainer.innerHTML = "";
    // Loop to create the tabs for the last ten days
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
        // Format the date as desired (e.g., "YYYY-MM-DD")
        const formattedDate = currentDate.toLocaleDateString('ro-RO', { month: 'numeric', day: 'numeric', year: '2-digit' });
        const idDate = formattedDate.replace(/[.\s]/g, "")

        // Create the tab element
        const tab = document.createElement("li");
        tab.className = "nav-item";
        tab.setAttribute('role', 'presentation')

        // Create the tab link
        const button = document.createElement("button");
        button.classList.add("nav-link");
        button.id = idDate
        button.setAttribute('data-bs-toggle', 'tab');
        button.setAttribute('data-bs-target', `#tab-${idDate}`);
        button.setAttribute('type', 'button');
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-controls', `${idDate}-tab-pane`);
        button.setAttribute('aria-selected', 'false');
        button.innerHTML = formattedDate

        // Append the link to the tab
        tab.appendChild(button);

        // Append the tab to the tabs container
        tabsContainer.appendChild(tab);

        // Create the tab content
        const tabContent = document.createElement("div");
        tabContent.className = "tab-pane";
        tabContent.id = `tab-${idDate}`;
        tabContent.setAttribute('role', 'tabpanel');
        tabContent.setAttribute('aria-labelledby', `${idDate}-tab`);
        tabContent.setAttribute('tabindex', '0');
        button.addEventListener("click", clickHandler(button, tabContent))

        // Append the tab content to the content container
        contentContainer.appendChild(tabContent);

        currentDate.setDate(currentDate.getDate() + 1)
    }

    // Activate the first tab
    tabsContainer.lastChild.lastChild.classList.add("active");
    contentContainer.lastChild.classList.add("active", "show");
}

function clickHandler(button, wrapper) {
    fetch(`${baseUrlLocal}rapoarte/entry?data=${button.innerText}`).then((res) => res.json().then((data) => {
        console.log(data)
        if (data.regDay === null) {
            const template = document.createElement('div');
            template.classList.add('no-records')
            template.innerText = 'No Records!'
            wrapper.append(template)
        } else {
            createPreviousDayHeader(wrapper, data);
            createHeaderEntry(wrapper, data);
            data.regDay.entry.forEach(function (el) {
                createEntryRow(wrapper, el)
            })
            createDayFooter(wrapper, data)
        }
    }))

    button.removeEventListener('click', clickHandler)
}


function createEntryRow(wrapper, el) {
    const entryWrapper = document.createElement('div')
    const entryDescription = document.createElement('span')
    const entryType = document.createElement('span')
    const entryDocNumber = document.createElement('span')
    const entrySum = document.createElement('span')
    const delEntry = document.createElement('i');
    entryDescription.innerText = el.description
    entryType.innerText = el.tip
    entryDocNumber.innerText = el.index
    entrySum.innerText = el.amount
    let mark = ''
    if (el.tip === 'expense') {
        mark = 'red-mark'
    } else {
        mark = 'green-mark'
    }
    entryDescription.classList.add('col-6', 'text-center', 'border');
    entryType.classList.add('col-2', 'text-center', 'border', mark);
    entryDocNumber.classList.add('col-1', 'text-center', 'offset-1', 'border');
    entrySum.classList.add('col-1', 'text-center', 'border', mark);
    entryWrapper.classList.add('row', 'entry', 'my-1')
    delEntry.classList.add('col-1', 'bi', 'bi-trash3')
    entryWrapper.append(entryDocNumber, entryDescription, entryType, entrySum, delEntry)
    wrapper.appendChild(entryWrapper)
    delEntry.addEventListener('click', function () {
        fetch(`${baseUrlLocal}rapoarte/entry`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: el._id })
        }).then((res) => res.json().then((res) => {
            createMessage(wrapper, res.message)
        }))
        updateTotal(el.amount)
        const parentElement = delEntry.parentNode
        parentElement.remove()
    })
}

function updateTotal(entrySum) {
    const totalSumEl = document.querySelector('.total-sum')
    totalSumEl.innerText = parseFloat(totalSumEl.innerText) - entrySum
}

function createMessage(wrapper, message) {
    const messageWrapper = document.createElement('div')
    const messageSucces = document.createElement('span')
    messageSucces.classList.add('col-6', 'offset-3', 'message')
    messageWrapper.classList.add('row', 'text-center', 'message-wrapper')
    messageSucces.innerText = message
    messageWrapper.appendChild(messageSucces)
    wrapper.appendChild(messageWrapper)
    setTimeout(() => {
        messageSucces.classList.add('hide')
    }, 3000)
}

function createHeaderEntry(wrapper, data) {
    const header = document.createElement('div')
    if (data.regDay === null || !data.regDay.entry.length) {
        header.innerText = 'No records!'
        header.classList.add('no-records')
    } else {
        const headerNrDoc = document.createElement('span')
        const headerDescription = document.createElement('span')
        const headerType = document.createElement('span')
        const headerSum = document.createElement('span')
        const headerPrevSum = document.createElement('span')
        headerPrevSum.innerHTML = ''
        headerNrDoc.innerText = 'Nr'
        headerDescription.innerText = 'Description'
        headerType.innerText = 'Entry Type'
        headerSum.innerText = 'Sum'
        headerPrevSum.classList.add('col-1')
        header.classList.add('row', 'heder-row')
        headerNrDoc.classList.add('col-1', 'offset-1', 'text-center', 'border')
        headerDescription.classList.add('col-6', 'text-center', 'border')
        headerType.classList.add('col-2', 'text-center', 'border')
        headerSum.classList.add('col-1', 'text-center', 'border')
        header.append(headerNrDoc, headerDescription, headerType, headerSum, headerPrevSum)
    }
    wrapper.appendChild(header)
}

function createPreviousDayHeader(wrapper, el) {
    const dayHeader = document.createElement('div');
    dayHeader.classList.add('row', 'prev-day-header')
    const title = document.createElement('span')
    title.classList.add('col-5', 'offset-6', 'border')
    title.innerText = 'Cash from previous day'
    const sum = document.createElement('span')
    sum.classList.add('col-1', 'border')
    sum.innerText = el.regDay.cashIn
    dayHeader.append(title, sum)
    wrapper.appendChild(dayHeader)
}

function createDayFooter(wrapper, el) {
    const footer = document.createElement('div');
    footer.classList.add('row', 'prev-day-footer')
    const title = document.createElement('span');
    title.classList.add('col-5', 'offset-6', 'border');
    title.innerText = 'Total cash in register';
    const sum = document.createElement('span');
    sum.classList.add('col-1', 'border', 'total-sum')
    sum.innerText = el.regDay.cashOut
    footer.append(title, sum)
    wrapper.appendChild(footer)
}

// Function to handle the previous button click
function handlePrevButtonClick() {
    endDate.setDate(endDate.getDate() - 4);
    startDate.setDate(startDate.getDate() - 4);
    createCalendarTabs();
}

// Function to handle the next button click
function handleNextButtonClick() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
        endDate.setDate(endDate.getDate() + 4);
        startDate.setDate(startDate.getDate() + 4);
        createCalendarTabs();
    }
}

const today = new Date();
today.setHours(0, 0, 0, 0);
startDate = new Date(today);
startDate.setDate(today.getDate() - 8);
endDate = new Date(today);

// Attach event listeners to the buttons
document.getElementById("prevBtn").addEventListener("click", handlePrevButtonClick);
document.getElementById("nextBtn").addEventListener("click", handleNextButtonClick);

// Create the initial calendar tabs
createCalendarTabs();


// ****************************************************************

//RAPOARTE SCRIPTS**************************************************



const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
    baseUrlLocal = baseUrlLocal
} else (
    baseUrlLocal = baseUrlHeroku
)

const urlRapLocal = `${baseUrlLocal}rapoarte/api`
const urlLocProduse = `${baseUrlLocal}rapoarte/apiNota`
const urlLocalReprint = `${baseUrlLocal}api/reprint`
const filter = document.querySelector('#fiscal-bill')
const bonTable = document.querySelector('.bonTable')
const prodTable = document.querySelector('.prodTable')
const produse = document.querySelector('#produse')
const navTot = document.querySelector('.card-cash')
const navCash = document.querySelector('.nav-cash')
const navCard = document.querySelector('.nav-card')
const startTime = document.querySelector('#start')
const endTime = document.querySelector('#end')
const user = document.querySelector('#users')
const reprint = document.querySelector('#reprint')
const reprintModal = document.querySelector('.rpModal')


const currentRapDate = new Date(Date.now());

const year = currentRapDate.getFullYear();
const month = String(currentRapDate.getMonth() + 1).padStart(2, '0');
const date = String(currentRapDate.getDate()).padStart(2, '0');

const dateString = `${year}-${month}-${date}`;

startTime.value = dateString
endTime.value = dateString

navCard.innerText = 0
navCash.innerText = 0
navTot.innerText = 0

let bills = []
produse.disabled = true
filter.addEventListener('click', (e) => {
    produse.disabled = false
    filter.disabled = true
    const startTime = document.querySelector('#start')
    const endTime = document.querySelector('#end')
    const user = document.querySelector('#users')
    const start = `${startTime.value}T00:00:00.000Z`
    const end = `${endTime.value}T23:59:59.000Z`
    const dateSt = new Date(start)
    const dateEn = new Date(end)

    const timeZoneOffset = new Date().getTimezoneOffset();
    const localDateSt = new Date(dateSt.getTime() + (timeZoneOffset * 60 * 1000)).toISOString();
    const localDateEn = new Date(dateEn.getTime() + (timeZoneOffset * 60 * 1000)).toISOString();

    fetch(urlRapLocal, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: user.value,
            start: localDateSt,
            end: localDateEn
        })
    }).then(res => res.json().then((data) => {
        bills = data
        bonTable.classList.remove('hide')
        let totalCard = 0;
        let totalCash = 0;
        data.forEach(function (el) {
            const dbData = new Date(el.data);
            const timeZoneOffset = new Date().getTimezoneOffset();
            const date = new Date(dbData.getTime() - (timeZoneOffset * 60 * 1000)).toISOString();
            const linie = document.createElement('tr');
            el.unregistred ?  linie.classList.add('text-center', 'bon', 'unregistred-line') :  linie.classList.add('text-center', 'bon', 'linie');
            const id = document.createElement('td');
            const index = document.createElement('td');
            const user = document.createElement('td');
            const data = date.replace('T', " / ").slice(0, -8);
            const dataB = document.createElement('td');
            const total = document.createElement('td');
            const cash = document.createElement('td');
            const card = document.createElement('td');
            id.classList.add('hide', 'id');
            id.innerText = el._id
            index.innerText = el.index
            user.innerText = cap(el.user.nume)
            dataB.innerText = data
            total.innerHTML = `${el.total} Lei`
            cash.innerText = el.cash
            card.innerText = el.card
            linie.append(id, index, user, dataB, card, cash, total)
            bonTable.append(linie)
            totalCard += el.card
            totalCash += el.cash
        })
        navCard.innerText = totalCard
        navCash.innerText = totalCash
        navTot.innerText = totalCard + totalCash

        //arata produsele de pe fiecare nota de plata
        const stLine = document.querySelectorAll('.bon')
        stLine.forEach(function (el) {
            const id = el.querySelector('.id').innerText
            el.addEventListener('click', (e) => {
                console.log(el)
                produse.disabled = false
                if (produse.innerText === 'Products') {
                    produse.innerText = "Back"
                }
                bonTable.classList.add('hide')
                prodTable.classList.remove('hide')
                fetch(urlLocProduse, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id
                    })
                }).then(res => res.json().then((data) => {
                    navCard.innerText = data.card;
                    navCash.innerText = data.cash;
                    navTot.innerText = data.total;
                    data.produse.forEach(function (el) {
                        const linie = document.createElement('tr')
                        linie.classList.add('text-center', 'linie')
                        const nume = document.createElement('td')
                        const qty = document.createElement('td')
                        const pret = document.createElement('td')
                        nume.innerText = el.produs.nume
                        qty.innerText = el.cantitate
                        pret.innerText = el.produs.pret * el.cantitate
                        linie.append(nume, qty, pret)
                        prodTable.append(linie)
                    })
                    reprintModal.classList.remove('hide')
                    reprint.addEventListener('click', (e) => {
                        let produseArr = []
                        data.produse.forEach(function (el) {
                            const data = {
                                cantitate: el.cantitate,
                                nume: el.produs.nume,
                                cotaTva: el.produs.cotaTva,
                                pret: el.produs.pret
                            }
                            produseArr.push(data)
                        })
                        fetch(urlLocalReprint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                _id: data._id,
                                card: data.card,
                                cash: data.cash,
                                reducere: data.reducere,
                                produse: produseArr,
                                unregistred: data.unregistred
                            })
                        }).then(res => res.json().then(res => {
                            console.log(res)
                            if (res === "all good") {
                                if (produse.innerText === "Back") {
                                    window.location.reload()
                                    reprintModal.classList.add('hide')
                                }
                            }
                        }))
                    })
                }))
            })
        })

    }))
})


let prod = []
produse.addEventListener('click', (e) => {
    if (produse.innerText === "Products") {
        produse.innerText = 'Back'
        bonTable.classList.add('hide')
        prodTable.classList.remove('hide')
        const getValues = () => {
            const products = [];
            bills.forEach(object => {
                object.produse.forEach(product => {
                    if (product.produs) {
                        const prod = {
                            cantitate: product.cantitate,
                            nume: product.produs.nume,
                            pret: product.produs.pret
                        }
                        products.push(prod);
                    }
                });
            });
            return products.reduce((acc, product) => {
                if (!acc[product.nume]) {
                    acc[product.nume] = { cantitate: 0, pret: 0 }
                }
                acc[product.nume].cantitate += parseFloat(product.cantitate);
                acc[product.nume].pret += product.pret;
                return acc;
            }, {});
        };
        let values = getValues();
        const result = Object.entries(values).map(([nume, { cantitate, pret }]) => ({ nume, cantitate, pret }));
        result.forEach(function (el) {
            const linie = document.createElement('tr')
            linie.classList.add('text-center', 'linie', 'liniePrd')
            const nume = document.createElement('td')
            const qty = document.createElement('td')
            qty.classList.add('liniePrd')
            const pret = document.createElement('td')
            pret.innerHTML = `${el.pret} Lei`
            nume.innerText = el.nume
            qty.innerText = el.cantitate
            linie.append(nume, qty, pret)
            prodTable.append(linie)
        })
        prod = []
    } else {
        const linii = prodTable.querySelectorAll('td')
        linii.forEach(function (el) {
            el.remove()
        })
        prodTable.classList.add('hide')
        bonTable.classList.remove('hide')
        reprintModal.classList.add('hide')
        produse.innerText = 'Products'

    }

})



startTime.addEventListener('change', function () {
    const allLinie = document.querySelectorAll('.linie')
    allLinie.forEach(function (el) {
        el.remove()
    })
    filter.disabled = false
    produse.disabled = true
    if (produse.innerText === "Back") {
        produse.innerText = "Products"
    }
    prodTable.classList.add('hide')
    bonTable.classList.add('hide')
})
endTime.addEventListener('change', function () {
    const firstTime = document.getElementById('start')
    const lastTime = document.getElementById('end')
    if (firstTime.value > lastTime.value) {
        lastTime.value = firstTime.value
    }
    const allLinie = document.querySelectorAll('.linie')
    allLinie.forEach(function (el) {
        el.remove()
    })
    filter.disabled = false
    produse.disabled = true
    if (produse.innerText === "Back") {
        produse.innerText = "Products"
    }
    prodTable.classList.add('hide')
    bonTable.classList.add('hide')
})
user.addEventListener('change', function () {
    const allLinie = document.querySelectorAll('.linie')
    allLinie.forEach(function (el) {
        el.remove()
    })
    filter.disabled = false
    produse.disabled = true
    if (produse.innerText === "Back") {
        produse.innerText = "Products"
    }
    prodTable.classList.add('hide')
    bonTable.classList.add('hide')
})


function cap(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

//*******************************************************************************************************

//ADD NIR TVA SCRIPTS****************************************************************************************

const furUrllocal = `${baseUrlLocal}api/furSearch`;
const ingUrllocal = `${baseUrlLocal}api/ingSearch`;

const addRowPrdBtnT = document.querySelector("#addPrd");
const addIngBtn = document.querySelector(".addIngBtn");
const saveNirBtn = document.querySelector('#saveNir');
const dataImp = document.querySelectorAll(".data");
const suggBoxFurnizor = document.querySelector("#searchFur");
const suggBoxNirProd = document.querySelector("#prodNirSearch");


dataImp.forEach((el) => {
    el.setAttribute("value", currentDate);
});


let rowCount = 0;
if (addRowPrdBtnT) {
    addRowPrdBtnT.onclick = (e) => {
        rowCount++;
        const nirHeader = document.querySelector(".nirHeader");
        const prodNumeTva = document.querySelector("#prodNumeTva");
        const prodUm = document.querySelector("#prodUm");
        const prodCant = document.querySelector("#prodCant");
        const prodCat = document.querySelector("#prodCat");
        const prodGestiune = document.querySelector("#prodGestiune");

        const selectedOption = prodCat.options[prodCat.selectedIndex];
        const catNume = selectedOption.textContent;

        const selectedGst = prodGestiune.options[prodGestiune.selectedIndex];
        const gstNume = selectedGst.textContent;

        const prodPretIn = document.querySelector("#prodPretIn");
        const prodValIn = document.querySelector("#prodValIn");
        const cotaTva = document.querySelector("#cotaTva");
        const valTva = document.querySelector("#valTva");
        const prodTotal = document.querySelector("#prodTotal");
        const prodPretVnz = document.querySelector("#prodPrtVnz");
        const prodRow = document.createElement("div");
        prodRow.classList.add("input-group");
        const prodRowHtml = `
      <div class="input-group ing">
        <input type="text" style="width: 100px;" name="nir[produse][${rowCount}][nume]"  class="form-control"  aria-describedby="basic-addon1" value='${prodNumeTva.value
            }' required>
        <input type="text" name="nir[produse][${rowCount}][um]" class="form-control" aria-describedby="basic-addon1" value='${prodUm.value
            }' required>
        <input type="number" name="nir[produse][${rowCount}][cantitate]" class="form-control" aria-describedby="basic-addon1" value=${prodCant.value
            } required>
        <input type="number" name="nir[produse][${rowCount}][pretUmInt]" class="form-control"  aria-describedby="basic-addon1" value=${round2(
                prodPretIn.value
            )} required>
        <input type="number" name="nir[produse][${rowCount}][valoareInt]"  class="form-control pVal" aria-describedby="basic-addon1" value=${round2(
                prodValIn.value
            )} required>
        <input type="number" name="nir[produse][${rowCount}][cotaTva]" id='cotaTva' class="form-control" aria-describedby="basic-addon1" value=${cotaTva.value
            } required>
        <input type="number" name="nir[produse][${rowCount}][valTva]"  class="form-control tVal" aria-describedby="basic-addon1" value=${round2(
                valTva.value
            )} required>
        <input type="number" name="nir[produse][${rowCount}][total]" class="form-control" aria-describedby="basic-addon1" value=${round2(
                prodTotal.value
            )} required>
        <select class="form-select" name="nir[produse][${rowCount}][categorie]" aria-label="Default select example" required>
        <option value='${prodCat.value}'>${catNume}</option>
        </select>
        <select class="form-select" name="nir[produse][${rowCount}][gestiune]" aria-label="Default select example" required>
        <option value='${prodGestiune.value}'>${gstNume}</option>
        </select>
        <input type="number" name="nir[produse][${rowCount}][pretVanzareUm]" class="form-control" aria-describedby="basic-addon1" value=${prodPretVnz.value || 0
            }>
        <i class="bi fs-3 bi-x x-row-reteta"></i>
        </div>
        `;
        prodRow.innerHTML = prodRowHtml;
        nirHeader.append(prodRow);
        nirHeader.classList.remove("hide");
        const totaluri = document.querySelector(".totaluri");
        totaluri.classList.remove("hide");
        saveNirBtn.classList.remove("hide")
        const tValoare = document.querySelector("#tVal");
        const totalTva = document.querySelector("#tTva");
        const totalNir = document.querySelector("#Tot");
        const allPval = document.querySelectorAll(".pVal");
        const allTval = document.querySelectorAll(".tVal");
        let tVal = 0;
        let tTva = 0;
        allPval.forEach(function (el) {
            tVal += parseFloat(el.value);
        });
        allTval.forEach(function (el) {
            tTva += parseFloat(el.value);
        });
        tValoare.innerText = round(tVal);
        totalTva.innerText = round(tTva);
        totalNir.innerText = round(tVal + tTva);

        prodRow.children[0].lastElementChild.onclick = (e) => {
            const row = e.target.parentElement;
            const pret = parseFloat(row.querySelector(".pVal").value);
            const totTva = parseFloat(row.querySelector(".tVal").value);
            tVal -= round(pret); // subtract the deleted row's value from the total
            tTva -= round(totTva); // subtract the deleted row's value from the total
            row.remove();
            if (allPval.length === 1) {
                totaluri.classList.toggle("hide");
                nirHeader.classList.toggle("hide");
                saveNirBtn.classList.toggle('hide')
            }
            tValoare.innerText = round(tVal);
            totalTva.innerText = round(tTva);
            totalNir.innerText = round(tVal + tTva);
        };
        prodNumeTva.value = "";
        prodUm.value = "";
        prodCant.value = "";
        prodPretIn.value = "";
        prodValIn.value = "";
        cotaTva.value = "";
        valTva.value = "";
        prodTotal.value = "";
        prodPretVnz.value = "";
    };
}

//Furnizor NIR Search

const furnImputTva = document.querySelector("#furnizorTva");
if(furnImputTva){
    furnImputTva.onkeyup = (e) => {
        const search = e.target.value;
        if (search) {
            fetch(furUrllocal, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ search }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.length) {
                        let emptyArray = [];
                        let nume = [];
                        let cif = [];
                        let Id = [];
                        data.forEach((el) => {
                            nume.push(el.nume);
                            cif.push(el.cif);
                            Id.push(el.Id);
                        });
                        let furNumeUm = nume.map((val, index) => ({
                            nume: val,
                            cif: cif[index],
                            Id: Id[index],
                        }));
                        emptyArray = furNumeUm.map((furnizori) => {
                            return (furnizori =
                                '<li class="result">' +
                                "<span>" +
                                furnizori.nume +
                                "</span>" +
                                "&nbsp;&nbsp;" +
                                "<span>" +
                                furnizori.cif +
                                "</span>" +
                                "<span class=hide>" +
                                furnizori.Id +
                                "</span>" +
                                "</li>");
                        });
                        if (suggBoxFurnizor.classList[2] == "hide") {
                            suggBoxFurnizor.classList.remove("hide");
                        }
                        suggBoxFurnizor.classList.add("active");
                        showSugestionsFurnizorTva(emptyArray);
                        const allList = suggBoxFurnizor.querySelectorAll("li");
                        for (let i = 0; i < allList.length; i++) {
                            allList[i].setAttribute("onclick", "selectFurnizorTva(this)");
                        }
                    } else {
                        suggBoxFurnizor.classList.add("hide");
                    }
                });
        } else {
            suggBoxFurnizor.classList.add("hide");
        }
    };
}

function showSugestionsFurnizorTva(list) {
    let listData;
    if (!list.length) {
        userValue = furnImput.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBoxFurnizor.innerHTML = listData;
}

function selectFurnizorTva(element) {
    const cifNir = document.querySelector("#cifNir");
    const furId = document.querySelector("#furId");
    const nrDoc = document.querySelector("#nrDoc");
    let selectUserData = element.children[0].innerText;
    let cif = element.children[1].innerText;
    let id = element.children[2].innerText;
    furId.value = id;
    furnImputTva.value = selectUserData;
    cifNir.value = cif;
    nrDoc.focus();
    suggBoxFurnizor.classList.toggle("hide");
}

//AUTO CALCULATE VALUES NIR PROD

//calcul valoare fara tva
const pretFaraTva = document.querySelector("#prodPretIn");
pretFaraTva.addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
        const qtyValue = document.querySelector("#prodCant").value;
        const val = document.querySelector("#prodValIn");
        val.value = qtyValue * pretFaraTva.value;
    }
});

//calcul valoare tva
const cotaTva = document.querySelector("#cotaTva");
if (cotaTva) {
    cotaTva.addEventListener("keydown", (e) => {
        if (e.keyCode === 9) {
            const val = document.querySelector("#prodValIn");
            const valTva = document.querySelector("#valTva");
            valTva.value = round(val.value * (cotaTva.value / 100));
        }
    });
}


//calcul valoare total + tva
const valTva = document.querySelector("#valTva");
if (valTva) {
    valTva.addEventListener("keydown", (e) => {
        if (e.keyCode === 9) {
            const valProd = document.querySelector("#prodValIn");
            const valTotal = document.querySelector("#prodTotal");
            valTotal.value = parseFloat(valProd.value) + parseFloat(valTva.value);
        }
    });
}

//Produs NIR Search
const prodImputTva = document.querySelector("#prodNumeTva");

// console.log(prodImputTva)
if(prodImputTva){
    prodImputTva.onkeyup = (e) => {
        const search = e.target.value;
        if (search) {
            fetch(ingUrllocal, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ search }),
            })
                .then((res) => res.json())
                .then((data) => {
                    let emptyArray = [];
                    let nume = [];
                    let um = [];
                    let cotaTva = [];
                    let pret = [];
                    data.forEach((el) => {
                        nume.push(el.nume);
                        um.push(el.um);
                        cotaTva.push(el.cotaTva);
                        pret.push(el.pret);
                    });
                    let prodNumeUm = nume.map((val, index) => ({
                        nume: val,
                        um: um[index],
                        cotaTva: cotaTva[index],
                        pret: pret[index],
                    }));
                    emptyArray = prodNumeUm.map((produse) => {
                        return (produse =
                            '<li class="result">' +
                            "<span>" +
                            produse.nume +
                            "</span>" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            produse.um +
                            "&nbsp;&nbsp;" +
                            "</span>" +
                            "<span>" +
                            produse.cotaTva +
                            " % &nbsp;&nbsp;" +
                            "</span>" +
                            "<span>" +
                            produse.pret +
                            "</span>" +
                            "</li>");
                    });
                    if (suggBoxNirProd.classList[2] == "hide") {
                        suggBoxNirProd.classList.remove("hide");
                    }
                    suggBoxNirProd.classList.add("active");
                    showSugestionsNirProd(emptyArray);
                    const allList = suggBoxNirProd.querySelectorAll("li");
                    for (let i = 0; i < allList.length; i++) {
                        allList[i].setAttribute("onclick", "selectNirProdTva(this)");
                    }
                });
        } else {
            suggBoxFurnizor.classList.add("hide");
        }
    };
    
    prodImputTva.addEventListener("keydown", (e) => {
        if (e.keyCode === 9) {
            suggBoxNirProd.classList.add("hide");
        }
    });
}

function showSugestionsNirProd(list) {
    let listData;
    if (!list.length) {
        userValue = prodImputTva.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBoxNirProd.innerHTML = listData;
}

function selectNirProdTva(element) {
    const cotaTva = document.querySelector("#cotaTva");
    const um = document.querySelector("#prodUm");
    const pret = document.querySelector("#prodPretIn");
    const cantInp = document.querySelector("#prodCant");
    let selectUserData = element.children[0].innerText;
    let valUm = element.children[1].innerText;
    let valCotaTva = element.children[2].innerText;
    let valPret = element.children[3].innerText;
    prodImputTva.value = selectUserData;
    um.value = valUm;
    cotaTva.value = valCotaTva.slice(0, 1);
    pret.value = valPret;
    cantInp.focus();
    suggBoxNirProd.classList.toggle("hide");
}




function round(num) {
    return Math.round(num * 1000) / 1000;
}
function round2(num) {
    return Math.round(num * 100) / 100;
}

//*******************************************************************************************************

//ADD NIR FARATVA TVA SCRIPTS****************************************************************************************
const ingFTUrllocal = `${baseUrlLocal}api/ingSearchFaraTva`;


const addRowPrdBtnF = document.querySelector("#addPrdF");
const saveNirBtnF = document.querySelector('#FsaveNir');
const dataImpF = document.querySelectorAll(".Fdata");
const suggBoxFurnizorF = document.querySelector("#FsearchFur");
const suggBoxNirProdF = document.querySelector("#FprodNirSearch");



dataImpF.forEach((el) => {
    el.setAttribute("value", currentDate);
});




let rowCountF = 0;
if (addRowPrdBtnF) {
    addRowPrdBtnF.onclick = (e) => {
        rowCountF++;
        const nirHeader = document.querySelector(".nirHeader");
        const prodNume = document.querySelector("#prodNume");
        const prodUm = document.querySelector("#prodUm");
        const prodCant = document.querySelector("#prodCant");
        const prodCat = document.querySelector("#prodCat");
        const prodGestiune = document.querySelector("#prodGestiune");

        const selectedOption = prodCat.options[prodCat.selectedIndex];
        const catNume = selectedOption.textContent;

        const selectedGst = prodGestiune.options[prodGestiune.selectedIndex];
        const gstNume = selectedGst.textContent;

        const prodPretIn = document.querySelector("#prodPretIn");
        const prodTotal = document.querySelector("#prodTotal");
        const prodPretVnz = document.querySelector("#prodPrtVnz");
        const prodRow = document.createElement("div");
        prodRow.classList.add("input-group");
        const prodRowHtml = `
      <div class="input-group ing">
        <input type="text" style="width: 100px;" name="nir[produse][${rowCountF}][nume]"  class="form-control"  aria-describedby="basic-addon1" value='${prodNume.value
            }' required>
        <input type="text" name="nir[produse][${rowCountF}][um]" class="form-control" aria-describedby="basic-addon1" value='${prodUm.value
            }' required>
        <input type="number" name="nir[produse][${rowCountF}][cantitate]" class="form-control" aria-describedby="basic-addon1" value=${prodCant.value
            } required>
        <input type="number" name="nir[produse][${rowCountF}][pretUmInt]" class="form-control"  aria-describedby="basic-addon1" value=${round2(
                prodPretIn.value
            )} required>
        <input type="number" name="nir[produse][${rowCountF}][total]" class="form-control tot" aria-describedby="basic-addon1" value=${round2(
                prodTotal.value
            )} required>
        <select class="form-select" name="nir[produse][${rowCountF}][categorie]" aria-label="Default select example" required>
        <option value='${prodCat.value}'>${catNume}</option>
        </select>
        <select class="form-select" name="nir[produse][${rowCountF}][gestiune]" aria-label="Default select example" required>
        <option value='${prodGestiune.value}'>${gstNume}</option>
        </select>
        <input type="number" name="nir[produse][${rowCountF}][pretVanzareUm]" class="form-control" aria-describedby="basic-addon1" value=${prodPretVnz.value || 0
            }>
        <i class="bi fs-3 bi-x x-row-reteta"></i>
        </div>
        `;
        prodRow.innerHTML = prodRowHtml;
        nirHeader.append(prodRow);
        nirHeader.classList.remove("hide");
        const totaluri = document.querySelector(".totaluri");
        totaluri.classList.remove("hide");
        saveNirBtnF.classList.remove("hide")
        const totalNir = document.querySelector("#Tot");
        const allTot = document.querySelectorAll(".tot");
        let tTot = 0;
        allTot.forEach(function (el) {
            tTot += parseFloat(el.value);
        });

        totalNir.innerText = round(tTot);

        prodRow.children[0].lastElementChild.onclick = (e) => {
            const row = e.target.parentElement;
            const tot = parseFloat(row.querySelector(".tot").value);
            tTot -= round(tot); // subtract the deleted row's value from the total
            row.remove();
            if (allTot.length === 1) {
                totaluri.classList.toggle("hide");
                nirHeader.classList.toggle("hide");
                saveNirBtnF.classList.toggle('hide')
            }
            totalNir.innerText = round(tTot);
        };
        prodNume.value = "";
        prodUm.value = "";
        prodCant.value = "";
        prodPretIn.value = "";
        prodTotal.value = "";
        prodPretVnz.value = "";
    };
}

//Furnizor NIR Search
const furnImput = document.querySelector("#furnizorFTva");

furnImput.onkeyup = (e) => {
    const search = e.target.value;
    console.log(search)
    if (search) {
        fetch(furUrllocal, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ search }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.length) {
                    let emptyArray = [];
                    let nume = [];
                    let cif = [];
                    let Id = [];
                    data.forEach((el) => {
                        nume.push(el.nume);
                        cif.push(el.cif);
                        Id.push(el.Id);
                    });
                    let furNumeUm = nume.map((val, index) => ({
                        nume: val,
                        cif: cif[index],
                        Id: Id[index],
                    }));
                    emptyArray = furNumeUm.map((furnizori) => {
                        return (furnizori =
                            '<li class="result">' +
                            "<span>" +
                            furnizori.nume +
                            "</span>" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            furnizori.cif +
                            "</span>" +
                            "<span class=hide>" +
                            furnizori.Id +
                            "</span>" +
                            "</li>");
                    });
                    if (suggBoxFurnizorF.classList[2] == "hide") {
                        suggBoxFurnizorF.classList.remove("hide");
                    }
                    suggBoxFurnizorF.classList.add("active");
                    showSugestionsFurnizor(emptyArray);
                    const allList = suggBoxFurnizorF.querySelectorAll("li");
                    for (let i = 0; i < allList.length; i++) {
                        allList[i].setAttribute("onclick", "selectFurnizor(this)");
                    }
                } else {
                    suggBoxFurnizorF.classList.add("hide");
                }
            });
    } else {
        suggBoxFurnizorF.classList.add("hide");
    }
};

function showSugestionsFurnizor(list) {
    let listData;
    if (!list.length) {
        userValue = furnImput.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBoxFurnizorF.innerHTML = listData;
}

function selectFurnizor(element) {
    const cifNir = document.querySelector("#cifNir");
    const furId = document.querySelector("#furId");
    const nrDoc = document.querySelector("#nrDoc");
    let selectUserData = element.children[0].innerText;
    let cif = element.children[1].innerText;
    let id = element.children[2].innerText;
    furId.value = id;
    furnImput.value = selectUserData;
    cifNir.value = cif;
    nrDoc.focus();
    suggBoxFurnizorF.classList.toggle("hide");
}

//AUTO CALCULATE VALUES NIR PROD


//Produs NIR Search

const prodImput = document.querySelector("#prodNume");

prodImput.onkeyup = (e) => {
    const search = e.target.value;
    if (search) {
        fetch(ingFTUrllocal, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ search }),
        })
            .then((res) => res.json())
            .then((data) => {
                let emptyArray = [];
                let nume = [];
                let um = [];
                let pret = [];
                data.forEach((el) => {
                    nume.push(el.nume);
                    um.push(el.um);
                    pret.push(el.pret);
                });
                let prodNumeUm = nume.map((val, index) => ({
                    nume: val,
                    um: um[index],
                    pret: pret[index],
                }));
                emptyArray = prodNumeUm.map((produse) => {
                    return (produse =
                        '<li class="result">' +
                        "<span>" +
                        produse.nume +
                        "</span>" +
                        "&nbsp;&nbsp;" +
                        "<span>" +
                        produse.um +
                        "&nbsp;&nbsp;" +
                        "</span>" +
                        "<span>" +
                        produse.pret +
                        "</span>" +
                        "</li>");
                });
                if (suggBoxNirProdF.classList[2] == "hide") {
                    suggBoxNirProdF.classList.remove("hide");
                }
                suggBoxNirProdF.classList.add("active");
                showSugestionsNirProdFtva(emptyArray);
                const allList = suggBoxNirProdF.querySelectorAll("li");
                for (let i = 0; i < allList.length; i++) {
                    allList[i].setAttribute("onclick", "selectNirProd(this)");
                }
            });
    } else {
        suggBoxFurnizorF.classList.add("hide");
    }
};

prodImput.addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
        suggBoxNirProdF.classList.add("hide");
    }
});

function showSugestionsNirProdFTva(list) {
    let listData;
    if (!list.length) {
        userValue = prodImput.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBoxNirProdF.innerHTML = listData;
}

function selectNirProd(element) {
    const um = document.querySelector("#prodUm");
    const pret = document.querySelector("#prodPretIn");
    const cantInp = document.querySelector("#prodCant");
    let selectUserData = element.children[0].innerText;
    let valUm = element.children[1].innerText;
    let valPret = element.children[2].innerText;
    prodImput.value = selectUserData;
    um.value = valUm;
    pret.value = valPret;
    cantInp.focus();
    suggBoxNirProdF.classList.toggle("hide");
}


const pret = document.querySelector("#prodPretIn");
pret.addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
        const valQty = document.querySelector("#prodCant");
        const valTotal = document.querySelector("#prodTotal");
        valTotal.value = round2(parseFloat(pret.value) * parseFloat(valQty.value));
    }
});
//******************************************************************************************************************

//ADD PRODUCT SCRIPT******************************************************************************************************************

const input = document.querySelector(".srcs");
const addRowBtn = document.querySelector("#addIng");
const suggBox = document.querySelector("#searchReteta");
const pretMp = document.querySelector("#pretIng");
const addProdusBtn = document.querySelector("#addProdusBtn")

const tvaInfoUrl = `${baseUrlLocal}api/tvaInfo`

let urlLocal = ''
fetch(tvaInfoUrl)
    .then((rep) => rep.json())
    .then((data) => {
        console.log(data)
        if (data === 'neplatitorTva') {
            urlLocal = `${baseUrlLocal}api/ingSearchFaraTva`;
        } else if (data === 'platitorTva') {
            urlLocal = `${baseUrlLocal}api/ingSearch`;
        }
    })

//MANAGING ADD PRODUS MENIU

//SEARCH PRODUS
input.onkeyup = (e) => {
    const search = e.target.value;
    if (search) {
        fetch(urlLocal, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ search }),
        })
            .then((rep) => rep.json())
            .then((data) => {
                if (data.length) {
                    let emptyArray = [];
                    let nume = [];
                    let unit = [];
                    let pret = [];
                    data.forEach(function (el) {
                        nume.push(el.nume);
                        unit.push(el.um);
                        pret.push(el.pret);
                    });
                    let ingNameUm = nume.map((val, index) => ({
                        nume: val,
                        um: unit[index],
                        pret: pret[index],
                    }));
                    emptyArray = ingNameUm.map((produse) => {
                        return (produse =
                            '<li class="result">' +
                            "<span>" +
                            produse.nume +
                            "</span>" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            produse.um +
                            "</span>" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            produse.pret +
                            "</span>" +
                            "</li>");
                    });
                    if (suggBox.classList[2] == "hide") {
                        suggBox.classList.remove("hide");
                    }
                    suggBox.classList.add("active");
                    showSugestions(emptyArray);
                    const allList = suggBox.querySelectorAll("li");
                    for (let i = 0; i < allList.length; i++) {
                        allList[i].setAttribute("onclick", "select(this)");
                    }
                } else {
                    suggBox.classList.add("hide");
                }
            });
    } else {
        suggBox.classList.add("hide");
    }
}



function select(element) {
    const qtyValue = document.querySelector("#cant");
    let selectUserData = element.children[0].innerText;
    let UM = element.children[1].innerText;
    let pret = element.children[2].innerText;
    pretMp.value = parseFloat(pret);
    input.value = selectUserData;
    um.value = UM;
    qtyValue.focus();
    suggBox.classList.toggle("hide");
}

function showSugestions(list) {
    let listData;
    if (!list.length) {
        userValue = input.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBox.innerHTML = listData;
}

//ADD INGREDIENT IN RETETA PRODUS

addRowBtn.onclick = (e) => {
    const reteta = document.querySelector(".reteta");
    const totalReteta = document.querySelector(".totReteta");
    const searchValue = document.querySelector(".srcs");
    const qtyValue = document.querySelector("#cant");
    const um = document.querySelector("#um");
    const pret = document.querySelector("#pretIng");
    const ingRow = document.createElement("div");
    ingRow.classList.add("input-group", "ing");
    const ingRowHtml = ` 
    <div class="input-group ing" name="ing">
    <input type="text" name="ingrediente[nume]" class="form-control" readonly="true" value = "${searchValue.value
        }">
    <input type="text" name="ingrediente[cantitate]" id="qty" class="form-control" readonly="true" value = "${qtyValue.value
        }">
    <input type="text" name="ingrediente[pret]" id="pret" class="form-control pretIng" readonly="true" value = "${pret.value * parseFloat(qtyValue.value)
        }">
    <i class="bi fs-3 bi-x x-row-reteta"></i>
    </div>`;
    ingRow.innerHTML = ingRowHtml;
    console.log(ingRow)
    reteta.append(ingRow);
    reteta.classList.remove("hide");
    addProdusBtn.classList.remove('hide')
    totalReteta.classList.remove("hide");
    const allPret = document.querySelectorAll(".pretIng");
    let total = 0;
    allPret.forEach(function (el) {
        total += parseFloat(el.value);
    });
    totalReteta.innerHTML = `${Math.round(total * 100) / 100} Cost Produs`;
    ingRow.children[0].lastElementChild.onclick = (e) => {
        const row = e.target.parentElement;
        const pret = parseFloat(row.querySelector(".pretIng").value);
        total -= pret; // subtract the deleted row's value from the total
        row.remove();
        if (allPret.length === 1) {
            reteta.classList.toggle("hide");
            totalReteta.classList.toggle("hide");
            addProdusBtn.classList.toggle('hide')

        }
        totalReteta.innerHTML = `${round(total)} Cost Produs`;
    };
    totalReteta.innerHTML = `${round(total)} Cost Produs`;
    searchValue.focus();
    pret.value = "";
    searchValue.value = "";
    qtyValue.value = "";
    um.value = "";
};

//******************************************************************************************************************
//******************************************SCRIPTS USERS*********************************************************

const listItem = document.querySelectorAll(".list-group-item");
listItem.forEach(function (el) {
    const link = el.querySelector(".link");
    el.addEventListener("click", function () {
        link.click();
    });
})
//******************************************************************************************************************
//********************************************MANAGE TRANSFER INTRE GESTIUNI FARA TVA*****************************************

const urlLocalT = 'http://localhost:3000/api/ingSearchFaraTva';
const input1 = document.querySelector("#cauta3");
const suggBox2 = document.querySelector("#searchIngGst");
const addBonBtn = document.querySelector("#addBonTransfer");
const pretInv = document.querySelector("#pret1");
const qtyValue = document.querySelector("#cant");
const dataImpT = document.querySelector('#dataTr')
const btnAddBon = document.querySelector('#btnAddBon')



//Data set

dataImpT.setAttribute("value", currentDate);


//MANAGING BON TRANSFER

//SERACH INGREDIENT IN DB
input1.onkeyup = (e) => {
    const search = e.target.value;
    if (search) {
        fetch(urlLocalT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ search }),
        })
            .then((rep) => rep.json())
            .then((data) => {
                if (data.length) {
                    let emptyArray = [];
                    let nume = [];
                    let unit = [];
                    let qty = [];
                    let pret = [];
                    data.forEach(function (el) {
                        nume.push(el.nume);
                        unit.push(el.um);
                        qty.push(el.qty);
                        pret.push(round(el.pret));
                    });
                    let ingNameUm = nume.map((val, index) => ({
                        nume: val,
                        um: unit[index],
                        qty: qty[index],
                        pret: pret[index],
                    }));
                    emptyArray = ingNameUm.map((produse) => {
                        return (produse =
                            "<li>" +
                            "<span>" +
                            produse.nume +
                            "</span>" +
                            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                            "&nbsp;&nbsp;" +
                            "În Stoc" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            produse.qty +
                            "</span>" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            produse.um +
                            "</span>" +
                            "&nbsp;&nbsp|&nbsp;&nbsp;" +
                            "La" +
                            "&nbsp;&nbsp;" +
                            "<span>" +
                            round2(produse.pret) +
                            "</span>" +
                            "&nbsp;" +
                            "Lei" +
                            "</li>");
                    });
                    if (suggBox2.classList[2] == "hide") {
                        suggBox2.classList.remove("hide");
                    }
                    suggBox2.classList.add("active");
                    showSugestions1(emptyArray);
                    const allList = suggBox2.querySelectorAll("li");
                    for (let i = 0; i < allList.length; i++) {
                        allList[i].setAttribute("onclick", "select1(this)");
                    }
                } else {
                    suggBox2.classList.add("hide");
                }
            });
    } else {
        suggBox2.classList.add("hide");
    }
};

function select1(element) {
    const qtyValue = document.querySelector("#cant1");
    let selectUserData = element.children[0].innerText;
    let UM = element.children[2].innerText;
    let pret = element.children[3].innerText;
    pretInv.value = round2(pret);
    input1.value = selectUserData;
    um1.value = UM;
    qtyValue.focus();
    suggBox2.classList.toggle("hide");
}

function showSugestions1(list) {
    let listData;
    if (!list.length) {
        userValue = input1.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBox2.innerHTML = listData;
}

//ADD INGREDIENT IN BON
let bonCount = 0;
addBonBtn.onclick = (e) => {
    bonCount++;
    const bon = document.querySelector(".bonTransfer");
    const valImp = document.querySelector("#valoare");
    const valWrapp = document.querySelector(".valWrapp");
    const searchValue = document.querySelector("#cauta2");
    const qtyValue = document.querySelector("#cant1");
    const um = document.querySelector("#um1");
    const pret = document.querySelector("#pret1");
    const ingRow = document.createElement("div");
    ingRow.classList.add("input-group", "ing");
    const ingRowHtml = ` 
      <div class="input-group ing" name="ing">
      <input type="text" name="bon[ingredient][${bonCount}][nume]" class="form-control" readonly="true" value = "${searchValue.value
        }">
      <input type="text" name="bon[ingredient][${bonCount}][um]" readonly="true" class="form-control" readonly="true" value = "${um.value
        }">
      <input type="number" name="bon[ingredient][${bonCount}][pret]" class="form-control pretI right-align" readonly="true" value = "${round2(pret.value * parseFloat(qtyValue.value))
        }">
      <input type="number" name="bon[ingredient][${bonCount}][cantitate]" class="form-control" readonly="true" value = "${qtyValue.value
        }">
      <i class="bi fs-3 bi-x x-row-reteta"></i>
      </div>`;
    ingRow.innerHTML = ingRowHtml;
    bon.append(ingRow);
    bon.classList.remove("hide");
    valWrapp.classList.remove("hide");
    btnAddBon.classList.remove('hide')
    const allPret = document.querySelectorAll(".pretI");
    let total = 0;
    allPret.forEach(function (el) {
        total += parseFloat(el.value);
    });
    ingRow.children[0].lastElementChild.onclick = (e) => {
        const row = e.target.parentElement;
        const pret = parseFloat(row.querySelector(".pretI").value);
        total -= pret; // subtract the deleted row's value from the total
        row.remove();
        if (allPret.length === 1) {
            valWrapp.classList.toggle("hide");
            bon.classList.toggle("hide");
            btnAddBon.classList.toggle('hide')
        }
        valImp.value = round2(total);
    };
    valImp.value = round2(total);
    searchValue.focus();
    pret.value = "";
    searchValue.value = "";
    qtyValue.value = "";
    um.value = "";
};

//******************************************************************************************************************




