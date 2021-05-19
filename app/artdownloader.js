const myVersion = "0.4.1", myProductName = "artDownloader";

const fs = require ("fs");
const utils = require ("daveutils");
const request = require ("request");
const davetwitter = require ("davetwitter"); 
const rss = require ("daverss");

var config = {
	mediaFilePath: "data/images/",
	jsonFilePath: "data/json/",
	fnameStats: "stats.json",
	artJsonPath: "data/art.json",
	rssFilePath: "data/rss.xml",
	
	maxArtArray: 1000, //how many random works of art in art array?
	
	
	idFanList: "1389951899424677888",
	
	minSecsBetwChecks: 60 * 60, //1 hour
	
	artists: [
		"pablocubist", "artistklee", "artistrothko", "vangoghartist", "artistmanet", 
		"artistdegas", "cezanneart", "artistgauguin", "artistmorisot", "artist_dali", 
		"artistchagall", "artistmatisse", "franzmarcart", "artistpollock", "artistdekooning",
		"artfridakahlo", "artistrivera", "artistokeeffe", "artlichtenstein", "ArtistDaVinci",
		"fanmichelangelo", "artistraphael", "artistholbein", "artistbruegel", "artistmagritte",
		"artisthopper", "artistseurat", "artprendergast", "artistwerefkin"
		],
	
	rssHeadElements: { 
		title: "Art Show",
		link: "http://artshow.scripting.com/",
		description: "Art images from fan feeds on Twitter, suitable for viewing in the Art Show web app.",
		language: "en-us",
		generator: myProductName + " v" + myVersion,
		docs: "http://cyber.law.harvard.edu/rss/rss.html",
		twitterScreenName: "davewiner",
		maxFeedItems: 100,
		flRssCloudEnabled: false, //we're saving the feed on github, long after the feed is built, so we can't do rssCloud
		rssCloudDomain: "rpc.rsscloud.io",
		rssCloudPort: 5337,
		rssCloudPath: "/pleaseNotify",
		rssCloudRegisterProcedure: "",
		rssCloudProtocol: "http-post"
		}
	
	};

var stats = {
	ctLaunches: 0,
	whenLastLaunch: undefined,
	
	ctPictures: 0,
	whenLastPicture: undefined,
	
	artists: new Object ()
	};

const fnameConfig = "config.json";

var flStatsChanged = undefined;


function testLists () {
	davetwitter.getListMembers (config.myAccessToken, config.myAccessTokenSecret, "1389951899424677888", function (err, data) {
		if (err) {
			console.log (err.message);
			}
		else {
			console.log (utils.jsonStringify (data));
			}
		});
	}

function statsChanged () {
	flStatsChanged = true;
	}
function getFanAccountsList (callback) {
	davetwitter.getListMembers (config.myAccessToken, config.myAccessTokenSecret, config.idFanList, function (err, theList) {
		if (err) {
			console.log ("getFanAccountsList: err.message == " + err.message);
			}
		else {
			config.artists = theList;
			stats.fanAccountsList = theList;
			statsChanged ();
			}
		if (callback !== undefined) {
			callback ();
			}
		});
	}
function buildRss (artArray) {
	var historyArray = new Array (), whenstart = new Date ();
	artArray.forEach (function (item) {
		historyArray.push ({
			title: item.text,
			link: "https://twitter.com/" + item.name + "/status/" + item.id,
			when: item.when,
			twitterScreenName: item.name,
			enclosure: {
				url: item.url,
				type: "image/jpeg",
				length: item.w * item.h //oh the humanity
				},
			guid: {
				flPermalink: false,
				value: item.id
				}
			});
		});
	var xmltext = rss.buildRssFeed (config.rssHeadElements, historyArray); //generate the RSS feed from the data
	fs.writeFile (config.rssFilePath, xmltext, function (err) {
		if (err) {
			console.log ("buildRss: err.message == " + err.message);
			}
		});
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
	
	var randomArtArray = new Array ();
	while (randomArtArray.length < config.maxArtArray) {
		var ix = utils.random (0, artArray.length - 1);
		if (artArray [ix] != null) {
			randomArtArray.push (artArray [ix]);
			}
		delete artArray [ix];
		if (artArray.length == 0) {
			break;
			}
		}
	
	console.log ("buildArtJson: randomArtArray.length == " + randomArtArray.length);
	
	var artLibrary = {
		theArt: randomArtArray
		};
	
	fs.writeFile (config.artJsonPath, utils.jsonStringify (artLibrary), function (err) {
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
function everyTenMinutes () {
	getFanAccountsList ();
	}
function everyMinute () {
	var now = new Date ();
	if ((now.getMinutes () % 10) == 0) {
		everyTenMinutes ();
		}
	checkNextArtist ();
	}
function everySecond () {
	if (flStatsChanged) {
		flStatsChanged = false;
		fs.writeFile (config.fnameStats, utils.jsonStringify (stats), function (err) {
			});
		buildArtJson (function (artArray) {
			buildRss (artArray);
			});
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
		getFanAccountsList (function () {
			stats.ctLaunches++;
			stats.whenLastLaunch = new Date ();
			statsChanged ();
			checkNextArtist (); //5/19/21 by DW -- don't wait till top of minute to check next artist
			utils.runEveryMinute (everyMinute);
			setInterval (everySecond, 1000); 
			});
		});
	});
