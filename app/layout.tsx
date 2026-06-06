import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Listed. — One snap. Four listings.',
  description: 'Take one photo. Get SEO-optimised listings for Vinted, Depop, eBay, and Etsy automatically.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
