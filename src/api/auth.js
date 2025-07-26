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
        console.log('Adding Authorization header with token:', token.substring(0, 20) + '...');
    }
    return config;
});

export async function  login(email, password) {
    try{
        console.log('Attempting login for:', email);
        const res = await apiClient.post('/login', {
            email:email,
            password:password,
        });
        console.log('Login response:', {
            status: res.status,
            headers: Object.fromEntries(
                Object.entries(res.headers).filter(([key]) => 
                    key.toLowerCase().includes('cookie') || 
                    key.toLowerCase().includes('set-cookie')
                )
            ),
            data: res.data
        });
        
        // Check if token is set in cookies after login
        setTimeout(() => {
            const token = getTokenFromCookie();
            console.log('Token after login:', token ? token.substring(0, 20) + '...' : 'No token found');
        }, 100);
        
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
        const token = getTokenFromCookie();
        console.log('Token available for auth check:', token ? 'Yes' : 'No');
        
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
        // Clear any local token storage if needed
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

