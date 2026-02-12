export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBaseURL || process.env.API_BASE_URL
    const query = getQuery(event)
    
    // Get the OAuth code and state from query parameters
    const code = query.code as string
    const state = query.state as string
    const error = query.error as string
    
    try {
        // Check if there was an error from the OAuth provider
        if (error) {
            // Return HTML that sends error message to opener
            setHeader(event, 'Content-Type', 'text/html')
            return `
                <!DOCTYPE html>
                <html>
                <head><title>Authorization Failed</title></head>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-auth-complete',
                                success: false,
                                error: 'Authorization denied'
                            }, '*');
                            window.close();
                        } else {
                            window.location.href = '/apps?error=${encodeURIComponent('Authorization denied')}';
                        }
                    </script>
                    <p>Authorization failed. This window will close automatically.</p>
                </body>
                </html>
            `
        }
        
        if (!code) {
            setHeader(event, 'Content-Type', 'text/html')
            return `
                <!DOCTYPE html>
                <html>
                <head><title>Authorization Failed</title></head>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({
                                type: 'oauth-auth-complete',
                                success: false,
                                error: 'Missing authorization code'
                            }, '*');
                            window.close();
                        } else {
                            window.location.href = '/apps?error=${encodeURIComponent('Missing authorization code')}';
                        }
                    </script>
                    <p>Authorization failed. This window will close automatically.</p>
                </body>
                </html>
            `
        }
        
        // Get auth token from cookie or request headers
        const authHeader = getHeader(event, 'authorization') || getCookie(event, '_token')
        const token = authHeader?.replace('Bearer ', '') || ''
        
        // Forward the OAuth callback to your backend to exchange the code for tokens
        // and activate the app
        await $fetch(`${baseURL}/zenegy/callback`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            query: {
                code,
                state,
            },
        })
        
        // If successful, return an HTML page that sends a message to the opener window
        setResponseStatus(event, 200)
        setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Authorization Complete</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <h2>Authorization Complete</h2>
    <p>This window will close automatically...</p>
    <script>
        console.log('Sending message to parent window');
        if (window.opener) {
            window.opener.postMessage({
                type: 'oauth-auth-complete',
                success: true
            }, '*');
            console.log('Message sent, closing window in 500ms');
            setTimeout(function() {
                window.close();
            }, 500);
        } else {
            console.log('No opener, redirecting to apps page');
            setTimeout(function() {
                window.location.href = '/apps?success=true';
            }, 1000);
        }
    </script>
</body>
</html>`
        
    } catch (error: any) {
        // Return HTML that sends error message to opener
        const errorMessage = error.data?.message || error.message || 'Failed to complete authorization'
        setHeader(event, 'Content-Type', 'text/html')
        return `
            <!DOCTYPE html>
            <html>
            <head><title>Authorization Failed</title></head>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'oauth-auth-complete',
                            success: false,
                            error: '${errorMessage.replace(/'/g, "\\'")}'
                        }, '*');
                        window.close();
                    } else {
                        window.location.href = '/apps?error=${encodeURIComponent(errorMessage)}';
                    }
                </script>
                <p>Authorization failed. This window will close automatically.</p>
            </body>
            </html>
        `
    }
})
