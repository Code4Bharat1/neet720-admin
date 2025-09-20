import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";

export default function LayoutWithNav({ children }) {
  return (
    <div className="min-h-screen bg-white">
      {/* ---------- MOBILE LAYOUT ---------- */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Top Mobile Navbar */}
        <div className="sticky top-0 z-20">
          <MobileNavbar />
        </div>

        {/* Main content with padding so bottom nav doesn't overlap */}
        <main className="flex-1 pb-20 px-4">{children}</main>

        {/* Bottom Navbar */}
        <div className="fixed bottom-0 left-0 w-full z-30">
          <MobilebottomNavbar />
        </div>
      </div>

      {/* ---------- DESKTOP LAYOUT ---------- */}
      <div className="hidden md:block min-h-screen">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Section with margin for fixed sidebar */}
        <div className="ml-72 flex flex-col min-h-screen">
          {/* Top Navbar */}
          <div className="sticky top-0 z-20">
            <DesktopNavbar />
          </div>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}