import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLySinhVienPage from "./QuanLySinhVien";


export const metadata: Metadata = {
    title: "Quản Lý Sinh Viên | TailAdmin - Next.js Dashboard Template",
    description: "This is Quản Lý Sinh Viên TailAdmin Dashboard Template",
};

export default function BlankPage() {
    return (
        <QuanLySinhVienPage />
  );
}
