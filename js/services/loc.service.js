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

function addloc({name, lat, lng }){
    const newloc = {
        locId: utilsService.makeId(),
        name,
        lat,
        lng,
        createdAt: Date.now()
    }
    gLocs.unshift(newloc)
    _saveLocs()
    return newloc
}

function updateLoc({locId, name, lat, lng, icon}){
    const idx = gLocs.findIndex(loc => loc.locId = locId)
    if (idx === -1) return addloc({locId, name, lat, lng, })
    if (icon !== undefined && icon !== null) gLocs[idx] = {icon}
    if (name) gLocs[idx] = {name}
    if (lat && lng) gLocs[idx] = {lat, lng}
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