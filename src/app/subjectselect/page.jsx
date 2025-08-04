import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import SelectSubjectPage from "@/components/subjectselect/SubjectSelect";
import SubjectSelectMobile from "@/components/subjectselect/subjectSelectMobile";

const Page = () => {
  return (
    <>
      {/* Desktop Sidebar Section (visible on md+) */}
      <div className="md:w-1/6">
        <Sidebar />
      </div>
      <DesktopNavbar />

      <main className="block md:hidden">
        {/* Mobile Navs */}
        <MobileNavbar />

        {/* Mobile Navs */}
        <MobilebottomNavbar />

        {/* Page Content */}
      </main>

      <div className=" hidden md:block">
        <SelectSubjectPage />
      </div>
      <div className="md:hidden">
        <SubjectSelectMobile />
      </div>
    </>
  );
};

export default Page;
