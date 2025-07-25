import GPUFluidCanvas from "@/components/Ui/HoverEffect";
import Image from "next/image";
import Spline from "@splinetool/react-spline";
import GrButtons from "@/components/Hero/GrButtons";
import Menu from "@/components/Hero/Menu";
import Welcome from "@/components/Hero/Welcome";

const HeroSection = () => {

    return (
        <section id="hero-section" className="relative w-screen h-screen">
            <GPUFluidCanvas />

            <div
                id="background-container"
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            >
                <Image
                    src="/background.jpg"
                    alt="sci-fi background"
                    fill
                    style={{ objectFit: "cover" }}
                    className="pointer-events-none mix-blend-plus-darker md:mix-blend-normal"
                    id="background-image"
                />
            </div>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2220%22%20height=%2220%22%20viewBox=%220%200%2010%2010%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle%20cx=%220.5%22%20cy=%220.5%22%20r=%220.5%22%20fill=%22white%22/%3E%3C/svg%3E')] opacity-30 mix-blend-overlay pointer-events-none" />
            </div>

            <div id="scene" className="absolute inset-0 z-[9998]">
                <Spline
                    scene="https://prod.spline.design/1z1FrReDGZG28VHJ/scene.splinecode"
                    className="w-full h-full"
                />
            </div>

            <div className="absolute top-0 left-0 w-screen flex justify-end gap-8 items-center z-[10000]">
                <GrButtons />
            </div>

            <Welcome />

            <div className="absolute bottom-0 left-0 w-full flex justify-center z-[9999] pointer-events-none mix-blend-plus-darker">
                <img
                    src="/PlanetRocks.png"
                    alt="planet rocks"
                    className="max-w-[50%] h-auto"
                />
                <img
                    src="/PlanetRocks.png"
                    alt="planet rocks"
                    className="max-w-[50%] h-auto scale-x-[-1]"
                />
            </div>
        </section>
    );
};

export default HeroSection;
