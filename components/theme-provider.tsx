"use client"

import { useEffect, useState } from "react"
import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// This script runs before page render to prevent flash
const themeScript = `
  (function() {
    try {
      // Try to get the theme from localStorage
      const storedTheme = window.localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Logic to determine which theme to use
      let theme;
      if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark) || (!storedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
        theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        theme = 'light';
      }
      
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      // If there's an error (like localStorage is disabled), do nothing
      console.error('Error setting initial theme', e);
    }
  })();
`;

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Add script to head to set theme before any content renders
  useEffect(() => {
    // Only inject once
    if (!document.getElementById('theme-script')) {
      const script = document.createElement('script')
      script.id = 'theme-script'
      script.innerHTML = themeScript
      document.head.appendChild(script)
    }
    
    setMounted(true)
  }, [])

  // Use this approach to avoid layout shift during mounting
  if (!mounted) {
    // Return a placeholder with the same structure to avoid layout shift
    return (
      <div 
        className="contents"
        suppressHydrationWarning
      >
        {children}
      </div>
    )
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme} enableSystem={enableSystem} {...props}>
      {children}
    </NextThemesProvider>
  )
}
