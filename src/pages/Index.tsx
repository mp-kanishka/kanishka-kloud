import { useState } from "react";
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
      <div className="w-full max-w-4xl mx-auto px-4">
        <header className={`text-center transition-all duration-500 ${selectedMP ? 'mb-2 md:mb-4' : 'fixed inset-x-0 top-[40%] z-10'}`}>
          <h1 className="text-4xl md:text-5xl font-heading font-medium mb-1">Westminster Word Cloud</h1>
        </header>
      </div>

      <div className={`w-full max-w-2xl mx-auto px-4 transition-all duration-500 ${selectedMP ? 'mb-8' : 'flex-1 flex items-center justify-center'}`}>
        <div className={`w-full ${selectedMP ? 'animate-slide-up' : ''}`}>
          <SearchBox onSelectMP={handleSelectMP} isLoading={loading} isCollapsed={!!selectedMP} />
        </div>
      </div>

      {selectedMP && (
        <div className="w-full animate-fade-in">
          <div className="px-4">
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
          
          {wordCloudData.length > 0 && (
            <div className="hidden md:block mt-8 text-center text-sm text-muted-foreground animate-fade-in px-4">
              <p>
                Word size indicates frequency in parliamentary speeches. Common words and parliamentary terms have been filtered out.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;