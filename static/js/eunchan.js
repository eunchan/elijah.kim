'use strict';

// Menubar: Hamburger control
document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {

      // Add a click event on each of them
      $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {

          // Get the target from the "data-target" attribute
          const target = el.dataset.target;
          const $target = document.getElementById(target);

          // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active');
          $target.classList.toggle('is-active');

        });
      });
    }

});

//======================= MAP ==================================================
//
function getJSON(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(JSON.parse(this.responseText));
    };
    xhr.open("GET", url, true);
    xhr.send();
}
// Specify features and elements to define styles.
var styleArray = [
    {
      featureType: "all",
      stylers: [
       { saturation: -80 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { hue: "#0b6db7" },
        { saturation: 50 }
      ]
    },{
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
];

function initMap(lat,lng, zoom) {
    console.log("Position : " + lat + ", " + lng);
    var latlng = new google.maps.LatLng(lat, lng);
    var mapOptions = {
        center: latlng,
        scrollwheel: false,
        // Apply the map style array to the map.
        styles: styleArray,
        zoom: zoom
    };

    //var map = new google.maps.Map(mapCanvas, mapOptions);
    var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    getJSON("/sky/sites.json", sites => {
        for (let item of sites) {
            createSite(item, map);
        }
        map.setCenter(latlng);
    });
}

function createSite(site, map) {
    var marker = new google.maps.Marker({
		position: new google.maps.LatLng(site.lat, site.lng),
        map: map,
        clickable: true,
        icon: "/static/img/map-marker-small.png"
        });
    var infowindow = new google.maps.InfoWindow({
        content: "<a href='"
            + site.url
            + "'><strong>"
            + site.name
            + "</strong></a><br>"
            + site.descript
        });
    google.maps.event.addListener(marker, 'click', () => {
        infowindow.open(marker.get('map'), marker);
        });
}

if (typeof mapPosition != "undefined") {
    var lat, lng, zoom;
    if (mapPosition[0] == 0 && mapPosition[1] == 0) {
        lat = 37.67;
        lng = -120.91;
        zoom = 7;
    } else {
        lat = mapPosition[0];
        lng = mapPosition[1];
        zoom = 15;
    }
    google.maps.event.addDomListener(document.getElementById('map_canvas'),
       "load",
       initMap(lat, lng, zoom));
}
//----------------------- MAP --------------------------------------------------
