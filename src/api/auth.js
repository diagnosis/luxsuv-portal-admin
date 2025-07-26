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
        })
        console.log('Login response:', {
            status: res.status,
            headers: res.headers,
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


