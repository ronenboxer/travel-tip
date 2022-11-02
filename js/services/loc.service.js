import { storageService } from './storage.service.js'
import { utilsService } from './utils.service.js'

export const locService = {
    getLocs,
    add: addloc,
    update: updateLoc,
    delete: deleteLoc,
    get: getLocs
}

const LOCS_STORAGE_KEY = 'locsDB'

let gLocs = _loadLocs(LOCS_STORAGE_KEY) || []

function addloc({name, lat, lng, weather}){
    const newloc = {
        locId: utilsService.makeId(),
        name,
        lat,
        lng,
        weather,
        createdAt: Date.now()
    }
    gLocs.unshift(newloc)
    _saveLocs()
    return newloc
}

function updateLoc({locId, name, lat, lng, weather}){
    const idx = gLocs.findIndex(loc => loc.locId = locId)
    if (idx === -1) return addloc({locId, name, lat, lng, weather})

    if (name) gLocs[idx] = {name}
    if (lat && lng) gLocs[idx] = {lat, lng}
    if (weather) gLocs[idx] = {weather}
    gLocs[idx].updatedAt = Date.now()
    _saveLocs()
    return gLocs[idx]
}

function deleteLoc(locId){
    if (!locId) return null
    const idx = gLocs.findIndex(loc => loc.locId === locId)
    if (idx === -1) return  null
    const loc = gLocs.splice(idx,1)
    _saveLocs()
    return loc
}

// const locs = [
//     { name: 'Greatplace', lat: 32.047104, lng: 34.832384 }, 
//     { name: 'Neveragain', lat: 32.047201, lng: 34.832581 }
// ]

function getLocs() {
    return new Promise((resolve, reject) => {
        if (gLocs) resolve(gLocs)
        else reject(gLocs)
    })
}


function _loadLocs(){
    return storageService.load(LOCS_STORAGE_KEY)
}


function _saveLocs(){
    storageService.save(LOCS_STORAGE_KEY, gLocs)
}

const ADDRESS_KEY = 'addressCache'

const addressCache = loadFromStorage(STORAGE_KEY) || {}

// Get address data from network or cache - return a promise
function getGeoLoc(address) {
    if (userCache[username]) {
        console.log('No need to fetch, retrieving from Cache')
        // return userCache[username]
        return Promise.resolve(userCache[username])
    }
    const url = 'https://api.github.com/users/'
    return fetch(url).then(res => res.json())
        .then((user) => {
            userCache[username] = user
            saveToStorage(STORAGE_KEY, userCache)

            // Cache Invalidation after 5 Seconds
            // setTimeout(()=>{
            //     delete userCache[username]
            // }, 5000)

            return user
        })
        .catch(() => {
            throw new Error('Could not find user: ' + username)
        })
}