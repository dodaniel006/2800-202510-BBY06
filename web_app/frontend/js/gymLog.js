// =========================
// 1. Initialization
// =========================
console.log("Gym Log JS loaded");

const geolocation = new ol.Geolocation({
  tracking: true,
  projection: "EPSG:3857",
  trackingOptions: {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 6000,
  },
});

let map = null; // Declare map variable outside the function
let lon, lat; // Declare lon and lat variables outside the function

// =========================
// 2. Map Initialization
// =========================
function initMap(lon, lat) {
  if (map) {
    // Update the map view with the new coordinates
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
    map.getView().setZoom(13); // Zoom in on the new position
    map.getLayers().forEach((layer) => {
      if (layer.get("name") === "marker") {
        layer.getSource().getFeatures()[0].setGeometry(
          new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
        );
      }
    });
  } else {
    console.log("Initializing map.");

    map = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(), // Use OpenStreetMap as the tile source
        }),
      ],
      target: "map",
      view: new ol.View({
        center: ol.proj.fromLonLat([lon, lat]),
        zoom: 13, // Default zoom level
      }),
    });
  }

  const marker = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [
        new ol.Feature({
          geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat])), // Default position
        }),
      ],
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        src: "https://openlayers.org/en/latest/examples/data/icon.png",
      }),
    }),
    name: "marker",
  });

  map.addLayer(marker);

  reverseGeocode(lon, lat); // Call reverse geocoding function with the current position
}

// =========================
// 3. Reverse Geocoding
// =========================
async function reverseGeocode(lon, lat) {
  fetch(`/api/gym/reverseGeocode?lon=${lon}&lat=${lat}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.status} ${response.error}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Reverse Geocoding Data:", data);

      if (data.address) {
        const locationDiv = document.getElementById("userLocation");
        const city = data.address.city || data.address.town || data.address.village || "Unknown City";
        const area = data.address.state || data.address.country || "Unknown area";
        locationDiv.innerHTML = `You are in <strong><span id="userCity">${city}</span></strong>, <strong><span id="userArea">${area}</span></strong>.`;
        console.log(`You are in ${city}, ${area}.`);

        // Display the location details on the page
        if (data.address.house_number && data.address.road && data.address.postcode) {
          locationDiv.innerHTML += `<br>Your approximate address is: <strong>${data.address.house_number}
                    ${data.address.road}, ${data.address.postcode}</strong>`;
        }
      }

    })
    .catch((error) => {
      console.error("Error in reverse geocoding:", error);
    });
}

// =========================
// 4. Geolocation Event Handlers
// =========================
geolocation.on("change:position", () => {
  // Get the current position of the user
  const coordinates = geolocation.getPosition();

  if (coordinates) {
    [lon, lat] = ol.proj.toLonLat(coordinates);
    console.log("Geolocation position changed:", lat, lon);
    initMap(lon, lat); // Initialize the map with the current position
    geolocation.setTracking(false); // Stop tracking after first position
  }
});

geolocation.on("error", (error) => {
  console.error("Geolocation error:", error.message);
  initMap(-123.003651, 49.251138); // Initialize the map with default position at BCIT SW01
  geolocation.setTracking(false); // Stop tracking on error
});

// =========================
// 5. Button Event Listeners
// =========================
document.getElementById("resetView").addEventListener("click", () => {
  initMap(lon, lat); // Reset the map to the last known position
  console.log("Resetting View...");
  timeout(); // Start the timeout for tracking
});

document.getElementById("updateLocation").addEventListener("click", () => {
  geolocation.setTracking(true);
  console.log("Updating Location...");
  timeout(); // Start the timeout for tracking
});

document.getElementById("submitUserInfo").addEventListener("click", async () => {
  const gymName = document.getElementById("gymName").value;
  const place = document.getElementById("place").value;
  const userLocation = document.getElementById("userArea").innerText;
  // Send the user info to the server
  fetch("/api/gym/submitGymInfo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gymName,
      place,
      userLocation,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.status} ${response.error}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Location Successfully Parsed", data.data[0]);
      document.getElementById("gymLocation").innerHTML = data.data[0].display_name;
    })
    .catch((error) => {
      console.error("Error submitting user info:", error);
    });
});

// =========================
// 6. Timeout Function
// =========================
function timeout() {
  setTimeout(() => {
    if (geolocation.getTracking()) {
      geolocation.setTracking(false); // Stop tracking after 5 seconds
      console.log("Tracking stopped after timeout");
      initMap(-123.003651, 49.251138); // Initialize the map with default position at BCIT SW01
    }
  }, 5000); // 5 seconds timeout
}