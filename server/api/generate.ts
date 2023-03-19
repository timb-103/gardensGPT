/**
 * API REFERENCE:
 * https://replicate.com/jagilley/controlnet-hough
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { photoURL } = body

    // create the prompt
    const prompt = 'a photograph of a backyard garden, outdoors, organic, photograph, landscape, sunlight, image'
    const url = 'https://api.replicate.com/v1/predictions'
    const headers = { Authorization: `Token ${process.env.REPLICATE_API_KEY}`, 'Content-Type': 'application/json' }
    const data = {
      version: '854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b',
      input: {
        image: photoURL,
        prompt: prompt,
        a_prompt: 'best quality, extremely detailed, photo from Pinterest, interior, cinematic photo, ultra-detailed, ultra-realistic, award-winning',
        n_prompt: 'longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality',
      },
    }

    // send to replicate
    const result = (await $fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })) as any

    // return error if doesn't create a prediction
    if (!result?.id) {
      return ''
    }

    // now we should get the result of the image generation every 1 second
    let generatedPhotoURL = ''
    let count = 0
    while (!generatedPhotoURL && count < 100) {
      console.log(`Checking result of generation: ${count}`)
      count += 1
      let finalResponse = (await $fetch(`${url}/${result.id}`, { method: 'GET', headers })) as any
      if (finalResponse.status === 'succeeded') {
        generatedPhotoURL = finalResponse.output[1]
      } else if (finalResponse.status === 'failed') {
        break
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // return to browser
    return generatedPhotoURL
  } catch (e) {
    console.log(e)
  }

  // return an error
  return ''
})
