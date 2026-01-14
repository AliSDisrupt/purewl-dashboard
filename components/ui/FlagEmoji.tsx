"use client";

import { useEffect, useRef } from "react";
import twemoji from "twemoji";

interface FlagEmojiProps {
  countryCode: string;
  className?: string;
  size?: number;
}

/**
 * FlagEmoji component that renders country flag emojis consistently across all platforms.
 * Uses Twemoji to convert Unicode flag emojis to SVG images, fixing the Windows issue
 * where flag emojis don't render properly.
 */
export function FlagEmoji({ countryCode, className = "", size = 20 }: FlagEmojiProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  // Convert country code to flag emoji using Regional Indicator Symbols
  const getFlagEmoji = (code: string): string => {
    if (!code || code.length !== 2) return "🌍";
    const codePoints = code
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  useEffect(() => {
    // Parse the emoji and replace with Twemoji SVG
    if (spanRef.current) {
      twemoji.parse(spanRef.current, {
        folder: "svg",
        ext: ".svg",
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
      });
    }
  }, [countryCode]);

  return (
    <span
      ref={spanRef}
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        // Twemoji images need explicit sizing
        ["--twemoji-size" as string]: `${size}px`,
      }}
    >
      <style jsx>{`
        span :global(img.emoji) {
          width: ${size}px;
          height: ${size}px;
          vertical-align: middle;
          display: inline-block;
        }
      `}</style>
      {getFlagEmoji(countryCode)}
    </span>
  );
}

/**
 * Get the country code from a country name for use with FlagEmoji
 */
export function getCountryCodeFromName(countryName: string): string {
  const countryNameToCode: Record<string, string> = {
    "United States": "US",
    "United States of America": "US",
    USA: "US",
    "United Kingdom": "GB",
    UK: "GB",
    "Great Britain": "GB",
    "South Korea": "KR",
    "Korea, South": "KR",
    "North Korea": "KP",
    "Korea, North": "KP",
    Russia: "RU",
    "Russian Federation": "RU",
    "Czech Republic": "CZ",
    Czechia: "CZ",
    China: "CN",
    Japan: "JP",
    Germany: "DE",
    France: "FR",
    Canada: "CA",
    Australia: "AU",
    India: "IN",
    Brazil: "BR",
    Mexico: "MX",
    Italy: "IT",
    Spain: "ES",
    Netherlands: "NL",
    Sweden: "SE",
    Switzerland: "CH",
    Poland: "PL",
    Turkey: "TR",
    Indonesia: "ID",
    Thailand: "TH",
    Vietnam: "VN",
    Philippines: "PH",
    Malaysia: "MY",
    Singapore: "SG",
    "Hong Kong": "HK",
    Taiwan: "TW",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    UAE: "AE",
    Israel: "IL",
    Egypt: "EG",
    "South Africa": "ZA",
    Nigeria: "NG",
    Kenya: "KE",
    Argentina: "AR",
    Colombia: "CO",
    Chile: "CL",
    Peru: "PE",
    Pakistan: "PK",
    Bangladesh: "BD",
    Ukraine: "UA",
    Romania: "RO",
    Belgium: "BE",
    Austria: "AT",
    Norway: "NO",
    Denmark: "DK",
    Finland: "FI",
    Ireland: "IE",
    "New Zealand": "NZ",
    Portugal: "PT",
    Greece: "GR",
    Hungary: "HU",
    "Czech Republic": "CZ",
  };

  return countryNameToCode[countryName] || "";
}
