/**
 * RB2B API Client
 * 
 * Documentation: https://rb2b.com/api
 * 
 * This client implements the RB2B API endpoints for visitor identification
 * and data enrichment using IP address, User Agent, email, LinkedIn URLs, etc.
 */

const RB2B_API_BASE = process.env.RB2B_API_BASE || "https://api.rb2b.com";
const RB2B_API_KEY = process.env.RB2B_API_KEY;

interface RB2BResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  credits_used?: number;
  credits_remaining?: number;
}

export interface HEMResult {
  email_hash: string; // MD5 or SHA256
  accuracy_score: number; // 0=probabilistic, 1=deterministic
  email_type?: "business" | "personal";
}

export interface CompanyDomainResult {
  domain: string;
  url?: string;
}

export interface LinkedInProfileResult {
  linkedin_person_url?: string;
  linkedin_company_url?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  company_domain?: string;
  company_url?: string;
  industry?: string;
  seniority?: string;
  title?: string;
  job_title?: string;
  work_email?: string;
  personal_email?: string;
  emails?: string[];
  accuracy_score?: number;
}

export interface MAIDResult {
  maids: string[];
}

export interface PhoneResult {
  phone_number: string;
  accuracy_score?: number;
}

/**
 * Get API headers with authentication
 */
function getHeaders(): HeadersInit {
  if (!RB2B_API_KEY) {
    throw new Error("RB2B_API_KEY is not configured. Please set it in .env.local");
  }

  return {
    "Authorization": `Bearer ${RB2B_API_KEY}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<RB2BResponse<T>> {
  try {
    let url = `${RB2B_API_BASE}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: getHeaders(),
    };

    if (body && method === "POST") {
      options.body = JSON.stringify(body);
    } else if (body && method === "GET") {
      // For GET requests, append query params
      const params = new URLSearchParams();
      Object.keys(body).forEach((key) => {
        if (body[key] !== undefined && body[key] !== null) {
          params.append(key, String(body[key]));
        }
      });
      url = `${url}?${params.toString()}`;
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RB2B API Error (${response.status}):`, errorText);
      return {
        success: false,
        error: `API request failed: ${response.status} ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      credits_used: parseInt(response.headers.get("X-Credits-Used") || "0"),
      credits_remaining: parseInt(response.headers.get("X-Credits-Remaining") || "0"),
    };
  } catch (error: any) {
    console.error("RB2B API Request Error:", error);
    return {
      success: false,
      error: error.message || "Failed to make API request",
    };
  }
}

/**
 * IP & User Agent → HEM (Hashed Email)
 * Cost: 1 Credit
 * 
 * @param ipAddress - IP address (mandatory)
 * @param userAgent - User agent (optional)
 * @returns Array of up to 3 HEM results
 */
export async function getHEMFromIP(
  ipAddress: string,
  userAgent?: string
): Promise<RB2BResponse<HEMResult[]>> {
  return apiRequest<HEMResult[]>("/v1/ip/hem", "GET", {
    ip: ipAddress,
    useragent: userAgent,
  });
}

/**
 * IP & User Agent → Company Domain
 * Cost: 1 Credit
 * 
 * @param ipAddress - IP address (mandatory)
 * @param userAgent - User agent (optional)
 * @returns Company domain/URL
 */
export async function getCompanyDomainFromIP(
  ipAddress: string,
  userAgent?: string
): Promise<RB2BResponse<CompanyDomainResult>> {
  return apiRequest<CompanyDomainResult>("/v1/ip/company-domain", "GET", {
    ip: ipAddress,
    useragent: userAgent,
  });
}

/**
 * IP & User Agent → MAID (Mobile Ad ID)
 * Cost: 1 Credit
 * 
 * @param ipAddress - IP address (mandatory)
 * @param userAgent - User agent (optional)
 * @returns Array of recent MAIDs observed for the IP over the last 60 days
 */
export async function getMAIDFromIP(
  ipAddress: string,
  userAgent?: string
): Promise<RB2BResponse<MAIDResult>> {
  return apiRequest<MAIDResult>("/v1/ip/maid", "GET", {
    ip: ipAddress,
    useragent: userAgent,
  });
}

/**
 * HEM (MD5 hashed email) → LinkedIn + Full Business Profile
 * Cost: 2 Credits
 * 
 * @param hem - MD5 hash OR Plain Text Email (not SHA256)
 * @returns LinkedIn profile and business information
 */
export async function getLinkedInFromHEM(
  hem: string
): Promise<RB2BResponse<LinkedInProfileResult>> {
  return apiRequest<LinkedInProfileResult>("/v1/hem/linkedin-profile", "GET", {
    hem: hem,
  });
}

/**
 * HEM → LinkedIn URL
 * Cost: 1 Credit
 * 
 * @param hem - MD5 hash OR Plain Text Email (not SHA256)
 * @returns LinkedIn profile URL
 */
export async function getLinkedInURLFromHEM(
  hem: string
): Promise<RB2BResponse<{ linkedin_url: string }>> {
  return apiRequest<{ linkedin_url: string }>("/v1/hem/linkedin-url", "GET", {
    hem: hem,
  });
}

/**
 * HEM → MAID
 * Cost: 1 Credit
 * 
 * @param hem - MD5 hash OR Plain Text Email (not SHA256)
 * @returns MAID
 */
export async function getMAIDFromHEM(
  hem: string
): Promise<RB2BResponse<MAIDResult>> {
  return apiRequest<MAIDResult>("/v1/hem/maid", "GET", {
    hem: hem,
  });
}

/**
 * Plain Text Email → LinkedIn URL
 * Cost: 1 Credit
 * 
 * @param email - Plain text email address
 * @returns LinkedIn profile URL
 */
export async function getLinkedInURLFromEmail(
  email: string
): Promise<RB2BResponse<{ linkedin_url: string }>> {
  return apiRequest<{ linkedin_url: string }>("/v1/email/linkedin-url", "GET", {
    email: email,
  });
}

/**
 * Plain Text Email → LinkedIn + Full Business Profile
 * Cost: 2 Credits
 * 
 * @param email - Plain text email address
 * @returns LinkedIn profile and business information
 */
export async function getLinkedInFromEmail(
  email: string
): Promise<RB2BResponse<LinkedInProfileResult>> {
  return apiRequest<LinkedInProfileResult>("/v1/email/linkedin-profile", "GET", {
    email: email,
  });
}

/**
 * Plain Text Email → MAID
 * Cost: 1 Credit
 * 
 * @param email - Plain text email address
 * @returns MAID
 */
export async function getMAIDFromEmail(
  email: string
): Promise<RB2BResponse<MAIDResult>> {
  return apiRequest<MAIDResult>("/v1/email/maid", "GET", {
    email: email,
  });
}

/**
 * LinkedIn URL → Best Personal Email
 * Cost: 1 Credit
 * 
 * @param linkedinUrl - LinkedIn profile URL/slug
 * @returns Personal email with most recent known network activity
 */
export async function getPersonalEmailFromLinkedIn(
  linkedinUrl: string
): Promise<RB2BResponse<{ email: string; accuracy_score?: number }>> {
  return apiRequest<{ email: string; accuracy_score?: number }>(
    "/v1/linkedin/personal-email",
    "GET",
    {
      linkedin_url: linkedinUrl,
    }
  );
}

/**
 * LinkedIn URL → Multiple Emails
 * Cost: 1 Credit
 * 
 * @param linkedinUrl - LinkedIn profile URL/slug
 * @returns Up to 5 emails, business and personal
 */
export async function getEmailsFromLinkedIn(
  linkedinUrl: string
): Promise<RB2BResponse<{ emails: string[] }>> {
  return apiRequest<{ emails: string[] }>("/v1/linkedin/emails", "GET", {
    linkedin_url: linkedinUrl,
  });
}

/**
 * LinkedIn URL → Best Phone Number
 * Cost: 3 Credits
 * 
 * @param linkedinUrl - LinkedIn profile URL/slug
 * @returns Phone number with most recent known network activity
 */
export async function getPhoneFromLinkedIn(
  linkedinUrl: string
): Promise<RB2BResponse<PhoneResult>> {
  return apiRequest<PhoneResult>("/v1/linkedin/phone", "GET", {
    linkedin_url: linkedinUrl,
  });
}

/**
 * Enrich visitor data using IP + User Agent
 * This is a convenience function that chains multiple API calls
 * 
 * @param ipAddress - IP address
 * @param userAgent - User agent
 * @returns Enriched visitor data
 */
export async function enrichVisitorFromIP(
  ipAddress: string,
  userAgent?: string
): Promise<{
  emails?: HEMResult[];
  companyDomain?: string;
  linkedInProfile?: LinkedInProfileResult;
  error?: string;
}> {
  const result: {
    emails?: HEMResult[];
    companyDomain?: string;
    linkedInProfile?: LinkedInProfileResult;
    error?: string;
  } = {};

  try {
    // Step 1: Get HEM from IP + User Agent
    const hemResponse = await getHEMFromIP(ipAddress, userAgent);
    if (hemResponse.success && hemResponse.data && hemResponse.data.length > 0) {
      result.emails = hemResponse.data;

      // Step 2: Get LinkedIn profile from the first HEM (most accurate)
      const bestHEM = hemResponse.data[0];
      if (bestHEM.email_hash) {
        const linkedInResponse = await getLinkedInFromHEM(bestHEM.email_hash);
        if (linkedInResponse.success && linkedInResponse.data) {
          result.linkedInProfile = linkedInResponse.data;
        }
      }
    }

    // Step 3: Get company domain from IP + User Agent
    const companyResponse = await getCompanyDomainFromIP(ipAddress, userAgent);
    if (companyResponse.success && companyResponse.data) {
      result.companyDomain = companyResponse.data.domain || companyResponse.data.url;
    }
  } catch (error: any) {
    result.error = error.message;
  }

  return result;
}

/**
 * Enrich visitor data using email
 * This is a convenience function that gets LinkedIn profile from email
 * 
 * @param email - Plain text email address
 * @returns Enriched visitor data
 */
export async function enrichVisitorFromEmail(
  email: string
): Promise<{
  linkedInProfile?: LinkedInProfileResult;
  linkedInUrl?: string;
  error?: string;
}> {
  const result: {
    linkedInProfile?: LinkedInProfileResult;
    linkedInUrl?: string;
    error?: string;
  } = {};

  try {
    // Get LinkedIn profile from email
    const linkedInResponse = await getLinkedInFromEmail(email);
    if (linkedInResponse.success && linkedInResponse.data) {
      result.linkedInProfile = linkedInResponse.data;
      result.linkedInUrl =
        linkedInResponse.data.linkedin_person_url ||
        linkedInResponse.data.linkedin_company_url;
    }
  } catch (error: any) {
    result.error = error.message;
  }

  return result;
}
