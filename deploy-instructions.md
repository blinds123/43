# Deploy to Vercel via GitHub

## Quick Deploy Commands:

```bash
# Create GitHub repo (if you have gh CLI)
gh repo create auralo-hoodie-landing --public

# Add remote and push
git remote add origin https://github.com/[YOUR-USERNAME]/auralo-hoodie-landing.git
git branch -M main
git push -u origin main
```

## Or Manual Steps:

1. Go to GitHub.com → Create new repository
2. Name it: `auralo-hoodie-landing`
3. Upload all files from this folder
4. Go to Vercel.com → Add New Project
5. Import from GitHub → Select your repo
6. Deploy!

## Files Ready for Deployment:
- ✅ index.html (your landing page)
- ✅ vercel.json (Vercel config)
- ✅ package.json (project metadata)
- ✅ .git (already initialized)

## After Deployment:
- Add your Namecheap domain in Vercel settings
- Point DNS to Vercel
- Live site in minutes!

**Total Cost: ~$10/year domain + FREE hosting**