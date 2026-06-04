import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Chuyển Light Mode' : 'Chuyển Dark Mode'}
      className={cn(
        "w-8 h-8 rounded flex items-center justify-center border transition-all duration-200",
        "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
        className
      )}
    >
      {theme === 'dark'
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}