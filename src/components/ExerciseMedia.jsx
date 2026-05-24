import React, { useState, useEffect } from 'react';
import { Dumbbell, Activity, ShieldAlert, Loader2 } from 'lucide-react';

// A curated map of common exercises to open-source animated GIFs
// Sourced from various free fitness API resources
const GIF_MAP = {
  'squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
  'push up': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
  'pushup': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
  'pull up': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
  'pullup': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
  'deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
  'bench press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
  'lunges': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
  'plank': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif',
  'jumping jack': 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Jumping-jack.gif',
  'burpee': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Burpee.gif',
  'bicep curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif',
  'tricep extension': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif',
  'crunch': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
  'crunches': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Crunch.gif',
  'leg press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',
  'calf raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Calf-Raise.gif',
  'shoulder press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif'
};

const ExerciseMedia = ({ name, className = "w-16 h-16" }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setImgSrc(null);

    // Fuzzy matching
    const searchName = name.toLowerCase().trim();
    let foundUrl = null;

    for (const [key, url] of Object.entries(GIF_MAP)) {
      if (searchName.includes(key)) {
        foundUrl = url;
        break;
      }
    }

    if (foundUrl) {
      setImgSrc(foundUrl);
    } else {
      setLoading(false); // Fallback instantly if no match
    }
  }, [name]);

  if (!imgSrc) {
    return (
      <div className={`${className} bg-surfaceHighlight rounded-xl flex items-center justify-center shrink-0 border border-white/5`}>
        <Dumbbell className="w-1/2 h-1/2 text-textMuted opacity-50" />
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-xl overflow-hidden shrink-0 bg-white shadow-lg`}>
      {loading && (
        <div className="absolute inset-0 bg-surfaceHighlight flex items-center justify-center">
          <Loader2 className="w-1/2 h-1/2 text-accent animate-spin" />
        </div>
      )}
      {error ? (
        <div className="absolute inset-0 bg-surfaceHighlight flex items-center justify-center text-red-500">
          <ShieldAlert className="w-1/2 h-1/2 opacity-50" />
        </div>
      ) : (
        <img 
          src={`https://wsrv.nl/?url=${encodeURIComponent(imgSrc)}&output=webp&n=-1`} 
          alt={name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
};

export default ExerciseMedia;
