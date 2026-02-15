"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import SearchableSelect from "@/components/form/SelectCustom";
// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

type GraduationCategoryKey =
  | "dangHoc"
  | "baoLuu"
  | "thoiHoc"
  | "trungBinh"
  | "kha"
  | "gioi"
  | "xuatSac";

type GraduationCategoryConfig = {
  key: GraduationCategoryKey;
  label: string;
  color: string;
};

const GRADUATION_CATEGORIES: GraduationCategoryConfig[] = [
  // Tình trạng học tập
  {
    key: "dangHoc",
    label: "Đang học",
    // Xanh lá nhấn mạnh đang học
    color: "#22C55E",
  },
  {
    key: "baoLuu",
    label: "Bảo lưu",
    // Vàng cảnh báo
    color: "#EAB308",
  },
  {
    key: "thoiHoc",
    label: "Thôi học",
    // Đỏ cảnh báo mạnh
    color: "#EF4444",
  },
  // Xếp loại kết quả học tập (màu khác biệt với tình trạng)
  {
    key: "trungBinh",
    label: "TN loại TB",
    color: "#38BDF8", // xanh dương nhạt
  },
  {
    key: "kha",
    label: "TN loại KHÁ",
    color: "#6366F1", // indigo
  },
  {
    key: "gioi",
    label: "TN loại GIỎI",
    color: "#9333EA", // tím đậm
  },
  {
    key: "xuatSac",
    label: "TN loại XUẤT SẮC",
    color: "#F97316", // cam nổi bật
  },
];

type MajorGraduationStats = {
  label: string;
  subLabel?: string;
  counts: Record<GraduationCategoryKey, number>;
};

// Dữ liệu GPA theo lớp trong một ngành
type GPAClassStats = {
  lopId: number;
  maLop: string;
  tenLop: string;
  tongSinhVien: number;
  trungBinh: number;
  kha: number;
  gioi: number;
  xuatSac: number;
  dangHoc?: number;
  baoLuu?: number;
  thoiHoc?: number;
};

// Dữ liệu GPA theo ngành trong một niên khóa
type GPAMajorStats = {
  nganhId: number;
  maNganh: string;
  tenNganh: string;
  tongSinhVien: number;
  trungBinh: number;
  kha: number;
  gioi: number;
  xuatSac: number;
  theoLop: GPAClassStats[];
  dangHoc?: number;
  baoLuu?: number;
  thoiHoc?: number;
};

// Dữ liệu GPA theo niên khóa (được dùng ở Dashboard)
export type GPACohortStats = {
  nienKhoaId: number;
  maNienKhoa: string;
  tenNienKhoa: string;
  tongSinhVien: number;
  trungBinh: number;
  kha: number;
  gioi: number;
  xuatSac: number;
  theoNganh: GPAMajorStats[];
  dangHoc?: number;
  baoLuu?: number;
  thoiHoc?: number;
};

type HoverInfo = {
  seriesIndex: number;
  dataPointIndex: number;
  rectLeft: number;
  rectTop: number;
  rectWidth: number;
  rectHeight: number;
} | null;

type GraduationStackedBarChartProps = {
  data: MajorGraduationStats[];
};

const GraduationTooltipPortal: React.FC<{
  hoverInfo: HoverInfo;
  data: MajorGraduationStats[];
}> = ({ hoverInfo, data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hoverInfo) return null;

  const { seriesIndex, dataPointIndex, rectLeft, rectTop, rectWidth, rectHeight } =
    hoverInfo;
  const major = data[dataPointIndex];
  const categoryConfig = GRADUATION_CATEGORIES[seriesIndex];

  if (!major || !categoryConfig) return null;

  const rawCount = major.counts[categoryConfig.key] ?? 0;
  const total = GRADUATION_CATEGORIES.reduce(
    (sum, cat) => sum + (major.counts[cat.key] ?? 0),
    0,
  );
  const percentage = total > 0 ? (rawCount / total) * 100 : 0;

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const containerClasses = isDark
    ? "rounded-md bg-slate-900 px-3 py-2 shadow-xl border border-slate-700 text-xs text-slate-100"
    : "rounded-md bg-white px-3 py-2 shadow-lg border border-slate-200 text-xs text-slate-800";

  const labelMutedClass = isDark ? "text-slate-400" : "text-slate-500";

  if (typeof window !== "undefined") {
    const padding = 12;
    const tooltipWidth = 260;
    const tooltipHeight = 120;

    // Vị trí tooltip cố định theo từng phân vùng trong bar:
    // - Canh giữa theo chiều ngang phân vùng
    // - Ưu tiên hiển thị phía trên phân vùng, nếu không đủ chỗ thì hiển thị phía dưới
    let left = rectLeft + rectWidth / 2 - tooltipWidth / 2;
    let top = rectTop - tooltipHeight - 8;

    // Nếu vượt phía trên màn hình -> chuyển xuống dưới bar
    if (top < padding) {
      top = rectTop + rectHeight + 8;
    }

    // Căn lề trái/phải để không bị tràn màn hình
    if (left < padding) {
      left = padding;
    } else if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - padding - tooltipWidth;
    }

    return createPortal(
      <div
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 99999,
          pointerEvents: "none",
          maxWidth: 260,
        }}
        className={containerClasses}
      >
        <div className="font-semibold mb-1">
          {major.label}
          {major.subLabel && (
            <span className="ml-1 text-[11px] font-normal opacity-70">
              ({major.subLabel})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block h-2 w-2 rounded-sm"
            style={{ backgroundColor: categoryConfig.color }}
          ></span>
          <span className="font-medium">{categoryConfig.label}</span>
        </div>
        <div className="space-y-0.5">
          <div>
            <span className={labelMutedClass}>Số lượng:</span>{" "}
            <span className="font-medium">{rawCount.toLocaleString()}</span>
          </div>
          <div>
            <span className={labelMutedClass}>Tỷ lệ:</span>{" "}
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  // Phòng trường hợp window không tồn tại (SSR safety), nhưng thực tế component này chỉ chạy client
  return null;
};

/**
 * Biểu đồ stacked percentage bar chart cho kết quả tốt nghiệp theo ngành.
 * - Mỗi ngành = 1 thanh bar 100%
 * - Bên trong chia thành các đoạn theo loại kết quả tốt nghiệp
 */
const GraduationStackedBarChart: React.FC<GraduationStackedBarChartProps> = ({
  data,
}) => {
  const categories = data.map((item) => item.label);

  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);

  const series = GRADUATION_CATEGORIES.map((cat) => ({
    name: cat.label,
    data: data.map((item) => item.counts[cat.key] ?? 0),
  }));

  const options: ApexOptions = {
    colors: GRADUATION_CATEGORIES.map((cat) => cat.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      stacked: true,
      stackType: "100%",
      toolbar: {
        show: false,
      },
      events: {
        dataPointMouseEnter: (
          event: any,
          _chartContext: any,
          config: any,
        ) => {
          if (!event) return;
          const e = event as MouseEvent;
          const target = e.target as HTMLElement | null;
          if (!target) return;

          const rect = target.getBoundingClientRect();

          setHoverInfo({
            seriesIndex: config.seriesIndex,
            dataPointIndex: config.dataPointIndex,
            rectLeft: rect.left,
            rectTop: rect.top,
            rectWidth: rect.width,
            rectHeight: rect.height,
          });
        },
        dataPointMouseLeave: () => {
          setHoverInfo(null);
        },
        mouseLeave: () => {
          setHoverInfo(null);
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: 20,
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    xaxis: {
      categories,
      labels: {
        formatter: (val: string | number) => `${val}%`,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      markers: {
        size: 4,
        shape: "circle",
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
        },
      },
    },
    grid: {
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: false,
    },
  };

  const chartHeight = Math.max(260, data.length * 42);

  return (
    <div className="max-w-full overflow-x-auto overflow-y-visible custom-scrollbar">
      <div className="min-w-[600px]">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={chartHeight}
        />
      </div>

      {/* Tooltip custom vẽ bằng Portal, vượt ra ngoài mọi container */}
      <GraduationTooltipPortal hoverInfo={hoverInfo} data={data} />
    </div>
  );
};

type BarChartOneProps = {
  data: GPACohortStats[];
};

/**
 * BarChartOne
 * - Nhận dữ liệu GPA theo niên khóa / ngành / lớp
 * - Cho phép chọn niên khóa, xem biểu đồ phân bổ theo ngành
 * - Mở rộng từng ngành để xem chi tiết theo lớp (nested chart)
 */
const BarChartOne: React.FC<BarChartOneProps> = ({ data }) => {
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [expandedMajorId, setExpandedMajorId] = useState<number | null>(null);

  // Chuẩn hóa dữ liệu chọn niên khóa
  const cohortOptions = useMemo(
    () =>
      data.map((cohort) => ({
        value: String(cohort.nienKhoaId),
        label: cohort.tenNienKhoa,
      })),
    [data],
  );

  useEffect(() => {
    if (!selectedCohortId && data.length > 0) {
      setSelectedCohortId(String(data[0].nienKhoaId));
    }
  }, [data, selectedCohortId]);

  const selectedCohort = useMemo(
    () =>
      data.find((c) => String(c.nienKhoaId) === selectedCohortId) ?? data[0],
    [data, selectedCohortId],
  );

  const calculateCounts = (
    total: number,
    trungBinh: number,
    kha: number,
    gioi: number,
    xuatSac: number,
    dangHoc?: number,
    baoLuu?: number,
    thoiHoc?: number,
  ): Record<GraduationCategoryKey, number> => {
    return {
      dangHoc: dangHoc ?? 0,
      baoLuu: baoLuu ?? 0,
      thoiHoc: thoiHoc ?? 0,
      trungBinh,
      kha,
      gioi,
      xuatSac,
    };
  };

  // Dữ liệu biểu đồ theo ngành cho niên khóa được chọn
  const majorChartData: MajorGraduationStats[] = useMemo(() => {
    if (!selectedCohort) return [];

    if (!selectedCohort.theoNganh || selectedCohort.theoNganh.length === 0) {
      // Fallback: chỉ có tổng toàn khóa
      return [
        {
          label: selectedCohort.tenNienKhoa,
          subLabel: selectedCohort.maNienKhoa,
          counts: calculateCounts(
            selectedCohort.tongSinhVien,
            selectedCohort.trungBinh,
            selectedCohort.kha,
            selectedCohort.gioi,
            selectedCohort.xuatSac,
            selectedCohort.dangHoc,
            selectedCohort.baoLuu,
            selectedCohort.thoiHoc,
          ),
        },
      ];
    }

    return selectedCohort.theoNganh.map((nganh) => ({
      label: nganh.tenNganh,
      subLabel: nganh.maNganh,
      counts: calculateCounts(
        nganh.tongSinhVien,
        nganh.trungBinh,
        nganh.kha,
        nganh.gioi,
        nganh.xuatSac,
        nganh.dangHoc,
        nganh.baoLuu,
        nganh.thoiHoc,
      ),
    }));
  }, [selectedCohort]);

  // Dữ liệu biểu đồ theo lớp cho ngành đang mở rộng
  const classChartData: MajorGraduationStats[] = useMemo(() => {
    if (!selectedCohort || !expandedMajorId) return [];
    const major = selectedCohort.theoNganh?.find(
      (m) => m.nganhId === expandedMajorId,
    );

    if (!major || !major.theoLop?.length) return [];

    return major.theoLop.map((lop) => ({
      label: lop.maLop,
      subLabel: lop.tenLop,
      counts: calculateCounts(
        lop.tongSinhVien,
        lop.trungBinh,
        lop.kha,
        lop.gioi,
        lop.xuatSac,
        lop.dangHoc,
        lop.baoLuu,
        lop.thoiHoc,
      ),
    }));
  }, [expandedMajorId, selectedCohort]);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
        Không có dữ liệu GPA để hiển thị.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Phân bổ kết quả học tập
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Xem phân bố sinh viên theo niên khóa → ngành → lớp, theo mức độ tốt
            nghiệp
          </p>
        </div>

        {/* Chọn niên khóa */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Niên khóa
          </span>
          <div className="min-w-[220px]">
            <SearchableSelect
              options={cohortOptions}
              placeholder="Chọn niên khóa"
              defaultValue={
                selectedCohortId ?? (data[0] ? String(data[0].nienKhoaId) : "")
              }
              onChange={(value) => {
                setSelectedCohortId(value || null);
                setExpandedMajorId(null);
              }}
              showSecondary
              secondarySeparator=" • "
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {GRADUATION_CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Tổng quan niên khóa */}
      {selectedCohort && (
        <div className="mb-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-900/70 dark:text-gray-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Niên khóa
              </div>
              <div className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                {selectedCohort.tenNienKhoa}{" "}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({selectedCohort.maNienKhoa})
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <div className="text-gray-500 dark:text-gray-400">
                  Tổng sinh viên
                </div>
                <div className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-white/90">
                  {selectedCohort.tongSinhVien.toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="flex flex-wrap gap-3">
                {["trungBinh", "kha", "gioi", "xuatSac"].map((key) => {
                  const cat =
                    GRADUATION_CATEGORIES.find((c) => c.key === key)!;
                  const value = (selectedCohort as any)[key] ?? 0;
                  const percentage =
                    selectedCohort.tongSinhVien > 0
                      ? (value / selectedCohort.tongSinhVien) * 100
                      : 0;
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400">
                        {cat.label}:{" "}
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {percentage.toFixed(1)}%
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "dangHoc", label: "Đang học", color: "#22C55E" },
                  { key: "baoLuu", label: "Bảo lưu", color: "#FACC15" },
                  { key: "thoiHoc", label: "Thôi học", color: "#EF4444" },
                ].map((item) => {
                  const value = (selectedCohort as any)[item.key] ?? 0;
                  const percentage =
                    selectedCohort.tongSinhVien > 0
                      ? (value / selectedCohort.tongSinhVien) * 100
                      : 0;
                  return (
                    <div
                      key={item.key}
                      className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400"
                    >
                      <span
                        className="h-1.5 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>
                        {item.label}:{" "}
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {value.toLocaleString("vi-VN")} (
                          {percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Biểu đồ theo ngành */}
      <div className="space-y-4">
        <GraduationStackedBarChart data={majorChartData} />

        {/* Danh sách ngành + mở rộng xem theo lớp */}
        {selectedCohort?.theoNganh?.length ? (
          <div className="mt-4 space-y-2">
            {selectedCohort.theoNganh.map((nganh) => {
              const isExpanded = expandedMajorId === nganh.nganhId;
              return (
                <div
                  key={nganh.nganhId}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={() =>
                      setExpandedMajorId(
                        isExpanded ? null : nganh.nganhId,
                      )
                    }
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        {nganh.tenNganh}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {nganh.maNganh} •{" "}
                        {nganh.tongSinhVien.toLocaleString("vi-VN")} sinh
                        viên • {nganh.theoLop.length} lớp
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-xs">
                        {["trungBinh", "kha", "gioi", "xuatSac"].map(
                          (key) => {
                            const cat =
                              GRADUATION_CATEGORIES.find(
                                (c) => c.key === key,
                              )!;
                            const value = (nganh as any)[key] ?? 0;
                            const percentage =
                              nganh.tongSinhVien > 0
                                ? (value / nganh.tongSinhVien) * 100
                                : 0;
                            return (
                              <span
                                key={key}
                                className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                              >
                                <span
                                  className="h-1.5 w-3 rounded-full"
                                  style={{
                                    backgroundColor: cat.color,
                                  }}
                                />
                                <span>{percentage.toFixed(0)}%</span>
                              </span>
                            );
                          },
                        )}
                        {[
                          { key: "dangHoc", label: "Đang học", color: "#22C55E" },
                          { key: "baoLuu", label: "Bảo lưu", color: "#FACC15" },
                          { key: "thoiHoc", label: "Thôi học", color: "#EF4444" },
                        ].map((item) => {
                          const value = (nganh as any)[item.key] ?? 0;
                          return (
                            <span
                              key={item.key}
                              className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span>
                                {item.label}:{" "}
                                <span className="font-medium">
                                  {value.toLocaleString("vi-VN")}
                                </span>
                              </span>
                            </span>
                          );
                        })}
                      </div>
                      <span className="ml-1 text-xs font-medium text-brand-600 dark:text-brand-400">
                        {isExpanded ? "Thu gọn" : "Xem theo lớp"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && classChartData.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <GraduationStackedBarChart data={classChartData} />
                      <div className="mt-3 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                        {nganh.theoLop.map((lop) => (
                          <div
                            key={lop.lopId}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5 dark:bg-gray-950/60"
                          >
                            <div>
                              <div className="font-medium text-gray-800 dark:text-white/90">
                                {lop.maLop}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                {lop.tenLop}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px]">
                              <span>
                                Tổng:{" "}
                                <span className="font-semibold">
                                  {lop.tongSinhVien.toLocaleString("vi-VN")} SV
                                </span>
                              </span>
                              {[
                                {
                                  key: "dangHoc",
                                  label: "ĐH",
                                  color: "#22C55E",
                                },
                                {
                                  key: "baoLuu",
                                  label: "BL",
                                  color: "#FACC15",
                                },
                                {
                                  key: "thoiHoc",
                                  label: "TH",
                                  color: "#EF4444",
                                },
                              ].map((item) => {
                                const value = (lop as any)[item.key] ?? 0;
                                return (
                                  <span
                                    key={item.key}
                                    className="flex items-center gap-1"
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{ backgroundColor: item.color }}
                                    />
                                    <span>
                                      {item.label}:{" "}
                                      <span className="font-semibold">
                                        {value.toLocaleString("vi-VN")}
                                      </span>
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BarChartOne;
