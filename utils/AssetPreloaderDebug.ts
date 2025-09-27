// Debug utility for AssetPreloader
export const debugAssetPreloader = () => {
    if (typeof window !== 'undefined') {
        console.log('AssetPreloader Debug Info:');
        console.log('- Available assets:', {
            images: document.querySelectorAll('img').length,
            videos: document.querySelectorAll('video').length,
            audio: document.querySelectorAll('audio').length,
        });
    }
};

// Helper to check if an asset is loaded
export const isAssetLoaded = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};
