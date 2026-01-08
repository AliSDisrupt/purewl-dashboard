// Country code to flag emoji mapping
export const countryCodeToFlag: Record<string, string> = {
  'US': '🇺🇸',
  'CN': '🇨🇳',
  'IN': '🇮🇳',
  'PK': '🇵🇰',
  'GB': '🇬🇧',
  'IT': '🇮🇹',
  'SG': '🇸🇬',
  'DE': '🇩🇪',
  'FR': '🇫🇷',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'BR': '🇧🇷',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'ES': '🇪🇸',
  'NL': '🇳🇱',
  'PL': '🇵🇱',
  'TR': '🇹🇷',
  'MX': '🇲🇽',
  'ID': '🇮🇩',
  'TH': '🇹🇭',
  'VN': '🇻🇳',
  'MY': '🇲🇾',
  'BD': '🇧🇩',
  'EG': '🇪🇬',
  'SA': '🇸🇦',
  'AE': '🇦🇪',
  'ZA': '🇿🇦',
  'AR': '🇦🇷',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'PE': '🇵🇪',
  'VE': '🇻🇪',
  'RU': '🇷🇺',
  'UA': '🇺🇦',
  'GR': '🇬🇷',
  'PT': '🇵🇹',
  'BE': '🇧🇪',
  'CH': '🇨🇭',
  'AT': '🇦🇹',
  'SE': '🇸🇪',
  'NO': '🇳🇴',
  'DK': '🇩🇰',
  'FI': '🇫🇮',
  'IE': '🇮🇪',
  'NZ': '🇳🇿',
  'IL': '🇮🇱',
  'NG': '🇳🇬',
  'KE': '🇰🇪',
  'GH': '🇬🇭',
  'MA': '🇲🇦',
  'DZ': '🇩🇿',
  'TN': '🇹🇳',
  'RO': '🇷🇴',
  'CZ': '🇨🇿',
  'HU': '🇭🇺',
  'BG': '🇧🇬',
  'HR': '🇭🇷',
  'RS': '🇷🇸',
  'SK': '🇸🇰',
  'SI': '🇸🇮',
  'LT': '🇱🇹',
  'LV': '🇱🇻',
  'EE': '🇪🇪',
  'PH': '🇵🇭',
};

/**
 * Convert country code (e.g., "US", "CN") to flag emoji
 */
export function getFlagFromCode(countryCode: string): string {
  return countryCodeToFlag[countryCode.toUpperCase()] || '🌍';
}

/**
 * Convert country name to flag emoji (uses country code mapping)
 */
export function getFlagFromCountryName(countryName: string): string {
  // Direct mapping for common countries
  const countryNameToFlag: Record<string, string> = {
    'United States': '🇺🇸',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Philippines': '🇵🇭',
    'Pakistan': '🇵🇰',
    'United Kingdom': '🇬🇧',
    'Italy': '🇮🇹',
    'Singapore': '🇸🇬',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Canada': '🇨🇦',
    'Australia': '🇦🇺',
    'Brazil': '🇧🇷',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Spain': '🇪🇸',
    'Netherlands': '🇳🇱',
    'Poland': '🇵🇱',
    'Turkey': '🇹🇷',
    'Mexico': '🇲🇽',
    'Indonesia': '🇮🇩',
    'Thailand': '🇹🇭',
    'Vietnam': '🇻🇳',
    'Malaysia': '🇲🇾',
    'Bangladesh': '🇧🇩',
    'Egypt': '🇪🇬',
    'Saudi Arabia': '🇸🇦',
    'United Arab Emirates': '🇦🇪',
    'South Africa': '🇿🇦',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Peru': '🇵🇪',
    'Venezuela': '🇻🇪',
    'Russia': '🇷🇺',
    'Ukraine': '🇺🇦',
    'Greece': '🇬🇷',
    'Portugal': '🇵🇹',
    'Belgium': '🇧🇪',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Finland': '🇫🇮',
    'Ireland': '🇮🇪',
    'New Zealand': '🇳🇿',
    'Israel': '🇮🇱',
    'Nigeria': '🇳🇬',
    'Kenya': '🇰🇪',
    'Ghana': '🇬🇭',
    'Morocco': '🇲🇦',
    'Algeria': '🇩🇿',
    'Tunisia': '🇹🇳',
    'Romania': '🇷🇴',
    'Czech Republic': '🇨🇿',
    'Hungary': '🇭🇺',
    'Bulgaria': '🇧🇬',
    'Croatia': '🇭🇷',
    'Serbia': '🇷🇸',
    'Slovakia': '🇸🇰',
    'Slovenia': '🇸🇮',
    'Lithuania': '🇱🇹',
    'Latvia': '🇱🇻',
    'Estonia': '🇪🇪',
  };
  
  // First try direct mapping
  if (countryNameToFlag[countryName]) {
    return countryNameToFlag[countryName];
  }
  
  // Fallback to country code mapping
  try {
    const { getCountryCode } = require('./countryCodes');
    const code = getCountryCode(countryName);
    return code ? getFlagFromCode(code) : '🌍';
  } catch {
    return '🌍';
  }
}
