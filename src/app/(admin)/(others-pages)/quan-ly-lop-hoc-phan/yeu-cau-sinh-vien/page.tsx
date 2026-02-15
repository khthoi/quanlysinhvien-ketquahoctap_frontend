import YeuCauSinhvienPage from "./YeucauSinhvien";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Yêu cầu học tập của sinh viên",
  description: "Quản lý Yêu cầu học tập của sinh viên",
};

export default function Page() {
  return <YeuCauSinhvienPage />;
}

