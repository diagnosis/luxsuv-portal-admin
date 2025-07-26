import axios from "axios";

// Helper function to get token from localStorage
function getToken() {
    return localStorage.getItem('luxsuv_token');
}

export async function createBooking(bookingData) {
    try {
        console.log('Creating booking:', bookingData);
        const res = await apiClient.post('/book-ride', bookingData);
        
        if (res.status !== 200) {
            throw new Error(`Failed to create booking: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Create booking error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function getMyBookings() {
    try {
        console.log('Fetching my bookings...');
        const res = await apiClient.get('/bookings/my');
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch bookings: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('My bookings fetch error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function updateBooking(bookingId, updates) {
    try {
        console.log('Updating booking:', bookingId, updates);
        const res = await apiClient.put(`/bookings/${bookingId}`, updates);
        
        if (res.status !== 200) {
            throw new Error(`Failed to update booking: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Update booking error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function cancelBooking(bookingId, reason = '') {
    try {
        console.log('Cancelling booking:', bookingId, reason);
        const res = await apiClient.delete(`/bookings/${bookingId}/cancel`, {
            data: { reason }
        });
        
        if (res.status !== 200) {
            throw new Error(`Failed to cancel booking: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Cancel booking error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function getBookingsByEmail(email) {
    try {
        console.log('Fetching bookings by email:', email);
        const res = await apiClient.get(`/bookings/email/${encodeURIComponent(email)}`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch bookings: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Bookings by email fetch error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
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
            const res = await apiClient.get('/dispatcher/bookings/all');
            console.log('Bookings response:', {
                status: res.status,
                dataLength: res.data?.bookings?.length || 0,
            });
            if (res.status !== 200) throw new Error(`Failed to fetch bookings: ${res.status}`);
            // The dispatcher endpoint returns { bookings: [...], count: number }
            return res.data.bookings || [];
        }
        catch (error) {
            console.error('Bookings fetch error:', error.response?.data);
            console.error('Bookings fetch error status:', error.response?.status);
            throw new Error(error.response?.data?.error || error.message || 'Network error');
        }
}