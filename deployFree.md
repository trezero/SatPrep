# Free Deployment Guide for SatPrep

This guide explains how to deploy SatPrep’s backend server and mobile app using only free services.

---

## 1. Backend: Deploy Express Server for Free

### Recommended: Render (or Railway, or Cyclic)
Render.com, Railway.app, and Cyclic.sh all offer free Node.js app hosting with SQLite.

#### Steps (for Render.com):
1. Create a free account at [Render](https://render.com/).
2. Click “New Web Service”.
3. Connect your GitHub account and select the SatPrep repository.
4. Set the root directory to `server` and the build/start commands:
    - Build Command: `npm run build`
    - Start Command: `npm start`
5. Set environment variables, especially `ANTHROPIC_API_KEY` (from your .env).
6. Deploy!

**Notes:**
- Your SQLite database will reset each redeploy unless you upgrade.
- Free services may sleep your app after inactivity.

#### Alternatives
- [Railway](https://railway.app/) – Streamlined interface; very similar process.
- [Cyclic](https://cyclic.sh/) – Fast, free Node.js hosting with automatic deploys.

---

## 2. Mobile App: Run and Share with Expo Go

Deploying a React Native (Expo) app for personal use and testing is free with Expo Go.

### Steps:
1. Make sure [Expo CLI](https://docs.expo.dev/get-started/installation/) is installed:
   ```bash
   npm install -g expo-cli
   ```
2. In your app directory:
   ```bash
   cd app
   npm install
   npx expo start
   ```
3. Open the Expo Go app on your phone (Android/iOS).
4. Scan the QR code from your terminal/browser.

**To Share:**
- Others can scan the QR code to load the app on their devices while your dev server is running.
- For public sharing, use `npx expo publish` to upload your app to Expo’s free hosting. Users will need Expo Go.

**Important:**  
- Set the API base URL in `app/src/services/api.ts` to your deployed backend’s URL (not localhost).

---

## 3. Configuration Checklist

- [ ] Deploy the backend to Render/Railway/Cyclic and get its public URL.
- [ ] Add the backend URL to `app/src/services/api.ts`.
- [ ] Use Expo Go or `expo publish` for free mobile sharing.

---

## 4. Limitations

- Free Node.js hosts may sleep the backend after inactivity.
- SQLite storage can be transient on free tiers.
- Expo Go is for preview/testing; production (App Store/Play Store) requires paid plans or native builds.

---

For detailed info, read the README or see the code:
- Repo: https://github.com/trezero/SatPrep