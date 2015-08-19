// Whole-script strict mode syntax
"use strict";

var initialRestaurants = [
  {
    name : "Smokin' T's",
    foodType : "bbq"
  },
  {
    name : "Real Urban Barbecue",
    foodType : "bbq"
  }
]

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 42.190220, lng: -87.941175},
    zoom: 12
  });
}

var Restaurant = function(data){
  this.name = ko.observable(data.name);
  this.foodType = ko.observable(data.foodType);
}

var ViewModel = function() {
  var self = this;

  this.restaurantList = ko.observableArray([]);

  initialRestaurants.forEach(function(item){
    self.restaurantList.push( new Restaurant(item) );
  });

  self.currentRestaurant = this.restaurantList()[0];
  
}

ko.applyBindings(new ViewModel());
