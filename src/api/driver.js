import axios from "axios";

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

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('luxsuv_token');
        }
        return Promise.reject(error);
    }
);

export async function getAssignedBookings() {
    try {
        console.log('Fetching assigned bookings...');
        const res = await apiClient.get('/driver/bookings/assigned');
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch assigned bookings: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Assigned bookings fetch error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function acceptBooking(bookingId) {
    try {
        console.log('Accepting booking:', bookingId);
        const res = await apiClient.put(`/driver/bookings/${bookingId}/accept`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to accept booking: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Accept booking error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function getAvailableBookings() {
    try {
        console.log('Fetching available bookings...');
        const res = await apiClient.get('/super-driver/bookings/available');
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch available bookings: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Available bookings fetch error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function assignBookingToDriver(bookingId, driverId, notes = '') {
    try {
        console.log('Assigning booking to driver:', bookingId, driverId);
        const payload = { driver_id: driverId };
        if (notes) payload.notes = notes;
        
        const res = await apiClient.post(`/management/bookings/${bookingId}/assign`, payload);
        
        if (res.status !== 200) {
            throw new Error(`Failed to assign booking: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Assign booking error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function getDriverBookings(driverId, status = 'all') {
    try {
        console.log('Fetching driver bookings:', driverId, status);
        const res = await apiClient.get(`/super-driver/bookings/driver/${driverId}?status=${status}`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch driver bookings: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Driver bookings fetch error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}