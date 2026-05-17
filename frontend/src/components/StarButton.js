import React, { useEffect, useState } from 'react';

function StarButton({ starred: initialStarred = false, onToggle }) {
  const [starred, setStarred] = useState(initialStarred);

  useEffect(() => {
    setStarred(initialStarred);
  }, [initialStarred]);

  const handleClick = (e) => {
    e.stopPropagation();
    const newState = !starred;
    setStarred(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div className="star-button" onClick={handleClick}>
      <svg 
        width="20" 
        height="19" 
        viewBox="0 0 22 20" 
        fill={starred ? '#FFD700' : 'none'} 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M11 0L13.47 7.18L21 7.18L14.77 11.64L17.24 18.82L11 14.36L4.76 18.82L7.23 11.64L1 7.18L8.53 7.18L11 0Z" 
          fill={starred ? '#FFD700' : 'none'} 
          stroke="#000000" 
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default StarButton;
