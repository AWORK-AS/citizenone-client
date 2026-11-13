import { escapeHtml, jsStringLiteral } from '../../utils/inlineHtml'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseURL || process.env.API_BASE_URL

  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  // Rendered into the page below, so never as raw text: it is whatever the
  // link said, and this route needs no login.
  const error = typeof query.error === 'string' ? query.error : ''

  // This is a full-page browser redirect from Keycloak, so there's no
  // Authorization header and no `_token` cookie to read (the app only ever
  // stores the Sanctum token in localStorage, which a server route can't
  // reach) - the backend's `/danlon/callback` route doesn't require one
  // either: it's excluded from auth:sanctum/EnsureStaffPrincipal and instead
  // authenticates via the company_id embedded in `state`, which only our
  // own authorize() endpoint could have produced for an already-authenticated
  // company.

  // Handle OAuth errors
  if (error || !code) {
    return `<!DOCTYPE html>
<html>
<head><title>Danløn Authorization Failed</title></head>
<body>
  <h2>Authorization Failed</h2>
  <p>${escapeHtml(error || 'Missing authorization code')}</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'danlon-auth-complete',
        success: false,
        error: ${jsStringLiteral(error || 'Missing authorization code')}
      }, '*');
      setTimeout(() => window.close(), 2000);
    } else {
      setTimeout(() => {
        window.location.href = ${jsStringLiteral('/apps?error=' + encodeURIComponent(error || 'Authorization failed'))};
      }, 2000);
    }
  </script>
</body>
</html>`
  }

  try {
    // Exchange code with backend
    await $fetch(`${baseURL}/user/danlon/callback`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      query: { code, state },
    })

    // Return success HTML with postMessage
    return `<!DOCTYPE html>
<html>
<head><title>Danløn Authorization Complete</title></head>
<body>
  <h2>Authorization Complete</h2>
  <p>You can close this window.</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'danlon-auth-complete',
        success: true
      }, '*');
      setTimeout(() => window.close(), 500);
    } else {
      window.location.href = '/apps?success=true&message=Connected+to+Danløn';
    }
  </script>
</body>
</html>`
  } catch (error: any) {
    console.error('[Danløn callback] Backend error:', error)

    return `<!DOCTYPE html>
<html>
<head><title>Danløn Connection Failed</title></head>
<body>
  <h2>Connection Failed</h2>
  <p>Failed to complete Danløn authorization. Please try again.</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'danlon-auth-complete',
        success: false,
        error: 'Connection failed'
      }, '*');
      setTimeout(() => window.close(), 2000);
    } else {
      setTimeout(() => {
        window.location.href = '/apps?error=Connection+failed';
      }, 2000);
    }
  </script>
</body>
</html>`
  }
})
