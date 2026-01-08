import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyNienKhoaPage from "./QuanLyNienKhoa";


export const metadata: Metadata = {
    title: "Quản Lý Niên Khoá | TailAdmin - Next.js Dashboard Template",
    description: "This is Quản Lý Niên Khoá TailAdmin Dashboard Template",
};

export default function BlankPage() {
    return (
        <QuanLyNienKhoaPage />
  );
}
