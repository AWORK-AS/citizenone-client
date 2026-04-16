export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    const userId = getHeader(event, 'x-user-id')
    const id = getRouterParam(event, 'id')

    const headers: Record<string, string> = {
        Accept: 'application/json',
    }

    if (authorization) headers.Authorization = authorization
    if (userId) headers['X-User-Id'] = userId

    try {
        const body = await readBody(event)

        return await $fetch(`/user/onedrive/file/${id}`, {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'PUT',
            headers,
            body,
        })
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to update OneDrive file content',
        })
    }
})
