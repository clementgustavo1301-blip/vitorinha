"use client"

export default function RoleSelectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F6] via-[#FDF5F3] to-[#F0E8E5] flex items-center justify-center p-6">
      {children}
    </div>
  )
}
