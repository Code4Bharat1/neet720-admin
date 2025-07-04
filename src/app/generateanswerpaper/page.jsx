
import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";

import AnswerPaper from '@/components/generateanswerpaper/AnswerPaper'
import GenerateAnswerKeyMobile from '@/components/generateanswerpaper/GenereateAnswerKeyMobile'



const page = () => {
  return (
    <>
   

     {/* Desktop Sidebar Section (visible on md+) */}
     <div className="md:w-1/6 bg-[#007AFF]">
        <Sidebar />
      </div>
      <DesktopNavbar/>

      <main className="block md:hidden">

     {/* Mobile Navs */}
    <MobileNavbar/>

    {/* Mobile Navs */}  
    <MobilebottomNavbar/>

   {/* Page Content */}


  </main>



    <div className='hidden md:block ' >
    <AnswerPaper/>
    </div>

    <div className='md:hidden' >
    <GenerateAnswerKeyMobile />
    </div>
    </>
  )
}

export default page