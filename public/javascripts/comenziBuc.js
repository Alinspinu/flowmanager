

const baseUrl = "http://localhost:3000";
const since = Date.now() - 5000; // only retrieve orders from the last 5 seconds
const url = `${baseUrl}/comanda/bucSend?since=${since}`;
const urlLocalSend = `${baseUrl}/api/orderDone`;
const eventSource = new EventSource(url);

const getOrdersUrl = `${baseUrl}/comanda/netBuc`;
fetch(getOrdersUrl)
  .then((res) => res.json())
  .then(orders => {
    for (const order of orders) {
      addOrder(order);
    }
  });

const dingSound = new Audio(`${baseUrl}/sounds/ding.mp3`);


//MANAGE ORDERS WHEN ARE ARIVE FROM DB

const newOrdersDiv = document.getElementById("new-orders");

eventSource.onmessage = (event) => {
  const order = JSON.parse(event.data);
  if (!order) {

  } else {
    addOrder(order, true);
  }
};

newOrdersDiv.addEventListener("click", (event) => {
  if (event.target.classList.contains("acceptata")) {
    const btnsTer = event.target;
    const orderId = btnsTer.closest(".list-group").querySelector(".hide").textContent;
    fetch(urlLocalSend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cmdId: orderId
      }),
    });
    btnsTer.parentElement.remove()
  }
});

function addOrder(order, withding) {
  // const newOrdersDiv = document.getElementById("new-orders");
  const orderDiv = document.createElement("div");
  orderDiv.classList.add('col-2', 'order', "appear");

  const date = new Date(order.creataLa);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const localTimeString = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");

  const productList = order.produse.map(product => `<li class="list-group-item">${product.cantitate} X ${product.nume}</li>`).join('');

  orderDiv.innerHTML = `
  <ul class="list-group">
  <li class="list-group-item">Comanda Nr: ${order.index}</li>
  <li class="list-group-item hide">${order._id}</li>
  <li class="list-group-item">Ora: ${localTimeString}</li>
  <li class="list-group-item">Masa Nr: ${order.nrMasa}</li>
  <li class="list-group-item"><strong style="font-size:19px;">Produse:</strong></li>
  <ul class="list-group">${productList}</ul>
  <button class="btn pending btn-danger">Accepta</button>
  <button class="btn acceptata hide btn-success">Terminat</button>
  </ul>
  `;
  if (withding) {
    //SET INTERVAL FOR ANIMATION
    const intervalId = setInterval(() => {
      orderDiv.classList.add('appear');
      setTimeout(() => {
        orderDiv.classList.remove('appear');
      }, 1000); // Hide the div after 1 second
    }, 1500);

    dingSound.addEventListener('ended', () => {
      dingSound.currentTime = 0;
      dingSound.play();
    });

    dingSound.play();

    const acceptaButton = orderDiv.querySelector('.pending');
    acceptaButton.addEventListener('click', () => {
      clearInterval(intervalId);
      dingSound.pause();
      dingSound.currentTime = 0;
      orderDiv.classList.remove('appear');

      // acceptaButton.classList.remove('pending');
      acceptaButton.classList.add('hide');
      const terminatButton = orderDiv.querySelector('.acceptata');
      terminatButton.classList.remove('hide');
    });
    newOrdersDiv.appendChild(orderDiv);
  } else {
    const acceptaButton = orderDiv.querySelector('.pending');
    // acceptaButton.classList.remove('pending');
    acceptaButton.classList.add('hide');
    const terminatButton = orderDiv.querySelector('.acceptata');
    terminatButton.classList.remove('hide');
    newOrdersDiv.appendChild(orderDiv);
  }
}

