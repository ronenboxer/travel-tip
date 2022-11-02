import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onDeleteLoc = onDeleteLoc

let gLocs

function onInit() {
    mapService.initMap()
        // .then(() => {
        //     console.log('Map is ready')
        // })
        .then((gMap) => {
            console.log(`gMap:`, gMap)
            gMap.addListener("click", (e) => {
                onAddMarker(e.latLng.lat(), e.latLng.lng())
                locService.add({ name: 'place', lat: e.latLng.lat(), lng: e.latLng.lng() })
            })
        })
        .then(() => onRenderLocs())
        .catch(() => console.log('Error: cannot init map'))
    const prm = locService.get().then(console.log)
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker(lat, lng) {

    console.log('Adding a marker')
    mapService.addMarker({ lat, lng })
}

function onGetLocs() {
    locService.getLocs()
        .then(locs => {
            console.log('Locations:', locs)
            document.querySelector('.locs').innerText = JSON.stringify(locs, null, 2)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords)
            document.querySelector('.user-pos').innerText =
                `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}
function onPanTo({ lat, lng }) {
    console.log('Panning the Map')
    mapService.panTo(lat, lng)
}

function onRenderLocs() {
    const elLoclIST = document.querySelector('.saved-locs-container .loc-list')
    locService.get().then(locs => {
        elLoclIST.innerHTML = locs.map(loc => `<li>
        <button onclick="onDeleteLoc('${loc.locId}')">Delete</button>
        ${loc.name}
        <button onclick="onPanTo({${loc}})">Go</button>
        </li>`).join('')
    })
}

function onDeleteLoc(locId) {
    locService.delete(locId)
    onRenderLocs()
}