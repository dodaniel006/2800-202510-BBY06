console.log("Gym Log JS loaded");

const map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.TileJSON({
        url: "https://api.maptiler.com/maps/basic-v2/tiles.json?key=jMM6JmEYJJVW4Ydny1Mv",
        tileSize: 512,
      }),
    }),
  ],
  target: "map",
  view: new ol.View({
    center: ol.proj.fromLonLat([0, 0]),
    zoom: 2,
  }),
});
