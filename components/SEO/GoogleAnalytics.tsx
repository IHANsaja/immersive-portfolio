'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId }) => {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_title: 'Ihan Hansaja - Full Stack Developer & AI Engineer',
              page_location: window.location.href,
              custom_map: {
                'custom_parameter_1': 'portfolio_visitor'
              }
            });
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
