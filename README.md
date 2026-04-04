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
# CS Teaching Toolkit

## Lesson Design Template
**Topic:** Inclusive Functions & Data Validation
**Date:** Monday, April 6, 2026
**CSTA Standard:** 3A-IC-24 (Inclusive Design)

### 🎯 Visual Anchors
*   📥 **Input:** Gathering user data (e.g., `name = input()`)
*   ⚙️ **Process:** The "Logic Gate" (e.g., `if len(name) < 2:`)
*   📤 **Output:** The result or feedback (e.g., `print("Welcome!")`)

### 🗣️ Direct Instruction (The Script)
> [!important]
> **The Hook:** "In some cultures, names are only two letters long. If our code says names must be 3+ letters, who are we accidentally locking out?"

1.  **Model the Bias:** Show how a simple "length check" can be exclusionary.
2.  **The Fix:** Show how to adjust the **Process (⚙️)** to be more flexible.

---

## 💻 Student Workspace: Python Lab
*Instructions: Copy the code below into your editor. Your goal is to make the validation logic more inclusive.*

```python
def validate_user_registration(name):
    """
    📥 INPUT: Takes a string 'name'
    ⚙️ PROCESS: Checks if the name is valid for our system
    📤 OUTPUT: Returns a welcome message or an error
    """
    
    # CURRENT LOGIC (Potentially Biased)
    if len(name) < 3:
        return "❌ Error: Name is too short. Please use 3+ characters."
    
    # TODO: Monday Morning Challenge 
    # Rewrite the logic above to allow 2-letter names (like 'Jo' or 'Li')
    # while still preventing empty inputs.
    
    else:
        return f"✅ Welcome to the system, {name}!"

# --- Test Area ---
user_name = "Jo" 
print(validate_user_registration(user_name))

