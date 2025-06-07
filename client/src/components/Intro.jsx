import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import bg1 from '../assets/images/bg5.jpg';
import bg2 from '../assets/images/bg2.jpg';
import bg3 from '../assets/images/bg3.jpg';
import bg4 from '../assets/images/bg13.jpg';

const IntroPage = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false); // New state for user interaction
  const audioRef = useRef(null);

  const textToType = ['Monitoring', 'System'];
  const backgroundImages = [bg1, bg2, bg3, bg4];

  // Detect user interaction
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      // Remove event listeners after first interaction
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    const currentWord = textToType[wordIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentWord.length) {
        setDisplayedText((prev) => prev + currentWord[charIndex]);
        setCharIndex((prev) => prev + 1);
        // Play typing sound only if user has interacted
        if (hasInteracted && audioRef.current) {
          audioRef.current.currentTime = 0;
          try {
            audioRef.current.play().catch((error) => {
              console.warn('Audio playback failed:', error);
            });
          } catch (error) {
            console.warn('Audio playback error:', error);
          }
        }
      } else if (isDeleting && charIndex > 0) {
        setDisplayedText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % textToType.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex, hasInteracted]);

  // Background image cycling
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(imageTimer);
  }, [backgroundImages.length]);

  // Text animation variants
  const textVariants = {
    initial: { y: 50, opacity: 0, scale: 0.95 },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: 'easeOut' },
    },
  };

  // Loading spinner variants
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  // Background image animation variants
  const imageVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image with animation */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentImageIndex}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImages[currentImageIndex]})` }}
          variants={imageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        ></motion.div>
      </AnimatePresence>

      {/* Semi-transparent black overlay */}
      <div className="absolute inset-0 bg-black/60" style={{ zIndex: 10 }}></div>

      {/* Content container */}
      <div className="relative text-center z-20 px-4">
        <motion.h1
          className="text-4xl md:text-7xl font-semibold text-white mb-2 drop-shadow-lg flex items-center justify-center"
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          <i className="fas fa-droplet mr-2 text-cyan-500"></i>
          Water Quality
        </motion.h1>
        <motion.div
          className="text-4xl md:text-5xl font-semibold text-cyan-500 mb-2 drop-shadow-lg"
          variants={textVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          {displayedText}
          <AnimatePresence>
            <motion.span
              className="inline-block w-1 h-8 md:h-10 bg-white ml-1 align-middle"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            ></motion.span>
          </AnimatePresence>
        </motion.div>
        <motion.p
          className="text-lg md:text-xl text-white/80 mt-4 font-medium"
          variants={textVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6 }}
        >
          Ensuring clean and safe water for all
        </motion.p>
        <motion.div
          className="mt-6"
          variants={textVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.9 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-t-white border-white/30 rounded-full mx-auto"
            variants={spinnerVariants}
            animate="animate"
          ></motion.div>
          <p className="text-sm text-white/70 mt-2">Loading...</p>
        </motion.div>
        <motion.button
          className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors"
          variants={textVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1.5 }}
          onClick={() => {
            setHasInteracted(true); // Ensure interaction state is set on button click
            navigate('/login');
          }}
        >
          Get Started
        </motion.button>
      </div>
      <audio ref={audioRef} src="/sounds/type.mp3" preload="auto"></audio>
    </div>
  );
};

export default IntroPage;