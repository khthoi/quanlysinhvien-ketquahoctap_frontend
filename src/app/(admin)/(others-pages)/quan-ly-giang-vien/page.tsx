import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyGiangVienPage from "./QuanLyGV";

export const metadata: Metadata = {
  title: "Quản lý Giảng viên | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Giảng viên trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyGiangVienPage />
    );
}
