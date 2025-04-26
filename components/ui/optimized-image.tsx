"use client"

import { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useAnimationPreset } from "@/hooks/useAnimationPreset"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  showPlaceholder?: boolean
  placeholderColor?: string
}

export function OptimizedImage({
  alt,
  src,
  className,
  fill,
  sizes,
  priority,
  showPlaceholder = true,
  placeholderColor = "bg-muted/20",
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority)
  const [hasError, setHasError] = useState(false)
  const { imageVariants } = useAnimationPreset()

  // Reset loading state if src changes
  useEffect(() => {
    if (!priority) setIsLoading(true)
  }, [src, priority])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder shown during image loading */}
      {showPlaceholder && isLoading && !hasError && (
        <div 
          className={cn(
            "absolute inset-0 animate-pulse rounded-inherit",
            placeholderColor
          )}
          aria-hidden="true"
        />
      )}

      {/* Error state placeholder */}
      {hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-inherit"
          aria-hidden="true"
        >
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      <AnimatePresence>
        {!hasError && (
          <motion.div
            className="w-full h-full"
            initial="hidden"
            animate={isLoading ? "hidden" : "visible"}
            variants={imageVariants}
          >
            <Image
              src={src}
              alt={alt}
              fill={fill}
              sizes={sizes}
              priority={priority}
              className={cn(
                "object-cover transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true)
                setIsLoading(false)
              }}
              {...props}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 