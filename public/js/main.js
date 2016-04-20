$(document).ready(function() {
  var map = L.map('map').setView([51.505, -0.09], 13);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // create a red polyline from an array of LatLng points
  

  $.get('/trainroute/51.49525580151895/-0.14454440832058144/51.143702673025764/0.8761972180580169', function(res) {
    
    var latlngs = [];
    var points = res.route[0];
    for (var i=0; i<points.length; i++) {
      latlngs.push(L.latLng(points[i][1],points[i][0]))
    }
    var polyline = L.polyline(latlngs, {color: 'green'}).addTo(map);

    // zoom the map to the polyline
    map.fitBounds(polyline.getBounds());
  });
});
