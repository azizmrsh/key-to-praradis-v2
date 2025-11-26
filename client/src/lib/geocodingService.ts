// Photon API - Free, Unlimited Geocoding Service
// Based on OpenStreetMap, powered by Elasticsearch

export interface CityData {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  displayName: string;
}

const PHOTON_API = 'https://photon.komoot.io/api/';

/**
 * Search for cities worldwide using Photon API
 * @param query City name (supports Arabic, English, French, etc.)
 * @returns List of matching cities with coordinates and timezone
 */
export async function searchCities(query: string): Promise<CityData[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Photon API with language support and place type filtering
    // Note: Photon supports: default, en, de, fr (Arabic not supported in lang parameter but works in search)
    const url = `${PHOTON_API}?q=${encodeURIComponent(query)}&limit=50&lang=en&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village`;
    
    console.log('[GeocodingService] Searching for:', query);
    console.log('[GeocodingService] API URL:', url);
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GeocodingService] API Error:', response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('[GeocodingService] API Response:', data);
    
    // Validate response structure
    if (!data.features || !Array.isArray(data.features)) {
      console.error('[GeocodingService] Invalid response format:', data);
      throw new Error('Invalid API response format');
    }
    
    console.log('[GeocodingService] Found features:', data.features.length);
    
    // Photon returns GeoJSON format
    const cities: CityData[] = data.features
      .map((feature: any) => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates; // [lon, lat]
        
        const name = props.name || '';
        const country = props.country || '';
        const lat = coords[1];
        const lon = coords[0];
        
        // Get timezone using coordinate-based algorithm
        const timezone = getTimezoneFromCoordinates(lat, lon);
        
        // Build display name
        let displayName = name;
        if (props.state) displayName += `, ${props.state}`;
        if (country) displayName += `, ${country}`;

        return {
          name,
          country,
          latitude: lat,
          longitude: lon,
          timezone,
          displayName
        };
      })
      .filter((city: CityData) => city.name); // Remove entries without names

    // Remove duplicates based on name+country
    const uniqueCities = cities.filter((city, index, self) =>
      index === self.findIndex((c) => 
        c.name === city.name && c.country === city.country
      )
    );

    console.log('[GeocodingService] Unique cities found:', uniqueCities.length);
    return uniqueCities;
  } catch (error) {
    console.error('[GeocodingService] Error searching cities:', error);
    
    // Provide more detailed error information
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to geocoding service');
    }
    
    throw error; // Re-throw to let UI handle it
  }
}

/**
 * Calculate timezone from coordinates using simple geographic rules
 * This is an approximation - real timezone boundaries are complex
 */
export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // Simple longitude-based UTC offset calculation
  // Each 15° of longitude ≈ 1 hour difference from UTC
  const offset = Math.round(lon / 15);
  
  // Common timezone mappings for major regions
  // Middle East & Gulf
  if (lat >= 12 && lat <= 32 && lon >= 34 && lon <= 60) {
    return 'Asia/Riyadh';
  }
  // Egypt & Levant
  if (lat >= 22 && lat <= 37 && lon >= 25 && lon <= 42) {
    return 'Africa/Cairo';
  }
  // Europe
  if (lat >= 35 && lat <= 71 && lon >= -10 && lon <= 40) {
    if (lon >= -10 && lon < 5) return 'Europe/London';
    if (lon >= 5 && lon < 15) return 'Europe/Paris';
    if (lon >= 15 && lon < 30) return 'Europe/Berlin';
    return 'Europe/Moscow';
  }
  // Americas
  if (lon >= -170 && lon <= -30) {
    if (lon >= -80 && lon <= -65) return 'America/New_York';
    if (lon >= -105 && lon <= -90) return 'America/Chicago';
    if (lon >= -125 && lon <= -110) return 'America/Los_Angeles';
    if (lon >= -60 && lon <= -30) return 'America/Sao_Paulo';
  }
  // Asia-Pacific
  if (lat >= -50 && lat <= 70 && lon >= 60 && lon <= 180) {
    if (lon >= 60 && lon < 90) return 'Asia/Karachi';
    if (lon >= 90 && lon < 110) return 'Asia/Bangkok';
    if (lon >= 110 && lon < 130) return 'Asia/Shanghai';
    if (lon >= 130 && lon < 150) return 'Asia/Tokyo';
    if (lon >= 150) return 'Australia/Sydney';
  }
  
  // Fallback: Use browser timezone
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}
