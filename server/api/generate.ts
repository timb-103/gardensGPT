/**
 * API REFERENCE:
 * https://replicate.com/jagilley/controlnet-hough
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { photoURL, style } = body

    console.log(`Starting image generation for ${photoURL}`)

    // create the prompt
    const url = 'https://api.replicate.com/v1/predictions'
    const headers = { Authorization: `Token ${process.env.REPLICATE_API_KEY}`, 'Content-Type': 'application/json' }
    const prePrompt = `A backyard ${style} garden, (((landscape, architecture, outdoors, photograph, sun light, sharp, bright light, mid day))),`
    const data = {
      version: '854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b',
      input: {
        image: photoURL,
        prompt: `${prePrompt} ${pickStyle(style)}`,
        a_prompt: 'best quality, extremely detailed',
        n_prompt:
          'ugly, tiling, poorly drawn hands, poorly drawn feet, poorly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, bad anatomy, watermark, signature, cut off, low contrast, underexposed, overexposed, bad art, beginner, amateur, distorted face, blurry, draft, grainy, trees in sky, artifacts',
      },
    }

    console.log(`[Prompt] ${data.input.prompt}`)

    // send to replicate
    const result = (await $fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })) as any

    // return error if doesn't create a prediction
    if (result.id) {
      return result.id
    }
  } catch (e) {
    console.log('Error generating:', e)
  }

  // return an error
  return ''
})

function pickStyle(style: string) {
  let prompt = ''

  switch (style) {
    case 'japanese':
      prompt =
        'Japanese-inspired, Zen, tranquil, harmony, balance, stone lanterns, koi pond, moss, gravel, raked sand, rock formations, wooden bridges, bamboo, maples, carefully pruned trees, pagoda, tea house, stepping stones, meditation, reflective, winding paths, hidden corners, water elements, natural materials, symbolism, peaceful, seclusion'
      break
    case 'contemporary minimal':
      prompt =
        'contemporary, minimal, clean lines, geometric shapes, limited color palette, simplicity, open spaces, curated plants, monochromatic, green, hardscaping, stone pathways, concrete benches, sleek water features, balanced, serene, low-maintenance, architectural plants, calm, order, relaxation, contemplation'
      break
    case 'coastal':
      prompt =
        'drought-tolerant, water-wise, xeriscape, native plants, gravel, mulch, cactus, succulents, low-water usage, Mediterranean plants, ornamental grasses, rock gardens, desert-inspired, sustainable, wildlife-friendly, heat-tolerant, dry, sparse, earthy tones, natural materials, driftwood, low-maintenance, efficient irrigation, eco-friendly'
    case 'vegetable':
      prompt =
        'vegetable, garden, lush, green, rows, plants, soil, sunlight, colorful, variety, organic, fresh, growth, healthy, cultivated, outdoors'
    case 'flower':
      prompt =
        'flower, garden, blooming, vibrant, colors, petals, fragrant, greenery, lush, sunlight, variety, landscaped, peaceful, seasonal, pollinators, outdoors'
    case 'tropical':
      prompt =
        'Green, lush, sculpted, hedges, intricate, shapes, geometrical, patterns, pathways, artistic, maintained, manicured, trimmed, symmetrical, focal points, creative, ornamental, plants, bushes, foliage, garden beds, landscape, outdoor, design, maze-like, serene, peaceful, trees, bushes, colorful, flowers, walkways, benches, lighting, shadows, variety, texture'
    case 'scandinavian':
      prompt =
        'scandinavian, garden, lush, green, minimalist, wooden, furniture, cozy, fireplace, perennials, wildflowers, herbs, vegetable, patch, stone, pathways, natural, materials, birdbath, lanterns, trellis, pergola, outdoor, textiles, blankets, cushions, serene, environment, water, feature, potted, plants, neutral, color, palette, functional, clean, lines, harmony, nature, sustainable, fencing, privacy, lighting, Nordic, design.'
    case 'modern':
      prompt =
        'modern, garden, lush, greenery, minimalist, hardscape, geometric, clean lines, water feature, outdoor seating, ambient lighting, raised planters, focal point, pergola, relaxation area, sustainable, drought-tolerant plants, stone pathways'
    case 'industrial':
      prompt =
        'industrial, garden, depth, AI, image, generator, urban, greenery, concrete, metal, structures, reclaimed, nature, modern, artwork, installations, benches, pathways, landscape, design, eco-friendly, adaptive, reuse, sustainable, materials, planters, lighting, grit, vibrant, vegetation, contrast, water, feature, mural, rust, brick, exposed, pipes'
    default:
      break
  }

  return prompt
}
