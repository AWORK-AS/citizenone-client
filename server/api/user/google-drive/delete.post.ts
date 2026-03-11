export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')

    const headers: Record<string, string> = {
        Accept: 'application/json',
    }

    if (authorization) {
        headers.Authorization = authorization
    }

    try {
        const body = await readBody(event)

        return await $fetch('/user/google-drive/delete', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
            body,
        })
    } catch (error: any) {
        console.error('Error deleting from Google Drive:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to delete file from Google Drive',
        })
    }
})
