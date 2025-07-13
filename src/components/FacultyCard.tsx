import React from 'react';

interface FacultyCardProps {
  subject: string;
  color: string;
  teachers: { name: string; img: string; experience: string }[];
  delay: number;
}

const FacultyCard: React.FC<FacultyCardProps> = ({
  subject,
  color,
  teachers,
  delay,
}) => {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 shadow-md animate-fade-in-up animation-delay-${delay}`}
    >
      <h4 className="text-xl font-bold mb-4">{subject}</h4>
      <div className="space-y-6">
        {teachers.map((t, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-full overflow-hidden border-2 border-${color}-400`}
            >
              <img
                src={`/${t.img}`}
                alt={t.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-gray-400">{t.experience}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyCard;