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

function initMap(lon, lat) {

  if (map) {

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
          // source: new ol.source.TileJSON({
          //   url: "https://api.maptiler.com/maps/streets-v2/tiles.json?key=CtM10uhhBnnLZPJPfCxl",
          //   tileSize: 512,
          // }),
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
          geometry: new ol.geom.Point(
            ol.proj.fromLonLat([lon, lat])
          ) // Default position
        }),
      ]
    }),
    style: new ol.style.Style({
      image: new ol.style.Icon({
        src: "https://openlayers.org/en/latest/examples/data/icon.png",
      })
    }),
    name: "marker",
  });

  map.addLayer(marker);

  reverseGeocode(lon, lat); // Call reverse geocoding function with the current position
}

async function reverseGeocode(lon, lat) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || "Unknown City";
      const country = data.address.country || "Unknown Country";
      console.log(`You are in ${city}, ${country}.`);

      // Display the location details on the page
      const locationDiv = document.getElementById("location");
      locationDiv.innerHTML = `You are in <strong>${city}</strong>, <strong>${country}</strong>.<br>
      Your approximate address is: <strong>${data.address.house_number} ${data.address.road}, ${data.address.postcode}</strong>`;

    } else {
      console.error("No address found for the given coordinates.");
    }
  } catch (error) {
    console.error("Error during reverse geocoding:", error);
  }
}

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

function timeout() {
  setTimeout(() => {
    if (geolocation.getTracking()) {
      geolocation.setTracking(false); // Stop tracking after 5 seconds
      console.log("Tracking stopped after timeout");
      initMap(-123.003651, 49.251138); // Initialize the map with default position at BCIT SW01
    }
  }, 5000); // 5 seconds timeout
};