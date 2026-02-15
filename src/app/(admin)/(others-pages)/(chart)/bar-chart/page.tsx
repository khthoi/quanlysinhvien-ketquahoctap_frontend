import BarChartOne, {
  GPACohortStats,
} from "@/components/charts/bar/BarChartOne";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

// Demo data dùng riêng cho trang ví dụ Bar Chart
const demoGpaData: GPACohortStats[] = [
  {
    nienKhoaId: 1,
    maNienKhoa: "K2021",
    tenNienKhoa: "Khóa 2021 - 2025",
    tongSinhVien: 500,
    trungBinh: 120,
    kha: 200,
    gioi: 130,
    xuatSac: 50,
    dangHoc: 400,
    baoLuu: 30,
    thoiHoc: 20,
    theoNganh: [
      {
        nganhId: 10,
        maNganh: "CNTT",
        tenNganh: "Công nghệ thông tin",
        tongSinhVien: 300,
        trungBinh: 60,
        kha: 130,
        gioi: 80,
        xuatSac: 30,
        dangHoc: 250,
        baoLuu: 20,
        thoiHoc: 10,
        theoLop: [
          {
            lopId: 100,
            maLop: "CNTT01-K2021",
            tenLop: "CNTT01 Khóa 2021",
            tongSinhVien: 150,
            trungBinh: 30,
            kha: 70,
            gioi: 35,
            xuatSac: 15,
            dangHoc: 120,
            baoLuu: 10,
            thoiHoc: 5,
          },
        ],
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Next.js Bar Chart | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Bar Chart page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne data={demoGpaData} />
        </ComponentCard>
      </div>
    </div>
  );
}
