"use client";

import React, { memo } from "react";

/**
 * A single shared background that renders once at the page level.
 */
const DotMatrixBackground = memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none hidden md:block">
        </div>
    );
});

DotMatrixBackground.displayName = 'DotMatrixBackground';

export default DotMatrixBackground;
