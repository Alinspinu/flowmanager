const wrapper = document.querySelector("#search")
const bill = document.querySelector('.bill')
const redRow = document.querySelector('.reducere');
const reducereInput = redRow.querySelector('input');
// const btns = wrapper.querySelectorAll('div')
const urlLocal = 'http://localhost:3000/api/sendCat'



fetch(urlLocal).then(rep => rep.json()).then(data => {
    data.forEach(function (el) {
        const btnCat = document.createElement('div')
        btnCat.innerText = el.nume
        wrapper.append(btnCat)
        btnCat.onclick = (e) => {
            const allBtnCat = wrapper.querySelectorAll('div')
            allBtnCat.forEach(function (el) {
                el.classList.add('hide')
            })
            const produse = el.produs
            for (let i = 0; i < produse.length; i++) {
                const btnProdus = document.createElement('div')
                const prodNume = document.createElement('span')
                prodNume.classList.add('prodNum')
                prodNume.innerText = produse[i].nume
                btnProdus.classList.add('btnPrd')
                wrapper.append(btnProdus)
                btnProdus.append(prodNume)
                btnProdus.addEventListener('click', (e) => {
                    const billRow = document.createElement('div');
                    billRow.classList.add('row', 'rand', 'item', 'my-2', 'mx-1');
                    const billRowContent =
                        `<span class="col-lg-5 fs-5 produs">${produse[i].nume}</span>
                    <span class="col-lg-3 fs-5 pret">${produse[i].pret} lei</span>
                    <button class="col-lg-1 minus btn shadow" >-</button>
                    <input type="text" class="col-lg-1 mx-1 qty" value="1">
                    <button class="col-lg-1 plus btn shadow">+</button>`;
                    billRow.innerHTML = billRowContent;
                    bill.append(billRow);
                    updateCartTotal();

                    //change the quatity buttons
                    const input = billRow.getElementsByClassName('qty')[0]
                    billRow.getElementsByClassName('plus')[0].onclick = (e) => {
                        input.value = Number(input.value) + 1
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event)
                    }
                    billRow.getElementsByClassName('minus')[0].onclick = (e) => {
                        input.value = Number(input.value) - 1
                        const event = new Event('change', { bubbles: true });
                        input.dispatchEvent(event)
                        if (input.value <= 0) {
                            removeItem(e)
                        }
                    }
                    input.addEventListener('change', quantityChanged)
                })
            }
            const backBtn = document.createElement('i')
            backBtn.classList.add("bi", "btnPrd", "bi-arrow-90deg-up")
            wrapper.append(backBtn)
            backBtn.addEventListener('click', (e) => {
                const produseDiv = document.querySelectorAll('.btnPrd')
                produseDiv.forEach(function (el) {
                    el.remove()
                })
                allBtnCat.forEach(function (el) {
                    el.classList.remove('hide')
                })

            })


        }

    })
})

function quantityChanged(e) {
    const input = e.target
    if (isNaN(input.value)) {
        input.value = 1
    }
    updateCartTotal();
}


function removeItem(e) {
    e.target.parentElement.remove();
    updateCartTotal();
}

//Update cart total function
function updateCartTotal() {
    const produse = document.querySelectorAll('.rand')
    let total = 0;
    for (let i = 0; i < produse.length; i++) {
        const cartRow = produse[i];
        const priceElement = cartRow.getElementsByClassName('pret')[0]
        const qtyElement = cartRow.getElementsByClassName('qty')[0]
        let qty = qtyElement.value
        const price = parseFloat(priceElement.innerText.replace('lei', ''))
        total = total + (qty * price);
    }
    if (total < reducereInput.value) {
        total = total
    } else {
        total = total - reducereInput.value
    }
    document.querySelector('#total').innerText = total + ' lei'
}