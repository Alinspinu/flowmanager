
const suggBoxFurnizor = document.querySelector("#search-res");
const furnImput = document.querySelector("#numeClient");
let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
    baseUrlLocal = baseUrlLocal
} else (
    baseUrlLocal = baseUrlHeroku
)

const clientSend = `${baseUrlLocal}api/clientSearch`



furnImput.onkeyup = (e) => {
    const search = e.target.value;
    if (search) {
        fetch(clientSend, {
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
    // const nrDoc = document.querySelector("#nrDoc");
    let selectUserData = element.children[0].innerText;
    let cif = element.children[1].innerText;
    let id = element.children[2].innerText;
    furId.value = id;
    furnImput.value = selectUserData;
    cifNir.value = cif;
    suggBoxFurnizor.classList.toggle("hide");
}