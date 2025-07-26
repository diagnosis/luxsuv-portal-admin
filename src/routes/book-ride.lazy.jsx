import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createBooking } from '../api/bookings.js';
import { checkAuth } from '../api/auth.js';
import Navbar from '../components/Navbar.jsx';

export const Route = createLazyFileRoute('/book-ride')({
    beforeLoad: async () => {
        try {
            const userData = await checkAuth();
            return userData;
        } catch (error) {
            // Not authenticated, but still allow booking as guest
            return null;
        }
    },
    component: BookRidePage,
});

function BookRidePage() {
    const userData = Route.useRouteContext();
    const [formData, setFormData] = useState({
        your_name: userData?.username || '',
        email: userData?.email || '',
        phone_number: '',
        ride_type: 'Airport Transfer',
        pickup_location: '',
        dropoff_location: '',
        date: '',
        time: '',
        number_of_passengers: 1,
        number_of_luggage: 0,
        additional_notes: '',
    });

    const createBookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: (data) => {
            alert('Booking created successfully!');
            // Reset form
            setFormData({
                your_name: userData?.username || '',
                email: userData?.email || '',
                phone_number: '',
                ride_type: 'Airport Transfer',
                pickup_location: '',
                dropoff_location: '',
                date: '',
                time: '',
                number_of_passengers: 1,
                number_of_luggage: 0,
                additional_notes: '',
            });
        },
        onError: (error) => {
            alert(`Booking failed: ${error.message}`);
        },
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.your_name || !formData.email || !formData.phone_number || 
            !formData.pickup_location || !formData.dropoff_location || 
            !formData.date || !formData.time) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate 24-hour advance booking rule
        const bookingDateTime = new Date(`${formData.date}T${formData.time}`);
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        if (bookingDateTime < twentyFourHoursFromNow) {
            alert('Bookings must be made at least 24 hours in advance');
            return;
        }

        createBookingMutation.mutate(formData);
    };

    // Calculate minimum date (24 hours from now)
    const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const rideTypes = [
        'Airport Transfer',
        'City Tour',
        'Business Meeting',
        'Wedding',
        'Corporate Event',
        'Personal Trip',
        'Other'
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            
            <div className="p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8">
                        <h1 className="text-3xl font-bold mb-2">Book Your LuxSUV Ride</h1>
                        <p className="text-blue-100">
                            {userData ? `Welcome back, ${userData.username}!` : 'Book as a guest or sign in for faster checkout'}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-md text-gray-800">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information */}
                            <div className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            name="your_name"
                                            value={formData.your_name}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                            placeholder="+1 (555) 123-4567"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Ride Type</label>
                                        <select
                                            name="ride_type"
                                            value={formData.ride_type}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                        >
                                            {rideTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="border-b pb-6">
                                <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Pickup Location *</label>
                                        <input
                                            type="text"
                                            name="pickup_location"
                                            value={formData.pickup_location}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter pickup address or location"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Dropoff Location *</label>
                                        <input
                                            type="text"
                                            name="dropoff_location"
                                            value={formData.dropoff_location}
                                            onChange={handleChange}
                                            className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                            placeholder="Enter destination address or location"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Date *</label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                                min={minDate}
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Must be at least 24 hours in advance</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Time *</label>
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleChange}
                                                className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Number of Passengers *</label>
                                            <input
                                                type="number"
                                                name="number_of_passengers"
                                                value={formData.number_of_passengers}
                                                onChange={handleChange}
                                                className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                                min="1"
                                                max="8"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Number of Luggage</label>
                                            <input
                                                type="number"
                                                name="number_of_luggage"
                                                value={formData.number_of_luggage}
                                                onChange={handleChange}
                                                className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none"
                                                min="0"
                                                max="10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Special Requests or Notes</label>
                                    <textarea
                                        name="additional_notes"
                                        value={formData.additional_notes}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-md focus:border-blue-500 focus:outline-none h-24"
                                        placeholder="Any special requests, flight numbers, or additional information..."
                                        maxLength="500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formData.additional_notes.length}/500 characters
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="border-t pt-6">
                                <button
                                    type="submit"
                                    disabled={createBookingMutation.isPending}
                                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors text-lg"
                                >
                                    {createBookingMutation.isPending ? 'Creating Booking...' : 'Book Your LuxSUV Ride'}
                                </button>
                                
                                <div className="mt-4 p-4 bg-gray-100 rounded-md">
                                    <p className="text-sm text-gray-600">
                                        <strong>Important:</strong>
                                    </p>
                                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                        <li>• All bookings must be made at least 24 hours in advance</li>
                                        <li>• You can cancel or modify your booking up to 24 hours before the scheduled time</li>
                                        <li>• A confirmation email will be sent to your provided email address</li>
                                        <li>• Our dispatcher will assign a driver and contact you with details</li>
                                    </ul>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}