import { storageService } from './storage.service.js'
import { utilsService } from './utils.service.js'

export const mapService = {
    initMap,
    addMarker,
    panTo
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

// Sets the map on all markers in the array.
function setMapOnAll(map = google.maps.Map) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
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