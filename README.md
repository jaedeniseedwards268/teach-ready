# teach-ready
# CS Teaching Toolkit — Vercel-ready repo

## What this repo contains
- `index.html` — single-file lesson planner + AI UI (client)
- `api/ai.js` — serverless proxy to OpenAI (Vercel function)
- `package.json` — minimal dependencies

## Before you deploy
1. Create an OpenAI API key (or Azure OpenAI credentials).
2. Do not put the API key in client code. Use environment variables.

## Deploy to Vercel (one-click)
1. Push this repo to GitHub.
2. Sign in to Vercel and click "New Project" → Import Git Repository.
3. In Vercel project settings, add Environment Variable:
   - `OPENAI_API_KEY` = your OpenAI API key
4. Deploy. The site will be available at `https://<your-project>.vercel.app`.
5. The client posts to `/api/ai` which maps to `api/ai.js`.

## If you want Azure OpenAI
- Replace `api/ai.js` with `api/ai-azure.js` (use the Azure function variant).
- Set environment variables:
  - `AZURE_OPENAI_ENDPOINT` (e.g., https://your-resource.openai.azure.com)
  - `AZURE_OPENAI_KEY`
  - `AZURE_OPENAI_DEPLOYMENT` (your deployment name)

## Local testing
- Install dependencies: `npm install`
- Run Vercel dev: `vercel dev` (requires Vercel CLI) or use Netlify CLI `netlify dev`.
- Ensure environment variables are set locally (e.g., via `.env` for local dev).

## Cost & usage controls
- AI calls are billed by OpenAI/Azure. Monitor usage.
- Add server-side rate limiting or simple auth if you expect many users.

## Troubleshooting
- 500 errors: check environment variables in Vercel dashboard.
- 502 from AI: inspect server logs for provider error details.
