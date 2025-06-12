import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion"
import PageWrapper from '../components/ui/PageWrapper';
import bannerImage from '../assets/images/home/landingBanner.png';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  if (isAuthenticated) {
    return <Navigate to="/home/spaces" />;
  }

  return (
    <PageWrapper>
      <motion.div
        className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl" variants={itemVariants}>
          Easy and Fun Metaverse,{" "}
          <motion.span
            className="text-primary"
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            Towny
          </motion.span>
        </motion.h1>
        <motion.p className="mt-4 text-xl text-gray-600" variants={itemVariants}>
          Join our community and explore the endless possibilities of the metaverse.
        </motion.p>
        <motion.div
          className="relative mt-12 aspect-auto w-[80%] mx-auto overflow-hidden rounded-3xl"
          variants={imageVariants}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 },
          }}
        >
          <img
            src={bannerImage}
            alt="Landing Banner"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </motion.div>
        <motion.div className="mt-10 flex justify-center gap-4" variants={itemVariants}>
          <Link className='cursor-pointer' to="/accounts/signin">
            <motion.button
              className="rounded-full bg-primary px-4 py-1 md:px-8 md:py-3 text-white shadow-lg hover:bg-white hover:text-primary hover:border-2 hover:border-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </Link>
          <Link className='cursor-pointer' to="/accounts/signup">
            <motion.button
              className="rounded-full border-2 border-primary px-4 py-1 md:px-8 md:py-3 text-primary shadow-lg hover:bg-primary hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </PageWrapper>
  )
}
