// Whole-script strict mode syntax
"use strict";
//var WIKIPEDIA_BASE = "https://en.wikipedia.org/w/api.php?action=query&titles=";
var WIKIPEDIA_BASE = "http://en.wikipedia.org/w/api.php?action=parse&format=json&redirects=&prop=wikitext&page=";
var DNR_URL = "http://dnr.state.il.us";
var OFFICIAL_INFO = "For more information visit the official webiste.<br>";
var UNABLE = "Unable";


var initialParks = [
  {
    name : "Illinois Beach",
    latLng : {lat: 42.423610, lng: -87.805419},
    activities:[
      "Bike Trails", "Camping", "Cross Country Skiing", "Fishing",
      "Geocaching", "Hiking Trails", "SCUBA Diving", "Swimming"
    ]
  },
  {
    name : "Moraine Hills",
    latLng : {lat: 42.309754, lng: -88.227623},
    activities:[
      "Bike Trails", "Boating", "Cross Country Skiing", "Fishing",
      "Geocaching", "Hiking Trails", "Hunting", "Metal Detecting",
      "Shelter Reservations"
    ]
  },
  {
    name : "Starved Rock",
    latLng : {lat: 41.319040, lng: -88.994262},
    activities:[
      "Boating", "Camping", "Fishing", "Hiking Trails", "Hunting"
    ]
  },
  {
    name : "Rock Cut",
    latLng : {lat: 42.342048, lng: -88.973447},
    activities:[
      "Bike Trails", "Boating", "Camping", "Cross Country Skiing",
      "Dog Training", "Equestrian Trails", "Fishing", "Geocaching",
      "Hiking Trails", "Hunting", "Metal Detecting", "Mountain Bike Trails",
      "Shelter Reservations", "Swimming"
    ]
  },
  {
    name : "Matthiessen",
    latLng : {lat: 41.347118, lng: -89.012106},
    activities:[
      "Picnicking", "Horseback Riding", "Equestrian Camping", "Hunting", "Trails"
    ]
  }
];

// Sort an array by the name property
function SortByName(a,b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name){
    return 1;
  }
  return 0;
}

function SetMapSize(WinWidth){
  console.log("Detected width: " + WinWidth);
  if (WinWidth < 753 ){
    $(".map-canvas").css("right", "0");
    $(".map-canvas").css("width", "100%");
    $(".map-canvas").css("top",   "170px");
  } else {
    $(".map-canvas").css("right", "16px");
    $(".map-canvas").css("width", "75%");
    $(".map-canvas").css("top",   "75px");
  }
}

function initialize(){
  map = new google.maps.Map(document.getElementById("park-map"), {
    center: {lat: 42.190220, lng: -87.941175},
    zoom: 8
  });

  var winWidth = document.body.parentNode.clientWidth;
  SetMapSize(winWidth);

  $(window).resize(function() {
    var winWidth = document.body.parentNode.clientWidth;
    SetMapSize(winWidth);
    google.maps.event.trigger(map, "resize");
    
  });

  parkViewModel.drawMarkers();
  parkViewModel.loadWikiInfo();
  parkViewModel.createInfoWindow();
}

var map;
function initMap() {
  google.maps.event.addDomListener(window, 'load', initialize);
}

var Park = function(data){
  this.name = ko.observable(data.name);
  this.latLng = ko.observable(data.latLng);
  this.activities = ko.observable(data.activities);
  this.officialUrl = "Unable to retrieve data from Wikipedia.";
};

var ViewModel = function() {
  var self = this;
  
  self.officialUrlCache = new Object();
  self.parkList = ko.observableArray();

  // Alphabetize the list of park names
  initialParks.sort(SortByName);
  initialParks.forEach(function(item){
    var park = new Park(item);
    // use an associative array to keep track of the official url
    self.officialUrlCache[park.name()] = park.officialUrl;
    self.parkList.push( park );
  });

  // Center the map on the markers
  self.centerMap = function() {
    var latLngBounds = new google.maps.LatLngBounds();
    self.parkList().forEach(function(item){
      latLngBounds.extend(item.marker.getPosition());
      map.setCenter(latLngBounds.getCenter());
      map.fitBounds(latLngBounds);   
    });
  };


  // Draw markers for every park in the park list
  self.drawMarkers = function() {
    // Loop throu each item in the park list
    self.parkList().forEach(function(item){
      item.marker = new google.maps.Marker({
        position: item.latLng(),
        title: item.name(),
        animation: google.maps.Animation.DROP
      });
      item.marker.setMap(map);

      // Add a click handler to the marker
      item.marker.addListener('click', function(){
        // Add a bounce animation when marker is clicked.
        item.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            item.marker.setAnimation(null);
        }, 700); // maps duration of one bounce

        // display additional information in an infowindow
        self.displayOfficialUrl(item);
      });
    });

    self.centerMap();
  };
  
  // Respond to letters typed in the search box
  self.search = function(value) {
    // Start by clearing all the markers from the map
    self.parkList().forEach(function(item){
      item.marker.setMap(null);
    });

    // then remove all parks from the park list
    self.parkList.removeAll();

    // search through all the parks looking for the entered text
    initialParks.forEach(function(item){
      // if the entered text is found, add the park to the park list
      if(item.name.toLowerCase().indexOf(value.toLowerCase()) >= 0){
        var park = new Park(item);

        //retrieve the official url from the url cache
        park.officialUrl = self.officialUrlCache[park.name()];
        self.parkList.push( park );
      }
    });

    // Draw the markers that matched the entered text
    self.drawMarkers();
  };
  
  // Retrieve data from the Wikipedia API
  self.loadWikiInfo = function() {
    self.parkList().forEach(function(item){
      var searchString = encodeURIComponent(item.name() + " State Park");
      var wikipediaUrl = WIKIPEDIA_BASE + searchString;
      $.ajax({
        url: wikipediaUrl,
        dataType: "jsonp",
        cache: true,
        success: function (data) {
                if( !(typeof data.parse === "undefined") ){
                  //look for urls inside the string returned from Wikipedia
                  var links = URI.withinString(data.parse.wikitext['*'], function(url){
                    //pull out the official website address by matching beginning of url
                    if(url.substring(0, DNR_URL.length) === DNR_URL){
                      item.officialUrl = url;
                      //save a copy of the url in an associative array
                      self.officialUrlCache[item.name()] = url;
                    }
                    return "<a>" + url + "</a>";
                  });
                } else {
                  console.log("Unable to retrieve wikipedia data for: " + item.name());
                }
              } 
      });
    });
  };

  //Function that displays official website url
  self.displayOfficialUrl = function (Park) {
    var titleText = "<h4>" + Park.name() + "</h4>";

    var  linkText = '<a href="' + Park.officialUrl + '" class="iw-text" ">' + OFFICIAL_INFO + '</a>';
    // If the call to wikipedia fails to retrieve a valid url
    if(Park.officialUrl.substring(0, UNABLE.length) === UNABLE){
      linkText = '';
    }

    var infoText = titleText + linkText;
    self.infoWindow.setContent(infoText);
    self.infoWindow.open(map, Park.marker);
  };

  //Function that is called when a park list item is clicked
  self.parkClick = function(Park, Event) {
    // Using jQuery, check for any active list items
    if($(".active").length){
      // clear any active list items
      $(".active").removeClass("active");
    }

    // Add the active class to the list item that was clicked.
    Event.target.className += " active";
    self.displayOfficialUrl(Park);
  };

  // The text that has been entered into the search box
  self.query = ko.observable('');

  // create an info window
  self.createInfoWindow = function() {
    self.infoWindow = new google.maps.InfoWindow({
      content: "View the official website"
    });
  };
};

var parkViewModel = new ViewModel();
ko.applyBindings(parkViewModel);
parkViewModel.query.subscribe(parkViewModel.search);
