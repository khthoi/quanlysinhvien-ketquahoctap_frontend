import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyLopHocPhanPage from "./QuanLyLHPTheoGV";

export const metadata: Metadata = {
  title: "Quản lý Lớp Học Phần theo Giảng Viên | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Lớp Học Phần theo Giảng Viên trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyLopHocPhanPage />
    );
}
