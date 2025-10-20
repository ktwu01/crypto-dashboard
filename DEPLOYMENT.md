# Deployment Guide 🚀

This guide provides detailed instructions for deploying the Crypto Analysis Dashboard to various hosting platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Platform-Specific Guides](#platform-specific-guides)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Docker](#docker)
  - [Self-Hosted (VPS)](#self-hosted-vps)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:
- Node.js 18 or higher
- pnpm (or npm/yarn)
- Git repository with your code
- A hosting platform account (Vercel, Netlify, etc.)

## Build Configuration

### Production Build

Create a production-ready build:

```bash
pnpm build
```

or 

```bash
npm run build
```

This command:
1. Installs dependencies
2. Runs TypeScript compiler checks
3. Builds optimized production assets to `dist/` directory

### Preview Build Locally

Test your production build before deploying:

```bash
pnpm build
pnpm preview
```

Access the preview at [http://localhost:4173](http://localhost:4173)

### Environment Setup

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```env
   VITE_API_BASE_URL=https://api.coingecko.com/api/v3
   ```

## Platform-Specific Guides

### Vercel

Vercel provides the easiest deployment experience for Vite applications.

#### Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd crypto-dashboard
   vercel
   ```

3. **Configure environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://api.coingecko.com/api/v3`

#### Deploy via GitHub Integration

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./crypto-dashboard` (if monorepo)
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
6. Add environment variables
7. Click "Deploy"

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

---

### Netlify

Deploy to Netlify for excellent CDN performance.

#### Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy**
   ```bash
   pnpm build
   netlify deploy --prod
   ```

#### Deploy via GitHub Integration

1. Push code to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Configure build settings:
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
   - **Base directory**: `crypto-dashboard` (if monorepo)
6. Add environment variables in Site Settings → Environment Variables
7. Deploy

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  base = "crypto-dashboard"
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### GitHub Pages

GitHub Pages can host this project as a static site. The leanest approach uses GitHub Actions to build and deploy automatically from `main`.

1. **Ensure the base path works for Pages**
   - If the site is served from `https://<user>.github.io/crypto-dashboard/`, set the Vite base in `vite.config.ts`:
     ```ts
     export default defineConfig({
       base: '/crypto-dashboard/',
       // ...rest of config
     })
     ```
   - When deploying to the root of `<user>.github.io`, leave `base` as `/` (default).

2. **GitHub Actions workflow**
   - `.github/workflows/deploy.yml` (already included in this repo):

     ```yaml
     name: Deploy to GitHub Pages

     on:
       push:
         branches: [main]
       workflow_dispatch:

     permissions:
       contents: read
       pages: write
       id-token: write

     concurrency:
       group: "pages"
       cancel-in-progress: true

     jobs:
       build:
         runs-on: ubuntu-latest

         steps:
           - name: Checkout
             uses: actions/checkout@v4

           - name: Setup Node
             uses: actions/setup-node@v4
             with:
               node-version: 20
               cache: pnpm

           - name: Install pnpm
             run: npm install -g pnpm

           - name: Install dependencies
             run: pnpm install --frozen-lockfile

           - name: Build
             run: pnpm build

           - name: Upload artifact
             uses: actions/upload-pages-artifact@v3
             with:
               path: dist

       deploy:
         needs: build
         runs-on: ubuntu-latest
         environment:
           name: github-pages
           url: ${{ steps.deployment.outputs.page_url }}

         steps:
           - name: Deploy to GitHub Pages
             id: deployment
             uses: actions/deploy-pages@v4
     ```

3. **Enable GitHub Pages**
   - Go to **Settings → Pages** and choose **GitHub Actions** as the source.
   - After the first successful workflow run, the site will be available at `https://<user>.github.io/<repo>/`.

No secrets are required because the site uses CoinGecko’s public API directly from the browser.

---

### Docker

Containerize your application for portable deployment.

**Dockerfile**:
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

**Build and run Docker container**:
```bash
# Build image
docker build -t crypto-dashboard .

# Run container
docker run -p 8080:80 -e VITE_API_BASE_URL=https://api.coingecko.com/api/v3 crypto-dashboard

# Access at http://localhost:8080
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_API_BASE_URL=https://api.coingecko.com/api/v3
    restart: unless-stopped
```

---

### Self-Hosted (VPS)

Deploy to your own server (DigitalOcean, AWS EC2, etc.).

#### Using Google Cloud

https://shell.cloud.google.com/?project=involuted-span-466413-s6&pli=1&show=ide%2Cterminal

In the Google Cloud terminal, git clone this repo, and run:

```bash
npm run preview -- --host
```

Then this repo is running inside Cloud Shell.

网页预览按钮可以在 Cloud Shell 任务栏的右上角找到。

Then click "网页预览按钮". change port number if necessary.

Then will be directed to a link, which will look something like this: https://4173-cs-12345-...-devshell.app

This is the quickist way to see your site.

#### Using Nginx

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Upload to server**
   ```bash
   scp -r dist/* user@your-server:/var/www/crypto-dashboard
   ```

3. **Configure Nginx** (`/etc/nginx/sites-available/crypto-dashboard`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/crypto-dashboard;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable caching for static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
   }
   ```

4. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/crypto-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### SSL with Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Environment Variables

### Required Variables

- `VITE_API_BASE_URL` - Base URL for CoinGecko API (default: `https://api.coingecko.com/api/v3`)

### Setting Environment Variables

**Local Development** (`.env`):
```env
VITE_API_BASE_URL=https://api.coingecko.com/api/v3
```

**Vercel**:
- Dashboard → Project Settings → Environment Variables

**Netlify**:
- Site Settings → Environment Variables

**Docker**:
```bash
docker run -e VITE_API_BASE_URL=your_value ...
```

**GitHub Actions**:
- Repository Settings → Secrets and Variables → Actions

---

## Performance Optimization

### Build Optimizations

The production build is automatically optimized with:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Asset optimization

### Additional Optimizations

1. **Enable compression** (gzip/brotli) on your server
2. **Set up CDN** (Cloudflare, etc.) for static assets
3. **Configure caching headers** for optimal performance
4. **Use HTTP/2** for better asset loading

### Vite Build Options

Customize build in `vite.config.ts`:

```ts
export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
```

---

## Troubleshooting

### Build Failures

**TypeScript Errors**:
```bash
# Run type check
pnpm run build
```

**Dependency Issues**:
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Runtime Issues

**API CORS Errors**:
- Ensure `VITE_API_BASE_URL` is set correctly
- Verify CoinGecko API is accessible
- Check browser console for detailed errors

**Blank Page After Deployment**:
- Check base path in `vite.config.ts` (especially for GitHub Pages)
- Verify assets are loading correctly in DevTools Network tab
- Check console for JavaScript errors

**Environment Variables Not Working**:
- Ensure variables are prefixed with `VITE_`
- Restart dev server after changing `.env`
- Rebuild for production: `pnpm build`

### Testing Production Build Locally

```bash
# Build and preview
pnpm build
pnpm preview

# Check for console errors in browser DevTools
# Test all features work correctly
```

---

## Support

For deployment issues:
1. Check the [Vite deployment docs](https://vitejs.dev/guide/static-deploy.html)
2. Open an issue on [GitHub](https://github.com/ktwu01/crypto-dashboard/issues)
3. Review platform-specific documentation

---

**Last Updated**: October 17, 2025
