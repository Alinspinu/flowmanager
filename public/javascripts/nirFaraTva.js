let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
    baseUrlLocal = baseUrlLocal
} else (
    baseUrlLocal = baseUrlHeroku
)

const urlLocal = `${baseUrlLocal}api/ingSearch`;
const furUrllocal = `${baseUrlLocal}api/furSearch`;
const ingUrllocal = `${baseUrlLocal}api/ingSearchFaraTva`;


const addRowPrdBtn = document.querySelector("#addPrd");
const addIngBtn = document.querySelector(".addIngBtn");
const saveNirBtn = document.querySelector('#saveNir');
const dataImp = document.querySelectorAll(".data");
const suggBoxFurnizor = document.querySelector("#searchFur");
const suggBoxNirProd = document.querySelector("#prodNirSearch");

const currentDate = new Date().toISOString().split("T")[0];

dataImp.forEach((el) => {
    el.setAttribute("value", currentDate);
});




let rowCount = 0;
addRowPrdBtn.onclick = (e) => {
    rowCount++;
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
    <input type="text" style="width: 100px;" name="nir[produse][${rowCount}][nume]"  class="form-control"  aria-describedby="basic-addon1" value='${prodNume.value
        }' required>
    <input type="text" name="nir[produse][${rowCount}][um]" class="form-control" aria-describedby="basic-addon1" value='${prodUm.value
        }' required>
    <input type="number" name="nir[produse][${rowCount}][cantitate]" class="form-control" aria-describedby="basic-addon1" value=${prodCant.value
        } required>
    <input type="number" name="nir[produse][${rowCount}][pretUmInt]" class="form-control"  aria-describedby="basic-addon1" value=${round2(
            prodPretIn.value
        )} required>
    <input type="number" name="nir[produse][${rowCount}][total]" class="form-control tot" aria-describedby="basic-addon1" value=${round2(
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
            saveNirBtn.classList.toggle('hide')
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

//Furnizor NIR Search

const furnImput = document.querySelector("#furnizor");

furnImput.onkeyup = (e) => {
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
                showSugestionsFurnizor(emptyArray);
                const allList = suggBoxFurnizor.querySelectorAll("li");
                for (let i = 0; i < allList.length; i++) {
                    allList[i].setAttribute("onclick", "selectFurnizor(this)");
                }
            });
    } else {
        suggBoxFurnizor.classList.add("hide");
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
    suggBoxFurnizor.innerHTML = listData;
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
    suggBoxFurnizor.classList.toggle("hide");
}

//AUTO CALCULATE VALUES NIR PROD


//Produs NIR Search

const prodImput = document.querySelector("#prodNume");

prodImput.onkeyup = (e) => {
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
                if (suggBoxNirProd.classList[2] == "hide") {
                    suggBoxNirProd.classList.remove("hide");
                }
                suggBoxNirProd.classList.add("active");
                showSugestionsNirProd(emptyArray);
                const allList = suggBoxNirProd.querySelectorAll("li");
                for (let i = 0; i < allList.length; i++) {
                    allList[i].setAttribute("onclick", "selectNirProd(this)");
                }
            });
    } else {
        suggBoxFurnizor.classList.add("hide");
    }
};

prodImput.addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
        suggBoxNirProd.classList.add("hide");
    }
});

function showSugestionsNirProd(list) {
    let listData;
    if (!list.length) {
        userValue = prodImput.value;
        listData = "<li>" + userValue + "</li>";
    } else {
        listData = list.join("");
    }
    suggBoxNirProd.innerHTML = listData;
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
    suggBoxNirProd.classList.toggle("hide");
}


const pret = document.querySelector("#prodPretIn");
pret.addEventListener("keydown", (e) => {
    if (e.keyCode === 9) {
        const valQty = document.querySelector("#prodCant");
        const valTotal = document.querySelector("#prodTotal");
        valTotal.value = round2(parseFloat(pret.value) * parseFloat(valQty.value));
    }
});

function round(num) {
    return Math.round(num * 1000) / 1000;
}
function round2(num) {
    return Math.round(num * 100) / 100;
}