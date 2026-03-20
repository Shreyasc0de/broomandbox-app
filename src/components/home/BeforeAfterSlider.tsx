import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ beforeImage, afterImage }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        let clientX;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as React.MouseEvent | MouseEvent).clientX;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(newPosition);
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMove);
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] md:aspect-video rounded-[2rem] overflow-hidden select-none cursor-ew-resize group shadow-2xl"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
        >
            {/* After Image (Clean - Bottom layer) */}
            <img
                src={afterImage}
                alt="After cleaning"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            {/* Label */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-ink px-4 py-2 rounded-xl font-bold text-sm shadow-lg pointer-events-none z-10 transition-transform group-hover:scale-105">
                After
            </div>

            {/* Before Image (Dirty - Top layer, clipped) */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeImage}
                    alt="Before cleaning"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-ink/10 mix-blend-overlay"></div> {/* Slightly darken the before image for effect */}

                {/* Label */}
                <div className="absolute top-6 left-6 bg-ink/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg pointer-events-none transition-transform group-hover:scale-105">
                    Before
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center pointer-events-none transition-transform group-hover:scale-110">
                    <MoveHorizontal className="text-primary w-6 h-6" />
                </div>
            </div>

            {/* Interaction Hint (Disappears on hover/interaction) */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink/80 text-white px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-md transition-opacity duration-500 z-20 pointer-events-none ${isDragging ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'}`}>
                Drag to compare
            </div>
        </div>
    );
};

export default BeforeAfterSlider;
