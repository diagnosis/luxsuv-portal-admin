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

// Request interceptor to add Authorization header from localStorage
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('luxsuv_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default async function getBookings() {
        try {
            console.log('Fetching bookings...');
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