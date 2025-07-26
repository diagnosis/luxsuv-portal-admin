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
            // Clear invalid token
            localStorage.removeItem('luxsuv_token');
        }
        return Promise.reject(error);
    }
);

export async function  login(email, password) {
    try{
        console.log('Attempting login for:', email);
        
        const res = await apiClient.post('/login', {
            email:email,
            password:password,
        });
        
        console.log('Login response data:', res.data);
        
        // Store token from response for immediate use
        if (res.data.token) {
            console.log('Storing token from login response');
            localStorage.setItem('luxsuv_token', res.data.token);
        }
        
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
        // Enhanced error message construction
        let errorMessage = 'Authentication failed';
        
        if (error.response) {
            // Backend responded with an error
            const { status, data } = error.response;
            
            if (data?.error) {
                errorMessage = data.error;
            } else {
                // Use HTTP status codes for more descriptive messages
                switch (status) {
                    case 401:
                        errorMessage = 'Unauthorized - Invalid or expired token';
                        break;
                    case 403:
                        errorMessage = 'Forbidden - Insufficient permissions';
                        break;
                    case 500:
                        errorMessage = 'Server Error - Please try again later';
                        break;
                    default:
                        errorMessage = `HTTP ${status} - Authentication failed`;
                }
            }
        } else if (error.message) {
            // Network or other error
            errorMessage = `Network Error: ${error.message}`;
        }
        
        console.error('Auth check failed:', errorMessage);
        
        throw new Error(errorMessage);
    }

}

export async function logout() {
    try {
        // Clear localStorage token
        localStorage.removeItem('luxsuv_token');
        console.log('Cleared token from localStorage');
        
        await apiClient.post('/logout', {});
        console.log('Logout successful - backend should clear cookies');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

export async function register(userData) {
    try {
        console.log('Attempting registration for:', userData.email);
        
        const res = await apiClient.post('/register', userData);
        
        console.log('Registration response data:', res.data);
        
        if (res.status !== 200) {
            throw new Error(`Error registering: ${res.status}`);
        }
        
        return res.data;
    } catch (e) {
        console.error('Registration error details:', e.response?.data);
        throw new Error(e.response?.data?.error || e.message);
    }
}

export async function changePassword(currentPassword, newPassword) {
    try {
        const res = await apiClient.put('/users/me/password', {
            current_password: currentPassword,
            new_password: newPassword
        });
        
        return res.data;
    } catch (error) {
        console.error('Password change error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function forgotPassword(email) {
    try {
        const res = await apiClient.post('/auth/forgot-password', { email });
        return res.data;
    } catch (error) {
        console.error('Forgot password error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function resetPassword(resetToken, newPassword) {
    try {
        const res = await apiClient.post('/auth/reset-password', {
            reset_token: resetToken,
            new_password: newPassword
        });
        return res.data;
    } catch (error) {
        console.error('Reset password error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}
