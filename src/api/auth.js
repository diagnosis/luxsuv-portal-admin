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

// Note: Cookies are sent automatically with withCredentials: true
// No need to manually add Authorization headers

export async function  login(email, password) {
    try{
        console.log('Attempting login for:', email);
        
        const res = await apiClient.post('/login', {
            email:email,
            password:password,
        });
        
        console.log('Login response data:', res.data);
        console.log('Authentication cookie should be set by backend');
        
        if (res.status !== 200) throw new Error(
            `Error logging in: ${res.status}`
        )
        return res;
    } catch (e) {
        console.error('Login error details:', e.response?.data);
        throw new Error(e.response?.data?.error || e.message);
    }
}

export async function checkAuth() {
    try {
        console.log('Checking authentication...');
        console.log('Using cookies for authentication (sent automatically)');
        
        const res = await apiClient.get('/users/me');
        console.log('Auth check response:', {
            status: res.status,
            data: res.data,
        });
        return res.data;
    } catch (error) {
        console.error('Auth check failed:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message || 'Authentication failed');
    }

}

export async function logout() {
    try {
        await apiClient.post('/logout', {});
        console.log('Logout successful - backend should clear cookies');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

