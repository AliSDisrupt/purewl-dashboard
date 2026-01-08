import httpx
import asyncio
import json

# YOUR WORKING TOKEN
ACCESS_TOKEN = "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow"
API_BASE = "https://api.linkedin.com/rest"

def get_headers():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "LinkedIn-Version": "202511", 
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

async def main():
    print("🔎 STARTING DEEP SCAN...\n")

    # 1. Fetch Accounts
    print("1. getting Account List...")
    async with httpx.AsyncClient() as client:
        # Simple search to get all accounts
        resp = await client.get(f"{API_BASE}/adAccounts?q=search", headers=get_headers())
        
        if resp.status_code != 200:
            print(f"❌ Account Fetch Failed: {resp.text}")
            return
            
        accounts = resp.json().get("elements", [])
        print(f"✅ Found {len(accounts)} Accounts.\n")

        # 2. Loop through EVERY account to find campaigns
        for acc in accounts:
            acc_name = acc.get('name')
            acc_id = str(acc.get('id'))
            
            # Formatting the ID for the query
            full_id = acc_id if acc_id.startswith("urn:li:") else f"urn:li:sponsoredAccount:{acc_id}"
            
            print(f"   Checking: {acc_name} ({acc_id})...")
            
            # Fetch Campaigns for this specific account
            camp_url = f"{API_BASE}/adCampaigns"
            params = {
                "q": "search",
                "search": f"(account:(values:List({full_id})))"
            }
            
            camp_resp = await client.get(camp_url, headers=get_headers(), params=params)
            
            if camp_resp.status_code == 200:
                campaigns = camp_resp.json().get("elements", [])
                if campaigns:
                    print(f"   🚨 FOUND {len(campaigns)} CAMPAIGNS:")
                    for c in campaigns[:3]: # Show first 3
                        print(f"      - [{c.get('status')}] {c.get('name')}")
                    if len(campaigns) > 3: print("      - ... and more")
                else:
                    print("      (Empty Account - No Campaigns Created)")
            else:
                print(f"      ❌ Error fetching campaigns: {camp_resp.status_code}")
            
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(main())