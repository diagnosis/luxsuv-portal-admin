import {Link} from "@tanstack/react-router";
import { logout } from "../api/auth.js";
import { useNavigate } from "@tanstack/react-router";


function Navbar() {
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await logout();
            navigate({ to: '/login' });
        } catch (error) {
            console.error('Logout failed:', error);
            // Still navigate to login even if logout fails
            navigate({ to: '/login' });
        }
    };
    
    return (
        <nav className='bg-blue-600 p-4 text-white'>
            <div className='container mx-auto flex justify-between items-center'>
                <h2 className='text-xl font-bold'>LuxSUV Portal</h2>
                <div className='flex items-center space-x-6'>
                    <ul className='flex space-x-4'>
                        <li><Link to='/dashboard' className='hover:text-blue-200'>Dashboard</Link></li>
                        <li><Link to='/book-ride' className='hover:text-blue-200'>Book Ride</Link></li>
                        <li><Link to='/bookings' className='hover:text-blue-200'>My Bookings</Link></li>
                        <li><Link to='/driver' className='hover:text-blue-200'>Driver</Link></li>
                        <li><Link to='/admin' className='hover:text-blue-200'>Admin</Link></li>
                    </ul>
                    <div>
                        <button 
                            onClick={handleLogout}
                            className='bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors'
                        >
                            Logout
                        </button>
                    </div>
                </div>

            </div>

        </nav>
    )
}
export default Navbar