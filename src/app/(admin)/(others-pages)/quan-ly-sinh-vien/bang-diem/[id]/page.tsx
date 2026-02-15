import BangDiemSV from "./BangDiemSV";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bảng điểm sinh viên",
  description: "Bảng điểm sinh viên",
};

export default function BangDiemPage() {
  return <BangDiemSV />;
}

