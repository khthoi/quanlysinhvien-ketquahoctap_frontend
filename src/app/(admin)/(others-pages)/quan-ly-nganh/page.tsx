import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React, { Suspense } from "react";
import QuanLyNganhPage from "./QuanLyNganh";

export const metadata: Metadata = {
    title: "Quản Lý Ngành | TailAdmin - Next.js Dashboard Template",
    description: "This is Quản Lý Ngành TailAdmin Dashboard Template",
};

export default function BlankPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center text-gray-500">Đang tải...</div>}>
            <QuanLyNganhPage />
        </Suspense>
    );
}
