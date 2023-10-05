
const input = document.querySelector("#cauta");
const addRowBtn = document.querySelector("#addIng");
const suggBox = document.querySelector("#searchReteta");
const pretMp = document.querySelector("#pretIng");
const addProdusBtn = document.querySelector("#addProdusBtn")

let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
    baseUrlLocal = baseUrlLocal
} else (
    baseUrlLocal = baseUrlHeroku
)

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

function round(num) {
    return Math.round(num * 1000) / 1000;
}
function round2(num) {
    return Math.round(num * 100) / 100;
}