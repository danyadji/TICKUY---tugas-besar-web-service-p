import './globals.css'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'TICKUY - Platform Pembelian Tiket Event',
  description: 'Beli tiket event favoritmu dengan mudah, cepat, dan aman',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>{children}</body>
    </html>
  )
}
