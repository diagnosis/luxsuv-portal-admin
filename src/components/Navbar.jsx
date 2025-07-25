import {Link} from "@tanstack/react-router";


function Navbar() {
    return (
        <nav className='bg-blue-600 p-4 text-white'>
            <div className='container mx-auto flex justify-between items-center'>
                <h2 className='text-xl font-bold'>LuxSUV Portal</h2>
                <ul className='flex space-x-4'>
                    <li><Link to={'dashboard'}>Dashboard</Link></li>
                    <li><Link to={''} className='hover:text-blue-200'>Users</Link></li>
                    <li><a href="#" className='hover:text-blue-200'>Logout</a></li>
                </ul>

            </div>

        </nav>
    )
}
export default Navbar