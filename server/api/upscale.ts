/**
 * Upscale the photo using a rpelicate model to make it much better quality.
 *
 * API REFERENCE:
 * https://replicate.com/jingyunliang/swinir/api
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { photoURL } = body

    // set the url & headers & body
    const url = 'https://api.replicate.com/v1/predictions'
    const headers = { Authorization: `Token ${process.env.REPLICATE_API_KEY}`, 'Content-Type': 'application/json' }
    const data = {
      version: '660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a',
      input: {
        image: photoURL,
      },
    }

    // send to replicate
    const result = (await $fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })) as any

    // return the id
    if (result.id) {
      return result.id
    }
  } catch (e) {
    console.log(e)
  }

  // return an error
  return ''
})
