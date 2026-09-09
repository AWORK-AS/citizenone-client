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
        return await $fetch('/user/google-drive/disconnect', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
        })
    } catch (error: any) {
        console.error('Error disconnecting Google Drive:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to disconnect Google Drive',
        })
    }
})
