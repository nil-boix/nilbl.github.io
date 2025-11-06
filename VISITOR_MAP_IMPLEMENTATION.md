# Privacy-Compliant Visitor Map Implementation Guide

## 🔒 Legal Compliance Summary

This implementation is designed to be **GDPR and CCPA compliant** by:

1. ✅ **NO IP Address Storage** - IPs are never logged or stored
2. ✅ **Approximate Location Only** - City-level granularity (not GPS coordinates)
3. ✅ **No Personal Data** - No user tracking, no cookies, no persistent IDs
4. ✅ **Transparent** - Clear privacy notice displayed to users
5. ✅ **Minimal Data** - Only stores: city name, country, and timestamp
6. ✅ **Anonymous & Aggregated** - No way to identify individual visitors

## 📁 Files Created

- `visitor-map.html` - Main visitor map page
- `visitor-map.js` - Privacy-compliant map logic
- `VISITOR_MAP_IMPLEMENTATION.md` - This guide
- `api/geolocation.js` - (Optional) Serverless backend example

## 🚀 Implementation Options

### Option 1: Client-Side Only (Current Implementation - Most Private)

**Pros:**
- ✅ Maximum privacy (no external API calls)
- ✅ No backend needed
- ✅ Works immediately on GitHub Pages
- ✅ Zero cost

**Cons:**
- ⚠️ Less accurate (timezone-based approximation)
- ⚠️ Limited city coverage in mapping

**Status:** ✅ **READY TO USE** - Already implemented in `visitor-map.js`

The current implementation uses browser timezone to estimate location. It's privacy-first but less accurate.

### Option 2: Free API with Privacy Focus (ipapi.co)

**Pros:**
- ✅ More accurate city-level location
- ✅ Simple to implement (just uncomment code)
- ✅ Free tier available (30k requests/month)
- ✅ No registration required for basic use

**Cons:**
- ⚠️ External API dependency
- ⚠️ IP sent to third party (but not stored by you)
- ⚠️ Rate limits on free tier

**How to Enable:**

In `visitor-map.js`, uncomment this section (around line 84):

```javascript
// METHOD 2: Use privacy-focused API (more accurate)
// Uncomment if you want to use this:
try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    return {
        city: data.city,
        country: data.country_name,
        countryCode: data.country_code,
        lat: Math.round(data.latitude * 10) / 10,
        lon: Math.round(data.longitude * 10) / 10,
        timestamp: Date.now()
    };
} catch (error) {
    console.log('API call failed, using fallback');
    return null;
}
```

**Legal Note:** While you don't store IPs, the API provider (ipapi.co) processes them. Review their privacy policy if concerned.

### Option 3: Your Own Serverless Backend (Most Control)

**Pros:**
- ✅ Full control over privacy
- ✅ Accurate location data
- ✅ You control what's logged
- ✅ Can add database for persistence

**Cons:**
- ⚠️ Requires setup
- ⚠️ May have costs (usually free tier is sufficient)

**Setup Instructions:** See "Serverless Backend Setup" section below.

## 🛠️ Serverless Backend Setup (Optional)

If you want more accurate location with full privacy control, deploy your own serverless function.

### Using Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create project structure:**
   ```
   /api
     /geolocation.js
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Update your JavaScript:**
   ```javascript
   const response = await fetch('https://your-project.vercel.app/api/geolocation');
   ```

### Using Cloudflare Workers

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Create worker:**
   ```bash
   wrangler init visitor-map-api
   ```

3. **Use the provided code in `api/geolocation.js`**

4. **Deploy:**
   ```bash
   wrangler publish
   ```

### Using Netlify Functions

1. **Create `/netlify/functions/geolocation.js`**

2. **Deploy via Netlify CLI or Git integration**

3. **Endpoint will be:** `https://your-site.netlify.app/.netlify/functions/geolocation`

## 📊 Data Storage

### Current Implementation: localStorage

- ✅ Client-side only (no server storage)
- ✅ Each user sees their own browser's data
- ✅ No central database needed
- ✅ Maximum privacy

### Alternative: Database Storage

If you want a **centralized visitor map** (all visitors see the same data):

**Privacy-Compliant Options:**

1. **Firebase Firestore** (with rules)
   ```javascript
   // Store only:
   {
       city: "San Francisco",
       country: "United States",
       countryCode: "US",
       lat: 37.8,  // Rounded
       lon: -122.4, // Rounded
       timestamp: 1699999999999
       // NO IP, NO user ID, NO session tracking
   }
   ```

2. **Supabase** (PostgreSQL)
   ```sql
   CREATE TABLE visitor_locations (
       id SERIAL PRIMARY KEY,
       city VARCHAR(100),
       country VARCHAR(100),
       country_code CHAR(2),
       lat DECIMAL(4,1),  -- Rounded to 1 decimal
       lon DECIMAL(4,1),  -- Rounded to 1 decimal
       timestamp BIGINT,
       -- NO ip_address column!
       -- NO user_id column!
   );
   ```

3. **MongoDB Atlas** (Free tier)
   ```javascript
   {
       city: String,
       country: String,
       countryCode: String,
       lat: Number,  // Rounded
       lon: Number,  // Rounded
       timestamp: Number
   }
   ```

## 🎨 Integration with Main Site

Add a link to your visitor map in `index.html`:

```html
<a href="visitor-map.html" class="menu-item">
    <span class="menu-icon">🗺️</span>
    <span class="menu-text">Visitor Map</span>
</a>
```

Or add it as a section in your existing menu.

## ⚖️ Legal Considerations

### GDPR Compliance ✅

- **Lawful basis:** Legitimate interest (showing visitor statistics)
- **Data minimization:** Only city/country collected
- **No consent required:** Anonymous data, no tracking
- **Right to erasure:** Not applicable (no personal data)

### CCPA Compliance ✅

- **No personal information:** City location is not PII under CCPA
- **No sale of data:** Data stays on client or your server
- **No opt-out required:** Not selling or sharing personal data

### Best Practices

1. **Add to Privacy Policy:**
   ```
   We display an approximate visitor map showing the city-level location
   of site visitors. We do not store IP addresses or exact coordinates.
   Only city name, country, and visit timestamp are collected.
   ```

2. **Cookie Notice:** Not required (no cookies used)

3. **Terms of Service:** Consider adding a note about analytics

## 🔍 Privacy Audit Checklist

- [ ] IP addresses are never stored ✅
- [ ] Only city-level location is used ✅
- [ ] No personal identifiers (user IDs, session IDs) ✅
- [ ] No cookies or tracking pixels ✅
- [ ] Clear privacy notice displayed ✅
- [ ] Data is aggregated and anonymized ✅
- [ ] No third-party trackers ✅
- [ ] Coordinates rounded to low precision ✅

## 📈 Accuracy vs Privacy Trade-offs

| Method | Privacy | Accuracy | Cost | Setup |
|--------|---------|----------|------|-------|
| Timezone-based | 🔒🔒🔒🔒🔒 | ⭐⭐ | Free | None |
| ipapi.co | 🔒🔒🔒🔒 | ⭐⭐⭐⭐ | Free* | Minimal |
| Own Serverless | 🔒🔒🔒🔒🔒 | ⭐⭐⭐⭐⭐ | Free** | Moderate |

*Free tier: 30k requests/month
**Most platforms have generous free tiers

## 🚨 What NOT to Do

❌ **DON'T** store raw IP addresses
❌ **DON'T** use exact GPS coordinates (latitude/longitude with >2 decimals)
❌ **DON'T** track users across sessions
❌ **DON'T** combine with other personal data
❌ **DON'T** use Google Analytics with visitor map (creates tracking profile)
❌ **DON'T** sell or share visitor data

## 🎯 Recommended Setup

For most use cases:

1. **Start with:** Client-side timezone method (current implementation)
2. **If you need accuracy:** Add the ipapi.co API option (just uncomment)
3. **For production sites:** Consider your own serverless function with MaxMind GeoLite2

## 📞 Support

If you have questions about:
- Privacy compliance: Consult a lawyer familiar with GDPR/CCPA
- Technical implementation: Refer to this guide or open an issue
- Alternative solutions: Consider privacy-first services like Plausible Analytics

## 📝 License Note

This implementation is designed for legal compliance but is not legal advice.
Consult with a legal professional for your specific situation and jurisdiction.
