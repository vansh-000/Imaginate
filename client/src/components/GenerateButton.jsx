import React, { useContext } from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/appContext';
import { motion } from 'framer-motion';

const GenerateButton = () => {
    const { user, setShowLogin } = useContext(AppContext);
    const navigate = useNavigate();
    const onclick = () => {
        if (user) {
            navigate('/results')
        } else {
            setShowLogin(true)
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0.2, y: 100 }}
            transition={{ duration: 1 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='pb-16 text-center '>
            <h1 className='text-2x1 md:text-3xl lg:text-4x1 mt-4 font-semibold text-neutral-800 py-6 md:py-16'>See the magic.
                Try now</h1>
            <button onClick={onclick} className='inline-flex cursor-pointer items-center gap-2 px-12 py-3 rounded-full bg-black text-white m-auto hoveṛ:scale-105 transition-all duration-500'>Generate Images
                <img src={assets.star_group} alt="" className='h-6' />
            </button>
        </motion.div>
    )
}

export default GenerateButton;