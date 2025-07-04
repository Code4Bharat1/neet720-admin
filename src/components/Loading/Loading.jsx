'use client';

import { useEffect, useState } from 'react';

const Loading = () => {
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Blue Circle */}
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      
      <div className="relative z-10 text-3xl font-bold flex items-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Loading
        <span >.</span>
        <span >.</span>
        <span >.</span>
      </div>
      
    </div>
  );
};

export default Loading;