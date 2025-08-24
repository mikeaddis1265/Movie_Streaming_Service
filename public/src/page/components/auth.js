// src/components/Auth.js
import React, { useState } from 'react';
import { auth } from '../firebase/firebase';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('Logged in successfully!');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleSignup = async () => {
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert('Signed up successfully!');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
            <button onClick={handleSignup}>Signup</button>
        </div>
    );
};

export default Auth;