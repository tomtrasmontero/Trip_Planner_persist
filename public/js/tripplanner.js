function Tripplanner(config){
  this.days = config.days;
  this.data = config.data;
  this.types = Object.keys(this.data);
  this.marker = config.marker;
  this.markers = {
    perm: this.marker
  };
  this.map = config.map;

  this.renderDayPicker(0);
  this.init();
}

Tripplanner.prototype._setBounds = function(){
  var bounds = new google.maps.LatLngBounds();
  Object.keys(this.markers).forEach(function(key){
    bounds.extend(this.markers[key].position);
  }, this);
  this.map.fitBounds(bounds);
}

Tripplanner.prototype.addMarker = function(item, type){
    var iconURLs = {
      hotels: '/images/lodging_0star.png',
      restaurants: '/images/restaurant.png',
      activities: '/images/star-3.png'
    };
    var pt = new google.maps.LatLng(item.place.location[0],item.place.location[1]);
    var marker = new google.maps.Marker({
        position: pt,
        title: item.name,
        icon: iconURLs[type] 
    });
    marker.setMap(this.map);
    this.markers[item.id + type] = marker;
    this._setBounds();
};

Tripplanner.prototype.removeMarker = function(item, type){
  var marker = this.markers[item.id + type];
  marker.setMap(null);
  delete this.markers[item.id + type];
  this._setBounds();
};

Tripplanner.prototype.clearMarkers = function(){
  Object.keys(this.markers).forEach(function(key){
    if(key !== 'perm')
      this.markers[key].setMap(null);
  }, this);
  this.markers = {
    perm: this.marker
  }
  this._setBounds();
};

Tripplanner.prototype.getItemByIdAndType = function(id, type){
  return this.data[type].filter(function(item){
    return item.id === id;
  })[0];
};

Tripplanner.prototype.renderItem = function(item, type){
  var li = $('<li class="list-group-item"></li>');
  li.html(item.name);
  li.attr('id', item.id);
  var list = $('ul[data-type=' + type +']');
  list.append(li);
  this.addMarker(item, type);
};

Tripplanner.prototype.renderDay = function(){
  this.clearMarkers();
  var day = this.days[this.currentIdx];
  var that = this;
  this.types.forEach(function(type){
    $('ul[data-type=' + type + ']').empty();
    var items = day[type];
    items.forEach(function(item){
      that.renderItem(item, type);
    });
  });
};

Tripplanner.prototype.renderDayPicker = function(index){
  this.currentIdx = index;
  var container = $('.day-buttons').empty();
  this.days.forEach(function(day, idx){
    var btn = $('<button class="btn btn-circle day-btn"></button>');
    btn.html(idx + 1);
    if(idx === index)
      btn.addClass('current-day');
    container.append(btn);
  });
  this.renderDay();
};

Tripplanner.prototype.addDay = function(){
  var day = this.types.reduce(function(memo, type){
    memo[type] = [];
    return memo;
  }, {});
  this.days.push(day);
  this.renderDayPicker(this.days.length - 1);
}

Tripplanner.prototype.removeDay = function(){
  if(this.days.length === 1)
    return;
  this.days.splice(this.currentIndex, 1);
  this.renderDayPicker(0);
};

Tripplanner.prototype.addItem = function(id, type){
  var item = this.getItemByIdAndType(id*1, type);
  this.days[this.currentIdx][type].push(item);
  this.renderItem(item, type);
};

Tripplanner.prototype.removeItem = function(idx, type, elem){
  var items = this.days[this.currentIdx][type];
  var item = items.splice(idx, 1)[0];
  $(elem).remove();
  this.removeMarker(item, type);
};

Tripplanner.prototype.init = function(){
  var that = this;
  $('#button-add').click(function(){
    that.addDay();
  });

  $('#button-remove').click(function(){
    that.removeDay();
  });

  $('.day-buttons').on('click', 'button', function(){
    that.currentIdx = $(this).index();
    $(this).siblings().removeClass('current-day');
    $(this).addClass('current-day');
    that.renderDay();
  });

  $('ul.list-group').on('click', 'li', function(){
    var type = $(this).parents('ul').attr('data-type');
    that.removeItem($(this).index(), type, this);
  });

  $('button[data-action]').click(function(){
    var select = $(this).prev();
    var type = select.attr('data-type');
    that.addItem(select.val(), type);
  });
}
