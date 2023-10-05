let baseUrlLocal = 'http://localhost:3000/'
const baseUrlHeroku = 'https://www.flowmanager.ro/'

const currentUrl = window.location.href
if (currentUrl.slice(0, 22) === baseUrlLocal) {
    baseUrlLocal = baseUrlLocal
} else (
    baseUrlLocal = baseUrlHeroku
)

const urlLocal = `${baseUrlLocal}rapoarte/api`
const urlLocProduse = `${baseUrlLocal}rapoarte/apiNota`
const filter = document.querySelector('#data')
const bonTable = document.querySelector('.bonTable')
const prodTable = document.querySelector('.prodTable')
const clsBtn = document.querySelector('.clsBtn')
const produse = document.querySelector('#produse')
const navTot = document.querySelector('.card-cash')
const navCash = document.querySelector('.nav-cash')
const navCard = document.querySelector('.nav-card')
const startTime = document.querySelector('#start')
const endTime = document.querySelector('#end')


const currentDate = new Date(Date.now());

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const date = String(currentDate.getDate()).padStart(2, '0');

const dateString = `${year}-${month}-${date}`;

startTime.value = dateString
endTime.value = dateString

navCard.innerText = 0
navCash.innerText = 0
navTot.innerText = 0


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

    fetch(urlLocal, {
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
        bonTable.classList.remove('hide')
        let totalCard = 0;
        let totalCash = 0;
        data.forEach(function (el, i) {
            const dbData = new Date(el.data);
            const timeZoneOffset = new Date().getTimezoneOffset();
            const date = new Date(dbData.getTime() - (timeZoneOffset * 60 * 1000)).toISOString();
            const linie = document.createElement('tr');
            linie.classList.add('text-center', 'bon', 'linie');
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


        let prod = []
        prod = data

        produse.addEventListener('click', (e) => {
            produse.disabled = true
            bonTable.classList.add('hide')
            prodTable.classList.remove('hide')
            const getValues = () => {
                const products = [];
                prod.forEach(object => {
                    object.produse.forEach(product => {
                        products.push(product);
                    });
                });

                return products.reduce((acc, product) => {
                    if (!acc[product.nume]) {
                        acc[product.nume] = { cantitate: 0, pret: 0 }
                    }
                    acc[product.nume].cantitate += product.cantitate;
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
            clsBtn.onclick = (e) => {
                produse.disabled = false
                const linii = prodTable.querySelectorAll('td')
                linii.forEach(function (el) {
                    el.remove()
                })

                prodTable.classList.add('hide')
                bonTable.classList.remove('hide')

            }
            prod = []

        })

        //arata produsele de pe fiecare nota de plata
        const stLine = document.querySelectorAll('.linie')
        stLine.forEach(function (el) {
            const id = el.querySelector('.id').innerText
            el.addEventListener('click', (e) => {
                produse.disabled = true;
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
                    data.produse.forEach(function (el) {
                        const linie = document.createElement('tr')
                        linie.classList.add('text-center', 'linie')
                        const nume = document.createElement('td')
                        const qty = document.createElement('td')
                        const pret = document.createElement('td')
                        nume.innerText = el.nume
                        qty.innerText = el.cantitate
                        pret.innerText = el.pret
                        linie.append(nume, qty, pret)
                        prodTable.append(linie)
                        clsBtn.onclick = (e) => {
                            produse.disabled = false;
                            const linii = prodTable.querySelectorAll('td')
                            linii.forEach(function (el) {
                                el.remove()
                            })
                            prodTable.classList.add('hide')
                            bonTable.classList.remove('hide')

                        }
                    })

                }))
            })


        })
        startTime.addEventListener('change', function () {
            const allLinie = document.querySelectorAll('.linie')
            allLinie.forEach(function (el) {
                el.remove()
            })
            filter.disabled = false
            produse.disabled = true
            prodTable.classList.add('hide')
        })
        endTime.addEventListener('change', function () {
            const allLinie = document.querySelectorAll('.linie')
            allLinie.forEach(function (el) {
                el.remove()
            })
            filter.disabled = false
            produse.disabled = true
            prodTable.classList.add('hide')
        })
        user.addEventListener('change', function () {
            const allLinie = document.querySelectorAll('.linie')
            allLinie.forEach(function (el) {
                el.remove()
            })
            filter.disabled = false
            produse.disabled = true
            prodTable.classList.add('hide')
        })
    }))

})




function cap(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}