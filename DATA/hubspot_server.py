from mcp.server.fastmcp import FastMCP
import httpx
import os
import json

# Initialize Server
mcp = FastMCP("HubSpot CRM")

# Constants
API_BASE = "https://api.hubapi.com"
ACCESS_TOKEN = os.environ.get("HUBSPOT_ACCESS_TOKEN")

if not ACCESS_TOKEN:
    raise ValueError("HUBSPOT_ACCESS_TOKEN environment variable is not set")

def get_headers():
    return {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

@mcp.tool()
async def search_contacts(query: str = None) -> str:
    """
    Search for contacts by name, email, or company. 
    If no query is provided, lists recent contacts.
    """
    url = f"{API_BASE}/crm/v3/objects/contacts/search"
    
    # Base payload to just list recent contacts
    payload = {
        "filterGroups": [],
        "sorts": ["-createdAt"],
        "properties": ["firstname", "lastname", "email", "company", "jobtitle", "phone"],
        "limit": 10
    }
    
    # If a query exists, add filters
    if query:
        payload["filterGroups"] = [
            {
                "filters": [{
                    "propertyName": "email",
                    "operator": "CONTAINS_TOKEN",
                    "value": query
                }]
            },
            {
                "filters": [{
                    "propertyName": "firstname",
                    "operator": "CONTAINS_TOKEN",
                    "value": query
                }]
            },
            {
                "filters": [{
                    "propertyName": "lastname",
                    "operator": "CONTAINS_TOKEN",
                    "value": query
                }]
            }
        ]

    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=get_headers(), json=payload)
        
    if response.status_code != 200:
        return f"Error: {response.text}"
        
    data = response.json()
    results = []
    for c in data.get("results", []):
        props = c.get("properties", {})
        first = props.get('firstname', '') or ""
        last = props.get('lastname', '') or ""
        name = f"{first} {last}".strip() or "Unnamed"
        email = props.get("email", "No Email")
        phone = props.get("phone", "No Phone")
        results.append(f"Name: {name} | Email: {email} | Phone: {phone} | ID: {c.get('id')}")
        
    return "\n".join(results) if results else "No contacts found."

@mcp.tool()
async def list_companies(limit: int = 10) -> str:
    """Lists recent companies added to the CRM."""
    url = f"{API_BASE}/crm/v3/objects/companies"
    params = {
        "limit": limit,
        "properties": "name,domain,city,industry,phone",
        "sort": "-createdAt"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_headers(), params=params)

    if response.status_code != 200:
        return f"Error: {response.text}"
        
    data = response.json()
    results = []
    for c in data.get("results", []):
        props = c.get("properties", {})
        name = props.get('name', 'Unknown')
        domain = props.get('domain', 'N/A')
        city = props.get('city', 'N/A')
        results.append(f"Company: {name} | Domain: {domain} | City: {city} | ID: {c.get('id')}")
        
    return "\n".join(results)

@mcp.tool()
async def list_deals(limit: int = 10) -> str:
    """Lists recent deals/opportunities."""
    url = f"{API_BASE}/crm/v3/objects/deals"
    params = {
        "limit": limit,
        "properties": "dealname,amount,dealstage,closedate,pipeline",
        "sort": "-createdAt"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_headers(), params=params)

    if response.status_code != 200:
        return f"Error: {response.text}"

    data = response.json()
    results = []
    for d in data.get("results", []):
        props = d.get("properties", {})
        name = props.get("dealname", "Unnamed Deal")
        amount = props.get("amount", "0")
        stage = props.get("dealstage", "Unknown Stage")
        close_date = props.get("closedate", "No Date")
        results.append(f"Deal: {name} | Amount: {amount} | Stage: {stage} | Close Date: {close_date}")

    return "\n".join(results) if results else "No deals found."

@mcp.tool()
async def get_conversations() -> str:
    """
    Reads recent threads from the HubSpot Inbox (Conversations).
    Useful for checking recent support chats or emails.
    """
    # Endpoint for threads
    url = f"{API_BASE}/conversations/v3/conversations/threads"
    
    # FIXED: Removed 'sort' parameter. 
    # Sorting by timestamp requires complex logic (latestMessageTimestampAfter)
    # that often causes API errors. Default sorting is sufficient for "recent".
    params = {
        "limit": 5
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_headers(), params=params)

    if response.status_code != 200:
        return f"HubSpot API Error ({response.status_code}): {response.text} - Check if 'conversations.read' scope is enabled."

    data = response.json()
    results = []
    
    for thread in data.get("results", []):
        t_id = thread.get("id")
        status = thread.get("status")
        # Try to find the latest message preview if available
        # The structure is deeply nested and variable
        results.append(f"Thread ID: {t_id} | Status: {status}")

    if not results:
        return "No active conversations found."
        
    return "\n".join(results)

if __name__ == "__main__":
    mcp.run()