# Deploy

`moatrics-marketing` builds to static HTML + CSS + a tiny amount of JS. Any
static host works. Two recommended paths below.

## Option 1 — Cloudflare Pages (recommended)

Cloudflare Pages is free for unlimited sites, gives you a global CDN, automatic
HTTPS, and per-PR preview deploys.

1. Push this directory to its own GitHub repo (it is not part of the parent
   `Rule 1 Investing` repo — keep it separate so the Streamlit `tool/` repo
   stays clean).
2. In the Cloudflare dashboard → **Pages → Create a project → Connect to Git**.
3. Pick the repo. Settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: 20 (set via `NODE_VERSION=20` env var)
4. After the first deploy, attach the custom domain in **Custom domains →
   Set up a custom domain**:
   - `moatrics.com` (apex)
   - `www.moatrics.com` (optional; Cloudflare will redirect to apex)
5. DNS — point `moatrics.com` A / CNAME at Cloudflare's name servers (or use
   Cloudflare DNS directly). The `app.moatrics.com` record stays on the GCE
   VM so the Streamlit app keeps working independently.

After this, every push to `main` rebuilds and deploys in ~30s.

## Option 2 — nginx on the existing VM

If you want to serve the marketing site from the same GCE VM as the Streamlit
app (less moving parts, slightly more manual):

1. Build locally: `npm run build`
2. `rsync -avz --delete dist/ moatrics-v1-20260416.us-central1-f.moatrics:/var/www/moatrics-marketing/`
3. On the VM, configure nginx so:
   - `moatrics.com` and `www.moatrics.com` serve `/var/www/moatrics-marketing/`
   - `app.moatrics.com` keeps proxying to `127.0.0.1:8501` (Streamlit)

Minimal nginx server block for the marketing site:

```nginx
server {
  listen 443 ssl http2;
  server_name moatrics.com www.moatrics.com;

  root /var/www/moatrics-marketing;
  index index.html;

  # Astro emits per-page directories — try the exact file, then
  # the directory, then fall back to /404.html.
  location / {
    try_files $uri $uri/ $uri.html /404.html;
  }

  # Long-cache static assets emitted by Astro under /_astro/
  location /_astro/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # robots.txt + sitemap-index.xml served from /
  location = /robots.txt   { try_files $uri =404; }
  location = /sitemap-index.xml { try_files $uri =404; }

  ssl_certificate     /etc/letsencrypt/live/moatrics.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/moatrics.com/privkey.pem;
}

server {
  listen 80;
  server_name moatrics.com www.moatrics.com;
  return 301 https://moatrics.com$request_uri;
}
```

Issue / renew certificates with `certbot --nginx -d moatrics.com -d www.moatrics.com`.

## Verifying a deploy

```bash
curl -sI https://moatrics.com/ | head -n 1                       # expect 200
curl -s  https://moatrics.com/ | grep "Invest in Quality"        # hero text
curl -sI https://moatrics.com/sitemap-index.xml | head -n 1      # expect 200
curl -sI https://moatrics.com/robots.txt | head -n 1             # expect 200
```

Google Search Console:
1. Add `https://moatrics.com` as a property (Domain verification preferred).
2. Submit `https://moatrics.com/sitemap-index.xml`.
3. Use **URL Inspection → Request Indexing** on `/`, `/terms`, `/privacy`,
   `/disclaimer` for fast first crawl.
