"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import BackButton from "../BackButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faDownload,
  faEye,
  faFileExcel,
  faFileInvoice,
  faSpinner,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";

// ==================== TYPES ====================

type GioiTinh = "NAM" | "NU" | "KHONG_XAC_DINH";
type LoaiMon = "CHUYEN_NGANH" | "DAI_CUONG" | "TU_CHON";

interface SinhVien {
  id: number;
  maSinhVien: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: GioiTinh;
  tinhTrang: "DANG_HOC" | "DA_TOT_NGHIEP" | string;
  maLop: string;
  tenLop: string;
  maNganh: string;
  tenNganh: string;
  maNienKhoa: string;
  tenNienKhoa: string;
}

interface LopHocPhan {
  lopHocPhanId: number;
  maLopHocPhan: string;
  khoaDiem: boolean;
  hocKy: number;
  maNamHoc: string;
  tenNamHoc: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  diemQuaTrinh: number | null;
  diemThanhPhan: number | null;
  diemThi: number | null;
  tbchp: number | null;
  diemHe4: number | null;
  diemChu: string | null;
}

interface KetQuaMon {
  monHocId: number;
  maMonHoc: string;
  tenMonHoc: string;
  soTinChi: number;
  loaiMonHoc: LoaiMon | string;
  lopHocPhans: LopHocPhan[];
}

interface KetQuaXetTotNghiep {
  gpa: number;
  xepLoaiTotNghiep: "Trung bình" | "Khá" | "Giỏi" | "Xuất sắc" | null | string;
}

interface KetQuaSinhVienResponse {
  sinhVien: SinhVien;
  ketQuaTheoMon: KetQuaMon[];
  tbchpHe10: number;
  gpa: number;
  xepLoaiHocLuc: "Trung bình" | "Khá" | "Giỏi" | "Xuất sắc" | null | string;
  ketQuaXetTotNghiep?: KetQuaXetTotNghiep | null;
}

// ==================== HELPERS ====================

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const formatDateVN = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const getGioiTinhLabel = (gioiTinh: string): string => {
  switch (gioiTinh) {
    case "NAM":
      return "Nam";
    case "NU":
      return "Nữ";
    case "KHONG_XAC_DINH":
      return "Không XĐ";
    default:
      return gioiTinh;
  }
};

const getGioiTinhColor = (
  gioiTinh: string
): "primary" | "success" | "warning" | "info" | "error" => {
  switch (gioiTinh) {
    case "NAM":
      return "primary";
    case "NU":
      return "error";
    case "KHONG_XAC_DINH":
      return "warning";
    default:
      return "info";
  }
};

const getLoaiMonLabel = (loaiMon: string): string => {
  switch (loaiMon) {
    case "CHUYEN_NGANH":
      return "Chuyên ngành";
    case "DAI_CUONG":
      return "Đại cương";
    case "TU_CHON":
      return "Tự chọn";
    default:
      return loaiMon;
  }
};

const getLoaiMonColor = (
  loaiMon: string
): "primary" | "success" | "warning" | "info" | "error" => {
  switch (loaiMon) {
    case "CHUYEN_NGANH":
      return "primary";
    case "DAI_CUONG":
      return "success";
    case "TU_CHON":
      return "warning";
    default:
      return "info";
  }
};

const getXepLoaiColor = (
  xepLoai?: string | null
): "primary" | "success" | "warning" | "info" | "error" => {
  if (!xepLoai) return "info";
  const normalized = xepLoai.toLowerCase();
  if (normalized.includes("xuất sắc") || normalized.includes("xuat sac")) return "primary";
  if (normalized.includes("giỏi") || normalized.includes("gioi")) return "success";
  if (normalized.includes("khá") || normalized.includes("kha")) return "info";
  if (normalized.includes("trung bình") || normalized.includes("trung binh")) return "warning";
  return "info";
};

const getTinhTrangLabel = (tinhTrang: string): string => {
  switch (tinhTrang) {
    case "DA_TOT_NGHIEP":
      return "Đã tốt nghiệp";
    case "DANG_HOC":
      return "Đang học";
    default:
      return tinhTrang;
  }
};

const getTinhTrangColor = (
  tinhTrang: string
): "primary" | "success" | "warning" | "info" | "error" => {
  switch (tinhTrang) {
    case "DA_TOT_NGHIEP":
      return "success";
    case "DANG_HOC":
      return "primary";
    default:
      return "info";
  }
};

const getTrangThaiKhoaDiemLabel = (khoaDiem: boolean): string =>
  khoaDiem ? "Đã khoá điểm" : "Chưa khoá";

const getTrangThaiKhoaDiemColor = (
  khoaDiem: boolean
): "primary" | "success" | "warning" | "info" | "error" =>
  // Đã khoá điểm -> đỏ, Chưa khoá điểm -> xanh
  khoaDiem ? "error" : "success";

const getDiemChuColor = (
  diemChu: string | null
): "primary" | "success" | "warning" | "info" | "error" => {
  if (!diemChu) return "info";
  const d = diemChu.toUpperCase();
  if (["A+", "A"].includes(d)) return "primary";
  if (["B+", "B"].includes(d)) return "success";
  if (["C+", "C"].includes(d)) return "info";
  if (["D+", "D"].includes(d)) return "warning";
  return "error";
};

const formatNumber = (value: number | null | undefined, digits = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return value.toFixed(digits);
};

// Sắp xếp lớp học phần theo ngày bắt đầu (cũ -> mới)
const sortLopHocPhansByNgayBatDau = (lopHocPhans: LopHocPhan[]): LopHocPhan[] => {
  return [...lopHocPhans].sort((a, b) => {
    const da = new Date(a.ngayBatDau).getTime();
    const db = new Date(b.ngayBatDau).getTime();
    return da - db;
  });
};

// Tìm lớp học phần có TBCHP cao nhất (nếu TBCHP trùng nhau thì lấy lớp có ngày bắt đầu mới hơn)
const findBestLopHocPhan = (lopHocPhans: LopHocPhan[]): LopHocPhan | null => {
  if (!lopHocPhans.length) return null;
  return lopHocPhans.reduce<LopHocPhan | null>((best, current) => {
    if (!best) return current;
    const tbBest = best.tbchp ?? -Infinity;
    const tbCurrent = current.tbchp ?? -Infinity;
    if (tbCurrent > tbBest) return current;
    if (tbCurrent === tbBest) {
      const dBest = new Date(best.ngayBatDau).getTime();
      const dCurrent = new Date(current.ngayBatDau).getTime();
      return dCurrent > dBest ? current : best;
    }
    return best;
  }, null);
};

// ==================== MAIN COMPONENT ====================

const BangDiemSV: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [data, setData] = useState<KetQuaSinhVienResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    id: number;
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const [expandedMonHocIds, setExpandedMonHocIds] = useState<number[]>([]);

  // Modal xem chi tiết lớp học phần cho 1 môn
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailMon, setDetailMon] = useState<KetQuaMon | null>(null);

  // Modal xuất phiếu điểm
  const [isExportPhieuDiemModalOpen, setIsExportPhieuDiemModalOpen] = useState(false);
  const [isExportingPhieuDiem, setIsExportingPhieuDiem] = useState(false);

  // Lấy sinhVienId:
  // - Ưu tiên query param ?sinhVienId hoặc ?id
  // - Nếu không có thì cố gắng lấy từ segment cuối của pathname (khi dùng [id] route)
  const sinhVienId = useMemo(() => {
    const idFromQuery = searchParams.get("sinhVienId") || searchParams.get("id");
    if (idFromQuery) return idFromQuery;
    if (!pathname) return null;
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return last && last !== "bang-diem" ? last : null;
  }, [searchParams, pathname]);

  const showAlert = (
    variant: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    setAlert({
      id: Date.now(),
      variant,
      title,
      message,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!sinhVienId) {
        setError("Không xác định được sinh viên cần xem bảng điểm.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const accessToken = getCookie("access_token");
        const res = await fetch(
          `http://localhost:3000/ket-qua/sinh-vien/${encodeURIComponent(sinhVienId)}`,
          {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const message = err?.message || "Không thể tải dữ liệu bảng điểm sinh viên.";
          setError(message);
          showAlert("error", "Lỗi", message);
        } else {
          const json: KetQuaSinhVienResponse = await res.json();
          setData(json);
        }
      } catch {
        const message = "Có lỗi xảy ra khi kết nối đến máy chủ.";
        setError(message);
        showAlert("error", "Lỗi", message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sinhVienId]);

  const toggleExpanded = (monHocId: number) => {
    setExpandedMonHocIds((prev) =>
      prev.includes(monHocId) ? prev.filter((id) => id !== monHocId) : [...prev, monHocId]
    );
  };

  const isExpanded = (monHocId: number) => expandedMonHocIds.includes(monHocId);

  const openDetailModal = (mon: KetQuaMon) => {
    setDetailMon(mon);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailMon(null);
  };

  // Xử lý xuất phiếu điểm
  const handleExportPhieuDiem = async () => {
    if (!sinhVienId) return;

    setIsExportingPhieuDiem(true);

    try {
      const accessToken = getCookie("access_token");
      const res = await fetch(
        `http://localhost:3000/bao-cao/phieu-diem/${sinhVienId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.ok) {
        // Xử lý tải file Excel
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Bảng điểm cá nhân của SV ${sinhVien?.maSinhVien || sinhVienId}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showAlert("success", "Thành công", `Đã xuất phiếu điểm cho sinh viên ${sinhVien?.hoTen || ""}`);
        setIsExportPhieuDiemModalOpen(false);
      } else {
        const err = await res.json();
        setIsExportPhieuDiemModalOpen(false);
        showAlert("error", "Lỗi", err.message || "Không thể xuất phiếu điểm");
      }
    } catch (err) {
      console.error("Lỗi xuất phiếu điểm:", err);
      setIsExportPhieuDiemModalOpen(false);
      showAlert("error", "Lỗi", "Có lỗi xảy ra khi xuất phiếu điểm");
    } finally {
      setIsExportingPhieuDiem(false);
    }
  };

  const sinhVien = data?.sinhVien;
  const ketQuaTheoMon = data?.ketQuaTheoMon || [];
  const bestGPA = data?.gpa ?? null;
  const bestTbchpHe10 = data?.tbchpHe10 ?? null;

  const totalSoTinChi = useMemo(
    () => ketQuaTheoMon.reduce((sum, item) => sum + (item.soTinChi || 0), 0),
    [ketQuaTheoMon]
  );

  const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <FontAwesomeIcon
      icon={isOpen ? faChevronUp : faChevronDown}
      className="w-4 h-4 transition-transform duration-200"
    />
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <BackButton />
      </div>

      <PageBreadcrumb pageTitle="Bảng điểm sinh viên" />

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-10">
        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              key={alert.id}
              variant={alert.variant}
              title={alert.title}
              message={alert.message}
              dismissible
              autoDismiss
              duration={600000}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đang tải dữ liệu bảng điểm sinh viên...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faCircleExclamation} className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-md">{error}</p>
          </div>
        )}

        {!loading && !error && sinhVien && (
          <>
            {/* Thông tin cá nhân */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                    Thông tin sinh viên
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chi tiết hồ sơ học tập của sinh viên.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Họ và tên
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {sinhVien.hoTen}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mã SV:{" "}
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      {sinhVien.maSinhVien}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Lớp - Khóa
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {sinhVien.tenLop}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mã lớp:{" "}
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {sinhVien.maLop}
                    </span>{" "}
                    • Niên khóa:{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {sinhVien.tenNienKhoa}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Ngành đào tạo
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {sinhVien.tenNganh}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mã ngành:{" "}
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {sinhVien.maNganh}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Ngày sinh & Giới tính
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {formatDateVN(sinhVien.ngaySinh)}
                  </p>
                  <div className="mt-2">
                    <Badge variant="solid" color={getGioiTinhColor(sinhVien.gioiTinh)}>
                      {getGioiTinhLabel(sinhVien.gioiTinh)}
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                    Tình trạng
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="solid" color={getTinhTrangColor(sinhVien.tinhTrang)}>
                      {getTinhTrangLabel(sinhVien.tinhTrang)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tổng số tín chỉ:{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {totalSoTinChi}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            {/* Thông tin tổng quan kết quả học tập */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                    Tổng quan kết quả học tập
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    GPA, điểm trung bình học phần hệ 10 và xếp loại.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GPA */}
                <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-blue-50 to-sky-50 p-5 dark:border-blue-800/70 dark:from-blue-900/30 dark:via-sky-900/20 dark:to-sky-900/10">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/10 dark:bg-blue-400/10" />
                  <p className="text-xs uppercase tracking-wide text-blue-700/80 dark:text-blue-200/80 mb-1">
                    GPA (Hệ 4)
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-blue-800 dark:text-blue-100">
                      {formatNumber(bestGPA, 2)}
                    </span>
                    <span className="text-xs text-blue-700/80 dark:text-blue-200/80 mb-1">
                      / 4.00
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-100/80">
                    Điểm trung bình tích lũy theo thang điểm 4.
                  </p>
                </div>

                {/* TBCHP hệ 10 */}
                <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-indigo-50 to-purple-50 p-5 dark:border-indigo-800/70 dark:from-indigo-900/30 dark:via-purple-900/20 dark:to-purple-900/10">
                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10" />
                  <p className="text-xs uppercase tracking-wide text-indigo-700/80 dark:text-indigo-200/80 mb-1">
                    Điểm TBCHP (Hệ 10)
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-extrabold text-indigo-800 dark:text-indigo-100">
                      {formatNumber(bestTbchpHe10, 2)}
                    </span>
                    <span className="text-xs text-indigo-700/80 dark:text-indigo-200/80 mb-1">
                      / 10.00
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-100/80">
                    Điểm trung bình cộng của các học phần đã học.
                  </p>
                </div>

                {/* Xếp loại & tốt nghiệp */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-800/70 dark:bg-emerald-900/20">
                  <p className="text-xs uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/80 mb-1">
                    Xếp loại học lực & tốt nghiệp
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 dark:text-gray-300">Học lực:</span>
                      <Badge variant="solid" color={getXepLoaiColor(data?.xepLoaiHocLuc || null)}>
                        {data?.xepLoaiHocLuc || "Đang học"}
                      </Badge>
                    </div>

                    {sinhVien.tinhTrang === "DA_TOT_NGHIEP" && data?.ketQuaXetTotNghiep && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          Xếp loại tốt nghiệp:
                        </span>
                        <Badge
                          variant="solid"
                          color={getXepLoaiColor(
                            data.ketQuaXetTotNghiep.xepLoaiTotNghiep || null
                          )}
                        >
                          {data.ketQuaXetTotNghiep.xepLoaiTotNghiep || "Đang học"}
                        </Badge>
                      </div>
                    )}

                    {sinhVien.tinhTrang === "DA_TOT_NGHIEP" && data?.ketQuaXetTotNghiep && (
                      <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-200/80">
                        GPA xét tốt nghiệp:{" "}
                        <span className="font-semibold">
                          {formatNumber(data.ketQuaXetTotNghiep.gpa, 2)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Bảng điểm chi tiết */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                    Bảng điểm chi tiết theo môn học
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nhấn vào từng dòng để xem chi tiết các lớp học phần của môn học đó.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setIsExportPhieuDiemModalOpen(true)}
                  startIcon={<FontAwesomeIcon icon={faDownload} />}
                >
                  Xuất phiếu điểm
                </Button>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <div className="min-w-[950px] text-xs leading-tight">
                    <Table>
                      {/* Header */}
                      <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                        <TableRow className="grid grid-cols-[3%_4%_9%_18%_5%_7%_7%_7%_7%_7%_7%_6%_13%]">
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            STT
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            <span className="sr-only">Mở rộng</span>
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                          >
                            Mã môn học
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                          >
                            Tên môn học
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Số TC
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Điểm QT
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Điểm TP
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Điểm thi
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            TBCHP
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Điểm số
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Điểm chữ
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                          >
                            Loại môn
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap"
                          >
                            Hành động
                          </TableCell>
                        </TableRow>
                      </TableHeader>

                      {/* Body */}
                      <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                        {ketQuaTheoMon.map((mon, idx) => {
                          const sortedLops = sortLopHocPhansByNgayBatDau(mon.lopHocPhans || []);
                          const bestLop = findBestLopHocPhan(sortedLops);

                          const renderMultiScore = (
                            getValue: (lop: LopHocPhan) => number | string | null | undefined,
                            isNumeric = true
                          ) => {
                            if (!sortedLops.length) return "-";
                            return (
                              <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
                                {sortedLops.map((lop, i) => {
                                  const value = getValue(lop);
                                  const isBest = bestLop && lop.lopHocPhanId === bestLop.lopHocPhanId;
                                  const display = isNumeric
                                    ? formatNumber(
                                        typeof value === "number"
                                          ? value
                                          : value !== null && value !== undefined
                                          ? Number(value)
                                          : null
                                      )
                                    : value || "-";

                                  return (
                                    <React.Fragment key={lop.lopHocPhanId}>
                                      {i > 0 && (
                                        <span className="text-gray-400 dark:text-gray-500">|</span>
                                      )}
                                      <span
                                        className={
                                          isBest
                                            ? "font-semibold text-blue-700 dark:text-blue-300"
                                            : "text-gray-800 dark:text-gray-200"
                                        }
                                      >
                                        {display}
                                      </span>
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            );
                          };

                          return (
                            <React.Fragment key={mon.monHocId}>
                              {/* Main row */}
                              <TableRow
                                className={`grid grid-cols-[3%_4%_9%_18%_5%_7%_7%_7%_7%_7%_7%_6%_13%] items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                                  isExpanded(mon.monHocId)
                                    ? "bg-gray-50 dark:bg-white/[0.02]"
                                    : ""
                                }`}
                              >
                                {/* STT */}
                                <TableCell className="px-2 py-2 text-center text-gray-700 dark:text-gray-300">
                                  {idx + 1}
                                </TableCell>

                                {/* Expand btn */}
                                <TableCell className="px-2 py-2 flex items-center justify-center">
                                  <button
                                    onClick={() => toggleExpanded(mon.monHocId)}
                                    disabled={!sortedLops.length}
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors ${
                                      sortedLops.length
                                        ? "hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                        : "opacity-30 cursor-not-allowed"
                                    }`}
                                  >
                                    <ChevronIcon isOpen={isExpanded(mon.monHocId)} />
                                  </button>
                                </TableCell>

                                {/* Mã môn */}
                                <TableCell className="px-2 py-2 text-gray-900 dark:text-white/90 font-medium">
                                  <span
                                    className="inline-block max-w-[180px] truncate align-middle"
                                    title={mon.maMonHoc}
                                  >
                                    {mon.maMonHoc}
                                  </span>
                                </TableCell>

                                {/* Tên môn */}
                                <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90">
                                  <span
                                    className="inline-block max-w-[220px] truncate align-middle"
                                    title={mon.tenMonHoc}
                                  >
                                    {mon.tenMonHoc}
                                  </span>
                                </TableCell>

                                {/* Số TC */}
                                <TableCell className="px-2 py-2 text-center text-gray-700 dark:text-gray-300 font-medium">
                                  {mon.soTinChi}
                                </TableCell>

                                {/* Điểm QT */}
                                <TableCell className="px-2 py-2">
                                  {renderMultiScore((lop) => lop.diemQuaTrinh)}
                                </TableCell>

                                {/* Điểm TP */}
                                <TableCell className="px-2 py-2">
                                  {renderMultiScore((lop) => lop.diemThanhPhan)}
                                </TableCell>

                                {/* Điểm thi */}
                                <TableCell className="px-2 py-2">
                                  {renderMultiScore((lop) => lop.diemThi)}
                                </TableCell>

                                {/* TBCHP */}
                                <TableCell className="px-2 py-2">
                                  {renderMultiScore((lop) => lop.tbchp)}
                                </TableCell>

                                {/* Điểm số (hệ 4) */}
                                <TableCell className="px-2 py-2">
                                  {renderMultiScore((lop) => lop.diemHe4)}
                                </TableCell>

                                {/* Điểm chữ */}
                                <TableCell className="px-2 py-2">
                                  {renderMultiScore((lop) => lop.diemChu, false)}
                                </TableCell>

                                {/* Loại môn */}
                                <TableCell className="px-2 py-2 whitespace-nowrap flex items-center justify-center">
                                  <Badge
                                    variant="solid"
                                    size="sm"
                                    className="text-[11px]"
                                    color={getLoaiMonColor(mon.loaiMonHoc)}
                                  >
                                    {getLoaiMonLabel(mon.loaiMonHoc)}
                                  </Badge>
                                </TableCell>

                                {/* Hành động */}
                                <TableCell className="px-2 py-2 text-center whitespace-nowrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="whitespace-nowrap"
                                    onClick={() => openDetailModal(mon)}
                                  >
                                    <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>

                              {/* Expanded rows: chi tiết lớp học phần */}
                              {isExpanded(mon.monHocId) && sortedLops.length > 0 && (
                                <TableRow className="bg-gray-50/80 dark:bg-white/[0.02] text-[11px] leading-tight">
                                  <TableCell
                                    cols={13}
                                    className="px-4 py-3 border-t border-gray-200 dark:border-white/[0.06]"
                                  >
                                    <div className="text-sm text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                                      <FontAwesomeIcon
                                        icon={faCircleInfo}
                                        className="text-blue-500 h-3.5 w-3.5"
                                      />
                                      <span>
                                        Danh sách các lớp học phần của môn{" "}
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                          {mon.tenMonHoc}
                                        </span>{" "}
                                        mà sinh viên đã học (sắp xếp theo thời gian bắt đầu học).
                                      </span>
                                    </div>

                                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-950/40 text-[11px] leading-tight">
                                      <Table>
                                        <TableHeader className="border-b border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-900/60 text-[11px]">
                                          <TableRow className="grid grid-cols-[14%_10%_8%_8%_10%_10%_8%_8%_8%_14%]">
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300"
                                            >
                                              Mã lớp học phần
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              Trạng thái
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              Năm học
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              Học kỳ
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              Ngày bắt đầu
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              Ngày kết thúc
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              QT
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              TP
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              Thi
                                            </TableCell>
                                            <TableCell
                                              isHeader
                                              className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center"
                                            >
                                              TBCHP / Điểm chữ
                                            </TableCell>
                                          </TableRow>
                                        </TableHeader>

                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                          {sortedLops.map((lop) => {
                                            const isBest =
                                              bestLop &&
                                              lop.lopHocPhanId === bestLop.lopHocPhanId;
                                            const bestRowClass = isBest
                                              ? "bg-blue-50/80 dark:bg-blue-900/20"
                                              : "";
                                            return (
                                              <TableRow
                                                key={lop.lopHocPhanId}
                                                className={`grid grid-cols-[14%_10%_8%_8%_10%_10%_8%_8%_8%_14%] text-[11px] leading-tight ${bestRowClass}`}
                                              >
                                                <TableCell className="px-2 py-2 text-gray-900 dark:text-white/90 font-medium flex items-center">
                                                  <span
                                                    className="inline-block max-w-[180px] truncate align-middle"
                                                    title={lop.maLopHocPhan}
                                                  >
                                                    {lop.maLopHocPhan}
                                                  </span>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center">
                                                  <Badge
                                                    variant="solid"
                                                    size="sm"
                                                    className="text-[11px]"
                                                    color={getTrangThaiKhoaDiemColor(lop.khoaDiem)}
                                                  >
                                                    {getTrangThaiKhoaDiemLabel(lop.khoaDiem)}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  {lop.tenNamHoc}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  HK {lop.hocKy}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  {formatDateVN(lop.ngayBatDau)}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  {formatDateVN(lop.ngayKetThuc)}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  {formatNumber(lop.diemQuaTrinh)}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  {formatNumber(lop.diemThanhPhan)}
                                                </TableCell>
                                                <TableCell className="px-3 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                                  {formatNumber(lop.diemThi)}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 flex items-center justify-center text-center">
                                                  <div className="inline-flex items-center justify-center gap-2">
                                                    <span
                                                      className={
                                                        isBest
                                                          ? "font-semibold text-blue-700 dark:text-blue-300"
                                                          : "font-medium text-gray-900 dark:text-gray-100"
                                                      }
                                                    >
                                                      {formatNumber(lop.tbchp)}
                                                    </span>
                                                    <Badge
                                                      variant="light"
                                                      size="sm"
                                                      className="text-[11px]"
                                                      color={getDiemChuColor(lop.diemChu)}
                                                    >
                                                      {lop.diemChu || "-"}
                                                    </Badge>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                    </div>

                                    {bestLop && (
                                      <p className="mt-2 text-xs text-blue-700/80 dark:text-blue-300/80 flex items-center gap-1">
                                        <FontAwesomeIcon
                                          icon={faCircleInfo}
                                          className="h-3 w-3 text-blue-500"
                                        />
                                        <span>
                                          Hàng được tô đậm là lớp học phần có{" "}
                                          <span className="font-semibold">TBCHP cao nhất</span>, được
                                          sử dụng để xét TBCHP của môn học khi xét tốt nghiệp.
                                        </span>
                                      </p>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}

                        {ketQuaTheoMon.length === 0 && (
                          <TableRow className="text-[11px] leading-tight">
                            <TableCell
                              cols={13}
                              className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                            >
                              Chưa có dữ liệu bảng điểm cho sinh viên này.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Modal xem chi tiết lớp học phần cho một môn */}
      <Modal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        size="4xl"
      >
        <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                <FontAwesomeIcon icon={faEye} className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                  Chi tiết lớp học phần & điểm môn học
                </h3>
                {detailMon && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Môn:{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {detailMon.tenMonHoc}
                    </span>{" "}
                    ({detailMon.maMonHoc}) - {detailMon.soTinChi} tín chỉ
                  </p>
                )}
              </div>
            </div>
          </div>

          {detailMon && (
            <>
              {(() => {
                const sortedLops = sortLopHocPhansByNgayBatDau(detailMon.lopHocPhans || []);
                const bestLop = findBestLopHocPhan(sortedLops);

                return (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] text-[11px] leading-tight">
                      <Table>
                        <TableHeader className="border-b border-gray-200 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-900/60 text-[11px]">
                          <TableRow className="grid grid-cols-[14%_10%_12%_10%_10%_10%_8%_8%_8%_10%]">
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300"
                            >
                              Mã lớp học phần
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Trạng thái
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Năm học
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Học kỳ
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Ngày bắt đầu
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Ngày kết thúc
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-2 py-2 text-[11px] font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Điểm QT
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Điểm TP
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              Điểm thi
                            </TableCell>
                            <TableCell
                              isHeader
                              className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 text-center"
                            >
                              TBCHP / Điểm chữ
                            </TableCell>
                          </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                          {sortedLops.map((lop) => {
                            const isBest =
                              bestLop && lop.lopHocPhanId === bestLop.lopHocPhanId;
                            const rowClass = isBest
                              ? "bg-blue-50/80 dark:bg-blue-900/25"
                              : "";
                            return (
                              <TableRow
                                key={lop.lopHocPhanId}
                                className={`grid grid-cols-[14%_10%_12%_10%_10%_10%_8%_8%_8%_10%] text-[11px] leading-tight ${rowClass}`}
                              >
                                <TableCell className="px-2 py-2 flex items-center text-gray-900 dark:text-white/90 font-medium">
                                  <span
                                    className="inline-block max-w-[180px] truncate align-middle"
                                    title={lop.maLopHocPhan}
                                  >
                                    {lop.maLopHocPhan}
                                  </span>
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center">
                                  <Badge
                                    variant="solid"
                                    size="sm"
                                    className="text-[11px]"
                                    color={getTrangThaiKhoaDiemColor(lop.khoaDiem)}
                                  >
                                    {getTrangThaiKhoaDiemLabel(lop.khoaDiem)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  {lop.tenNamHoc}
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  HK {lop.hocKy}
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  {formatDateVN(lop.ngayBatDau)}
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  {formatDateVN(lop.ngayKetThuc)}
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  {formatNumber(lop.diemQuaTrinh)}
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  {formatNumber(lop.diemThanhPhan)}
                                </TableCell>
                                <TableCell className="px-3 py-2 flex items-center justify-center text-center text-gray-800 dark:text-gray-200">
                                  {formatNumber(lop.diemThi)}
                                </TableCell>
                                <TableCell className="px-2 py-2 flex items-center justify-center text-center">
                                  <div className="inline-flex items-center justify-center gap-2">
                                    <span
                                      className={
                                        isBest
                                          ? "font-semibold text-blue-700 dark:text-blue-300"
                                          : "font-medium text-gray-900 dark:text-gray-100"
                                      }
                                    >
                                      {formatNumber(lop.tbchp)}
                                    </span>
                                    <Badge
                                      variant="light"
                                      size="sm"
                                      className="text-[11px]"
                                      color={getDiemChuColor(lop.diemChu)}
                                    >
                                      {lop.diemChu || "-"}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}

                          {sortedLops.length === 0 && (
                            <TableRow className="text-[11px] leading-tight">
                              <TableCell
                                cols={10}
                                className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                              >
                                Không có dữ liệu lớp học phần cho môn học này.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {bestLop && (
                      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-800/60 dark:bg-blue-900/20 dark:text-blue-100 flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className="mt-0.5 h-3.5 w-3.5 text-blue-500"
                        />
                        <p>
                          Dòng được <span className="font-semibold">tô đậm</span> là lớp học phần có{" "}
                          <span className="font-semibold">TBCHP cao nhất</span>. Đây là lớp học phần
                          được{" "}
                          <span className="font-semibold">
                          công nhận để xét TBCHP của môn học khi xét tốt nghiệp
                          </span>
                          .
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeDetailModal}>
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Xuất phiếu điểm cá nhân */}
      <Modal
        isOpen={isExportPhieuDiemModalOpen}
        onClose={() => {
          if (!isExportingPhieuDiem) {
            setIsExportPhieuDiemModalOpen(false);
          }
        }}
        className="max-w-lg"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="text-2xl text-brand-600 dark:text-brand-400"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Xuất phiếu điểm cá nhân
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tải xuống bảng điểm chi tiết của sinh viên
              </p>
            </div>
          </div>

          {/* Thông tin sinh viên */}
          {sinhVien && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Mã sinh viên:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {sinhVien.maSinhVien}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Họ tên:</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {sinhVien.hoTen}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Lớp:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sinhVien.maLop}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Ngành:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sinhVien.tenNganh}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Niên khóa:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {sinhVien.tenNienKhoa}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tình trạng:</span>
                  <Badge variant="solid" color={getTinhTrangColor(sinhVien.tinhTrang)}>
                    {getTinhTrangLabel(sinhVien.tinhTrang)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin file sẽ xuất */}
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                    Thông tin file xuất
                  </h4>
                  <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>Định dạng: <strong>Excel (.xlsx)</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>Tên file: <strong>Bảng điểm cá nhân của SV {sinhVien?.maSinhVien || ""}</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>Nội dung: Điểm tất cả môn học đã được vào điểm</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Hướng dẫn */}
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="text-lg text-emerald-600 dark:text-emerald-400 mt-0.5"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                    Hướng dẫn sử dụng
                  </h4>
                  <p className="text-sm text-emerald-700/80 dark:text-emerald-300/70">
                    Phiếu điểm sẽ bao gồm thông tin cá nhân sinh viên và bảng điểm chi tiết
                    tất cả các môn học đã đăng ký theo từng học kỳ. Có thể in ấn hoặc lưu trữ.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isExportingPhieuDiem && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-3">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-xl text-brand-500 animate-spin"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Đang tạo phiếu điểm...
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsExportPhieuDiemModalOpen(false)}
              disabled={isExportingPhieuDiem}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleExportPhieuDiem}
              disabled={isExportingPhieuDiem}
              startIcon={
                isExportingPhieuDiem
                  ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  : <FontAwesomeIcon icon={faDownload} />
              }
            >
              {isExportingPhieuDiem ? "Đang xuất..." : "Xuất phiếu điểm"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BangDiemSV;

