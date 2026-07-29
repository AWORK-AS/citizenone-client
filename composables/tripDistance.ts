import { haversineDistanceMeters, type LatLng } from '@/composables/geo'

export interface TripStop {
    address: string
    lat: number | null
    lng: number | null
}

export function computeTripDistanceKm(stops: TripStop[]): number {
    const points: LatLng[] = stops
        .filter((s) => typeof s.lat === 'number' && typeof s.lng === 'number' && !Number.isNaN(s.lat) && !Number.isNaN(s.lng))
        .map((s) => ({ lat: s.lat as number, lng: s.lng as number }))

    if (points.length < 2) {
        return 0
    }

    let totalMeters = 0
    for (let i = 1; i < points.length; i++) {
        totalMeters += haversineDistanceMeters(points[i - 1], points[i])
    }

    return Math.round((totalMeters / 1000) * 100) / 100
}

export interface TripStopApiPayload {
    start_address: string
    geo_start_lat: number | null
    geo_start_lng: number | null
    end_address: string
    geo_end_lat: number | null
    geo_end_lng: number | null
    stops: Array<{ address: string; latitude: number; longitude: number; sequence_order: number }>
}

/**
 * The backend keeps the first/last trip stop as top-level start/end fields
 * and only stores intermediate waypoints in the `stops` array.
 */
export function splitStopsForApi(stops: TripStop[]): TripStopApiPayload {
    const first = stops[0]
    const last = stops[stops.length - 1]
    const middle = stops.slice(1, -1)

    return {
        start_address: first?.address ?? '',
        geo_start_lat: first?.lat ?? null,
        geo_start_lng: first?.lng ?? null,
        end_address: last?.address ?? '',
        geo_end_lat: last?.lat ?? null,
        geo_end_lng: last?.lng ?? null,
        stops: middle.map((stop, index) => ({
            address: stop.address,
            latitude: stop.lat as number,
            longitude: stop.lng as number,
            sequence_order: index + 1,
        })),
    }
}
