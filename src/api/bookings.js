import axios from "axios";

// Helper function to get token from localStorage
function getToken() {
    return localStorage.getItem('luxsuv_token');
}

const baseURL = 'https://luxsuv-v4.onrender.com'

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Note: Cookies are sent automatically with withCredentials: true

export default async function getBookings() {
        try {
            console.log('Fetching bookings...');
            const token = getToken();
            console.log('Token available for bookings:', token ? 'Yes' : 'No');
            
            // Add Authorization header if token exists
            const config = {};
            if (token) {
                config.headers = {
                    'Authorization': `Bearer ${token}`
                };
                console.log('Adding Authorization header for bookings request');
            }
            
            const res = await apiClient.get('/bookings/my', config);
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