# Running Playwright E2E on Sauce Labs

This repo uses Playwright for E2E tests (`npm run test:e2e`). Sauce Labs can run those tests in the cloud via `saucectl`.

## Prereqs

- Sauce Labs account
- Your Sauce credentials exported as environment variables:
  - `SAUCE_USERNAME`
  - `SAUCE_ACCESS_KEY`

## 1) Decide what URL you are testing

- **Recommended (simplest):** test against a deployed environment (staging/preview).
  - Set `PLAYWRIGHT_BASE_URL` to that URL.
- **Alternative:** test a local dev server through a tunnel (Sauce Connect).

This repo’s `playwright.config.ts` uses `PLAYWRIGHT_BASE_URL` when set. If it points at `localhost`, Playwright will start the dev server automatically; otherwise it won’t start a server.

## 2) Install and initialize `saucectl`

Install `saucectl` (pick one):

- macOS (Homebrew): `brew install saucectl`
- Or follow Sauce Labs “saucectl” install docs for your OS.

Then generate a Playwright config template:

`saucectl init playwright`

This typically creates a `.sauce/config.yml` you can edit.

## 3) Configure the suite to run this repo’s tests

In `.sauce/config.yml`, set the suite to run Playwright, using this repo’s command:

- Test command: `npm run test:e2e`

If your tests need a specific URL, set it via env:

- Example: `PLAYWRIGHT_BASE_URL=https://your-staging-url.example`

## 4) Run in Sauce Labs

From the repo root:

`SAUCE_USERNAME=... SAUCE_ACCESS_KEY=... saucectl run`

## 5) If you need to test `localhost` (Sauce Connect)

Enable Sauce Connect/tunneling in `.sauce/config.yml` and keep:

- `PLAYWRIGHT_BASE_URL=http://localhost:3000`

Then run:

`SAUCE_USERNAME=... SAUCE_ACCESS_KEY=... saucectl run`

## CI notes

- Store `SAUCE_USERNAME` / `SAUCE_ACCESS_KEY` as CI secrets.
- Set `PLAYWRIGHT_BASE_URL` to your CI-deployed preview/staging URL (preferred), or enable Sauce Connect if you must hit a local service.

