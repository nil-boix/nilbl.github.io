/**
 * Privacy-Compliant Visitor Map
 *
 * This implementation ensures legal compliance by:
 * 1. Never storing IP addresses
 * 2. Using only city-level granularity (no exact coordinates)
 * 3. Storing minimal, anonymized data
 * 4. No persistent user tracking
 */

class PrivacyCompliantVisitorMap {
    constructor() {
        this.map = null;
        this.markers = [];
        this.storageKey = 'visitor_map_data';
        this.init();
    }

    async init() {
        // Initialize map
        this.initMap();

        // Load existing visitor data
        this.loadVisitorData();

        // Add current visitor (privacy-compliant way)
        await this.addCurrentVisitor();

        // Update statistics
        this.updateStats();
    }

    initMap() {
        // Create map centered on world
        this.map = L.map('map').setView([20, 0], 2);

        // Add tile layer (dark theme to match site)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
    }

    async addCurrentVisitor() {
        try {
            // Get approximate location using PRIVACY-RESPECTING method
            const location = await this.getApproximateLocation();

            if (location) {
                // Store visitor data (anonymized)
                this.storeVisitorData(location);

                // Add marker to map
                this.addMarker(location);
            }
        } catch (error) {
            console.log('Could not determine location (this is fine for privacy)');
        }
    }

    async getApproximateLocation() {
        /**
         * PRIVACY-COMPLIANT LOCATION DETECTION
         *
         * Options for implementation:
         *
         * 1. Client-side only (most private):
         *    - Use browser timezone to estimate region
         *    - Use browser language
         *    - No external API calls
         *
         * 2. Free API with privacy focus:
         *    - ipapi.co (free tier, no registration)
         *    - Returns city-level data only
         *
         * 3. Your own serverless function:
         *    - Use MaxMind GeoLite2 (free)
         *    - Process IP server-side
         *    - Return only city/country, discard IP immediately
         */

        // METHOD 1: Client-side timezone-based (most private, less accurate)
        const timezoneLocation = this.getLocationFromTimezone();
        if (timezoneLocation) {
            return timezoneLocation;
        }

        // METHOD 2: Use privacy-focused API (more accurate)
        // Uncomment if you want to use this:
        /*
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            return {
                city: data.city,
                country: data.country_name,
                countryCode: data.country_code,
                // Use city center coordinates (rounded to 1 decimal = ~11km accuracy)
                lat: Math.round(data.latitude * 10) / 10,
                lon: Math.round(data.longitude * 10) / 10,
                timestamp: Date.now()
            };
        } catch (error) {
            console.log('API call failed, using fallback');
            return null;
        }
        */

        return null;
    }

    getLocationFromTimezone() {
        /**
         * Estimate location from browser timezone
         * This is the most privacy-friendly approach
         * No external API calls, no IP address needed
         */
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language || navigator.userLanguage;

        // Simple timezone to approximate location mapping
        const timezoneMap = {
            'America/New_York': { city: 'New York', country: 'United States', countryCode: 'US', lat: 40.7, lon: -74.0 },
            'America/Chicago': { city: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.9, lon: -87.6 },
            'America/Denver': { city: 'Denver', country: 'United States', countryCode: 'US', lat: 39.7, lon: -104.9 },
            'America/Los_Angeles': { city: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.1, lon: -118.2 },
            'America/Toronto': { city: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.7, lon: -79.4 },
            'Europe/London': { city: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5, lon: -0.1 },
            'Europe/Paris': { city: 'Paris', country: 'France', countryCode: 'FR', lat: 48.9, lon: 2.4 },
            'Europe/Berlin': { city: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.5, lon: 13.4 },
            'Europe/Madrid': { city: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4, lon: -3.7 },
            'Europe/Rome': { city: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9, lon: 12.5 },
            'Asia/Tokyo': { city: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.7, lon: 139.7 },
            'Asia/Shanghai': { city: 'Shanghai', country: 'China', countryCode: 'CN', lat: 31.2, lon: 121.5 },
            'Asia/Seoul': { city: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.6, lon: 127.0 },
            'Asia/Singapore': { city: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3, lon: 103.8 },
            'Asia/Dubai': { city: 'Dubai', country: 'UAE', countryCode: 'AE', lat: 25.3, lon: 55.3 },
            'Asia/Kolkata': { city: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.1, lon: 72.9 },
            'Australia/Sydney': { city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.9, lon: 151.2 },
            'Pacific/Auckland': { city: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.8, lon: 174.8 },
            'America/Sao_Paulo': { city: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.5, lon: -46.6 },
            'America/Mexico_City': { city: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.4, lon: -99.1 },
            'Africa/Johannesburg': { city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.2, lon: 28.0 },
            'Africa/Cairo': { city: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0, lon: 31.2 },
        };

        if (timezoneMap[timezone]) {
            return {
                ...timezoneMap[timezone],
                timestamp: Date.now(),
                detectionMethod: 'timezone'
            };
        }

        return null;
    }

    storeVisitorData(location) {
        // Get existing data
        let visitorData = this.getStoredData();

        // Create anonymized entry (NO IP, NO exact coordinates)
        const entry = {
            city: location.city,
            country: location.country,
            countryCode: location.countryCode,
            // Store only rounded coordinates (city-level accuracy)
            lat: location.lat,
            lon: location.lon,
            timestamp: location.timestamp,
            // Optional: detection method for transparency
            method: location.detectionMethod || 'api'
        };

        // Check if we should add this visitor (avoid duplicates from same city within 24h)
        const isDuplicate = visitorData.some(v =>
            v.city === entry.city &&
            v.country === entry.country &&
            (Date.now() - v.timestamp) < 24 * 60 * 60 * 1000 // 24 hours
        );

        if (!isDuplicate) {
            visitorData.push(entry);

            // Limit storage (keep only last 1000 entries for performance)
            if (visitorData.length > 1000) {
                visitorData = visitorData.slice(-1000);
            }

            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(visitorData));
        }
    }

    getStoredData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    }

    loadVisitorData() {
        const visitorData = this.getStoredData();

        // Group visitors by city to show aggregated counts
        const cityGroups = {};

        visitorData.forEach(visitor => {
            const key = `${visitor.city},${visitor.country}`;
            if (!cityGroups[key]) {
                cityGroups[key] = {
                    ...visitor,
                    count: 0
                };
            }
            cityGroups[key].count++;
        });

        // Add markers for each city
        Object.values(cityGroups).forEach(cityData => {
            this.addMarker(cityData);
        });
    }

    addMarker(location) {
        // Create custom icon based on visitor count
        const count = location.count || 1;
        const size = Math.min(15 + count * 2, 40); // Scale size with count

        const marker = L.circleMarker([location.lat, location.lon], {
            radius: size / 2,
            fillColor: '#4CAF50',
            color: '#fff',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.6
        }).addTo(this.map);

        // Add popup with city info (NO personal data)
        marker.bindPopup(`
            <div style="text-align: center;">
                <strong>${location.city}, ${location.country}</strong><br>
                <span style="color: #4CAF50;">${count} visitor${count > 1 ? 's' : ''}</span>
            </div>
        `);

        this.markers.push(marker);
    }

    updateStats() {
        const visitorData = this.getStoredData();

        // Calculate statistics
        const totalVisitors = visitorData.length;
        const uniqueCountries = new Set(visitorData.map(v => v.country)).size;
        const uniqueCities = new Set(visitorData.map(v => `${v.city},${v.country}`)).size;

        // Update DOM
        document.getElementById('total-visitors').textContent = totalVisitors;
        document.getElementById('countries-count').textContent = uniqueCountries;
        document.getElementById('cities-count').textContent = uniqueCities;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrivacyCompliantVisitorMap();
});
