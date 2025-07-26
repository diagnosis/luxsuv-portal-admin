import axios from "axios";

const baseURL = 'https://luxsuv-v4.onrender.com'

   export default async function getBookings() {
        try {
            console.log('Fetching bookings...');
            const res = await axios.get(`${baseURL}/bookings/my`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            console.log('Bookings response:', {
                status: res.status,
                dataLength: res.data?.length || 0,
            });
            if (!res.status === 200) throw new Error(`Failed to fetch bookings: ${res.status}`);
            return res.data;
        }
        catch (error) {
            console.error('Bookings fetch error:', error.response?.data);
            throw new Error(error.response?.data?.error || error.message || 'Network error');
        }
   }