import BaseAPIService from '@/components/api/BaseAPIService'
import type { GrowthEvent, GrowthLoop } from '@/composables/growthEvents'

// Exposure of the growth loops: an entry point was shown or opened. Codes only;
// the backend decides what it keeps (once per person, loop and day for an impression).
class GrowthEventService extends BaseAPIService {
    async record(loop: GrowthLoop, event: GrowthEvent): Promise<void> {
        await this.request(`/user/growth-events`, 'POST', { loop, event })
    }
}

export const growthEventService = new GrowthEventService()
