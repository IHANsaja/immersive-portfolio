"use client";

import React, { memo } from "react";
import InteractiveDotMatrix from "./InteractiveDotMatrix";

/**
 * A single shared dot matrix background that renders once at the page level.
 * This replaces 4 separate InteractiveDotMatrix instances (one per section),
 * reducing WebGL context usage from 4 to 1.
 */
const DotMatrixBackground = memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
            <InteractiveDotMatrix opacity={0.35} spacing={20} dotRadius={0.8} influenceRadius={160} />
        </div>
    );
});

DotMatrixBackground.displayName = 'DotMatrixBackground';

export default DotMatrixBackground;
