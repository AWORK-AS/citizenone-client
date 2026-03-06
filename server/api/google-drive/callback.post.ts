export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    
    const headers: Record<string, string> = {
        Accept: 'application/json',
    }

    if (authorization) {
        headers.Authorization = authorization
    }

    const body = await readBody(event)

    try {
        return await $fetch('/google-drive/callback', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
            body,
        })
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to complete Google Drive authentication',
        })
    }
})
