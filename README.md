
  # Landing page for portfolio

  This is a code bundle for Landing page for portfolio. The original project is available at https://www.figma.com/design/9wnxAApZnMSrzdfVuBLOXK/Landing-page-for-portfolio.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the Vite frontend only.

  Run `npm run dev:vercel` to start the Vercel local environment with both frontend and API.

  ## AI mode with Vercel Functions

  The AI terminal mode uses a root-level Vercel Function at `api/chat.ts`.

  1. Copy `.env.example` to `.env.local`.
  2. Add your `OPENROUTER_API_KEY`.
  3. Optionally change `OPENROUTER_MODEL`.
  4. Run the app with `npm run dev:vercel` or `vercel dev` to serve both the Vite frontend and the function together.

  Recommended local flow:

  ```bash
  npm i
  cp .env.example .env.local
  npm run dev:vercel
  ```

  Required server env vars:

  - `OPENROUTER_API_KEY`

  Optional server env vars:

  - `OPENROUTER_MODEL`
  - `APP_URL`
  - `APP_NAME`
  
