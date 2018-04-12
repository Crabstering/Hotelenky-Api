const express = require('express')
const uuidv1 = require('uuid/v1')
const fetch = require('isomorphic-unfetch')
const sha256 = require('js-sha256')

const app = express()

/*
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {})
var cityHotelSchema = mongoose.Schema({ 
    name: String,
    hotels: [{
            name: String
    }]
})
var CityHotel = mongoose.model('CityHotel', cityHotelSchema);
function saveCityHotel (city, hotel) {
    CityHotel.find({ name: city }, (err, cities) => {
        if (err) return console.error(err) 
        cities.map((otherCity) => {
            otherCity.hotels.push({ name: hotel })
            otherCity.save()
        })
    })
}
async function isCityInDb (city) {
    var result = false
    await CityHotel.find({ name: city }, (err, cities) => {
        if (err) return console.error(err) 
        result = cities.some((otherCity) => {
            return city == otherCity.name
        }) 
    })
    return result
}
async function isHotelInDb (city, hotel) {
    var result = false
    await CityHotel.find({ name: city }, (err, cities) => {
        if (err) return console.error(err) 
        cities.map((otherCity) => {
            result = otherCity.hotels.some((otherHotel) => {
                return hotel == otherHotel.name
            })  
        })
    })
    return result
}
function logHotels() {
    CityHotel.find((err, cities) => {
        if (err) return console.error(err) 
        //console.log(cities)
        cities.forEach((city) => {
            console.log(city.hotels)
        })
    })
}*/

var promises = {}
var url = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=name,countryCode,city,images,coordinates&language=ENG&useSecondaryLanguage=false&countryCode='

var testUrl = 'https://api.test.hotelbeds.com/hotel-api/1.0/status'

// Fetch z hotelbeds + auth
async function fetchAsync (newUrl) {
    try {
        let response = await fetch(newUrl, { 
            method: 'get', 
            headers: {
              // Pozice headeru je jedno
              'Accept': 'application/json',
              'Api-Key': 'dr52c6czspgvrh3669hq4xtr',
              'X-Signature': sha256('dr52c6czspgvrh3669hq4xtr' + '6mAFnjcqRK' + Math.floor(Date.now() / 1000))
            }
        })
        let responseJson = await response.json()
        return responseJson
    } catch(error) {
        console.error(error)
    }
  }

async function fetchHotels (fetchUrl, returnJson, req) {
    return fetchAsync(fetchUrl).then((json) => { 
        var filteredData = json.hotels
        
        Object.keys(req.query).map((key) => {
            if (key != "to" && key != "from" && key != "countryCode") {
                filteredData = filteredData.filter((hotel) => {
                    return String(hotel[key]) === req.query[key] 
                })
            }
        })
        /*
        filteredData.map((hotel) => {
            returnJson.hotels.push({name: hotel.name.content,
                                 city: hotel.city.content,
                                 coordinates: hotel.coordinates,
                                 images: hotel.images})
        })
        */
        return filteredData
    })
}

async function fetchTotal (req) {
    var urlTotal = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?language=ENG&useSecondaryLanguage=false&from=1&to=1&countryCode='
    return fetchAsync(urlTotal + req.query.countryCode).then((json) => {
        return json.total
    })
}

async function waitForHotels (req) {
    var fetchUrl = ""
    var resJson = {hotels: []}
    var from = 1
    var to = 0

    to = await fetchTotal(req)

    Object.keys(req.query).map((key) => {
        if (key == "from") {
            from = parseInt(req.query[key])
        } else if (key == "to") {
            to = parseInt(req.query[key])
        }
    })

    var high = 0
    for (var i = from; i < to; i += 1000) {
        if (to - i < 1000 ) {
            high = to
        } else {
            high = i + 999
        }
        fetchUrl = url + req.query.countryCode + "&from=" + (i).toString() + "&to=" + (high).toString()
        resJson = await fetchHotels(fetchUrl, resJson, req)
    } 
    return resJson
}

app.get('/', (req, res) => res.json({message: "Hello world!"}))

// Fetchovani z hotelbeds api z dane country + aplikace vsech filteru
// tests: ?countryCode=\(countryCode)&filters
// example: hotels?countryCode=CZ&from=1&to=20
app.get('/hotels', (req, res) => {
    Object.keys(req.query).map((key) => {
        console.log(key)
    })
    waitForHotels(req).then((json) => {
        res.json({result: "OK", json: json})
    })
})

/*
// Fetchovani z hotelbeds api + podle mesta
// tests: hotelsFromCity?city=\(city)
app.get('/hotelsFromCity', (req, res) => {
    const uuid = uuidv1()
    console.log(req.query)
    promises[uuid] = fetchAsync(url)
    promises[uuid].then((json) => { 
            var filteredData = json.hotels
            
            Object.keys(req.query).map((key) => {
                filteredData = filteredData.filter((hotel) => {
                    return hotel.city[key] === req.query[key] 
                })
            })
            
            filteredData.map((value) => {
                console.log(value.name)
                console.log(value.zoneCode)
            })
            console.log("done")
            return json
        })
    console.log(JSON.stringify(promises))
    res.json({result: "OK", uuid: uuid})
})*/

/*
// Testovani mongoose
// tests: dbtest?city=\(city)&hotel=\(hotel)
app.get('/dbtest', (req, res) => {
    isCityInDb(req.query.city).then((isCityIn) => {
        if (isCityIn) { 
            isHotelInDb(req.query.city, req.query.hotel).then((isHotelIn) => {
                if (isHotelIn) {
                    console.log("Hotel je v db")
                } else {
                    saveCityHotel(req.query.city, req.query.hotel)
                    console.log("Hotel pridan do db")
                } 
            })   
        } else {
            var city = new CityHotel({ 
                name: req.query.city, 
                hotels: [{
                    name: req.query.hotel
                }]
            })
    
            city.save((err, city) => {
                if (err) return console.error(err);
                console.log("Mesto a hotel pridany do db")
            })
        }
    })
    
    logHotels()
    console.log("lul")
    res.json({result: "OK"}) 
})*/

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
