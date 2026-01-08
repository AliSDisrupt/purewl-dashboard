import httpx
import asyncio
import json

# 1. Config (Same as your server)
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
    print("🔎 TESTING LINKEDIN CONNECTION...\n")

    # --- TEST 1: LIST ACCOUNTS ---
    print("1. Fetching Ad Accounts...")
    url = f"{API_BASE}/adAccounts"
    params = {"q": "search"} # The "Safe Mode" query
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=get_headers(), params=params)
        except Exception as e:
            print(f"❌ CRITICAL ERROR: Could not connect to internet. {e}")
            return

    if response.status_code != 200:
        print(f"❌ API FAILED ({response.status_code}): {response.text}")
        return

    data = response.json()
    elements = data.get("elements", [])
    
    if not elements:
        print("⚠️ Connection OK, but NO Ad Accounts found.")
        return

    print(f"✅ SUCCESS: Found {len(elements)} accounts.")
    
    # Collect IDs for step 2
    account_ids = []
    for el in elements:
        print(f"   - {el.get('name')} (ID: {el.get('id')})")
        account_ids.append(str(el.get('id')))

    print("\n------------------------------------------------\n")

    # --- TEST 2: CHECK 2025 SPEND ---
    print("2. Scanning for 2025 Activity (Full Year)...")
    
    # Dates: Jan 1 2025 - Dec 31 2025
    start_date = {"day": 1, "month": 1, "year": 2025}
    end_date = {"day": 31, "month": 12, "year": 2025}
    
    analytics_url = f"{API_BASE}/adAnalyticsV2"

    async with httpx.AsyncClient() as client:
        for acc_id in account_ids:
            # Clean format (urn:li:sponsoredAccount:12345)
            full_id = acc_id if acc_id.startswith("urn:li:") else f"urn:li:sponsoredAccount:{acc_id}"
            
            params = {
                "q": "analytics",
                "pivot": "ACCOUNT",
                "timeGranularity": "ALL",
                "dateRange.start.day": start_date['day'],
                "dateRange.start.month": start_date['month'],
                "dateRange.start.year": start_date['year'],
                "dateRange.end.day": end_date['day'],
                "dateRange.end.month": end_date['month'],
                "dateRange.end.year": end_date['year'],
                "accounts": f"List({full_id})",
                "fields": "costInLocalCurrency,impressions"
            }
            
            resp = await client.get(analytics_url, headers=get_headers(), params=params)
            
            if resp.status_code == 200:
                d = resp.json()
                if d.get("elements"):
                    val = d["elements"][0]
                    print(f"   💰 {full_id}: ${val.get('costInLocalCurrency')} Spend | {val.get('impressions')} Imps")
                else:
                    print(f"   ⚪ {full_id}: 0 Activity")
            elif resp.status_code == 404:
                print(f"   ⚪ {full_id}: 0 Activity (404 Code)")
            else:
                print(f"   ⚠️ {full_id}: Error {resp.status_code}")

    print("\n✅ TEST COMPLETE.")

if __name__ == "__main__":
    asyncio.run(main())