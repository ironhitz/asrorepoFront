import { motion } from 'motion/react';

/**
 * Pre-defined animation variants for consistent motion across the app
 * Uses motion library for smooth, performant animations
 */

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const slideInFromLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const slideInFromRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/**
 * Hover animation for interactive elements
 */
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 300, damping: 30 },
};

/**
 * Pulse animation for loading/attention states
 */
export const pulse = {
  animate: { opacity: [1, 0.6, 1] },
  transition: { duration: 2, repeat: Infinity },
};

/**
 * Bounce animation for alerts
 */
export const bounce = {
  animate: { y: [-4, 4, -4] },
  transition: { duration: 1, repeat: Infinity },
};

/**
 * Shimmer loading animation
 */
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
  },
};
