import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import '@/src/styles/globals.css';

const manrope = Manrope({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MedConnect - Nền tảng Đặt khám & Y tế Trực tuyến Hàng đầu',
  description: 'Đặt khám với hơn 1000 bác sĩ đã kết nối chính thức với MedConnect để có số thứ tự và khung giờ khám trước.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
