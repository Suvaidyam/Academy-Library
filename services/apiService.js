import ENV from "../config/config";

export const apiService = {

    async get(endpoint, params = {}) {
        const url = new URL(`${ENV.API_BASE_URL}/api/method${endpoint}`);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        try {
            const response = await fetch(url, {
                method: 'GET',
                // credentials: 'include',
                // headers: { 'Content-Type': 'application/json' }
            });
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    },

    async post(endpoint, data = {}) {
        try {
            const response = await fetch(`${ENV.API_BASE_URL}/api/method${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Frappe-CSRF-Token': this.getCSRFToken()
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    },

    getCSRFToken() {
        return document.cookie.split('; ').find(row => row.startsWith('sid='))?.split('=')[1] || '';
    }
};