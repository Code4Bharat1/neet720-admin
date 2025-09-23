import SelectSubjectPage from "@/components/subjectselect/SubjectSelect";
import SubjectSelectMobile from "@/components/subjectselect/subjectSelectMobile";
import LayoutWithNav from "@/app/mainLayout";

const Page = () => {
  return (
    <LayoutWithNav>
      <div>
        <SelectSubjectPage />
      </div>
    </LayoutWithNav>
  );
};

export default Page;
