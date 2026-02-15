import ThemLHPHocLai from "./ThemLHPHocLai";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Thêm lớp học phần học lại",
    description: "Thêm lớp học phần học lại",
};

export default function ThemLHPHocLaiPage() {
    return <ThemLHPHocLai />;
}
