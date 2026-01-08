import httpx
import asyncio

# --- CONFIGURATION ---
# I have pasted your token directly here to avoid the "No Token Found" error
ACCESS_TOKEN = "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow"

API_BASE = "https://api.linkedin.com/rest"

async def test_connection():
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "LinkedIn-Version": "202511", 
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

    print(f"Testing Token: {ACCESS_TOKEN[:10]}...")
    print("------------------------------------------------")

    # TEST: Try to list ad accounts
    url = f"{API_BASE}/adAccounts?q=search&search=(status:(values:List(ACTIVE,DRAFT)))"
    
    async with httpx.AsyncClient() as client:
        try:
            print("1. Attempting to fetch Ad Accounts...")
            response = await client.get(url, headers=headers)
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                count = len(data.get("elements", []))
                print(f"✅ SUCCESS: Connection working! Found {count} ad accounts.")
                # Print the first account ID found to verify
                if count > 0:
                    print(f"   Account Name: {data['elements'][0].get('name')}")
                    print(f"   Account ID:   {data['elements'][0].get('id')}")
            else:
                print("❌ FAILED: LinkedIn returned an error.")
                print(f"   Error Response: {response.text}")
                
        except Exception as e:
            print(f"❌ CRASH: The script failed to run. Reason: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())