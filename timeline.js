function loadJSON(path, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', path, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
    callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

Handlebars.registerHelper('imgSrc', function(albumId) {
  function pad3(num) {
    var s = "00" + num;
    return s.substr(s.length-3);
  }
  var folder1 = Math.floor(albumId/1000000);
  var folder2 = Math.floor((albumId - folder1*1000000)/1000);
  var imgSrc = 'http://musicmeta.phinf.naver.net/album/' + pad3(folder1) + '/' + pad3(folder2) + '/' + albumId + '.jpg?type=r300Fll';
  return imgSrc;
});

var timeline;

document.addEventListener('DOMContentLoaded', function() {
  // create a handlebars template
  var source   = document.getElementById('item-template').innerHTML;
  var template = Handlebars.compile(document.getElementById('item-template').innerHTML);

  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');

  // Configuration for the Timeline
  var options = {
    margin: { axis: 2, item: 2 },
    max: "2015-12-31",
    min: "2015-01-01",
    orientation: { axis: 'both', item: 'top' },
    // stack: false,
    template: template,
    timeAxis: {scale: 'day', step: 5},
    zoomMax: 2700000000,
    zoomMin: 2700000000,
    zoomable: false
  };

  var genres = ['록', '모던록', '포크', '팝', '댄스&일렉트로닉', '랩&힙합', '알앤비&소울', '재즈&크로스오버'];
  var groups = new vis.DataSet();
  for (var g = 0; g < genres.length; g++) {
    groups.add({id: g, content: genres[g]});
  }

  loadJSON('albums.json', function success(data) {
    // Create a DataSet (allows two way data-binding)
    var albums = JSON.parse(data);
    albums.map(function(e, i, arr) {
      e.group = genres.indexOf(e.genre);
      return e;
    });
    var items = new vis.DataSet(albums);

    // Create a Timeline
    timeline = new vis.Timeline(container, items, options);
    timeline.setGroups(groups);
  });
});

document.getElementById('m1').onclick = function() {
  timeline.moveTo('2015-01-16');
};
document.getElementById('m2').onclick = function() {
  timeline.moveTo('2015-02-16');
};
document.getElementById('m3').onclick = function() {
  timeline.moveTo('2015-03-16');
};
document.getElementById('m4').onclick = function() {
  timeline.moveTo('2015-04-16');
};
document.getElementById('m5').onclick = function() {
  timeline.moveTo('2015-05-16');
};
document.getElementById('m6').onclick = function() {
  timeline.moveTo('2015-06-16');
};
document.getElementById('m7').onclick = function() {
  timeline.moveTo('2015-07-16');
};
document.getElementById('m8').onclick = function() {
  timeline.moveTo('2015-08-16');
};
document.getElementById('m9').onclick = function() {
  timeline.moveTo('2015-09-16');
};
document.getElementById('m10').onclick = function() {
  timeline.moveTo('2015-10-16');
};
document.getElementById('m11').onclick = function() {
  timeline.moveTo('2015-11-16');
};
document.getElementById('m12').onclick = function() {
  timeline.moveTo('2015-12-16');
};
