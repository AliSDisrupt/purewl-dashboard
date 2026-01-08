import httpx
import asyncio
import datetime

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
    print("🕵️ STARTING GLOBAL ANALYTICS SCAN...\n")

    # 1. Get List of Accounts
    print("1. Fetching Ad Accounts...")
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{API_BASE}/adAccounts?q=search", headers=get_headers())
        
        if resp.status_code != 200:
            print(f"❌ Critical Error Fetching Accounts: {resp.text}")
            return

        accounts = resp.json().get("elements", [])
        print(f"✅ Found {len(accounts)} accounts. Scanning for spend...\n")

        print(f"{'ACCOUNT NAME':<40} | {'ID':<12} | {'STATUS'}")
        print("-" * 75)

        # 2. Check EACH account
        for acc in accounts:
            name = acc.get('name')[:38] # Truncate long names
            acc_id = str(acc.get('id'))
            simple_id = acc_id.split(":")[-1]
            full_id = f"urn:li:sponsoredAccount:{simple_id}"
            
            # CHECK DATE RANGE: Last 2 Years (to be safe)
            params = {
                "q": "analytics",
                "pivot": "ACCOUNT",
                "timeGranularity": "ALL",
                "dateRange.start.day": 1,
                "dateRange.start.month": 1,
                "dateRange.start.year": 2024,
                "dateRange.end.day": 8,
                "dateRange.end.month": 1,
                "dateRange.end.year": 2026,
                "accounts": f"List({full_id})",
                "fields": "costInLocalCurrency,impressions"
            }
            
            an_resp = await client.get(f"{API_BASE}/adAnalyticsV2", headers=get_headers(), params=params)
            
            status = "UNKNOWN"
            if an_resp.status_code == 200:
                data = an_resp.json()
                if data.get("elements"):
                    spend = data["elements"][0].get("costInLocalCurrency", 0)
                    status = f"✅ ${spend} SPEND FOUND"
                else:
                    status = "⚪ 0 Activity (Empty)"
            elif an_resp.status_code == 404:
                status = "⚪ 0 Activity (404)"
            elif an_resp.status_code == 403:
                status = "❌ PERMISSION DENIED"
            else:
                status = f"⚠️ Error {an_resp.status_code}"

            print(f"{name:<40} | {simple_id:<12} | {status}")

if __name__ == "__main__":
    asyncio.run(main())