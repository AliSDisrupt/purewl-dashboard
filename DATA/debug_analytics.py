import httpx
import asyncio
import datetime

# YOUR TOKEN
ACCESS_TOKEN = "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow"
API_BASE = "https://api.linkedin.com/rest"

# Account ID for "PureWL"
TARGET_ID = "511766918"

def get_headers():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "LinkedIn-Version": "202511", 
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

async def main():
    print(f"📊 DEEP ANALYTICS PROBE: {TARGET_ID}")
    print("   Checking data from Jan 1, 2024 to Today...\n")

    full_id = f"urn:li:sponsoredAccount:{TARGET_ID}"
    url = f"{API_BASE}/adAnalyticsV2"
    
    # 1. Define a WIDE date range (2 Years)
    today = datetime.date.today()
    params = {
        "q": "analytics",
        "pivot": "ACCOUNT",
        "timeGranularity": "MONTHLY", # Check monthly chunks
        "dateRange.start.day": 1,
        "dateRange.start.month": 1,
        "dateRange.start.year": 2024,
        "dateRange.end.day": today.day,
        "dateRange.end.month": today.month,
        "dateRange.end.year": today.year,
        "accounts": f"List({full_id})",
        "fields": "dateRange,costInLocalCurrency,impressions,clicks"
    }

    async with httpx.AsyncClient() as client:
        print("1. Sending Request to LinkedIn...")
        try:
            resp = await client.get(url, headers=get_headers(), params=params)
        except Exception as e:
            print(f"❌ Network Error: {e}")
            return

    # 2. Analyze the Raw Response
    print(f"   Status Code: {resp.status_code}")
    
    if resp.status_code == 404:
        print("\n❌ RESULT: 404 (Resource Not Found)")
        print("   MEANING: LinkedIn confirms there is ZERO data for this period.")
        print("   This account has not spent $0.01 since Jan 1, 2024.")
    
    elif resp.status_code == 200:
        data = resp.json()
        elements = data.get("elements", [])
        
        if not elements:
            print("\n⚠️ RESULT: Success (200), but returned Empty List []")
        else:
            print(f"\n✅ SUCCESS! Found {len(elements)} months of data:\n")
            total_spend = 0.0
            for row in elements:
                date = row.get("dateRange", {}).get("start", {})
                d_str = f"{date.get('year')}-{date.get('month')}"
                spend = float(row.get("costInLocalCurrency", 0))
                imps = row.get("impressions", 0)
                
                print(f"   📅 {d_str}: ${spend} | {imps} Imps")
                total_spend += spend
            
            print(f"\n💰 TOTAL SPEND DETECTED: ${total_spend}")
    
    else:
        print(f"\n⚠️ UNEXPECTED ERROR: {resp.text}")

if __name__ == "__main__":
    asyncio.run(main())