export const metadata = {
  title: 'IELTS AI Platform',
  description: 'AI-powered IELTS examination platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
