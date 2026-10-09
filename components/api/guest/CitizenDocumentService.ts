/**
 * The guest side of a citizen-documents share link.
 *
 * Not BaseAPIService: that sends the app's own login token and, on a 401,
 * logs the browser out. A staff member opening a link they were sent must
 * stay logged in, and the guest's token is kept for this one link only, in
 * memory, so closing the tab ends the session.
 */
export class GuestDocumentError extends Error {
    status: number
    errors: Record<string, string[]>

    constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
        super(message)
        this.status = status
        this.errors = errors
    }
}

class GuestCitizenDocumentService {
    private token: string | null = null

    setToken(token: string | null) {
        this.token = token
    }

    async authenticate(shareUuid: string, password: string, locale: string): Promise<any> {
        const response = await this.send(`/guest/citizen-documents/${shareUuid}/auth`, {
            method: 'POST',
            body: { password, locale },
        })
        this.token = response?.data?.token ?? null

        return response
    }

    async getContents(shareUuid: string, folderUuid: string | null, locale: string): Promise<any> {
        return await this.send(`/guest/citizen-documents/${shareUuid}/contents`, {
            method: 'GET',
            query: { folder_uuid: folderUuid ?? undefined, locale },
        })
    }

    async viewFile(shareUuid: string, fileUuid: string, locale: string): Promise<Blob | null> {
        return await this.send(`/guest/citizen-documents/${shareUuid}/files/${fileUuid}/view`, {
            method: 'GET',
            query: { locale },
            responseType: 'blob',
        })
    }

    async downloadFile(shareUuid: string, fileUuid: string, locale: string): Promise<Blob | null> {
        return await this.send(`/guest/citizen-documents/${shareUuid}/files/${fileUuid}/download`, {
            method: 'GET',
            query: { locale },
            responseType: 'blob',
        })
    }

    private async send(url: string, options: any): Promise<any> {
        const runtimeConfig = useRuntimeConfig()

        try {
            return await $fetch(url, {
                ...options,
                baseURL: runtimeConfig.public.apiBaseURL as string,
                headers: {
                    Accept: 'application/json',
                    ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
                },
            })
        } catch (error: any) {
            let body = error?.response?._data
            if (body instanceof Blob) {
                try {
                    body = JSON.parse(await body.text())
                } catch {
                    body = {}
                }
            }

            throw new GuestDocumentError(body?.message ?? '', error?.response?.status ?? 0, body?.errors ?? {})
        }
    }
}

export const guestCitizenDocumentService = new GuestCitizenDocumentService()
