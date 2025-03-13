import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { WordCloudItem } from "@/types";
import { checkOverlap, calculateFontSize } from "@/utils/wordCloudUtils";
import { Download } from "lucide-react";
import html2canvas from 'html2canvas';

interface WordCloudProps {
  words: WordCloudItem[];
  loading: boolean;
}

export interface WordCloudRef {
  saveImage: () => Promise<void>;
  getImageBlob: () => Promise<Blob | null>;
}

const WordCloud = forwardRef<WordCloudRef, WordCloudProps>(({ words, loading }, ref) => {
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

  const handleSaveImage = async () => {
    if (!containerRef.current) return;

    try {
      const blob = await generateWordCloudImage();
      if (!blob) return;

      // Get MP name for the filename
      const mpName = document.querySelector('.mp-profile h2')?.textContent || 'unknown-mp';
      const sanitizedMpName = mpName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/[^A-Za-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cloud-${sanitizedMpName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const generateWordCloudImage = async (): Promise<Blob | null> => {
    if (!containerRef.current) return null;

    try {
      // Create a temporary canvas with MacBook Pro 13-inch M2 resolution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Set dimensions to match MacBook Pro 13-inch M2 resolution
      const width = 2560;  // MacBook Pro 13-inch M2 width
      const height = 1600; // MacBook Pro 13-inch M2 height
      canvas.width = width;
      canvas.height = height;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Create a temporary container for the word cloud
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = `${width}px`;
      tempContainer.style.height = `${height}px`;
      tempContainer.style.background = '#ffffff';
      document.body.appendChild(tempContainer);

      // Create a new div for the word cloud with proper styling
      const wordCloudDiv = document.createElement('div');
      wordCloudDiv.style.position = 'absolute';
      wordCloudDiv.style.width = '100%';
      wordCloudDiv.style.height = '100%';
      wordCloudDiv.style.display = 'flex';
      wordCloudDiv.style.alignItems = 'center';
      wordCloudDiv.style.justifyContent = 'center';
      tempContainer.appendChild(wordCloudDiv);

      // Calculate word positions specifically for the image generation
      const calculateImageWordPositions = () => {
        const sortedWords = [...words].sort((a, b) => b.value - a.value);
        const values = words.map((word) => word.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const significanceThreshold = minValue + (maxValue - maxValue) * 0.3;

        const placedWords: Array<{ word: WordCloudItem; x: number; y: number; fontSize: number }> = [];
        const placedRects: Array<{ x: number; y: number; width: number; height: number }> = [];

        // Calculate oval parameters for the new resolution
        const centerX = width / 2;
        const centerY = height / 2;
        const ovalRadiusX = width * 0.47;
        const ovalRadiusY = height * 0.37;

        // Helper function to check if a rectangle overlaps with existing ones
        const checkOverlap = (rect: { x: number; y: number; width: number; height: number }) => {
          return placedRects.some(placed => {
            const padding = Math.min(12, rect.width * 0.12);
            return !(
              rect.x + rect.width + padding < placed.x ||
              rect.x > placed.x + placed.width + padding ||
              rect.y + rect.height + padding < placed.y ||
              rect.y > placed.y + placed.height + padding
            );
          });
        };

        // Function to check if a point is within the oval boundary
        const isWithinOvalBoundary = (x: number, y: number, wordWidth: number, wordHeight: number) => {
          const corners = [
            { x: x - wordWidth/2, y: y - wordHeight/2 },
            { x: x + wordWidth/2, y: y - wordHeight/2 },
            { x: x - wordWidth/2, y: y + wordHeight/2 },
            { x: x + wordWidth/2, y: y + wordHeight/2 }
          ];

          const safetyMargin = 0.98;

          return corners.every(corner => {
            const normalizedX = (corner.x - centerX) / (ovalRadiusX * safetyMargin);
            const normalizedY = (corner.y - centerY) / (ovalRadiusY * safetyMargin);
            return (normalizedX * normalizedX + normalizedY * normalizedY) <= 1;
          });
        };

        // Function to check if a word is away from edges with proper padding
        const isAwayFromEdges = (rect: { x: number; y: number; width: number; height: number }) => {
          const edgePadding = 35;
          return (
            rect.x >= edgePadding &&
            rect.y >= edgePadding &&
            rect.x + rect.width <= width - edgePadding &&
            rect.y + rect.height <= height - edgePadding
          );
        };

        sortedWords.forEach((word) => {
          // Use consistent font size calculation for image generation
          const baseFontSize = calculateFontSize(word.value, minValue, maxValue);
          const fontSize = baseFontSize * (width / 1600); // Scale font size based on target width
          const wordWidth = word.text.length * fontSize * 0.6;
          const wordHeight = fontSize * 1.2;

          let placed = false;
          let attempts = 0;
          const maxAttempts = 300; // Increased from 200
          let finalX = 0;
          let finalY = 0;
          let spiralAngle = Math.random() * Math.PI * 2;
          let spiralRadius = 0;

          while (!placed && attempts < maxAttempts) {
            spiralRadius = (attempts / maxAttempts) * Math.max(ovalRadiusX, ovalRadiusY);
            spiralAngle += Math.PI / 2.2;

            const x = centerX + Math.cos(spiralAngle) * spiralRadius;
            const y = centerY + Math.sin(spiralAngle) * spiralRadius;

            const rect = {
              x: x - wordWidth / 2,
              y: y - wordHeight / 2,
              width: wordWidth,
              height: wordHeight
            };

            // Adjust padding based on word size
            const basePadding = 35;
            const sizeFactor = Math.min(1, wordWidth / 200); // Normalize word size
            const adjustedPadding = basePadding * (1 - sizeFactor * 0.3); // Reduce padding for larger words

            if (isWithinOvalBoundary(x, y, wordWidth, wordHeight) && 
                isAwayFromEdges(rect) && 
                !checkOverlap(rect)) {
              placed = true;
              finalX = x;
              finalY = y;
              placedRects.push(rect);
            }

            attempts++;
          }

          if (placed) {
            placedWords.push({ word, x: finalX, y: finalY, fontSize });
          }
        });

        return placedWords;
      };

      // Generate word positions for the image
      const imageWords = calculateImageWordPositions();

      // Render words in the temporary container
      imageWords.forEach(({ word, x, y, fontSize }) => {
        const wordElement = document.createElement('div');
        const significance = (word.value - valueRange.minValue) / (valueRange.maxValue - valueRange.minValue);
        
        wordElement.style.position = 'absolute';
        wordElement.style.left = `${x}px`;
        wordElement.style.top = `${y}px`;
        wordElement.style.fontSize = `${fontSize}px`;
        wordElement.style.fontFamily = '"League Spartan", sans-serif';
        wordElement.style.color = word.color || '#000';
        wordElement.style.fontWeight = significance > 0.5 ? 'bold' : '500';
        wordElement.style.opacity = '1';
        wordElement.style.transform = 'translate(-50%, -50%)';
        wordElement.textContent = word.text;
        
        wordCloudDiv.appendChild(wordElement);
      });

      // Wait for fonts to load and elements to render
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert word cloud to image with higher scale for better quality
      const data = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('div') as HTMLElement;
          if (clonedContainer) {
            clonedContainer.style.transform = 'none';
          }
        }
      });

      // Clean up temporary elements
      document.body.removeChild(tempContainer);

      // Draw the word cloud onto our canvas
      ctx.drawImage(data, 0, 0, width, height);

      // Add MP details at the bottom
      const mpName = document.querySelector('.mp-profile h2')?.textContent || 'unknown-mp';

      // Add a subtle separator line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, height - 120);
      ctx.lineTo(width - 60, height - 120);
      ctx.stroke();

      // Add MP details with party color
      ctx.font = 'bold 48px "League Spartan"';
      ctx.fillStyle = '#000';
      ctx.fillText(mpName, 60, height - 70);

      // Add party and constituency
      ctx.font = '32px "League Spartan"';
      
      // Draw party badge
      const mpParty = document.querySelector('.mp-profile .rounded-full')?.textContent;
      if (mpParty) {
        const partyWidth = ctx.measureText(mpParty).width + 32;
        ctx.fillStyle = mpParty ? '#000' : '#666';
        ctx.beginPath();
        ctx.roundRect(60, height - 50, partyWidth, 48, 24);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.fillText(mpParty, 76, height - 20);
      }

      // Add constituency
      const mpConstituency = document.querySelector('.mp-profile .text-muted-foreground')?.textContent;
      if (mpConstituency) {
        ctx.fillStyle = '#666';
        ctx.fillText(mpConstituency, mpParty ? 60 + ctx.measureText(mpParty).width + 80 : 60, height - 20);
      }

      // Add watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.font = 'bold 60px "League Spartan"';
      const watermarkLine1 = 'Kanishka';
      const watermarkLine2 = 'Kloud';
      const watermarkWidth1 = ctx.measureText(watermarkLine1).width;
      const watermarkWidth2 = ctx.measureText(watermarkLine2).width;
      const padding = 40;
      ctx.fillText(watermarkLine1, width - watermarkWidth1 - padding, padding + 30);
      ctx.fillText(watermarkLine2, width - watermarkWidth2 - padding, padding + 100);

      // Convert to blob and return
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 1.0);
      });

    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  useImperativeHandle(ref, () => ({
    saveImage: handleSaveImage,
    getImageBlob: generateWordCloudImage
  }));

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
    <div className="relative">
      <div 
        ref={containerRef} 
        className={`word-cloud-container glass relative ${isMobile ? 'overflow-x-auto overflow-y-hidden max-w-none' : 'md:overflow-hidden'} touch-none`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`word-cloud-content absolute inset-0 transition-transform duration-100 md:w-full md:h-full md:left-0 md:top-0 ${
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
    </div>
  );
});

export default WordCloud;