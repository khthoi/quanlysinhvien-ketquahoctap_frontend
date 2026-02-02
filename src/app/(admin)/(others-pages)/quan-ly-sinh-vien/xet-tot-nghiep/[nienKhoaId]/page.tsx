import XetTotNghiepPage from "./XetTotNghiepPage";
import { Metadata } from "next";
    
export const metadata: Metadata = {
    title: "Xét Tốt Nghiệp",
    description: "Quản lý sinh viên - Xét Tốt Nghiệp",
};

export default function Page() {
    return <XetTotNghiepPage />;
}
