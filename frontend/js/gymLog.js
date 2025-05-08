console.log("Gym Log JS loaded");

const geolocation = new ol.Geolocation({
  tracking: true,
  projection: "EPSG:3857",
});

const map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        url: "https://api.maptiler.com/maps/streets-v2/tiles.json?key=CtM10uhhBnnLZPJPfCxl",
        tileSize: 512,
      }),
    }),
  ],
  target: "map",
  view: new ol.View({
    center: ol.proj.fromLonLat([0, 0]), // Default center
    zoom: 12,
  }),
});

document.getElementById("updateLocation").addEventListener("click", () => {
  geolocation.setTracking(true);
  console.log("Tracking started");
});

geolocation.on("change:position", () => {
  const coordinates = geolocation.getPosition();
  if (coordinates) {
    const [lon, lat] = ol.proj.toLonLat(coordinates);
    console.log("Geolocation position changed:", lat, lon);
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
    geolocation.setTracking(false); // Stop tracking after first position
  }
});