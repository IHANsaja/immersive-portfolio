"use client";

interface WelcomeProps {
    headlineRef?: React.RefObject<null>
}

const Welcome = ({headlineRef}: WelcomeProps) => {

    return (
        <div className="flex justify-center items-center h-screen w-screen overflow-hidden">
            <h1
                ref={headlineRef}
                id="welcome"
                className="
          font-neotriad-sans
          text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-[100px]
          text-[var(--foreground)]
          text-shadow-lg text-center whitespace-nowrap
          px-4 sm:px-8 z-5
        "
            >
                <span className="text-6xl">WELCOME TO </span><br/>
                MY PORTFOLIO
            </h1>
        </div>
    );
};

export default Welcome;
