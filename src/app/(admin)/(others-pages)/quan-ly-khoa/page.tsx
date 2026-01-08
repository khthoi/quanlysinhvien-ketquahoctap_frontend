import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyKhoaPage from "./QuanlyKhoa";

export const metadata: Metadata = {
  title: "Quản lý Khoa | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Khoa trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyKhoaPage />
    );
}
