import React from 'react';

const DiamondPattern = ({ className = "" }: { className?: string }) => (
    <div className={`absolute pointer-events-none opacity-10 ${className}`}>
        <div className="grid grid-cols-4 gap-4 transform rotate-45 scale-150">
            {[...Array(16)].map((_, i) => (
                <div key={i} className="w-32 h-32 bg-primary rounded-2xl" />
            ))}
        </div>
    </div>
);

export default DiamondPattern;
