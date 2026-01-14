# How to Regenerate HubSpot Access Token

## Step-by-Step Guide

### Step 1: Go to HubSpot Private Apps

1. **Login to HubSpot:**
   - Go to: https://app.hubspot.com/
   - Login with your account

2. **Navigate to Private Apps:**
   - Click on **Settings** (gear icon in top right)
   - In the left sidebar, go to: **Integrations** → **Private Apps**
   - Or direct link: https://app.hubspot.com/settings/integrations/private-apps

### Step 2: Find Your App

1. **Locate your app** in the list
   - Look for the app you created earlier (or the one that has your token)
   - If you don't see any apps, you'll need to create one first

2. **Click on the app name** to open it

### Step 3: Regenerate the Token

**Option A: If you see "Regenerate token" button:**
1. Click on the **"Auth"** tab (or "Authentication" tab)
2. Look for **"Regenerate token"** or **"Create new token"** button
3. Click it
4. **Copy the new token** immediately (it starts with `pat-`)
5. ⚠️ **Important:** You won't be able to see this token again after closing the dialog!

**Option B: If you need to create a new app:**
1. Click **"Create a private app"** button
2. Give it a name (e.g., "Dashboard Integration")
3. Go to **"Scopes"** tab
4. Enable these scopes:
   - ✅ `crm.objects.deals.read`
   - ✅ `crm.objects.contacts.read`
   - ✅ `crm.objects.companies.read`
   - ✅ `sales-email-read`
   - ✅ `conversations.read`
5. Click **"Create app"**
6. Go to **"Auth"** tab
7. Copy the access token (starts with `pat-`)

### Step 4: Update Your .env.local File

1. **Open `.env.local` file** in your project:
   ```bash
   # Location: C:\Users\Ali Muhammad Hussain\Desktop\new\.env.local
   ```

2. **Update the token:**
   ```bash
   HUBSPOT_ACCESS_TOKEN=pat-your-new-token-here
   ```

3. **Save the file**

### Step 5: Restart Dev Server

1. **Stop the current server:**
   - In the terminal where `npm run dev` is running
   - Press `Ctrl+C`

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Check the logs** - you should now see data being fetched!

---

## Quick Visual Guide

```
HubSpot Dashboard
    ↓
Settings (⚙️ icon)
    ↓
Integrations
    ↓
Private Apps
    ↓
[Your App Name] → Click
    ↓
Auth Tab
    ↓
Regenerate Token / Create Token
    ↓
Copy Token (pat-xxxxx)
    ↓
Update .env.local
    ↓
Restart dev server
```

---

## Important Notes

1. **Token Format:**
   - HubSpot tokens start with `pat-` (Private App Token)
   - Example format: `pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (replace x's with your actual token)

2. **Token Security:**
   - ⚠️ **Never commit tokens to git**
   - ⚠️ **Don't share tokens publicly**
   - ✅ Tokens are stored in `.env.local` (which is gitignored)

3. **After Regenerating:**
   - The old token will **stop working immediately**
   - You must update `.env.local` and restart the server
   - Otherwise you'll get authentication errors

4. **Scopes:**
   - If you added new scopes, you **must regenerate** the token
   - Old tokens don't automatically get new scopes

---

## Verify It's Working

After regenerating and restarting, test:

```bash
# In browser, open:
http://localhost:3000/api/hubspot/deals

# Should return JSON with deals, not empty array
```

Or check your server logs for:
```
🔍 Fetching HubSpot deals: { hasAccessToken: true, ... }
HubSpot Deals API Response: { resultsCount: 10, ... }
Fetched 10 deals from HubSpot
```

---

## Troubleshooting

**If you can't find "Regenerate token" button:**
- You may need to delete the old app and create a new one
- Or the token might be in a different location (check all tabs)

**If token doesn't work after regenerating:**
- Make sure you copied the **entire token** (it's long)
- Check for extra spaces in `.env.local`
- Verify you saved the file
- Make sure you restarted the dev server

**If you see "Invalid token" errors:**
- Token might have been copied incorrectly
- Try regenerating again and copy carefully
- Make sure there are no line breaks in the token
