export const metadata = {
  title: 'RecruitTracker - Banking Recruiting CRM',
  description: 'Coverage book, pipeline, calendar, and notes for banking recruiting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
