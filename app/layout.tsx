export const metadata = {
  title: 'Next.js App',
  description: 'Real-time chat with Socket.IO',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
