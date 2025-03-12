import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextProps {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    accent: string;
    card: string;
    border: string;
  };
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // In this case, we're only implementing dark theme
  const isDark = true;
  
  // Colors based on your MAUI styles
  const colors = {
    background: '#0e0e0e', // off-black
    text: '#fefefe',       // off-white
    accent: '#D600AA',     // magenta
    card: '#141414',       // gray-950
    border: '#404040',     // gray-600
  };

  const toggleTheme = () => {
    // This function would typically toggle between light/dark
    // But since we're only implementing dark, it's a no-op
    console.log('Toggle theme not implemented - dark mode only');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};