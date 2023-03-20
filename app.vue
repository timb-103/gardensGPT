<template>
  <div class="wrapper">
    <!-- Nav -->
    <nav class="center">
      <h2>🌴 GardensGPT</h2>
    </nav>

    <!-- Header -->
    <header class="center">
      <h1>Create a new garden for your backyard with AI.</h1>
      <p>Just upload a photo of your garden or backyard and we'll generate a brand new garden layout using AI.</p>
    </header>

    <!-- Generator -->
    <div class="generator">
      <!-- Upload  -->
      <div>
        <label><strong>1. Upload a photo of your garden</strong></label>
        <div class="upload-group">
          <input type="file" accept="image/png, image/jpeg" @change="onFileSelected" />
          <div class="upload-photo">
            <div class="progress" v-if="uploading">
              <div class="progress-box">
                <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
              </div>
            </div>
            <img v-if="photo.preview" :src="photo.preview" />
          </div>
        </div>
      </div>

      <!-- Location  -->
      <div>
        <label><strong>2. Pick a style</strong></label>
        <div class="options">
          <select v-model="styleSelected">
            <option v-for="(item, index) in styles" :key="index" :value="item" :selected="item === styleSelected">{{ item }}</option>
          </select>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="error">
        <p>Error generating photo, please try again.</p>
      </div>

      <!-- Generate Button -->
      <div>
        <button class="button generate-button" data-type="primary" @click="generate()" :disabled="uploading || loading || !photo.uploadedURL">
          <span v-if="!loading">Generate Garden (~30 seconds)</span><span v-else>Loading...</span>
        </button>
      </div>

      <!-- Garden -->
      <div>
        <div v-if="gardenURL" class="garden">
          <div v-if="!gardenURLUpscaled" class="upscaling">
            <p>Upscaling photo...</p>
          </div>
          <img :src="gardenURL" class="non-upscaled-photo" />
          <img v-if="gardenURLUpscaled" :src="gardenURLUpscaled" class="upscaled-photo" />
        </div>
      </div>

      <!-- Made By -->
      <div class="made-by center">
        <p>
          Built by <a href="https://twitter.com/Timb03" target="_blank">Tim Bennetto</a> using
          <a href="https://replicate.com" target="_blank">Replicate</a>, <a href="https://upload.io" target="_blank">Upload.io</a> and hosted on
          <a href="https://vercel.com" target="_blank">Vercel</a>'s free plan.
        </p>
        <div>
          <a href="https://github.com/timb-103/gardensGPT" target="_blank" aria-label="GitHub">
            <svg aria-hidden="true" height="25" width="23">
              <path
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'GardensGPT - Create a new garden layout for your backyard with AI.' })

const loading = ref(false)
const error = ref(false)
const runtimeConfig = useRuntimeConfig()

// add photo from input
const photo = ref({ preview: '', uploadedURL: '', upscaledURL: '' })
const uploadProgress = ref(0)
const uploading = ref(false)

// initiate upload plugin
let upload = {} as any
onMounted(() => {
  upload = window.Upload({ apiKey: runtimeConfig.public.uploadPublicApiKey })
})

const onFileSelected = async (event: any) => {
  const [file] = event.target.files

  if (!file) {
    return
  }

  // clear old photo
  photo.value.preview = ''
  photo.value.uploadedURL = ''
  error.value = false

  uploading.value = true
  photo.value.preview = URL.createObjectURL(file)
  const { fileUrl } = await upload.uploadFile(file, { onProgress })
  photo.value.uploadedURL = fileUrl
  uploading.value = false
}

const onProgress = (progress: any) => {
  uploadProgress.value = progress.progress
}

// style
const styles = ref(['scandinavian', 'vegetable', 'flower', 'japanese', 'tropical', 'contemporary minimal', 'modern', 'coastal', 'industrial'])
const styleSelected = ref('japanese')

// generate garden
const gardenURL = ref('')
const gardenURLUpscaled = ref('')
async function generate() {
  // start loading, clear error
  loading.value = true
  error.value = false

  // clear existing garden
  gardenURL.value = ''
  gardenURLUpscaled.value = ''

  try {
    // add plausible event
    if (window.plausible) {
      window.plausible('gardenGenerated')
    }

    // generate the garden
    const { data: id } = (await useFetch('/api/generate', {
      method: 'post',
      body: { photoURL: photo.value.uploadedURL, style: styleSelected.value },
    })) as any

    if (!id.value) {
      error.value = true
      loading.value = false
      return
    }

    // check result of the image generation every 1 second
    const generationResult = await checkPrediction(id.value)
    gardenURL.value = generationResult[1]

    // upscale the result
    const { data: upscaledId } = (await useFetch('/api/upscale', { method: 'post', body: { photoURL: gardenURL.value } })) as any

    // check result of the image uplscale every 1 second
    if (upscaledId) {
      gardenURLUpscaled.value = await checkPrediction(upscaledId.value)
    }
  } catch (e) {
    console.log('Error generating garden:', e)
  }

  // end loading
  loading.value = false
}

async function checkPrediction(id: string) {
  let count = 0
  let output = []

  try {
    // check for result every 1s
    while (!output.length && count < 100) {
      // inc counter so it doesn't poll forever
      count += 1

      // get prediction
      let result = (await $fetch('/api/getPrediction', { method: 'post', body: { id } })) as any

      // set the results or try again in 1 second
      if (result.status === 'succeeded') {
        output = result.output
      } else if (result.status === 'failed') {
        error.value = true
        break
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  } catch (e) {
    console.log('Error checking prediction:', e)
  }

  return output
}
</script>
<style scoped>
/* Header */
header {
  max-width: 600px;
  margin: 4em auto auto auto;
}

/* Generator */
.generator {
  max-width: 600px;
  margin: 4em auto;
  display: grid;
  gap: 2em;
}

/* Upload */
.upload-group {
  position: relative;
}
.upload-photo > img {
  max-width: 100%;
  display: block;
  margin-top: 10px;
}
.upload-photo {
  position: relative;
}

/** Progress */
.progress {
  height: 100%;
  z-index: 2;
  position: absolute;
  width: 100%;
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
}
.progress-box {
  height: 10px;
  border-radius: 10px;
  width: 90%;
  background: #fff;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  width: 0;
  background: var(--black);
}

/* Generate Button */
.generate-button {
  width: 100%;
  justify-content: center;
}

/* Garden */
.garden {
  margin-top: 1em;
  position: relative;
}
.garden > img {
  max-width: 100%;
  display: block;
}

/** Upscaling */
.upscaling {
  height: 100%;
  z-index: 2;
  position: absolute;
  width: 100%;
  background: rgba(255, 255, 255, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
}
.upscaling > p {
  background: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  border-radius: 40px;
  padding: 0 10px;
}
.upscaled-photo {
  position: absolute;
  top: 0;
  left: 0;
}
.non-upscaled-photo {
}

/* Options */
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.option {
  border: 1px solid var(--grey);
  border-radius: 6px;
  background: #fff;
  padding: 0.7em 1.4em;
  position: relative;
}
.option:hover {
  background: #fafafa;
  cursor: pointer;
}
.option-selected {
  border-color: var(--black);
}
.option-check {
  display: none;
  position: absolute;
  top: -4px;
  right: -4px;
  background: #fff;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--black);
  font-size: 11px;
}
.option-selected > .option-check {
  display: flex;
}

/* Made By */
.made-by > p {
  font-size: 15px;
}
.made-by > div {
  margin-top: 1em;
}
</style>
