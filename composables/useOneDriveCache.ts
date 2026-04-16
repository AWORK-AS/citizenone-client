// Module-level singleton — survives component unmount/remount across navigation
const TTL = 5 * 60 * 1000 // 5 minutter

let _cache: any[] = []
let _cacheFetchedAt = 0
let _cacheIsLoading = false

let _folders: any[] = []
let _foldersFetchedAt = 0
let _foldersIsLoading = false

export function useOneDriveCache() {
    // --- Fil-cache (til søgning) ---
    function getCache() { return _cache }
    function setCache(items: any[]) { _cache = items; _cacheFetchedAt = Date.now() }
    function isLoading() { return _cacheIsLoading }
    function setLoading(val: boolean) { _cacheIsLoading = val }
    function isFresh(force = false) {
        return !force && _cache.length > 0 && (Date.now() - _cacheFetchedAt) < TTL
    }
    function clear() { _cache = []; _cacheFetchedAt = 0 }

    // --- Mappe-cache (til "Flyt fil" modal) ---
    function getFolders() { return _folders }
    function setFolders(items: any[]) { _folders = items; _foldersFetchedAt = Date.now() }
    function isFoldersLoading() { return _foldersIsLoading }
    function setFoldersLoading(val: boolean) { _foldersIsLoading = val }
    function isFoldersFresh(force = false) {
        return !force && _folders.length > 0 && (Date.now() - _foldersFetchedAt) < TTL
    }

    return {
        getCache, setCache, isLoading, setLoading, isFresh, clear,
        getFolders, setFolders, isFoldersLoading, setFoldersLoading, isFoldersFresh,
    }
}
