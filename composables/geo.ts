export interface LatLng {
    lat: number
    lng: number
}

const EARTH_RADIUS_METERS = 6371000

export function haversineDistanceMeters(point1: LatLng, point2: LatLng): number {
    const dLat = (point2.lat - point1.lat) * Math.PI / 180
    const dLon = (point2.lng - point1.lng) * Math.PI / 180
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) *
        Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return EARTH_RADIUS_METERS * c
}

/**
 * Inverse transverse-Mercator for UTM zone 32N on GRS80 (EPSG:25832), the
 * projection Adressevælgeren returns coordinates in (`adgangspunkt.koordinater`).
 * Denmark sits entirely inside zone 32N, so this is a single hard-coded zone
 * rather than a general UTM implementation — pulling in `proj4` (~40kB) for one
 * zone isn't worth it.
 *
 * Verified against a known DAWA/Adressevælger pair for the same address point:
 * utm32nToWgs84(722178.42, 6178837.78) -> { lat: 55.70430663, lng: 12.53626246 }
 * (DAWA reports 55.70430663, 12.53626244 for the same point — ~1mm difference).
 */
const GRS80_A = 6378137.0
const GRS80_F = 1 / 298.257222101
const UTM_K0 = 0.9996
const UTM32N_LON0_RAD = (9 * Math.PI) / 180
const UTM_FALSE_EASTING = 500000.0

export function utm32nToWgs84(easting: number, northing: number): LatLng | null {
    if (!Number.isFinite(easting) || !Number.isFinite(northing)) return null
    if (easting < 100000 || easting > 900000) return null

    const e2 = GRS80_F * (2 - GRS80_F)
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))

    const m = northing / UTM_K0
    const mu = m / (GRS80_A * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256))

    const phi1 =
        mu +
        ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
        ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
        ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
        ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu)

    const ep2 = e2 / (1 - e2)
    const c1 = ep2 * Math.cos(phi1) ** 2
    const t1 = Math.tan(phi1) ** 2
    const n1 = GRS80_A / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2)
    const r1 = (GRS80_A * (1 - e2)) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5
    const d = (easting - UTM_FALSE_EASTING) / (n1 * UTM_K0)

    const lat =
        phi1 -
        ((n1 * Math.tan(phi1)) / r1) *
        (d ** 2 / 2 -
            ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ep2) * d ** 4) / 24 +
            ((61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * ep2 - 3 * c1 ** 2) * d ** 6) / 720)

    const lon =
        UTM32N_LON0_RAD +
        (d -
            ((1 + 2 * t1 + c1) * d ** 3) / 6 +
            ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ep2 + 24 * t1 ** 2) * d ** 5) / 120) /
        Math.cos(phi1)

    return {
        lat: (lat * 180) / Math.PI,
        lng: (lon * 180) / Math.PI,
    }
}
