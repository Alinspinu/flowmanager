const addRowBtn = document.querySelector("#addIng");
const addRowPrdBtn = document.querySelector("#addPrd");
const input = document.querySelector("#cauta");
const input1 = document.querySelector("#cauta2");
const um = document.querySelector("#um");
const um1 = document.querySelector("#um1");
const addBonBtn = document.querySelector("#addBonTransfer");
const pretMp = document.querySelector("#pretIng");
const suggBox2 = document.querySelector("#searchIngGst");
const suggBox = document.querySelector("#searchReteta");
const suggBoxFurnizor = document.querySelector("#searchFur");
const suggBoxNirProd = document.querySelector("#prodNirSearch");
const selectDep = document.querySelector("#departament");
const searchRetetaGrup = document.querySelector(".search");
const retetaCont = document.querySelector(".reteta");
const pretInv = document.querySelector("#pret1");
const qtyValue = document.querySelector("#cant");
const dataImp = document.querySelectorAll(".data");
const addProdusBtn = document.querySelector("#addProdusBtn");
const addIngBtn = document.querySelector(".addIngBtn");
const saveNirBtn = document.querySelector('#saveNir');

let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
  baseUrlLocal = baseUrlLocal
} else (
  baseUrlLocal = baseUrlHeroku
)

const urlLocal = `${baseUrlLocal}api/ingSearch`;
const furUrllocal = `${baseUrlLocal}api/furSearch`;
const ingUrllocal = `${baseUrlLocal}api/ingSearch`;


//MANAGING NIR

//Data set
const currentDate = new Date().toISOString().split("T")[0];

dataImp.forEach((el) => {
  el.setAttribute("value", currentDate);
});

//Add products on doc (NIR)
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
  const prodValIn = document.querySelector("#prodValIn");
  const cotaTva = document.querySelector("#cotaTva");
  const valTva = document.querySelector("#valTva");
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
  prodNume.value = "";
  prodUm.value = "";
  prodCant.value = "";
  prodPretIn.value = "";
  prodValIn.value = "";
  cotaTva.value = "";
  valTva.value = "";
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
cotaTva.addEventListener("keydown", (e) => {
  if (e.keyCode === 9) {
    const val = document.querySelector("#prodValIn");
    const valTva = document.querySelector("#valTva");
    valTva.value = round(val.value * (cotaTva.value / 100));
  }
});

//calcul valoare total + tva

const valTva = document.querySelector("#valTva");
valTva.addEventListener("keydown", (e) => {
  if (e.keyCode === 9) {
    const valProd = document.querySelector("#prodValIn");
    const valTotal = document.querySelector("#prodTotal");
    valTotal.value = parseFloat(valProd.value) + parseFloat(valTva.value);
  }
});

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
          allList[i].setAttribute("onclick", "selectNirProd(this)");
        }
      });
  } else {
    suggBoxFurnizor.classList.add("hide");
  }
};

prodImput.addEventListener("keydown", (e) => {
  console.log(e);
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
  const cotaTva = document.querySelector("#cotaTva");
  const um = document.querySelector("#prodUm");
  const pret = document.querySelector("#prodPretIn");
  const cantInp = document.querySelector("#prodCant");
  let selectUserData = element.children[0].innerText;
  let valUm = element.children[1].innerText;
  let valCotaTva = element.children[2].innerText;
  let valPret = element.children[3].innerText;
  prodImput.value = selectUserData;
  um.value = valUm;
  cotaTva.value = valCotaTva.slice(0, 1);
  pret.value = valPret;
  cantInp.focus();
  suggBoxNirProd.classList.toggle("hide");
}

addProdusBtn.onclick = (e) => {
  const reteta = document.querySelector(".reteta");
  const totalReteta = document.querySelector(".totReteta");
  reteta.classList.add("hide");
  totalReteta.classList.add("hide");
};

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
      });
  } else {
    suggBox.classList.add("hide");
  }
};

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
  const searchValue = document.querySelector("#cauta");
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
  reteta.append(ingRow);
  reteta.classList.remove("hide");
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

//MANAGING BON TRANSFER

//SERACH INGREDIENT IN DB
input1.onkeyup = (e) => {
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
        let emptyArray = [];
        let nume = [];
        let unit = [];
        let qty = [];
        let pret = [];
        data.forEach(function (el) {
          console.log(el);
          nume.push(el.nume);
          unit.push(el.um);
          qty.push(el.qty);
          pret.push(round(el.pret * (1 + el.cotaTva / 100)));
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
            produse.pret +
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
  pretInv.value = pret;
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
    <input type="number" name="bon[ingredient][${bonCount}][pret]" class="form-control pretI right-align" readonly="true" value = "${pret.value * parseFloat(qtyValue.value)
    }">
    <input type="number" name="bon[ingredient][${bonCount}][cantitate]" class="form-control" readonly="true" value = "${qtyValue.value
    }">
    <i class="bi fs-3 bi-x x-row-reteta"></i>
    </div>`;
  ingRow.innerHTML = ingRowHtml;
  bon.append(ingRow);
  bon.classList.remove("hide");
  valWrapp.classList.remove("hide");
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
    }
    valImp.value = round(total);
  };
  valImp.value = round(total);
  searchValue.focus();
  pret.value = "";
  searchValue.value = "";
  qtyValue.value = "";
  um.value = "";
};

function round(num) {
  return Math.round(num * 1000) / 1000;
}
function round2(num) {
  return Math.round(num * 100) / 100;
}

function updateCartTotal() {
  const produse = document.querySelectorAll(".rand");
  let total = 0;
  for (let i = 0; i < produse.length; i++) {
    const cartRow = produse[i];
    const priceElement = cartRow.getElementsByClassName("pret")[0];
    const qtyElement = cartRow.getElementsByClassName("qty")[0];
    let qty = qtyElement.value;
    const price = parseFloat(priceElement.innerText.replace("lei", ""));
    total = total + qty * price;
  }
  if (total < reducereInput.value) {
    total = total;
  } else {
    total = total - reducereInput.value;
  }
  document.querySelector("#total").innerText = total + " lei";
}
