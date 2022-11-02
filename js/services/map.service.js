import { storageService } from './storage.service.js'
import { utilsService } from './utils.service.js'

export const mapService = {
    initMap,
    addMarker,
    panTo,
    getGeoLoc,
    getCoords: getCurrCoords
}

const ADDRESS_KEY = 'addressCache'
const GEOLOC_API_KEY = `AIzaSyAiwFTX9E6QK4v027yLl0zzwxKo78enu9k`
const addressesCache = _loadAddresses() || {}

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

const iconBase = "http://maps.google.com/mapfiles/kml/shapes/";
const icons = {
    toilets: iconBase + "toilets.png",
    police: iconBase + "police.png",
    home: iconBase + "ranger_station.png",
    car: iconBase + "cabs.png",
    plane: iconBase + "airports.png",
};

function addMarker(loc, placeName, icon = '') {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: placeName,
        icon: icons[icon]
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


// Get address data from network or cache - return a promise
function getGeoLoc(address) {
    if (addressesCache[address]) {
        console.log('No need to axios.get, retrieving from Cache')
        // return userCache[username]
        return Promise.resolve(addressesCache[address])
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GEOLOC_API_KEY}`
    return axios.get(url)
        .then(res => res.data.results[0].geometry.location)
        .then(latLng=> {
            addressesCache[address] = latLng
            _saveAddresses()
            return latLng
        })
        .catch(() => {
            throw new Error(`Could not find address: ${address}`)
        })
}

function getCurrCoords(){
    return gMap.getCenter()
}

function _saveAddresses(){
    storageService.save(ADDRESS_KEY,addressesCache )
}
function _loadAddresses(){
    return storageService.load(ADDRESS_KEY)
}