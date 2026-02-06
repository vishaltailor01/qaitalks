# Git Branching Strategy Guide

## Overview

This document explains the branching workflow for QAi Talks development.

```
main (production, auto-deploys)
  ↑
develop (staging, auto-deploys)
  ↑
feat/*, fix/*, docs/*, etc. (feature branches)
```

---

## Quick Start

### 1. Create a New Feature Branch

```bash
# Update develop first
git checkout develop
git pull origin develop

# Create feature branch (naming: feat/description)
git checkout -b feat/careers-page

# Or use shorthand
git switch -c feat/careers-page
```

### 2. Make Changes & Commit

```bash
# Make your changes, then stage them
git add .

# Commit with meaningful message
git commit -m "feat(careers): add careers page with team bios"

# Or multiple commits for logical changes
git commit -m "feat(careers): add careers page"
git commit -m "feat(careers): add team member bios"
git commit -m "feat(careers): add job listings"
```

### 3. Push to GitHub

```bash
# Push your branch
git push origin feat/careers-page

# Or if it's the first push
git push -u origin feat/careers-page
```

### 4. Create Pull Request (PR)

1. Go to: https://github.com/vishaltailor01/qaitalks/pulls
2. Click "New pull request"
3. **Base:** `develop` (staging)
4. **Compare:** `feat/careers-page` (your branch)
5. Add title: `feat(careers): add careers page`
6. Add description of changes
7. Click "Create pull request"

### 5. Review & Merge

**After PR review & tests pass:**

```bash
# Option A: Merge via GitHub UI
# Click "Merge pull request" on GitHub

# Option B: Merge locally
git checkout develop
git pull origin develop
git merge feat/careers-page
git push origin develop
```

### 6. Clean Up

```bash
# Delete local branch
git branch -d feat/careers-page

# Delete remote branch
git push origin --delete feat/careers-page
```

---

## Branch Types & Naming Conventions

| Type | Naming Pattern | Purpose | Example |
|------|---|---|---|
| **Feature** | `feat/description` | New functionality | `feat/careers-page`, `feat/blog-comments` |
| **Fix** | `fix/description` | Bug fixes | `fix/header-styling`, `fix/broken-links` |
| **Documentation** | `docs/description` | Docs, guides, READMEs | `docs/deployment-guide`, `docs/api` |
| **Refactor** | `refactor/description` | Code restructuring | `refactor/css-organization`, `refactor/components` |
| **Performance** | `perf/description` | Performance improvements | `perf/image-optimization`, `perf/lazy-loading` |
| **Style** | `style/description` | Formatting, style fixes | `style/prettier-format`, `style/lint-errors` |
| **Test** | `test/description` | Tests & testing | `test/homepage-e2e`, `test/contact-form` |
| **Chore** | `chore/description` | Dependencies, configs | `chore/update-dependencies`, `chore/add-prettier` |

---

## Commit Message Convention

**Format:**
```
type(scope): description [optional-reference]
```

**Examples:**
- `feat(careers): add careers page` ✅
- `feat(careers): add careers page with team bios (#42)` ✅
- `fix(nav): broken internal link in footer` ✅
- `docs(readme): update deployment instructions` ✅
- `refactor(css): reorganize stylesheet by component` ✅
- `perf(images): compress hero image 2MB → 300KB` ✅

**Guidelines:**
- Use lowercase
- Keep description < 72 characters
- Use imperative mood: "add" not "added", "fix" not "fixed"
- Reference issue numbers: `(#42)` if applicable

---

## Core Branches explained

### `main` (Production)
- **Status:** Stable, production-ready code only
- **Deploy Target:** https://qaitalks.com
- **Who can merge:** Team lead/maintainer after review
- **Protection:** Requires PR review + passing tests (best practice)
- **Deployment:** Auto-deploys via Cloudflare Pages

### `develop` (Staging)
- **Status:** Integration point, tested but may have new features
- **Deploy Target:** https://develop.qaitalks.pages.dev (if configured)
- **Who can merge:** Developers after PR review
- **Protection:** Requires PR review + passing tests (recommended)
- **Deployment:** Auto-deploys via Cloudflare Pages

### Feature Branches (e.g., `feat/careers-page`)
- **Based on:** `develop`
- **Lifetime:** Temporary (deleted after merge)
- **Deployment:** None (test locally)
- **Protection:** None (yours to experiment)

---

## Workflow Diagram

```
START NEW FEATURE
    ↓
git checkout -b feat/feature-name (from develop)
    ↓
Make changes → git add . → git commit -m "..."
    ↓
Repeat commits as needed
    ↓
git push origin feat/feature-name
    ↓
Create Pull Request: feat/feature-name → develop
    ↓
Code Review & Tests
    ↓
APPROVED? 
    ├─ YES → Merge to develop
    │          ↓
    │        Test on staging
    │          ↓
    │        Create Release PR: develop → main
    │          ↓
    │        Merge to main
    │          ↓
    │        Deploy to production ✅
    │
    └─ NO → Request changes
             ↓
           Make updates
             ↓
           Commit & push
             ↓
           Re-review
```

---

## Common Tasks

### Working with Existing Branches

```bash
# List all branches
git branch -a

# Switch to existing branch
git checkout develop
# or modern way
git switch develop

# Delete local branch
git branch -d feat/old-feature

# Delete remote branch
git push origin --delete feat/old-feature
```

### Syncing with Remote

```bash
# Fetch latest from GitHub (doesn't change files)
git fetch origin

# Pull latest changes AND merge
git pull origin develop

# Update your feature branch with latest develop
git checkout feat/your-feature
git pull origin develop
git merge develop
# or rebase (cleaner history)
git rebase develop
```

### Handling Merge Conflicts

```bash
# When you have conflicts during merge
git status  # See conflicted files

# Edit files to resolve conflicts
# (Git marks conflicts with <<<<<<<, =======, >>>>>>>)

# After resolving:
git add .
git commit -m "fix: resolve merge conflicts"
git push origin feat/your-feature
```

### Squashing Commits (Before Merge)

```bash
# Combine multiple commits into one
git rebase -i HEAD~3  # Squash last 3 commits

# In editor: replace 'pick' with 'squash' for commits to combine
# Save and close editor
git push origin feat/your-feature --force-with-lease
```

---

## Best Practices

### ✅ DO
- Create a **new branch for every feature/fix**
- Keep branches **focused on one task**
- Commit **frequently with clear messages**
- Sync regularly: `git pull origin develop`
- Test locally before pushing
- Use **descriptive branch names**
- Reference issues in commits: `(#42)`

### ❌ DON'T
- Commit to `main` or `develop` directly
- Create branches from `main` (use `develop`)
- Mix multiple features in one branch
- Push without testing locally
- Use vague commit messages: "update", "fix stuff"
- Force push to shared branches (`develop`, `main`)
- Delete `main` or `develop` branches

---

## Troubleshooting

### "I committed to wrong branch"

```bash
# Create correct branch
git branch feat/correct-branch

# Reset current branch to before commits
git reset --hard origin/develop

# Switch to correct branch (commits are still there)
git switch feat/correct-branch
```

### "I need to undo last commit"

```bash
# Keep changes (undo commit only)
git reset --soft HEAD~1

# Discard changes entirely
git reset --hard HEAD~1
```

### "Accidental push to main?"

Contact team lead immediately to revert. Don't force push yourself.

### "Branch is out of sync with develop"

```bash
git checkout develop
git pull origin develop
git checkout feat/your-feature
git rebase develop
# or
git merge develop
```

---

## GitHub Workflow Integration

### Branch Protection Rules (Recommended Setup)

For `main` and `develop`:
1. Go to: Settings → Branches → Add rule
2. **Branch name pattern:** `main` or `develop`
3. **Require pull request reviews:** ✅ (minimum 1)
4. **Require status checks:** ✅ (CI/CD passes)
5. **Require branches to be up to date:** ✅
6. **Restrict who can push:** ✅ (allow maintainers)

### Auto-Deployment

**Current setup (Cloudflare Pages):**
- Push to `main` → Auto-deploys to https://qaitalks.com
- Push to `develop` → Can be configured to deploy to staging

---

**Last Updated:** February 6, 2026  
**Need Help?** See SKILLS.md for more context
