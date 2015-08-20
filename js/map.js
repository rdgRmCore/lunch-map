// Whole-script strict mode syntax
"use strict";

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
    name : "Chain O'Lakes",
    latLng : {lat: 42.457765, lng: -88.200289},
    activities:[
      "Archery Range", "Bike Trails", "Boating", "Camping",
      "Cross Country Skiing", "Equestrian Trails", "Fishing",
      "Hiking Trails", "Hunting", "Metal Detecting", "Shelter Reservations"
    ]
  }
]

function initialize(){
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: {lat: 42.190220, lng: -87.941175},
    zoom: 8
  });
  parkViewModel.drawMarkers();
}

var map;
function initMap() {
  google.maps.event.addDomListener(window, 'load', initialize);
/*
  map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: {lat: 42.190220, lng: -87.941175},
    zoom: 8
  });
  parkViewModel.drawMarkers();
*/
}

var Park = function(data){
  this.name = ko.observable(data.name);
  this.latLng = ko.observable(data.latLng);
  this.activities = ko.observable(data.activities);
}

var ViewModel = function() {
  var self = this;

  this.parkList = ko.observableArray([]);

  initialParks.forEach(function(item){
    self.parkList.push( new Park(item) );
  });

  this.drawMarkers = function() {
    self.parkList().forEach(function(item){
      item.marker = new google.maps.Marker({
        position: item.latLng(),
        title: item.name(),
        animation: google.maps.Animation.DROP
      });
      item.marker.setMap(map);
    });
  };
}

var parkViewModel = new ViewModel();
ko.applyBindings(parkViewModel);

