const express = require('express')
const uuidv1 = require('uuid/v1')
//const fetch = require('isomorphic-unfetch')
const sha256 = require('js-sha256')
const mongoose = require('mongoose')
const fs = require('fs')

const database = require('./database')
const fetch = require('./fetch')

var promises = {}
var fetchedCountriesUuid = {}
var url = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=name,countryCode,city,coordinates,images&language=ENG&useSecondaryLanguage=false&countryCode='
var testUrl = 'https://api.test.hotelbeds.com/hotel-api/1.0/status'
var geourl = "http://api.geonames.org/countrySubdivisionJSON?username=hotelenky"

/*
Refaktornout to cely
Returnovat response co nejrychleji
Returnovat fetch a pokud uz je v databazi, tak databazi
*/


/*function filterHotels (json, req) {
    var filteredData = json.hotels
    Object.keys(req.query).map((key) => {
        if (key != "to" && key != "from" && key != "countryCode") {
            if (key == "city") {
                filteredData = filteredData.filter((hotel) => {
                    return String(hotel.city.content) === req.query.city
                })
            } else {
                filteredData = filteredData.filter((hotel) => {
                    return String(hotel[key]) === req.query[key] 
                })
            }
        }
    })
    return filteredData
}

function findHotel(json, req) {
    return json.hotels.filter((hotel) => {
        return hotel.name.content == req.query.name
    }) 
}

function findHotelsByArea(json, coordinates, radius) {
    return json.hotels.filter((hotel) => {
        longitudeDif = hotel.coordinates.longitude - coordinates.longitude
        latituteDif = hotel.coordinates.latitude - coordinates.latitude
        return Math.hypot(longitudeDif, latituteDif) <= radius
    })
}*/

///////////////////////////////////////////////////////////////////////////////////////////////////
//API ENDPOINTS ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => res.json({message: "Hello world!"}))

// Fetchovani z dane country + ulozeni do databaze
// example: hotels?countryCode=CZ&from=1&to=3, 
//          hotels?countryCode=CZ - fetch vseho
app.get('/hotels', (req, res) => {
    var before = new Date().getTime()
    database.isCountryInDb(req.query.countryCode).then((isCountry) => {
        if (isCountry) {
            database.CountryHotel.find({ countryCode: req.query.countryCode }).exec().then((countryInList) => {
                if (!countryInList[0].allSaved) {
                    fetch.waitForHotels(req, res).then((json) => {
                        if (json == null) return
                        timeLength = new Date().getTime() - before
                        res.json({result: "OK", timeLengthInMs: timeLength, json: fetch.transformFetchedHotels(json)})
                    })
                } else {
                    timeLength = new Date().getTime() - before
                    res.json({result: "OK", timeLengthInMs: timeLength, json: countryInList[0]})
                }
            })
        } else {
            fetch.waitForHotels(req, res).then((json) => {
                if (json == null) return
                database.saveAll(json)
                timeLength = new Date().getTime() - before
                res.json({result: "OK", timeLengthInMs: timeLength, json: fetch.transformFetchedHotels(json)})
            })
        }
    })
})

// Vypis vsech hotelu v databazi
app.get('/dblog', (req, res) => {
    database.logHotels().then(() => {
        res.json({result: "OK"}) 
    })
})

// Fetchovani z dane country + aplikace vsech filteru
// tests: ?countryCode=\(countryCode)&filters
// example: hotels?countryCode=CZ&city=PRAGUE
/*
app.get('/hotels', (req, res) => {
    var before = new Date().getTime()
    var uuid = ""

    if (req.query.countryCode in fetchedCountriesUuid) {
        uuid = fetchedCountriesUuid[req.query.countryCode]
    } else {
        uuid = uuidv1()
        promises[uuid] = waitForHotels(req)
        fetchedCountriesUuid[req.query.countryCode] = uuid
    }

    promises[uuid].then((json) => {
        var filteredData = filterHotels(json, req)
        timeLength = new Date().getTime() - before
        console.log(timeLength)
        res.json({result: "OK", timeLengthInMs: timeLength, uuid: uuid, json: json})
    })
})
*/

/*
// Fetchovani daneho hotelu z dane country + nalezeni vsech hotelu v danem okruhu v km
// tests: ?countryCode=\(countryCode)&name=\(countryCode)&radius=\(radius)
// example: hotelsByArea?countryCode=CZ&name=PRAGUE&name=Jalta&radius=1
app.get('/hotelsByArea', (req, res) => {
    var before = new Date().getTime()
    var uuid = ""

    if (req.query.countryCode in fetchedCountriesUuid) {
        uuid = fetchedCountriesUuid[req.query.countryCode]
    } else {
        uuid = uuidv1()
        promises[uuid] = waitForHotels(req)
        fetchedCountriesUuid[req.query.countryCode] = uuid
    }
    promises[uuid].then((json) => {
        var coordinates = findHotel(json, req)
        coordinates = coordinates[0].coordinates
        radius = 360 / 40000 * parseInt(req.query.radius) // Prepocitani vzdalenosti souradnic z kilometru
        var hotelsByArea = findHotelsByArea(json, coordinates, radius)
        timeLength = new Date().getTime() - before
        res.json({result: "OK", timeLengthInMs: timeLength, uuid: uuid, json: hotelsByArea})
    })
})
*/

/*
// Nacist hotel a vsechny ostatni ze stejneho mesta
// tests: nearbyHotels?hotelname=Astoria
app.get('/nearbyHotels', (req, res) => {
    const uuid = uuidv1()
    console.log(req.query)
    promises[uuid] = fetchAsync(url)
    promises[uuid].then((json) => { 
        var hotel = json.hotels   
        hotel = hotel.filter((otherHotel) => {
            return otherHotel.name.content === req.query.hotelname                 
        })    
        hotel = hotel[0]

        var filteredData = json.hotels
        filteredData = filteredData.filter((otherHotel) => {
            return otherHotel.city.content === hotel.city.content
        })
            
        filteredData.map((value) => {
            console.log(value.name.content)
            console.log(value.city.content)
        })
        console.log("done")
        return json
    })
    console.log(JSON.stringify(promises))
    res.json({result: "OK", uuid: uuid})
})*/

var port = process.env.PORT || 1337
app.listen(port, () => console.log('Example app listening on port %d!', port))
