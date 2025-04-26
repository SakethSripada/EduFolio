import { Variants } from 'framer-motion';

/**
 * Animation presets for common UI interactions 
 * These can be used with framer-motion components
 */
export const useAnimationPreset = () => {
  // Smooth page transitions
  const pageTransition: Variants = {
    hidden: { 
      opacity: 0,
      y: 10 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Staggered list items
  const listContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const listItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Card hover effect
  const cardHover: Variants = {
    initial: { 
      y: 0,
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)" 
    },
    tap: { 
      y: -2,
      boxShadow: "0 5px 10px rgba(0,0,0,0.1)" 
    }
  };

  // Smooth fade for modals/dialogs
  const modalVariants: Variants = {
    hidden: { 
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Smooth background overlay
  const overlayVariants: Variants = {
    hidden: { 
      opacity: 0 
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  // Button press animation
  const buttonVariants: Variants = {
    initial: { 
      scale: 1 
    },
    hover: { 
      scale: 1.05 
    },
    tap: { 
      scale: 0.98 
    }
  };

  // Fluid image loading
  const imageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return {
    pageTransition,
    listContainer,
    listItem,
    cardHover,
    modalVariants,
    overlayVariants,
    buttonVariants,
    imageVariants
  };
};

export default useAnimationPreset; 