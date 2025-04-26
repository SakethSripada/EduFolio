import { motion } from "framer-motion";
import { useAnimationPreset } from "@/hooks/useAnimationPreset";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Page transition component to wrap page content
 * Provides smooth transitions between pages
 */
export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  const { pageTransition } = useAnimationPreset();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
} 