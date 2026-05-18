export interface AssetItem {
    url: string;
    type: 'image' | 'video' | 'audio' | 'model' | 'spline';
    name: string;
    priority?: 'critical' | 'normal' | 'low';
}

export interface LoadingProgress {
    loaded: number;
    total: number;
    percentage: number;
    currentAsset: string;
    stage: 'images' | 'videos' | 'audio' | 'models' | 'spline' | 'complete';
}

export class AssetPreloader {
    private assets: AssetItem[] = [];
    private onProgress?: (progress: LoadingProgress) => void;
    private onComplete?: () => void;

    constructor() {
        this.initializeAssets();
    }

    private initializeAssets() {
        // Critical images for hero section (load first)
        const criticalImages = [
            '/background.png',
            '/hero_section_backgroun_mobile.png',
            '/logo.png',
            '/backgrounds/clouds.png',
            '/svg/clickToEnter.svg',
        ];

        // Non-critical images (load later)
        const images = [
            '/cinecLogo.png',
            '/DSlogo.png',
            '/PlanetRocks.png',
            '/images/bus.jpg',
            '/images/ecovibe.jpg',
            '/images/fome.jpg',
            '/images/zenofy.jpg',
            '/svg/border.svg',
            '/svg/card.svg',
            '/svg/cloud.svg',
            '/svg/github.svg',
            '/svg/gmail.svg',
            '/svg/linkedin.svg',
            '/svg/phone.svg',
            '/svg/whatsapp.svg',
            '/svg/aws.svg',
            '/svg/docker.svg',
            '/svg/expressjs.svg',
            '/svg/firebase.svg',
            '/svg/framer.svg',
            '/svg/gsap.svg',
            '/svg/html.svg',
            '/svg/illustrator.svg',
            '/svg/java.svg',
            '/svg/langchain.svg',
            '/svg/mongodb.svg',
            '/svg/mysql.svg',
            '/svg/n8n.svg',
            '/svg/nextjs.svg',
            '/svg/nodejs.svg',
            '/svg/photoshop.svg',
            '/svg/php.svg',
            '/svg/postgresql.svg',
            '/svg/python.svg',
            '/svg/react.svg',
            '/svg/supabase.svg',
            '/svg/tailwind.svg',
            '/svg/threejs.svg',
            '/svg/typescript.svg',
            '/svg/Anime1.svg',
            '/svg/appearlines.svg',
            '/svg/circ1.svg',
            '/svg/circ2.svg',
            '/svg/circ3.svg',
            '/svg/circ4.svg',
            '/svg/circ5.svg',
        ];

        // Videos
        const videos = [
            '/videos/Freya.mp4',
            '/videos/Heritage.mp4',
            '/videos/Navigator.mp4',
            '/videos/Raven.mp4',
            '/videos/Serendib.mp4',
            '/videos/Sripadaya.mp4',
            '/Future.webm',
        ];

        // Audio files
        const audioFiles = [
            '/sounds/appear.mp3',
            '/sounds/backgroundMusic.mp3',
            '/sounds/click.mp3',
            '/sounds/click.wav',
            '/sounds/confirm.wav',
            '/sounds/hover.mp3',
            '/sounds/initiating.wav',
            '/sounds/reject.wav',
            '/voices/ProjectAdam.mp3',
            '/voices/ProjectCinec.mp3',
            '/voices/ProjectFreya.mp3',
            '/voices/ProjectHeritage.mp3',
            '/voices/ProjectRaven.mp3',
            '/voices/ProjectSerendib.mp3',
            '/voices/ProjectZenofy.mp3',
        ];

        // 3D Models
        const models = [
            '/models/ihan.glb',
        ];

        // Spline scenes
        const splineScenes = [
            'https://prod.spline.design/1z1FrReDGZG28VHJ/scene.splinecode',
        ];

        // Add critical assets first (for immediate hero display)
        criticalImages.forEach(url => {
            this.assets.push({ url, type: 'image', name: url.split('/').pop() || url, priority: 'critical' });
        });

        // Add non-critical assets
        images.forEach(url => {
            this.assets.push({ url, type: 'image', name: url.split('/').pop() || url, priority: 'normal' });
        });

        videos.forEach(url => {
            this.assets.push({ url, type: 'video', name: url.split('/').pop() || url, priority: 'low' });
        });

        audioFiles.forEach(url => {
            this.assets.push({ url, type: 'audio', name: url.split('/').pop() || url, priority: 'low' });
        });

        models.forEach(url => {
            this.assets.push({ url, type: 'model', name: url.split('/').pop() || url, priority: 'low' });
        });

        splineScenes.forEach(url => {
            this.assets.push({ url, type: 'spline', name: 'Spline Scene', priority: 'low' });
        });
    }

    public setProgressCallback(callback: (progress: LoadingProgress) => void) {
        this.onProgress = callback;
    }

    public setCompleteCallback(callback: () => void) {
        this.onComplete = callback;
    }

    public getAssetCount(): { total: number; byType: Record<string, number> } {
        const byType: Record<string, number> = {};
        this.assets.forEach(asset => {
            byType[asset.type] = (byType[asset.type] || 0) + 1;
        });
        return { total: this.assets.length, byType };
    }

    public async preloadAssets(): Promise<void> {
        const criticalAssets = this.assets.filter(asset => asset.priority === 'critical');
        const normalAssets = this.assets.filter(asset => asset.priority === 'normal');
        const lowPriorityAssets = this.assets.filter(asset => asset.priority === 'low');

        let totalLoaded = 0;
        const totalAssets = this.assets.length;

        const updateProgress = (asset: AssetItem) => {
            totalLoaded++;
            let stage: LoadingProgress['stage'] = 'images';
            if (asset.type === 'video') stage = 'videos';
            else if (asset.type === 'audio') stage = 'audio';
            else if (asset.type === 'model') stage = 'models';
            else if (asset.type === 'spline') stage = 'spline';

            this.onProgress?.({
                loaded: totalLoaded,
                total: totalAssets,
                percentage: Math.min(Math.round((totalLoaded / totalAssets) * 100), 99), // Keep at 99 until truly done
                currentAsset: asset.name,
                stage: stage,
            });
        };

        // Helper to load a batch of assets concurrently, but limited by batchSize
        const processBatch = async (assetBatch: AssetItem[], batchSize: number) => {
            for (let i = 0; i < assetBatch.length; i += batchSize) {
                const chunk = assetBatch.slice(i, i + batchSize);
                
                await Promise.all(chunk.map(async (asset) => {
                    try {
                        await this.loadAsset(asset);
                    } catch (error) {
                        console.warn(`Failed to load asset ${asset.url}:`, error);
                    } finally {
                        updateProgress(asset);
                    }
                }));

                // Yield to the main thread to allow React and GSAP to render
                await new Promise(resolve => setTimeout(resolve, 15));
            }
        };

        // Load critical assets first (smaller batch size for critical initial boot)
        await processBatch(criticalAssets, 3);
        
        // Load normal assets (larger batch size)
        await processBatch(normalAssets, 5);

        // Load low priority assets (largest batch size)
        await processBatch(lowPriorityAssets, 8);

        // Mark as complete
        this.onProgress?.({
            loaded: totalAssets,
            total: totalAssets,
            percentage: 100,
            currentAsset: 'Complete',
            stage: 'complete',
        });

        this.onComplete?.();
    }

    private async loadAsset(asset: AssetItem): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout loading ${asset.url}`));
            }, 30000); // 30 second timeout

            const cleanup = () => clearTimeout(timeout);

            switch (asset.type) {
                case 'image':
                    this.loadImage(asset.url).then(() => { cleanup(); resolve(); }).catch((err) => { cleanup(); reject(err); });
                    break;
                case 'video':
                    this.loadVideo(asset.url).then(() => { cleanup(); resolve(); }).catch((err) => { cleanup(); reject(err); });
                    break;
                case 'audio':
                    this.loadAudio(asset.url).then(() => { cleanup(); resolve(); }).catch((err) => { cleanup(); reject(err); });
                    break;
                case 'model':
                    this.loadModel(asset.url).then(() => { cleanup(); resolve(); }).catch((err) => { cleanup(); reject(err); });
                    break;
                case 'spline':
                    this.loadSplineScene(asset.url).then(() => { cleanup(); resolve(); }).catch((err) => { cleanup(); reject(err); });
                    break;
                default:
                    cleanup();
                    resolve();
            }
        });
    }

    private loadImage(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    private loadVideo(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.oncanplaythrough = () => resolve();
            video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
            video.preload = 'metadata';
            video.src = url;
        });
    }

    private loadAudio(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve();
            audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
            audio.preload = 'metadata';
            audio.src = `${url}?v=${Date.now()}`;
        });
    }

    private loadModel(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // For GLB files and HDR files, we'll use fetch to preload them
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load model: ${url}`);
                    }
                    return response.blob();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }

    private loadSplineScene(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // For Spline scenes, we'll fetch the scene data
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load Spline scene: ${url}`);
                    }
                    return response.text();
                })
                .then(() => resolve())
                .catch(reject);
        });
    }
}
