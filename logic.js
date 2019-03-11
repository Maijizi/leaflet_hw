// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createMap(earthquakes,heat,legend) {

  // Define outdoormap and darkmap layers
  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoormap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,

  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [outdoormap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  legend.addTo(myMap);
  
};


// Perform an API call to the USGS endpoint
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(infoRes) {

  // When the first API call is complete, perform another call to the USGS endpoint
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(statusRes) {
    
    createFeatures (infoRes.features,statusRes.features);
});
});

function createFeatures(earthquakeData) {

	var latlngs = [];

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place magnitudde and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + " | Mag:" + feature.properties.mag +
    "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  function getColor(mag){

    return mag > 5 ? "#CB4335":
            mag >= 4 ? "#F5CBA7":
            mag >= 3 ? "#FAD7A0":
            mag >= 2 ? "#F9E79F":
            mag >= 1 ? "#ABEBC6":
                      "#71F41C";

  }

  function circle_markers(feature, latlng) {
    latlngs.push(latlng);
    var color = "";
    var geojsonMarkerOptions = {
      radius: feature.properties.mag * 5,
      fillColor: getColor(feature.properties.mag),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
      dashArray: "15 15",
      dashSpeed: 30
    };
    return L.circleMarker(latlng, geojsonMarkerOptions);
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: circle_markers 
  });

  var heat = new HeatmapOverlay(latlngs, {radius: 100});

  // Set up the legend
  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function(myMap) {

    var div = L.DomUtil.create('div', 'info legend');
    var colors = ["#71F41C", "#ABEBC6", "#F9E79F", "#FAD7A0", "#F5CBA7", "#CB4335"];
    var labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < colors.length; i++) {
      labels.push(
        '<i style="background:' + colors[i] + '"></i> '
        + i + ((i+1)<colors.length ? "- "+(i+1) + '<br>': '+')
    );       
  }
  div.innerHTML += labels.join('');
  return div;
  
};

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes,heat,legend);
}







