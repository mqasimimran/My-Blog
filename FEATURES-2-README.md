# New features (batch 2)

## Install (in this order)
1. Copy everything in this folder over your project (same paths).
2. Run `npm install` (adds `pdf-lib`, used to build your CV).
3. In Supabase -> SQL Editor -> New query, paste **supabase/update-2026-10-b.sql** and Run
   (no text highlighted). Run update-2026-10-v2.sql first if you haven't.
4. Delete the `.next` folder, `npm run dev`. When happy: `git add . && git commit -m "Features batch 2" && git push`.

## What's new
- **Discount codes.** Admin -> Discount Codes: create percent or fixed-amount codes, with optional use
  limits and expiry dates. Buyers apply them in the checkout's order summary. The server works out the
  discount and uses the code up atomically, so a limited code can never be over-used.
- **CV generated from your resume.** "Download CV" now builds a PDF live from Admin -> Resume Manager.
  Prefer your own PDF? Put it in /public and set site.config.ts -> resume.cvFile = '/resume.pdf'.
- **Smart image uploads.** Admin image uploads are resized (longest side 2400px) and converted to WebP
  before uploading, usually several times smaller. SVG, GIF, video and small images are left alone.
- **"Ask about me" AI assistant** (optional). Add ANTHROPIC_API_KEY (from console.anthropic.com) to
  .env.local AND to Vercel -> Settings -> Environment Variables, then redeploy. A chat button appears on
  the site. It answers only from your site's content, 20 questions per visitor per hour. No key = hidden.
