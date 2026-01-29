import ThemSinhvienPage from "./ThemSinhvienPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Thêm sinh viên học lại",
    description: "Thêm sinh viên học lại",
};

export default function Page() {
    return <ThemSinhvienPage />;
}
