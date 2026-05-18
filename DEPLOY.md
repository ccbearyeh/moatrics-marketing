# Deploy — moatrics.com

> **READ THIS FIRST.** This is the source of truth for how the marketing
> site reaches production. Past sessions have mis-guessed the architecture
> (Cloudflare Pages, file watchers, etc.) — don't repeat that. The facts:

## Architecture at a glance

```
                                     ┌─────────────────────────────────┐
   Local repo (this dir)             │   GCE VM: moatrics-v1-20260416  │
   ──────────────────                │   us-central1-f / 34.42.188.59  │
   git push origin main              │                                 │
        │                            │  nginx (port 443)               │
        ▼                            │   ├─ moatrics.com      → /var/www/moatrics-marketing/  (static)
   GitHub: ccbearyeh/moatrics-marketing   │  │                                                  ▲
        │                            │   └─ app.moatrics.com  → 127.0.0.1:8501 (Streamlit)     │
        │ Actions workflow           │                                                          │
        │ .github/workflows/         │  /home/shawnyeh/moatrics-marketing/  (working repo)      │
        │   deploy-vm.yml            │   └─ deploy.sh ──── git pull → npm ci → npm run build  ─┘
        │                            │                     → sudo rsync dist/ → /var/www/...
        ▼                            │
   SSH (deploy key) ───────────────► VM runs deploy.sh
```

- **Marketing site** (this repo) → **static `dist/`** served by **nginx** from
  `/var/www/moatrics-marketing/` on the GCE VM. **Not** Cloudflare Pages,
  **not** any CDN — just nginx on the VM.
- **App** (`app.moatrics.com`) → separate Streamlit process on port 8501,
  reverse-proxied by the same nginx. Independent codebase
  (`tool/` in the parent repo, deployed separately — see that project's
  CLAUDE.md). **Do not touch it from a marketing deploy.**

## Auto-deploy (happy path)

`git push origin main` is all you need.

1. Push to `main` triggers the **`Deploy to VM`** GitHub Actions workflow.
2. Workflow SSHes to the VM as `shawnyeh` using deploy key stored in
   the repo secret `DEPLOY_SSH_KEY`.
3. On the VM it runs `~/moatrics-marketing/deploy.sh`, which does:
   ```bash
   git pull --ff-only origin main
   npm ci --include=dev --no-audit --no-fund
   npm run build               # → dist/
   sudo rsync -a --delete dist/ /var/www/moatrics-marketing/
   ```
4. nginx picks up the new files immediately (no reload needed — static
   files on disk).

End-to-end takes ~30–60 s. Watch it live:

```bash
gh run list --workflow="Deploy to VM" --limit 3
gh run watch                                          # follow the latest run
gh run view --log-failed                              # if it fails
```

### Required GitHub repo secrets (already set)

| Secret           | Value                                                 |
|------------------|-------------------------------------------------------|
| `DEPLOY_HOST`    | `34.42.188.59` (VM public IP)                         |
| `DEPLOY_USER`    | `shawnyeh`                                            |
| `DEPLOY_SSH_KEY` | private key (ed25519). Pubkey lives on the VM at      |
|                  | `~/.ssh/authorized_keys` (comment `github-actions-…`) |

If you ever need to rotate the deploy key:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/moatrics-deploy/gha_deploy_key -N "" \
  -C "github-actions-moatrics-marketing-deploy"
# 1. Append the new .pub to the VM ~/.ssh/authorized_keys (and remove the old line).
# 2. gh secret set DEPLOY_SSH_KEY < ~/.ssh/moatrics-deploy/gha_deploy_key
```

## Manual deploy (when CI is down or you need it NOW)

Either:

```bash
# A. Trigger the workflow manually (no commit needed)
gh workflow run "Deploy to VM"
gh run watch
```

Or SSH directly:

```bash
ssh moatrics-v1-20260416.us-central1-f.moatrics 'cd ~/moatrics-marketing && ./deploy.sh'
```

`deploy.sh` is idempotent and safe to rerun.

## Verifying a deploy

```bash
# (1) Server returned current build — Last-Modified should be the past minute
curl -sI https://moatrics.com/ | grep -i last-modified

# (2) Specific markup from the latest change is present
curl -s  https://moatrics.com/        | grep -oE "(BreadcrumbList|WebSite)"
curl -s  https://moatrics.com/terms/  | grep -oE "(mx-legal-toc|mx-back-to-top)"

# (3) Basic health
curl -sI https://moatrics.com/                  | head -n1   # → 200
curl -sI https://moatrics.com/sitemap-index.xml | head -n1   # → 200
curl -sI https://moatrics.com/robots.txt        | head -n1   # → 200
```

If `Last-Modified` is stale, **the deploy didn't actually run**. Don't
assume browser cache — re-check with `curl -I`.

## Common mistakes (don't repeat these)

- **Assuming moatrics.com is on Cloudflare Pages.** It isn't. The headers
  even say `Server: nginx`. Always check `curl -I` before guessing the
  hosting.
- **`git push` alone, then forgetting the deploy.** Solved by the GitHub
  Actions workflow above, but if the workflow ever fails silently, the
  push appears successful while the live site stays stale. Always glance
  at `gh run list` after a push that matters.
- **Running `deploy.sh` as `sudo ./deploy.sh`.** Don't. The script only
  needs sudo for the final rsync, and it has its own `sudo` there. Running
  the whole thing as root makes `.git` files owned by root and breaks the
  next non-root `git pull`.
- **Editing files directly in `/var/www/moatrics-marketing/`.** Pointless
  — the next `deploy.sh` blows them away via `rsync --delete`. Edit
  source under `src/`, commit, push.
- **Pushing changes that touch `tool/` from this repo.** This repo is the
  *marketing site only* (`ccbearyeh/moatrics-marketing`). The Streamlit
  app lives in a separate repo (`ccbearyeh/moatrics-investing-tool`)
  deployed differently. Cross-contamination breaks both.
- **Mentioning `wellgousa.com` or `shawn.yeh@wellgousa.com` anywhere.**
  The only contact email is `service@moatrics.com`. This rule has been
  broken before; grep for `wellgousa` before every commit.

## DNS, TLS, nginx — for reference

- DNS for `moatrics.com`, `www.moatrics.com`, and `app.moatrics.com`
  all `A`-records to `34.42.188.59`.
- TLS via Certbot (`letsencrypt`), auto-renews via systemd timer.
- nginx server blocks (managed on the VM, not in this repo):
  - `moatrics.com`, `www.moatrics.com` → static root
    `/var/www/moatrics-marketing/`, `try_files $uri $uri/ $uri.html /404.html`.
  - `app.moatrics.com` → `proxy_pass http://127.0.0.1:8501;`.
- If you ever change the nginx config, document the diff here.
