import { useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import SearchBox from "@/components/SearchBox";
import MPProfile from "@/components/MPProfile";
import WordCloud from "@/components/WordCloud";
import { MP, WordCloudItem } from "@/types";
import { getMPSpeeches } from "@/services/hansardApi";
import { getWordCloudItems } from "@/utils/wordCloudUtils";

const Index = () => {
  const [selectedMP, setSelectedMP] = useState<MP | null>(null);
  const [wordCloudData, setWordCloudData] = useState<WordCloudItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [noSpeechesMessage, setNoSpeechesMessage] = useState<string | null>(null);

  const handleSelectMP = async (mp: MP) => {
    setSelectedMP(mp);
    setLoading(true);
    setWordCloudData([]);
    setNoSpeechesMessage(null);

    try {
      const speeches = await getMPSpeeches(mp.id);
      
      if (speeches.items.length === 1 && speeches.items[0].text?.includes("hasn't spoken in the Commons")) {
        setNoSpeechesMessage(speeches.items[0].text);
        return;
      }

      const wordCloudItems = speeches.items
        .filter(item => typeof item.text === 'string' && item.text.length > 0)
        .map(item => ({
          text: item.text as string,
          value: (item as any).value || 1,
          color: undefined
        }));

      setWordCloudData(getWordCloudItems(wordCloudItems, 100, mp.party));
    } catch (error) {
      console.error("Error generating word cloud:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-4 md:py-8">
      {!selectedMP && (
        <div className="fixed inset-0 flex flex-col items-center justify-center max-md:landscape:justify-start max-md:landscape:pt-4 z-10">
          <div className="w-full max-w-4xl mx-auto px-4">
            <header className="text-center mb-8 max-md:landscape:mb-4">
              <h1 className="text-4xl md:text-5xl max-md:landscape:text-3xl font-heading font-medium">Westminster Word Cloud</h1>
            </header>
          </div>

          <div className="w-full max-w-2xl mx-auto px-4">
            <SearchBox onSelectMP={handleSelectMP} isLoading={loading} isCollapsed={false} />
          </div>
        </div>
      )}

      {selectedMP && (
        <>
          <div className="w-full max-w-4xl mx-auto px-4">
            <header className="text-center mb-2 md:mb-4">
              <h1 className="text-4xl md:text-5xl font-heading font-medium">Westminster Word Cloud</h1>
            </header>
          </div>

          <div className="w-full max-w-2xl mx-auto px-4 mb-8">
            <div className="animate-slide-up">
              <SearchBox onSelectMP={handleSelectMP} isLoading={loading} isCollapsed={true} />
            </div>
          </div>

          <div className="w-full animate-fade-in">
            <div className="px-4 -mb-4">
              <MPProfile mp={selectedMP} />
            </div>
            
            {noSpeechesMessage ? (
              <div className="word-cloud-container glass flex items-center justify-center">
                <p className="text-muted-foreground text-lg text-center p-8">
                  {noSpeechesMessage}
                </p>
              </div>
            ) : (
              <WordCloud words={wordCloudData} loading={loading} />
            )}
          </div>
        </>
      )}

      <Link
        to="/about"
        className="fixed left-4 bottom-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="About this site"
      >
        <Info className="w-5 h-5 text-gray-600" />
      </Link>
    </div>
  );
};

export default Index;