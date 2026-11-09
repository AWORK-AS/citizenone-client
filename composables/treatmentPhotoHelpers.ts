import { onBeforeUnmount } from 'vue'

export type TreatmentPhotoGroup = {
    key: string
    milestone: any | null
    photos: any[]
}

function byTakenAt(a: any, b: any): number {
    const left = String(a?.taken_at ?? '')
    const right = String(b?.taken_at ?? '')
    if (left !== right) return left < right ? -1 : 1
    return String(a?.created_at ?? '') < String(b?.created_at ?? '') ? -1 : 1
}

/**
 * Groups photos by milestone: milestones in sort_order, photos oldest first
 * inside a group, photos without a milestone in a last group. Milestones with
 * no photo are left out. A photo whose milestone is missing from `milestones`
 * (renamed or removed meanwhile) still gets a group of its own.
 */
export function groupPhotosByMilestone(photos: any[], milestones: any[]): TreatmentPhotoGroup[] {
    const known = [...(milestones ?? [])].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    const knownUuids = new Set(known.map((milestone: any) => milestone.uuid))

    const groups: TreatmentPhotoGroup[] = known.map((milestone: any) => ({
        key: milestone.uuid,
        milestone,
        photos: [] as any[],
    }))
    const unknown = new Map<string, TreatmentPhotoGroup>()
    const none: TreatmentPhotoGroup = { key: 'none', milestone: null, photos: [] }

    for (const photo of photos ?? []) {
        const uuid = photo?.milestone?.uuid
        if (!uuid) {
            none.photos.push(photo)
        } else if (knownUuids.has(uuid)) {
            groups.find((group) => group.key === uuid)?.photos.push(photo)
        } else {
            if (!unknown.has(uuid)) unknown.set(uuid, { key: uuid, milestone: photo.milestone, photos: [] })
            unknown.get(uuid)!.photos.push(photo)
        }
    }

    const result = [
        ...groups,
        ...[...unknown.values()].sort((a, b) => (a.milestone?.offset_days ?? 0) - (b.milestone?.offset_days ?? 0)),
    ].filter((group) => group.photos.length > 0)

    if (none.photos.length > 0) result.push(none)
    result.forEach((group) => group.photos.sort(byTakenAt))

    return result
}

/**
 * Fetches photo files as blobs and hands out object URLs. Each photo is
 * downloaded once (thumbnail and compare view share the URL) and every URL is
 * revoked when the calling component unmounts.
 */
export function useTreatmentPhotoImages(fetchBlob: (photo: any) => Promise<Blob | null>) {
    const cache = new Map<string, Promise<string>>()

    function loadImage(photo: any): Promise<string> {
        const existing = cache.get(photo.uuid)
        if (existing) return existing

        const pending = fetchBlob(photo).then((blob) => {
            if (!blob) throw new Error('No image')
            return URL.createObjectURL(blob)
        })
        // A failed download is not kept, so opening the photo again retries.
        pending.catch(() => cache.delete(photo.uuid))
        cache.set(photo.uuid, pending)

        return pending
    }

    function release(uuid: string) {
        const pending = cache.get(uuid)
        cache.delete(uuid)
        pending?.then((url) => URL.revokeObjectURL(url)).catch(() => { })
    }

    function releaseAll() {
        for (const uuid of [...cache.keys()]) release(uuid)
    }

    onBeforeUnmount(releaseAll)

    return { loadImage, release, releaseAll }
}
