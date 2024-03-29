import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onGetUserInput = getUserInput
window.onDeleteLoc = onDeleteLoc
window.onCopyLink = onCopyLink
window.onSearchLoc = onSearchLoc

const WEATHER_API_KEY = '4cd3d8d4e0c7a01ea8f97dede9adbaed'
const WEATHER_IMGS = {
    url: 'https://openweathermap.org/img/wn/',
    weatherState: id => {
        if (id > 800) return `0${id % 100 + 1}d.png`
        if (id === 800) return '01d.png'
        if (id >= 700) return '50d.png'
        if (id >= 600 || id === 511) return '13d.png'
        if (id >= 520 || (id >= 300 && id < 400)) return '09d.png'
        if (id >= 500) return '10d.png'
        if (id >= 200) '11d.png'
        return id + 'd.png'
    }
}
let gCurrPos



function onInit() {
    mapService.initMap()
        .then((gMap) => {
            console.log(`gMap:`, gMap)
            const { lat, lng } = mapService.getCoords()
            // gCurrPos = { lat: lat(), lng: lng() }
            // _renderLocWeather(gCurrPos)
            // _saveQueryStringParam(gCurrPos)
            gMap.addListener("click", (e) => {
                const elTextInput = document.querySelector('.pick-location-modal input.loc-name')
                elTextInput.value = ''
                elTextInput.placeholder =  document.querySelector('.weather h2.loc-name').innerText
                document.querySelector('.pick-location-modal').classList.remove('hide')
                gCurrPos = e.latLng
            })
            gMap.addListener('center_changed', () => {
                const { lat, lng } = mapService.getCoords()
                gCurrPos = { lat: lat(), lng: lng() }
                _renderLocWeather(gCurrPos)
                _saveQueryStringParam(gCurrPos)
            })
        })
        .then(locs => {
            _onRenderMarks()
            return locs
        })
        .then(() => onRenderLocs())
        .then(_renderByQueryStrParam)
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

function onAddMarker(lat, lng, placeName, icon = '') {

    console.log('Adding a marker')
    mapService.addMarker({ lat, lng }, placeName, icon)
}

function onGetLocs() {
    locService.getLocs()
        .then(locs => {
            document.querySelector('.locs').innerText = JSON.stringify(locs, null, 2)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords)
            document.querySelector('.user-pos').innerText = `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
            mapService.panTo(pos.coords.latitude, pos.coords.longitude)
            onPanTo({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}


function onPanTo({ lat, lng }) {
    gCurrPos = { lat, lng }
    _saveQueryStringParam(gCurrPos)
    mapService.panTo(lat, lng)
    console.log('Panning the Map')
}


function onSearchLoc(ev) {
    ev.preventDefault()
    var str = ev.target.querySelector('input').value
    mapService.getGeoLoc(str)
        .then(pos => gCurrPos = pos)
        .then(onPanTo)
        .catch('adress not found')
}

function getUserInput(isAdding) {
    document.querySelector('.pick-location-modal').classList.add('hide')
    if (!isAdding) return
    const icon = document.querySelector('.pan-icons').value
    const name = document.querySelector('input.loc-name').value
    document.querySelector('.loc-name').value = ''
    onAddMarker(gCurrPos.lat(), gCurrPos.lng(), name, icon)
    locService.add({ name, lat: gCurrPos.lat(), lng: gCurrPos.lng(), icon })
    onRenderLocs()
}

function onRenderLocs() {
    const elLoclIST = document.querySelector('.saved-locs-container tbody')
    locService.get()
        .then(locs => {
            elLoclIST.innerHTML = locs.map(loc => `<tr>
        <td><button onclick="onDeleteLoc('${loc.locId}')"><iconify-icon inline icon="fluent:delete-28-regular"></iconify-icon></button></td>
        <td>${loc.name}</td>
       <td> <button onclick="onPanTo({lat:${loc.lat},lng:${loc.lng}})"><iconify-icon inline icon="bx:map-pin"></iconify-icon></button></td>
        </tr>`).join('')
            return locs
        })
}

function onDeleteLoc(locId) {
    locService.delete(locId)
    mapService.initMap()
    onRenderLocs()
    _onRenderMarks()
}

function onCopyLink() {
    const { lat, lng } = mapService.getCoords()
    gCurrPos = { lat: lat(), lng: lng() }
    navigator.clipboard.writeText(_saveQueryStringParam(gCurrPos))
}

function _onRenderMarks() {
    locService.get()
        .then(locs => locs.forEach(loc => onAddMarker(loc.lat, loc.lng, loc.name, loc.icon)))
}

function _saveQueryStringParam({ lat, lng }) {
    const queryStrParam = (lat && lng) ? `?lat=${lat}&lng=${lng}` : ''
    const newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + queryStrParam
    window.history.pushState({ path: newUrl }, '', newUrl)
    return newUrl
}

function _renderByQueryStrParam() {
    const queryStrParam = new URLSearchParams(window.location.search)
    const lat = queryStrParam.get('lat')
    const lng = queryStrParam.get('lng')
    if (lat !== null && lat !== undefined &&
        lng !== null && lng !== undefined) onPanTo({ lat, lng })
}

function _renderLocWeather({ lat, lng }) {
    const url = _getWeatherUrlByCoords({ lat, lng })
    axios.get(url)
        .then(res => res.data)
        .then(weather => document.querySelector('.weather').innerHTML = `
    <h2 class="loc-name">${weather.name}</h2>
    <img class="weather-img" src="${WEATHER_IMGS.url + weather.weather[0].icon}.png">
    <h3 class="loc-temp">${weather.main.temp} &#8451;</h3>
    <h4 class="weather-description">${weather.weather[0].description}</h4>`)
}

function _getWeatherUrlByCoords({ lat, lng }) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`
}