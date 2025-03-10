import { MP } from "@/types";
import { getPartyColor } from "@/utils/partyColors";

interface MPProfileProps {
  mp: MP;
}

const MPProfile = ({ mp }: MPProfileProps) => {
  // Function to get party badge color
  const getPartyBadgeColor = (party?: string) => {
    if (!party) return "bg-primary/10 text-primary";
    const color = getPartyColor(party);
    return `bg-[${color}]/10 text-[${color}]`;
  };

  return (
    <div className="mp-profile">
      <div className="flex items-center gap-4">
        {mp.imageUrl ? (
          <div className="relative w-28 h-28 aspect-square rounded-full overflow-hidden border-4 border-primary/10 bg-white dark:bg-gray-800">
            <img 
              src={mp.imageUrl} 
              alt={mp.name}
              className="w-full h-full object-cover object-[center_10%]"
              onError={e => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
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
              <span className={`text-sm px-2 py-1 rounded-full ${getPartyBadgeColor(mp.party)} font-medium inline-block`}>
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
