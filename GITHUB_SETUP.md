# Git and GitHub Setup Guide

## Step 1: Initialize Git Repository

1. **Initialize git in your project:**
   ```bash
   git init
   ```

2. **Add all files:**
   ```bash
   git add .
   ```

3. **Create first commit:**
   ```bash
   git commit -m "Initial commit: QAi Talks static site"
   ```

---

## Step 2: Create GitHub Repository

### Option A: Using GitHub Website (Recommended)
1. **Go to:** https://github.com/new
2. **Repository name:** `qaitalks` (or your preferred name)
3. **Description:** "Educational platform for SDETs and QA Architects"
4. **Visibility:** Public (or Private)
5. **DO NOT initialize with:**
   - ❌ README
   - ❌ .gitignore
   - ❌ license
6. **Click:** "Create repository"

### Option B: Using GitHub CLI (if installed)
```bash
gh repo create qaitalks --public --source=. --remote=origin
```

---

## Step 3: Connect Local to GitHub

After creating the GitHub repository, connect it:

```bash
# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/vishaltailor01/qaitalks.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Step 4: Add GitHub Secrets

### Get Required Values First

#### 4.1 Get Cloudflare API Token
1. **Go to:** https://dash.cloudflare.com/profile/api-tokens
2. **Click:** "Create Token"
3. **Select:** "Edit Cloudflare Workers" template
4. **Permissions:**
   - Account → Cloudflare Pages → Edit
5. **Click:** "Continue to summary" → "Create Token"
6. **Copy the token** (you won't see it again!)

#### 4.2 Get Cloudflare Account ID
1. **Go to:** https://dash.cloudflare.com
2. **Select your account** (any domain)
3. **Look at the right sidebar** → Copy "Account ID"
   - Format: `1234567890abcdef1234567890abcdef`

### Add Secrets to GitHub

1. **Go to your GitHub repository:**
   ```
   https://github.com/YOUR-USERNAME/qaitalks/settings/secrets/actions
   ```

2. **Click:** "New repository secret"

3. **Add First Secret:**
   - **Name:** `CLOUDFLARE_API_TOKEN`
   - **Value:** Paste the API token from step 4.1
   - **Click:** "Add secret"

4. **Add Second Secret:**
   - **Click:** "New repository secret" again
   - **Name:** `CLOUDFLARE_ACCOUNT_ID`
   - **Value:** Paste the Account ID from step 4.2
   - **Click:** "Add secret"

### Visual Navigation Path
```
GitHub Repo → Settings (top menu)
  → Secrets and variables (left sidebar)
    → Actions
      → "New repository secret" button
```

---

## Step 5: Verify Auto-Deploy Works

1. **Make a small change** (e.g., edit a heading in index.html)

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "test: trigger auto-deploy"
   git push origin main
   ```

3. **Check GitHub Actions:**
   - Go to: https://github.com/YOUR-USERNAME/qaitalks/actions
   - You should see the workflow running
   - Status: ✅ Green checkmark when successful

4. **Verify deployment:**
   - Visit: https://main.qaitalks.pages.dev
   - Your changes should appear within 1-2 minutes

---

## Troubleshooting

### "Permission denied" when pushing to GitHub
**Solution:** Use Personal Access Token (classic)
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Use token as password when pushing

### Workflow fails with "Invalid Cloudflare credentials"
**Solution:** Verify secrets
1. Check API token is correct (regenerate if needed)
2. Check Account ID matches your Cloudflare account
3. Ensure secret names are EXACTLY: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

### Deployment succeeds but site not updated
**Solution:** Clear Cloudflare cache
1. Cloudflare Dashboard → Caching → Purge Everything
2. Hard refresh browser: Ctrl + Shift + R

---

## Quick Reference Commands

```bash
# Check git status
git status

# View remote connections
git remote -v

# View commit history
git log --oneline

# Create new branch
git checkout -b develop

# Push to GitHub
git add .
git commit -m "your message"
git push origin main
```

---

**Last Updated:** February 6, 2026  
**Need Help?** See full deployment guide in DEPLOYMENT.md
