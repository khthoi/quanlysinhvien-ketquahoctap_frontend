import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import QuanLyNganhPage from "./QuanLyNganh";

export const metadata: Metadata = {
    title: "Quản Lý Ngành | TailAdmin - Next.js Dashboard Template",
    description: "This is Quản Lý Ngành TailAdmin Dashboard Template",
};

export default function BlankPage() {
    return (
        <QuanLyNganhPage />
    );
}
