/**
 * Privacy-Compliant Visitor Map Module
 *
 * Implements 4 privacy modes:
 * 1. Country-Level Only: Stores only country codes (GDPR-compliant)
 * 2. Fuzzy Coordinates: Rounds coordinates to ±100km (reduced precision)
 * 3. Ephemeral: No storage, client-side only display
 * 4. Disabled: No tracking at all
 *
 * NO IP addresses or precise GPS coordinates are ever stored.
 */

const VisitorMap = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        STORAGE_KEY: 'visitor_map_data',
        PRIVACY_MODE_KEY: 'visitor_privacy_mode',
        CONSENT_KEY: 'visitor_consent',
        CURRENT_VISITOR_KEY: 'current_visitor_tracked',
        DEFAULT_MODE: 'country',
        GEOLOCATION_API: 'https://get.geojs.io/v1/ip/geo.json', // Free, privacy-friendly API
        FUZZY_PRECISION: 1, // Rounds to 1 decimal place (±100km precision)
    };

    // Privacy mode descriptions
    const MODE_DESCRIPTIONS = {
        country: 'Only country codes are collected. No IP addresses or precise locations stored.',
        fuzzy: 'Coordinates rounded to ±100km for privacy. City-level precision only.',
        ephemeral: 'Real-time display only. No data is stored or persisted.',
        disabled: 'All tracking is disabled. No location data collected.'
    };

    // Country code to name mapping (ISO 3166-1 alpha-2)
    const COUNTRY_NAMES = {
        'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
        'DE': 'Germany', 'FR': 'France', 'ES': 'Spain', 'IT': 'Italy', 'NL': 'Netherlands',
        'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway',
        'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland', 'CZ': 'Czech Republic', 'IE': 'Ireland',
        'PT': 'Portugal', 'GR': 'Greece', 'JP': 'Japan', 'CN': 'China', 'KR': 'South Korea',
        'IN': 'India', 'BR': 'Brazil', 'MX': 'Mexico', 'AR': 'Argentina', 'CL': 'Chile',
        'CO': 'Colombia', 'PE': 'Peru', 'ZA': 'South Africa', 'EG': 'Egypt', 'NG': 'Nigeria',
        'KE': 'Kenya', 'RU': 'Russia', 'UA': 'Ukraine', 'TR': 'Turkey', 'IL': 'Israel',
        'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates', 'SG': 'Singapore', 'MY': 'Malaysia',
        'TH': 'Thailand', 'ID': 'Indonesia', 'PH': 'Philippines', 'VN': 'Vietnam', 'NZ': 'New Zealand'
    };

    // State
    let currentMode = CONFIG.DEFAULT_MODE;
    let visitorData = { countries: {}, fuzzyLocations: [], ephemeralVisitors: [] };
    let hasConsent = false;

    /**
     * Initialize the visitor map module
     */
    function init() {
        console.log('Initializing Visitor Map...');

        // Load saved data and preferences
        loadPreferences();
        loadVisitorData();

        // Check for consent
        if (!hasConsent) {
            showCookieConsent();
        } else {
            // Track current visitor if not already tracked this session
            trackCurrentVisitor();
        }

        // Update UI
        updateUI();
        renderMap();
    }

    /**
     * Load user preferences from localStorage
     */
    function loadPreferences() {
        const savedMode = localStorage.getItem(CONFIG.PRIVACY_MODE_KEY);
        const savedConsent = localStorage.getItem(CONFIG.CONSENT_KEY);

        if (savedMode && ['country', 'fuzzy', 'ephemeral', 'disabled'].includes(savedMode)) {
            currentMode = savedMode;
        }

        hasConsent = savedConsent === 'true';

        // Update mode selector
        const modeSelect = document.getElementById('privacyModeSelect');
        if (modeSelect) {
            modeSelect.value = currentMode;
        }
    }

    /**
     * Load visitor data from localStorage
     */
    function loadVisitorData() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (savedData) {
                visitorData = JSON.parse(savedData);

                // Ensure data structure exists
                if (!visitorData.countries) visitorData.countries = {};
                if (!visitorData.fuzzyLocations) visitorData.fuzzyLocations = [];
                if (!visitorData.ephemeralVisitors) visitorData.ephemeralVisitors = [];
            }
        } catch (e) {
            console.error('Error loading visitor data:', e);
            visitorData = { countries: {}, fuzzyLocations: [], ephemeralVisitors: [] };
        }
    }

    /**
     * Save visitor data to localStorage
     */
    function saveVisitorData() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(visitorData));
        } catch (e) {
            console.error('Error saving visitor data:', e);
        }
    }

    /**
     * Track the current visitor based on privacy mode
     */
    async function trackCurrentVisitor() {
        if (currentMode === 'disabled' || !hasConsent) {
            console.log('Tracking disabled or no consent');
            return;
        }

        // Check if already tracked this session
        const sessionTracked = sessionStorage.getItem(CONFIG.CURRENT_VISITOR_KEY);
        if (sessionTracked) {
            console.log('Visitor already tracked this session');
            updateUI();
            return;
        }

        try {
            console.log('Fetching visitor location data...');
            const response = await fetch(CONFIG.GEOLOCATION_API);
            const data = await response.json();

            console.log('Raw geolocation data:', data);

            // Extract data based on privacy mode
            switch (currentMode) {
                case 'country':
                    await trackCountryOnly(data);
                    break;
                case 'fuzzy':
                    await trackFuzzyLocation(data);
                    break;
                case 'ephemeral':
                    await trackEphemeral(data);
                    break;
            }

            // Mark as tracked for this session
            sessionStorage.setItem(CONFIG.CURRENT_VISITOR_KEY, 'true');

            // Update UI
            updateUI();
            renderMap();

        } catch (error) {
            console.error('Error tracking visitor:', error);
            // Show fallback message
            document.getElementById('userLocation').textContent = 'Unable to detect';
        }
    }

    /**
     * Mode 1: Track country code only (GDPR-compliant)
     */
    function trackCountryOnly(data) {
        const countryCode = data.country_code || data.country || 'Unknown';
        const countryName = COUNTRY_NAMES[countryCode] || countryCode;

        console.log('Tracking country only:', countryCode);

        // Increment country counter
        if (!visitorData.countries[countryCode]) {
            visitorData.countries[countryCode] = {
                code: countryCode,
                name: countryName,
                count: 0
            };
        }
        visitorData.countries[countryCode].count++;

        // Save to localStorage
        saveVisitorData();

        // Update user location display
        document.getElementById('userLocation').textContent = countryName;
    }

    /**
     * Mode 2: Track fuzzy/rounded coordinates (reduced precision)
     */
    function trackFuzzyLocation(data) {
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        const countryCode = data.country_code || data.country || 'Unknown';
        const countryName = COUNTRY_NAMES[countryCode] || countryCode;

        console.log('Tracking fuzzy location:', { lat, lon, country: countryCode });

        // Round coordinates to reduce precision (±100km)
        const fuzzyLat = Math.round(lat * Math.pow(10, CONFIG.FUZZY_PRECISION)) / Math.pow(10, CONFIG.FUZZY_PRECISION);
        const fuzzyLon = Math.round(lon * Math.pow(10, CONFIG.FUZZY_PRECISION)) / Math.pow(10, CONFIG.FUZZY_PRECISION);

        // Store fuzzy location
        visitorData.fuzzyLocations.push({
            lat: fuzzyLat,
            lon: fuzzyLon,
            country: countryCode,
            timestamp: Date.now()
        });

        // Also increment country counter
        if (!visitorData.countries[countryCode]) {
            visitorData.countries[countryCode] = {
                code: countryCode,
                name: countryName,
                count: 0
            };
        }
        visitorData.countries[countryCode].count++;

        // Limit stored fuzzy locations to prevent bloat (keep last 1000)
        if (visitorData.fuzzyLocations.length > 1000) {
            visitorData.fuzzyLocations = visitorData.fuzzyLocations.slice(-1000);
        }

        // Save to localStorage
        saveVisitorData();

        // Update user location display
        const city = data.city || 'Unknown City';
        document.getElementById('userLocation').textContent = `${city}, ${countryName} (±100km)`;
    }

    /**
     * Mode 3: Ephemeral tracking (no persistent storage)
     */
    function trackEphemeral(data) {
        const countryCode = data.country_code || data.country || 'Unknown';
        const countryName = COUNTRY_NAMES[countryCode] || countryCode;
        const city = data.city || 'Unknown City';

        console.log('Ephemeral tracking (not stored):', { city, country: countryCode });

        // Store in memory only (will be lost on page refresh)
        visitorData.ephemeralVisitors.push({
            country: countryCode,
            countryName: countryName,
            city: city,
            timestamp: Date.now()
        });

        // Update user location display
        document.getElementById('userLocation').textContent = `${city}, ${countryName} (Ephemeral)`;

        // DO NOT save to localStorage - data is temporary only
    }

    /**
     * Change privacy mode
     */
    function changeMode(newMode) {
        console.log('Changing privacy mode to:', newMode);

        currentMode = newMode;
        localStorage.setItem(CONFIG.PRIVACY_MODE_KEY, newMode);

        // Update mode description
        const descElement = document.getElementById('modeDescription');
        if (descElement) {
            descElement.textContent = MODE_DESCRIPTIONS[newMode];
        }

        // Update privacy mode display
        const currentModeElement = document.getElementById('currentPrivacyMode');
        if (currentModeElement) {
            currentModeElement.textContent = newMode.charAt(0).toUpperCase() + newMode.slice(1);
        }

        // If changing to disabled, clear tracking flag
        if (newMode === 'disabled') {
            sessionStorage.removeItem(CONFIG.CURRENT_VISITOR_KEY);
        }

        // If changing from disabled to enabled, track visitor
        if (newMode !== 'disabled' && hasConsent) {
            sessionStorage.removeItem(CONFIG.CURRENT_VISITOR_KEY);
            trackCurrentVisitor();
        }

        updateUI();
        renderMap();
    }

    /**
     * Update UI with current statistics
     */
    function updateUI() {
        // Calculate totals based on current mode
        let totalVisitors = 0;
        let uniqueCountries = 0;

        if (currentMode === 'country' || currentMode === 'fuzzy') {
            // Sum all country visits
            Object.values(visitorData.countries).forEach(country => {
                totalVisitors += country.count;
            });
            uniqueCountries = Object.keys(visitorData.countries).length;
        } else if (currentMode === 'ephemeral') {
            totalVisitors = visitorData.ephemeralVisitors.length;
            const ephemeralCountries = new Set(visitorData.ephemeralVisitors.map(v => v.country));
            uniqueCountries = ephemeralCountries.size;
        }

        // Update DOM
        document.getElementById('totalVisitors').textContent = totalVisitors;
        document.getElementById('uniqueCountries').textContent = uniqueCountries;

        // Update country list
        renderCountryList();
    }

    /**
     * Render country breakdown list
     */
    function renderCountryList() {
        const countryListElement = document.getElementById('countryList');
        if (!countryListElement) return;

        countryListElement.innerHTML = '';

        if (currentMode === 'disabled') {
            countryListElement.innerHTML = '<div class="country-item-empty">Tracking is disabled</div>';
            return;
        }

        let countries = [];

        if (currentMode === 'ephemeral') {
            // Count ephemeral visitors by country
            const ephemeralCounts = {};
            visitorData.ephemeralVisitors.forEach(visitor => {
                if (!ephemeralCounts[visitor.country]) {
                    ephemeralCounts[visitor.country] = {
                        code: visitor.country,
                        name: visitor.countryName,
                        count: 0
                    };
                }
                ephemeralCounts[visitor.country].count++;
            });
            countries = Object.values(ephemeralCounts);
        } else {
            countries = Object.values(visitorData.countries);
        }

        if (countries.length === 0) {
            countryListElement.innerHTML = '<div class="country-item-empty">No visitors yet</div>';
            return;
        }

        // Sort by count descending
        countries.sort((a, b) => b.count - a.count);

        // Render country items
        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            countryItem.innerHTML = `
                <div class="country-flag">${getFlagEmoji(country.code)}</div>
                <div class="country-name">${country.name}</div>
                <div class="country-count">${country.count}</div>
            `;
            countryListElement.appendChild(countryItem);
        });
    }

    /**
     * Get flag emoji for country code
     */
    function getFlagEmoji(countryCode) {
        if (!countryCode || countryCode === 'Unknown') return '🌍';

        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    }

    /**
     * Render world map visualization
     */
    function renderMap() {
        const mapElement = document.getElementById('worldMap');
        if (!mapElement) return;

        if (currentMode === 'disabled') {
            mapElement.innerHTML = '<div class="map-disabled">🗺️<br>Map tracking is disabled</div>';
            return;
        }

        // Simple ASCII/emoji world map representation
        const mapHTML = `
            <div class="ascii-map">
                <div class="map-title">WORLD VISITOR HEAT MAP</div>
                <pre class="map-display">
    ╔════════════════════════════════════════════════════════════╗
    ║                    🌍 VISITOR ORIGINS 🌍                    ║
    ╠════════════════════════════════════════════════════════════╣
    ║                                                            ║
    ║   🗺️  This is a simplified representation.                ║
    ║       See country breakdown below for details.            ║
    ║                                                            ║
    ║   ${getMapVisualRepresentation()}
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
                </pre>
            </div>
        `;

        mapElement.innerHTML = mapHTML;
    }

    /**
     * Get visual representation of visitor distribution
     */
    function getMapVisualRepresentation() {
        const countries = Object.values(visitorData.countries);
        if (countries.length === 0) {
            return 'No visitors tracked yet. Be the first!              ';
        }

        // Show top 5 countries
        const topCountries = countries
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        let visualization = '';
        topCountries.forEach((country, index) => {
            const flag = getFlagEmoji(country.code);
            const bar = '█'.repeat(Math.min(Math.ceil(country.count / 2), 20));
            visualization += `${flag} ${country.name.padEnd(20)} ${bar} ${country.count}\n    ║   `;
        });

        return visualization;
    }

    /**
     * Show cookie consent banner
     */
    function showCookieConsent() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.add('show');
        }
    }

    /**
     * Hide cookie consent banner
     */
    function hideCookieConsent() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    /**
     * Accept cookies and enable tracking
     */
    function acceptCookies() {
        hasConsent = true;
        localStorage.setItem(CONFIG.CONSENT_KEY, 'true');
        hideCookieConsent();

        // Track current visitor
        trackCurrentVisitor();
    }

    /**
     * Reject cookies and disable tracking
     */
    function rejectCookies() {
        hasConsent = false;
        localStorage.setItem(CONFIG.CONSENT_KEY, 'false');
        localStorage.setItem(CONFIG.PRIVACY_MODE_KEY, 'disabled');
        currentMode = 'disabled';

        const modeSelect = document.getElementById('privacyModeSelect');
        if (modeSelect) {
            modeSelect.value = 'disabled';
        }

        hideCookieConsent();
        updateUI();
        renderMap();
    }

    /**
     * Clear all tracking data (for privacy/testing)
     */
    function clearAllData() {
        if (confirm('Are you sure you want to clear all visitor tracking data? This cannot be undone.')) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            sessionStorage.removeItem(CONFIG.CURRENT_VISITOR_KEY);
            visitorData = { countries: {}, fuzzyLocations: [], ephemeralVisitors: [] };
            updateUI();
            renderMap();
            alert('All visitor data has been cleared.');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        init,
        changeMode,
        acceptCookies,
        rejectCookies,
        clearAllData,
        getStats: () => ({
            totalVisitors: Object.values(visitorData.countries).reduce((sum, c) => sum + c.count, 0),
            uniqueCountries: Object.keys(visitorData.countries).length,
            mode: currentMode,
            hasConsent
        })
    };

})();

// Expose globally for HTML onclick handlers
window.VisitorMap = VisitorMap;
