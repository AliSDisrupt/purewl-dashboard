from mcp.server.fastmcp import FastMCP
import httpx
import datetime
import json

# 1. Initialize
mcp = FastMCP("LinkedIn Ads")

# 2. Config
ACCESS_TOKEN = "AQWkKXim-oqXnFtJfr46yhTzjqGOpjUC4nDMIwE2udJaKxzwMD0ZVrQoEeYWAh_Sjuj4eVJoueJae2ktgtp1mADMfLu-5xoMOm8P1WbAd34QzIgu-xoNGahFylCpR2vIu3xLDz9jN6EUEH-N3YEjdRk7tbBeTp_Cw1BTVTfv98-97LlqF2Q_FaYnSnpUiQkIJa97QYt0NkG4QTalJociKJ7Vq2L8ZG7yuN3jlUqWqe0wxJf_zKmC1bte6tG4yOpLhRT0A2MjACrOyRTAZOyOvHWLmFa4_y1WW2O17nJ81b2506Xyz_IpSGthyfh2iDkst_wsLO017cnMOomldMfidhlenPspow"
API_BASE = "https://api.linkedin.com/rest"

def get_headers():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "LinkedIn-Version": "202511", 
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json"
    }

@mcp.tool()
async def list_ad_accounts() -> str:
    """Lists all active LinkedIn Ad Accounts."""
    url = f"{API_BASE}/adAccounts"
    # Using simple search to avoid 400 errors
    params = {"q": "search"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=get_headers(), params=params)
        except httpx.RequestError as e:
            return f"Network Error: {str(e)}"

    if response.status_code != 200:
        return f"API Error ({response.status_code}): {response.text}"

    data = response.json()
    accounts = []
    
    for element in data.get("elements", []):
        name = element.get("name", "Unknown")
        acc_id = element.get("id") 
        acc_id_str = str(acc_id)
        simple_id = acc_id_str.split(":")[-1] if acc_id_str else "N/A"
        accounts.append(f"Account: {name} | ID: {acc_id} (Simple ID: {simple_id})")
    
    return "\n".join(accounts) if accounts else "No active ad accounts found."

@mcp.tool()
async def get_campaigns(account_id: str) -> str:
    """
    Fetches all campaigns.
    UPDATED: Uses the new mandated URL structure /adAccounts/{id}/adCampaigns
    """
    # Extract just the number for the URL
    if "urn:li:sponsoredAccount:" in account_id:
        simple_id = account_id.split(":")[-1]
    else:
        simple_id = account_id

    # NEW URL STRUCTURE (Fixes the 400 Error)
    url = f"{API_BASE}/adAccounts/{simple_id}/adCampaigns"
    params = {"q": "search"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_headers(), params=params)
    
    if response.status_code != 200:
        return f"Error fetching campaigns: {response.text}"

    data = response.json()
    campaigns = []
    for c in data.get("elements", []):
        c_id = c.get("id")
        name = c.get("name")
        status = c.get("status")
        campaigns.append(f"[{status}] {name} (ID: {c_id})")

    return "\n".join(campaigns) if campaigns else "No campaigns found."

@mcp.tool()
async def get_ad_analytics(account_id: str, days_back: int = 30) -> str:
    """
    Gets performance metrics.
    Handles '404 No Data' gracefully.
    """
    # Ensure full URN for analytics endpoint
    if not account_id.startswith("urn:li:"):
        account_id = f"urn:li:sponsoredAccount:{account_id}"

    # Use 'Yesterday' to avoid Timezone errors
    today = datetime.date.today()
    end_date = today - datetime.timedelta(days=1)
    start_date = end_date - datetime.timedelta(days=days_back)

    url = f"{API_BASE}/adAnalyticsV2"
    
    params = {
        "q": "analytics",
        "pivot": "ACCOUNT",
        "timeGranularity": "ALL",
        "dateRange.start.day": start_date.day,
        "dateRange.start.month": start_date.month,
        "dateRange.start.year": start_date.year,
        "dateRange.end.day": end_date.day,
        "dateRange.end.month": end_date.month,
        "dateRange.end.year": end_date.year,
        "accounts": f"List({account_id})",
        "fields": "impressions,clicks,costInLocalCurrency"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_headers(), params=params)

    # Correct handling of 404 (No Data)
    if response.status_code == 404:
        return "Report: Connected successfully. No ad spend found for these dates (LinkedIn returns 404 for 0 activity)."

    if response.status_code != 200:
        return f"API Error ({response.status_code}): {response.text}"

    data = response.json()
    if not data.get("elements"):
        return "Request OK, but 0 rows returned."

    row = data["elements"][0]
    return (f"--- REPORT ---\n"
            f"Spend: {row.get('costInLocalCurrency', 0)}\n"
            f"Impressions: {row.get('impressions', 0)}\n"
            f"Clicks: {row.get('clicks', 0)}")

if __name__ == "__main__":
    mcp.run()