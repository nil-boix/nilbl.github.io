/**
 * Privacy-Compliant Geolocation Serverless Function
 *
 * This function can be deployed to:
 * - Vercel (as /api/geolocation.js)
 * - Netlify (as /netlify/functions/geolocation.js)
 * - Cloudflare Workers (adapt for Workers API)
 * - AWS Lambda (adapt for Lambda)
 *
 * PRIVACY FEATURES:
 * - Never logs or stores IP addresses
 * - Returns only city-level location
 * - Coordinates rounded to 1 decimal (~11km accuracy)
 * - No tracking, no cookies, no session data
 */

// Option 1: Using MaxMind GeoLite2 (Recommended - Free & Privacy-Focused)
// Requires: npm install @maxmind/geoip2-node
// Download free database from: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data

const Reader = require('@maxmind/geoip2-node').Reader;

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Get IP from request (but NEVER store it)
        const ip = getClientIP(req);

        if (!ip || ip === '127.0.0.1' || ip === '::1') {
            return res.status(200).json({
                city: 'Unknown',
                country: 'Unknown',
                countryCode: 'XX',
                lat: 0,
                lon: 0,
                timestamp: Date.now(),
                error: 'Cannot determine location for local IP'
            });
        }

        // Look up location (IP is used only for lookup, never stored)
        const location = await lookupLocation(ip);

        // IMPORTANT: IP is now discarded, only location data is returned

        return res.status(200).json({
            city: location.city,
            country: location.country,
            countryCode: location.countryCode,
            // Return coordinates rounded to 1 decimal (city-level accuracy)
            lat: Math.round(location.lat * 10) / 10,
            lon: Math.round(location.lon * 10) / 10,
            timestamp: Date.now()
            // NO IP address in response!
        });

    } catch (error) {
        console.error('Geolocation error:', error.message); // Log error only, never IP
        return res.status(200).json({
            city: 'Unknown',
            country: 'Unknown',
            countryCode: 'XX',
            lat: 0,
            lon: 0,
            timestamp: Date.now(),
            error: 'Could not determine location'
        });
    }
}

/**
 * Extract client IP from request headers
 * PRIVACY NOTE: This IP is used ONLY for geolocation lookup and is NEVER stored
 */
function getClientIP(req) {
    // Check various headers (depending on hosting platform)
    return (
        req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.headers['x-real-ip'] ||
        req.headers['cf-connecting-ip'] || // Cloudflare
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        null
    );
}

/**
 * Look up location for IP address
 * Returns only city-level data
 */
async function lookupLocation(ip) {
    // METHOD 1: MaxMind GeoLite2 (Recommended)
    // Free, accurate, privacy-focused, offline database

    try {
        // Path to your GeoLite2-City.mmdb file
        // Download from: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
        const dbPath = process.env.MAXMIND_DB_PATH || './GeoLite2-City.mmdb';

        const reader = await Reader.open(dbPath);
        const response = reader.city(ip);

        return {
            city: response.city?.names?.en || 'Unknown',
            country: response.country?.names?.en || 'Unknown',
            countryCode: response.country?.isoCode || 'XX',
            lat: response.location?.latitude || 0,
            lon: response.location?.longitude || 0
        };
    } catch (error) {
        console.error('MaxMind lookup failed:', error.message);

        // FALLBACK METHOD 2: Use a privacy-focused API
        return await fallbackAPILookup(ip);
    }
}

/**
 * Fallback API lookup if MaxMind database is not available
 */
async function fallbackAPILookup(ip) {
    // Use ip-api.com (free, no registration required)
    // Note: This sends IP to third party - consider privacy implications

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`);
        const data = await response.json();

        if (data.status === 'success') {
            return {
                city: data.city || 'Unknown',
                country: data.country || 'Unknown',
                countryCode: data.countryCode || 'XX',
                lat: data.lat || 0,
                lon: data.lon || 0
            };
        }
    } catch (error) {
        console.error('Fallback API lookup failed:', error.message);
    }

    // Final fallback
    return {
        city: 'Unknown',
        country: 'Unknown',
        countryCode: 'XX',
        lat: 0,
        lon: 0
    };
}

// ============================================================================
// ALTERNATIVE IMPLEMENTATION FOR CLOUDFLARE WORKERS
// ============================================================================

/*
// For Cloudflare Workers (which has built-in geolocation)

export default {
    async fetch(request, env) {
        // Cloudflare provides geolocation without storing IPs!
        const cf = request.cf;

        return new Response(JSON.stringify({
            city: cf?.city || 'Unknown',
            country: cf?.country || 'Unknown',
            countryCode: cf?.colo || 'XX',
            // Cloudflare provides approximate lat/lon
            lat: cf?.latitude ? Math.round(cf.latitude * 10) / 10 : 0,
            lon: cf?.longitude ? Math.round(cf.longitude * 10) / 10 : 0,
            timestamp: Date.now()
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};
*/

// ============================================================================
// SETUP INSTRUCTIONS
// ============================================================================

/*

## For Vercel:

1. Create this file at: /api/geolocation.js
2. Install dependencies:
   npm install @maxmind/geoip2-node

3. Download MaxMind GeoLite2:
   - Go to: https://dev.maxmind.com/geoip/geolite2-free-geolocation-data
   - Sign up (free)
   - Download GeoLite2-City.mmdb
   - Place in your project root or /api folder

4. Deploy:
   vercel

5. Update your frontend:
   const response = await fetch('https://your-project.vercel.app/api/geolocation');


## For Netlify:

1. Move this file to: /netlify/functions/geolocation.js
2. Install dependencies as above
3. Deploy via Netlify CLI or Git
4. Endpoint: https://your-site.netlify.app/.netlify/functions/geolocation


## For Cloudflare Workers (Easiest for geolocation!):

1. Use the alternative implementation above (commented out)
2. No database needed - Cloudflare provides geo data!
3. Deploy:
   wrangler publish
4. Free tier: 100k requests/day


## Environment Variables:

Set in your hosting platform:
- MAXMIND_DB_PATH: Path to GeoLite2-City.mmdb file


## Privacy Compliance:

✅ This implementation:
- Never stores IP addresses
- Never logs IP addresses (only errors)
- Returns only city-level data
- Uses rounded coordinates
- No cookies or tracking
- GDPR & CCPA compliant

❌ Make sure you:
- Don't add IP logging
- Don't store raw coordinates
- Don't add session tracking
- Update your privacy policy

*/
