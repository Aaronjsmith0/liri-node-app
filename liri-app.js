require("dotenv").config();
var keys = require("./keys")
var axios = require("axios");
var moment = require("moment");
moment().format();
var Spotify = require('node-spotify-api');
var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
})
var fs = require("fs")

var command = process.argv[2]
var userInput = process.argv.slice(3).join(" ");

function runLiri() {
    if (command === 'do-what-it-says') {
        fs.readFile('./random.txt', 'UTF8', function (err, data) {
            if (err) {
                console.log("I'm not sure what your saying.")
            }
            command = data.substring(0, data.indexOf(","))
            userInput = data.substring(data.indexOf(",") + 2, data.length - 1)
            runLiri();
        })
    } else if (command === 'concert-this') {
        concertThis();
    } else if (command === 'spotify-this-song') {
        spotifyThis()
    } else if (command === 'movie-this') {
        movieThis();
    } else {
        console.log("You didn't enter a valid command.")
    }
}

function concertThis() {
    if (userInput == "") {
        console.log("You must include an artist to search.")
    } else {
        axios.get("https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp")
            .then(function (response) {
                var results = response.data;
                for (i = 0; i < results.length; i++) {
                    var venue = results[i].venue.name;
                    if (results[i].country === "United States") {
                        var location = results[i].venue.city + ", " + results[i].venue.region
                    } else {
                        var location = results[i].venue.city + ", " + results[i].venue.country
                    }
                    var date = moment(results[i].datetime)
                    date = date.format("MM/DD/YYYY")
                    var output = (`Venue: ${venue}\nLocation: ${location}\nDate: ${date}\n---------------------------------\n`);
                    console.log(output)
                    fs.appendFile('log.txt', output, 'utf8', function (error) {
                        if (error) {
                            console.log("Couldn't append Data")
                        }
                        console.log("Data has been added to log.txt file.")
                    })
                }
            })
    }
}

function spotifyThis() {
    if (userInput == "") {
        userInput = "The Sign Ace of Base"
    }
    spotify.search({
        type: 'track',
        query: userInput
    }, function (err, data) {
        if (err) {
            console.log("Couldn't find your song.")
        }
        var results = data.tracks.items[0]
        var artist = results.artists[0].name;
        var name = results.name;
        var preview = results.preview_url;
        var album = results.album.name;
        var output = (`Artist: ${artist}\nSong Name: ${name}\nPreview Link: ${preview}\nAlbum: ${album}\n---------------------------------\n`);
        console.log(output)
        fs.appendFile('log.txt', output, 'utf8', function (error) {
            if (error) {
                console.log("Couldn't append Data")
            }
            console.log("Data has been added to log.txt file.")
        })
    })
}

function movieThis() {
    if (userInput === "") {
        userInput = "Mr. Nobody"
    }
    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + userInput)
        .then(function (response) {
            console.log(response.data.Title)
            results = response.data;
            var title = results.Title;
            var year = results.Year;
            ratingsArr = results.Ratings
            var IMDB = ratingsArr.filter(function (item) {
                return item.Source === 'Internet Movie Database'
            }).map(function (item) {
                return item.Value.toString()
            })
            IMDB = IMDB.toString();
            var RT = ratingsArr.filter(function (item) {
                return item.Source === 'Rotten Tomatoes'
            }).map(function (item) {
                return item.Value.toString()
            })
            RT = RT.toString();
            country = results.Country;
            language = results.Language;
            plot = results.Plot;
            actors = results.Actors;
            var output = (`Title: ${title}\nYear: ${year}\nIMDB Rating: ${IMDB}\nRotten Tomatoes Rating: ${RT}\nCountry: ${country}\nLanguage: ${language}\nPlot: ${plot}\nActors: ${actors}\n---------------------------------\n`)
            console.log(output)
            fs.appendFile('log.txt', output, 'utf8', function (error) {
                if (error) {
                    console.log("Couldn't append Data")
                }
                console.log("Data has been added to log.txt file.")
            })
        })
}

runLiri();