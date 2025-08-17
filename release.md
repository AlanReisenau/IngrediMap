# Guide: Releasing Your PWA on the Web

---

## The PWA Release Philosophy

Instant Updates: When you deploy new code, users will automatically receive the latest version the next time they open the app. The service worker will detect the changes, download the new files in the background, and prompt the user to refresh to get the update.

No Installers: Users access the app through a URL. There's nothing for them to download or install manually.

Changelog via GitHub Releases: While you won't attach files, you should still use GitHub's "Releases" feature to create a version history and write release notes. This is the best way to communicate changes to your users.

---

## Steps to Deploy a New Version

### 1. Finalize Your Code
Ensure the version of the code you want to release is stable, tested, and committed to your main branch (e.g., main).

Check Your Status: Make sure you have no uncommitted changes.

git status

Commit and Push:

git add .
git commit -m "feat: Add new responsive layout for info panel"
git push origin main

---

### 2. Tag Your Release in Git (Recommended)
Tagging creates a permanent marker for a specific version in your project's history.

Create a Tag: Use a tag name that matches your version (e.g., v1.1.0).

git tag -a v1.1.0 -m "Release version 1.1.0"

Push the Tag to GitHub:

git push origin v1.1.0

---

### 3. Deploy the public Folder
Your entire application lives in the public folder. You just need to get the contents of this folder onto your hosting provider.

For Netlify / Vercel:
If you have connected your GitHub repository to Netlify or Vercel, the deployment is automatic. Simply pushing your changes to the main branch will trigger a new build and deployment. This is the recommended, hands-off approach.

For GitHub Pages:
If you are using GitHub Pages, ensure it's configured to serve from your main branch and the /public folder (if you set a custom directory). Pushing to main will automatically update the live site.

Manual Deployment (If Needed):
If you are using a traditional web host, you would typically use an FTP client or a CLI to upload the contents of your local public folder to the server's root directory (e.g., public_html).

---

### 4. Create Release Notes on GitHub
This is how you announce the new version to your users.

Navigate to "Releases" in your GitHub repository.

Click "Draft a new release."

Choose the tag you just pushed (e.g., v1.1.0).

Write a title (e.g., Version 1.1.0 - UI Overhaul).

Describe the changes. This is your changelog.

## IngrediMap v1.1.0 🎉

This release focuses on improving the mobile experience and fixing bugs.

**New Features:**
* The info panel is now a slide-up drawer on mobile devices.
* Added cuisine-based color coding for recipe nodes.

**Bug Fixes:**
* Fixed an issue where recipes with only one shared ingredient would not show a connection.
* Corrected a bug that caused ingredient names to display as `[object Object]`.

Publish Release. Do not add any binaries or .zip files. The release is for documentation only.

---

That's it! Your new version is live, and you have a clean, documented history of your project's releases.
