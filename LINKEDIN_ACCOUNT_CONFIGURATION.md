# LinkedIn Ads Account Configuration

**Last Updated:** January 2026

## Default LinkedIn Ads Account

**Account Name:** PureVPN - Partner & Enterprise Solutions  
**Account ID:** `514469053`  
**Account URN:** `urn:li:sponsoredAccount:514469053`

## Configuration Locations

### 1. Main Ads Dashboard (`app/(dashboard)/ads/page.tsx`)

```typescript
// Default LinkedIn Ads Account: PureVPN - Partner & Enterprise Solutions
const PUREVPN_ACCOUNT_ID = "514469053";
const PUREVPN_ACCOUNT_URN = `urn:li:sponsoredAccount:${PUREVPN_ACCOUNT_ID}`;
```

**Usage:**
- Primary account used for fetching campaigns and analytics
- Falls back to this account if account lookup fails
- Used for all LinkedIn Ads data on the `/ads` page

### 2. Data Aggregator Agent (`lib/agents/dataAggregator.ts`)

**Configuration:**
- Searches for account with ID `514469053` or name containing "PureVPN" and "Partner"
- Falls back to first account if target account not found
- Used for automated report generation

### 3. Account Selection Logic

The system uses the following priority:

1. **Exact ID Match:** `simpleId === "514469053"`
2. **URN Match:** `id === "urn:li:sponsoredAccount:514469053"`
3. **Name Match:** Account name contains both "purevpn" AND "partner"
4. **Alternative Name Match:** Account name contains "enterprise solutions"
5. **Fallback:** First account in the list

## Account Details

**From LinkedIn API:**
- **Name:** PureVPN - Partner & Enterprise Solutions
- **ID:** 514469053
- **Status:** Active
- **Campaigns:** 19 campaigns (4 active, 8 paused, 5 draft)

**Active Campaigns:**
1. Lead generation - Apr 25, 2025 (ACTIVE)
2. MDR Awareness - EU - CISO & IT Leaders (ACTIVE)
3. MDR Awareness - US/CA/AU/SG/IN - CISO & IT Leaders (ACTIVE)
4. Lead generation - Au & NZ - Sep 26, 2025 (ACTIVE)

## How to Change the Default Account

If you need to change the default LinkedIn account:

1. **Update Account ID** in `app/(dashboard)/ads/page.tsx`:
   ```typescript
   const PUREVPN_ACCOUNT_ID = "YOUR_NEW_ACCOUNT_ID";
   ```

2. **Update Data Aggregator** in `lib/agents/dataAggregator.ts`:
   ```typescript
   const targetAccount = accounts.find(
     (acc: any) => 
       acc.simpleId === "YOUR_NEW_ACCOUNT_ID" || 
       acc.id === "urn:li:sponsoredAccount:YOUR_NEW_ACCOUNT_ID"
   ) || accounts[0];
   ```

3. **Update Account Name Search** (if needed):
   ```typescript
   acc.name?.toLowerCase().includes("your_account_name")
   ```

## Verification

To verify the account is correctly configured:

1. Visit `/ads` page
2. Check the account card shows "PureVPN - Partner & Enterprise Solutions"
3. Verify campaigns and analytics are loading for this account

## Related Files

- `app/(dashboard)/ads/page.tsx` - Main dashboard page
- `lib/agents/dataAggregator.ts` - AI agent data aggregation
- `lib/mcp/linkedin.ts` - LinkedIn API client
- `app/api/linkedin/*` - LinkedIn API routes

---

**Status:** ✅ Configured  
**Account ID:** 514469053  
**Account Name:** PureVPN - Partner & Enterprise Solutions
