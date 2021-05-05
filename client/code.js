var appConsts = {
	urlTwitterServer: "http://twitter.happyfriends.camp/",
	version: "0.4.5"
	};

const urlArtJson = "https://raw.githubusercontent.com/scripting/artDownloader/main/data/art.json";

var whenLastUserAction = new Date ();

function readArtJson (callback) {
	readHttpFileThruProxy (urlArtJson, undefined, function (jsontext) {
		if (jsontext !== undefined) {
			artLibrary = JSON.parse (jsontext);
			if (callback !== undefined) {
				callback ();
				}
			}
		});
	}
function everyFiveMinutes () {
	readArtJson ();
	}
function everyMinute () {
	}
function everySecond () {
	switchArtIfReady ();
	}
function startup () {
	console.log ("startup");
	readArtJson (function () {
		viewRandomArt ();
		hitCounter ();
		console.log ("There are " + artLibrary.theArt.length + " works of art in the library.");
		self.setInterval (everySecond, 1000); 
		runEveryMinute (everyMinute);
		self.setInterval (everyFiveMinutes, 5 * 60000); 
		});
	}
