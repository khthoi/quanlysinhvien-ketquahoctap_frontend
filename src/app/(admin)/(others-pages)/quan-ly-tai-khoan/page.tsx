import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyNguoiDungPage from "./QuanLyTaiKhoan";

export const metadata: Metadata = {
    title: "Quản Lý Người Dùng | TailAdmin - Next.js Dashboard Template",
    description: "This is Quản Lý Người Dùng TailAdmin Dashboard Template",
};

export default function BlankPage() {
    return (
        <QuanLyNguoiDungPage />
  );
}
