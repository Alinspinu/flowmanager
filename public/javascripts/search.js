const wrapper = document.querySelector("#search");
const testWrapper = document.querySelector('#testRow')
const bill = document.querySelector(".bill");
const nota = document.querySelector(".nota");
const nto = document.querySelector(".nto");
const card = document.querySelector("#card");
const cash = document.querySelector("#cash");
const redRow = document.querySelector(".reducere");
const reducereInput = redRow.querySelector("input")
const raportZ = document.querySelector(".z");
const raportX = document.querySelector(".x");
const addCasa = document.querySelector("#addCasa");
const redCasa = document.querySelector("#redCasa");
const addCif = document.querySelector("#addCifBtn");
const addRo = document.querySelector(".ro");

let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
  baseUrlLocal = baseUrlLocal
} else (
  baseUrlLocal = baseUrlHeroku
)


const urlLocalSend = `${baseUrlLocal}api/notaApi`;
const urlTotaluri = `${baseUrlLocal}api/send-totaluri`
const urlLocal = `${baseUrlLocal}api/sendCat`;
const url = `${baseUrlLocal}rapoarte/apiTotal`;

const navTot = document.querySelector(".card-cash");
const navCash = document.querySelector(".nav-cash");
const navCard = document.querySelector(".nav-card");
fetch(url).then((res) =>
  res.json().then((data) => {
    const cash = data.totalCash;
    const card = data.totalCard;
    navCard.innerText = round2(card);
    navCash.innerText = round2(cash);
    navTot.innerText = round2(card + cash);
  })
);

fetch(urlLocal)
  .then((rep) => rep.json())
  .then((data) => {
    data.forEach(function (mCat) {
      const btnMainCat = document.createElement("div");
      btnMainCat.classList.add("btnCat", "col-3", "btnFrstCat");
      btnMainCat.innerText = mCat.nume;
      testWrapper.append(btnMainCat);

      btnMainCat.onclick = (e) => {
        const allMainBtnCat = wrapper.querySelectorAll(".btnFrstCat");
        allMainBtnCat.forEach(function (el) {
          el.style.display = "none";
        });

        const backBtn = document.createElement("i");
        testWrapper.append(backBtn);
        backBtn.classList.add("bi", "btnScdCat", "secBac", "bi-arrow-90deg-up", 'col-3');
        backBtn.addEventListener("click", (e) => {
          const butoane = wrapper.querySelectorAll(".btnScdCat");
          butoane.forEach(function (el) {
            el.remove();
          });
          allMainBtnCat.forEach(function (el) {
            el.style.display = "flex";
          });
        });
        const categorie = mCat.categorie;

        categorie.forEach((el) => {
          const btnCat = document.createElement("div");
          btnCat.classList.add("btnCat", "btnScdCat", 'col-3');
          btnCat.innerText = el.nume;
          testWrapper.append(btnCat);

          btnCat.onclick = (e) => {
            const backBtnFuck = document.querySelectorAll(".secBac");
            backBtnFuck.forEach((el) => {
              el.remove();
            });
            // backBtnFuck.remove();
            const allBtnCat = testWrapper.querySelectorAll(".btnScdCat");
            allBtnCat.forEach(function (el) {
              el.style.display = "none";
            });
            const backSecBtn = document.createElement("i");
            testWrapper.append(backSecBtn);
            backSecBtn.classList.add(
              "bi",
              "btnProds",
              "secBac",
              "bi-arrow-90deg-up"
            );
            el.produs.forEach((el, i) => {
              const btnProdus = document.createElement("div");
              btnProdus.classList.add("btnProd", "btnProds", 'col-3');
              btnProdus.innerText = el.nume;
              testWrapper.append(btnProdus);

              btnProdus.addEventListener("click", (e) => {
                const rows = bill.children
                let existingRow;
                for (let i = 0; i < rows.length; i++) {
                  const rowName = rows[i].querySelector('.produs').innerText;
                  if (rowName === el.nume) {
                    existingRow = rows[i];
                    break;
                  }
                }
                if (existingRow) {
                  // If there is an existing row, update its quantity
                  const qtyInput = existingRow.querySelector('.qty');
                  qtyInput.value = parseInt(qtyInput.value) + 1;
                } else {
                  const billRow = document.createElement("div");
                  billRow.classList.add("row", "rand", "item", "my-2", "mx-1");
                  const billRowContent = `<span class="col-lg-5 fs-5 produs">${el.nume}</span>
                                    <span id="cat" class="cat hide">${el.mainCat}</span>
                                    <span id="tva" class="tva hide">${el.cotaTva}</span>
                                    <span class="col-lg-3 fs-5 pret">${el.pret} lei</span>
                                    <button class="col-lg-1 minus btn shadow" >-</button>
                                    <input type="text" class="col-lg-1 mx-1 qty" value="1">
                                    <button class="col-lg-1 plus btn shadow">+</button>`;
                  billRow.innerHTML = billRowContent;
                  bill.append(billRow);

                  const input = billRow.getElementsByClassName("qty")[0];
                  billRow.getElementsByClassName("plus")[0].onclick = (e) => {
                    input.value = Number(input.value) + 1;
                    const event = new Event("change", { bubbles: true });
                    input.dispatchEvent(event);
                  };
                  billRow.getElementsByClassName("minus")[0].onclick = (e) => {
                    input.value = Number(input.value) - 1;
                    const event = new Event("change", { bubbles: true });
                    input.dispatchEvent(event);
                    if (input.value <= 0) {
                      removeItem(e);
                    }
                  };
                  input.addEventListener("change", quantityChanged);
                }
                updateCartTotal();

                //change the quatity buttons

              });
            });

            backSecBtn.onclick = (e) => {
              const allBtnProd = testWrapper.querySelectorAll(".btnProds");
              allBtnProd.forEach((el) => {
                el.remove();
              });

              const backBtn = document.createElement("i");
              testWrapper.append(backBtn);
              testWrapper.insertBefore(backBtn, testWrapper.firstChild);
              backBtn.classList.add(
                "bi",
                "btnScdCat",
                "secBac",
                "bi-arrow-90deg-up"
              );
              backBtn.addEventListener("click", (e) => {
                const butoane = testWrapper.querySelectorAll(".btnScdCat");
                butoane.forEach(function (el) {
                  el.remove();
                });
                allMainBtnCat.forEach(function (el) {
                  el.style.display = "flex";
                });
              });

              allBtnCat.forEach(function (el) {
                el.style.display = "flex";
              });
            };
          };
        });
      };
    });
  });

//Open and display payment methods
nto.addEventListener("click", (e) => {
  const total = document.querySelector("#total").innerText.replace("lei", "");
  document.querySelector(".modal-pret").innerText = `${total}`;
  document.querySelector("#card").value = "";
  document.querySelector("#cash").value = "";
});

addRo.addEventListener("click", (e) => {
  const input = document.querySelector("#addCif");
  input.value = "RO";
});

const bon = 0;
let suma = 0;
addCasa.addEventListener("click", (e) => {
  const addDisplay = document.querySelector(".addSuma");
  const sumaInput = document.querySelector("#addSuma");
  suma += parseFloat(sumaInput.value);
  if (suma === 0) {
    addDisplay.innerText = "";
  } else {
    addDisplay.innerText = `+ ${suma}`;
    addDisplay.style.color = "green";
  }
  fetch(urlLocalSend, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bon: bon,
      addSuma: sumaInput.value,
    }),
  });
  sumaInput.value = "";
});

redCasa.addEventListener("click", (e) => {
  const addDisplay = document.querySelector(".addSuma");
  const sumaInput = document.querySelector("#redSuma");
  suma -= parseFloat(sumaInput.value);
  if (suma === 0) {
    addDisplay.innerText = "";
  } else if (suma < 0) {
    addDisplay.innerText = ` ${suma}`;
    addDisplay.style.color = "red";
  } else {
    addDisplay.innerText = ` ${suma}`;
    addDisplay.style.color = "green";
  }
  fetch(urlLocalSend, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redSuma: sumaInput.value,
      bon: bon,
    }),
  });
  sumaInput.value = "";
});

nota.addEventListener("click", (e) => {
  const cifValue = document.querySelector("#addCif");
  const produsRow = document.querySelectorAll(".rand");
  // const bon = document.querySelector("#bon");
  const total = document.querySelector("#total").innerText.replace(" lei", "");
  const card = document.querySelector("#card");
  const cash = document.querySelector("#cash");
  const nrMasa = document.querySelector("#nrMasa");
  const tva = document.querySelector('#tva').innerText
  const reducere = reducereInput.value;
  if (parseFloat(total) == parseFloat(cash.value) + parseFloat(card.value)) {
    let produse = [];
    for (let i = 0; i < produsRow.length; i++) {
      const produsNume =
        produsRow[i].getElementsByClassName("produs")[0].innerText;
      const produsPret = produsRow[i]
        .getElementsByClassName("pret")[0]
        .innerText.replace(" lei", "");
      const produsQty = produsRow[i].getElementsByClassName("qty")[0].value;
      const cat = produsRow[i].getElementsByClassName("cat")[0].innerText;
      let data = {
        nume: produsNume,
        pret: parseFloat(produsPret),
        cantitate: parseFloat(produsQty),
        mainCat: cat,
        cotaTva: parseFloat(tva)
      };
      produse.push(data);
      produsRow[i].remove();
    }
    reducereInput.value = "";
    updateCartTotal();

    const date = Date.now();

    //send the bill to the server to create a bill file
    fetch(urlLocalSend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cif: cifValue.value,
        produse: produse,
        cash: parseFloat(cash.value),
        card: parseFloat(card.value),
        reducere: parseFloat(reducere),
        data: date,
        total: parseFloat(total),
        // bon: val,
        nrMasa: nrMasa.value,
      }),
    }).then((res) => {
      console.log(res)
      if (!res.ok) {
        return res.text().then((errorMessage) => {
          const url = `/error?message=${encodeURIComponent(errorMessage)}`;
          window.location.href = url
          throw new Error(`Server ERROR: Status - ${res.status} MESSAGE: ${errorMessage}`)
        })
      } else {
        res.json().then((data) => {
          const cash = data.totalCash;
          const card = data.totalCard;
          navCard.innerText = round2(card);
          navCash.innerText = round2(cash);
          navTot.innerText = round2(card + cash);
          console.log(cash, card, navCard.innerText, navCash.innerText)
        })
      }
    })
  } else {
    alert("Valoarea nu corespunde cu totalul bonului mai încearcă odată :))");
  }
  cifValue.value = "";
});

raportX.addEventListener("click", (e) => {
  fetch(urlLocalSend, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raport: "x", bon: 0 }),
  });
});

raportZ.addEventListener("click", (e) => {
  fetch(urlLocalSend, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raport: "z", bon: 0 }),
  });
});

card.onkeyup = (e) => {
  const modalTotal = document.querySelector(".modal-pret");
  const num = document.querySelector("#cash");
  const total = document.querySelector("#total").innerText.replace(" lei", "");
  const val = e.target;
  const value = val.value;
  if (
    value < 0 ||
    isNaN(value) ||
    value > parseFloat(total) ||
    value + num.value > total
  ) {
    val.value = "";
    alert("Suma plătită nu poate fi mai mare decat nota de plată");
  } else if (!num.value || num.value == 0) {
    modalTotal.innerText = total - value;
  } else {
    modalTotal.innerText = total - value - num.value;
  }
};
cash.onkeyup = (e) => {
  const modalTotal = document.querySelector(".modal-pret");
  const crd = document.querySelector("#card");
  const total = document.querySelector("#total").innerText.replace(" lei", "");
  const value = e.target;
  if (
    value.value < 0 ||
    isNaN(value.value) ||
    value.value > parseFloat(total)
  ) {
    value.value = 0;
    alert("Suma plătită nu poate fi mai mare decat nota de plată");
  } else if (!crd.value || crd.value == 0) {
    modalTotal.innerText = total - value.value;
  } else {
    modalTotal.innerText = total - value.value - crd.value;
  }
};

const cashBtn = document.querySelector(".cash");
cashBtn.addEventListener("click", (e) => {
  const crd = document.querySelector("#card");
  const num = document.querySelector("#cash");
  const modalTotal = document.querySelector(".modal-pret");
  const total = document.querySelector("#total").innerText.replace(" lei", "");
  if (parseFloat(crd.value) <= parseFloat(total)) {
    num.value = total - crd.value;
    modalTotal.innerText = 0;
  } else {
    num.value = total;
    crd.value = 0;
    modalTotal.innerText = 0;
  }
});

const cardBtn = document.querySelector(".car");
cardBtn.addEventListener("click", (e) => {
  const num = document.querySelector("#cash");
  const crd = document.querySelector("#card");
  const modalTotal = document.querySelector(".modal-pret");
  const total = document.querySelector("#total").innerText.replace(" lei", "");
  if (parseFloat(num.value) <= parseFloat(total)) {
    crd.value = total - num.value;
    modalTotal.innerText = 0;
  } else {
    crd.value = total;
    num.value = 0;
    modalTotal.innerText = 0;
  }
});

//handle discount input
reducereInput.onkeyup = (e) => {
  const value = e.target.value;
  if (isNaN(value) || value < 0) {
    reducereInput.value = "";
  }
  updateCartTotal();
};

//Show search results
function showSugestions(list) {
  let listData;
  if (!list.length) {
    userValue = inputBox.value;
    listData = "<li>" + userValue + "</li>";
  } else {
    listData = list.join("");
  }
  suggBox.innerHTML = listData;
}

//Handle the bill previw
if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  //change quantity of item from bill
  const produse = document.querySelectorAll(".rand");
  const qtyImputs = document.getElementsByClassName("qty");
  for (let i = 0; i < produse.length; i++) {
    const produsRow = produse[i];
    const input = produsRow.getElementsByClassName("qty")[0];
    input.addEventListener("change", quantityChanged);
  }
}

// Chage quantity function
function quantityChanged(e) {
  const input = e.target;
  if (isNaN(input.value)) {
    input.value = 1;
  }
  updateCartTotal();
}
// Remove item function
function removeItem(e) {
  e.target.parentElement.remove();
  updateCartTotal();
}

//Update cart total function
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

function round2(num) {
  return Math.round(num * 100) / 100;
}