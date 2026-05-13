export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    const userId = getHeader(event, 'x-user-id')

    const headers: Record<string, string> = {}
    if (authorization) headers.Authorization = authorization
    if (userId) headers['X-User-Id'] = userId

    try {
        const formData = await readFormData(event)

        const response = await fetch(`${runtimeConfig.public.apiBaseURL}/user/onedrive/upload`, {
            method: 'POST',
            headers,
            body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
            throw createError({ statusCode: response.status, message: data?.error || 'Failed to upload file to OneDrive' })
        }

        return data
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.statusMessage || error.message || 'Failed to upload file to OneDrive',
        })
    }
})
