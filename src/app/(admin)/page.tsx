import type { Metadata } from "next";
import DashboardOverview from "./Dashboard";

export const metadata: Metadata = {
  title: "Dashboard - Hệ thống Quản lý Đào tạo",
  description: "Tổng quan hệ thống quản lý sinh viên và kết quả học tập",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardOverview />
    </div>
  );
}