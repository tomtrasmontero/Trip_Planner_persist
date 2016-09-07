var router = require('express').Router();
var Day = require('../models/day');
var Meal = require('../models/meal');
var Restaurant = require('../models/restaurant');
var Place = require('../models/place');
module.exports = router;

router.get('/', function(req, res, next){
  var meals = {
    model: Meal,
    include: [ { 
      model: Restaurant,
      include: [ Place ]
    } ]
  };
  Day.findAll({ include: [ meals ]})
    .then(function(days){
      return days.map(function(day){
        var obj = {};
        obj.id = day.id;
        obj.restaurants = day.meals.map(function(meal){ 
          return meal.restaurant;
        });
        obj.hotels = [];
        obj.activities = [];
        return obj;
      });
    })
    .then(function(days){
      res.send(days);
    })
    .catch(next);
});
