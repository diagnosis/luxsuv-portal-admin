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

export async function getAllUsers(page = 1, limit = 10) {
    try {
        console.log('Fetching all users...');
        const res = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch users: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Get all users error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function getUserByEmail(email) {
    try {
        console.log('Fetching user by email:', email);
        const res = await apiClient.get(`/admin/users/by-email?email=${encodeURIComponent(email)}`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch user: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Get user by email error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function getUserById(userId) {
    try {
        console.log('Fetching user by ID:', userId);
        const res = await apiClient.get(`/admin/users/${userId}`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to fetch user: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Get user by ID error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function updateUserRole(userId, role) {
    try {
        console.log('Updating user role:', userId, role);
        const res = await apiClient.put(`/admin/users/${userId}/role`, { role });
        
        if (res.status !== 200) {
            throw new Error(`Failed to update user role: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Update user role error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}

export async function deleteUser(userId) {
    try {
        console.log('Deleting user:', userId);
        const res = await apiClient.delete(`/admin/users/${userId}`);
        
        if (res.status !== 200) {
            throw new Error(`Failed to delete user: ${res.status}`);
        }
        
        return res.data;
    } catch (error) {
        console.error('Delete user error:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message);
    }
}