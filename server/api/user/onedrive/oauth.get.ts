export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    const userId = getHeader(event, 'x-user-id')
    const query = getQuery(event)

    const headers: Record<string, string> = {
        Accept: 'application/json',
    }

    if (authorization) headers.Authorization = authorization
    if (userId) headers['X-User-Id'] = userId

    try {
        return await $fetch('/user/onedrive/oauth', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'GET',
            headers,
            query,
        })
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to complete OneDrive OAuth',
        })
    }
})
