"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardTeacher,
  faBook,
  faBuilding,
  faCalendarAlt,
  faLayerGroup,
  faUsers,
  faBookOpen,
  faGraduationCap,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "@/components/ui/badge/Badge";

interface ThongKeTongQuan {
  sinhVien: {
    tongSinhVien: number;
    theoTinhTrang:  {
      dangHoc: number;
      baoLuu:  number;
      thoiHoc: number;
      daTotNghiep: number;
    };
  };
  tongGiangVien: number;
  tongNienKhoa: number;
  tongNganh: number;
  tongKhoa: number;
  tongMonHoc: number;
  tongLop: number;
  tongLopHocPhan: number;
  tongChuongTrinhDaoTao: number;
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// Component cho Metric Card chính
interface MetricCardProps {
  icon: any;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: number;
  subtitle?: string;
}

const MetricCard: React. FC<MetricCardProps> = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  subtitle,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-300 hover: shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700">
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-xl ${iconBgColor}`}
      >
        <FontAwesomeIcon icon={icon} className={`text-xl ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
          {value. toLocaleString("vi-VN")}
        </h4>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Component cho Status Card (Sinh viên theo tình trạng)
interface StatusItemProps {
  icon: any;
  label: string;
  value: number;
  total: number;
  color: "success" | "warning" | "error" | "primary";
}

const StatusItem:  React.FC<StatusItemProps> = ({
  icon,
  label,
  value,
  total,
  color,
}) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  const colorClasses = {
    success:  {
      bg: "bg-success-50 dark:bg-success-500/10",
      text: "text-success-600 dark:text-success-400",
      progress: "bg-success-500",
    },
    warning: {
      bg: "bg-warning-50 dark:bg-warning-500/10",
      text: "text-warning-600 dark:text-warning-400",
      progress: "bg-warning-500",
    },
    error: {
      bg: "bg-error-50 dark: bg-error-500/10",
      text: "text-error-600 dark:text-error-400",
      progress: "bg-error-500",
    },
    primary: {
      bg: "bg-brand-50 dark:bg-brand-500/10",
      text: "text-brand-600 dark:text-brand-400",
      progress: "bg-brand-500",
    },
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[color].bg}`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={`text-lg ${colorClasses[color].text}`}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {value.toLocaleString("vi-VN")}
            </span>
            <Badge variant="light" color={color} size="sm">
              {percentage}%
            </Badge>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClasses[color].progress} rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Component chính
export default function DashboardOverview() {
  const [data, setData] = useState<ThongKeTongQuan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = getCookie("access_token");
        const res = await fetch(
          "http://localhost:3000/bao-cao/thong-ke/tong-quan",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu thống kê");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError("Có lỗi xảy ra khi tải dữ liệu thống kê");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-error-500 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Tổng quan Hệ thống
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Thống kê tổng quan về hệ thống quản lý đào tạo
        </p>
      </div>

      {/* Main Metrics - First Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <MetricCard
          icon={faUserGraduate}
          iconBgColor="bg-brand-100 dark:bg-brand-500/20"
          iconColor="text-brand-600 dark:text-brand-400"
          title="Tổng Sinh viên"
          value={data. sinhVien.tongSinhVien}
          subtitle="Toàn hệ thống"
        />
        <MetricCard
          icon={faChalkboardTeacher}
          iconBgColor="bg-success-100 dark:bg-success-500/20"
          iconColor="text-success-600 dark:text-success-400"
          title="Tổng Giảng viên"
          value={data.tongGiangVien}
          subtitle="Đang hoạt động"
        />
        <MetricCard
          icon={faLayerGroup}
          iconBgColor="bg-warning-100 dark:bg-warning-500/20"
          iconColor="text-warning-600 dark:text-warning-400"
          title="Lớp học phần"
          value={data.tongLopHocPhan}
          subtitle="Đã mở"
        />
        <MetricCard
          icon={faBookOpen}
          iconBgColor="bg-purple-100 dark:bg-purple-500/20"
          iconColor="text-purple-600 dark:text-purple-400"
          title="Chương trình ĐT"
          value={data.tongChuongTrinhDaoTao}
          subtitle="Trong toàn trường"
        />
      </div>

      {/* Sinh viên theo tình trạng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Sinh viên theo tình trạng */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Sinh viên theo Tình trạng
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Phân loại theo trạng thái học tập
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-xl text-brand-600 dark: text-brand-400"
              />
            </div>
          </div>

          <div className="space-y-4">
            <StatusItem
              icon={faUserCheck}
              label="Đang học"
              value={data. sinhVien.theoTinhTrang.dangHoc}
              total={data. sinhVien.tongSinhVien}
              color="success"
            />
            <StatusItem
              icon={faUserClock}
              label="Bảo lưu"
              value={data.sinhVien. theoTinhTrang.baoLuu}
              total={data.sinhVien.tongSinhVien}
              color="warning"
            />
            <StatusItem
              icon={faUserXmark}
              label="Thôi học"
              value={data.sinhVien.theoTinhTrang.thoiHoc}
              total={data.sinhVien.tongSinhVien}
              color="error"
            />
            <StatusItem
              icon={faAward}
              label="Đã tốt nghiệp"
              value={data.sinhVien.theoTinhTrang.daTotNghiep}
              total={data. sinhVien.tongSinhVien}
              color="primary"
            />
          </div>
        </div>

        {/* Card Cơ cấu đào tạo */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark: border-gray-800 dark: bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark: text-white/90">
                Cơ cấu Đào tạo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Thống kê các đơn vị và danh mục
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success-100 dark:bg-success-500/20">
              <FontAwesomeIcon
                icon={faBuilding}
                className="text-xl text-success-600 dark:text-success-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Khoa */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark: border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20">
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Khoa
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                {data.tongKhoa}
              </p>
            </div>

            {/* Ngành */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Ngành
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                {data.tongNganh}
              </p>
            </div>

            {/* Niên khóa */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark: from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/20">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Niên khóa
                </span>
              </div>
              <p className="text-2xl font-bold text-green-800 dark: text-green-200">
                {data.tongNienKhoa}
              </p>
            </div>

            {/* Lớp */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Lớp niên chế
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {data.tongLop}
              </p>
            </div>

            {/* Môn học - Full width */}
            <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border border-pink-200 dark: border-pink-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500/20">
                    <FontAwesomeIcon
                      icon={faBook}
                      className="text-pink-600 dark:text-pink-400"
                    />
                  </div>
                  <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    Môn học
                  </span>
                </div>
                <p className="text-2xl font-bold text-pink-800 dark:text-pink-200">
                  {data.tongMonHoc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-5">
        {/* Card tổng quan nhanh */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-100 text-sm">Tổng Sinh viên</p>
              <h3 className="text-3xl font-bold mt-1">
                {data.sinhVien.tongSinhVien}
              </h3>
              <p className="text-brand-200 text-xs mt-2">
                {data.sinhVien.theoTinhTrang.dangHoc} đang học
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserGraduate} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-success-500 to-success-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-success-100 text-sm">Giảng viên</p>
              <h3 className="text-3xl font-bold mt-1">{data.tongGiangVien}</h3>
              <p className="text-success-200 text-xs mt-2">
                Đang giảng dạy
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faChalkboardTeacher} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-warning-500 to-warning-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-warning-100 text-sm">Lớp học phần</p>
              <h3 className="text-3xl font-bold mt-1">{data.tongLopHocPhan}</h3>
              <p className="text-warning-200 text-xs mt-2">
                Đã mở giảng dạy
              </p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FontAwesomeIcon icon={faLayerGroup} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}