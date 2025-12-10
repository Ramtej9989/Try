import { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  items: DropdownItem[];
  value?: string | number;
  placeholder?: string;
  onChange: (value: string | number) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ 
    items, 
    value, 
    placeholder = 'Select option', 
    onChange, 
    className,
    buttonClassName,
    menuClassName,
    disabled = false,
    label,
    error
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    // Find the selected item
    const selectedItem = items.find(item => item.value === value);
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div 
          ref={mergeRefs(dropdownRef, ref)} 
          className={cn("relative", className)}
        >
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              error ? "border-red-500 focus:ring-red-500" : "border-gray-300",
              buttonClassName
            )}
            disabled={disabled}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <span className={!selectedItem ? "text-gray-500" : ""}>
              {selectedItem ? selectedItem.label : placeholder}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isOpen && (
            <div 
              className={cn(
                "absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg",
                "border border-gray-200 py-1",
                menuClassName
              )}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              {items.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onChange(item.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-sm text-left",
                    item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    item.value === value ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';

// Helper to merge refs
function mergeRefs<T>(...refs: Array<React.ForwardedRef<T> | React.MutableRefObject<T> | null>) {
  return (instance: T): void => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    }
  };
}

export { Dropdown };
