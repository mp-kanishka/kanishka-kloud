import { useEffect, useRef, useState } from "react";
import { WordCloudItem } from "@/types";
import { checkOverlap, calculateFontSize } from "@/utils/wordCloudUtils";

interface WordCloudProps {
  words: WordCloudItem[];
  loading: boolean;
}

const WordCloud = ({ words, loading }: WordCloudProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedWords, setRenderedWords] = useState<(WordCloudItem & { x: number; y: number; fontSize: number })[]>([]);
  const [valueRange, setValueRange] = useState<{ minValue: number; maxValue: number }>({ minValue: 0, maxValue: 0 });
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastScale, setLastScale] = useState(1);
  const animationFrameRef = useRef<number>();
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkMobileAndOrientation = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkMobileAndOrientation();
    window.addEventListener('resize', checkMobileAndOrientation);
    return () => window.removeEventListener('resize', checkMobileAndOrientation);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile && e.touches.length === 2) {
      // Pinch to zoom (desktop only)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastScale(distance);
    } else if (e.touches.length === 1) {
      // Pan
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile && e.touches.length === 2) {
      // Pinch to zoom (desktop only)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const newScale = Math.min(Math.max(transform.scale * (distance / lastScale), 0.5), 3);
      setTransform(prev => ({ ...prev, scale: newScale }));
      setLastScale(distance);
    } else if (e.touches.length === 1 && isDragging) {
      // Pan - on mobile, only allow horizontal movement
      const newX = e.touches[0].clientX - startPos.x;
      const newY = isMobile ? transform.y : e.touches[0].clientY - startPos.y;
      setTransform(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const calculateWordPositions = () => {
    if (!words.length || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = isMobile 
      ? (isLandscape ? 600 : Math.max(800, window.innerWidth * 1.5))
      : container.clientWidth;
    const containerHeight = container.clientHeight;
    const padding = isMobile ? 48 : 32; // Increased padding for mobile
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const values = words.map((word) => word.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    setValueRange({ minValue, maxValue });

    const placedWords: (WordCloudItem & { x: number; y: number; fontSize: number })[] = [];
    const maxAttempts = 2000;
    const sortedWords = [...words].sort((a, b) => b.value - a.value);
    const significanceThreshold = minValue + (maxValue - minValue) * 0.3;

    sortedWords.forEach((word) => {
      // Adjust font size for mobile and landscape
      const baseFontSize = calculateFontSize(word.value, minValue, maxValue);
      let fontSize = baseFontSize;
      if (isMobile) {
        fontSize = isLandscape ? baseFontSize * 0.35 : baseFontSize * 0.5; // More reduction in landscape
      } else {
        fontSize = baseFontSize * 0.6; // Reduce desktop font size
      }
      
      const wordWidth = word.text.length * fontSize * 0.6;
      const wordHeight = fontSize * 1.2;

      let placed = false;
      let attempts = 0;
      let x = 0;
      let y = 0;

      const isImportantWord = word.value > significanceThreshold;
      const startingRadius = isImportantWord ? 0 : Math.max(10, fontSize * 0.3);
      const radiusIncrement = isImportantWord ? 0.5 : 1.2;
      let baseAngle = Math.random() * 2 * Math.PI;
      
      while (!placed && attempts < maxAttempts) {
        const spiralAngle = baseAngle + attempts * 0.05;
        const radius = startingRadius + attempts * radiusIncrement;
        
        const cosAngle = Math.cos(spiralAngle);
        const sinAngle = Math.sin(spiralAngle);
        const cornerFactor = Math.min(Math.abs(cosAngle), Math.abs(sinAngle));
        
        const adjustedRadius = radius * (1 - cornerFactor * 0.3);
        
        x = centerX + cosAngle * adjustedRadius - wordWidth / 2;
        y = centerY + sinAngle * adjustedRadius - wordHeight / 2;

        if (
          x >= padding &&
          y >= padding &&
          x + wordWidth <= containerWidth - padding &&
          y + wordHeight <= containerHeight - padding
        ) {
          let collision = false;
          
          for (const placedWord of placedWords) {
            const placedWordWidth = placedWord.text.length * placedWord.fontSize * 0.6;
            const placedWordHeight = placedWord.fontSize * 1.2;
            
            if (
              checkOverlap(
                x, y, wordWidth, wordHeight,
                placedWord.x, placedWord.y, placedWordWidth, placedWordHeight,
                isImportantWord ? 0 : (1 - cornerFactor * 0.5)
              )
            ) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            placed = true;
          }
        }

        if (attempts % 300 === 0) {
          baseAngle = Math.random() * 2 * Math.PI;
        }

        attempts++;
      }

      if (placed) {
        placedWords.push({
          ...word,
          x,
          y,
          fontSize,
        });
      }
    });

    setRenderedWords(placedWords);
  };

  useEffect(() => {
    calculateWordPositions();
  }, [words, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      if (!isMobile) {
        calculateWordPositions();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [words, isMobile]);

  if (loading) {
    return (
      <div className="word-cloud-container glass flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
          <p className="text-muted-foreground">Analysing speeches...</p>
        </div>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="word-cloud-container glass flex items-center justify-center">
        <p className="text-muted-foreground text-lg">
          Search for an MP to generate their word cloud
        </p>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className={`word-cloud-container glass relative ${isMobile ? 'overflow-x-auto overflow-y-hidden max-w-none' : 'md:overflow-hidden'} touch-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className={`absolute inset-0 transition-transform duration-100 md:w-full md:h-full md:left-0 md:top-0 ${
          isMobile 
            ? isLandscape 
              ? 'w-[100vw] h-[100vh]' 
              : 'w-[100vw] h-[100vh]'
            : 'w-[150%] h-[150%] -left-[25%] -top-[25%]'
        }`}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${isMobile ? 1 : transform.scale})`,
          transformOrigin: 'center center',
          touchAction: 'none'
        }}
      >
        {renderedWords.map((word, index) => {
          const significance = (word.value - valueRange.minValue) / (valueRange.maxValue - valueRange.minValue);
          const opacity = 0.7 + significance * 0.3;
          
          return (
            <div
              key={`${word.text}-${index}`}
              className="word-cloud-word absolute transition-all duration-500 hover:scale-110"
              style={{
                left: `${word.x}px`,
                top: `${word.y}px`,
                fontSize: `${word.fontSize}px`,
                color: word.color || '#000',
                opacity: 0,
                fontWeight: significance > 0.5 ? 'bold' : 'normal',
                textShadow: significance > 0.7 ? '0 0 1px rgba(0,0,0,0.2)' : 'none',
                animation: `fade-in 0.5s ease-out ${index * 0.02}s forwards`,
              }}
            >
              {word.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WordCloud;
