import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../assets/assets.js';
import { AppContext } from '../context/appContext.jsx';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthForm = () => {
    const [state, setState] = useState('Login');
    const { setShowLogin, backendUrl, setAccessToken, setUser } = useContext(AppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = state === 'Login' ? '/api/user/login' : '/api/user/register';
            const payload = state === 'Login' ? { email, password } : { name, email, password };

            const { data } = await axios.post(backendUrl + endpoint, payload);
            if (data.success) {
                setAccessToken(data.data.tokens.accessToken);
                setUser(data.data.user);
                localStorage.setItem('accessToken', data.data.tokens.accessToken);
                localStorage.setItem('user', JSON.stringify(data.data.user.name));
                setShowLogin(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Authentication Error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Authentication Error.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className='fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
            <motion.form onSubmit={onSubmitHandler}
                initial={{ opacity: 0.2, y: 50 }}
                transition={{ duration: 0.3 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className='relative bg-white p-10 rounded-xl text-slate-500'>
                <h1 className='text-center text-2xl text-neutral-700 font-medium'>
                    {state === 'Login' ? 'Login' : 'Signup'}
                </h1>
                <p className='text-sm mt-2'>
                    {state === 'Login' ? 'Welcome Back! Please sign in to continue' : 'Welcome User! Please create your account'}
                </p>
                {state !== 'Login' && (
                    <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
                        <img src={assets.user_icon} alt="User Icon" />
                        <input type="text" className='outline-none text-sm' placeholder='Full Name' onChange={e => setName(e.target.value)} value={name} required />
                    </div>
                )}
                <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
                    <img src={assets.email_icon} alt="Email Icon" />
                    <input type="text" className='outline-none text-sm' placeholder='Email' onChange={e => setEmail(e.target.value)} value={email} required />
                </div>
                <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-5'>
                    <img src={assets.lock_icon} alt="Lock Icon" />
                    <input type="password" className='outline-none text-sm' placeholder='Password' onChange={e => setPassword(e.target.value)} value={password} required />
                </div>
                <p className='text-sm text-blue-600 my-4 cursor-pointer'>Forgot Password?</p>
                <button
                    className={`bg-blue-600 w-full text-white py-2 rounded-full ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (state === 'Login' ? 'Login' : 'Signup')}
                </button>
                {state === 'Login' ? (
                    <p className='mt-5 text-center'>Don't have an account? <span onClick={() => setState('Signup')} className='text-blue-600 px-1 text-sm cursor-pointer'>Sign Up</span></p>
                ) : (
                    <p className='mt-5 text-center'>Already have an account? <span onClick={() => setState('Login')} className='text-blue-600 px-1 text-sm cursor-pointer'>Login</span></p>
                )}
                <img onClick={() => setShowLogin(false)} src={assets.cross_icon} className='absolute top-5 right-5 cursor-pointer' alt="Close Icon" />
            </motion.form>
        </div>
    );
};

export default AuthForm;