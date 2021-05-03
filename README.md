# artDownloader

A collection of great art in <a href="https://github.com/scripting/artDownloader/tree/main/data/images">one big folder</a>. Download and point your screen saver at the folder for a live art show.

### How to use

1. <a href="https://github.com/scripting/artDownloader/archive/refs/heads/main.zip">Download</a> the folder.

2. Unzip it.

3. In your Settings app, open the Screen Saver panel, and choose the <a href="https://github.com/scripting/artDownloader/tree/main/data/images">images</a> sub-folder of the data folder. 

4. When your system is in idle, enjoy an art show on your desktop. Or set it up on a screen in your living room or lobby, for an art show for your friends.

### The story

I had some time this weekend to do a little software project I've wanted to do for a while, it was only recently possible. 

It's a growing folder of great art, for use in a screen saver, or whatever other app you might have in mind. 

Bill Gates has this in his house, but you shouldn't have to be rich to have your life enriched by art. 

It's possible because there's a relatively new thing on Twitter, where people have adopted famous artists, they post their great works, and retweet works of other famous artist accounts, so it's like a little social network of great art.

I have an app that downloads the art from those accounts. That app, in source, is in the app folder here. The data it downloads is in the data folder, offered in both image and json formats. The images are what you should point your screen saver at. 

### Running the app

You can totally enjoy the art without running the app. I'm including it here so other developers who have ideas don't have to reimplement what I've already got running.

The app is written in JavaScript designed to run in Node.js.

Assuming you know how to run a Node app, you have to create a config.json file with four elements. 

3. twitterConsumerKey

4. twitterConsumerSecret

1. myAccessToken

2. myAccessTokenSecret

The first two bits identify the Twitter app you running from. You can create an app on <a href="https://developer.twitter.com/en/portal/projects-and-apps">this page</a> at Twitter's developer website.

The second two bits identify you as a user. You can generate these using the <a href="https://developer.twitter.com/en/portal/projects-and-apps">same page</a> on twitter.com.

I've included an example config.json file in the folder with fake data. 

If you leave the app running, it'll check every feed about once an hour and download the new images. 

### The fan feeds

Here's a list of the first 26 feeds my app is following.

1. <a href="http://twitter.com/artfridakahlo">artfridakahlo</a>

1. <a href="http://twitter.com/artist_dali">artist_dali</a>

1. <a href="http://twitter.com/artistbruegel">artistbruegel</a>

1. <a href="http://twitter.com/artistchagall">artistchagall</a>

1. <a href="http://twitter.com/ArtistDaVinci">ArtistDaVinci</a>

1. <a href="http://twitter.com/artistdegas">artistdegas</a>

1. <a href="http://twitter.com/artistdekooning">artistdekooning</a>

1. <a href="http://twitter.com/artistgauguin">artistgauguin</a>

1. <a href="http://twitter.com/artistholbein">artistholbein</a>

1. <a href="http://twitter.com/artisthopper">artisthopper</a>

1. <a href="http://twitter.com/artistklee">artistklee</a>

1. <a href="http://twitter.com/artistmagritte">artistmagritte</a>

1. <a href="http://twitter.com/artistmanet">artistmanet</a>

1. <a href="http://twitter.com/artistmatisse">artistmatisse</a>

1. <a href="http://twitter.com/artistmorisot">artistmorisot</a>

1. <a href="http://twitter.com/artistokeeffe">artistokeeffe</a>

1. <a href="http://twitter.com/artistpollock">artistpollock</a>

1. <a href="http://twitter.com/artistraphael">artistraphael</a>

1. <a href="http://twitter.com/artistrivera">artistrivera</a>

1. <a href="http://twitter.com/artistrothko">artistrothko</a>

1. <a href="http://twitter.com/artlichtenstein">artlichtenstein</a>

1. <a href="http://twitter.com/cezanneart">cezanneart</a>

1. <a href="http://twitter.com/fanmichelangelo">fanmichelangelo</a>

1. <a href="http://twitter.com/franzmarcart">franzmarcart</a>

1. <a href="http://twitter.com/pablocubist">pablocubist</a>

1. <a href="http://twitter.com/vangoghartist">vangoghartist</a>

### Problems, questions?

Post an <a href="https://github.com/scripting/artDownloader/issues">issue</a> here. 

