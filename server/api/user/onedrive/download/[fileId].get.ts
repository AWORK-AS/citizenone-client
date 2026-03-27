export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    const userId = getHeader(event, 'x-user-id')
    const fileId = getRouterParam(event, 'fileId')

    const headers: Record<string, string> = {}

    if (authorization) headers.Authorization = authorization
    if (userId) headers['X-User-Id'] = userId

    const response = await fetch(`${runtimeConfig.public.apiBaseURL}/user/onedrive/download/${fileId}`, {
        method: 'GET',
        headers,
    })

    if (!response.ok) {
        throw createError({
            statusCode: response.status,
            statusMessage: 'Failed to download file from OneDrive',
        })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition')
    const buffer = await response.arrayBuffer()

    setResponseHeader(event, 'content-type', contentType)
    if (contentDisposition) setResponseHeader(event, 'content-disposition', contentDisposition)

    return Buffer.from(buffer)
})
