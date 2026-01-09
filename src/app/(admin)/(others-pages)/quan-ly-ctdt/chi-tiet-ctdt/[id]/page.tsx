import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyMonHocChuongTrinhPage from "./ChiTietCTDT";

export const metadata: Metadata = {
  title: "Quản lý môn học của CTĐT | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý môn học của CTĐT trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyMonHocChuongTrinhPage />
    );
}
