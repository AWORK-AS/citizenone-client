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
