const urlLocal = "http://localhost:3000/api/ingSearch";


const input1 = document.querySelector("#cauta2");
const suggBox2 = document.querySelector("#searchIngGst");
const addIngBtn = document.querySelector(".addIngBtn");
const addBonBtn = document.querySelector("#addBonTransfer");
const pretInv = document.querySelector("#pret1");
const qtyValue = document.querySelector("#cant");
const dataImp = document.querySelector('#dataTr')
const btnAddBon = document.querySelector('#btnAddBon')



//Data set
const currentDate = new Date().toISOString().split("T")[0];

dataImp.setAttribute("value", currentDate);


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










function round(num) {
    return Math.round(num * 1000) / 1000;
}
function round2(num) {
    return Math.round(num * 100) / 100;
}