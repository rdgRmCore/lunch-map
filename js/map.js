// Whole-script strict mode syntax
"use strict";

var initialParks = [
  {
    name : "Illinois Beach State Park",
    latLng : {lat: 42.423610, lng: -87.805419}
  },
  {
    name : "Moraine Hills State Park",
    latLng : {lat: 42.309754, lng: -88.227623}
  },
  {
    name : "Starved Rock State Park",
    latLng : {lat: 41.319040, lng: -88.994262}
  }
]

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.190220, lng: -87.941175},
    zoom: 8
  });
  parkViewModel.drawMarkers();
}

var Park = function(data){
  this.name = ko.observable(data.name);
  this.latLng = ko.observable(data.latLng);
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
        title: item.name()
      });
      item.marker.setMap(map);
    });
  };
}

var parkViewModel = new ViewModel();
ko.applyBindings(parkViewModel);
