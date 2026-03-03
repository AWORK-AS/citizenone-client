export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseURL || process.env.API_BASE_URL

  const authHeader = getHeader(event, 'authorization') || getCookie(event, '_token')
  const token = authHeader?.replace('Bearer ', '') || ''
  const body = await readBody(event)

  try {
    return await $fetch(`${baseURL}/user/salary-dk/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body,
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to connect Salary.dk',
    })
  }
})
