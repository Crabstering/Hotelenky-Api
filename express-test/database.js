const mongoose = require('mongoose')

var countryHotelsSchema = mongoose.Schema({
    allSaved: Boolean,
    countryCode: String,
    regions: [{
        name: String,
        hotels: [{
            name: String,
            city: String,
            region: String,
            code: Number,
            image: String,
            coordinates: {
                longitude: Number,
                latitude: Number
            }
        }]
    }]
})

mongoose.connect('mongodb://localhost/test');
var CountryHotel = mongoose.model('CountryHotel', countryHotelsSchema)

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {})


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
}

async function saveHotel (hotel, countryHotel) {
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
}

async function saveAllHotels(hotels) {
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
}

async function saveAll(hotels) {
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
}

module.exports = {
    isCountryInDb: isCountryInDb,
    isHotelInDb: isHotelInDb,
    saveCountry: saveCountry,
    saveHotel: saveHotel,
    checkCountry: checkCountry,
    saveAllHotels: saveAllHotels,
    saveAll: saveAll,
    logHotels: logHotels,
    CountryHotel: CountryHotel,
    db: db
 }