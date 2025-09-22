import SelectSubjectPage from "@/components/subjectselect/SubjectSelect";
import SubjectSelectMobile from "@/components/subjectselect/subjectSelectMobile";
import LayoutWithNav from "@/app/mainLayout";

const Page = () => {
  return (
    <LayoutWithNav>
      <div className="hidden md:block">
        <SelectSubjectPage />
      </div>
      <div className="md:hidden">
        <SubjectSelectMobile />
      </div>
    </LayoutWithNav>
  );
};

export default Page;
