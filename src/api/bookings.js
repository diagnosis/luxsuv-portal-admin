import axios from "axios";

const baseURL = 'https://luxsuv-v4.onrender.com'

// Get token from cookie
function getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name === 'luxsuv_token') {
            return value;
        }
    }
    return null;
}

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token in Authorization header
apiClient.interceptors.request.use((config) => {
    const token = getTokenFromCookie();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding Authorization header for bookings request');
    }
    return config;
});
export default async function getBookings() {
        try {
            console.log('Fetching bookings...');
            const token = getTokenFromCookie();
            console.log('Token available for bookings:', token ? 'Yes' : 'No');
            
            const res = await apiClient.get('/bookings/my');
            console.log('Bookings response:', {
                status: res.status,
                dataLength: res.data?.length || 0,
            });
            if (res.status !== 200) throw new Error(`Failed to fetch bookings: ${res.status}`);
            return res.data;
        }
        catch (error) {
            console.error('Bookings fetch error:', error.response?.data);
            console.error('Bookings fetch error status:', error.response?.status);
            throw new Error(error.response?.data?.error || error.message || 'Network error');
        }
}