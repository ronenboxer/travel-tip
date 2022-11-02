import { storageService } from './storage.service.js'
import { utilsService } from './utils.service.js'

export const mapService = {
    initMap,
    addMarker,
    panTo,
    getGeoLoc
}


// Var that is used throughout this Module (not global)
var gMap


function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap')
    return _connectGoogleApi()
        .then(() => {
            console.log('google available')
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            console.log('Map!', gMap)
            return gMap
        })

}

function addMarker(loc, placeName) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: placeName
    })
    return marker
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
    gMap.setZoom(17)
    // gMap.setCenter(laLatLng)
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyBYGSZPxLnNBjzBByVJ3xd3Cn8J64FFdDM'
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

const ADDRESS_KEY = 'addressCache'

const addressCache = storageService.load(ADDRESS_KEY) || {}

const GEOLOC_API_KEY = `AIzaSyAiwFTX9E6QK4v027yLl0zzwxKo78enu9k`

// Get address data from network or cache - return a promise
function getGeoLoc(address) {
    if (addressCache[address]) {
        console.log('No need to axios.get, retrieving from Cache')
        // return userCache[username]
        return Promise.resolve(addressCache[address])
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GEOLOC_API_KEY}`
    return axios.get(url)
        .then(res => res.data)
        .then((geoLoc) => {
            return geoLoc.results[0].geometry.location
        })
        .catch(() => {
            throw new Error(`Could not find address: ${address}`)
        })

}