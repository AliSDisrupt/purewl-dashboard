/**
 * Country Flag Emoji Utilities
 * 
 * Converts ISO 3166-1 alpha-2 country codes to flag emojis
 * Uses Unicode Regional Indicator Symbols to generate flag emojis programmatically
 */

/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 * Uses Unicode Regional Indicator Symbols (U+1F1E6 to U+1F1FF)
 * 
 * @param countryCode - Two-letter ISO country code (e.g., "US", "GB")
 * @returns Flag emoji string
 */
function codeToFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍';
  }
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0)); // Convert to regional indicator symbols (🇦-🇿)
  
  return String.fromCodePoint(...codePoints);
}

// Country code to flag emoji mapping (comprehensive list)
// Using programmatic generation for all ISO 3166-1 alpha-2 codes
export const countryCodeToFlag: Record<string, string> = {};

// Generate flag emojis for all ISO 3166-1 alpha-2 country codes
const isoCountryCodes = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ',
  'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FK', 'FM', 'FO', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY',
  'HK', 'HM', 'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT',
  'JE', 'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ',
  'OM',
  'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY',
  'QA',
  'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ',
  'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'UM', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU',
  'WF', 'WS',
  'XK', 'YE', 'YT',
  'ZA', 'ZM', 'ZW'
];

// Generate flag emojis for all country codes
isoCountryCodes.forEach(code => {
  countryCodeToFlag[code] = codeToFlagEmoji(code);
});

/**
 * Convert country code (e.g., "US", "CN") to flag emoji
 * Uses programmatic generation for any valid ISO 3166-1 alpha-2 code
 * 
 * @param countryCode - Two-letter ISO country code
 * @returns Flag emoji string
 */
export function getFlagFromCode(countryCode: string): string {
  if (!countryCode) return '🌍';
  
  const upperCode = countryCode.toUpperCase();
  
  // Check if we have it in our pre-generated map
  if (countryCodeToFlag[upperCode]) {
    return countryCodeToFlag[upperCode];
  }
  
  // Generate flag emoji programmatically for any valid 2-letter code
  if (upperCode.length === 2 && /^[A-Z]{2}$/.test(upperCode)) {
    return codeToFlagEmoji(upperCode);
  }
  
  return '🌍';
}

/**
 * Convert country name to flag emoji (uses country code mapping)
 * This function will work for any country that has a mapping in countryCodes.ts
 * 
 * @param countryName - Full country name (e.g., "United States", "China")
 * @returns Flag emoji string
 */
export function getFlagFromCountryName(countryName: string): string {
  if (!countryName) return '🌍';
  
  // Try to get country code from countryCodes.ts
  try {
    const { getCountryCode } = require('./countryCodes');
    const code = getCountryCode(countryName);
    if (code) {
      return getFlagFromCode(code);
    }
  } catch {
    // If countryCodes module is not available, continue with fallback
  }
  
  // Fallback: try common country name variations
  const countryNameVariations: Record<string, string> = {
    'United States': 'US',
    'United States of America': 'US',
    'USA': 'US',
    'United Kingdom': 'GB',
    'UK': 'GB',
    'Great Britain': 'GB',
    'South Korea': 'KR',
    'Korea, South': 'KR',
    'North Korea': 'KP',
    'Korea, North': 'KP',
    'Russia': 'RU',
    'Russian Federation': 'RU',
    'Czech Republic': 'CZ',
    'Czechia': 'CZ',
  };
  
  const variation = countryNameVariations[countryName];
  if (variation) {
    return getFlagFromCode(variation);
  }
  
  return '🌍';
}
