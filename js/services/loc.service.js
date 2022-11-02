import { storageService } from './storage.service.js'
import { utilsService } from './utils.service.js'

export const locService = {
    getLocs,
    add: addloc,
    update: updateLoc,
    delete: deleteLoc
}

const LOCS_STORAGE_KEY = 'locsDB'

let gLocs

function addloc({name, lat, lng, weather, id}){
    const locId = id? id : utilsService.makeId()
    gLocs[locId]={
        name,
        lat,
        lng,
        weather,
        createdAt: Date.now()
    }
    _saveLocs()
}

function updateLoc({locId, name, lat, lng, weather}){
    if (!gLocs[locId]) return addloc({locId, name, lat, lng, weather})
    if (name) gLocs[locId] = {name}
    if (lat && lng) gLocs[locId] = {lat, lng}
    if (weather) gLocs[locId] = {weather}
    gLocs[locId].updatedAt = Date.now()
    _saveLocs()
    return gLocs[locId]
}

function deleteLoc(locId){
    if (!locId) return null
    const loc = gLocs[locId]
    delete gLocs[locId]
    return loc
}

const locs = [
    { name: 'Greatplace', lat: 32.047104, lng: 34.832384 }, 
    { name: 'Neveragain', lat: 32.047201, lng: 34.832581 }
]

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs)
        }, 2000)
    })
}


function _loadLocs(){
    return storageService.load(LOCS_STORAGE_KEY)
}


function _saveLocs(){
    storageService.save(LOCS_STORAGE_KEY, gLocs)
}