import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import bg from '../assets/images/bg5.jpg'; 

const IntroPage = () => {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef(null);

  const textToType = ['Monitoring', 'System'];

  useEffect(() => {
    const currentWord = textToType[wordIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentWord.length) {
        setDisplayedText((prev) => prev + currentWord[charIndex]);
        setCharIndex((prev) => prev + 1);
        // Play typing sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else if (isDeleting && charIndex > 0) {
        setDisplayedText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1000); // Pause before deleting
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % textToType.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, wordIndex]);

  // Redirect to login after 5 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  // Particle animation setup
  useEffect(() => {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 6 + 2; // Increased size range from 1-4 to 2-8
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.size > 0.4) this.size -= 0.05; // Increased minimum size from 0.2 to 0.4

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
        if (particle.size <= 0.4) {
          const index = particles.indexOf(particle);
          particles.splice(index, 1);
          particles.push(new Particle());
        }
      });
      requestAnimationFrame(animateParticles);
    };

    animateParticles();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Text animation variants for entrance
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

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Particle canvas */}
      <canvas
        id="particleCanvas"
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
      ></canvas>

      {/* Semi-transparent black overlay */}
      <div className="absolute inset-0 bg-black/80" style={{ zIndex: 10 }}></div>

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
        {/* Call-to-action button */}
        <motion.button
          className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition-colors"
          variants={textVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1.5 }}
          onClick={() => navigate('/login')}
        >
          Get Started
        </motion.button>
      </div>

      {/* Audio for typing effect */}
      <audio ref={audioRef} src="/sounds/type.mp3" preload="auto"></audio>
    </div>
  );
};

export default IntroPage;