import { statusService } from '@/components/api/user/StatusService'

export function useStatusPrefill() {
    async function fetchLastStatusFields(modelUuid: string | undefined, fields: string[]): Promise<Record<string, any> | null> {
        if (!modelUuid) return null

        const response = await statusService.getStatuses({ model_uuid: modelUuid, sortField: 'date' })
        const last = response?.data?.[0]
        if (!last) return null

        return Object.fromEntries(fields.filter(field => last[field] !== undefined).map(field => [field, last[field]]))
    }

    return { fetchLastStatusFields }
}
