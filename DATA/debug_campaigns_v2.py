import httpx
import asyncio
import json

# YOUR TOKEN
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
    print("🔎 STARTING DIAGNOSTIC SCAN...\n")

    async with httpx.AsyncClient() as client:
        
        # --- TEST 1: GLOBAL CAMPAIGN SCAN ---
        # This asks for ALL campaigns without filtering by account ID.
        # This avoids the "Syntax Error" completely.
        print("1. Attempting GLOBAL Campaign List (No Filters)...")
        url = f"{API_BASE}/adCampaigns?q=search"
        
        try:
            resp = await client.get(url, headers=get_headers())
            print(f"   Status: {resp.status_code}")
            
            if resp.status_code == 200:
                data = resp.json()
                elements = data.get("elements", [])
                print(f"   ✅ SUCCESS! Found {len(elements)} total campaigns.")
                for c in elements[:5]:
                    print(f"      - {c.get('name')} (Status: {c.get('status')})")
            else:
                print(f"   ❌ FAILED. Response: {resp.text}")
                
        except Exception as e:
            print(f"   ❌ Network Error: {e}")

        print("\n------------------------------------------------\n")

        # --- TEST 2: ACCOUNT SPECIFIC SCAN (DEBUGGING THE 400 ERROR) ---
        # We will try one specific account and PRINT the error text.
        target_id = "511766918" # PureWL
        print(f"2. Debugging Account Filter for {target_id}...")
        
        full_id = f"urn:li:sponsoredAccount:{target_id}"
        # We try the standard format again
        params = {
            "q": "search",
            "search": f"(account:(values:List({full_id})))"
        }
        
        resp = await client.get(f"{API_BASE}/adCampaigns", headers=get_headers(), params=params)
        
        if resp.status_code == 200:
            print("   ✅ Filter worked this time!")
        else:
            print(f"   ❌ ERROR DETAILS (Read Carefully):")
            print(f"   {resp.text}")

if __name__ == "__main__":
    asyncio.run(main())