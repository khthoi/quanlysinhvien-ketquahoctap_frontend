"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/tables/Pagination";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import SearchableSelect from "@/components/form/SelectCustom";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Checkbox from "@/components/form/input/Checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateRight,
  faBookOpen,
  faCheck,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faClockRotateLeft,
  faEdit,
  faFilter,
  faFileInvoice,
  faMagnifyingGlass,
  faPlus,
  faSpinner,
  faTrash,
  faUserGraduate,
} from "@fortawesome/free-solid-svg-icons";
import { FaAngleDown } from "react-icons/fa6";

// ========== Helpers ==========

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const formatDateTimeVi = (value: string | null | undefined): string => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ========== Types ==========

type LoaiYeuCau = "HOC_CAI_THIEN" | "HOC_BO_SUNG";
type TrangThaiYeuCau = "CHO_DUYET" | "DANG_XU_LY" | "DA_DUYET" | "TU_CHOI" | "DA_HUY";

interface SinhVienRef {
  id: number;
  maSinhVien: string;
  hoTen: string;
}

interface MonHocRef {
  id: number;
  maMonHoc: string;
  tenMonHoc: string;
}

interface ChuongTrinhDaoTaoRef {
  id: number;
  maChuongTrinh: string;
  tenChuongTrinh: string;
}

interface KetQuaCu {
  id: number;
  maLopHocPhan: string;
  diemQuaTrinh: number;
  diemThanhPhan: number;
  diemThi: number;
  diemTBCHP: number;
}

interface NamHocRef {
  id: number;
  namBatDau: number;
  namKetThuc: number;
}

interface HocKyRef {
  id: number;
  hocKy: number;
  namHoc: NamHocRef;
}

interface NganhRef {
  id: number;
  maNganh: string;
  tenNganh: string;
}

interface NienKhoaRef {
  id: number;
  maNienKhoa: string;
  tenNienKhoa: string;
}

interface GiangVienRef {
  id: number;
  maGiangVien: string;
  hoTen: string;
}

interface LopHocPhanRef {
  id: number;
  maLopHocPhan: string;
  mucUuTien: number;
  siSo: number;
  siSoSauKhiGan?: number;
  hocKy: HocKyRef;
  nganh: NganhRef;
  nienKhoa: NienKhoaRef;
  giangVien: GiangVienRef | null;
}

interface NguoiXuLyRef {
  id: number;
  tenDangNhap: string;
  loaiNguoiXuLy: string;
  giangVien: GiangVienRef | null;
}

interface YeuCauBase {
  id: number;
  loaiYeuCau: LoaiYeuCau;
  lyDo: string;
  ngayTao: string;
  trangThai?: TrangThaiYeuCau;
  sinhVien: SinhVienRef;
  monHoc: MonHocRef;
  chuongTrinhDaoTao: ChuongTrinhDaoTaoRef;
  thuTuHocKy: number;
  ketQuaCu: KetQuaCu | null;
}

interface YeuCauChoDuyet extends YeuCauBase {
  lopHocPhanDeXuat: LopHocPhanRef[];
  lopHocPhanTotNhat: LopHocPhanRef | null;
}

interface YeuCauDaDuyet extends YeuCauBase {
  ngayXuLy: string;
  ghiChuPhongDaoTao: string | null;
  lopHocPhanDaDuyet: LopHocPhanRef;
  nguoiXuLy: NguoiXuLyRef | null;
}

interface YeuCauDaHuy extends YeuCauBase {
  ngayXuLy: string;
  ghiChuPhongDaoTao: string | null;
  nguoiXuLy: NguoiXuLyRef | null;
}

interface YeuCauTuChoi extends YeuCauBase {
  ngayXuLy: string;
  ghiChuPhongDaoTao: string | null;
  nguoiXuLy: NguoiXuLyRef | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchYeuCauResponse {
  choDuyet: YeuCauChoDuyet[];
  dangXuLy: YeuCauChoDuyet[];
  daDuyet: YeuCauDaDuyet[];
  daHuy: YeuCauDaHuy[];
  tuChoi: YeuCauTuChoi[];
  pagination?: PaginationInfo;
}

type FilterOption = { value: string; label: string };

// ========== Labels ==========

const LOAI_YEU_CAU_LABELS: Record<LoaiYeuCau, string> = {
  HOC_CAI_THIEN: "Học cải thiện",
  HOC_BO_SUNG: "Học bổ sung",
};

const TRANG_THAI_LABELS: Record<TrangThaiYeuCau, string> = {
  CHO_DUYET: "Chờ duyệt",
  DANG_XU_LY: "Đang xử lý",
  DA_DUYET: "Đã duyệt",
  TU_CHOI: "Từ chối",
  DA_HUY: "Đã huỷ",
};

const getLoaiYeuCauLabel = (value: LoaiYeuCau): string =>
  LOAI_YEU_CAU_LABELS[value] ?? value;

const getLoaiYeuCauColor = (
  value: LoaiYeuCau
): "primary" | "success" | "warning" | "info" | "error" => {
  switch (value) {
    case "HOC_CAI_THIEN":
      return "primary";
    case "HOC_BO_SUNG":
      return "success";
    default:
      return "info";
  }
};

const getTrangThaiLabel = (value: TrangThaiYeuCau | undefined): string =>
  value ? TRANG_THAI_LABELS[value] ?? value : "";

const getTrangThaiColor = (
  value: TrangThaiYeuCau | undefined
): "primary" | "success" | "warning" | "info" | "error" => {
  switch (value) {
    case "CHO_DUYET":
      return "info";
    case "DANG_XU_LY":
      return "warning";
    case "DA_DUYET":
      return "success";
    case "TU_CHOI":
      return "error";
    case "DA_HUY":
      return "error";
    default:
      return "info";
  }
};

// ========== Stat card ==========

interface StatCardProps {
  icon: typeof faUserGraduate;
  title: string;
  value: number | string;
  color: "blue" | "green" | "amber" | "red" | "gray";
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-900/20 dark:text-blue-300",
    green: "border-green-200 bg-green-50 text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300",
    amber: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300",
    red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300",
    gray: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700/70 dark:bg-gray-900/30 dark:text-gray-200",
  };

  const iconBg: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-800/60",
    green: "bg-green-100 dark:bg-green-800/60",
    amber: "bg-amber-100 dark:bg-amber-800/60",
    red: "bg-red-100 dark:bg-red-800/60",
    gray: "bg-gray-100 dark:bg-gray-800/60",
  };

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colorClasses[color]}`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg[color]}`}>
        <FontAwesomeIcon icon={icon} className="text-base" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-xs opacity-80">{title}</p>
      </div>
    </div>
  );
};

// ========== Edit / Detail modal ==========

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: YeuCauChoDuyet | YeuCauDaDuyet | null;
  mode: "edit" | "view";
  selectedLopHocPhanId: number | null;
  onSelectedLopHocPhanChange: (id: number | null) => void;
  ghiChuPhongDaoTao: string;
  onGhiChuChange: (value: string) => void;
  baseSiSoByLopHocPhanId: Record<number, number>;
  proposedCountByLopHocPhanId: Record<number, number>;
  showLHPSelection?: boolean; // Điều khiển hiển thị phần chọn lớp học phần
}

const EditRequestModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  request,
  mode,
  selectedLopHocPhanId,
  onSelectedLopHocPhanChange,
  ghiChuPhongDaoTao,
  onGhiChuChange,
  baseSiSoByLopHocPhanId,
  proposedCountByLopHocPhanId,
  showLHPSelection = true, // Mặc định là true để giữ tương thích ngược
}) => {
  if (!isOpen || !request) return null;

  const isEdit = mode === "edit";
  const req = request as YeuCauChoDuyet;

  const options: FilterOption[] =
    req.lopHocPhanDeXuat?.map((lop) => ({
      value: String(lop.id),
      label: lop.maLopHocPhan,
    })) ?? [];

  const selectedLHP =
    req.lopHocPhanDeXuat?.find((lop) => lop.id === selectedLopHocPhanId) ?? null;

  const baseSiSo = selectedLopHocPhanId
    ? baseSiSoByLopHocPhanId[selectedLopHocPhanId] ?? 0
    : 0;
  const count = selectedLopHocPhanId
    ? proposedCountByLopHocPhanId[selectedLopHocPhanId] ?? 0
    : 0;
  const proposedSiSo = baseSiSo + count;
  const isOverCapacity = selectedLopHocPhanId != null && proposedSiSo > 40;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <FontAwesomeIcon icon={isEdit ? faEdit : faBookOpen} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isEdit
                ? showLHPSelection
                  ? "Chi tiết & chỉnh sửa lớp học phần"
                  : "Chi tiết yêu cầu"
                : "Chi tiết yêu cầu"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {request.sinhVien.maSinhVien} - {request.sinhVien.hoTen}
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:grid-cols-2">
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Loại yêu cầu
            </p>
            <Badge variant="light" color={getLoaiYeuCauColor(request.loaiYeuCau)}>
              {getLoaiYeuCauLabel(request.loaiYeuCau)}
            </Badge>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Môn học
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {request.monHoc.maMonHoc} - {request.monHoc.tenMonHoc}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              CTĐT / Học kỳ
            </p>
            <p className="text-gray-900 dark:text-white">
              {request.chuongTrinhDaoTao.maChuongTrinh} - {request.chuongTrinhDaoTao.tenChuongTrinh} · HK{" "}
              {request.thuTuHocKy}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Thời gian tạo
            </p>
            <p className="text-gray-900 dark:text-white">
              {formatDateTimeVi(request.ngayTao)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Lý do
            </p>
            <p className="text-gray-900 dark:text-white">
              {request.lyDo || "—"}
            </p>
          </div>
        </div>

        {/* Kết quả cũ */}
        <div className="mt-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            <FontAwesomeIcon icon={faBookOpen} className="text-blue-500" />
            Kết quả học tập cũ
          </h4>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
            <Table>
              <TableHeader className="border-b border-gray-100 text-xs dark:border-gray-700/70">
                <TableRow>
                    <TableCell isHeader className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    Mã LHP
                  </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    QT
                  </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    TP
                  </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    Thi
                  </TableCell>
                    <TableCell isHeader className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                    TBCHP
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!request.ketQuaCu ? (
                  <TableRow>
                    <TableCell cols={5} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      Chưa có kết quả học tập trước đó
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell className="px-3 py-3 text-center font-mono text-gray-900 dark:text-white">
                      {request.ketQuaCu.maLopHocPhan}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center text-gray-900 dark:text-white">
                      {request.ketQuaCu.diemQuaTrinh}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center text-gray-900 dark:text-white">
                      {request.ketQuaCu.diemThanhPhan}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center text-gray-900 dark:text-white">
                      {request.ketQuaCu.diemThi}
                    </TableCell>
                    <TableCell className="px-3 py-3 text-center font-semibold text-gray-900 dark:text-white">
                      {request.ketQuaCu.diemTBCHP}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* LHP đề xuất / đã duyệt */}
        {isEdit && showLHPSelection ? (
          <div className="mt-4">
            <Label className="mb-1.5 block text-xs">Lớp học phần đăng ký</Label>
            <SearchableSelect
              key={request.id}
              options={options}
              placeholder="Chọn lớp học phần"
              onChange={(value) => onSelectedLopHocPhanChange(value ? Number(value) : null)}
              defaultValue={selectedLopHocPhanId?.toString() ?? ""}
              showSecondary={false}
              searchPlaceholder="Tìm lớp học phần..."
            />
            {selectedLHP && (
              <div
                className={`mt-3 rounded-xl border p-3 ${
                  isOverCapacity
                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300"
                    : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300"
                }`}
              >
                <p className="font-semibold">
                  {selectedLHP.maLopHocPhan} · {selectedLHP.nienKhoa.tenNienKhoa} · NH {selectedLHP.hocKy.namHoc.namBatDau} - {selectedLHP.hocKy.namHoc.namKetThuc} · HK {selectedLHP.hocKy.hocKy}
                </p>
                <p className="mt-1">
                  Sĩ số hiện tại: {baseSiSo}. Sau khi gán các yêu cầu đang chọn: {proposedSiSo} sinh viên.
                  {isOverCapacity && " Giới hạn tối đa là 40 SV/LHP, không thể thêm mới."}
                </p>
              </div>
            )}
          </div>
        ) : !isEdit && "lopHocPhanDaDuyet" in request ? (
          <div className="mt-4 text-xs">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Lớp học phần đã duyệt
            </p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/40">
              <p className="font-mono text-gray-900 dark:text-white">
                {(request as YeuCauDaDuyet).lopHocPhanDaDuyet.maLopHocPhan}
              </p>
              <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                {(request as YeuCauDaDuyet).lopHocPhanDaDuyet.nienKhoa.tenNienKhoa} ·{" "}
                {(request as YeuCauDaDuyet).lopHocPhanDaDuyet.nganh.tenNganh}
              </p>
            </div>
          </div>
        ) : null}

        {/* Ghi chú PĐT */}
        <div className="mt-4">
          <Label className="mb-1.5 block text-xs">Ghi chú của phòng đào tạo</Label>
          <textarea
            disabled={!isEdit}
            value={ghiChuPhongDaoTao}
            onChange={(e) => onGhiChuChange(e.target.value)}
            placeholder="Phòng đào tạo đã duyệt"
            className="h-20 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs text-gray-900 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
          />
          {isEdit && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nếu để trống, hệ thống sẽ lưu ghi chú mặc định: <strong>Phòng đào tạo đã duyệt</strong>.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

interface ViewOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: YeuCauDaHuy | YeuCauTuChoi | null;
}

const ViewRequestModal: React.FC<ViewOnlyModalProps> = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  const isDaHuy = request.trangThai === "DA_HUY";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="max-h-[90vh] overflow-y-auto p-6 text-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {isDaHuy ? "Chi tiết yêu cầu đã huỷ" : "Chi tiết yêu cầu từ chối"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {request.sinhVien.maSinhVien} - {request.sinhVien.hoTen}
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:grid-cols-2">
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Loại yêu cầu
            </p>
            <Badge variant="light" color={getLoaiYeuCauColor(request.loaiYeuCau)}>
              {getLoaiYeuCauLabel(request.loaiYeuCau)}
            </Badge>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Trạng thái
            </p>
            <Badge variant="light" color={getTrangThaiColor(request.trangThai)}>
              {getTrangThaiLabel(request.trangThai)}
            </Badge>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Môn học
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {request.monHoc.maMonHoc} - {request.monHoc.tenMonHoc}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              CTĐT / Học kỳ
            </p>
            <p className="text-gray-900 dark:text-white">
              {request.chuongTrinhDaoTao.maChuongTrinh} - {request.chuongTrinhDaoTao.tenChuongTrinh} · HK{" "}
              {request.thuTuHocKy}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Thời gian tạo
            </p>
            <p className="text-gray-900 dark:text-white">
              {formatDateTimeVi(request.ngayTao)}
            </p>
          </div>
          <div>
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Thời gian xử lý
            </p>
            <p className="text-gray-900 dark:text-white">
              {formatDateTimeVi(request.ngayXuLy)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Lý do
            </p>
            <p className="text-gray-900 dark:text-white">
              {request.lyDo || "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Ghi chú của phòng đào tạo
            </p>
            <p className="text-gray-900 dark:text-white">
              {request.ghiChuPhongDaoTao || "—"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ========== Main ==========

type MainTab = "cho-duyet" | "dang-xu-ly" | "da-duyet" | "tu-choi" | "da-huy";

export default function YeuCauSinhvienPage() {
  // Dữ liệu cho từng tab
  const [listChoDuyet, setListChoDuyet] = useState<YeuCauChoDuyet[]>([]);
  const [listDangXuLy, setListDangXuLy] = useState<YeuCauChoDuyet[]>([]);
  const [listDaDuyet, setListDaDuyet] = useState<YeuCauDaDuyet[]>([]);
  const [listDaHuy, setListDaHuy] = useState<YeuCauDaHuy[]>([]);
  const [listTuChoi, setListTuChoi] = useState<YeuCauTuChoi[]>([]);

  const [daDuyetPagination, setDaDuyetPagination] = useState<PaginationInfo | null>(null);
  const [tuChoiPagination, setTuChoiPagination] = useState<PaginationInfo | null>(null);
  const [daHuyPagination, setDaHuyPagination] = useState<PaginationInfo | null>(null);

  const [loading, setLoading] = useState<boolean>(true); // loading lớn chỉ cho lần đầu
  const [refreshing, setRefreshing] = useState<boolean>(false); // cho nút Làm mới
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<MainTab>("cho-duyet");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [filterLoaiYeuCau, setFilterLoaiYeuCau] = useState<string>("");

  const PAGE_SIZE_CLIENT = 10; // client-side pagination
  const PAGE_SIZE_SERVER = 10; // server-side pagination cho các tab còn lại

  const [choDuyetPage, setChoDuyetPage] = useState<number>(1);
  const [dangXuLyPage, setDangXuLyPage] = useState<number>(1);
  const [daDuyetPage, setDaDuyetPage] = useState<number>(1);
  const [tuChoiPage, setTuChoiPage] = useState<number>(1);
  const [daHuyPage, setDaHuyPage] = useState<number>(1);

  const [selectedYeuCauIds, setSelectedYeuCauIds] = useState<number[]>([]);
  const [selectedDaHuyIds, setSelectedDaHuyIds] = useState<number[]>([]);

  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

  const [alert, setAlert] = useState<{
    id: number;
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<YeuCauChoDuyet | YeuCauDaDuyet | null>(null);
  const [editMode, setEditMode] = useState<"edit" | "view">("edit");
  const [showLHPSelectionForModal, setShowLHPSelectionForModal] = useState<boolean>(true);
  const [editSelectedLHPMap, setEditSelectedLHPMap] = useState<Record<number, number | null>>({});
  const [editGhiChuMap, setEditGhiChuMap] = useState<Record<number, string>>({});
  const [baseSiSoByLopHocPhanId, setBaseSiSoByLopHocPhanId] = useState<Record<number, number>>({});

  const [isBulkApproveModalOpen, setIsBulkApproveModalOpen] = useState(false);
  const [isBulkChangeStatusModalOpen, setIsBulkChangeStatusModalOpen] = useState(false);
  const [isBulkDeleteDaHuyModalOpen, setIsBulkDeleteDaHuyModalOpen] = useState(false);
  const [isBulkRejectModalOpen, setIsBulkRejectModalOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [bulkApproveResults, setBulkApproveResults] = useState<
    { id: number; maSinhVien: string; hoTen: string; status: "success" | "failed"; message: string }[]
  >([]);
  const [bulkChangeStatusResults, setBulkChangeStatusResults] = useState<
    { id: number; maSinhVien: string; hoTen: string; status: "success" | "failed"; message: string }[]
  >([]);
  const [bulkDeleteDaHuyResults, setBulkDeleteDaHuyResults] = useState<
    { id: number; maSinhVien: string; hoTen: string; status: "success" | "failed"; message: string }[]
  >([]);
  const [bulkRejectResults, setBulkRejectResults] = useState<
    { id: number; maSinhVien: string; hoTen: string; status: "success" | "failed"; message: string }[]
  >([]);

  const [viewDetailModalOpen, setViewDetailModalOpen] = useState(false);
  const [viewDetailRequest, setViewDetailRequest] = useState<YeuCauDaHuy | YeuCauTuChoi | null>(null);

  const [isCreateLHPModalOpen, setIsCreateLHPModalOpen] = useState(false);

  // ========== Fetch ==========

  // Lấy danh sách yêu cầu chờ duyệt và đang xử lý
  const fetchChoDuyetAndDangXuLy = async (
    searchParam: string,
    loaiYeuCauParam: string
  ) => {
    const accessToken = getCookie("access_token");
    const headers: HeadersInit = {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const qs: string[] = ["page=1", "limit=9999"];
    if (searchParam.trim()) {
      qs.push(`search=${encodeURIComponent(searchParam.trim())}`);
    }
    if (loaiYeuCauParam) {
      qs.push(`loaiYeuCau=${encodeURIComponent(loaiYeuCauParam)}`);
    }

    const res = await fetch(
      `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan?${qs.join("&")}`,
      { headers }
    );
    const json = (await res.json()) as FetchYeuCauResponse & { message?: string };
    if (!res.ok) {
      throw new Error(json.message || "Không thể tải dữ liệu yêu cầu học phần");
    }

    const choDuyet = json.choDuyet || [];
    const dangXuLy = json.dangXuLy || [];
    const combined = [...choDuyet, ...dangXuLy];

    // Build map sĩ số từ cả 2 mảng
    const baseMap: Record<number, number> = {};
    combined.forEach((yc) => {
      yc.lopHocPhanDeXuat.forEach((lop) => {
        if (!(lop.id in baseMap)) {
          const base =
            typeof lop.siSo === "number"
              ? lop.siSo
              : lop.siSoSauKhiGan ?? 0;
          baseMap[lop.id] = base;
        }
      });
    });

    // Sắp xếp theo ngày tạo (mới nhất trước)
    choDuyet.sort(
      (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
    );
    dangXuLy.sort(
      (a, b) => new Date(b.ngayTao).getTime() - new Date(a.ngayTao).getTime()
    );

    setListChoDuyet(choDuyet);
    setListDangXuLy(dangXuLy);
    setBaseSiSoByLopHocPhanId(baseMap);

    const nextSelected: Record<number, number | null> = {};
    combined.forEach((yc) => {
      nextSelected[yc.id] =
        yc.lopHocPhanTotNhat?.id ?? yc.lopHocPhanDeXuat[0]?.id ?? null;
    });
    setEditSelectedLHPMap(nextSelected);
  };

  const fetchDaDuyetPage = async (
    page: number,
    searchParam: string,
    loaiYeuCauParam: string
  ) => {
    const accessToken = getCookie("access_token");
    const headers: HeadersInit = {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const qs: string[] = [
      `page=${page}`,
      `limit=${PAGE_SIZE_SERVER}`,
      "trangThai=DA_DUYET",
    ];
    if (searchParam.trim()) {
      qs.push(`search=${encodeURIComponent(searchParam.trim())}`);
    }
    if (loaiYeuCauParam) {
      qs.push(`loaiYeuCau=${encodeURIComponent(loaiYeuCauParam)}`);
    }

    const res = await fetch(
      `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan?${qs.join("&")}`,
      { headers }
    );
    const json = (await res.json()) as FetchYeuCauResponse & { message?: string };
    if (!res.ok) {
      throw new Error(json.message || "Không thể tải dữ liệu yêu cầu đã duyệt");
    }

    setListDaDuyet(json.daDuyet || []);
    if (json.pagination) {
      setDaDuyetPagination(json.pagination);
    } else {
      setDaDuyetPagination({
        total: json.daDuyet?.length ?? 0,
        page,
        limit: PAGE_SIZE_SERVER,
        totalPages: 1,
      });
    }
  };

  const fetchTuChoiPage = async (
    page: number,
    searchParam: string,
    loaiYeuCauParam: string
  ) => {
    const accessToken = getCookie("access_token");
    const headers: HeadersInit = {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const qs: string[] = [
      `page=${page}`,
      `limit=${PAGE_SIZE_SERVER}`,
      "trangThai=TU_CHOI",
    ];
    if (searchParam.trim()) {
      qs.push(`search=${encodeURIComponent(searchParam.trim())}`);
    }
    if (loaiYeuCauParam) {
      qs.push(`loaiYeuCau=${encodeURIComponent(loaiYeuCauParam)}`);
    }

    const res = await fetch(
      `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan?${qs.join("&")}`,
      { headers }
    );
    const json = (await res.json()) as FetchYeuCauResponse & { message?: string };
    if (!res.ok) {
      throw new Error(json.message || "Không thể tải dữ liệu yêu cầu từ chối");
    }

    setListTuChoi(json.tuChoi || []);
    if (json.pagination) {
      setTuChoiPagination(json.pagination);
    } else {
      setTuChoiPagination({
        total: json.tuChoi?.length ?? 0,
        page,
        limit: PAGE_SIZE_SERVER,
        totalPages: 1,
      });
    }
  };

  const fetchDaHuyPage = async (
    page: number,
    searchParam: string,
    loaiYeuCauParam: string
  ) => {
    const accessToken = getCookie("access_token");
    const headers: HeadersInit = {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const qs: string[] = [
      `page=${page}`,
      `limit=${PAGE_SIZE_SERVER}`,
      "trangThai=DA_HUY",
    ];
    if (searchParam.trim()) {
      qs.push(`search=${encodeURIComponent(searchParam.trim())}`);
    }
    if (loaiYeuCauParam) {
      qs.push(`loaiYeuCau=${encodeURIComponent(loaiYeuCauParam)}`);
    }

    const res = await fetch(
      `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan?${qs.join("&")}`,
      { headers }
    );
    const json = (await res.json()) as FetchYeuCauResponse & { message?: string };
    if (!res.ok) {
      throw new Error(json.message || "Không thể tải dữ liệu yêu cầu đã huỷ");
    }

    setListDaHuy(json.daHuy || []);
    if (json.pagination) {
      setDaHuyPagination(json.pagination);
    } else {
      setDaHuyPagination({
        total: json.daHuy?.length ?? 0,
        page,
        limit: PAGE_SIZE_SERVER,
        totalPages: 1,
      });
    }
  };

  const loadAll = async (options?: {
    mode?: "initial" | "refresh" | "silent";
    overrideSearch?: string;
    overrideFilterLoaiYeuCau?: string;
  }) => {
    const mode = options?.mode ?? "silent";
    const searchParam = (options?.overrideSearch ?? searchKeyword).trim();
    const loaiYeuCauParam = options?.overrideFilterLoaiYeuCau ?? filterLoaiYeuCau;

    if (mode === "initial") {
      setLoading(true);
    } else if (mode === "refresh") {
      setRefreshing(true);
    }

    setFetchError(null);
    try {
      await Promise.all([
        fetchChoDuyetAndDangXuLy(searchParam, loaiYeuCauParam),
        fetchDaDuyetPage(daDuyetPage, searchParam, loaiYeuCauParam),
        fetchTuChoiPage(tuChoiPage, searchParam, loaiYeuCauParam),
        fetchDaHuyPage(daHuyPage, searchParam, loaiYeuCauParam),
      ]);
    } catch (err: any) {
      setFetchError(err?.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else if (mode === "refresh") {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // chỉ loading lớn lần đầu
    loadAll({ mode: "initial" });
  }, []);

  const handleRefresh = async () => {
    await loadAll({
      mode: "refresh",
      overrideSearch: searchKeyword,
      overrideFilterLoaiYeuCau: filterLoaiYeuCau,
    });
    showAlert("info", "Làm mới", "Đã tải lại dữ liệu yêu cầu học phần.");
  };

  const handleSearchSubmit = () => {
    setChoDuyetPage(1);
    setDangXuLyPage(1);
    setDaDuyetPage(1);
    setTuChoiPage(1);
    setDaHuyPage(1);
    // không bật loading lớn khi lọc để tránh nháy UI
    loadAll({
      mode: "silent",
      overrideSearch: searchKeyword,
      overrideFilterLoaiYeuCau: filterLoaiYeuCau,
    });
  };

  const handleResetFilters = () => {
    setSearchKeyword("");
    setFilterLoaiYeuCau("");
    setChoDuyetPage(1);
    setDangXuLyPage(1);
    setDaDuyetPage(1);
    setTuChoiPage(1);
    setDaHuyPage(1);
    loadAll({
      mode: "silent",
      overrideSearch: "",
      overrideFilterLoaiYeuCau: "",
    });
  };

  useEffect(() => {
    setSelectedYeuCauIds([]);
    setSelectedDaHuyIds([]);
  }, [activeTab]);

  // ========== Derived data ==========

  const totalChoDuyet = listChoDuyet.length;
  const totalDangXuLy = listDangXuLy.length;
  const totalDaDuyet = daDuyetPagination?.total ?? listDaDuyet.length;
  const totalDaHuy = daHuyPagination?.total ?? listDaHuy.length;
  const totalTuChoi = tuChoiPagination?.total ?? listTuChoi.length;
  const totalAll = totalChoDuyet + totalDangXuLy + totalDaDuyet + totalDaHuy + totalTuChoi;

  type AnyYeuCau = YeuCauChoDuyet | YeuCauDaDuyet | YeuCauDaHuy | YeuCauTuChoi;
  let paginatedList: AnyYeuCau[] = [];
  let currentPage = 1;
  let totalItems = 0;
  let totalPages = 1;
  let pageSizeForDisplay = PAGE_SIZE_CLIENT;

  if (activeTab === "cho-duyet") {
    currentPage = choDuyetPage;
    totalItems = listChoDuyet.length;
    pageSizeForDisplay = PAGE_SIZE_CLIENT;
    totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_CLIENT));
    const start = (choDuyetPage - 1) * PAGE_SIZE_CLIENT;
    paginatedList = listChoDuyet.slice(start, start + PAGE_SIZE_CLIENT);
  } else if (activeTab === "dang-xu-ly") {
    currentPage = dangXuLyPage;
    totalItems = listDangXuLy.length;
    pageSizeForDisplay = PAGE_SIZE_CLIENT;
    totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_CLIENT));
    const start = (dangXuLyPage - 1) * PAGE_SIZE_CLIENT;
    paginatedList = listDangXuLy.slice(start, start + PAGE_SIZE_CLIENT);
  } else if (activeTab === "da-duyet") {
    currentPage = daDuyetPage;
    totalItems = totalDaDuyet;
    pageSizeForDisplay = PAGE_SIZE_SERVER;
    totalPages = daDuyetPagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE_SERVER));
    paginatedList = listDaDuyet;
  } else if (activeTab === "tu-choi") {
    currentPage = tuChoiPage;
    totalItems = totalTuChoi;
    pageSizeForDisplay = PAGE_SIZE_SERVER;
    totalPages = tuChoiPagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE_SERVER));
    paginatedList = listTuChoi;
  } else {
    currentPage = daHuyPage;
    totalItems = totalDaHuy;
    pageSizeForDisplay = PAGE_SIZE_SERVER;
    totalPages = daHuyPagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE_SERVER));
    paginatedList = listDaHuy;
  }

  // Sĩ số đề xuất theo LHP (từ cả chờ duyệt và đang xử lý)
  const proposedCountByLopHocPhanId = useMemo(() => {
    const map: Record<number, number> = {};
    [...listChoDuyet, ...listDangXuLy].forEach((yc) => {
      const selectedId = editSelectedLHPMap[yc.id];
      if (selectedId != null) {
        map[selectedId] = (map[selectedId] ?? 0) + 1;
      }
    });
    return map;
  }, [listChoDuyet, listDangXuLy, editSelectedLHPMap]);

  // Kiểm tra xem có yêu cầu nào không có lớp học phần đề xuất trong tab đang xử lý
  const hasRequestWithoutLHP = useMemo(() => {
    if (activeTab !== "dang-xu-ly") return false;
    return listDangXuLy.some(
      (yc) => !yc.lopHocPhanDeXuat || yc.lopHocPhanDeXuat.length === 0
    );
  }, [activeTab, listDangXuLy]);

  // ========== Selection ==========

  const isSelectedRequest = (id: number) => selectedYeuCauIds.includes(id);

  const toggleSelectRequest = (id: number) => {
    setSelectedYeuCauIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllSelectedOnPage =
    paginatedList.length > 0 &&
    paginatedList.every((item) => selectedYeuCauIds.includes(item.id));

  const isIndeterminateOnPage =
    paginatedList.some((item) => selectedYeuCauIds.includes(item.id)) &&
    !isAllSelectedOnPage;

  const handleSelectAllCurrentPage = (checked: boolean) => {
    if (!checked) {
      const idsOnPage = paginatedList.map((x) => x.id);
      setSelectedYeuCauIds((prev) => prev.filter((id) => !idsOnPage.includes(id)));
    } else {
      const idsOnPage = paginatedList.map((x) => x.id);
      setSelectedYeuCauIds((prev) => [...new Set([...prev, ...idsOnPage])]);
    }
  };

  const isSelectedDaHuy = (id: number) => selectedDaHuyIds.includes(id);

  const toggleSelectDaHuy = (id: number) => {
    setSelectedDaHuyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllDaHuySelectedOnPage =
    paginatedList.length > 0 &&
    paginatedList.every((item) => selectedDaHuyIds.includes((item as YeuCauDaHuy).id));

  const isDaHuyIndeterminateOnPage =
    paginatedList.some((item) => selectedDaHuyIds.includes((item as YeuCauDaHuy).id)) &&
    !isAllDaHuySelectedOnPage;

  const handleSelectAllDaHuyOnPage = (checked: boolean) => {
    const idsOnPage = (paginatedList as YeuCauDaHuy[]).map((x) => x.id);
    if (!checked) {
      setSelectedDaHuyIds((prev) => prev.filter((id) => !idsOnPage.includes(id)));
    } else {
      setSelectedDaHuyIds((prev) => [...new Set([...prev, ...idsOnPage])]);
    }
  };

  // ========== Actions ==========

  const handleViewBangDiem = (sinhVienId: number) => {
    const url = `${ENV.FRONTEND_ADMIN_URL}/quan-ly-sinh-vien/bang-diem/${sinhVienId}`;
    window.open(url, "_blank");
  };

  const handleOpenEditModal = async (req: YeuCauChoDuyet, mode: "edit" | "view", showLHPSelection: boolean = true) => {
    setEditMode(mode);
    setEditingRequest(req);
    setShowLHPSelectionForModal(showLHPSelection);
    setEditModalOpen(true);

    if (mode === "edit" && showLHPSelection) {
      try {
        const accessToken = getCookie("access_token");
        await fetch(
          `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan/chuyen-trang-thai-dang-xu-ly`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ yeuCauId: req.id }),
          }
        );
      } catch {
        // bỏ qua lỗi, không chặn chỉnh sửa
      }
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingRequest(null);
  };

  const handleChangeSelectedLHPInModal = (value: number | null) => {
    if (!editingRequest) return;
    setEditSelectedLHPMap((prev) => ({
      ...prev,
      [editingRequest.id]: value,
    }));
  };

  const handleChangeGhiChuInModal = (value: string) => {
    if (!editingRequest) return;
    setEditGhiChuMap((prev) => ({
      ...prev,
      [editingRequest.id]: value,
    }));
  };

  const getGhiChuForRequest = (reqId: number) =>
    editGhiChuMap[reqId] ?? "Phòng đào tạo đã duyệt";

  const toggleDropdown = (id: number) => {
    setActiveDropdownId((prev) => (prev === id ? null : id));
  };

  const closeDropdown = () => setActiveDropdownId(null);

  const handleOpenViewDetailModal = (req: YeuCauDaHuy | YeuCauTuChoi) => {
    setViewDetailRequest(req);
    setViewDetailModalOpen(true);
  };

  const handleCloseViewDetailModal = () => {
    setViewDetailModalOpen(false);
    setViewDetailRequest(null);
  };

  // ========== Bulk handlers ==========

  const openBulkApproveModal = () => {
    if (selectedYeuCauIds.length === 0) {
      showAlert("warning", "Chưa chọn yêu cầu", "Vui lòng chọn ít nhất một yêu cầu để duyệt.");
      return;
    }
    setBulkApproveResults([]);
    setIsBulkApproveModalOpen(true);
  };

  const openBulkChangeStatusModal = () => {
    if (selectedYeuCauIds.length === 0) {
      showAlert(
        "warning",
        "Chưa chọn yêu cầu",
        "Vui lòng chọn ít nhất một yêu cầu để chuyển trạng thái xử lý."
      );
      return;
    }
    setBulkChangeStatusResults([]);
    setIsBulkChangeStatusModalOpen(true);
  };

  const openBulkRejectModal = () => {
    if (selectedYeuCauIds.length === 0) {
      showAlert(
        "warning",
        "Chưa chọn yêu cầu",
        "Vui lòng chọn ít nhất một yêu cầu để từ chối."
      );
      return;
    }
    setBulkRejectResults([]);
    setIsBulkRejectModalOpen(true);
  };

  const openBulkDeleteDaHuyModal = () => {
    if (selectedDaHuyIds.length === 0) {
      showAlert("warning", "Chưa chọn yêu cầu", "Vui lòng chọn ít nhất một yêu cầu để xoá.");
      return;
    }
    setBulkDeleteDaHuyResults([]);
    setIsBulkDeleteDaHuyModalOpen(true);
  };

  const handleBulkApprove = async () => {
    setBulkSubmitting(true);
    const accessToken = getCookie("access_token");
    const results: {
      id: number;
      maSinhVien: string;
      hoTen: string;
      status: "success" | "failed";
      message: string;
    }[] = [];

    const mapById = new Map<number, YeuCauChoDuyet>();
    [...listChoDuyet, ...listDangXuLy].forEach((yc) => mapById.set(yc.id, yc));

    for (const id of selectedYeuCauIds) {
      const yc = mapById.get(id);
      if (!yc) continue;
      const maSinhVien = yc.sinhVien.maSinhVien;
      const hoTen = yc.sinhVien.hoTen;

      if (!yc.lopHocPhanDeXuat || yc.lopHocPhanDeXuat.length === 0) {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: "Yêu cầu này chưa có mã lớp học phần đề xuất, không thể duyệt.",
        });
        continue;
      }

      const selectedLHPId = editSelectedLHPMap[id];

      if (!selectedLHPId) {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: "Chưa chọn lớp học phần cho yêu cầu này.",
        });
        continue;
      }

      const baseSiSo = baseSiSoByLopHocPhanId[selectedLHPId] ?? 0;
      const count = proposedCountByLopHocPhanId[selectedLHPId] ?? 0;
      const proposedSiSo = baseSiSo + count;
      if (proposedSiSo > 40) {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: `LHP vượt sĩ số (đề xuất ${proposedSiSo}/40).`,
        });
        continue;
      }

      try {
        const res = await fetch(`${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan/duyet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            yeuCauId: id,
            lopHocPhanId: selectedLHPId,
            ghiChuPhongDaoTao: getGhiChuForRequest(id),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "success",
            message: body.message ?? "Đã duyệt yêu cầu.",
          });
        } else {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "failed",
            message: body.message ?? "Duyệt yêu cầu thất bại.",
          });
        }
      } catch {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: "Lỗi kết nối máy chủ.",
        });
      }
    }

    setBulkApproveResults(results);
    setBulkSubmitting(false);
    await loadAll();
    // Reset selection after xử lý xong để nút thao tác & badge về đúng số lượng
    setSelectedYeuCauIds([]);
  };

  const handleBulkChangeStatus = async () => {
    setBulkSubmitting(true);
    const accessToken = getCookie("access_token");
    const results: {
      id: number;
      maSinhVien: string;
      hoTen: string;
      status: "success" | "failed";
      message: string;
    }[] = [];

    const mapById = new Map<number, YeuCauChoDuyet>();
    listChoDuyet.forEach((yc) => mapById.set(yc.id, yc));

    for (const id of selectedYeuCauIds) {
      const yc = mapById.get(id);
      if (!yc) continue;
      const maSinhVien = yc.sinhVien.maSinhVien;
      const hoTen = yc.sinhVien.hoTen;

      try {
        const res = await fetch(
          `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan/chuyen-trang-thai-dang-xu-ly`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ yeuCauId: id }),
          }
        );
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "success",
            message: body.message ?? "Đã chuyển trạng thái xử lý.",
          });
        } else {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "failed",
            message: body.message ?? "Chuyển trạng thái thất bại.",
          });
        }
      } catch {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: "Lỗi kết nối máy chủ.",
        });
      }
    }

    setBulkChangeStatusResults(results);
    setBulkSubmitting(false);
    await loadAll();
    // Reset selection sau khi chuyển trạng thái hàng loạt
    setSelectedYeuCauIds([]);
  };

  const handleBulkDeleteDaHuy = async () => {
    setBulkSubmitting(true);
    const accessToken = getCookie("access_token");
    const mapDaHuyById = new Map<number, YeuCauDaHuy>();
    listDaHuy.forEach((yc) => mapDaHuyById.set(yc.id, yc));

    const results: {
      id: number;
      maSinhVien: string;
      hoTen: string;
      status: "success" | "failed";
      message: string;
    }[] = [];

    for (const id of selectedDaHuyIds) {
      const yc = mapDaHuyById.get(id);
      if (!yc) continue;
      const maSinhVien = yc.sinhVien.maSinhVien;
      const hoTen = yc.sinhVien.hoTen;

      try {
        const res = await fetch(
          `${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan/${id}`,
          {
            method: "DELETE",
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
          }
        );
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "success",
            message: body.message ?? "Đã xoá yêu cầu.",
          });
        } else {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "failed",
            message: body.message ?? "Xoá yêu cầu thất bại.",
          });
        }
      } catch {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: "Lỗi kết nối máy chủ.",
        });
      }
    }

    setBulkDeleteDaHuyResults(results);
    setBulkSubmitting(false);
    await loadAll();
    // Reset selection sau khi xoá hàng loạt
    setSelectedDaHuyIds([]);
  };

  const handleBulkReject = async () => {
    setBulkSubmitting(true);
    const accessToken = getCookie("access_token");
    const results: {
      id: number;
      maSinhVien: string;
      hoTen: string;
      status: "success" | "failed";
      message: string;
    }[] = [];

    const mapById = new Map<number, YeuCauChoDuyet>();
    listDangXuLy.forEach((yc) => mapById.set(yc.id, yc));

    for (const id of selectedYeuCauIds) {
      const yc = mapById.get(id);
      if (!yc) continue;
      const maSinhVien = yc.sinhVien.maSinhVien;
      const hoTen = yc.sinhVien.hoTen;

      try {
        const res = await fetch(`${ENV.BACKEND_URL}/giang-day/yeu-cau-hoc-phan/tu-choi`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            yeuCauId: id,
            ghiChuPhongDaoTao: "Yêu cầu không hợp lệ",
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "success",
            message: body.message ?? "Đã từ chối yêu cầu.",
          });
        } else {
          results.push({
            id,
            maSinhVien,
            hoTen,
            status: "failed",
            message: body.message ?? "Từ chối yêu cầu thất bại.",
          });
        }
      } catch {
        results.push({
          id,
          maSinhVien,
          hoTen,
          status: "failed",
          message: "Lỗi kết nối máy chủ.",
        });
      }
    }

    setBulkRejectResults(results);
    setBulkSubmitting(false);
    await loadAll();
    // Reset selection sau khi từ chối hàng loạt
    setSelectedYeuCauIds([]);
  };

  // ========== Filter options ==========

  const loaiYeuCauFilterOptions: FilterOption[] = [
    { value: "HOC_CAI_THIEN", label: "Học cải thiện" },
    { value: "HOC_BO_SUNG", label: "Học bổ sung" },
  ];

  // ========== Render ==========

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý yêu cầu học phần" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-10">
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

        {/* Intro & stats */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/40">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                <FontAwesomeIcon icon={faUserGraduate} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Quản lý yêu cầu tham gia lớp học phần
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Xem, lọc và xử lý các yêu cầu học cải thiện / học bổ sung của sinh viên theo từng lớp học phần.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              startIcon={
                loading || refreshing ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faArrowRotateRight} />
                )
              }
            >
              Làm mới
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              icon={faUserGraduate}
              title="Tổng yêu cầu"
              value={loading ? "..." : totalAll}
              color="gray"
            />
            <StatCard icon={faClockRotateLeft} title="Chờ duyệt" value={totalChoDuyet} color="amber" />
            <StatCard icon={faClockRotateLeft} title="Đang xử lý" value={totalDangXuLy} color="amber" />
            <StatCard icon={faCircleCheck} title="Đã duyệt" value={totalDaDuyet} color="green" />
            <StatCard icon={faCircleExclamation} title="Từ chối / Đã huỷ" value={totalTuChoi + totalDaHuy} color="red" />
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
            <div className="flex items-start gap-2">
              <FontAwesomeIcon icon={faCircleExclamation} className="mt-0.5" />
              <div>
                <p className="font-semibold">Không thể tải dữ liệu</p>
                <p className="mt-1 text-xs">{fetchError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1.5 text-xs dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("cho-duyet")}
            className={`flex-1 rounded-lg px-3 py-2 font-medium ${
              activeTab === "cho-duyet"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60"
            }`}
          >
            Chờ duyệt ({totalChoDuyet})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dang-xu-ly")}
            className={`flex-1 rounded-lg px-3 py-2 font-medium ${
              activeTab === "dang-xu-ly"
                ? "bg-white text-amber-600 shadow-sm dark:bg-gray-900 dark:text-amber-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60"
            }`}
          >
            Đang xử lý ({totalDangXuLy})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("da-duyet")}
            className={`flex-1 rounded-lg px-3 py-2 font-medium ${
              activeTab === "da-duyet"
                ? "bg-white text-green-600 shadow-sm dark:bg-gray-900 dark:text-green-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60"
            }`}
          >
            Đã duyệt ({totalDaDuyet})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tu-choi")}
            className={`flex-1 rounded-lg px-3 py-2 font-medium ${
              activeTab === "tu-choi"
                ? "bg-white text-red-600 shadow-sm dark:bg-gray-900 dark:text-red-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60"
            }`}
          >
            Từ chối ({totalTuChoi})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("da-huy")}
            className={`flex-1 rounded-lg px-3 py-2 font-medium ${
              activeTab === "da-huy"
                ? "bg-white text-red-600 shadow-sm dark:bg-gray-900 dark:text-red-400"
                : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/60"
            }`}
          >
            Đã huỷ ({totalDaHuy})
          </button>
        </div>

        {/* Search + filters + bulk buttons */}
        <div className="mb-4 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 text-xs dark:border-gray-800 dark:bg-gray-900/40">
          {/* Tìm kiếm sinh viên */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <button
                  onClick={handleSearchSubmit}
                  className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  />
                </button>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã sinh viên hoặc tên..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
            </div>
          </div>

          {/* Bộ lọc giống QuanLyCTDT */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200 sm:text-sm">
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              <span>Bộ lọc</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="w-full">
                <Label className="mb-1 block text-xs">Loại yêu cầu</Label>
                <SearchableSelect
                  options={loaiYeuCauFilterOptions}
                  defaultValue={filterLoaiYeuCau}
                  onChange={setFilterLoaiYeuCau}
                  placeholder="Tất cả loại yêu cầu"
                  showSecondary={false}
                  searchPlaceholder="Tìm loại yêu cầu..."
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={handleSearchSubmit} className="h-9">
                Áp dụng bộ lọc
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="h-9">
                Đặt lại
              </Button>
            </div>
          </div>

          {activeTab === "cho-duyet" && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="warning"
                size="sm"
                onClick={openBulkChangeStatusModal}
                disabled={selectedYeuCauIds.length === 0}
                startIcon={<FontAwesomeIcon icon={faClockRotateLeft} />}
              >
                Xử lý ({selectedYeuCauIds.length})
              </Button>
            </div>
          )}

          {activeTab === "dang-xu-ly" && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={openBulkApproveModal}
                disabled={selectedYeuCauIds.length === 0}
                startIcon={<FontAwesomeIcon icon={faCheck} />}
              >
                Duyệt yêu cầu ({selectedYeuCauIds.length})
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={openBulkRejectModal}
                disabled={selectedYeuCauIds.length === 0}
                startIcon={<FontAwesomeIcon icon={faCircleExclamation} />}
              >
                Từ chối yêu cầu ({selectedYeuCauIds.length})
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateLHPModalOpen(true)}
                disabled={!hasRequestWithoutLHP}
                startIcon={<FontAwesomeIcon icon={faPlus} />}
              >
                Tạo lớp học phần
              </Button>
            </div>
          )}

          {activeTab === "da-huy" && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={openBulkDeleteDaHuyModal}
                disabled={selectedDaHuyIds.length === 0}
                startIcon={<FontAwesomeIcon icon={faTrash} />}
              >
                Xoá yêu cầu ({selectedDaHuyIds.length})
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faSpinner} className="h-7 w-7 animate-spin text-blue-500" />
              <p className="text-xs">Đang tải dữ liệu yêu cầu học phần...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faBookOpen} className="mb-1 text-3xl opacity-70" />
              <p className="text-sm font-medium">Không có yêu cầu nào phù hợp</p>
              <p className="text-xs opacity-80">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</p>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto text-[12px]">
              {activeTab === "cho-duyet" && (
                <Table className="min-w-[900px]">
                  <TableHeader className="border-b border-gray-100 text-[11px] dark:border-gray-800">
                    <TableRow className="grid grid-cols-[4%_16%_20%_15%_12%_16%_17%]">
                      <TableCell
                        isHeader
                        className="flex items-center justify-center px-2 py-2"
                      >
                        <Checkbox
                          checked={isAllSelectedOnPage}
                          indeterminate={isIndeterminateOnPage}
                          onChange={handleSelectAllCurrentPage}
                        />
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Mã SV
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Họ tên
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Loại yêu cầu
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Mã môn
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedList.map((yc) => {
                      const cho = yc as YeuCauChoDuyet;
                      return (
                        <TableRow
                          key={yc.id}
                          className={`grid grid-cols-[4%_16%_20%_15%_12%_16%_17%] items-center ${
                            isSelectedRequest(yc.id)
                              ? "bg-blue-50/50 dark:bg-blue-900/10"
                              : ""
                          }`}
                        >
                          <TableCell className="flex items-center justify-center px-2 py-3">
                            <Checkbox
                              checked={isSelectedRequest(yc.id)}
                              onChange={() => toggleSelectRequest(yc.id)}
                            />
                          </TableCell>
                          <TableCell className="px-3 py-3 font-mono text-gray-900 dark:text-white">
                            {yc.sinhVien.maSinhVien}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-gray-900 dark:text-white">
                            {yc.sinhVien.hoTen}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <Badge variant="light" color={getLoaiYeuCauColor(yc.loaiYeuCau)}>
                              {getLoaiYeuCauLabel(yc.loaiYeuCau)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center text-gray-800 dark:text-gray-100">
                            {formatDateTimeVi(yc.ngayTao)}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center font-mono text-gray-900 dark:text-white">
                            {yc.monHoc.maMonHoc}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <div className="relative inline-block">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleDropdown(yc.id)}
                                className="dropdown-toggle flex items-center gap-1 px-2 py-1"
                              >
                                <span>Chọn</span>
                                <FaAngleDown
                                  className={`text-[11px] text-gray-500 transition-transform ${
                                    activeDropdownId === yc.id ? "rotate-180" : "rotate-0"
                                  }`}
                                />
                              </Button>
                              <Dropdown
                                isOpen={activeDropdownId === yc.id}
                                onClose={closeDropdown}
                                className="mt-1 w-40"
                              >
                                <div className="py-1 text-xs">
                                  <DropdownItem
                                    tag="button"
                                    onItemClick={closeDropdown}
                                    onClick={() => handleOpenEditModal(cho, "edit", false)}
                                  >
                                  <FontAwesomeIcon icon={faEdit} className="mr-2 w-3.5" />
                                    Chỉnh sửa
                                  </DropdownItem>
                                  <DropdownItem
                                    tag="button"
                                    onItemClick={closeDropdown}
                                    onClick={() => handleViewBangDiem(yc.sinhVien.id)}
                                  >
                                    <FontAwesomeIcon icon={faFileInvoice} className="mr-2 w-3.5" />
                                    Bảng điểm
                                  </DropdownItem>
                                </div>
                              </Dropdown>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {activeTab === "dang-xu-ly" && (
                <Table className="min-w-[900px]">
                  <TableHeader className="border-b border-gray-100 text-[11px] dark:border-gray-800">
                    <TableRow className="grid grid-cols-[4%_12%_15%_12%_12%_16%_17%_12%]">
                      <TableCell
                        isHeader
                        className="flex items-center justify-center px-2 py-2"
                      >
                        <Checkbox
                          checked={isAllSelectedOnPage}
                          indeterminate={isIndeterminateOnPage}
                          onChange={handleSelectAllCurrentPage}
                        />
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Mã SV
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Họ tên
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Loại yêu cầu
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Mã môn
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        Mã LHP đề xuất
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedList.map((yc) => {
                      const cho = yc as YeuCauChoDuyet;
                      const selectedId = editSelectedLHPMap[yc.id];
                      const selectedLHP = cho.lopHocPhanDeXuat.find((l) => l.id === selectedId) ?? cho.lopHocPhanTotNhat;
                      return (
                        <TableRow
                          key={yc.id}
                          className={`grid grid-cols-[4%_12%_15%_12%_12%_16%_17%_12%] items-center ${
                            isSelectedRequest(yc.id)
                              ? "bg-blue-50/50 dark:bg-blue-900/10"
                              : ""
                          }`}
                        >
                          <TableCell className="flex items-center justify-center px-2 py-3">
                            <Checkbox
                              checked={isSelectedRequest(yc.id)}
                              onChange={() => toggleSelectRequest(yc.id)}
                            />
                          </TableCell>
                          <TableCell className="px-3 py-3 font-mono text-gray-900 dark:text-white">
                            {yc.sinhVien.maSinhVien}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-gray-900 dark:text-white">
                            {yc.sinhVien.hoTen}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <Badge variant="light" color={getLoaiYeuCauColor(yc.loaiYeuCau)}>
                              {getLoaiYeuCauLabel(yc.loaiYeuCau)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center text-gray-800 dark:text-gray-100">
                            {formatDateTimeVi(yc.ngayTao)}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center font-mono text-gray-900 dark:text-white">
                            {yc.monHoc.maMonHoc}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center font-mono text-gray-900 dark:text-white">
                            {selectedLHP ? selectedLHP.maLopHocPhan : "—"}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <div className="relative inline-block">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleDropdown(yc.id)}
                                className="dropdown-toggle flex items-center gap-1 px-2 py-1"
                              >
                                <span>Chọn</span>
                                <FaAngleDown
                                  className={`text-[11px] text-gray-500 transition-transform ${
                                    activeDropdownId === yc.id ? "rotate-180" : "rotate-0"
                                  }`}
                                />
                              </Button>
                              <Dropdown
                                isOpen={activeDropdownId === yc.id}
                                onClose={closeDropdown}
                                className="mt-1 w-40"
                              >
                                <div className="py-1 text-xs">
                                  <DropdownItem
                                    tag="button"
                                    onItemClick={closeDropdown}
                                    onClick={() => handleOpenEditModal(cho, "edit", true)}
                                  >
                                  <FontAwesomeIcon icon={faEdit} className="mr-2 w-3.5" />
                                    Chỉnh sửa
                                  </DropdownItem>
                                  <DropdownItem
                                    tag="button"
                                    onItemClick={closeDropdown}
                                    onClick={() => handleViewBangDiem(yc.sinhVien.id)}
                                  >
                                    <FontAwesomeIcon icon={faFileInvoice} className="mr-2 w-3.5" />
                                    Bảng điểm
                                  </DropdownItem>
                                </div>
                              </Dropdown>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {activeTab === "da-duyet" && (
                <Table className="min-w-[900px]">
                  <TableHeader className="border-b border-gray-100 text-[11px] dark:border-gray-800">
                    <TableRow className="grid grid-cols-[5%_11%_18%_11%_11%_11%_19%_14%]">
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        STT
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Mã SV
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Họ tên
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Loại yêu cầu
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Ngày xử lý
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        Mã LHP đã duyệt
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedList.map((yc, idx) => {
                      const item = yc as YeuCauDaDuyet;
                      return (
                        <TableRow
                          key={item.id}
                          className="grid grid-cols-[5%_11%_18%_11%_11%_11%_19%_14%] items-center"
                        >
                          <TableCell className="px-3 py-3 text-center text-gray-700 dark:text-gray-200">
                            {(daDuyetPage - 1) * PAGE_SIZE_SERVER + idx + 1}
                          </TableCell>
                          <TableCell className="px-3 py-3 font-mono text-gray-900 dark:text-white">
                            {item.sinhVien.maSinhVien}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-gray-900 dark:text-white">
                            {item.sinhVien.hoTen}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <Badge variant="light" color={getLoaiYeuCauColor(item.loaiYeuCau)}>
                              {getLoaiYeuCauLabel(item.loaiYeuCau)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center text-gray-800 dark:text-gray-100">
                            {formatDateTimeVi(item.ngayTao)}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center text-gray-800 dark:text-gray-100">
                            {formatDateTimeVi(item.ngayXuLy)}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center font-mono text-gray-900 dark:text-white">
                            {item.lopHocPhanDaDuyet.maLopHocPhan}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBangDiem(item.sinhVien.id)}
                                className="px-2"
                              >
                                <FontAwesomeIcon icon={faFileInvoice} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenEditModal(item as any, "view")}
                                className="px-2"
                              >
                                <FontAwesomeIcon icon={faBookOpen} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {(activeTab === "tu-choi" || activeTab === "da-huy") && (
                <Table className="min-w-[900px]">
                  <TableHeader className="border-b border-gray-100 text-[11px] dark:border-gray-800">
                    <TableRow
                      className={
                        activeTab === "da-huy"
                          ? "grid grid-cols-[4%_6%_12%_22%_12%_16%_16%_12%]"
                          : "grid grid-cols-[6%_12%_22%_12%_16%_16%_16%]"
                      }
                    >
                      {activeTab === "da-huy" && (
                        <TableCell
                          isHeader
                          className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                        >
                          <Checkbox
                            checked={isAllDaHuySelectedOnPage}
                            indeterminate={isDaHuyIndeterminateOnPage}
                            onChange={handleSelectAllDaHuyOnPage}
                          />
                        </TableCell>
                      )}
                      <TableCell
                        isHeader
                        className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400"
                      >
                        STT
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Mã SV
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 font-medium text-gray-500 dark:text-gray-400">
                        Họ tên
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Loại yêu cầu
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Ngày tạo
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Ngày xử lý
                      </TableCell>
                      <TableCell isHeader className="px-3 py-2 text-center font-medium text-gray-500 dark:text-gray-400">
                        Hành động
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedList.map((yc, idx) => {
                      const item =
                        activeTab === "da-huy" ? (yc as YeuCauDaHuy) : (yc as YeuCauTuChoi);
                      return (
                        <TableRow
                          key={item.id}
                          className={`items-center ${
                            activeTab === "da-huy"
                              ? "grid grid-cols-[4%_6%_12%_22%_12%_16%_16%_12%]"
                              : "grid grid-cols-[6%_12%_22%_12%_16%_16%_16%]"
                          } ${
                            activeTab === "da-huy" && isSelectedDaHuy(item.id)
                              ? "bg-red-50/50 dark:bg-red-900/10"
                              : ""
                          }`}
                        >
                          {activeTab === "da-huy" && (
                            <TableCell className="px-3 py-3 text-center">
                              <Checkbox
                                checked={isSelectedDaHuy(item.id)}
                                onChange={() => toggleSelectDaHuy(item.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell className="px-3 py-3 text-center text-gray-700 dark:text-gray-200">
                            {(
                              (activeTab === "da-huy" ? daHuyPage : tuChoiPage) - 1
                            ) * PAGE_SIZE_SERVER + idx + 1}
                          </TableCell>
                          <TableCell className="px-3 py-3 font-mono text-gray-900 dark:text-white">
                            {item.sinhVien.maSinhVien}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-gray-900 dark:text-white">
                            {item.sinhVien.hoTen}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <Badge variant="light" color={getLoaiYeuCauColor(item.loaiYeuCau)}>
                              {getLoaiYeuCauLabel(item.loaiYeuCau)}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center text-gray-800 dark:text-gray-100">
                            {formatDateTimeVi(item.ngayTao)}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center text-gray-800 dark:text-gray-100">
                            {formatDateTimeVi(item.ngayXuLy)}
                          </TableCell>
                          <TableCell className="px-3 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenViewDetailModal(item)}
                                className="px-2"
                              >
                                <FontAwesomeIcon icon={faCircleInfo} />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBangDiem(item.sinhVien.id)}
                                className="px-2"
                              >
                                <FontAwesomeIcon icon={faFileInvoice} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Hiển thị{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {totalItems === 0 ? 0 : (currentPage - 1) * pageSizeForDisplay + 1}
              </span>{" "}
              -{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {Math.min(currentPage * pageSizeForDisplay, totalItems)}
              </span>{" "}
              trên{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {totalItems}
              </span>{" "}
              kết quả
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={async (page) => {
                  if (activeTab === "cho-duyet") {
                    setChoDuyetPage(page);
                    return;
                  }
                  if (activeTab === "dang-xu-ly") {
                    setDangXuLyPage(page);
                    return;
                  }
                  if (activeTab === "da-duyet") {
                    setDaDuyetPage(page);
                    await fetchDaDuyetPage(page, searchKeyword.trim(), filterLoaiYeuCau);
                    return;
                  }
                  if (activeTab === "tu-choi") {
                    setTuChoiPage(page);
                    await fetchTuChoiPage(page, searchKeyword.trim(), filterLoaiYeuCau);
                    return;
                  }
                  if (activeTab === "da-huy") {
                    setDaHuyPage(page);
                    await fetchDaHuyPage(page, searchKeyword.trim(), filterLoaiYeuCau);
                    return;
                  }
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Edit / view modal */}
      <EditRequestModal
        isOpen={editModalOpen && !!editingRequest}
        onClose={handleCloseEditModal}
        request={editingRequest}
        mode={editMode}
        selectedLopHocPhanId={
          editingRequest ? editSelectedLHPMap[editingRequest.id] ?? null : null
        }
        onSelectedLopHocPhanChange={handleChangeSelectedLHPInModal}
        ghiChuPhongDaoTao={
          editingRequest ? getGhiChuForRequest(editingRequest.id) : ""
        }
        onGhiChuChange={handleChangeGhiChuInModal}
        baseSiSoByLopHocPhanId={baseSiSoByLopHocPhanId}
        proposedCountByLopHocPhanId={proposedCountByLopHocPhanId}
        showLHPSelection={showLHPSelectionForModal}
      />

      {/* View detail modal for từ chối / đã huỷ */}
      <ViewRequestModal
        isOpen={viewDetailModalOpen && !!viewDetailRequest}
        onClose={handleCloseViewDetailModal}
        request={viewDetailRequest}
      />

      {/* Bulk approve modal */}
      <Modal
        isOpen={isBulkApproveModalOpen}
        onClose={() => !bulkSubmitting && setIsBulkApproveModalOpen(false)}
        size="2xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 text-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Duyệt yêu cầu học phần (
                {bulkApproveResults.length > 0
                  ? bulkApproveResults.length
                  : selectedYeuCauIds.length}
                )
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hệ thống sẽ gán sinh viên vào lớp học phần đã chọn nếu chưa vượt sĩ số 40 SV/LHP.
              </p>
            </div>
          </div>

          {bulkApproveResults.length === 0 && !bulkSubmitting && (
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Bạn có chắc chắn muốn duyệt{" "}
              <strong>{selectedYeuCauIds.length}</strong> yêu cầu đã chọn?
            </p>
          )}

          {/* Bảng xem trước các hàng sẽ được duyệt */}
          {bulkApproveResults.length === 0 && !bulkSubmitting && selectedYeuCauIds.length > 0 && (
            <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Mã SV</th>
                    <th className="px-3 py-2 text-left">Họ tên</th>
                    <th className="px-3 py-2 text-left">Lớp học phần được duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedYeuCauIds
                    .map((id) => listDangXuLy.find((yc) => yc.id === id))
                    .filter((yc): yc is YeuCauChoDuyet => Boolean(yc))
                    .map((yc) => {
                      const selectedLhpId = editSelectedLHPMap[yc.id];
                      const selectedLhp =
                        yc.lopHocPhanDeXuat?.find((lhp) => lhp.id === selectedLhpId) ?? null;
                      return (
                        <tr key={yc.id}>
                          <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                            {yc.sinhVien.maSinhVien}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                            {yc.sinhVien.hoTen}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                            {selectedLhp
                              ? selectedLhp.maLopHocPhan
                              : "Chưa chọn lớp học phần"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {bulkSubmitting && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-600 dark:text-gray-300">
              <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-green-500" />
              <p>Đang duyệt yêu cầu...</p>
            </div>
          )}

          {bulkApproveResults.length > 0 && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300">
                  <p className="text-lg font-bold">
                    {bulkApproveResults.filter((r) => r.status === "success").length}
                  </p>
                  <p className="text-[11px]">Duyệt thành công</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
                  <p className="text-lg font-bold">
                    {bulkApproveResults.filter((r) => r.status === "failed").length}
                  </p>
                  <p className="text-[11px]">Duyệt thất bại</p>
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SV</th>
                      <th className="px-3 py-2 text-left">Họ tên</th>
                      <th className="px-3 py-2 text-left">Trạng thái</th>
                      <th className="px-3 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {bulkApproveResults.map((r) => (
                      <tr
                        key={r.id}
                        className={
                          r.status === "failed"
                            ? "bg-red-50/60 dark:bg-red-900/10"
                            : "bg-green-50/40 dark:bg-green-900/5"
                        }
                      >
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {r.maSinhVien}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {r.hoTen}
                        </td>
                        <td className="px-3 py-2">
                          {r.status === "success" ? (
                            <span className="text-green-600 dark:text-green-400">Thành công</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Thất bại</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {r.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={bulkSubmitting}
              onClick={() => setIsBulkApproveModalOpen(false)}
            >
              Đóng
            </Button>
            {bulkApproveResults.length === 0 && !bulkSubmitting && (
              <Button
                variant="primary"
                onClick={handleBulkApprove}
                disabled={bulkSubmitting}
              >
                Xác nhận duyệt
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Bulk change status modal */}
      <Modal
        isOpen={isBulkChangeStatusModalOpen}
        onClose={() => !bulkSubmitting && setIsBulkChangeStatusModalOpen(false)}
        size="2xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 text-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
              <FontAwesomeIcon icon={faClockRotateLeft} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Xử lý (
                {bulkChangeStatusResults.length > 0
                  ? bulkChangeStatusResults.length
                  : selectedYeuCauIds.length}
                )
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Chuyển các yêu cầu đã chọn sang trạng thái đang xử lý.
              </p>
            </div>
          </div>

          {bulkChangeStatusResults.length === 0 && !bulkSubmitting && (
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Bạn có chắc chắn muốn xử lý{" "}
              <strong>{selectedYeuCauIds.length}</strong> yêu cầu đã chọn?
            </p>
          )}

          {/* Bảng xem trước các hàng sẽ được xử lý */}
          {bulkChangeStatusResults.length === 0 && !bulkSubmitting && selectedYeuCauIds.length > 0 && (
            <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Mã SV</th>
                    <th className="px-3 py-2 text-left">Họ tên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedYeuCauIds
                    .map((id) => listChoDuyet.find((yc) => yc.id === id))
                    .filter((yc): yc is YeuCauChoDuyet => Boolean(yc))
                    .map((yc) => (
                      <tr key={yc.id}>
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {yc.sinhVien.maSinhVien}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {yc.sinhVien.hoTen}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {bulkSubmitting && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-600 dark:text-gray-300">
              <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-amber-500" />
              <p>Đang xử lý...</p>
            </div>
          )}

          {bulkChangeStatusResults.length > 0 && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300">
                  <p className="text-lg font-bold">
                    {bulkChangeStatusResults.filter((r) => r.status === "success").length}
                  </p>
                  <p className="text-[11px]">Thành công</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
                  <p className="text-lg font-bold">
                    {bulkChangeStatusResults.filter((r) => r.status === "failed").length}
                  </p>
                  <p className="text-[11px]">Thất bại</p>
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SV</th>
                      <th className="px-3 py-2 text-left">Họ tên</th>
                      <th className="px-3 py-2 text-left">Trạng thái</th>
                      <th className="px-3 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {bulkChangeStatusResults.map((r) => (
                      <tr
                        key={r.id}
                        className={
                          r.status === "success"
                            ? "bg-green-50/40 dark:bg-green-900/5"
                            : "bg-red-50/60 dark:bg-red-900/10"
                        }
                      >
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {r.maSinhVien}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {r.hoTen}
                        </td>
                        <td className="px-3 py-2">
                          {r.status === "success" ? (
                            <span className="text-green-600 dark:text-green-400">Thành công</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Thất bại</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {r.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={bulkSubmitting}
              onClick={() => setIsBulkChangeStatusModalOpen(false)}
            >
              Đóng
            </Button>
            {bulkChangeStatusResults.length === 0 && !bulkSubmitting && (
              <Button
                variant="primary"
                onClick={handleBulkChangeStatus}
                disabled={bulkSubmitting}
              >
                Xác nhận xử lý
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Bulk reject modal */}
      <Modal
        isOpen={isBulkRejectModalOpen}
        onClose={() => !bulkSubmitting && setIsBulkRejectModalOpen(false)}
        size="2xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 text-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
              <FontAwesomeIcon icon={faCircleExclamation} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Từ chối yêu cầu học phần (
                {bulkRejectResults.length > 0 ? bulkRejectResults.length : selectedYeuCauIds.length}
                )
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Từ chối các yêu cầu đã chọn. Các yêu cầu này sẽ được chuyển sang tab Từ chối.
              </p>
            </div>
          </div>

          {bulkRejectResults.length === 0 && !bulkSubmitting && (
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Bạn có chắc chắn muốn từ chối{" "}
              <strong>{selectedYeuCauIds.length}</strong> yêu cầu đã chọn?
            </p>
          )}

          {/* Bảng xem trước các hàng sẽ bị từ chối */}
          {bulkRejectResults.length === 0 && !bulkSubmitting && selectedYeuCauIds.length > 0 && (
            <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">Mã SV</th>
                    <th className="px-3 py-2 text-left">Họ tên</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedYeuCauIds
                    .map((id) => listDangXuLy.find((yc) => yc.id === id))
                    .filter((yc): yc is YeuCauChoDuyet => Boolean(yc))
                    .map((yc) => (
                      <tr key={yc.id}>
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {yc.sinhVien.maSinhVien}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {yc.sinhVien.hoTen}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {bulkSubmitting && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-600 dark:text-gray-300">
              <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-red-500" />
              <p>Đang từ chối yêu cầu...</p>
            </div>
          )}

          {bulkRejectResults.length > 0 && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300">
                  <p className="text-lg font-bold">
                    {bulkRejectResults.filter((r) => r.status === "success").length}
                  </p>
                  <p className="text-[11px]">Từ chối thành công</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
                  <p className="text-lg font-bold">
                    {bulkRejectResults.filter((r) => r.status === "failed").length}
                  </p>
                  <p className="text-[11px]">Từ chối thất bại</p>
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SV</th>
                      <th className="px-3 py-2 text-left">Họ tên</th>
                      <th className="px-3 py-2 text-left">Trạng thái</th>
                      <th className="px-3 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {bulkRejectResults.map((r) => (
                      <tr
                        key={r.id}
                        className={
                          r.status === "success"
                            ? "bg-green-50/40 dark:bg-green-900/5"
                            : "bg-red-50/60 dark:bg-red-900/10"
                        }
                      >
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {r.maSinhVien}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {r.hoTen}
                        </td>
                        <td className="px-3 py-2">
                          {r.status === "success" ? (
                            <span className="text-green-600 dark:text-green-400">Thành công</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Thất bại</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {r.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={bulkSubmitting}
              onClick={() => setIsBulkRejectModalOpen(false)}
            >
              Đóng
            </Button>
            {bulkRejectResults.length === 0 && !bulkSubmitting && (
              <Button
                variant="primary"
                onClick={handleBulkReject}
                disabled={bulkSubmitting}
              >
                Xác nhận từ chối
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Bulk delete đã huỷ modal */}
      <Modal
        isOpen={isBulkDeleteDaHuyModalOpen}
        onClose={() => !bulkSubmitting && setIsBulkDeleteDaHuyModalOpen(false)}
        size="2xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 text-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
              <FontAwesomeIcon icon={faTrash} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Xoá yêu cầu đã huỷ (
                {bulkDeleteDaHuyResults.length > 0
                  ? bulkDeleteDaHuyResults.length
                  : selectedDaHuyIds.length}
                )
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Xoá vĩnh viễn các yêu cầu đã huỷ. Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>

          {bulkDeleteDaHuyResults.length === 0 && !bulkSubmitting && (
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
              Bạn có chắc chắn muốn xoá <strong>{selectedDaHuyIds.length}</strong> yêu cầu đã huỷ?
            </p>
          )}

          {/* Bảng xem trước các hàng sẽ bị xoá */}
          {bulkDeleteDaHuyResults.length === 0 &&
            !bulkSubmitting &&
            selectedDaHuyIds.length > 0 && (
              <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SV</th>
                      <th className="px-3 py-2 text-left">Họ tên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {selectedDaHuyIds
                      .map((id) => listDaHuy.find((yc) => yc.id === id))
                      .filter((yc): yc is YeuCauDaHuy => Boolean(yc))
                      .map((yc) => (
                        <tr key={yc.id}>
                          <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                            {yc.sinhVien.maSinhVien}
                          </td>
                          <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                            {yc.sinhVien.hoTen}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

          {bulkSubmitting && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-600 dark:text-gray-300">
              <FontAwesomeIcon icon={faSpinner} className="h-6 w-6 animate-spin text-red-500" />
              <p>Đang xoá yêu cầu...</p>
            </div>
          )}

          {bulkDeleteDaHuyResults.length > 0 && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300">
                  <p className="text-lg font-bold">
                    {bulkDeleteDaHuyResults.filter((r) => r.status === "success").length}
                  </p>
                  <p className="text-[11px]">Xoá thành công</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
                  <p className="text-lg font-bold">
                    {bulkDeleteDaHuyResults.filter((r) => r.status === "failed").length}
                  </p>
                  <p className="text-[11px]">Xoá thất bại</p>
                </div>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/40">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-xs text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SV</th>
                      <th className="px-3 py-2 text-left">Họ tên</th>
                      <th className="px-3 py-2 text-left">Trạng thái</th>
                      <th className="px-3 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {bulkDeleteDaHuyResults.map((r) => (
                      <tr
                        key={r.id}
                        className={
                          r.status === "success"
                            ? "bg-green-50/40 dark:bg-green-900/5"
                            : "bg-red-50/60 dark:bg-red-900/10"
                        }
                      >
                        <td className="px-3 py-2 font-mono text-gray-900 dark:text-gray-100">
                          {r.maSinhVien}
                        </td>
                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                          {r.hoTen}
                        </td>
                        <td className="px-3 py-2">
                          {r.status === "success" ? (
                            <span className="text-green-600 dark:text-green-400">Thành công</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Thất bại</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                          {r.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={bulkSubmitting}
              onClick={() => setIsBulkDeleteDaHuyModalOpen(false)}
            >
              Đóng
            </Button>
            {bulkDeleteDaHuyResults.length === 0 && !bulkSubmitting && (
              <Button
                variant="primary"
                onClick={handleBulkDeleteDaHuy}
                disabled={bulkSubmitting}
              >
                Xác nhận xoá
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal tạo lớp học phần */}
      <Modal
        isOpen={isCreateLHPModalOpen}
        onClose={() => setIsCreateLHPModalOpen(false)}
        size="2xl"
      >
        <div className="max-h-[90vh] overflow-y-auto p-6 text-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <FontAwesomeIcon icon={faPlus} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Tạo lớp học phần cho học bổ sung và cải thiện
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hướng dẫn tạo lớp học phần cho các yêu cầu chưa có lớp học phần đề xuất
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-700 dark:border-blue-800/60 dark:bg-blue-900/20 dark:text-blue-300">
              <div className="mb-2 flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Thông tin hướng dẫn:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Trang tạo lớp học phần sẽ được mở trong tab trình duyệt mới</li>
                    <li>Bạn có thể tạo lớp học phần cho các sinh viên chưa có lớp học phần đề xuất</li>
                    <li>Sau khi tạo xong, quay lại trang này và làm mới dữ liệu để cập nhật</li>
                    <li>Hệ thống sẽ tự động đề xuất lớp học phần phù hợp cho các yêu cầu</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                Số lượng yêu cầu chưa có lớp học phần đề xuất:
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {listDangXuLy.filter(
                  (yc) => !yc.lopHocPhanDeXuat || yc.lopHocPhanDeXuat.length === 0
                ).length}{" "}
                yêu cầu
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateLHPModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                window.open(
                  `${ENV.FRONTEND_ADMIN_URL}/quan-ly-lop-hoc-phan/yeu-cau-sinh-vien/tao-lhp-bo-sung-va-cai-thien`,
                  "_blank"
                );
                setIsCreateLHPModalOpen(false);
              }}
            >
              Xác nhận và mở trang tạo lớp học phần
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

