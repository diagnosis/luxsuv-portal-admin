import axios from "axios";

const baseURL = 'https://luxsuv-v4.onrender.com'


export async function  login(email, password) {
    try{
        const res = await axios.post(`${baseURL}/login`, {
            email:email,
            password:password,
        }, {
            withCredentials: true,
        })
        if (res.status !== 200) throw new Error(
            `Error logging in: ${res.status}`
        )
        return res;
    } catch (e) {
        throw new Error(e.response?.data?.error || e.message);
    }


}


