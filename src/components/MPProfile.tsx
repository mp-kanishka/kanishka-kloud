import { MP } from "@/types";

interface MPProfileProps {
  mp: MP;
}

const MPProfile = ({ mp }: MPProfileProps) => {
  // Function to get party badge color
  const getPartyColor = (party?: string) => {
    if (!party) return "bg-primary/10 text-primary";
    
    switch (party.toLowerCase()) {
      case "labour":
      case "labour (co-op)":
        return "bg-[#E4003B]/10 text-[#E4003B]";
      case "conservative":
        return "bg-[#0087dc]/10 text-[#0087dc]";
      case "reform uk":
      case "reform":
        return "bg-[#00bed6]/10 text-[#00bed6]";
      case "liberal democrat":
      case "liberal democrats":
        return "bg-[#FAA61A]/10 text-[#FAA61A]";
      case "green":
      case "green party":
        return "bg-[#4BA562]/10 text-[#4BA562]";
      case "democratic unionist party":
      case "dup":
        return "bg-[#B84148]/10 text-[#B84148]";
      case "independent":
      case "independents":
        return "bg-[#8E9196]/10 text-[#8E9196]";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="mp-profile">
      <div className="flex items-center gap-4">
        {mp.imageUrl ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10 bg-white dark:bg-gray-800">
            <img 
              src={mp.imageUrl} 
              alt={mp.name}
              className="w-full h-full object-cover object-center"
              onError={e => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-2xl font-bold">
              {mp.name.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
        )}
        
        <div className="text-left">
          <h2 className="text-2xl font-heading font-medium">{mp.name}</h2>
          <div className="mt-1 flex items-center gap-3">
            {mp.party && (
              <span className={`text-sm px-2 py-1 rounded-full ${getPartyColor(mp.party)} font-medium inline-block`}>
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
