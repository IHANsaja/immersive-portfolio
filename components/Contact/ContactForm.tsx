"use client";
import React, {useEffect} from 'react';
import MobileForm from "@/components/Contact/MobileForm";
import DesktopForm from "@/components/Contact/DesktopForm";

const ContactForm: React.FC = () => {
    const [isMobile, setIsMobile] = React.useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);


    return (
        <>
        {isMobile ? (
            // MOBILE VERSION: Scrollable Card Section
            <MobileForm />
            ) : (
            <DesktopForm />
                )}
        </>
    );
};

export default ContactForm;
