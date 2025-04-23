
import React from "react";

// 3D, pulse, and animated glowing gradient for the attribution
const CreatorAttribution: React.FC = () => (
  <div
    className="
      fixed z-50 bottom-3 right-3
      select-none
      px-6 py-2 rounded-full
      bg-gradient-to-r from-purple-500 via-pink-400 to-indigo-400
      shadow-xl 
      text-white font-extrabold
      text-lg tracking-tight
      animate-float
      attribution-3d
    "
    style={{
      textShadow: "0 4px 16px #b09cff, 2px 2px 0 #2b175a, -2px 1px 0 #ff94e8",
      letterSpacing: "0.04em",
      border: "2px solid #ffffff40",
    }}
  >
    Created by <span className="inline-block animate-pulse-scale ml-2">Mr. Suraj Zalke❣️</span>
  </div>
);

export default CreatorAttribution;
