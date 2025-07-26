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
                <ul className='flex space-x-4'>
                    <li><Link to='/' className='hover:text-blue-200'>Home</Link></li>
                    <li><Link to='/login' className='hover:text-blue-200'>Login</Link></li>
                    <li><Link to='/dashboard' className='hover:text-blue-200'>Dashboard</Link></li>
                    <li><Link to='/users' className='hover:text-blue-200'>Users</Link></li>
                    <li>
                        <button 
                            onClick={handleLogout}
                            className='hover:text-blue-200 cursor-pointer'
                        >
                            Logout
                        </button>
                    </li>
                </ul>

            </div>

        </nav>
    )
}
export default Navbar