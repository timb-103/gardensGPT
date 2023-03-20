/**
 * API REFERENCE:
 * https://replicate.com/jagilley/controlnet-hough
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id } = body

    // set the url & headers
    const url = `https://api.replicate.com/v1/predictions/${id}`
    const headers = { Authorization: `Token ${process.env.REPLICATE_API_KEY}`, 'Content-Type': 'application/json' }

    // check to see if the prediction is done
    const result = (await $fetch(url, { method: 'GET', headers })) as any

    // return status & url if it exists
    return { status: result.status, output: result?.output || [] }
  } catch (e) {
    console.log('Error getting prediction:', e)
  }

  // return an error
  return { status: '', output: [] }
})
