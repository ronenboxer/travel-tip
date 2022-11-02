import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onGetUserInput = getUserInput
window.onDeleteLoc = onDeleteLoc

let latLng



function onInit() {
    mapService.initMap()
        // .then(() => {
        //     console.log('Map is ready')
        // })
        .then((gMap) => {
            console.log(`gMap:`, gMap)
            gMap.addListener("click", (e) => {
                document.querySelector('.pick-location-modal').classList.remove('hide')
                latLng = e.latLng
            })
        })
        .then(locs => {
            _onRenderMarks()
            return locs
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
            mapService.panTo(pos.coords.latitude, pos.coords.longitude)
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}
function onPanTo({lat, lng, ev}) {
    if (ev) {
        ev.preventDefault()
        var str = ev.target.querySelector('input').value
        mapService.getGeoLoc(str)
        .then(({lat,lng}) => mapService.panTo(lat, lng))
        .catch('adress not found')
    } else mapService.panTo(lat, lng)
    console.log('Panning the Map')
}

function getUserInput(isAdding) {
    document.querySelector('.pick-location-modal').classList.add('hide')
    if (!isAdding) return
    const name = document.querySelector('.loc-name').value
    document.querySelector('.loc-name').value = ''
    onAddMarker(latLng.lat(), latLng.lng())
    locService.add({ name, lat: latLng.lat(), lng: latLng.lng() })
    onRenderLocs()
}

function onRenderLocs() {
    const elLoclIST = document.querySelector('.saved-locs-container .loc-list')
    locService.get()
        .then(locs => {
            elLoclIST.innerHTML = locs.map(loc => `<li>
        <button onclick="onDeleteLoc('${loc.locId}')">Delete</button>
        ${loc.name}
        <button onclick="onPanTo({lat:${loc.lat},lng:${loc.lng}})">Go</button>
        </li>`).join('')
            return locs
        })
}

function onDeleteLoc(locId) {
    locService.delete(locId)
    mapService.initMap()
    onRenderLocs()
    _onRenderMarks()
}

function _onRenderMarks() {
    locService.get()
        .then(locs => locs.forEach(loc => onAddMarker(loc.lat, loc.lng)))
}