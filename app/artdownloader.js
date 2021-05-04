const myVersion = "0.4.1", myProductName = "artDownloader";

const fs = require ("fs");
const utils = require ("daveutils");
const request = require ("request");
const davetwitter = require ("davetwitter"); 

var config = {
	mediaFilePath: "data/images/",
	jsonFilePath: "data/json/",
	fnameStats: "stats.json",
	artJsonPath: "data/art.json",
	
	minSecsBetwChecks: 60 * 60, //1 hour
	
	artists: [
		"pablocubist", "artistklee", "artistrothko", "vangoghartist", "artistmanet", 
		"artistdegas", "cezanneart", "artistgauguin", "artistmorisot", "artist_dali", 
		"artistchagall", "artistmatisse", "franzmarcart", "artistpollock", "artistdekooning",
		"artfridakahlo", "artistrivera", "artistokeeffe", "artlichtenstein", "ArtistDaVinci",
		"fanmichelangelo", "artistraphael", "artistholbein", "artistbruegel", "artistmagritte",
		"artisthopper", "artistseurat"
		]
	};

var stats = {
	ctPictures: 0,
	whenLastPicture: undefined,
	artists: new Object ()
	};

const fnameConfig = "config.json";

var flStatsChanged = undefined;


function statsChanged () {
	flStatsChanged = true;
	}

function buildArtJson (callback) {
	var artArray = new Array (), whenstart = new Date ();
	var folderlist = fs.readdirSync (config.jsonFilePath);
	folderlist.forEach (function (foldername) {
		try {
			var folder = config.jsonFilePath + foldername;
			var filelist = fs.readdirSync (folder);
			filelist.forEach (function (filename) {
				var jsontext = fs.readFileSync (folder + "/" + filename).toString ();
				var jstruct = JSON.parse (jsontext);
				artArray.push (jstruct);
				});
			}
		catch (err) {
			}
		});
	fs.writeFile (config.artJsonPath, utils.jsonStringify (artArray), function (err) {
		if (err) {
			console.log ("buildArtJson: err.message == " + err.message + ", config.artJsonPath == " + config.artJsonPath);
			}
		});
	if (callback !== undefined) {
		callback (artArray);
		}
	}

function haveThisArt (screenname, fname) {
	try {
		var f = config.mediaFilePath + fname;
		fs.statSync (f);
		return (true);
		}
	catch (err) {
		return (false);
		}
	}
function addWorkOfArt (screenname, fname, theArt) {
	var f = config.jsonFilePath + screenname + "/" + utils.stringPopExtension (fname) + ".json";
	var jsontext = utils.jsonStringify (theArt);
	utils.sureFilePath (f, function () {
		fs.writeFile (f, jsontext, function (err) {
			});
		});
	console.log (jsontext);
	}
function downloadMedia (urlMedia, fname, screenname, callback) {
	var f = config.mediaFilePath + fname;
	utils.sureFilePath (f, function () {
		request (urlMedia).pipe (fs.createWriteStream (f));
		});
	}
function checkOneArtist (screenname) {
	var token = config.myAccessToken, secret = config.myAccessTokenSecret, now = new Date ();
	console.log ("checkOneArtist: screenname == " + screenname + ", now == " + now.toLocaleTimeString ());
	if (stats.artists [screenname] === undefined) {
		stats.artists [screenname] = {
			whenAdded: now,
			whenLastCheck: undefined,
			ctChecks: 0,
			ctErrors: 0,
			lastErrorMessage: undefined,
			id: undefined,
			idLastTweet: undefined,
			ctPictures: 0,
			whenLastPicture: undefined
			};
		}
	var myStats = stats.artists [screenname];
	myStats.whenLastCheck = now;
	myStats.ctChecks++;
	
	function getTwitterUserId (callback) {
		if (myStats.id !== undefined) {
			callback (undefined, myStats.id);
			}
		else {
			davetwitter.getUserInfo (token, secret, screenname, function (err, data) {
				if (err) {
					callback (err);
					}
				else {
					myStats.id = data.id_str;
					callback (undefined, myStats.id);
					}
				});
			}
		}
	getTwitterUserId (function (err, id) {
		if (!err) {
			davetwitter.getTimeline (token, secret, "user", id, myStats.idLastTweet, function (err, theTimeline) {
				if (err) {
					myStats.ctErrors++;
					myStats.lastErrorMessage = err.message;
					}
				else {
					theTimeline.forEach (function (theTweet, ix) {
						if (theTweet.retweeted_status === undefined) { //it's not a RT
							if (theTweet.entities.media !== undefined) {
								var mediaObject = theTweet.entities.media [0];
								if (mediaObject !== undefined) {
									var urlMedia = mediaObject.media_url;
									var width = mediaObject.sizes.large.w;
									var height = mediaObject.sizes.large.h;
									var fname = utils.stringLastField (urlMedia, "/");
									if (!haveThisArt (screenname, fname)) {
										addWorkOfArt (screenname, fname, {
											text: theTweet.full_text,
											url: urlMedia,
											fname,
											w: width,
											h: height,
											name: screenname,
											id: theTweet.id_str,
											when: new Date ()
											});
										downloadMedia (urlMedia, fname, screenname, function (err) {
											if (err) {
												console.log ("error downloading file " + fname + " == " + err.message);
												}
											else {
												console.log ("file " + fname + " has been downloaded");
												}
											});
										myStats.ctPictures++;
										myStats.whenLastPicture = now;
										stats.ctPictures++;
										stats.whenLastPicture = now;
										}
									}
								}
							}
						myStats.idLastTweet = theTweet.id_str; 
						});
					statsChanged ();
					}
				})
			}
		});
	}
function checkNextArtist () {
	var screenname, oldestCheck = new Date ();
	for (var i = 0; i < config.artists.length; i++) {
		var name = config.artists [i];
		if (stats.artists [name] === undefined) {
			screenname = name;
			break;
			}
		else {
			let whenLastCheck = new Date (stats.artists [name].whenLastCheck);
			if (utils.secondsSince (whenLastCheck) >= config.minSecsBetwChecks) {
				if (whenLastCheck < oldestCheck) {
					oldestCheck = whenLastCheck;
					screenname = name;
					}
				}
			}
		}
	if (screenname !== undefined) {
		checkOneArtist (screenname);
		}
	}
function everyMinute () {
	checkNextArtist ();
	}
function everySecond () {
	if (flStatsChanged) {
		flStatsChanged = false;
		fs.writeFile (config.fnameStats, utils.jsonStringify (stats), function (err) {
			});
		buildArtJson ();
		}
	}
function readConfig (f, config, callback) {
	fs.readFile (f, function (err, jsontext) {
		if (!err) {
			try {
				var jstruct = JSON.parse (jsontext);
				for (var x in jstruct) {
					config [x] = jstruct [x];
					}
				}
			catch (err) {
				console.log ("Error reading " + f);
				}
			}
		callback ();
		});
	}
readConfig (fnameConfig, config, function () {
	readConfig (config.fnameStats, stats, function () {
		config.flServerEnabled = false; 
		davetwitter.start (config);
		buildArtJson ();
		utils.runEveryMinute (everyMinute);
		setInterval (everySecond, 1000); 
		});
	});
