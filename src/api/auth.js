import axios from "axios";

const baseURL = 'https://luxsuv-v4.onrender.com'


export async function  login(email, password) {
    try{
        console.log('Attempting login for:', email);
        const res = await axios.post(`${baseURL}/login`, {
            email:email,
            password:password,
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        })
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
        const res = await axios.get(`${baseURL}/users/me`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
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
        await axios.post(`${baseURL}/logout`, {}, {
            withCredentials: true,
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
}

