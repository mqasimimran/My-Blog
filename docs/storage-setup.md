# Connect R2 and Google Drive

## 1. Create public R2 storage

1. Open https://dash.cloudflare.com/ → **Storage & databases → R2**. Complete R2 subscription setup. The Standard free allowance is 10 GB-month with request allowances; usage beyond these is billable.
2. Create a **Standard** bucket, for example `qasim-portfolio-media`. Store only public portfolio assets here.
3. Open the bucket's **Settings → Custom Domains → Connect Domain**. Use a media subdomain of your Cloudflare-managed domain, for example `media.muhammadqasimimran.me`. Wait for it to become active. The public URL will be `https://media.muhammadqasimimran.me`. The S3 API endpoint is NOT a public media URL. An enabled r2.dev URL can be used for initial testing, but use a custom domain for production.
4. Under **Settings → CORS policy**, paste the contents of `docs/r2-cors.json`. It allows localhost:3000 and the existing website domains. Add an exact preview origin if testing another hostname or port.
5. From R2, choose **Manage R2 API Tokens → Create API token**. Select **Object Read & Write**, restricted to this bucket. Save the Access Key ID and Secret Access Key securely. Copy your Cloudflare Account ID too.

## 2. Configure this website

Add these values to `.env.local` and your deployment host's environment variables:

```dotenv
UPLOAD_STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=qasim-portfolio-media
R2_PUBLIC_URL=https://media.muhammadqasimimran.me
```

These are server settings. Never add `NEXT_PUBLIC_` to the keys or commit `.env.local`. Restart local development and redeploy the hosted app after configuration. Open **Admin → Storage** to check for missing settings.

Upload a small image from Design Gallery. Save the design and open it in a private browser window. Check the image uses the media domain and displays without login. A browser upload requires both a working API token and the bucket CORS policy; the settings check alone cannot verify either.

Admin uploads are signed on the server, expire after five minutes, and go directly from the browser to R2. The database saves the resulting public URL. Supabase continues storing content and existing files. Public testimonial form photo uploads still use Supabase. No existing assets are moved or deleted by this integration.

Set `UPLOAD_STORAGE_PROVIDER=supabase` and restart/redeploy to send future uploads back to Supabase. Keep R2's public domain and its environment setting available so existing R2 images continue working.

## 3. Google Drive originals and delivery

This integration uses sharing links, not Google account access or automatic sync.

1. Upload high-resolution originals to a dedicated Drive folder.
2. For a public portfolio folder, set **Share → General access → Anyone with the link → Viewer**. Do not share your entire Drive or confidential source material.
3. Copy the sharing link.
4. Open **Admin → Clients / Case Studies**, edit the client, and paste the link into **Google Drive files or folder**. Save. The public client case study and its campaign pages show a **View full-resolution files on Google Drive** link. This uses the existing `social_links` column; no new database migration is required if social links already work.
5. For private delivery, use **Admin → Client Projects → Add a link** instead. Leave Drive access restricted and share with that client's Google account. Their website portal link alone does not grant Drive access.

Use R2 for images displayed on the website, Drive for originals/downloads, and YouTube embeds for video playback.

References: https://developers.cloudflare.com/r2/api/s3/presigned-urls/ · https://developers.cloudflare.com/r2/buckets/cors/ · https://developers.cloudflare.com/r2/pricing/
