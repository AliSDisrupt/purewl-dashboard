import httpx
import asyncio
import json

# YOUR TOKEN
ACCESS_TOKEN = "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow"
API_BASE = "https://api.linkedin.com/rest"

# The Account ID for "PureWL" found in your previous test
TARGET_ACCOUNT_ID = "511766918" 

def get_headers():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "LinkedIn-Version": "202511", 
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

async def main():
    print(f"🔎 INSPECTING ACCOUNT: {TARGET_ACCOUNT_ID}...\n")
    
    full_id = f"urn:li:sponsoredAccount:{TARGET_ACCOUNT_ID}"
    url = f"{API_BASE}/adCampaigns"
    
    # We ask for ALL campaigns (Active, Paused, Archived)
    params = {
        "q": "search",
        "search": f"(account:(values:List({full_id})))"
    }
    
    async with httpx.AsyncClient() as client:
        print("1. Fetching Campaign List...")
        try:
            response = await client.get(url, headers=get_headers(), params=params)
        except Exception as e:
            print(f"❌ Error: {e}")
            return

    if response.status_code != 200:
        print(f"❌ API FAILED ({response.status_code}): {response.text}")
        return

    data = response.json()
    elements = data.get("elements", [])
    
    if not elements:
        print("⚠️ NO CAMPAIGNS FOUND.")
        print("   Conclusion: This account is effectively empty.")
        print("   Action: Check your browser URL. Does it match '511766918'?")
        return

    print(f"✅ SUCCESS: Found {len(elements)} campaigns.\n")
    
    print("--- RECENT CAMPAIGNS ---")
    for c in elements[:10]: # List top 10
        print(f"   • [{c.get('status')}] {c.get('name')} (ID: {c.get('id')})")

    print("\n✅ If you see your campaigns above, the connection is VALID.")

if __name__ == "__main__":
    asyncio.run(main())