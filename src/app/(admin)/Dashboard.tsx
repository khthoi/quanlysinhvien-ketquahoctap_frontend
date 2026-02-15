 "use client";
import { ENV } from "@/config/env";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  faChartColumn,
  faBarsProgress,
  faArrowRight,
  faListCheck,
  faChartBar,
  faGears,
  faChevronDown,
  faChevronUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Badge from "@/components/ui/badge/Badge";
import BarChartOne, {
  GPACohortStats,
} from "@/components/charts/bar/BarChartOne";
import SearchableSelect from "@/components/form/SelectCustom";

interface ChuongTrinhTheoNganhItem {
  nganhId: number;
  maNganh: string;
  tenNganh: string;
  soChuongTrinh: number;
}

interface MonHocTheoLoai {
  daiCuong: number;
  chuyenNganh: number;
  tuChon: number;
}

interface LopHocPhanTheoHocKy {
  hocKyId: number;
  hocKy: number;
  soLopDaKhoaDiem: number;
  soLopChuaKhoaDiem: number;
}

interface LopHocPhanTheoNamHoc {
  namHocId: number;
  maNamHoc: string;
  tenNamHoc: string;
  theoHocKy: LopHocPhanTheoHocKy[];
}

interface ThongKeTongQuan {
  sinhVien: {
    tongSinhVien: number;
    theoTinhTrang: {
      dangHoc: number;
      baoLuu: number;
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
  tongLopHocPhanDaKhoaDiem: number;
  tongLopHocPhanChuaKhoaDiem: number;
  lopHocPhanTheoNamHoc?: LopHocPhanTheoNamHoc[];
  chuongTrinhDaoTaoTheoNganh: ChuongTrinhTheoNganhItem[];
  monHocTheoLoai: MonHocTheoLoai;
  gpaTheoNienKhoa: GPACohortStats[];
}

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// Component cho Metric Card chính (có thể click để chuyển trang)
interface MetricCardProps {
  icon: any;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: number;
  subtitle?: string;
  href?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconBgColor,
  iconColor,
  title,
  value,
  subtitle,
  href,
}) => {
  const content = (
    <div className="flex items-center gap-4">
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-xl ${iconBgColor}`}
      >
        <FontAwesomeIcon icon={icon} className={`text-xl ${iconColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
          {value.toLocaleString("vi-VN")}
        </h4>
        {subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <FontAwesomeIcon
          icon={faArrowRight}
          className="text-sm text-gray-400 dark:text-gray-500 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all"
        />
      )}
    </div>
  );

  const cardClass =
    "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700 group block text-left";

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }
  return <div className={cardClass}>{content}</div>;
};

// Component cho Status Card (Sinh viên theo tình trạng)
interface StatusItemProps {
  icon: any;
  label: string;
  value: number;
  total: number;
  color: "success" | "warning" | "error" | "primary";
}

const StatusItem: React.FC<StatusItemProps> = ({
  icon,
  label,
  value,
  total,
  color,
}) => {
  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  const colorClasses = {
    success: {
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
      bg: "bg-error-50 dark:bg-error-500/10",
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

// Component cho Lớp học phần theo layer
interface LopHocPhanLayerProps {
  data: ThongKeTongQuan;
}

const LopHocPhanLayer: React.FC<LopHocPhanLayerProps> = ({ data }) => {
  const [expandedNamHoc, setExpandedNamHoc] = useState<Set<number>>(new Set());
  const [expandedHocKy, setExpandedHocKy] = useState<Set<string>>(new Set());
  const [selectedNamHoc, setSelectedNamHoc] = useState<string>("");
  const [selectedHocKy, setSelectedHocKy] = useState<string>("");

  const lopHocPhanStats = useMemo(() => {
    const { tongLopHocPhanDaKhoaDiem, tongLopHocPhanChuaKhoaDiem } = data;
    const total = tongLopHocPhanDaKhoaDiem + tongLopHocPhanChuaKhoaDiem;
    const lockedPercent = total ? (tongLopHocPhanDaKhoaDiem / total) * 100 : 0;
    const unlockedPercent = total
      ? (tongLopHocPhanChuaKhoaDiem / total) * 100
      : 0;
    return {
      total,
      lockedPercent,
      unlockedPercent,
      daKhoaDiem: tongLopHocPhanDaKhoaDiem,
      chuaKhoaDiem: tongLopHocPhanChuaKhoaDiem,
    };
  }, [data]);

  // Tạo options cho năm học
  const namHocOptions = useMemo(() => {
    if (!data.lopHocPhanTheoNamHoc) return [];
    return [
      ...data.lopHocPhanTheoNamHoc.map((nh) => ({
        value: nh.namHocId.toString(),
        label: nh.tenNamHoc,
        secondary: nh.maNamHoc,
      })),
    ];
  }, [data.lopHocPhanTheoNamHoc]);

  // Tạo options cho học kỳ (chỉ khi đã chọn năm học)
  const hocKyOptions = useMemo(() => {
    if (!data.lopHocPhanTheoNamHoc) return [];
    if (!selectedNamHoc) {
      // Chưa chọn năm học thì không hiển thị options học kỳ
      return [];
    }
    const namHoc = data.lopHocPhanTheoNamHoc.find(
      (nh) => nh.namHocId.toString() === selectedNamHoc,
    );
    if (!namHoc) return [];
    return [
      ...namHoc.theoHocKy.map((hk) => ({
        value: `${namHoc.namHocId}-${hk.hocKyId}`,
        label: `Học kỳ ${hk.hocKy}`,
        secondary: namHoc.tenNamHoc,
      })),
    ];
  }, [data.lopHocPhanTheoNamHoc, selectedNamHoc]);

  // Lọc dữ liệu theo bộ lọc
  const filteredData = useMemo(() => {
    if (!data.lopHocPhanTheoNamHoc) return [];
    let result = data.lopHocPhanTheoNamHoc;

    // Lọc theo năm học
    if (selectedNamHoc) {
      result = result.filter(
        (nh) => nh.namHocId.toString() === selectedNamHoc,
      );
    }

    // Lọc theo học kỳ
    if (selectedHocKy) {
      const [namHocId, hocKyId] = selectedHocKy.split("-");
      result = result.map((nh) => {
        if (nh.namHocId.toString() === namHocId) {
          return {
            ...nh,
            theoHocKy: nh.theoHocKy.filter(
              (hk) => hk.hocKyId.toString() === hocKyId,
            ),
          };
        }
        return nh;
      });
    }

    return result;
  }, [data.lopHocPhanTheoNamHoc, selectedNamHoc, selectedHocKy]);

  // Khi đổi năm học thì reset lại chọn học kỳ
  const handleNamHocChange = (value: string) => {
    setSelectedNamHoc(value);
    setSelectedHocKy("");
  };

  const toggleNamHoc = (namHocId: number) => {
    setExpandedNamHoc((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(namHocId)) {
        newSet.delete(namHocId);
        // Đóng tất cả học kỳ của năm học này
        setExpandedHocKy((prevHk) => {
          const newHkSet = new Set(prevHk);
          filteredData
            .find((nh) => nh.namHocId === namHocId)
            ?.theoHocKy.forEach((hk) => {
              newHkSet.delete(`${namHocId}-${hk.hocKyId}`);
            });
          return newHkSet;
        });
      } else {
        newSet.add(namHocId);
      }
      return newSet;
    });
  };

  const toggleHocKy = (namHocId: number, hocKyId: number) => {
    const key = `${namHocId}-${hocKyId}`;
    setExpandedHocKy((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Tính tổng cho năm học
  const getNamHocTotal = (namHoc: LopHocPhanTheoNamHoc) => {
    const total = namHoc.theoHocKy.reduce(
      (sum, hk) => sum + hk.soLopDaKhoaDiem + hk.soLopChuaKhoaDiem,
      0,
    );
    const daKhoa = namHoc.theoHocKy.reduce(
      (sum, hk) => sum + hk.soLopDaKhoaDiem,
      0,
    );
    const chuaKhoa = namHoc.theoHocKy.reduce(
      (sum, hk) => sum + hk.soLopChuaKhoaDiem,
      0,
    );
    return { total, daKhoa, chuaKhoa };
  };

  return (
    <div className="space-y-4">
      {/* Bộ lọc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lọc theo năm học
          </label>
          <SearchableSelect
            options={namHocOptions}
            placeholder="Chọn năm học"
            onChange={handleNamHocChange}
            defaultValue={selectedNamHoc}
            showSecondary={true}
            searchPlaceholder="Tìm kiếm năm học..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lọc theo học kỳ
          </label>
          <SearchableSelect
            options={hocKyOptions}
            placeholder="Chọn học kỳ"
            onChange={setSelectedHocKy}
            defaultValue={selectedHocKy}
            showSecondary={true}
            searchPlaceholder="Tìm kiếm học kỳ..."
            disabled={
              !selectedNamHoc ||
              !data.lopHocPhanTheoNamHoc ||
              data.lopHocPhanTheoNamHoc.length === 0
            }
          />
        </div>
      </div>

      {/* Layer 1: Tổng quát */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 dark:border-gray-700 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-white dark:bg-indigo-400">
            <FontAwesomeIcon icon={faChartColumn} />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Tổng quan lớp học phần
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Thống kê toàn hệ thống
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/80 dark:bg-gray-900/60 p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Tổng số lớp học phần
            </div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {lopHocPhanStats.total.toLocaleString("vi-VN")}
            </div>
          </div>
          <div className="rounded-lg bg-white/80 dark:bg-gray-900/60 p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Đã chốt điểm
            </div>
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">
              {lopHocPhanStats.daKhoaDiem.toLocaleString("vi-VN")}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {lopHocPhanStats.lockedPercent.toFixed(1)}%
            </div>
          </div>
          <div className="rounded-lg bg-white/80 dark:bg-gray-900/60 p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Chưa chốt điểm
            </div>
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
              {lopHocPhanStats.chuaKhoaDiem.toLocaleString("vi-VN")}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {lopHocPhanStats.unlockedPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-success-500 transition-all duration-500"
              style={{ width: `${lopHocPhanStats.lockedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layer 2 & 3: Theo năm học và học kỳ */}
      {data.lopHocPhanTheoNamHoc && data.lopHocPhanTheoNamHoc.length > 0 ? (
        <div className="space-y-3">
          {filteredData.map((namHoc) => {
            const namHocStats = getNamHocTotal(namHoc);
            const isExpanded = expandedNamHoc.has(namHoc.namHocId);
            const namHocPercent =
              namHocStats.total > 0
                ? (namHocStats.daKhoa / namHocStats.total) * 100
                : 0;

            return (
              <div
                key={namHoc.namHocId}
                className="rounded-xl border border-gray-200 bg-white dark:bg-white/[0.03] dark:border-gray-700 overflow-hidden"
              >
                {/* Header năm học */}
                <button
                  onClick={() => toggleNamHoc(namHoc.namHocId)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                          {namHoc.tenNamHoc}
                        </h5>
                        <Badge variant="light" color="primary" size="sm">
                          {namHoc.maNamHoc}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Tổng:{" "}
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {namHocStats.total}
                          </span>
                        </span>
                        <span>
                          Đã chốt:{" "}
                          <span className="font-semibold text-success-600 dark:text-success-400">
                            {namHocStats.daKhoa}
                          </span>
                        </span>
                        <span>
                          Chưa chốt:{" "}
                          <span className="font-semibold text-warning-600 dark:text-warning-400">
                            {namHocStats.chuaKhoa}
                          </span>
                        </span>
                        <span>
                          Tỷ lệ:{" "}
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {namHocPercent.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    className="text-gray-400 dark:text-gray-500 ml-2"
                  />
                </button>

                {/* Progress bar năm học */}
                <div className="px-4 pb-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${namHocPercent}%` }}
                    />
                  </div>
                </div>

                {/* Layer 3: Học kỳ */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="p-4 space-y-2">
                      {namHoc.theoHocKy.map((hocKy) => {
                        const hocKyTotal =
                          hocKy.soLopDaKhoaDiem + hocKy.soLopChuaKhoaDiem;
                        const hocKyPercent =
                          hocKyTotal > 0
                            ? (hocKy.soLopDaKhoaDiem / hocKyTotal) * 100
                            : 0;
                        const key = `${namHoc.namHocId}-${hocKy.hocKyId}`;
                        const isHocKyExpanded = expandedHocKy.has(key);

                        return (
                          <div
                            key={hocKy.hocKyId}
                            className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-700 overflow-hidden"
                          >
                            <button
                              onClick={() =>
                                toggleHocKy(namHoc.namHocId, hocKy.hocKyId)
                              }
                              className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                  <FontAwesomeIcon
                                    icon={faLayerGroup}
                                    className="text-sm"
                                  />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <h6 className="text-sm font-medium text-gray-800 dark:text-white/90">
                                      Học kỳ {hocKy.hocKy}
                                    </h6>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span>
                                      Tổng:{" "}
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {hocKyTotal}
                                      </span>
                                    </span>
                                    <span>
                                      Đã chốt:{" "}
                                      <span className="font-semibold text-success-600 dark:text-success-400">
                                        {hocKy.soLopDaKhoaDiem}
                                      </span>
                                    </span>
                                    <span>
                                      Chưa chốt:{" "}
                                      <span className="font-semibold text-warning-600 dark:text-warning-400">
                                        {hocKy.soLopChuaKhoaDiem}
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <FontAwesomeIcon
                                icon={isHocKyExpanded ? faChevronUp : faChevronDown}
                                className="text-gray-400 dark:text-gray-500 ml-2 text-xs"
                              />
                            </button>

                            {/* Progress bar học kỳ */}
                            <div className="px-3 pb-2">
                              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                  style={{ width: `${hocKyPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Chi tiết học kỳ (có thể mở rộng thêm) */}
                            {isHocKyExpanded && (
                              <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                <div className="pt-2 grid grid-cols-2 gap-2">
                                  <div className="rounded-md bg-success-50 dark:bg-success-500/10 p-2">
                                    <div className="text-xs text-success-600 dark:text-success-400 mb-1">
                                      Đã chốt điểm
                                    </div>
                                    <div className="text-lg font-bold text-success-700 dark:text-success-300">
                                      {hocKy.soLopDaKhoaDiem}
                                    </div>
                                  </div>
                                  <div className="rounded-md bg-warning-50 dark:bg-warning-500/10 p-2">
                                    <div className="text-xs text-warning-600 dark:text-warning-400 mb-1">
                                      Chưa chốt điểm
                                    </div>
                                    <div className="text-lg font-bold text-warning-700 dark:text-warning-300">
                                      {hocKy.soLopChuaKhoaDiem}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white dark:bg-white/[0.03] dark:border-gray-700 p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chưa có dữ liệu lớp học phần theo năm học và học kỳ.
          </p>
        </div>
      )}
    </div>
  );
};

// Component chính
export default function DashboardOverview() {
  const [data, setData] = useState<ThongKeTongQuan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lopHocPhanStats = useMemo(() => {
    if (!data) return null;
    const { tongLopHocPhanDaKhoaDiem, tongLopHocPhanChuaKhoaDiem } = data;
    const total = tongLopHocPhanDaKhoaDiem + tongLopHocPhanChuaKhoaDiem;
    const lockedPercent = total ? (tongLopHocPhanDaKhoaDiem / total) * 100 : 0;
    const unlockedPercent = total
      ? (tongLopHocPhanChuaKhoaDiem / total) * 100
      : 0;
    return {
      total,
      lockedPercent,
      unlockedPercent,
    };
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = getCookie("access_token");
        const res = await fetch(
          "${ENV.BACKEND_URL}/bao-cao/thong-ke/tong-quan",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Không thể tải dữ liệu thống kê");
        }

        const json = (await res.json()) as ThongKeTongQuan;
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
          Tổng quan hệ thống
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Cái nhìn nhanh về quy mô đào tạo, tình trạng sinh viên và chất lượng
          học tập theo niên khóa
        </p>
      </div>

      {/* CTA - Truy cập nhanh */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-500/10 dark:to-indigo-500/10 dark:border-gray-800 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-600 dark:bg-brand-400/20 dark:text-brand-400">
              <FontAwesomeIcon icon={faGears} className="text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white/90">
                Truy cập nhanh
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chuyển đến các trang quản lý chính
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/quan-ly-sinh-vien"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-brand-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <FontAwesomeIcon icon={faUserGraduate} className="text-sm" />
              Quản lý sinh viên
            </Link>
            <Link
              href="/quan-ly-lop-hoc-phan"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
              Lớp học phần
            </Link>
            <Link
              href="/quan-ly-ctdt"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FontAwesomeIcon icon={faListCheck} className="text-sm" />
              Chương trình đào tạo
            </Link>
          </div>
        </div>
      </div>

      {/* Hàng 1: KPI chính (click để chuyển trang) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <MetricCard
          icon={faUserGraduate}
          iconBgColor="bg-brand-50 dark:bg-brand-500/10"
          iconColor="text-brand-600 dark:text-brand-400"
          title="Tổng sinh viên"
          value={data.sinhVien.tongSinhVien}
          subtitle="Toàn hệ thống"
          href="/quan-ly-sinh-vien"
        />
        <MetricCard
          icon={faChalkboardTeacher}
          iconBgColor="bg-success-50 dark:bg-success-500/10"
          iconColor="text-success-600 dark:text-success-400"
          title="Giảng viên"
          value={data.tongGiangVien}
          subtitle="Đang giảng dạy"
          href="/quan-ly-giang-vien"
        />
        <MetricCard
          icon={faLayerGroup}
          iconBgColor="bg-warning-50 dark:bg-warning-500/10"
          iconColor="text-warning-600 dark:text-warning-400"
          title="Lớp học phần"
          value={data.tongLopHocPhan}
          subtitle="Đang mở giảng dạy"
          href="/quan-ly-lop-hoc-phan"
        />
        <MetricCard
          icon={faBookOpen}
          iconBgColor="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
          title="Chương trình đào tạo"
          value={data.tongChuongTrinhDaoTao}
          subtitle="Toàn trường"
          href="/quan-ly-ctdt"
        />
      </div>

      {/* Hàng 2: Sinh viên theo tình trạng + Cơ cấu đào tạo & môn học */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card Sinh viên theo tình trạng */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Sinh viên theo tình trạng
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Phân loại nhanh theo trạng thái học tập
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/quan-ly-sinh-vien"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                Xem chi tiết
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <FontAwesomeIcon icon={faUsers} className="text-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <StatusItem
              icon={faUserCheck}
              label="Đang học"
              value={data.sinhVien.theoTinhTrang.dangHoc}
              total={data.sinhVien.tongSinhVien}
              color="success"
            />
            <StatusItem
              icon={faUserClock}
              label="Bảo lưu"
              value={data.sinhVien.theoTinhTrang.baoLuu}
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
              total={data.sinhVien.tongSinhVien}
              color="primary"
            />
          </div>
        </div>

        {/* Card Cơ cấu đào tạo & môn học */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Cơ cấu đào tạo
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Khoa, ngành, niên khóa, lớp & loại môn học
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/quan-ly-khoa"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Khoa
                </Link>
                <Link
                  href="/quan-ly-nganh"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Ngành
                </Link>
                <Link
                  href="/quan-ly-mon-hoc"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Môn học
                </Link>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                <FontAwesomeIcon icon={faBuilding} className="text-xl" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Khoa */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <FontAwesomeIcon icon={faBuilding} />
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
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <FontAwesomeIcon icon={faGraduationCap} />
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
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Niên khóa
                </span>
              </div>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                {data.tongNienKhoa}
              </p>
            </div>

            {/* Lớp */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Lớp niên chế
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                {data.tongLop}
              </p>
            </div>

            {/* Môn học theo loại - Full width */}
            <div className="col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400">
                    <FontAwesomeIcon icon={faBook} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-pink-700 dark:text-pink-300">
                      Môn học theo loại
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tổng {data.tongMonHoc.toLocaleString("vi-VN")} môn học
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm dark:bg-gray-950/60">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">
                    Đại cương
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                    {data.monHocTheoLoai.daiCuong}
                  </div>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm dark:bg-gray-950/60">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">
                    Chuyên ngành
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                    {data.monHocTheoLoai.chuyenNganh}
                  </div>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 text-center shadow-sm dark:bg-gray-950/60">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">
                    Tự chọn
                  </div>
                  <div className="mt-1 text-base font-semibold text-gray-800 dark:text-white/90">
                    {data.monHocTheoLoai.tuChon}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng 3: Lớp học phần & CTĐT theo ngành */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Lớp học phần theo tình trạng đánh giá học phần */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Lớp học phần theo tình trạng phê duyệt & chốt điểm
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Phân tích chi tiết theo năm học và học kỳ với bộ lọc linh hoạt
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/quan-ly-lop-hoc-phan"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                >
                  Quản lý LHP
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Link>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <FontAwesomeIcon icon={faChartColumn} />
                </div>
              </div>
            </div>

            <LopHocPhanLayer data={data} />
          </div>

          {/* Chương trình đào tạo theo ngành (top) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  CTĐT theo ngành (top)
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Ngành có nhiều chương trình đào tạo nhất
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/quan-ly-ctdt"
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
                >
                  Xem CTĐT
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Link>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <FontAwesomeIcon icon={faBarsProgress} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {data.chuongTrinhDaoTaoTheoNganh.slice(0, 5).map((item, index) => (
                <div
                  key={item.nganhId}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm dark:bg-gray-900/70"
                >
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white/90">
                      {item.tenNganh}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.maNganh}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                      {item.soChuongTrinh}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      CTĐT
                    </span>
                    <span className="ml-1 text-[10px] text-gray-400 dark:text-gray-500">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}

              {data.chuongTrinhDaoTaoTheoNganh.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chưa có dữ liệu chi tiết theo ngành.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cột trống để canh lề trên màn hình lớn */}
        <div className="hidden xl:col-span-2 xl:block" />
      </div>

      {/* Hàng 4: Biểu đồ phân bổ kết quả học tập chiếm full width */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Phân bổ kết quả học tập theo niên khóa
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              GPA và tỷ lệ đạt theo từng niên khóa
            </p>
          </div>
        </div>
        <BarChartOne data={data.gpaTheoNienKhoa} />
      </div>
    </div>
  );
}