import { useState, useEffect } from 'react';

const useUserName = () => {
    const [userName, setUserName] = useState('Guest');
    const API_URL = "https://paddy-login-backend.vercel.app/api/users";

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch(API_URL, {
                    method: 'GET',
                    credentials: 'include', // send cookies if auth depends on it
                });

                if (!response.ok) throw new Error('Failed to fetch users');

                const users = await response.json();

                // Get the logged-in email from cookie, JWT, or localStorage
                // Example: localStorage stores it after login
                const loggedInEmail = localStorage.getItem('email');

                // Find the user object
                const user = users.find(u => u.email === loggedInEmail);

                setUserName(user?.name || 'Guest');
                console.log('Logged-in user:', user);

            } catch (error) {
                console.error('Error fetching user name:', error);
                setUserName('Guest');
            }
        };

        fetchUserName();
    }, []);

    return userName;
};

export default useUserName;
