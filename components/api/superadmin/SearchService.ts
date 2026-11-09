import BaseAPIService from '@/components/api/BaseAPIService'
import type { SearchApiGroups } from '@/composables/superadminSearch'

export type SuperadminSearchResponse = { data: { query: string; groups: SearchApiGroups } }

class SearchService extends BaseAPIService {
    /** Søg overalt (⌘K). Pass a signal so a newer keystroke can cancel this one. */
    async search(q: string, signal?: AbortSignal): Promise<SuperadminSearchResponse> {
        return await this.request(`/superadmin/search`, 'GET', { q }, signal)
    }
}

export const searchService = new SearchService()
