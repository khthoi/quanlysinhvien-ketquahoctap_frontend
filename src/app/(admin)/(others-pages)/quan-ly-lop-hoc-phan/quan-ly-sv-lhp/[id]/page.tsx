import { Metadata } from "next";
import React from "react";
import ChiTietLopHocPhanPage from "./QuanLyDiem";

export const metadata: Metadata = {
  title: "Quản lý Điểm | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Điểm trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <ChiTietLopHocPhanPage />
    );
}
