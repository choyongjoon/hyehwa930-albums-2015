var fs = require('fs');
var htmlparser = require('htmlparser2');
var Browser = require('zombie');
var async = require('async');

var albums = [];
var album;

var inputFile = 'test.html';
var outputFile = 'test.json';

if (process.argv.length == 4) {
  inputFile = process.argv[2];
  outputFile = process.argv[3];
}

var parser = new htmlparser.Parser({
  onopentag: function(name, attribs) {
    if (name === "a" && attribs.class) {
      if (attribs.class.search("_album") > -1) {
        album = {};
        album.name = attribs.title.replace(/<(?:.|\n)*?>/gm, '').replace(/^[0-9]*집 /,'').replace(/\&amp;/g,"&");
        album.albumId = parseInt(attribs.href.substr(25));

        var lastAlbumId = -1;
        if (albums.length > 0) {
          lastAlbumId = albums[albums.length - 1].albumId;
        }
        if (lastAlbumId != album.albumId) albums.push(album);
      }
    }
  }
}, {decodeEntities: true});

fs.readFile(inputFile, 'utf8', function(err, text) {
  if (err) throw err;

  // parse list html
  parser.write(text);
  parser.end();

  // get additional album info
  async.map(albums, getAlbumInfoNaver, function(err, results){
    fs.writeFile(outputFile, JSON.stringify(results), function(err) {
      if (err) throw err;
      console.log('It\'s saved in ' + outputFile + '!');
    });
  });
});

function getAlbumInfoNaverCallback(browser, callback){
  var album = {};
  var artistNodes = browser.queryAll(".uc_p_lk > a");
  if (artistNodes){
    album.artist = "";
    album.artist_alt = "";
    for (var i = 0; i < artistNodes.length; ++i){
      var artistNode = artistNodes[i];
      var artist = artistNode.innerHTML.replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/\&amp;/g,"&");

      if (artist.search(/[가-힣ㄱ-ㅎㅏ-ㅣ]/) > -1) {  // 한글을 포함하고
        if (artist.search(/\(.+\)/) > -1) {       // 괄호가 있으면 영어 이름으로 간주
          album.artist_alt = album.artist_alt + ", " + artist.replace(/.+\(/,'').replace(/\)/,'');
          album.artist = album.artist + artist.replace(/\(.+\)/,'');
        }
        else {
          album.artist = album.artist + artist;
        }
      }
      else {
        album.artist = album.artist + artist;
      }
    }
  }
  // fill Various Artists
  if (!album.artist || album.artist === ""){
    album.artist = "Various Artists";
    album.artist_alt = "Various Artists";
  }

  var genreNode = browser.query("li.uc_lst:nth-child(3) > span:nth-child(1)");
  if (genreNode) {
    var genreAndRelDate = genreNode.innerHTML.split('<span class="bar"></span>');
    album.genre = genreAndRelDate[0].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    var relDate = genreAndRelDate[1];
    if (!relDate) relDate = genreAndRelDate[0];
    var dateArray = relDate.split('.');
    if (dateArray.length == 1) {
      album.rel_date = new Date(dateArray[0], 0, 1);
    } else if (dateArray.length == 2) {
      album.rel_date = new Date(dateArray[0], dateArray[1]-1, 1);
    } else if (dateArray.length == 3) {
      album.rel_date = new Date(dateArray[0], dateArray[1]-1, dateArray[2]);
    }
  }
  else {
    album.genre = "";
  }
  return callback(null, album);
}

function getAlbumInfoNaver(album, callback){
  var browser = new Browser();
  browser.runScripts = false;
  browser.userAgent = "mozilla/5.0 (iphone; cpu iphone os 7_0_2 like mac os x) applewebkit/537.51.1 (khtml, like gecko) version/7.0 mobile/11a501 safari/9537.53";

  var albumId = album.albumId;
  browser.visit("http://m.music.naver.com/album/index.nhn?albumId=" + albumId, function() {
    getAlbumInfoNaverCallback(browser, function(err, album2) {
      album.genre = album2.genre;
      album.start = album2.rel_date.format("yyyy-MM-dd");
      album.artist = album2.artist;
      callback(err, album);
    });
  });
}

Date.prototype.format = function(f) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
Number.prototype.zf = function(len){return this.toString().zf(len);};
