import '../globals.css' 
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="ja">
        <body className="bg-white">
          {children}
        </body>
      </html>
    )
  }
  