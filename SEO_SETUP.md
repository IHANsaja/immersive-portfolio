# SEO Optimization Setup Guide

This document outlines the SEO optimizations implemented for the Ihan Hansaja portfolio website to improve search engine rankings when people search for "Ihan Hansaja".

## 🚀 Implemented SEO Features

### 1. Meta Tags & Metadata
- **Enhanced title tags** with keywords and branding
- **Comprehensive meta descriptions** with relevant keywords
- **Open Graph tags** for social media sharing
- **Twitter Card tags** for Twitter sharing
- **Structured data (JSON-LD)** for search engines
- **Canonical URLs** to prevent duplicate content issues

### 2. Technical SEO
- **XML Sitemap** (`/sitemap.xml`) for search engine crawling
- **Robots.txt** (`/robots.txt`) for crawl instructions
- **Performance optimizations** in Next.js config
- **Security headers** for better trust signals
- **Image optimization** with WebP/AVIF formats

### 3. Content Optimization
- **Semantic HTML structure** with proper heading hierarchy
- **Keyword-rich content** throughout the site
- **Alt text for images** for accessibility and SEO
- **Internal linking structure** for better navigation

## 📋 Setup Instructions

### 1. Domain Configuration
Update the following files with your actual domain:

**app/layout.tsx:**
```typescript
metadataBase: new URL('https://yourdomain.com'),
url: 'https://yourdomain.com',
```

**app/sitemap.ts:**
```typescript
const baseUrl = 'https://yourdomain.com'
```

**app/robots.ts:**
```typescript
const baseUrl = 'https://yourdomain.com'
```

### 2. Social Media Links
Update social media links in the structured data:

**app/layout.tsx:**
```typescript
"sameAs": [
    "https://github.com/yourusername",
    "https://linkedin.com/in/yourprofile",
    "https://twitter.com/yourhandle"
],
```

### 3. Google Analytics Setup
1. Create a Google Analytics 4 property
2. Get your Measurement ID
3. Add the GoogleAnalytics component to your layout:

```typescript
import GoogleAnalytics from '@/components/SEO/GoogleAnalytics';

// In your layout component
<GoogleAnalytics measurementId="G-XXXXXXXXXX" />
```

### 4. Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Verify ownership using the meta tag method
4. Update the verification code in `app/layout.tsx`:

```typescript
verification: {
    google: 'your-google-verification-code',
},
```

### 5. Open Graph Image
Create an Open Graph image (1200x630px) and save it as `/public/og-image.jpg`. This image will be used when your site is shared on social media.

### 6. Favicon and Icons
Ensure you have proper favicon files in the `/public` directory:
- `favicon.ico`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

## 🔍 SEO Best Practices Implemented

### Content Strategy
- **Name prominence**: "Ihan Hansaja" appears in titles, headings, and content
- **Keyword optimization**: Relevant terms like "Full Stack Developer", "AI Engineer", "Software Engineer"
- **Location targeting**: "Kotikawatta", "Sri Lanka" for local SEO
- **Educational background**: "CINEC Campus", "Software Engineering" for credibility

### Technical SEO
- **Page speed optimization**: Lazy loading, image optimization, code splitting
- **Mobile-first design**: Responsive layout for all devices
- **Accessibility**: Semantic HTML, alt text, proper heading structure
- **Security**: HTTPS headers, content security policies

### Local SEO
- **Geographic targeting**: Sri Lanka, Kotikawatta
- **Educational institution**: CINEC Campus mention
- **Local business context**: Software development services

## 📊 Monitoring & Analytics

### Key Metrics to Track
1. **Search rankings** for "Ihan Hansaja"
2. **Organic traffic** from search engines
3. **Click-through rates** from search results
4. **Page load speed** (Core Web Vitals)
5. **Mobile usability** scores

### Tools to Use
- **Google Search Console**: Monitor search performance
- **Google Analytics**: Track user behavior
- **PageSpeed Insights**: Check performance scores
- **Mobile-Friendly Test**: Ensure mobile optimization

## 🎯 Expected Results

With these optimizations, your portfolio should:
- **Rank higher** for searches of "Ihan Hansaja"
- **Appear in relevant searches** for "Full Stack Developer Sri Lanka"
- **Show rich snippets** in search results
- **Load faster** and provide better user experience
- **Be more discoverable** on social media platforms

## 🔄 Maintenance

### Regular Updates
- **Update sitemap** when adding new content
- **Refresh meta descriptions** periodically
- **Monitor search console** for crawl errors
- **Update structured data** when adding new projects
- **Check page speed** regularly

### Content Updates
- **Add new projects** to the sitemap
- **Update skills and technologies** in structured data
- **Refresh portfolio content** with new achievements
- **Add blog posts** about your work (optional)

## 📞 Support

If you need help with any of these SEO implementations, refer to:
- [Next.js SEO Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Console Help](https://support.google.com/webmasters/)
- [Schema.org Documentation](https://schema.org/)

Remember to replace placeholder values with your actual information before deploying!
