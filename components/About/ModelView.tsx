// components/About/ModelView.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Model } from "@/components/About/IhanModel";

export default function ModelViewerPage() {
    return (
        <div className="w-screen h-screen">
            <Canvas camera={{ position: [0, 0, 2], fov: 35 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.5} />
                <Environment files="/hdr/venice_sunset.hdr" />
                <Model position={[0, -1.5, 0]} />
            </Canvas>
        </div>
    );
}
