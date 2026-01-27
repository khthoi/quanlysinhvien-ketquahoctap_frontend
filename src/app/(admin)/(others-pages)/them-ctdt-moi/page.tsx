import TaoCTDT from "./TaoCTDT";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tạo Chương Trình Đào Tạo",
    description: "Tạo Chương Trình Đào Tạo",
};

export default function TaoCTDTPage() {
    return (
        <div>
            <TaoCTDT />
        </div>
    );
}
