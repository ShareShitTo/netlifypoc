# Netlify + Neon Capability/Limitation Summary

As of March 2, 2026.

## Goal Context

You are optimizing for:
- Lowest possible setup friction for barely technical users.
- Minimal liability and minimal delegated access risk.
- Clear separation of what is possible vs what is safe/practical.

## Current Project Workflow

- Local dev:
  - `./build_and_run.sh --local`
  - Builds, then runs Netlify local dev proxy.
- Deploy to production:
  - `./build_and_run.sh --prod` (or `--server`)
- Extra deploy modes:
  - `--preview` for deploy-preview context
  - `--qa` for branch-deploy context alias

## Netlify Blobs: What It Is and Is Not

- Blobs is object/KV style storage, not a relational database.
- SDK has TypeScript typing helpers, but persisted data is not runtime-validated by default.
- No SQL/joins/secondary indexes.
- Query model is key lookup + list by prefix/directory + pagination.
- Binary objects are supported.
- No built-in schema migration engine; app-level versioning/migration is required.
- Data persists across deploys for the same site/store.

## Environment Isolation in Blobs

- By default, production/branch/preview can share the same store namespace.
- QA seeing production data is expected unless isolated.
- Isolation patterns:
  - Different store names per env (`app-prod`, `app-qa`, `app-preview`)
  - Or key prefixing (`production/...`, `qa/...`, `preview/...`)

## Deploy Models: Friction vs Capability

### Drag-and-Drop ZIP
- Good for static built assets only.
- Not ideal for full Functions/Blobs source workflow.
- Does not match your full app deployment needs.

### Git-Connected Deploy (Recommended)
- Supports full build + functions + blobs app flow.
- Enables Deploy Previews + Branch Deploys.
- Lowest-risk onboarding for users versus delegated account tokens.

### "Deploy to Netlify" Button (Best low-friction option)
- Very good onboarding UX for non-technical users.
- Still usually requires user Git-provider auth in the flow.
- Preferred over custom delegated API deploy if liability is a concern.

## Branch Deploys and Deploy Previews

- Deploy Preview:
  - Tied to pull requests.
- Branch Deploy:
  - Tied to named branches (for example `qa`).
- Production:
  - Main live deploy target.
- Important:
  - App data can still be shared unless you isolate blob namespaces.

## Netlify Credits/Billing Nuance

- `netlify dev` local runs do not consume hosted runtime credits.
- Production deploys cost credits on current credit-based plans.
- Preview/branch deploy creation may be free, but traffic/runtime still consumes account-level credits.
- Free-tier limits are mostly account/team shared, not strictly per project.

## Netlify DB (Neon Postgres) Nuance

- Netlify DB is Neon-backed Postgres.
- Runtime hosting usage still affects Netlify-side meters (requests/compute/bandwidth).
- DB capacity/plan management is Neon-side after claiming.
- Unclaimed DBs are temporary.

## Neon Free Tier Nuance

- Free tier exists (no card required).
- Includes bounded compute/storage/transfer limits.
- Scale-to-zero helps avoid idle compute burn.
- Behavior at limits is constrained usage until reset/cleanup/upgrade, rather than silent unlimited overage.

## Local Dev Strategy for Postgres (Low Code Churn)

- Keep DB access behind `DATABASE_URL`.
- Switch only env vars across:
  - local offline postgres
  - local -> Neon cloud branch
  - deployed production
- Reuse one migration tool across all environments.
- This gives flexible local/full-cloud/deploy workflow with minimal app logic changes.

## OAuth Delegation Risk: Key Decision

- Core question: can users grant narrow, short-lived, highly granular Netlify OAuth access?
- Current finding: Netlify OAuth does not expose strong granular scopes in the way needed for strict least-privilege per-action delegation.
- Practical result:
  - Your backend could hold powerful delegated access.
  - Safety depends on your implementation discipline, not strict scope boundaries.

## Decision (Liability-Aware)

- Avoid custom delegated Netlify OAuth deploy service for end users.
- Prefer "Deploy to Netlify" button + repo template flow.
- Keep deployment ownership in the user's own Netlify/Git account.

## Repo Hygiene Decisions Made

- Added/updated `.gitignore` to exclude:
  - `.env*` (except `.env.example`)
  - `*.tsbuildinfo`
  - generated `vite.config.js/.d.ts`
  - generated `tailwind.config.js/.d.ts`
  - `*.log`
  - `deno.lock`
- Kept `AGENTS.md` and `LessonsLearnt.md` intentionally in repo.
