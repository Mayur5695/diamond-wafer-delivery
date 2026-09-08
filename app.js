let map;

let currentArea = 1;

let areas = {
  1: [],
  2: []
};

let markers = [];

let routeLine = null;


/* =========================
   GOOGLE MAP
========================= */

function initMap() {

  map = new google.maps.Map(
    document.getElementById("map"),
    {
      center: {
        lat: 19.0760,
        lng: 72.8777
      },

      zoom: 11
    }
  );

}


/* =========================
   CHANGE AREA
========================= */

function changeArea(area) {

  currentArea = area;

  document
    .querySelectorAll(".tab")
    .forEach((button, index) => {

      button.classList.toggle(
        "active",
        index + 1 === area
      );

    });

  displayLocations();

}


/* =========================
   GET CURRENT LOCATIONS
========================= */

function getLocations() {

  return areas[currentArea];

}


/* =========================
   EXTRACT LAT LNG
========================= */

function extractCoordinates(text) {

  let match = text.match(
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
  );

  if (match) {

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };

  }


  match = text.match(
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
  );

  if (match) {

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };

  }


  match = text.match(
    /(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/
  );

  if (match) {

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2])
    };

  }

  return null;

}


/* =========================
   LOAD LOCATIONS
========================= */

function loadLocations() {

  const text =
    document
      .getElementById("locationInput")
      .value
      .trim();


  if (!text) {

    alert(
      "WhatsApp locations paste करा."
    );

    return;
  }


  const lines =
    text
      .split(/\n+/)
      .map(x => x.trim())
      .filter(Boolean);


  const newLocations = [];


  lines.forEach((line) => {

    const coordinates =
      extractCoordinates(line);


    if (coordinates) {

      newLocations.push({

        lat: coordinates.lat,

        lng: coordinates.lng,

        delivered: false,

        paid: false

      });

    }

  });


  if (newLocations.length === 0) {

    alert(
      "Location सापडली नाही. Google Maps link paste करा."
    );

    return;
  }


  areas[currentArea] =
    newLocations;


  displayLocations();

}


/* =========================
   DISPLAY MAP LOCATIONS
========================= */

function displayLocations() {

  if (!map) return;


  /* Remove old markers */

  markers.forEach(marker => {

    marker.setMap(null);

  });

  markers = [];


  const locations =
    getLocations();


  locations.forEach(
    (location, index) => {

      const marker =
        new google.maps.Marker({

          position: {
            lat: location.lat,
            lng: location.lng
          },

          map: map,

          label: {
            text: String(index + 1),
            color: "white"
          },

          title:
            `Order ${index + 1}`

        });


      markers.push(marker);

    }
  );


  if (locations.length > 0) {

    map.setCenter({

      lat: locations[0].lat,

      lng: locations[0].lng

    });

    map.setZoom(12);

  }


  displayOrders();

  updateStats();

}


/* =========================
   CREATE ROUTE
========================= */

function createRoute() {

  const locations =
    getLocations();


  if (locations.length < 2) {

    alert(
      "Route साठी किमान 2 locations पाहिजेत."
    );

    return;
  }


  const path =
    locations.map(location => ({

      lat: location.lat,

      lng: location.lng

    }));


  if (routeLine) {

    routeLine.setMap(null);

  }


  routeLine =
    new google.maps.Polyline({

      path: path,

      geodesic: true,

      strokeWeight: 5,

      map: map

    });


  const bounds =
    new google.maps.LatLngBounds();


  path.forEach(point => {

    bounds.extend(point);

  });


  map.fitBounds(bounds);

}


/* =========================
   DELIVERY STATUS
========================= */

function toggleDelivered(index) {

  const locations =
    getLocations();


  locations[index].delivered =
    !locations[index].delivered;


  displayOrders();

  updateStats();

}


/* =========================
   PAYMENT STATUS
========================= */

function togglePayment(index) {

  const locations =
    getLocations();


  locations[index].paid =
    !locations[index].paid;


  displayOrders();

  updateStats();

}


/* =========================
   DISPLAY ORDERS
========================= */

function displayOrders() {

  const container =
    document.getElementById("orders");


  const locations =
    getLocations();


  if (locations.length === 0) {

    container.innerHTML =
      `<p class="empty">
        No orders loaded.
      </p>`;

    return;

  }


  container.innerHTML = "";


  locations.forEach(
    (location, index) => {


      const order =
        document.createElement("div");


      order.className =
        "order";


      order.innerHTML = `

        <div class="order-number">
          ${index + 1}
        </div>


        <div class="order-info">

          <strong>
            Order ${index + 1}
          </strong>

          <br>

          📍
          ${location.lat.toFixed(5)},
          ${location.lng.toFixed(5)}

          <br>

          Delivery:

          <span class="${
            location.delivered
              ? "delivered"
              : "pending"
          }">

            ${
              location.delivered
                ? "Delivered"
                : "Pending"
            }

          </span>

          <br>

          Payment:

          <span class="${
            location.paid
              ? "paid"
              : "payment-pending"
          }">

            ${
              location.paid
                ? "Received"
                : "Pending"
            }

          </span>

        </div>


        <div class="order-actions">


          <button
            class="${
              location.delivered
                ? "secondary"
                : "success"
            }"

            onclick="
              toggleDelivered(${index})
            "
          >

            ${
              location.delivered
                ? "↩ Undo"
                : "✓ Delivered"
            }

          </button>


          <button
            class="${
              location.paid
                ? "secondary"
                : "primary"
            }"

            onclick="
              togglePayment(${index})
            "
          >

            ${
              location.paid
                ? "↩ Payment"
                : "₹ Payment"
            }

          </button>


          <button
            class="secondary"

            onclick="
              navigateTo(${index})
            "
          >

            🧭 Navigate

          </button>


        </div>

      `;


      container.appendChild(order);

    }
  );

}


/* =========================
   GOOGLE MAP NAVIGATION
========================= */

function navigateTo(index) {

  const location =
    getLocations()[index];


  const url =
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${location.lat},${location.lng}`;


  window.open(
    url,
    "_blank"
  );

}


/* =========================
   UPDATE SUMMARY
========================= */

function updateStats() {

  const locations =
    getLocations();


  const total =
    locations.length;


  const delivered =
    locations.filter(
      x => x.delivered
    ).length;


  const pending =
    total - delivered;


  const paymentPending =
    locations.filter(
      x => !x.paid
    ).length;


  document.getElementById("total")
    .innerText = total;


  document.getElementById("delivered")
    .innerText = delivered;


  document.getElementById("pending")
    .innerText = pending;


  document.getElementById("paymentPending")
    .innerText =
      paymentPending;

}


/* =========================
   CLEAR LOCATIONS
========================= */

function clearLocations() {

  areas[currentArea] = [];


  document.getElementById(
    "locationInput"
  ).value = "";


  markers.forEach(marker => {

    marker.setMap(null);

  });


  markers = [];


  if (routeLine) {

    routeLine.setMap(null);

    routeLine = null;

  }


  displayOrders();

  updateStats();

}
