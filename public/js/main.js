$(document).ready(function() {
 
  var map = L.map('map').setView([51.505, -0.09], 7);

  L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // create a red polyline from an array of LatLng points
  

  // $.get('/trainroute/51.49525580151895/-0.14454440832058144/51.143702673025764/0.8761972180580169', function(res) {
    
  //   var latlngs = [];
  //   var points = res.route[0];
  //   for (var i=0; i<points.length; i++) {
  //     latlngs.push(L.latLng(points[i][1],points[i][0]))
  //   }
  //   var polyline = L.polyline(latlngs, {color: 'green'}).addTo(map);

  //   // zoom the map to the polyline
  //   map.fitBounds(polyline.getBounds());
  // });

  var StationIcon = L.Icon.Default.extend({
    options: {
          iconUrl: 'img/marker-icon.png' 
    }
  });
         


  $.get('/stations', function(result) {
    var stations = result.stations;

    var markers = L.markerClusterGroup();
     
    for (var i=0; i<stations.length; i++) {
      var station = stations[i];
      var stationIcon = new StationIcon();
      markers.addLayer(L.marker([station.lat, station.lng],{icon: stationIcon}).bindPopup(station.name));

    }
    map.addLayer(markers);
  });
});

        