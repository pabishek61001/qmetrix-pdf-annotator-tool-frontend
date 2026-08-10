import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from './components/ToastProvider';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'QMetrix PDF Annotation Tool',
  description: 'Quantity Surveying & Cost Consultancy System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}