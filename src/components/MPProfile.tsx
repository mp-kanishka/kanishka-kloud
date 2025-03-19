import { MP } from "@/types";
import { getPartyColor } from "@/utils/partyColors";
import { getMPImage } from "@/utils/imageImports";
import { useState } from "react";

interface MPProfileProps {
  mp: MP;
}

const MPProfile = ({ mp }: MPProfileProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Function to get party badge color
  const getPartyBadgeColor = (party?: string) => {
    if (!party) return { backgroundColor: "var(--primary)", color: "var(--primary)" };
    const color = getPartyColor(party);
    return {
      backgroundColor: `${color}1A`, // 1A is 10% opacity in hex
      color: color
    };
  };

  const imageUrl = getMPImage(mp.name);

  return (
    <div className="mp-profile">
      <div className="flex items-center gap-4">
        {imageUrl && !imageError ? (
          <div className="relative w-28 h-28 aspect-square rounded-full overflow-hidden border-4 border-primary/10 bg-white dark:bg-gray-800">
            <img 
              src={imageUrl} 
              alt={mp.name}
              className="w-full h-full object-cover object-[center_10%]"
              onError={() => setImageError(true)}
            />
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
