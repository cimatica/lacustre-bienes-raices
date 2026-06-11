import AdminNavbar from './AdminNavbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] font-sans flex flex-col antialiased">
      <AdminNavbar />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
