(function() {
  try {
    // Try to get the theme from localStorage
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Logic to determine which theme to use - prioritize dark mode
    let theme;
    if (storedTheme === 'dark' || (storedTheme === 'system' && systemPrefersDark) || !storedTheme || (!storedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      theme = 'light';
    }
    
    localStorage.setItem('theme', theme);
  } catch (e) {
    // If there's an error, default to dark mode
    document.documentElement.classList.add('dark');
    console.error('Error setting initial theme', e);
  }
})(); 