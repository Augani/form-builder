import { Metadata } from "next";

// This is a fallback metadata that will be used if dynamic metadata generation fails
export const metadata: Metadata = {
  title: "Snapform - Form Builder",
  description: "Create custom forms dynamically with ease",
  openGraph: {
    title: "Snapform - Form Builder",
    description: "Create custom forms dynamically with ease",
    url: "https://snapform.com",
    siteName: "Snapform",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};
