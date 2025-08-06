import React from 'react';

const HoneycombLoader = () => {
    // Base classes for each honeycomb cell, applying the custom shape, size, color, and animation.
    const cellBaseClasses =
        'honeycomb-cell absolute h-3 w-6 mt-1.5 bg-gray-100 animate-honeycomb';

    return (
        // The main container is sized to match the original CSS (24x24px).
        <div className="relative h-6 w-6">
            {/* Each cell uses the base classes and adds unique positioning and animation-delay
        via Tailwind's arbitrary value syntax `[...]`.
      */}
            <div className={`${cellBaseClasses} left-[-28px] top-0 [animation-delay:0s]`} />
            <div className={`${cellBaseClasses} left-[-14px] top-[22px] [animation-delay:0.1s]`} />
            <div className={`${cellBaseClasses} left-[14px] top-[22px] [animation-delay:0.2s]`} />
            <div className={`${cellBaseClasses} left-[28px] top-0 [animation-delay:0.3s]`} />
            <div className={`${cellBaseClasses} left-[14px] top-[-22px] [animation-delay:0.4s]`} />
            <div className={`${cellBaseClasses} left-[-14px] top-[-22px] [animation-delay:0.5s]`} />
            <div className={`${cellBaseClasses} left-0 top-0 [animation-delay:0.6s]`} />
        </div>
    );
};

export default HoneycombLoader;