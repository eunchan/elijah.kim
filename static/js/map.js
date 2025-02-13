// Eunchan MAP.jsx

function clkWindow(site) {
    return "<a href='"
        + site.url 
        + "'><strong>" 
        + site.name
        + "</strong></a><br>"
        + site.descript;
}

function createSite(site) {
    // var markerImg = {
    //     url: '/static/img/map-marker-small.png',
    //     size: new google.maps.Size(16, 16),
    //     origin: new google.maps.Point(0, 0),
    //     anchor: new google.maps.Point(0, 32)
    // };

    var marker = new google.maps.Marker({
		position: new google.maps.LatLng(site.lat, site.lng),
        map: map,
        clickable: true,
        icon: "/static/img/map-marker-small.png",
        });
    var infowindow = new google.maps.InfoWindow({
        content: clkWindow(site)
        });
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(marker.get('map'), marker);
        });
}

var map;

var fDebug = false;

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

function initializeSite(lat,lng) {
    var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        //mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
        // Apply the map style array to the map.
        styles: styleArray,
        zoom: 15
    };
    
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    $.getJSON("/sky/sites.json", function(sites) {
        console.log(sites);
        sites.forEach( function (item) {
            createSite(item);            
        });
        // ES6 format
        /*sites.forEach((item) => {
            createSite(item);
        });*/
    });
}

function initialize() {
    console.log("Run initialize()");
    var mapOptions = {
        mapTypeControlOptions: { 
            mapTypeIds: [google.maps.MapTypeId.ROADMAP,
                        google.maps.MapTypeId.SATELLITE,
                        google.maps.MapTypeId.HYBRID,
                        ]
        },
        mapTypeControl: true,
        scrollwheel: false,
        
        // Apply the map style array to the map.
        styles: styleArray,
        zoom:7
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    
    console.log("Fetching sites.json");

    $.getJSON("/sky/sites.json", function(sites) {
        console.log(sites);
        sites.forEach(function(item) {
            createSite(item);
        });
        // ES6 format
        /*sites.forEach((item) => {
            createSite(item);
            //mapBounds.extend(new google.maps.LatLng(item.lat, item.lng));
        });*/
        
        console.log("Parsing JSON and extends boundary is completed");
        
        map.setCenter(new google.maps.LatLng(37.67, -120.91));
        console.log("Center :", new google.maps.LatLng(37.67, -120.91));
    });   
}