import { useState, useEffect, useCallback, useRef } from "react";
import { Search, RotateCw } from "lucide-react";
import { MP } from "@/types";
import { searchMP } from "@/services/hansardApi";
import { getPartyColor } from "@/utils/partyColors";
import { getMPImage } from "@/utils/imageImports";
import mpPhotoData from '@/data/mp_photo_data.json';

interface SearchBoxProps {
  onSelectMP: (mp: MP) => void;
  isLoading: boolean;
  isCollapsed?: boolean;
}

const SearchBox = ({
  onSelectMP,
  isLoading,
  isCollapsed = false
}: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MP[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [shouldClearOnBackspace, setShouldClearOnBackspace] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to get party text color
  const getPartyTextColor = (party?: string) => {
    if (!party) return { color: "var(--primary)" };
    const color = getPartyColor(party);
    return { color };
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    setSearching(true);
    try {
      const mps = await searchMP(searchQuery);
      setResults(mps);
      if (!isSelectionMode) {
        setShowResults(true);
      }
    } catch (error) {
      setResults([]);
      setShowResults(false);
    } finally {
      setSearching(false);
    }
  }, [isSelectionMode]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  // Document click handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (results.length === 1 && showResults) {
        handleSelectMP(results[0]);
      } else {
        handleSearch(query);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && shouldClearOnBackspace) {
      e.preventDefault();
      setQuery("");
      setShouldClearOnBackspace(false);
      setShowResults(false);
      setIsSelectionMode(false);
    }
  };

  const handleSelectMP = (mp: MP) => {
    setShowResults(false);
    setQuery(mp.name);
    setIsSelectionMode(true);
    onSelectMP(mp);
  };

  const handleFocus = () => {
    setShouldClearOnBackspace(true);
    if (query.trim() && !isSelectionMode) {
      setShowResults(true);
    }
  };

  const getMPImageUrl = (mp: MP) => {
    if (!mp.imageUrl) return null;
    const imageUrl = getMPImage(mp.name);
    if (!imageUrl) {
      console.warn(`No image found for MP: ${mp.name}`);
      return null;
    }
    return imageUrl;
  };

  return <div className="mp-search-container" ref={containerRef}>
      <div className="relative">
        <input 
          ref={inputRef}
          type="text" 
          value={query} 
          onChange={e => {
            setQuery(e.target.value);
            if (isSelectionMode) {
              setIsSelectionMode(false);
            }
          }}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search by name, constituency, or party" 
          className={`w-full h-12 px-4 py-2 pl-4 pr-12 text-base border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none transition-all duration-300
            ${isCollapsed ? 'md:w-full w-12 pl-12' : 'w-full'}`}
          disabled={isLoading || searching} 
          aria-label="Search for an MP, constituency, or party" 
        />
        <button 
          onClick={() => handleSearch(query)} 
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-md bg-[#E4003B] text-white hover:bg-[#E4003B]/90 transition-colors
            ${isCollapsed ? 'md:right-3 right-1' : 'right-3'}`}
          disabled={isLoading || searching} 
          aria-label="Search"
        >
          {searching ? <RotateCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {showResults && results.length > 0 && !isSelectionMode && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 animate-fade-in">
          <ul className="py-2 max-h-80 overflow-y-auto">
            {results.map(mp => (
              <li 
                key={mp.id} 
                className="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors" 
                onClick={() => handleSelectMP(mp)}
              >
                <div className="flex items-center">
                  {mp.imageUrl && (
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 dark:bg-gray-700">
                      <img 
                        src={getMPImageUrl(mp)} 
                        alt={mp.name} 
                        className="h-full w-full object-cover"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.classList.add("fallback-avatar");
                            // Add initials as fallback
                            const initials = mp.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .toUpperCase();
                            parent.textContent = initials;
                          }
                        }} 
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{mp.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {mp.party && <span style={getPartyTextColor(mp.party)}>{mp.party}</span>}
                      {mp.constituency && mp.party && " · "}
                      {mp.constituency}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>;
};

export default SearchBox;
