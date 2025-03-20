import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Info, Download, Twitter } from "lucide-react";
import SearchBox from "@/components/SearchBox";
import MPProfile from "@/components/MPProfile";
import WordCloud, { WordCloudRef } from "@/components/WordCloud";
import { MP, WordCloudItem } from "@/types";
import { getMPSpeeches } from "@/services/hansardApi";
import { getWordCloudItems } from "@/utils/wordCloudUtils";

const Index = () => {
  const wordCloudRef = useRef<WordCloudRef>(null);
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

  const handleSaveImage = async () => {
    if (wordCloudRef.current) {
      await wordCloudRef.current.saveImage();
    }
  };

  const handleShareToTwitter = async () => {
    if (wordCloudRef.current) {
      try {
        const imageBlob = await wordCloudRef.current.getImageBlob();
        if (!imageBlob) return;

        // Create tweet text
        const tweetText = selectedMP 
          ? `Check out ${selectedMP.twitter_handle ? `@${selectedMP.twitter_handle}` : selectedMP.name}'s most frequently used words in Parliament! #KanishkaKloud`
          : "Check out this MP's word cloud from Parliament! #KanishkaKloud";

        try {
          // Convert blob to ClipboardItem
          const clipboardItem = new ClipboardItem({
            'image/png': imageBlob
          });
          
          // Copy image to clipboard
          await navigator.clipboard.write([clipboardItem]);
          
          // Show success message
          alert('Image copied to clipboard! You can now paste it into your tweet.');
          
          // Open Twitter's web intent URL with the tweet text
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
          window.open(twitterUrl, '_blank', 'width=550,height=420');
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError);
          // Fallback: just open Twitter with text if clipboard fails
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
          window.open(twitterUrl, '_blank', 'width=550,height=420');
        }
      } catch (error) {
        console.error('Error sharing to Twitter:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-4 md:py-8">
      <div className="fixed top-4 right-4 z-20">
        <h1 className="text-4xl md:text-5xl max-md:landscape:text-3xl font-heading font-medium leading-tight text-right">
          <div>Kanishka</div>
          <div>Kloud</div>
        </h1>
      </div>

      {!selectedMP && (
        <div className="fixed inset-0 flex flex-col items-center justify-center max-md:landscape:justify-start max-md:landscape:pt-4 z-10" style={{ pointerEvents: 'none' }}>
          <div className="w-full max-w-2xl mx-auto px-4 mt-44 md:mt-0" style={{ pointerEvents: 'auto' }}>
            <SearchBox onSelectMP={handleSelectMP} isLoading={loading} isCollapsed={false} />
          </div>
        </div>
      )}

      {selectedMP && (
        <>
          <div className="w-full max-w-2xl mx-auto px-4 mb-2 md:mb-4 mt-44 md:mt-24">
            <div className="animate-slide-up">
              <SearchBox onSelectMP={handleSelectMP} isLoading={loading} isCollapsed={true} />
            </div>
          </div>

          <div className="w-full animate-fade-in">
            <div className="px-4 -mb-1 md:-mb-2">
              <MPProfile mp={selectedMP} />
            </div>
            
            {noSpeechesMessage ? (
              <div className="word-cloud-container glass flex items-center justify-center">
                <p className="text-muted-foreground text-lg text-center p-8">
                  {noSpeechesMessage}
                </p>
              </div>
            ) : (
              <WordCloud ref={wordCloudRef} words={wordCloudData} loading={loading} />
            )}
          </div>
        </>
      )}

      <Link
        to="/about"
        className="fixed left-4 bottom-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-30"
        aria-label="About this site"
      >
        <Info className="w-5 h-5 text-gray-600" />
      </Link>

      {wordCloudData.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-2">
          <button
            onClick={handleShareToTwitter}
            className="p-2.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-300"
            aria-label="Share on Twitter"
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={handleSaveImage}
            className="p-2.5 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-300"
            aria-label="Download word cloud"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;