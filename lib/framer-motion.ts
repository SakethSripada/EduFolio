'use client'

import {
  motion as motionOriginal,
  AnimatePresence as AnimatePresenceOriginal,
  type HTMLMotionProps as HTMLMotionPropsOriginal,
  type Variants as VariantsOriginal,
  type PanInfo as PanInfoOriginal,
  useInView as useInViewOriginal,
  useMotionValue as useMotionValueOriginal,
  useTransform as useTransformOriginal,
  animate as animateOriginal
} from 'framer-motion'

// Re-export with named exports
export const motion = motionOriginal
export const AnimatePresence = AnimatePresenceOriginal
export type HTMLMotionProps<T extends keyof HTMLElementTagNameMap> = HTMLMotionPropsOriginal<T>
export type Variants = VariantsOriginal
export type PanInfo = PanInfoOriginal
export const useInView = useInViewOriginal
export const useMotionValue = useMotionValueOriginal
export const useTransform = useTransformOriginal
export const animate = animateOriginal 