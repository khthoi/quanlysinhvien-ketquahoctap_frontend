import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyChuongTrinhDaoTaoPage from "./QuanLyCTDT";

export const metadata: Metadata = {
  title: "Quản lý Chương trình Đào tạo | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Chương trình Đào tạo trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyChuongTrinhDaoTaoPage />
    );
}
