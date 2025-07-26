import axios from "axios";

const baseURL = 'https://luxsuv-v4.onrender.com'

   export default async function getBookings() {
        try {
            const res = await axios.get(`${baseURL}/bookings/my`, {
                withCredentials: true,
            })
            if (!res.status === 200) throw new Error(`Failed to fetch bookings: ${res.status}`);
            return res.data;
        }
        catch (error) {
            throw new Error(error.response?.data?.error || error.message || 'Network error');
        }
   }