import { MP } from "@/types";
import { getPartyColor } from "@/utils/partyColors";
import { useState, useEffect } from "react";

interface MPProfileProps {
  mp: MP;
}

const MPProfile = ({ mp }: MPProfileProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1000; // 1 second
  
  // Function to get party badge color
  const getPartyBadgeColor = (party?: string) => {
    if (!party) return { backgroundColor: "var(--primary)", color: "var(--primary)" };
    const color = getPartyColor(party);
    return {
      backgroundColor: `${color}1A`, // 1A is 10% opacity in hex
      color: color
    };
  };

  useEffect(() => {
    if (imageError && retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageError(false);
      }, RETRY_DELAY);
      return () => clearTimeout(timer);
    }
  }, [imageError, retryCount]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    if (retryCount >= MAX_RETRIES) {
      setImageError(true);
    } else {
      setRetryCount(prev => prev + 1);
    }
  };

  return (
    <div className="mp-profile">
      <div className="flex items-center gap-4">
        {mp.imageUrl && !imageError ? (
          <div className="relative w-28 h-28 aspect-square rounded-full overflow-hidden border-4 border-primary/10 bg-white dark:bg-gray-800">
            <img 
              src={mp.imageUrl} 
              alt={mp.name}
              className={`w-full h-full object-cover object-[center_10%] ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-28 w-28 aspect-square rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-2xl font-bold">
              {mp.name.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
        )}
        
        <div className="text-left">
          <h2 className="text-2xl font-heading font-medium">{mp.name}</h2>
          <div className="mt-1 flex items-center gap-3">
            {mp.party && (
              <span 
                className="text-sm px-2 py-1 rounded-full font-medium inline-block"
                style={getPartyBadgeColor(mp.party)}
              >
                {mp.party}
              </span>
            )}
            {mp.constituency && (
              <span className="text-muted-foreground">
                {mp.constituency}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPProfile;
