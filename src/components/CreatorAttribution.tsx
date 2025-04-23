
import React from "react";

// Standard animated gradient attribution (no 3D effects)
const CreatorAttribution: React.FC = () => (
  <div
    className="
      fixed z-50 bottom-3 right-3
      select-none
      px-6 py-2 rounded-full
      bg-gradient-to-r from-purple-500 via-pink-400 to-indigo-400
      shadow-md 
      text-white font-bold
      text-lg
      animate-pulse-scale
    "
    style={{
      border: "2px solid #ffffff40",
    }}
  >
    Created by <span className="inline-block animate-pulse ml-2">Mr. Suraj Zalke❣️</span>
  </div>
);

export default CreatorAttribution;
