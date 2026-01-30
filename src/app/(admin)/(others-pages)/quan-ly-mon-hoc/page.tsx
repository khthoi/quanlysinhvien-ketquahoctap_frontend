import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React, { Suspense } from "react";
import QuanLyMonHocPage from "./QuanLyMonHoc";

export const metadata: Metadata = {
  title: "Quản lý Môn học | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Môn học trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center text-gray-500">Đang tải...</div>}>
            <QuanLyMonHocPage />
        </Suspense>
    );
}
