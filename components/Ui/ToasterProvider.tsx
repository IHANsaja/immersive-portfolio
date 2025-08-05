'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToasterProvider = () => {
    return (
        <ToastContainer
            position="top-right"
            autoClose={2000}
            pauseOnHover
            hideProgressBar={false}
            newestOnTop
            theme="colored"
            className="z-[10002] mr-15 mt-15"
        />
    );
};

export default ToasterProvider;
