import { storageService } from './storage.service.js'
import { utilsService } from './utils.service.js'

export const locService = {
    getLocs
}

const LOCS_STORAGE_KEY = 'locsDB'

let gLocs

function createLoc({name, lat, lng, weather}){
    return {
        id: utilsService.makeId(),
        name,
        lat,
        lng,
        weather,
        createdAt: Date.now()
    }
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