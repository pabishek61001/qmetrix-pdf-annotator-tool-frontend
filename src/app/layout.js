import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "./providers/ToastProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: 'QMetrix | PDF Takeoff & Quantity Surveying Suite',
    template: '%s | QMetrix QS Engine'
  },
  description: 'Professional full-stack quantity surveying and cost consultancy platform for architectural PDF blueprint annotation, vertex mapping, and real-time surface area estimations.',
  keywords: ['Quantity Surveying', 'PDF Takeoff', 'Construction Estimation', 'Blueprint Annotation', 'QMetrix', 'Cost Consultancy'],
  authors: [{ name: 'Abishek Periasamy' }],
  creator: 'Abishek Periasamy',
  publisher: 'QMetrix Consultancy',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'QMetrix | PDF Takeoff & Quantity Surveying Suite',
    description: 'Execute precise polygon takeoffs, calculate real-time surface areas, and generate bills of quantities seamlessly.',
    url: 'https://qmetrix-pdf-annotator-tool.vercel.app',
    siteName: 'QMetrix QS Estimation Engine',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QMetrix PDF Takeoff & Annotation Tool',
    description: 'Enterprise Quantity Surveying and Cost Consultancy Web Application.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}