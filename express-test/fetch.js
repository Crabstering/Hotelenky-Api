const fetch = require('isomorphic-unfetch')

const sleep = require('./utils').sleep

var url = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=name,countryCode,city,coordinates,images&language=ENG&useSecondaryLanguage=false&countryCode='

// Fetch z hotelbeds + auth
async function fetchAsync (newUrl, res) {
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
}



// Transformace hotelu z fetche na stejny format jako je v databazi
function transformFetchedHotels(hotels) {
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
}

async function fetchTotal (req, res) {
    var urlTotal = 'https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?language=ENG&useSecondaryLanguage=false&from=1&to=1&countryCode='
    return fetchAsync(urlTotal + req.query.countryCode, res).then((json) => {
        if (json == null) return null
        return json.total
    })
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
}

module.exports = {
    fetchAsync: fetchAsync,
    transformFetchedHotels: transformFetchedHotels,
    fetchTotal: fetchTotal,
    waitForHotels: waitForHotels,
}