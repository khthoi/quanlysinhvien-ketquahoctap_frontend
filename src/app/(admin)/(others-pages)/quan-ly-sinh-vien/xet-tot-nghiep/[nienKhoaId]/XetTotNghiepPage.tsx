"use client";
import { ENV } from "@/config/env";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import SearchableSelect from "@/components/form/SelectCustom";
import Badge from "@/components/ui/badge/Badge";
import Pagination from "@/components/tables/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faCircleCheck,
    faCircleExclamation,
    faSpinner,
    faUserGraduate,
    faRefresh,
    faFileExcel,
    faAward,
    faMedal,
    faStar,
    faGraduationCap,
    faChartBar,
    faCheckDouble,
    faExclamationTriangle,
    faTimesCircle,
    faArrowLeft,
    faEye,
    faFilter,
    faTimes,
    faChartPie,
    faFileInvoice,
    faCircleInfo,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// --- Types ---
interface NienKhoaInfo {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    moTa?: string;
}

// Enum kết quả xét tốt nghiệp
enum KetQuaXetTotNghiepEnum {
    DAT = 'Đạt',
    KHONG_DAT = 'Không đạt',
    KHONG_DU_DIEU_KIEN = 'Không đủ ĐK',
}

// Enum xếp loại tốt nghiệp
enum XepLoaiTotNghiepEnum {
    XUAT_SAC = 'Xuất sắc',
    GIOI = 'Giỏi',
    KHA = 'Khá',
    TRUNG_BINH = 'Trung bình',
    KHONG_DAT = 'Không đạt',
}

interface SinhVienXetTotNghiep {
    stt: number;
    id: number;
    maSinhVien: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    maNienKhoa: string;
    maNganh: string;
    tenNganh: string;
    maLop: string;
    gpa: number | null;
    ketQuaXet: KetQuaXetTotNghiepEnum;
    xepLoaiTotNghiep: XepLoaiTotNghiepEnum;
    lyDo: string;
}

interface SinhVienTotNghiep {
    stt: number;
    id: number;
    maSinhVien: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    maNienKhoa: string;
    maNganh: string;
    tenNganh: string;
    maLop: string;
    gpa: number | null;
    xepLoaiTotNghiep: XepLoaiTotNghiepEnum;
}

interface ThongKeTongQuan {
    tongSinhVienDuocXet: number;
    soSinhVienDat: number;
    soSinhVienKhongDat: number;
    soSinhVienKhongDuDieuKien: number;
    soXuatSac: number;
    soGioi: number;
    soKha: number;
    soTrungBinh: number;
}

interface ThongKeTheoNganh {
    nganhId: number;
    maNganh: string;
    tenNganh: string;
    tongSinhVien: number;
    soSinhVienDat: number;
    soSinhVienKhongDat: number;
    soSinhVienKhongDuDieuKien: number;
    soXuatSac: number;
    soGioi: number;
    soKha: number;
    soTrungBinh: number;
}

interface DuDoanXetTotNghiepResponse {
    nienKhoaId: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    ngayXet: string;
    thongKeTongQuan: ThongKeTongQuan;
    thongKeTheoNganh: ThongKeTheoNganh[];
    danhSachSinhVien: SinhVienXetTotNghiep[];
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
}

interface DanhSachTotNghiepResponse {
    nienKhoaId: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    tongSinhVienTotNghiep: number;
    thongKeTheoNganh: ThongKeTheoNganh[];
    danhSachSinhVien: SinhVienTotNghiep[];
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
}

interface XacNhanXetTotNghiepResponse {
    success: boolean;
    message: string;
    nienKhoaId: number;
    maNienKhoa: string;
    ngayXetTotNghiep: string;
    thongKe: ThongKeTongQuan;
    thongKeTheoNganh: ThongKeTheoNganh[];
    danhSachSinhVienDat: SinhVienXetTotNghiep[];
}

const PAGE_SIZE = 10;

function formatDateVi(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return dateStr;
    }
}

// --- Stat Card Component ---
interface StatCardProps {
    icon: typeof faUserGraduate;
    title: string;
    value: number | string;
    color: "blue" | "green" | "amber" | "red" | "purple" | "indigo" | "teal" | "orange";
    subtitle?: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, subtitle, loading }) => {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400",
        green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400",
        amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400",
        red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400",
        indigo: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400",
        teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800/50 text-teal-600 dark:text-teal-400",
        orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400",
    };

    const iconBgClasses: Record<string, string> = {
        blue: "bg-blue-100 dark:bg-blue-800/50",
        green: "bg-green-100 dark:bg-green-800/50",
        amber: "bg-amber-100 dark:bg-amber-800/50",
        red: "bg-red-100 dark:bg-red-800/50",
        purple: "bg-purple-100 dark:bg-purple-800/50",
        indigo: "bg-indigo-100 dark:bg-indigo-800/50",
        teal: "bg-teal-100 dark:bg-teal-800/50",
        orange: "bg-orange-100 dark:bg-orange-800/50",
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[color]} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
            <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgClasses[color]} shadow-sm`}>
                    <FontAwesomeIcon icon={icon} className="text-xl" />
                </div>
                <div>
                    {loading ? (
                        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold">{value}</p>
                    )}
                    <p className="text-sm opacity-90">{title}</p>
                    {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

// --- Detail Modal ---
interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: SinhVienXetTotNghiep | SinhVienTotNghiep | null;
    type: 'du-doan' | 'da-tot-nghiep';
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, item, type }) => {
    if (!isOpen || !item) return null;

    const isDuDoan = type === 'du-doan';
    const duDoanItem = item as SinhVienXetTotNghiep;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <FontAwesomeIcon icon={faUserGraduate} className="text-xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Chi tiết sinh viên
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.maSinhVien}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ và tên</p>
                            <p className="mt-1 font-semibold text-gray-800 dark:text-white">{item.hoTen}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngày sinh</p>
                            <p className="mt-1 text-gray-800 dark:text-white">{formatDateVi(item.ngaySinh)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giới tính</p>
                            <p className="mt-1 text-gray-800 dark:text-white">{item.gioiTinh}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lớp</p>
                            <p className="mt-1 font-mono text-gray-800 dark:text-white">{item.maLop}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngành</p>
                            <p className="mt-1 text-gray-800 dark:text-white">{item.tenNganh}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">GPA</p>
                            <p className="mt-1 font-bold text-xl text-blue-600 dark:text-blue-400">
                                {item.gpa !== null ? item.gpa.toFixed(2) : "—"}
                            </p>
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faAward} />
                            Kết quả xét tốt nghiệp
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {isDuDoan && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kết quả xét</p>
                                    <Badge
                                        variant="light"
                                        color={
                                            duDoanItem.ketQuaXet === KetQuaXetTotNghiepEnum.DAT ? "success" :
                                                duDoanItem.ketQuaXet === KetQuaXetTotNghiepEnum.KHONG_DAT ? "error" : "warning"
                                        }
                                        className="mt-1"
                                    >
                                        {duDoanItem.ketQuaXet}
                                    </Badge>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Xếp loại tốt nghiệp</p>
                                <Badge
                                    variant="light"
                                    color={
                                        item.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.XUAT_SAC ? "primary" :
                                            item.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.GIOI ? "success" :
                                                item.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.KHA ? "info" :
                                                    item.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.TRUNG_BINH ? "warning" : "error"
                                    }
                                    className="mt-1"
                                >
                                    {item.xepLoaiTotNghiep}
                                </Badge>
                            </div>
                            {isDuDoan && duDoanItem.lyDo && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Lý do
                                    </p>
                                    <div className="mt-2 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50/80 dark:bg-red-900/10 px-4 py-3">
                                        <ul className="list-disc list-outside space-y-1.5 pl-5 text-sm text-red-700 dark:text-red-300">
                                            {duDoanItem.lyDo
                                                .split(";")
                                                .map((reason) => reason.trim())
                                                .filter((reason) => reason.length > 0)
                                                .map((reason, index) => (
                                                    <li key={index} className="leading-relaxed">
                                                        {reason}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Confirm Modal ---
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    thongKe: ThongKeTongQuan | null;
    nienKhoaInfo: NienKhoaInfo | null;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
    thongKe,
    nienKhoaInfo
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-2xl text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            Xác nhận xét tốt nghiệp
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {nienKhoaInfo?.tenNienKhoa}
                        </p>
                    </div>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                        <FontAwesomeIcon icon={faCircleExclamation} className="mr-2" />
                        <strong>Lưu ý:</strong> Thao tác này sẽ cập nhật trạng thái tốt nghiệp cho tất cả sinh viên đạt điều kiện.
                        Hành động này không thể hoàn tác.
                    </p>
                </div>

                {thongKe && (
                    <div className="mb-6 grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{thongKe.soSinhVienDat}</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Đạt tốt nghiệp</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-center">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{thongKe.soSinhVienKhongDat}</p>
                            <p className="text-xs text-red-700 dark:text-red-300">Không đạt</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheckDouble} className="mr-2" />
                                Xác nhận
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Result Modal ---
interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: XacNhanXetTotNghiepResponse | null;
    error: string | null;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, result, error }) => {
    if (!isOpen) return null;

    const isSuccess = result?.success === true;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl">
                <div className="text-center mb-6">
                    <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${isSuccess
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                        } mb-4`}>
                        <FontAwesomeIcon
                            icon={isSuccess ? faCircleCheck : faTimesCircle}
                            className={`text-4xl ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                        />
                    </div>
                    <h3 className={`text-2xl font-bold ${isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isSuccess ? 'Xét tốt nghiệp thành công!' : 'Xét tốt nghiệp thất bại'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {result?.message || error || 'Đã xảy ra lỗi không xác định'}
                    </p>
                </div>

                {isSuccess && result && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 text-center">
                                <FontAwesomeIcon icon={faStar} className="text-purple-500 mb-1" />
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.thongKe.soXuatSac}</p>
                                <p className="text-xs text-purple-700 dark:text-purple-300">Xuất sắc</p>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-center">
                                <FontAwesomeIcon icon={faMedal} className="text-blue-500 mb-1" />
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.thongKe.soGioi}</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Giỏi</p>
                            </div>
                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-center">
                                <FontAwesomeIcon icon={faAward} className="text-green-500 mb-1" />
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.thongKe.soKha}</p>
                                <p className="text-xs text-green-700 dark:text-green-300">Khá</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-center">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-amber-500 mb-1" />
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{result.thongKe.soTrungBinh}</p>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Trung bình</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Ngày xét:</strong> {formatDateVi(result.ngayXetTotNghiep)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <strong>Tổng số đạt:</strong> {result.thongKe.soSinhVienDat} sinh viên
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <Button variant="primary" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Statistics Modal ---
interface StatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    thongKe: ThongKeTongQuan | null;
    thongKeTheoNganh: ThongKeTheoNganh[];
    loading: boolean;
    type: 'du-doan' | 'da-tot-nghiep';
    nienKhoaInfo: NienKhoaInfo | null;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({
    isOpen,
    onClose,
    thongKe,
    thongKeTheoNganh,
    loading,
    type,
    nienKhoaInfo
}) => {
    if (!isOpen) return null;

    const isDuDoan = type === 'du-doan';

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDuDoan ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                            <FontAwesomeIcon 
                                icon={faChartPie} 
                                className={`text-xl ${isDuDoan ? 'text-indigo-600 dark:text-indigo-400' : 'text-green-600 dark:text-green-400'}`} 
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                {isDuDoan ? 'Thống kê dự đoán xét tốt nghiệp' : 'Thống kê sinh viên đã tốt nghiệp'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {nienKhoaInfo?.tenNienKhoa ?? 'Niên khóa'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-3xl text-indigo-500" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Overall Statistics */}
                        {thongKe && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                                    Tổng quan
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 text-center">
                                        <FontAwesomeIcon icon={faUserGraduate} className="text-blue-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{thongKe.tongSinhVienDuocXet}</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Tổng xét</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-center">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{thongKe.soSinhVienDat}</p>
                                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">Đạt</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-center">
                                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{thongKe.soSinhVienKhongDat}</p>
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">Không đạt</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-center">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{thongKe.soSinhVienKhongDuDieuKien}</p>
                                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Không đủ ĐK</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 text-center">
                                        <FontAwesomeIcon icon={faStar} className="text-purple-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{thongKe.soXuatSac}</p>
                                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Xuất sắc</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 text-center">
                                        <FontAwesomeIcon icon={faMedal} className="text-indigo-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{thongKe.soGioi}</p>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Giỏi</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 text-center">
                                        <FontAwesomeIcon icon={faAward} className="text-teal-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{thongKe.soKha}</p>
                                        <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">Khá</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 text-center">
                                        <FontAwesomeIcon icon={faGraduationCap} className="text-orange-500 mb-2 text-lg" />
                                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{thongKe.soTrungBinh}</p>
                                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Trung bình</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Statistics by Department */}
                        {thongKeTheoNganh && thongKeTheoNganh.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4">
                                    Thống kê theo ngành
                                </h4>
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Ngành</th>
                                                <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-gray-400">Tổng</th>
                                                <th className="text-center py-3 px-2 font-medium text-green-600 dark:text-green-400">Đạt</th>
                                                <th className="text-center py-3 px-2 font-medium text-red-600 dark:text-red-400">K.Đạt</th>
                                                <th className="text-center py-3 px-2 font-medium text-amber-600 dark:text-amber-400">K.Đủ ĐK</th>
                                                <th className="text-center py-3 px-2 font-medium text-purple-600 dark:text-purple-400">X.Sắc</th>
                                                <th className="text-center py-3 px-2 font-medium text-blue-600 dark:text-blue-400">Giỏi</th>
                                                <th className="text-center py-3 px-2 font-medium text-teal-600 dark:text-teal-400">Khá</th>
                                                <th className="text-center py-3 px-2 font-medium text-amber-600 dark:text-amber-400">TB</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {thongKeTheoNganh.map((nganh) => (
                                                <tr key={nganh.nganhId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-3 px-4">
                                                        <span className="font-medium text-gray-800 dark:text-white">{nganh.tenNganh}</span>
                                                        <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">({nganh.maNganh})</span>
                                                    </td>
                                                    <td className="text-center py-3 px-2 font-bold text-gray-800 dark:text-white">{nganh.tongSinhVien}</td>
                                                    <td className="text-center py-3 px-2 text-green-600 dark:text-green-400 font-medium">{nganh.soSinhVienDat}</td>
                                                    <td className="text-center py-3 px-2 text-red-600 dark:text-red-400">{nganh.soSinhVienKhongDat}</td>
                                                    <td className="text-center py-3 px-2 text-amber-600 dark:text-amber-400">{nganh.soSinhVienKhongDuDieuKien}</td>
                                                    <td className="text-center py-3 px-2 text-purple-600 dark:text-purple-400">{nganh.soXuatSac}</td>
                                                    <td className="text-center py-3 px-2 text-blue-600 dark:text-blue-400">{nganh.soGioi}</td>
                                                    <td className="text-center py-3 px-2 text-teal-600 dark:text-teal-400">{nganh.soKha}</td>
                                                    <td className="text-center py-3 px-2 text-amber-600 dark:text-amber-400">{nganh.soTrungBinh}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// --- View Bang Diem Modal ---
interface ViewBangDiemModalProps {
    isOpen: boolean;
    onClose: () => void;
    sinhVien: SinhVienXetTotNghiep | SinhVienTotNghiep | null;
}

const ViewBangDiemModal: React.FC<ViewBangDiemModalProps> = ({ isOpen, onClose, sinhVien }) => {
    if (!isOpen || !sinhVien) return null;

    const handleConfirm = () => {
        const url = `${ENV.FRONTEND_ADMIN_URL}/quan-ly-sinh-vien/bang-diem/${sinhVien.id}`;
        window.open(url, '_blank');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <div className="p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <FontAwesomeIcon icon={faFileInvoice} className="text-xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Xem bảng điểm
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{sinhVien.maSinhVien}</p>
                    </div>
                </div>

                <div className="mb-6 space-y-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ và tên</p>
                                <p className="mt-1 font-semibold text-gray-800 dark:text-white">{sinhVien.hoTen}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lớp</p>
                                <p className="mt-1 font-mono text-gray-800 dark:text-white">{sinhVien.maLop}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCircleInfo} />
                            Hướng dẫn
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                <span>Trang bảng điểm sẽ được mở trong <strong>tab mới</strong> của trình duyệt.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                <span>Trang bảng điểm sẽ hiển thị <strong>thông tin cá nhân</strong> và <strong>bảng điểm chi tiết</strong> tất cả các môn học của sinh viên.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                <span>Bạn có thể <strong>xuất phiếu điểm</strong> từ trang bảng điểm nếu cần.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        startIcon={<FontAwesomeIcon icon={faEye} />}
                    >
                        Xem bảng điểm
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Filter Option Type ---
interface FilterOption {
    value: string;
    label: string;
}

// --- Main Component ---
export default function XetTotNghiepPage() {
    const params = useParams();
    const router = useRouter();
    const nienKhoaId = parseInt((params?.nienKhoaId as string) ?? "0", 10);

    // State
    const [nienKhoaInfo, setNienKhoaInfo] = useState<NienKhoaInfo | null>(null);
    const [duDoanData, setDuDoanData] = useState<DuDoanXetTotNghiepResponse | null>(null);
    const [danhSachTotNghiep, setDanhSachTotNghiep] = useState<DanhSachTotNghiepResponse | null>(null);
    const [loadingNienKhoa, setLoadingNienKhoa] = useState(true);
    const [loadingDuDoan, setLoadingDuDoan] = useState(false);
    const [loadingDanhSach, setLoadingDanhSach] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Tabs & search
    const [activeTab, setActiveTab] = useState<"du-doan" | "da-tot-nghiep">("du-doan");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [filterXepLoai, setFilterXepLoai] = useState("");
    const [filterLop, setFilterLop] = useState("");
    const [filterNganh, setFilterNganh] = useState("");
    const [filterKetQua, setFilterKetQua] = useState(""); // For du-doan tab only
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    // Filter options from API
    const [nganhOptions, setNganhOptions] = useState<FilterOption[]>([]);
    const [lopOptions, setLopOptions] = useState<FilterOption[]>([]);

    // Modal states
    const [detailItem, setDetailItem] = useState<SinhVienXetTotNghiep | SinhVienTotNghiep | null>(null);
    const [detailType, setDetailType] = useState<'du-doan' | 'da-tot-nghiep'>('du-doan');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmResult, setConfirmResult] = useState<XacNhanXetTotNghiepResponse | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [isViewBangDiemModalOpen, setIsViewBangDiemModalOpen] = useState(false);
    const [selectedSinhVienForBangDiem, setSelectedSinhVienForBangDiem] = useState<SinhVienXetTotNghiep | SinhVienTotNghiep | null>(null);

    // Fetch niên khóa info
    const fetchNienKhoaInfo = useCallback(async () => {
        if (!nienKhoaId) return;
        setLoadingNienKhoa(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nien-khoa/${nienKhoaId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setNienKhoaInfo(data);
            } else {
                setFetchError(data.message ?? "Không tải được thông tin niên khóa");
            }
        } catch {
            setFetchError("Lỗi kết nối khi tải thông tin niên khóa");
        } finally {
            setLoadingNienKhoa(false);
        }
    }, [nienKhoaId]);

    // Fetch dự đoán xét tốt nghiệp
    const fetchDuDoan = useCallback(async () => {
        if (!nienKhoaId) return;
        setLoadingDuDoan(true);
        try {
            const accessToken = getCookie("access_token");
            const requestBody: any = {
                nienKhoaId,
                page: currentPage,
                limit: PAGE_SIZE,
            };
            
            // Thêm các filter nếu có
            if (filterKetQua) requestBody.ketQua = filterKetQua;
            if (filterXepLoai) requestBody.xepLoai = filterXepLoai;
            if (filterLop) requestBody.maLop = filterLop;
            if (filterNganh) requestBody.maNganh = filterNganh;

            const res = await fetch(`${ENV.BACKEND_URL}/sinh-vien/xet-tot-nghiep/du-doan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
            const data = await res.json();
            if (res.ok) {
                setDuDoanData(data);
                setFetchError(null); // Clear error when fetch succeeds
            } else {
                setFetchError(data.message ?? "Không tải được dữ liệu dự đoán");
            }
        } catch {
            setFetchError("Lỗi kết nối khi tải dữ liệu dự đoán");
        } finally {
            setLoadingDuDoan(false);
        }
    }, [nienKhoaId, currentPage, filterKetQua, filterXepLoai, filterLop, filterNganh]);

    // Fetch danh sách đã tốt nghiệp
    const fetchDanhSachTotNghiep = useCallback(async () => {
        if (!nienKhoaId) return;
        setLoadingDanhSach(true);
        try {
            const accessToken = getCookie("access_token");
            const requestBody: any = {
                nienKhoaId,
                page: currentPage,
                limit: PAGE_SIZE,
            };
            
            // Thêm các filter nếu có
            if (filterXepLoai) requestBody.xepLoai = filterXepLoai;
            if (filterLop) requestBody.maLop = filterLop;
            if (filterNganh) requestBody.maNganh = filterNganh;

            const res = await fetch(`${ENV.BACKEND_URL}/sinh-vien/xet-tot-nghiep/danh-sach`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });
            const data = await res.json();
            if (res.ok) {
                setDanhSachTotNghiep(data);
                setFetchError(null); // Clear error when fetch succeeds
            } else {
                setFetchError(data.message ?? "Không tải được danh sách tốt nghiệp");
            }
        } catch {
            setFetchError("Lỗi kết nối khi tải danh sách tốt nghiệp");
        } finally {
            setLoadingDanhSach(false);
        }
    }, [nienKhoaId, currentPage, filterXepLoai, filterLop, filterNganh]);

    // Fetch danh sách ngành cho filter
    const fetchNganhOptions = useCallback(async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nganh?page=1&limit=99999`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                const options: FilterOption[] = json.data.map((nganh: any) => ({
                    value: nganh.maNganh,
                    label: `${nganh.tenNganh} (${nganh.maNganh})`,
                })).sort((a: FilterOption, b: FilterOption) => a.label.localeCompare(b.label));
                setNganhOptions(options);
            }
        } catch (err) {
            console.error("Không thể tải danh sách ngành:", err);
        }
    }, []);

    // Fetch danh sách lớp cho filter
    const fetchLopOptions = useCallback(async () => {
        if (!nienKhoaId) return;
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/lop?page=1&limit=99999&nienKhoaId=${nienKhoaId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                const options: FilterOption[] = json.data.map((lop: any) => ({
                    value: lop.maLop,
                    label: lop.maLop,
                })).sort((a: FilterOption, b: FilterOption) => a.label.localeCompare(b.label));
                setLopOptions(options);
            }
        } catch (err) {
            console.error("Không thể tải danh sách lớp:", err);
        }
    }, [nienKhoaId]);

    // Xác nhận xét tốt nghiệp
    const handleConfirmXetTotNghiep = async () => {
        if (!nienKhoaId) return;
        setIsSubmitting(true);
        setConfirmError(null);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/sinh-vien/xet-tot-nghiep/xac-nhan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ nienKhoaId }),
            });
            const data = await res.json();
            if (res.ok) {
                setConfirmResult(data);
                // Refresh data
                await Promise.all([fetchDuDoan(), fetchDanhSachTotNghiep()]);
            } else {
                setConfirmError(data.message ?? "Xét tốt nghiệp thất bại");
            }
        } catch {
            setConfirmError("Lỗi kết nối khi xét tốt nghiệp");
        } finally {
            setIsSubmitting(false);
            setIsConfirmModalOpen(false);
            setIsResultModalOpen(true);
        }
    };

    // Export Excel
    const handleExportExcel = async () => {
        if (!nienKhoaId) return;
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/sinh-vien/xet-tot-nghiep/xuat-excel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ nienKhoaId }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `danh-sach-tot-nghiep-${nienKhoaInfo?.maNienKhoa || nienKhoaId}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch {
            // Silent error
        }
    };

    // Initial fetch
    useEffect(() => {
        setFetchError(null);
        fetchNienKhoaInfo();
        fetchNganhOptions();
        fetchLopOptions();
    }, [fetchNienKhoaInfo, fetchNganhOptions, fetchLopOptions]);

    // Fetch data when filters or page change
    useEffect(() => {
        if (activeTab === "du-doan") {
            fetchDuDoan();
        } else {
            fetchDanhSachTotNghiep();
        }
    }, [activeTab, fetchDuDoan, fetchDanhSachTotNghiep]);

    const handleRefresh = async () => {
        setFetchError(null);
        if (activeTab === "du-doan") {
            await fetchDuDoan();
        } else {
            await fetchDanhSachTotNghiep();
        }
    };

    // Get current data based on tab (đã được filter và phân trang từ API)
    const currentData = activeTab === "du-doan"
        ? duDoanData?.danhSachSinhVien ?? []
        : danhSachTotNghiep?.danhSachSinhVien ?? [];
    
    // Get pagination info from API response
    const currentPagination = activeTab === "du-doan"
        ? {
            page: duDoanData?.page ?? 1,
            limit: duDoanData?.limit ?? PAGE_SIZE,
            totalItems: duDoanData?.totalItems ?? 0,
            totalPages: duDoanData?.totalPages ?? 1,
        }
        : {
            page: danhSachTotNghiep?.page ?? 1,
            limit: danhSachTotNghiep?.limit ?? PAGE_SIZE,
            totalItems: danhSachTotNghiep?.totalItems ?? 0,
            totalPages: danhSachTotNghiep?.totalPages ?? 1,
        };

    // Get current thongKeTheoNganh based on tab
    const currentThongKeTheoNganh = activeTab === "du-doan"
        ? duDoanData?.thongKeTheoNganh ?? []
        : danhSachTotNghiep?.thongKeTheoNganh ?? [];

    // Get current thongKe for modal
    const currentThongKe = useMemo(() => {
        if (activeTab === "du-doan") {
            return duDoanData?.thongKeTongQuan ?? null;
        }
        // Calculate thongKe for graduated students
        if (danhSachTotNghiep) {
            const list = danhSachTotNghiep.danhSachSinhVien;
            return {
                tongSinhVienDuocXet: danhSachTotNghiep.tongSinhVienTotNghiep,
                soSinhVienDat: list.length,
                soSinhVienKhongDat: 0,
                soSinhVienKhongDuDieuKien: 0,
                soXuatSac: list.filter(sv => sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.XUAT_SAC).length,
                soGioi: list.filter(sv => sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.GIOI).length,
                soKha: list.filter(sv => sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.KHA).length,
                soTrungBinh: list.filter(sv => sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.TRUNG_BINH).length,
            } as ThongKeTongQuan;
        }
        return null;
    }, [activeTab, duDoanData, danhSachTotNghiep]);

    // Filter options (sử dụng dữ liệu từ API)
    const filterOptions = useMemo(() => {
        const xepLoaiOptions: FilterOption[] = [
            { value: XepLoaiTotNghiepEnum.XUAT_SAC, label: 'Xuất sắc' },
            { value: XepLoaiTotNghiepEnum.GIOI, label: 'Giỏi' },
            { value: XepLoaiTotNghiepEnum.KHA, label: 'Khá' },
            { value: XepLoaiTotNghiepEnum.TRUNG_BINH, label: 'Trung bình' },
            { value: XepLoaiTotNghiepEnum.KHONG_DAT, label: 'Không đạt' },
        ];

        const ketQuaOptions: FilterOption[] = [
            { value: KetQuaXetTotNghiepEnum.DAT, label: 'Đạt' },
            { value: KetQuaXetTotNghiepEnum.KHONG_DAT, label: 'Không đạt' },
            { value: KetQuaXetTotNghiepEnum.KHONG_DU_DIEU_KIEN, label: 'Không đủ ĐK' },
        ];

        return { 
            xepLoaiOptions, 
            ketQuaOptions, 
            lopOptions, 
            nganhOptions 
        };
    }, [lopOptions, nganhOptions]);

    // Clear filters when switching tabs
    useEffect(() => {
        setFilterXepLoai("");
        setFilterLop("");
        setFilterNganh("");
        setFilterKetQua("");
        setSearchKeyword("");
        setCurrentPage(1);
        setIsFiltersExpanded(false);
    }, [activeTab]);

    // Count active filters
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filterXepLoai) count++;
        if (filterLop) count++;
        if (filterNganh) count++;
        if (filterKetQua && activeTab === "du-doan") count++;
        return count;
    }, [filterXepLoai, filterLop, filterNganh, filterKetQua, activeTab]);

    // Auto-expand filters when filters are active
    useEffect(() => {
        if (activeFiltersCount > 0) {
            setIsFiltersExpanded(true);
        }
    }, [activeFiltersCount]);

    const clearAllFilters = () => {
        setFilterXepLoai("");
        setFilterLop("");
        setFilterNganh("");
        setFilterKetQua("");
    };

    // Filter data by search keyword (client-side only, vì backend không hỗ trợ search)
    const filteredData = useMemo(() => {
        let result = [...currentData];

        // Apply search (client-side filtering)
        if (searchKeyword.trim()) {
            const q = searchKeyword.trim().toLowerCase();
            result = result.filter(
                (sv) =>
                    sv.maSinhVien.toLowerCase().includes(q) ||
                    sv.hoTen.toLowerCase().includes(q) ||
                    sv.maLop.toLowerCase().includes(q)
            );
        }

        return result;
    }, [currentData, searchKeyword]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterXepLoai, filterLop, filterNganh, filterKetQua, activeTab]);

    const thongKe = duDoanData?.thongKeTongQuan;
    const isLoading = loadingNienKhoa || loadingDuDoan;

    return (
        <>
            <PageBreadcrumb pageTitle="Xét tốt nghiệp" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                                    <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600 dark:text-blue-400" />
                                    Xét tốt nghiệp
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {loadingNienKhoa ? (
                                        <span className="inline-block h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    ) : (
                                        nienKhoaInfo?.tenNienKhoa ?? `Niên khóa #${nienKhoaId}`
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsStatsModalOpen(true)}
                            >
                                <FontAwesomeIcon icon={faChartPie} className="mr-2" />
                                Xem thống kê
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                            >
                                <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                                Làm mới
                            </Button>
                            {(danhSachTotNghiep?.tongSinhVienTotNghiep ?? 0) > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleExportExcel}
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                                    Xuất Excel
                                </Button>
                            )}
                            {activeTab === "du-doan" && (thongKe?.soSinhVienDat ?? 0) > 0 && (
                                <Button
                                    variant="primary"
                                    onClick={() => setIsConfirmModalOpen(true)}
                                >
                                    <FontAwesomeIcon icon={faCheckDouble} className="mr-2" />
                                    Xác nhận xét tốt nghiệp
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats Summary */}
                    {thongKe && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Tổng quan:</span>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    <FontAwesomeIcon icon={faUserGraduate} className="text-[10px]" />
                                    {thongKe.tongSinhVienDuocXet} xét
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                                    {thongKe.soSinhVienDat} đạt
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                    <FontAwesomeIcon icon={faTimesCircle} className="text-[10px]" />
                                    {thongKe.soSinhVienKhongDat} không đạt
                                </span>
                                <button
                                    onClick={() => setIsStatsModalOpen(true)}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                >
                                    Xem chi tiết →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Banner */}
                {fetchError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500" />
                                <p className="text-red-800 dark:text-red-300">{fetchError}</p>
                            </div>
                            <button
                                onClick={() => setFetchError(null)}
                                className="flex-shrink-0 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                aria-label="Đóng thông báo lỗi"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-red-600 dark:text-red-400 text-sm" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button
                            onClick={() => setActiveTab("du-doan")}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${activeTab === "du-doan"
                                ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800"
                                }`}
                        >
                            <FontAwesomeIcon icon={faChartBar} />
                            Dự đoán xét tốt nghiệp
                            <Badge variant="light" color="info" className="ml-1">
                                {duDoanData?.thongKeTongQuan?.tongSinhVienDuocXet ?? 0}
                            </Badge>
                        </button>
                        <button
                            onClick={() => setActiveTab("da-tot-nghiep")}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-all ${activeTab === "da-tot-nghiep"
                                ? "bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 border-b-2 border-green-500"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800"
                                }`}
                        >
                            <FontAwesomeIcon icon={faUserGraduate} />
                            Đã tốt nghiệp
                            <Badge variant="light" color="success" className="ml-1">
                                {danhSachTotNghiep?.tongSinhVienTotNghiep ?? 0}
                            </Badge>
                        </button>
                    </div>

                    {/* Search Bar & Filters */}
                    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                        <div className="p-4">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md mb-4">
                                <div className="relative">
                                    <button
                                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
                                    >
                                        <FontAwesomeIcon
                                            icon={faMagnifyingGlass}
                                            className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                        />
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo mã SV, họ tên, lớp..."
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-900 py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                    />
                                </div>
                            </div>

                            {/* Filters Header - Collapsible */}
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                            <FontAwesomeIcon 
                                                icon={faFilter} 
                                                className="text-sm text-indigo-600 dark:text-indigo-400" 
                                            />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                                                Bộ lọc
                                            </h3>
                                            {activeFiltersCount > 0 && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {activeFiltersCount} bộ lọc đang áp dụng
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {activeFiltersCount > 0 && (
                                            <Badge 
                                                variant="light" 
                                                color="info" 
                                                className="text-xs"
                                            >
                                                {activeFiltersCount}
                                            </Badge>
                                        )}
                                        <FontAwesomeIcon
                                            icon={isFiltersExpanded ? faChevronUp : faChevronDown}
                                            className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200"
                                        />
                                    </div>
                                </button>

                                {/* Filters Content - Collapsible */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isFiltersExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className="px-5 pb-5 pt-2 space-y-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {activeTab === "du-doan" && (
                                                <div className="w-full">
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                        Kết quả
                                                    </label>
                                                    <SearchableSelect
                                                        placeholder="Chọn kết quả..."
                                                        options={filterOptions.ketQuaOptions}
                                                        defaultValue={filterKetQua}
                                                        onChange={setFilterKetQua}
                                                        showSecondary={false}
                                                        searchPlaceholder="Tìm kết quả..."
                                                    />
                                                </div>
                                            )}

                                            <div className="w-full">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Xếp loại
                                                </label>
                                                <SearchableSelect
                                                    placeholder="Chọn xếp loại..."
                                                    options={filterOptions.xepLoaiOptions}
                                                    defaultValue={filterXepLoai}
                                                    onChange={setFilterXepLoai}
                                                    showSecondary={false}
                                                    searchPlaceholder="Tìm xếp loại..."
                                                />
                                            </div>

                                            <div className="w-full">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Lớp
                                                </label>
                                                <SearchableSelect
                                                    placeholder="Chọn lớp..."
                                                    options={filterOptions.lopOptions}
                                                    defaultValue={filterLop}
                                                    onChange={setFilterLop}
                                                    showSecondary={false}
                                                    searchPlaceholder="Tìm lớp..."
                                                />
                                            </div>

                                            <div className="w-full">
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    Ngành
                                                </label>
                                                <SearchableSelect
                                                    placeholder="Chọn ngành..."
                                                    options={filterOptions.nganhOptions}
                                                    defaultValue={filterNganh}
                                                    onChange={setFilterNganh}
                                                    showSecondary={false}
                                                    searchPlaceholder="Tìm ngành..."
                                                />
                                            </div>
                                        </div>

                                        {activeFiltersCount > 0 && (
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                                    Đang áp dụng <strong className="text-indigo-600 dark:text-indigo-400">{activeFiltersCount}</strong> bộ lọc
                                                </span>
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                                    Xóa tất cả
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Active filters summary */}
                            {(searchKeyword || activeFiltersCount > 0) && (
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50">
                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-indigo-700 dark:text-indigo-300">
                                            {searchKeyword ? (
                                                <>
                                                    Tìm thấy <strong className="font-semibold">{filteredData.length}</strong> kết quả (từ {currentPagination.totalItems} bản ghi)
                                                </>
                                            ) : (
                                                <>
                                                    Tổng cộng <strong className="font-semibold">{currentPagination.totalItems}</strong> kết quả
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    {searchKeyword && (
                                        <div className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                            <span className="text-gray-500 dark:text-gray-400">Từ khóa:</span>
                                            <span className="font-medium">&quot;{searchKeyword}&quot;</span>
                                        </div>
                                    )}
                                    {activeFiltersCount > 0 && (
                                        <div className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faFilter} className="text-xs" />
                                            <span>{activeFiltersCount} bộ lọc</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-indigo-500 mb-4" />
                                <p className="text-sm">Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                                <FontAwesomeIcon icon={faUserGraduate} className="text-5xl mb-4 opacity-50" />
                                <p className="text-lg font-medium">Không có dữ liệu</p>
                                <p className="text-sm mt-1">
                                    {searchKeyword ? "Không tìm thấy sinh viên phù hợp" : "Chưa có sinh viên trong danh sách"}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10">
                                    <TableRow className={activeTab === "du-doan"
                                        ? "grid grid-cols-[5%_12%_20%_8%_12%_10%_10%_13%_10%]"
                                        : "grid grid-cols-[5%_12%_22%_10%_14%_12%_12%_13%]"
                                    }>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center">STT</TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-left">Mã SV</TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-left">Họ và tên</TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center">Lớp</TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center">Ngành</TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center">GPA</TableCell>
                                        {activeTab === "du-doan" && (
                                            <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center">Kết quả</TableCell>
                                        )}
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center">Xếp loại</TableCell>
                                        <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-center text-center">Thao tác</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80">
                                    {filteredData.map((sv, idx) => {
                                        const isDuDoan = activeTab === "du-doan";
                                        const duDoanSv = sv as SinhVienXetTotNghiep;
                                        return (
                                            <TableRow
                                                key={sv.id}
                                                className={`${isDuDoan
                                                    ? "grid grid-cols-[5%_12%_20%_8%_12%_10%_10%_13%_10%]"
                                                    : "grid grid-cols-[5%_12%_22%_10%_14%_12%_12%_13%]"
                                                    } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                                            >
                                                <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                    {(currentPagination.page - 1) * currentPagination.limit + idx + 1}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">
                                                    {sv.maSinhVien}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                                                    {sv.hoTen}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 font-mono text-sm text-gray-600 dark:text-gray-400 text-center">
                                                    {sv.maLop}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate text-center">
                                                    <span title={sv.tenNganh}>{sv.maNganh}</span>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm font-bold text-center text-blue-600 dark:text-blue-400 text-center">
                                                    {sv.gpa !== null ? sv.gpa.toFixed(2) : "—"}
                                                </TableCell>
                                                {isDuDoan && (
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <Badge
                                                            variant="light"
                                                            color={
                                                                duDoanSv.ketQuaXet === KetQuaXetTotNghiepEnum.DAT ? "success" :
                                                                    duDoanSv.ketQuaXet === KetQuaXetTotNghiepEnum.KHONG_DAT ? "error" : "warning"
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {duDoanSv.ketQuaXet}
                                                        </Badge>
                                                    </TableCell>
                                                )}
                                                <TableCell className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant="light"
                                                        color={
                                                            sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.XUAT_SAC ? "primary" :
                                                                sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.GIOI ? "success" :
                                                                    sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.KHA ? "info" :
                                                                        sv.xepLoaiTotNghiep === XepLoaiTotNghiepEnum.TRUNG_BINH ? "warning" : "error"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {sv.xepLoaiTotNghiep}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setDetailItem(sv);
                                                                setDetailType(isDuDoan ? 'du-doan' : 'da-tot-nghiep');
                                                            }}
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedSinhVienForBangDiem(sv);
                                                                setIsViewBangDiemModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                            title="Xem bảng điểm"
                                                        >
                                                            <FontAwesomeIcon icon={faFileInvoice} />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Pagination */}
                    {currentPagination.totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <Pagination
                                currentPage={currentPagination.page}
                                totalPages={currentPagination.totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>

                {/* Statistics by Department */}
                {currentThongKeTheoNganh.length > 0 && (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartBar} className="text-indigo-500" />
                            Thống kê theo ngành
                            <Badge variant="light" color={activeTab === "du-doan" ? "info" : "success"} className="ml-2">
                                {activeTab === "du-doan" ? "Dự đoán" : "Đã tốt nghiệp"}
                            </Badge>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Ngành</th>
                                        <th className="text-center py-3 px-2 font-medium text-gray-600 dark:text-gray-400">Tổng</th>
                                        <th className="text-center py-3 px-2 font-medium text-green-600 dark:text-green-400">Đạt</th>
                                        <th className="text-center py-3 px-2 font-medium text-red-600 dark:text-red-400">K.Đạt</th>
                                        <th className="text-center py-3 px-2 font-medium text-amber-600 dark:text-amber-400">K.Đủ ĐK</th>
                                        <th className="text-center py-3 px-2 font-medium text-purple-600 dark:text-purple-400">X.Sắc</th>
                                        <th className="text-center py-3 px-2 font-medium text-blue-600 dark:text-blue-400">Giỏi</th>
                                        <th className="text-center py-3 px-2 font-medium text-teal-600 dark:text-teal-400">Khá</th>
                                        <th className="text-center py-3 px-2 font-medium text-amber-600 dark:text-amber-400">TB</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {currentThongKeTheoNganh.map((nganh) => (
                                        <tr key={nganh.nganhId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-800 dark:text-white">{nganh.tenNganh}</span>
                                                <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">({nganh.maNganh})</span>
                                            </td>
                                            <td className="text-center py-3 px-2 font-bold text-gray-800 dark:text-white">{nganh.tongSinhVien}</td>
                                            <td className="text-center py-3 px-2 text-green-600 dark:text-green-400 font-medium">{nganh.soSinhVienDat}</td>
                                            <td className="text-center py-3 px-2 text-red-600 dark:text-red-400">{nganh.soSinhVienKhongDat}</td>
                                            <td className="text-center py-3 px-2 text-amber-600 dark:text-amber-400">{nganh.soSinhVienKhongDuDieuKien}</td>
                                            <td className="text-center py-3 px-2 text-purple-600 dark:text-purple-400">{nganh.soXuatSac}</td>
                                            <td className="text-center py-3 px-2 text-blue-600 dark:text-blue-400">{nganh.soGioi}</td>
                                            <td className="text-center py-3 px-2 text-teal-600 dark:text-teal-400">{nganh.soKha}</td>
                                            <td className="text-center py-3 px-2 text-amber-600 dark:text-amber-400">{nganh.soTrungBinh}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <DetailModal
                isOpen={detailItem !== null}
                onClose={() => setDetailItem(null)}
                item={detailItem}
                type={detailType}
            />

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmXetTotNghiep}
                isSubmitting={isSubmitting}
                thongKe={thongKe ?? null}
                nienKhoaInfo={nienKhoaInfo}
            />

            <ResultModal
                isOpen={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                result={confirmResult}
                error={confirmError}
            />

            <StatisticsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                thongKe={currentThongKe}
                thongKeTheoNganh={currentThongKeTheoNganh}
                loading={activeTab === "du-doan" ? loadingDuDoan : loadingDanhSach}
                type={activeTab}
                nienKhoaInfo={nienKhoaInfo}
            />

            <ViewBangDiemModal
                isOpen={isViewBangDiemModalOpen}
                onClose={() => {
                    setIsViewBangDiemModalOpen(false);
                    setSelectedSinhVienForBangDiem(null);
                }}
                sinhVien={selectedSinhVienForBangDiem}
            />
        </>
    );
}
