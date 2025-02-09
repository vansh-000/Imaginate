import React, { useContext, useState } from 'react';
import { assets } from '../assets/assets';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/appContext';

const Results = () => {
  const [image, setImage] = useState(assets.sample_img_1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const { creditData, backendUrl, accessToken } = useContext(AppContext);
  const navigate = useNavigate();

  const generateImage = async (prompt) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/image/generate-image', { prompt }, { headers: { accessToken } });
      if (data.success) {
        toast.success('Image generated successfully');
        creditData()
        return data.resultImage
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message)
      creditData()
      if (data.creditBalance === 0) {
        toast.error('You have no credits left')
        navigate('/buy')
      }
    }
  }

  const onSubmitFxn = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (input) {
      const image = await generateImage(input);
      if (image) {
        setIsImageLoaded(true);
        setImage(image);
      }
    }
    setLoading(false);
  }

  return (
    <motion.form
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={onSubmitFxn} className="flex flex-col min-h-screen justify-center items-center p-4 sm:px-6 md:px-8 lg:px-12 xl:px-12">
      <div className="w-full lg:px-12 xl:px-12 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        <div className="relative">
          <img src={image} alt="Generated" className="w-full rounded-2xl shadow-lg object-cover" />
          <span className={`absolute bottom-0 left-0 h-1 bg-blue-500 ${loading ? 'w-full transition-all duration-[5s]' : 'w-0'}`} />
        </div>
        {loading && <p className="text-center text-blue-500 mt-2 animate-pulse">Loading...</p>}
      </div>

      {!isImageLoaded && (
        <div className="flex w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-neutral-700 text-white text-sm p-1 mt-8 rounded-full shadow-md">
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Show your Creativity"
            className="flex-1 bg-transparent outline-none sm:px-3 lg:px-4 md:px-4 pl-4 placeholder-gray-400 text-xs sm:text-sm md:text-base"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-full text-white font-medium whitespace-nowrap"
          >
            Create
          </button>
        </div>
      )}

      {isImageLoaded && (
        <div className="flex gap-2 sm:gap-4 flex-wrap justify-center mt-8">
          <button
            onClick={() => setIsImageLoaded(false)}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors px-4 sm:px-6 md:px-8 py-2 rounded-full cursor-pointer font-medium"
          >
            Generate Another
          </button>
          <a
            href={image}
            download
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 sm:px-6 md:px-8 py-2 rounded-full text-white font-medium cursor-pointer"
          >
            Download
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default Results;