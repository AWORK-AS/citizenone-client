export interface TripStop {
    address: string
    lat: number | null
    lng: number | null
    /**
     * Stable client-side identity, independent of array position. Reordering
     * (moveStop) or deleting (removeStop) a stop reindexes the array; without
     * a stable key, an in-flight async write (geocode/reverse-geocode) keyed
     * by index would land on whatever stop now occupies that slot. Never sent
     * to the backend — splitStopsForApi() below maps fields explicitly.
     */
    key?: string
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
