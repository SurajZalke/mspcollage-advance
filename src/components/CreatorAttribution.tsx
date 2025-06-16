
import React from "react";

const CreatorAttribution: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gradient-to-r from-indigo-500/30 to-purple-500/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white shadow-lg animate-pulse">
        <img src="/developer.png" alt="Mr Suraj Zalke" className="h-6 w-6 rounded-full inline-block mr-2" />
        Created by Mr Suraj Zalke❣️
      </div>
    </div>
  );
};

export default CreatorAttribution;
