import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyLopNienChePage from "./QuanLyLopNienChe";

export const metadata: Metadata = {
  title: "Quản lý Lớp niên chế | TailAdmin - Next.js Dashboard Template",
  description: "Trang quản lý Lớp niên chế trong hệ thống quản lý sinh viên và kết quả học tập.",
};

export default function BlankPage() {
    return (
        <QuanLyLopNienChePage />
    );
}
