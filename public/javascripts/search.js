const wrapper = document.querySelector("#search");
const testWrapper = document.querySelector('.testRow')
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
const searchInput = document.querySelector('#cauta');
const searchResult = document.querySelector('.search-result')
const searchButton = document.querySelector('#search-button')
const searchButtonsWrapper = document.querySelector('.icon')
const searchBar = document.querySelector('.search-input')
const closeSearch = document.querySelector('.search-close')

let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
  baseUrlLocal = baseUrlLocal
} else (
  baseUrlLocal = baseUrlHeroku
)


const since = Date.now() - 5000; // only retrieve orders from the last 5 seconds
// const url = `${baseUrlLocal}rapoarte/apiTotal`;
// const eventSource = new EventSource(url)

const urlLocalSend = `${baseUrlLocal}api/notaApi`;
const urlTotaluri = `${baseUrlLocal}api/send-totaluri`
const urlLocal = `${baseUrlLocal}api/sendCat`;
const urlRefresh = `${baseUrlLocal}rapoarte/apiTotalRefresh`;

const navTot = document.querySelector(".card-cash");
const navCash = document.querySelector(".nav-cash");
const navCard = document.querySelector(".nav-card");
const marfa = document.querySelector(".marfa");
const prep = document.querySelector(".prep");
const unregistred = document.querySelector('.unregistred'); 
const cashButton = document.querySelector('.nav-buts-1');
const hideWrapper = document.querySelector('.hide-wrapper')


fetch(urlRefresh).then((res) =>
  res.json().then((data) => {
    console.log(data)
    const cash = data.totalCash;
    const card = data.totalCard;
    const marfaValue = data.marfa;
    const prepValue = data.prep;
    const unregValue = data.unregistred;
    unregistred.innerText = round2(unregValue)
    marfa.innerText = round2(marfaValue);
    prep.innerText = round2(prepValue);
    navCard.innerText = round2(card);
    navCash.innerText = round2(cash);
    navTot.innerText = round2(card + cash + unregValue);
    unregValue === 0 ? unregistred.classList.add('hide') : ''
  })
);

cashButton.addEventListener('click', function(){
    hideWrapper.classList.toggle('hide')
})

let products = []

fetch(`http://localhost:3000/api/search`)
  .then((res) => res.json())
  .then(data => {
    products = data.map(el => {
      const btnProdus = document.createElement("div");
      const imgProd = document.createElement("img");
      const body = document.createElement("div")
      const text = document.createElement("h5")
      if (el.imagine) {
        imgProd.src = el.imagine.path
      } else {
        imgProd.src = 'https://res.cloudinary.com/dhetxk68c/image/upload/v1682521162/gossips/glau3hwhahthvuaif9ne.png'
      }
      imgProd.classList.add('img-fluid', 'img-card-top')
      body.classList.add('card-body', 'text-center')
      btnProdus.classList.add("btnProd", "card", "btnProds", 'col-3', "hide");
      text.innerText = el.nume;
      btnProdus.append(imgProd)
      btnProdus.append(body)
      body.append(text)
      searchResult.append(btnProdus);

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

      });
      return { nume: el.nume, element: btnProdus }
    });
  })



searchInput.onkeyup = (e) => {
  if (searchResult.classList.contains('hide')) {
    searchResult.classList.remove('hide')
  }
  if (e.key === 'Escape') {
    searchButtonsWrapper.dispatchEvent(new Event('click'))
  }
  testWrapper.classList.add('hide')
  closeSearch.classList.remove('bi-x-lg')
  closeSearch.classList.add('bi-arrow-90deg-up')
  const query = searchInput.value.toLowerCase()
  products.forEach(product => {
    const isVisible = product.nume.toLowerCase().includes(query)
    product.element.classList.toggle('hide', !isVisible)
    if (!query) {
      testWrapper.classList.remove('hide')
      product.element.classList.add('hide')
      closeSearch.classList.add('bi-x-lg')
      closeSearch.classList.remove('bi-arrow-90deg-up')
    }
  })
}

searchButtonsWrapper.onclick = () => {
  searchBar.classList.toggle('show-search')
  if (closeSearch.classList.contains('bi-arrow-90deg-up')) {
    testWrapper.classList.remove('hide')
    searchResult.classList.add('hide')
    searchInput.value = ''
    closeSearch.classList.add('bi-x-lg')
  }
}


searchButton.onclick = () => {
  searchInput.focus()
}

closeSearch.onclick = () => {
  searchInput.blur()
}







fetch(urlLocal)
  .then((res) => res.json())
  .then((data) => {
    data.forEach(function (mainCat) {
      mainCat.categorie.forEach(function (el) {
        const btnCat = document.createElement("div");
        const imgCat = document.createElement("img");
        const body = document.createElement("div")
        const text = document.createElement("h5")
        if (el.imagine) {
          imgCat.src = el.imagine.path
        } else {
          imgCat.src = 'https://res.cloudinary.com/dhetxk68c/image/upload/v1682521162/gossips/glau3hwhahthvuaif9ne.png'
        }
        imgCat.classList.add('img-fluid', 'card-img')
        body.classList.add('card-body', 'text-center')
        body.style.padding = 0
        btnCat.classList.add("btnCat", "btnScdCat", "card", 'text-center', 'col-3');
        text.innerText = el.nume;
        btnCat.append(imgCat)
        btnCat.append(body)
        body.append(text)
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
            "bi-arrow-90deg-up",
            "col-3"
          );
          el.produs.forEach((el, i) => {
            const btnProdus = document.createElement("div");
            const imgProd = document.createElement("img");
            const body = document.createElement("div")
            const text = document.createElement("h5")
            if (el.imagine) {
              imgProd.src = el.imagine.path
            } else {
              imgProd.src = 'https://res.cloudinary.com/dhetxk68c/image/upload/v1682521162/gossips/glau3hwhahthvuaif9ne.png'
            }
            imgProd.classList.add('img-fluid', 'img-card-top')
            body.classList.add('card-body', 'text-center')
            body.style.padding = 0
            btnProdus.classList.add("btnProd", "card", "btnProds", 'col-3');
            text.innerText = el.nume;
            btnProdus.append(imgProd)
            btnProdus.append(body)
            body.append(text)
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
                                  <span id="cat" class="id hide">${el._id}</span>
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

            });
          });
          document.addEventListener('keydown', function (event) {
            const allBtnProd = testWrapper.querySelectorAll(".btnProds");
            allBtnProd.forEach((el) => {
              el.remove();
            });
            allBtnCat.forEach(function (el) {
              el.style.display = "flex";
            });
          });

          backSecBtn.onclick = (e) => {
            const allBtnProd = testWrapper.querySelectorAll(".btnProds");
            allBtnProd.forEach((el) => {
              el.remove();
            });
            allBtnCat.forEach(function (el) {
              el.style.display = "flex";
            });
          };
        };
      })
    })
  })


//Open and display payment methods
nto.addEventListener("click", (e) => {
  const total = document.querySelector("#total").innerText.replace("lei", "");
  document.querySelector(".modal-pret").innerText = `${total}`;
  document.querySelector("#card").value = "";
  document.querySelector("#cash").value = "";
  const allBtnCat = testWrapper.querySelectorAll(".btnScdCat");
  const allBtnProd = testWrapper.querySelectorAll(".btnProds");
  allBtnProd.forEach((el) => {
    el.remove();
  });
  allBtnCat.forEach(function (el) {
    el.style.display = "flex";
  });
});

addRo.addEventListener("click", (e) => {
  const input = document.querySelector("#addCif");
  input.value = "RO";
});

const bon = 0;
addCasa.addEventListener("click", (e) => {
  const addDisplay = document.querySelector(".addSuma");
  const sumaInput = document.querySelector("#addSuma");
  fetch(urlLocalSend, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bon: bon,
      addSuma: sumaInput.value,
    }),
  }).then((res) => res.json()).then(sum => {
    if (sum > 0) {
      addDisplay.innerText = '+' + sum
      addDisplay.style.color = 'green'
    } else if (sum === 0) {
      addDisplay.innerText = ''
    } else {
      addDisplay.innerText = sum
      addDisplay.style.color = 'red'
    }
  })
  sumaInput.value = "";
});

redCasa.addEventListener("click", (e) => {
  const addDisplay = document.querySelector(".addSuma");
  const sumaInput = document.querySelector("#redSuma");
  fetch(urlLocalSend, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      redSuma: sumaInput.value,
      bon: bon,
    }),
  }).then((res) => res.json()).then(sum => {
    if (sum > 0) {
      addDisplay.innerText = '+' + sum
      addDisplay.style.color = 'green'
    } else if (sum === 0) {
      addDisplay.innerText = ''
    } else {
      addDisplay.innerText = sum
      addDisplay.style.color = 'red'
    }
  })
  sumaInput.value = "";
});


const fiscal = document.querySelector("#bon");
let val = false;

nota.addEventListener("click", (e) => {
  const cifValue = document.querySelector("#addCif");
  const produsRow = document.querySelectorAll(".rand");
  const total = document.querySelector("#total").innerText.replace(" lei", "");
  const card = document.querySelector("#card");
  const cash = document.querySelector("#cash");
  const nrMasa = document.querySelector("#nrMasa");
  // const tva = document.querySelector('#tva').innerText
  const reducere = reducereInput.value;
  if (parseFloat(total) == parseFloat(cash.value) + parseFloat(card.value)) {
    let produse = [];
    for (let i = 0; i < produsRow.length; i++) {
      const id = produsRow[i].getElementsByClassName("id")[0].innerText;
      const produsQty = produsRow[i].getElementsByClassName("qty")[0].value;
      const data = {
        id: id,
        cantitate: produsQty
      }
      produse.push(data);
      produsRow[i].remove();
    }
    reducereInput.value = "";
    updateCartTotal();
    const date = Date.now();
    
    if(card.value > 0 && fiscal.checked){
      val = false
    } else if (fiscal.checked) {
      val = true
    } else {
      val = false
    }
    //send the bill to the server to create a bill file
    fetch(urlLocalSend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cif: cifValue.value,
        prod: produse,
        cash: parseFloat(cash.value),
        card: parseFloat(card.value),
        reducere: parseFloat(reducere),
        data: date,
        total: parseFloat(total),
        bon: val,
        // nrMasa: nrMasa.value,
      })
    }).then((res) => {
      if (!res.ok) {
        return res.text().then((errorMessage) => {
          const url = `/error?message=${encodeURIComponent(errorMessage)}`;
          window.location.href = url
          throw new Error(`Server ERROR: Status - ${res.status} MESSAGE: ${errorMessage}`)
        })
      } else {
        res.json().then((data) => {
          console.log(data)
          const cash = data.totalCash;
          const card = data.totalCard;
          const marfaValue = data.marfa;
          const prepValue = data.prep;
          const unregValue = data.unregistred
          unregistred.innerText = round2(unregValue);
          marfa.innerText = round2(marfaValue);
          prep.innerText = round2(prepValue);
          navCard.innerText = round2(card);
          navCash.innerText = round2(cash);
          navTot.innerText = round2(card + cash + unregValue);
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

