export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseURL || process.env.API_BASE_URL
    const requestUrl = getRequestURL(event)
    const appBaseURL = (config.public.appBaseURL || process.env.APP_BASE_URL || requestUrl.origin).replace(/\/$/, '')

    // Get the authorization token from the request headers
    const authHeader = getHeader(event, 'authorization')

    // Construct the redirect URI - the frontend callback URL (stays at /api/zenegy/callback)
    const redirectUri = `${appBaseURL}/api/zenegy/callback`

    try {
        // Forward the request to your backend API with redirect_uri
        const response = await $fetch(`${baseURL}/user/zenegy/authorize`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader || '',
                'Accept': 'application/json',
            },
            query: {
                redirect_uri: redirectUri
            },
        })

        return response
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to get authorization URL',
        })
    }
})
