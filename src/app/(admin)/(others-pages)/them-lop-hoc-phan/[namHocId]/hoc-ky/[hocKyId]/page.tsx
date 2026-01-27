import { Metadata } from "next";
import ThemLopHocPhanPage from "./ThemLopHocPhan";

export const metadata: Metadata = {
    title: "Thêm lớp học phần",
    description: "Trang thêm lớp học phần",
};

export default function ThemNhieuLopHocPhanPage() {
    return <ThemLopHocPhanPage />;
}
