export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseURL || process.env.API_BASE_URL

  const authHeader = getHeader(event, 'authorization') || getCookie(event, '_token')
  const token = authHeader?.replace('Bearer ', '') || ''
  const body = await readBody(event)

  try {
    return await $fetch(`${baseURL}/user/salary-dk/time-registrations/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body,
    })
  } catch (error: any) {
    const responseData = error?.data || error?.response?._data || null
    console.error('[Salary.dk time registrations] Backend error:', JSON.stringify(responseData))
    throw createError({
      statusCode: error.statusCode || 500,
      message: JSON.stringify(responseData) || error.message || 'Failed to sync time registrations to Salary.dk',
    })
  }
})
