import React, { useState, useRef, useEffect } from 'react';

function Dropdown({ options, value, onChange, placeholder, width }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown" ref={dropdownRef} style={{ width: width || 'auto' }}>
      <div 
        className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <span className="dropdown-icon">▼</span>
      </div>
      
      {isOpen && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            {options.map((option, index) => (
              <li
                key={index}
                className={`dropdown-item ${option === value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))}
                   
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dropdown;