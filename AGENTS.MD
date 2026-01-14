# AGENTS.md — Static Website (Azure Blob Storage) Guardrails for Codex

## Purpose
This repository is a **static website** deployed to **Azure Blob Storage (Static website hosting)**.  
Codex must **only** make changes that are compatible with a static-site + blob-hosting model.

You are not allowed to introduce backend services, server-side rendering, or any runtime compute dependencies.

---

## Hard Boundaries (Must Not Do)
### No server-side code
- Do **not** add or require:
  - Node/Express, Python/Flask/FastAPI, .NET, Java, PHP, Ruby, Go servers
  - Azure Functions / App Service / Container Apps / Kubernetes
  - SSR frameworks or server adapters (Next.js SSR, Nuxt SSR, SvelteKit adapters, etc.)
- Do **not** create API endpoints or assume any server runtime.

### No external writes or privileged access
- Do **not** add code that:
  - Writes to Azure Storage directly from the client using account keys/SAS that grant write access
  - Assumes access to Key Vault, managed identity, connection strings, or secrets
- Do **not** embed secrets in the repo or in frontend code (keys, SAS tokens, client secrets).

### No “dynamic” features that require a backend
- Avoid login systems requiring secret handling.
- Avoid payment processing integrations that require secret keys on the server.
- Avoid user-generated content uploads unless explicitly implemented using safe, pre-existing, least-privilege mechanisms.

---

## Allowed Architecture
### Static-only outputs
- Output must be deployable as plain static assets:
  - `index.html`
  - CSS (plain / Tailwind built output / etc.)
  - JS bundles
  - images/fonts
- Client-side routing is allowed **only if** it works with static hosting constraints (see Routing below).

### Acceptable tools/build steps
- You may use a build tool **only** if the result is static files (e.g., Vite, Parcel, Astro static export).
- Prefer minimal dependencies.
- Any build must run locally and produce a `/dist` (or equivalent) folder containing static assets.

---

## Azure Blob Static Website Constraints
### Deployment target
Azure Blob static hosting exposes:
- `$web/` container for content
- A single **index document** (commonly `index.html`)
- A single **error document** (commonly `404.html`)

### Routing
Blob static websites do **not** support server rewrites.
Therefore:
- Prefer **hash-based routing** (e.g., `/#/about`) for SPAs, OR
- Use a **fully static** multipage site with real `.html` files, OR
- If using history routing, ensure it still behaves sensibly on refresh (typically not recommended on blob static sites).

### CORS / APIs
If the site calls APIs, they must be:
- Publicly reachable HTTPS endpoints
- Read-only where possible
- Configured with proper CORS
- No secret-bearing auth flows in the browser

---

## Content Security & Privacy
- Do not add trackers or analytics scripts unless explicitly requested.
- Do not add dependencies that exfiltrate user data.
- Keep forms safe: if forms exist, they must submit to an approved external service (e.g., Formspree) or an existing endpoint **provided by the user**.

---

## Repo Change Rules
### What you may change
- HTML/CSS/JS files
- Static assets
- Build config that produces static output
- Documentation (README, this file)

### What you must not add
- Any files that imply server runtime:
  - `server.js`, `app.py`, `main.go`, `.csproj` web apps, etc.
- Infrastructure-as-code that provisions compute (Functions, App Service, AKS), unless explicitly requested.

### Environment variables
- Allowed: *non-secret* public configuration (e.g., public API base URL).
- If you add env vars, they must be:
  - documented
  - safe to expose to the browser
  - optional with sensible defaults

---

## Working Style for Codex
1. **Confirm static compatibility**: Before implementing, check the change can be served from Blob static hosting.
2. **Prefer simplest solution**: Minimal dependencies; avoid heavy frameworks unless already present.
3. **No assumptions about CI/CD**: Only adjust pipeline files if they already exist and need minimal tweaks.
4. **Explain changes clearly**: Summarize what was changed and how it remains static-only.

---

## Validation Checklist (Before You Finish)
- [ ] Output is static files only (deployable to `$web/`)
- [ ] No backend/server code introduced
- [ ] No secrets added or required
- [ ] Routing works under Blob static hosting constraints
- [ ] Any API calls are safe for public client-side use

---

## If a request conflicts with these bounds
If the user asks for features requiring server-side logic (auth with secrets, uploads, payments, SSR, etc.):
- Propose a **static-compatible alternative**, or
- Ask the user to explicitly approve expanding scope beyond Blob static hosting.

(Do not silently add backend components.)
