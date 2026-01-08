import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyMonHocPage from "./QuanLyMonHoc";

export const metadata: Metadata = {
  title: "Quản lý Môn học | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Môn học trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyMonHocPage />
    );
}
