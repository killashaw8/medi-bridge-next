import { NextPage } from "next";
import withLayoutBasic from "@/libs/components/layout/LayoutBasic";
import DoctorProfileContent from "@/libs/components/clinics-doctors/DoctorProfileContent";


const DoctorDetails: NextPage = () => {
  return (
    <>
    <DoctorProfileContent />
    </>
  );
}

export default withLayoutBasic(DoctorDetails);