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
var url = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=all&language=ENG&from=125&to=250&useSecondaryLanguage=false'
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

app.get('/', (req, res) => res.json({message: "Hello world!"}))

// Fetchovani z hotelbeds api + aplikace vsech filteru
// tests: ?filtery
// priklad: ?countryCode=ES&&zoneCode=80
app.get('/hotely', (req, res) => {
    const uuid = uuidv1()
    console.log(req.query)
    promises[uuid] = fetchAsync(url)
	promises[uuid].then((json) => { 
            var filteredData = json.hotels
            
            Object.keys(req.query).map((key) => {
                filteredData = filteredData.filter((hotel) => {
                    return String(hotel[key]) === req.query[key] 
                })
            })
            
            filteredData.map((value) => {
                console.log(value.name)
                console.log(value.zoneCode)
            })

			return json
		})
	console.log(JSON.stringify(promises))
	res.json({result: "OK", uuid: uuid})
})


// Fetchovani z hotelbeds api + podle mesta
// tests: ?city=\(mesto)
app.get('/hotelymesta', (req, res) => {
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
})

/*
// Testovani mongoose
// tests: ?city=\(mesto)&hotel=\(hotel)
app.get('/nacistMestoAHotel', (req, res) => {
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

// Nacist hotel a vsechny ostatni ze stejneho mesta
// tests: ?hotelname=Astoria
app.get('/hotelyzmesta', (req, res) => {
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
})


app.listen(3000, () => console.log('Example app listening on port 3000!'))