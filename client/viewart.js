var artLibrary = {
	theArt: new Array ()
	};

var imageSerialNum = 0;
var flPaused = false;
var ctSecsBetweenSwitches = 10, whenLastSwitch = new Date ();
var ixlastart = -1;
var idLastImg = undefined;

function removeDescriptionCrap (description) {
	var ix = description.indexOf ("https://");
	if (ix > 0) {
		description = stringMid (description, 1, ix);
		}
	description = trimWhitespace (description);
	return (description);
	}
function getUrlTweet (item) {
	var name = item.name;
	if (name === undefined) {
		name = "ArtPicsChannel";
		}
	return ("https://twitter.com/" + name + "/status/" + item.id);
	}
function viewPaused () {
	var s = "";
	if (flPaused) {
		s = "PAUSED";
		}
	$("#idPausedMessage").html (s);
	}
function viewArt (ixArray) {
	function showStats () {
		if (!flStatsShown) {
			var htmltext = "";
			function add (s) {
				htmltext += s;
				}
			add ("<div id=\"idStatsDiv\" style=\"display: none\">");
			add ("<span class=\"spTweetIcon\"><a href=\"" + getUrlTweet (item) + "\" target=\"_blank\" title=\"Click here for the tweet.\">" + twStorageConsts.fontAwesomeIcon + "</a></span>");
			add (description + ".");
			add ("</div>");
			$("#idStats").html (htmltext);
			
			$("#idStatsDiv").fadeIn (faderate);
			
			flStatsShown = true;
			}
		}
	var item = artLibrary.theArt [ixArray];
	var description = removeDescriptionCrap (item.text);
	var faderate = "slow";
	var flStatsShown = false;
	
	function viewNewImage () {
		var imgDisplayWidth = $("#idPageBody").width ();
		var ratio = imgDisplayWidth / item.w;
		var width = imgDisplayWidth;
		var height = item.h * ratio;
		var idImg = "idImg" + imageSerialNum++, whenstartload = new Date ();
		var style = "style='display: none;'";
		$("#idArtDisplay").html ("<img id=\"" + idImg + "\" src=\"" + item.url + "\" width=\"" + width + "\" height=\"" + height + "\" alt=\"" + item.text + "\"" + style + ">");
		$("#idTweetIcon").html ("");
		$("#" + idImg).on ("load", function () {
			$("#" + idImg).fadeIn (faderate, function () {
				showStats ();
				});
			idLastImg = idImg;
			});
		$("#" + idImg).on ("click", function () {
			console.log ("click");
			flPaused = !flPaused;
			viewPaused ();
			if (!flPaused) { //cause an immediate switch
				viewRandomArt ();
				}
			});
		setTimeout (function () {
			showStats ()
			}, 300);
		}
	
	$("#idStats").text ("");
	if (idLastImg === undefined) {
		viewNewImage ();
		}
	else {
		$("#" + idLastImg).fadeOut (faderate, function () {
			viewNewImage ();
			});
		}
	}
function viewRandomArt () {
	while (true) { //never repeat the same work of art
		var ix = random (0, artLibrary.theArt.length - 1);
		if (ix !== ixlastart) {
			viewArt (ix);
			ixlastart = ix;
			whenLastSwitch = new Date ();
			break;
			}
		}
	}
function switchArtIfReady () {
	if (!flPaused) {
		if (secondsSince (whenLastSwitch) >= ctSecsBetweenSwitches) {
			viewRandomArt ();
			}
		}
	}
