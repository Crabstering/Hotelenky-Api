const express = require('express')
const uuidv1 = require('uuid/v1')
//const fetch = require('isomorphic-unfetch')
const sha256 = require('js-sha256')
const mongoose = require('mongoose')
const fs = require('fs')


const file = require('./file')
const database = require('./database')
const fetch = require('./fetch')

/*mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {})*/


/*var geonamesSchema = mongoose.Schema({
    country_code: String,
    geonames: [{
        geonameid: Number,
        name: String,
        asciiname: String,
        alternatenames: [],
        latitude: Number,
        longitude: Number,
        country_code: String,
        admin_code1: String,
        admin_code2: String
    }]
})*/

//var CountryHotel = mongoose.model('CountryHotel', countryHotelsSchema)
//var Geonames = mongoose.model('Geonames', geonamesSchema)
/*
async function isCountryInDb (countryCode) {
    return CountryHotel.find({ countryCode: countryCode }).exec().then((countryInList) => {
        if (!countryInList.length) return false
        return true
    })
}

async function isHotelInDb (country, city, hotel) {
    return CountryHotel.find({ countryCode: country }).exec().then((countryInList) => {
        if (!countryInList.length) return console.log("IsHotelInDBError: No country")
        return countryInList[0].cities.some((otherCity) => {
            if (otherCity.name == city) {
                return otherCity.hotels.some((otherHotel) => {
                    return otherHotel.name == hotel
                })
            }
            return false
        })
    })
}

async function saveCountry (countryCode) {
    var newCountry = new CountryHotel({ 
        allSaved: false,
        countryCode: countryCode, 
        regions: []
    })
    return newCountry.save().then(() => {
        console.log("Zeme " + countryCode + " pridana do db")
    })
}*/

// Ulozi hotel do databaze, pokud poli mest je mesto, ve kterem se hotel nachazi, ulozi se do pole hotelu daneho mesta
/*async function saveHotel (hotel) {
    return CountryHotel.find({ countryCode: hotel.countryCode }).exec().then((countryInList) => {
        saved = countryInList[0].cities.some((otherCity) => {
            if (otherCity.name == hotel.city.content) {
                otherCity.hotels.push({ name: hotel.name.content,
                                        city: hotel.city.content,
                                        code: hotel.code ,
                                        image: hotel.images != null ? hotel.images[0].path : "",
                                        coordinates: hotel.coordinates })
                return true
            }
            return false
        })
        if (!saved) {
            countryInList[0].cities.push({ name: hotel.city.content,
                                           hotels: [{ 
                                                name: hotel.name.content,
                                                city: hotel.city.content,
                                                code: hotel.code ,
                                                image: hotel.images != null ? hotel.images[0].path : "",
                                                coordinates: hotel.coordinates  }] })
        }
        return countryInList[0].save().then(() => {
            console.log("Hotel " + hotel.name.content + " pridan do db")
        })  
    })
}*/
/*
function saveHotel (hotel, countryHotel) {
    region = await fetchAsyncGeo(geourl + "&lat=" + hotel.coordinates.latitude + "&lon=" + hotel.coordinates.longitude).then((data) => {
        return data.adminName1
    })
    saved = countryHotel.cities.some((otherCity) => {
        if (otherCity.name == hotel.city.content) {
            otherCity.hotels.push({ name: hotel.name.content,
                                    city: hotel.city.content,
                                    code: hotel.code ,
                                    image: hotel.images != null ? hotel.images[0].path : "",
                                    coordinates: hotel.coordinates })
            return true
        }
        return false
    })
    if (!saved) {
        countryHotel.cities.push({ name: hotel.city.content,
                                        hotels: [{ 
                                            name: hotel.name.content,
                                            city: hotel.city.content,
                                            code: hotel.code ,
                                            image: hotel.images != null ? hotel.images[0].path : "",
                                            coordinates: hotel.coordinates  }] })
    }
    console.log("Hotel " + hotel.name.content + " pridan do db")  
}*/

/*async function saveHotel (hotel, countryHotel) {
    //region = await fetchAsyncGeo(geourl + "&lat=" + hotel.coordinates.latitude + "&lng=" + hotel.coordinates.longitude)
    //region = region.adminName1
    saved = countryHotel.regions.some((otherRegion) => {
        if (otherRegion.name == hotel.region) {
            otherRegion.hotels.push({ name: hotel.name.content,
                                      city: hotel.city.content,
                                      code: hotel.code ,
                                      image: hotel.images != null ? hotel.images[0].path : "",
                                      coordinates: hotel.coordinates, 
                                      region: hotel.region })
            return true
        }
        return false
    })
    if (!saved) {
        countryHotel.regions.push({ name: hotel.region,
                                    hotels: [{ 
                                        name: hotel.name.content,
                                        city: hotel.city.content,
                                        code: hotel.code ,
                                        image: hotel.images != null ? hotel.images[0].path : "",
                                        coordinates: hotel.coordinates,
                                        region: hotel.region }] })
    }
    console.log("Hotel " + hotel.name.content + " pridan do db")  
}

// Ukladani hotelu do db trva a tato funkce vraci true, pokud byly vsechny hotelu z dane zeme ulozeny do db
async function checkCountry(countryCode) {
    return CountryHotel.find({ countryCode: countryCode }).exec().then((countryInList) => {
        countryInList[0].allSaved = true
        return countryInList[0].save().then(() => {
            console.log("All hotels has been saved")
        })
    })
}

// Sekvencni pripojovani promises
async function sequenceAdd(promise, arg1, arg2, otherPromise) {
    return promise.then(() => {
        return otherPromise(arg1, arg2)
    })
}*/

// Nejdrive zjisti, zda dany hotel se v db nachazi a pokud ne, hotel zde ulozi
/*async function saveAllHotels(hotels) {
    promises = []
    for (var i = 0; i < hotels.length; i += 1) {
        promises.push(isHotelInDb(hotels[i].countryCode, hotels[i].city.content, hotels[i].name.content))
    }
    return Promise.all(promises).then((isHotel) => {
        for (var j = 0; j < hotels.length; j += 1) {
            if (!isHotel[j]) {
                promises[0] = sequenceAdd(promises[0], hotels[j], (hotel) => { 
                    return saveHotel(hotel)
                })
            }
        }
    }).then(() => {
        return promises[0].then(() => {
            return checkCountry(hotels[0].countryCode)
        })
    })
}*/

/*async function saveAllHotels(hotels) {
    promise = Promise.all([])

    return CountryHotel.find({ countryCode: hotels[0].countryCode }).exec().then((countryInList) => {
        for (var j = 0; j < hotels.length; j += 1) {
            promise = sequenceAdd(promise, hotels[j], countryInList[0], saveHotel)
        }
        return promise.then(() => {
            return countryInList[0].save().then(() => {
                return checkCountry(hotels[0].countryCode)
            }) 
        })
    })
}*/



/*async function saveAll(hotels) {
    return isCountryInDb(hotels[0].countryCode).then((isCountry) => {
        if (!isCountry) {
            return saveCountry(hotels[0].countryCode).then(() => {
                return saveAllHotels(hotels)
            })
        } else {
            return saveAllHotels(hotels)
        }
    })  
}

async function logHotels() {
    return CountryHotel.find().exec().then((countries) => {
        countries.map((country) => {
            country.regions.map((region) => {
                region.hotels.map((hotel) => {
                    console.log(hotel)
                })
            })
        })
    })
}*/

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

// Fetch z hotelbeds + auth
/*async function fetchAsync (newUrl, res) {
    try {
        return fetch(newUrl, { 
            method: 'get', 
            headers: {
              // Pozice headeru je jedno
              'Accept': 'application/json',
              'Api-Key': 'dr52c6czspgvrh3669hq4xtr',
              'X-Signature': sha256('dr52c6czspgvrh3669hq4xtr' + '6mAFnjcqRK' + Math.floor(Date.now() / 1000))
            }
        }).then((fetchedData) => {
            if (fetchedData.status != 200) {
                res.json({ result: "NOK", reason: fetchedData.statusText })
                return null
            }
            //Ma to problem asi s tim, ze fetchedData jsou obcas undefined, ale jen mozna
            return fetchedData.json()
        })
    } catch(error) {
        console.error(error)
    }
}*/

/*async function fetchAsyncGeo (newUrl) {
    try {
        return fetch(newUrl).then((fetchedData) => {
            fetchedData = fetchedData.json()
            console.log(fetchedData)
            return fetchedData
        })
    } catch(error) {
        console.error(error)
    }
}*/

// Transformace hotelu z fetche na stejny format jako je v databazi
/*function transformFetchedHotels(hotels) {
    resultHotels = { 
        regions: [],
        countryCode: hotels[0].countryCode
    }
    hotels.map((hotel) => {
        isRegion = resultHotels.regions.some((region) => {
            if (region.name == hotel.region) {
                region.hotels.push({name: hotel.name.content,
                                    city: hotel.city.content,
                                    code: hotel.code,
                                    image: hotel.images != null ? hotel.images[0].path : "",
                                    coordinates: hotel.coordinates,
                                    region: hotel.region})
                return true
            }
            return false
        })
        if (!isRegion) {
            resultHotels.regions.push({ name: hotel.region,
                                       hotels: [{ 
                                           name: hotel.name.content,
                                           city: hotel.city.content,
                                           code: hotel.code,
                                           image: hotel.images != null ? hotel.images[0].path : "",
                                           coordinates: hotel.coordinates,  
                                           region: hotel.region }] }) 
        }
    })
    return resultHotels
}*/

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

// Zjisteni, kolik hotelu je v dane zemi
/*async function fetchTotal (req, res) {
    var urlTotal = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?language=ENG&useSecondaryLanguage=false&from=1&to=1&countryCode='
    return fetchAsync(urlTotal + req.query.countryCode, res).then((json) => {
        if (json == null) return null
        return json.total
    })
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch vsech hotelu z dane zeme po tisicovkach, ci min
async function waitForHotels (req, res) {
    var fetchUrl = ""
    var resJson = []
    var from = 1
    var to = 0

    Object.keys(req.query).map((key) => {
        if (key == "from") {
            from = parseInt(req.query[key])
        } else if (key == "to") {
            to = parseInt(req.query[key])
        }
    })

    if (to == 0) {
        to = await fetchTotal(req, res)
        if (to == null) return null  
    }

    var high = 0
    for (var i = from; i < to; i += 1000) {
        if (to - i < 1000 ) {
            high = to
        } else {
            high = i + 999
        }
        fetchUrl = url + req.query.countryCode + "&from=" + (i).toString() + "&to=" + (high).toString()
        console.log(fetchUrl)
        var newJson = await fetchAsync(fetchUrl)
        if (newJson == null) return null

        await sleep(500);  // pro jistotu
        resJson = resJson.concat(newJson.hotels)
    }
    return resJson
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
    console.log(file.hello())
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
