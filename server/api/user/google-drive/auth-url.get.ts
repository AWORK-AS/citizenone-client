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
        return await $fetch('/user/google-drive/auth-url', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'GET',
            headers,
        })
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch Google Drive auth URL',
        })
    }
})
