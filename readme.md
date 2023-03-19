# [🌴 gardensGPT.com](https://gardensgpt.com)

Create Workouts in Seconds with chatGPT

## How it works

It's very simple, we just use replicates's API to generate a new garden design using a controlnet version. All you need is a [replicate](https://replicate.com/) API key and an account on upload.io to store media. It's built with [Nuxt 3](https://nuxt.com).

## Running Locally

### Cloning the repository the local machine.

```
git clone https://github.com/timb-103/gardensGPT.git
```

### Creating a account on Replicate to get an API key.

1. Go to [Replicate](https://replicate.com/) to make an account.
2. Click on your profile picture in the top right corner, and click on "Dashboard".
3. Click on "Account" in the navbar. And, here you can find your API token, copy it.

### Creating a account on Upload.io to get an API key.

1. Go to [Upload.io](https://upload.io/) to make an account.
2. At the top, click "API keys"
3. Copy the public api key

### Storing the API keys in .env

Once you have your API key, create a .env file in the root of the project and values for:

1. REPLICATE_API_KEY=your_api_key
2. UPLOAD_PUBLIC_API_KEY=your_public_api_key

### Installing the dependencies.

```bash
npm install
```

### Running the application.

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
npm run dev
```

## One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/timb-103/gardensGPT.git&env=REPLICATE_API_KEY&project-name=gardensGPT&repo-name=gardensGPT)
