"use client";

import React, { useEffect, useState } from "react";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faEye,
    faTrash,
    faEdit,
    faUsers,
    faFileExcel,
    faInfoCircle,
    faCloudArrowUp,
    faDownload,
    faChartBar,
    faSpinner,
    faCircleInfo,
    faTriangleExclamation,
    faCheckCircle,
    faTimesCircle,
    faFileImport,
    faFileArrowDown,
    faUserXmark
} from "@fortawesome/free-solid-svg-icons";
import TextArea from "@/components/form/input/TextArea";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Checkbox from "@/components/form/input/Checkbox";
import Switch from "@/components/form/switch/Switch";
import { useDropzone } from "react-dropzone";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type TrangThai = "DANG_HOC" | "DA_KET_THUC" | "CHUA_BAT_DAU";

interface GiangVien {
    id: number;
    maGiangVien: string;
    hoTen: string;
    ngaySinh: string;
    email: string;
    sdt: string;
    gioiTinh: string;
    diaChi: string;
}

interface MonHoc {
    id: number;
    tenMonHoc: string;
    maMonHoc: string;
    loaiMon: string;
    soTinChi: number;
    moTa: string;
}

interface Khoa {
    id: number;
    maKhoa: string;
    tenKhoa: string;
    moTa: string;
    ngayThanhLap: string;
}

interface Nganh {
    id: number;
    maNganh: string;
    tenNganh: string;
    moTa: string;
    khoa: Khoa;
}

interface NamHoc {
    id: number;
    maNamHoc: string;
    tenNamHoc: string;
    namBatDau: number;
    namKetThuc: number;
}

interface HocKy {
    id: number;
    hocKy: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    namHoc: NamHoc;
}

interface NienKhoa {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    moTa: string;
}

interface LopHocPhan {
    id: number;
    maLopHocPhan: string;
    ghiChu: string | null;
    ngayTao: string;
    khoaDiem: boolean;
    giangVien: GiangVien | null;
    nienKhoa: NienKhoa;
    nganh: Nganh;
    monHoc: MonHoc;
    hocKy: HocKy;
    siSo: number;
    trangThai: TrangThai;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface MonHocOption {
    id: number;
    maMonHoc: string;
    tenMonHoc: string;
}

interface GiangVienOption {
    id: number;
    maGiangVien: string;
    hoTen: string;
    monHocGiangViens: {
        id: number;
        monHoc: MonHoc;
        ghiChu: string | null;
    }[];
}

interface NamHocOption {
    id: number;
    maNamHoc: string;
    tenNamHoc: string;
    hocKys: {
        id: number;
        hocKy: number;
        ngayBatDau: string;
        ngayKetThuc: string;
    }[];
}

interface HocKyOption {
    id: number;
    hocKy: number;
    ngayBatDau: string;
    ngayKetThuc: string;
}

interface NienKhoaOption {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
}

interface KhoaOption {
    id: number;
    maKhoa: string;
    tenKhoa: string;
}

interface NganhOption {
    id: number;
    maNganh: string;
    tenNganh: string;
    khoa: Khoa;
}

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

const KHOA_DIEM_OPTIONS: { label: string; value: string }[] = [
    { label: "Đã khóa", value: "true" },
    { label: "Chưa khóa", value: "false" },
];

// Hàm chuyển enum trangThai thành tên tiếng Việt
const getTrangThaiLabel = (trangThai: TrangThai): string => {
    switch (trangThai) {
        case "DANG_HOC":
            return "Đang diễn ra";
        case "DA_KET_THUC":
            return "Đã kết thúc";
        case "CHUA_BAT_DAU":
            return "Chưa bắt đầu";
        default:
            return trangThai;
    }
};

const getTrangThaiColor = (trangThai: TrangThai): "success" | "error" | "warning" => {
    switch (trangThai) {
        case "DANG_HOC":
            return "success";
        case "DA_KET_THUC":
            return "error";
        case "CHUA_BAT_DAU":
            return "warning";
    }
};

// Hàm chuyển trạng thái khóa điểm thành tên tiếng Việt
const getKhoaDiemLabel = (khoaDiem: boolean): string => {
    return khoaDiem ? "Đã khóa" : "Chưa khóa";
};

const getKhoaDiemColor = (khoaDiem: boolean): "error" | "success" => {
    return khoaDiem ? "error" : "success";
};

// ==================== MODAL XEM CHI TIẾT ====================
interface ViewLopHocPhanModalProps {
    isOpen: boolean;
    onClose: () => void;
    lopHocPhan: LopHocPhan | null;
}

const ViewLopHocPhanModal: React.FC<ViewLopHocPhanModalProps> = ({
    isOpen,
    onClose,
    lopHocPhan,
}) => {
    if (!isOpen || !lopHocPhan) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết Lớp Học Phần
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mã lớp học phần</p>
                            <p className="font-medium text-gray-800 dark:text-white">{lopHocPhan.maLopHocPhan}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                            <Badge variant="solid" color={getTrangThaiColor(lopHocPhan.trangThai)}>
                                {getTrangThaiLabel(lopHocPhan.trangThai)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Môn học</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.monHoc.maMonHoc} - {lopHocPhan.monHoc.tenMonHoc}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Số tín chỉ</p>
                            <p className="font-medium text-gray-800 dark:text-white">{lopHocPhan.monHoc.soTinChi}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Giảng viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.giangVien?.maGiangVien ?? "Chưa có giảng viên"} - {lopHocPhan.giangVien?.hoTen ?? "Chưa có giảng viên"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email giảng viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{lopHocPhan.giangVien?.email ?? "Chưa có email"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngành</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.nganh.maNganh} - {lopHocPhan.nganh.tenNganh}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Khoa</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.nganh.khoa.maKhoa} - {lopHocPhan.nganh.khoa.tenKhoa}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Niên khóa</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.nienKhoa.maNienKhoa} - {lopHocPhan.nienKhoa.tenNienKhoa}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Học kỳ</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                Học kỳ {lopHocPhan.hocKy.hocKy} - {lopHocPhan.hocKy.namHoc.tenNamHoc}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian học kỳ</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {new Date(lopHocPhan.hocKy.ngayBatDau).toLocaleDateString("vi-VN")} - {new Date(lopHocPhan.hocKy.ngayKetThuc).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sĩ số</p>
                            <p className="font-medium text-gray-800 dark:text-white">{lopHocPhan.siSo} sinh viên</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Khóa điểm</p>
                            <Badge variant="solid" color={lopHocPhan.khoaDiem ? "error" : "success"}>
                                {lopHocPhan.khoaDiem ? "Đã khóa" : "Chưa khóa"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {new Date(lopHocPhan.ngayTao).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ghi chú</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.ghiChu || "Không có ghi chú"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL SỬA LỚP HỌC PHẦN ====================
interface EditLopHocPhanModalProps {
    isOpen: boolean;
    onClose: () => void;
    lopHocPhan: LopHocPhan | null;
    // Options
    giangVienOptions: GiangVienOption[];
    // Form values
    maLopHocPhan: string;
    giangVienId: string;
    ghiChu: string;
    // Handlers
    onMaLopHocPhanChange: (value: string) => void;
    onGiangVienIdChange: (value: string) => void;
    onGhiChuChange: (value: string) => void;
    onSubmit: () => void;
    errors: {
        maLopHocPhan: boolean;
        giangVienId: boolean;
    };
    // Thông tin tín chỉ
    tinChiInfo: {
        currentCredits: number;
        newCredits: number;
        isLoading: boolean;
    };
}

const EditLopHocPhanModal: React.FC<EditLopHocPhanModalProps> = ({
    isOpen,
    onClose,
    lopHocPhan,
    giangVienOptions,
    maLopHocPhan,
    giangVienId,
    ghiChu,
    onMaLopHocPhanChange,
    onGiangVienIdChange,
    onGhiChuChange,
    onSubmit,
    errors,
    tinChiInfo,
}) => {
    if (!isOpen || !lopHocPhan) return null;

    // Lọc giảng viên theo môn học của lớp học phần đang sửa
    const giangVienFilteredOptions = giangVienOptions.filter(gv =>
        gv.monHocGiangViens.some(mhgv => mhgv.monHoc.id === lopHocPhan.monHoc.id)
    );
    
    // Kiểm tra vượt quá giới hạn tín chỉ
    const exceedsLimit = tinChiInfo.newCredits > 12;
    const selectedGiangVien = giangVienOptions.find(gv => gv.id.toString() === giangVienId);

    // Khi đang sửa và GV chọn trùng GV đang dạy lớp này: hiển thị "các lớp khác" (không tính lớp này) để phép cộng hợp lý: [các lớp khác] + [lớp này] = [tổng]
    const isEditingSameGv = giangVienId === lopHocPhan.giangVien?.id?.toString();
    const creditsOfThisLhp = lopHocPhan.monHoc?.soTinChi ?? 0;
    const displayCurrentCredits = isEditingSameGv
        ? Math.max(0, tinChiInfo.currentCredits - creditsOfThisLhp)
        : tinChiInfo.currentCredits;
    const displayCurrentLabel = isEditingSameGv
        ? "Tín chỉ các lớp khác của GV trong HK này (không tính lớp này):"
        : "Tín chỉ hiện tại của GV trong học kỳ này:";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        <FontAwesomeIcon icon={faEdit} className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Sửa Lớp Học Phần
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cập nhật thông tin lớp học phần
                        </p>
                    </div>
                </div>

                {/* Thông tin lớp học phần (chỉ hiển thị, không cho sửa) */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Mã Môn học:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.monHoc.maMonHoc}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Tên Môn học:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.monHoc.tenMonHoc}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Số tín chỉ:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.monHoc.soTinChi}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Ngành:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.nganh.maNganh} - {lopHocPhan.nganh.tenNganh}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Niên khóa:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.nienKhoa.maNienKhoa} - {lopHocPhan.nienKhoa.tenNienKhoa}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Học kỳ:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                Học kỳ {lopHocPhan.hocKy.hocKy} - {lopHocPhan.hocKy.namHoc.tenNamHoc}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Sĩ số:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {lopHocPhan.siSo} sinh viên
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form chỉnh sửa */}
                <div className="space-y-5">
                    {/* Mã Lớp Học Phần */}
                    <div>
                        <Label>
                            Mã Lớp Học Phần <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            defaultValue={maLopHocPhan}
                            onChange={(e) => onMaLopHocPhanChange(e.target.value)}
                            error={errors.maLopHocPhan}
                            hint={errors.maLopHocPhan ? "Mã lớp học phần không được để trống" : ""}
                            placeholder="Nhập mã lớp học phần..."
                        />
                    </div>

                    {/* Giảng viên */}
                    <div>
                        <Label>
                            Giảng viên <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={giangVienFilteredOptions.map((gv) => ({
                                value: gv.id.toString(),
                                label: gv.maGiangVien,
                                secondary: gv.hoTen,
                            }))}
                            placeholder="Chọn giảng viên phụ trách"
                            onChange={(value) => onGiangVienIdChange(value)}
                            defaultValue={giangVienId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm giảng viên..."
                        />
                        {errors.giangVienId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn giảng viên</p>
                        )}
                        {giangVienFilteredOptions.length === 0 && (
                            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                                ⚠️ Không có giảng viên nào phụ trách môn học này
                            </p>
                        )}
                    </div>

                    {/* Thông tin tín chỉ giảng dạy */}
                    {giangVienId && selectedGiangVien && (
                        <div className={`transition-all duration-300 ease-in-out ${
                            exceedsLimit 
                                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
                                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                        } border-2 rounded-xl p-4 space-y-3`}>
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    exceedsLimit 
                                        ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' 
                                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                                }`}>
                                    <FontAwesomeIcon 
                                        icon={exceedsLimit ? faTriangleExclamation : faCircleInfo} 
                                        className="text-lg"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold text-sm mb-2 ${
                                        exceedsLimit 
                                            ? 'text-red-800 dark:text-red-300' 
                                            : 'text-blue-800 dark:text-blue-300'
                                    }`}>
                                        Thông tin tín chỉ giảng dạy của GV
                                    </h4>
                                    
                                    {tinChiInfo.isLoading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                            <span>Đang tính toán tín chỉ...</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {displayCurrentLabel}
                                                </span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    {displayCurrentCredits} tín chỉ
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    Tín chỉ của lớp học phần này:
                                                </span>
                                                <span className="font-semibold text-gray-800 dark:text-white">
                                                    +{creditsOfThisLhp} tín chỉ
                                                </span>
                                            </div>
                                            
                                            <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                                                <div className="flex items-center justify-between">
                                                    <span className={`font-semibold ${
                                                        exceedsLimit 
                                                            ? 'text-red-700 dark:text-red-400' 
                                                            : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        Tổng tín chỉ của GV sau khi cập nhật:
                                                    </span>
                                                    <span className={`text-lg font-bold ${
                                                        exceedsLimit 
                                                            ? 'text-red-600 dark:text-red-400' 
                                                            : 'text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                        {tinChiInfo.newCredits} / 12 tín chỉ
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {exceedsLimit && (
                                                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg animate-pulse">
                                                    <div className="flex items-start gap-2">
                                                        <FontAwesomeIcon 
                                                            icon={faTriangleExclamation} 
                                                            className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                                                                Cảnh báo: Vượt quá giới hạn tín chỉ
                                                            </p>
                                                            <p className="text-xs text-red-700 dark:text-red-400">
                                                                Số tín chỉ giảng dạy của một giảng viên trong một học kỳ không được quá 12 tín chỉ. 
                                                                Hiện tại tổng tín chỉ là <strong>{tinChiInfo.newCredits} tín chỉ</strong>, vượt quá giới hạn cho phép.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {!exceedsLimit && tinChiInfo.newCredits > 0 && (
                                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="inline-flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                                        Số tín chỉ trong giới hạn cho phép
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ghi chú */}
                    <div>
                        <Label>Ghi chú</Label>
                        <TextArea
                            defaultValue={ghiChu}
                            rows={3}
                            onChange={(value) => onGhiChuChange(value)}
                            placeholder="Nhập ghi chú (không bắt buộc)..."
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={onSubmit}
                        disabled={exceedsLimit || tinChiInfo.isLoading}
                        className={exceedsLimit ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {tinChiInfo.isLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Đang kiểm tra...
                            </>
                        ) : (
                            "Cập nhật"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
// ==================== MODAL NHẬP SINH VIÊN EXCEL ====================
interface ImportSinhVienExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ImportSinhVienExcelModal: React.FC<ImportSinhVienExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    showAlert,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    // Thêm state lưu kết quả import
    const [importResult, setImportResult] = useState<{
        summary: { total: number; success: number; failed: number };
        errors: { maLopHocPhan: string; row: number; maSinhVien: string; error: string }[];
        detailByClass: Record<string, {
            success: number;
            failed: number;
            errors: { row: number; maSinhVien: string; error: string }[];
        }>;
    } | null>(null);

    const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError("");
        setImportResult(null); // Reset kết quả khi chọn file mới

        if (rejectedFiles.length > 0) {
            setFileError("Chỉ chấp nhận file Excel (.xlsx)");
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (!file.name.endsWith('.xlsx')) {
                setFileError("Chỉ chấp nhận file Excel (.xlsx)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleDownloadTemplate = () => {
        const templateUrl = "/templates/mau-nhap-sinh-vien-lhp.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-sinh-vien-lhp.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setFileError("Vui lòng chọn file Excel");
            return;
        }

        setIsUploading(true);
        setImportResult(null);

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch(
                `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/them-sv-bang-excel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();
            console.log("Response nhập sinh viên Excel:", data);

            if (res.ok) {
                const { summary, errors, detailByClass } = data;

                // Lưu kết quả vào state thay vì đóng modal
                setImportResult({
                    summary: summary || { total: 0, success: 0, failed: 0 },
                    errors: errors || [],
                    detailByClass: detailByClass || {},
                });

                // Gọi callback reload
                onSuccess();
            } else {
                showAlert("error", "Lỗi", data.message || "Thêm sinh viên thất bại");
            }
        } catch (err) {
            console.error("Lỗi nhập sinh viên Excel:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm sinh viên");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Thêm sinh viên vào LHP bằng Excel
                </h3>

                {/* === LƯU Ý === */}
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faTriangleExclamation}
                                    className="text-lg text-amber-600 dark:text-amber-400 mt-0.5"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                    Lưu ý
                                </h4>
                                <ul className="text-sm text-amber-700/80 dark:text-amber-300/70 space-y-1 list-disc list-inside">
                                    <li>Sinh viên không thể vào LHP <strong>đã khóa điểm</strong></li>
                                    <li>Lớp học phần <strong>đã đủ sĩ số tối đa (40 SV)</strong> sẽ <strong>không nhận thêm</strong> sinh viên nào</li>
                                    <li>Môn học <strong>không thuộc CTDT</strong> của sinh viên sẽ bị <strong>từ chối tự động</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === LƯU Ý BỔ SUNG === */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-blue-700/80 dark:text-blue-300/70">
                                    <strong>Lưu ý:</strong> File Excel cần chứa <strong>mã sinh viên</strong> (cột B) và <strong>mã lớp học phần</strong> (cột G).
                                    Hệ thống sẽ tự động validate theo chương trình đào tạo, tình trạng sinh viên, sĩ số lớp, và lịch sử học tập.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Button tải file mẫu */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                        className="w-full"
                    >
                        Tải file Excel mẫu nhập sinh viên
                    </Button>
                </div>

                {/* Dropzone */}
                <div className="mb-6">
                    <Label className="mb-2 block">Chọn file Excel danh sách sinh viên</Label>
                    <div
                        className={`transition border-2 border-dashed cursor-pointer rounded-xl 
                        ${fileError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                        ${isDragActive ? 'border-brand-500 bg-gray-100 dark:bg-gray-800' : 'hover:border-brand-500 dark:hover:border-brand-500'}
                    `}
                    >
                        <div
                            {...getRootProps()}
                            className={`rounded-xl p-7 lg:p-10
                            ${isDragActive
                                    ? "bg-gray-100 dark:bg-gray-800"
                                    : "bg-gray-50 dark:bg-gray-900"
                                }
                        `}
                        >
                            <input {...getInputProps()} />

                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex justify-center">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-full 
                                    ${selectedFile
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedFile ? faFileExcel : faCloudArrowUp}
                                            className="text-2xl"
                                        />
                                    </div>
                                </div>

                                {selectedFile ? (
                                    <>
                                        <p className="mb-2 font-medium text-gray-800 dark:text-white/90">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile();
                                            }}
                                            className="mt-3 text-sm text-red-500 hover:text-red-600 underline"
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="mb-2 font-semibold text-gray-800 dark:text-white/90">
                                            {isDragActive ? "Thả file vào đây" : "Kéo & thả file vào đây"}
                                        </h4>
                                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            Chỉ chấp nhận file Excel (.xlsx)
                                        </p>
                                        <span className="font-medium underline text-sm text-brand-500">
                                            Chọn file
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {fileError && (
                        <p className="mt-2 text-sm text-red-500">{fileError}</p>
                    )}
                </div>

                {/* === KẾT QUẢ IMPORT === */}
                {importResult && (
                    <div className="mb-6">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {importResult.summary.total}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {importResult.summary.success}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Thành công</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {importResult.summary.failed}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">Thất bại</p>
                            </div>
                        </div>

                        {/* Chi tiết theo từng lớp */}
                        {Object.keys(importResult.detailByClass).length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-base font-semibold text-gray-800 dark:text-white/90 mb-3">
                                    📚 Kết quả theo từng lớp học phần
                                </h4>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <Table>
                                        <TableHeader className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-800">
                                            <TableRow>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs w-[30%]">
                                                    Mã LHP
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                    Thành công
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                    Thất bại
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs w-[30%]">
                                                    Trạng thái
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                            {Object.entries(importResult.detailByClass).map(([classCode, detail]) => (
                                                <TableRow key={classCode}>
                                                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white font-medium">
                                                        {classCode}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            {detail.success}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <span className="text-red-600 dark:text-red-400 font-medium">
                                                            {detail.failed}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        {detail.failed === 0 ? (
                                                            <Badge variant="solid" color="success">Hoàn tất</Badge>
                                                        ) : (
                                                            <Badge variant="solid" color="warning">Có lỗi</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        {/* Chi tiết lỗi */}
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-base font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faTimesCircle} />
                                    Chi tiết lỗi ({importResult.errors.length})
                                </h4>
                                <div className="max-h-60 overflow-y-auto border border-red-200 dark:border-red-900/30 rounded-lg">
                                    <Table>
                                        <TableHeader className="border-b border-red-100 dark:border-red-900/30 top-0 bg-red-50 dark:bg-red-900/10">
                                            <TableRow>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs w-[10%]">
                                                    Dòng
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                    Mã LHP
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs w-[20%]">
                                                    MSSV
                                                </TableCell>
                                                <TableCell isHeader className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs w-[50%] text-left">
                                                    Lỗi
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-red-100 dark:divide-red-900/30 text-sm">
                                            {importResult.errors.map((err, index) => (
                                                <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-900/5">
                                                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white font-mono text-xs text-center">
                                                        {err.row}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white text-center">
                                                        {err.maLopHocPhan}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white font-medium text-center">
                                                        {err.maSinhVien}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-red-600 dark:text-red-400 text-xs">
                                                        {err.error}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        {importResult ? "Đóng" : "Hủy"}
                    </Button>
                    {!importResult && (
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            startIcon={isUploading ? undefined : <FontAwesomeIcon icon={faFileExcel} />}
                        >
                            {isUploading ? "Đang xử lý..." : "Thêm sinh viên"}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL NHẬP LHP TỪ EXCEL ====================
interface ImportLHPExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

interface ImportLHPResult {
    row: number;
    maLopHocPhan: string;
    status: "success" | "failed";
    message: string;
    soSinhVienDaDangKy?: number;
}

const ImportLHPExcelModal: React.FC<ImportLHPExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    showAlert,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState<{
        summary: { success: number; failed: number; total: number };
        details: ImportLHPResult[];
    } | null>(null);

    const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError("");
        setImportResult(null);

        if (rejectedFiles.length > 0) {
            setFileError("Chỉ chấp nhận file Excel (.xlsx)");
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (!file.name.endsWith('.xlsx')) {
                setFileError("Chỉ chấp nhận file Excel (.xlsx)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleDownloadTemplate = () => {
        const templateUrl = "/templates/mau-nhap-lop-hoc-phan.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-lop-hoc-phan.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setFileError("Vui lòng chọn file Excel");
            return;
        }

        setIsUploading(true);
        setImportResult(null);

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch(
                `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/import-tu-excel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();
            console.log("Response nhập LHP Excel:", data);

            if (res.ok) {
                const { summary, details } = data;

                setImportResult({ summary, details });

                if (summary.failed === 0) {
                    showAlert(
                        "success",
                        "Thành công",
                        `Đã tạo ${summary.success} lớp học phần từ file Excel`
                    );
                } else if (summary.success > 0) {
                    showAlert(
                        "warning",
                        "Hoàn tất với một số lỗi",
                        `Thành công: ${summary.success} | Thất bại: ${summary.failed}`
                    );
                } else {
                    showAlert(
                        "error",
                        "Thất bại",
                        `Không thể tạo lớp học phần.  ${summary.failed} lỗi. `
                    );
                }

                onSuccess();
            } else {
                showAlert("error", "Lỗi", data.message || "Nhập lớp học phần thất bại");
            }
        } catch (err) {
            console.error("Lỗi nhập LHP Excel:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi nhập lớp học phần");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-5xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <FontAwesomeIcon icon={faFileImport} className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Nhập Lớp Học Phần từ Excel
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tạo hàng loạt lớp học phần từ file Excel
                        </p>
                    </div>
                </div>

                {/* Thông tin hướng dẫn */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faCircleInfo}
                            className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">Hướng dẫn: </p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                <li>Có thể sử dụng file Excel thống kê LHP đề xuất</li>
                                <li>File phải có định dạng .xlsx</li>
                                <li>Hệ thống sẽ tự động tạo LHP và thêm sinh viên</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Button tải file mẫu */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                        className="w-full"
                    >
                        Tải file Excel mẫu nhập lớp học phần
                    </Button>
                </div>

                {/* Dropzone */}
                <div className="mb-6">
                    <Label className="mb-2 block">Chọn file Excel danh sách lớp học phần</Label>
                    <div
                        className={`transition border-2 border-dashed cursor-pointer rounded-xl 
                            ${fileError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            ${isDragActive ? 'border-brand-500 bg-gray-100 dark:bg-gray-800' : 'hover:border-brand-500 dark:hover:border-brand-500'}
                        `}
                    >
                        <div
                            {...getRootProps()}
                            className={`rounded-xl p-7 lg:p-10
                                ${isDragActive
                                    ? "bg-gray-100 dark:bg-gray-800"
                                    : "bg-gray-50 dark:bg-gray-900"
                                }
                            `}
                        >
                            <input {...getInputProps()} />

                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex justify-center">
                                    <div className={`flex h-16 w-16 items-center justify-center rounded-full 
                                        ${selectedFile
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={selectedFile ? faFileExcel : faCloudArrowUp}
                                            className="text-2xl"
                                        />
                                    </div>
                                </div>

                                {selectedFile ? (
                                    <>
                                        <p className="mb-2 font-medium text-gray-800 dark:text-white/90">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile();
                                            }}
                                            className="mt-3 text-sm text-red-500 hover:text-red-600 underline"
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="mb-2 font-semibold text-gray-800 dark: text-white/90">
                                            {isDragActive ? "Thả file vào đây" : "Kéo & thả file vào đây"}
                                        </h4>
                                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            Chỉ chấp nhận file Excel (.xlsx)
                                        </p>
                                        <span className="font-medium underline text-sm text-brand-500">
                                            Chọn file
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {fileError && (
                        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
                            {fileError}
                        </p>
                    )}
                </div>

                {/* Cảnh báo */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            <p className="font-medium">Lưu ý quan trọng:</p>
                            <ul className="list-disc list-inside text-amber-600 dark:text-amber-400 mt-1 space-y-1">
                                <li>Đảm bảo mã môn học, giảng viên, ngành, niên khóa đã tồn tại trong hệ thống</li>
                                <li>Hệ thống sẽ bỏ qua các dòng có lỗi và tiếp tục xử lý</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Kết quả import */}
                {importResult && (
                    <div className="mb-6">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                    {importResult.summary.total}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tổng số</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {importResult.summary.success}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Thành công</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {importResult.summary.failed}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">Thất bại</p>
                            </div>
                        </div>

                        {/* Chi tiết */}
                        <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">

                            {/* Header */}
                            <div className="grid grid-cols-[8%_22%_15%_55%] bg-gray-50 dark:bg-gray-800 sticky top-0 text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                <div className="px-3 py-2">Dòng</div>
                                <div className="px-3 py-2">Mã LHP</div>
                                <div className="px-3 py-2">Trạng thái</div>
                                <div className="px-3 py-2">Chi tiết</div>
                            </div>

                            {/* Body */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                                {importResult.details.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`grid grid-cols-[8%_22%_15%_55%] ${item.status === 'failed'
                                            ? 'bg-red-50 dark:bg-red-900/10'
                                            : ''
                                            }`}
                                    >
                                        {/* Dòng */}
                                        <div className="px-3 py-2 text-gray-800 dark:text-white">
                                            {item.row}
                                        </div>

                                        {/* Mã LHP */}
                                        <div className="px-3 py-2 text-gray-800 dark:text-white font-mono text-xs truncate">
                                            {item.maLopHocPhan}
                                        </div>

                                        {/* Trạng thái */}
                                        <div className="px-3 py-2">
                                            {item.status === 'success' ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                                    Thành công
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                    <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
                                                    Thất bại
                                                </span>
                                            )}
                                        </div>

                                        {/* Chi tiết */}
                                        <div className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs break-words">
                                            {item.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {/* Loading Overlay */}
                {isUploading && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="text-4xl text-brand-500 animate-spin mb-4"
                        />
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Đang xử lý file Excel...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Vui lòng không đóng cửa sổ này
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        {importResult ? "Đóng" : "Hủy"}
                    </Button>
                    {!importResult && (
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            startIcon={
                                isUploading ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                    <FontAwesomeIcon icon={faFileImport} />
                                )
                            }
                        >
                            {isUploading ? "Đang xử lý..." : "Nhập lớp học phần"}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL TẢI XUỐNG EXCEL BẢNG ĐIỂM ====================
interface DownloadBangDiemModalProps {
    isOpen: boolean;
    onClose: () => void;
    lopHocPhan: LopHocPhan | null;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const DownloadBangDiemModal: React.FC<DownloadBangDiemModalProps> = ({
    isOpen,
    onClose,
    lopHocPhan,
    showAlert,
}) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!lopHocPhan) return;

        setIsDownloading(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/bao-cao/bang-diem-lop-hoc-phan/${lopHocPhan.id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                // Tên file theo định dạng yêu cầu
                link.download = `Danh sach sinh vien LHP ${lopHocPhan.maLopHocPhan}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert("success", "Thành công", `Đã tải xuống bảng điểm lớp ${lopHocPhan.maLopHocPhan}`);
                onClose();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Không thể tải xuống file Excel");
            }
        } catch (err) {
            console.error("Lỗi tải xuống bảng điểm:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tải xuống file");
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen || !lopHocPhan) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        <FontAwesomeIcon icon={faFileArrowDown} className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Tải xuống bảng điểm
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Xuất danh sách sinh viên và điểm số
                        </p>
                    </div>
                </div>

                {/* Thông tin lớp học phần */}
                <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Thông tin lớp học phần
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Mã LHP:</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {lopHocPhan.maLopHocPhan}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Môn học:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {lopHocPhan.monHoc.tenMonHoc}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Giảng viên:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {lopHocPhan.giangVien?.hoTen ?? "Chưa có giảng viên"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Sĩ số:</span>
                            <Badge variant="solid" color="info">
                                {lopHocPhan.siSo} sinh viên
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Thông tin hướng dẫn */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark: border-blue-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faCircleInfo}
                            className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">File Excel sẽ bao gồm:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                <li>Danh sách sinh viên đăng ký lớp học phần</li>
                                <li>Điểm quá trình, điểm thành phần, điểm thi</li>
                                <li>Điểm tổng kết và điểm chữ</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tên file sẽ tải */}
                <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileExcel} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tên file:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                            Danh sach sinh vien LHP {lopHocPhan.maLopHocPhan}.xlsx
                        </span>
                    </div>
                </div>

                {/* Loading state */}
                {isDownloading && (
                    <div className="mb-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg flex items-center justify-center gap-3">
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="text-xl text-brand-500 animate-spin"
                        />
                        <span className="text-brand-700 dark:text-brand-300 font-medium">
                            Đang tạo file Excel...
                        </span>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isDownloading}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        startIcon={
                            isDownloading ? (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faDownload} />
                            )
                        }
                    >
                        {isDownloading ? "Đang tải..." : "Tải xuống"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL THỐNG KÊ SINH VIÊN TRƯỢT MÔN ====================
interface ThongKeSVTruotMonModalProps {
    isOpen: boolean;
    onClose: () => void;
    namHocOptions: NamHocOption[];
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ThongKeSVTruotMonModal: React.FC<ThongKeSVTruotMonModalProps> = ({
    isOpen,
    onClose,
    namHocOptions,
    showAlert,
}) => {
    const [selectedNamHocId, setSelectedNamHocId] = useState("");
    const [selectedHocKy, setSelectedHocKy] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ namHoc: false, hocKy: false });

    // Lấy danh sách học kỳ từ năm học đã chọn
    const selectedNamHoc = namHocOptions.find(nh => nh.id.toString() === selectedNamHocId);
    const hocKyOptions = selectedNamHoc?.hocKys || [];

    const handleClose = () => {
        setSelectedNamHocId("");
        setSelectedHocKy("");
        setErrors({ namHoc: false, hocKy: false });
        onClose();
    };

    const validateForm = () => {
        const newErrors = {
            namHoc: !selectedNamHocId,
            hocKy: !selectedHocKy,
        };
        setErrors(newErrors);
        return !newErrors.namHoc && !newErrors.hocKy;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const accessToken = getCookie("access_token");
            const selectedNamHocData = namHocOptions.find(nh => nh.id.toString() === selectedNamHocId);
            const selectedHocKyData = hocKyOptions.find(hk => hk.id.toString() === selectedHocKy);

            if (!selectedNamHocData || !selectedHocKyData) {
                showAlert("error", "Lỗi", "Không tìm thấy thông tin năm học hoặc học kỳ");
                setIsLoading(false);
                return;
            }

            const res = await fetch(`${ENV.BACKEND_URL}/bao-cao/de-xuat-hoc-lai`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNamHoc: selectedNamHocData.maNamHoc,
                    hocKy: selectedHocKyData.hocKy,
                }),
            });

            if (res.ok) {
                // Xử lý tải file Excel
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `thong-ke-sv-truot-mon-${selectedNamHocData.maNamHoc}-HK${selectedHocKyData.hocKy}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert("success", "Thành công", "Đã xuất file thống kê sinh viên trượt môn và đề xuất học lại");
                handleClose();
            } else {
                const err = await res.json();
                handleClose();
                showAlert("error", "Lỗi", err.message || "Không thể xuất thống kê");
            }
        } catch (err) {
            console.error("Lỗi xuất thống kê SV trượt môn:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xuất thống kê");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <FontAwesomeIcon icon={faUserXmark} className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Thống kê SV trượt môn
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Xuất danh sách sinh viên trượt và đề xuất học lại
                        </p>
                    </div>
                </div>

                {/* Thông tin hướng dẫn */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faCircleInfo}
                            className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">Hướng dẫn sử dụng:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                <li>Chọn năm học và học kỳ cần xuất thống kê</li>
                                <li>Hệ thống sẽ tạo danh sách SV có điểm không đạt</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form chọn năm học và học kỳ */}
                <div className="space-y-4 mb-6">
                    {/* Năm học */}
                    <div>
                        <Label className="block mb-2">
                            Năm học <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={namHocOptions.map((nh) => ({
                                value: nh.id.toString(),
                                label: nh.maNamHoc,
                                secondary: nh.tenNamHoc,
                            }))}
                            placeholder="Chọn năm học"
                            onChange={(value) => {
                                setSelectedNamHocId(value);
                                setSelectedHocKy(""); // Reset học kỳ khi đổi năm học
                                setErrors(prev => ({ ...prev, namHoc: false }));
                            }}
                            defaultValue={selectedNamHocId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm năm học..."
                        />
                        {errors.namHoc && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
                                Vui lòng chọn năm học
                            </p>
                        )}
                    </div>

                    {/* Học kỳ */}
                    <div>
                        <Label className="block mb-2">
                            Học kỳ <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={hocKyOptions.map((hk) => ({
                                value: hk.id.toString(),
                                label: `Học kỳ ${hk.hocKy}`,
                                secondary: `${new Date(hk.ngayBatDau).toLocaleDateString("vi-VN")} - ${new Date(hk.ngayKetThuc).toLocaleDateString("vi-VN")}`,
                            }))}
                            placeholder={selectedNamHocId ? "Chọn học kỳ" : "Vui lòng chọn năm học trước"}
                            onChange={(value) => {
                                setSelectedHocKy(value);
                                setErrors(prev => ({ ...prev, hocKy: false }));
                            }}
                            defaultValue={selectedHocKy}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm học kỳ..."
                            disabled={!selectedNamHocId}
                        />
                        {errors.hocKy && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
                                Vui lòng chọn học kỳ
                            </p>
                        )}
                    </div>
                </div>

                {/* Thông tin về nội dung file */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faFileExcel}
                            className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-medium mb-1">File Excel sẽ bao gồm:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                                <li>Danh sách sinh viên không đạt</li>
                                <li>Thông tin môn học trượt của từng sinh viên</li>
                                <li>Đề xuất lớp học phần để đăng ký học lại</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Cảnh báo */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            <p className="font-medium">Lưu ý quan trọng:</p>
                            <ul className="list-disc list-inside text-amber-600 dark:text-amber-400 mt-1 space-y-1">
                                <li>Sinh viên có điểm TBCHP dưới 4.0 được xem là trượt</li>
                                <li>Dữ liệu dựa trên kết quả học tập</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        startIcon={
                            isLoading ? (
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            ) : (
                                <FontAwesomeIcon icon={faDownload} />
                            )
                        }
                    >
                        {isLoading ? "Đang xuất..." : "Xuất thống kê"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL TẠO LỚP HỌC PHẦN ====================
interface CreateLHPModalProps {
    isOpen: boolean;
    onClose: () => void;
    namHocOptions: NamHocOption[];
}

const CreateLHPModal: React.FC<CreateLHPModalProps> = ({
    isOpen,
    onClose,
    namHocOptions,
}) => {
    const router = useRouter();
    const [selectedNamHocId, setSelectedNamHocId] = useState("");
    const [selectedHocKy, setSelectedHocKy] = useState("");
    const [errors, setErrors] = useState({ namHoc: false, hocKy: false });

    // Lấy danh sách học kỳ từ năm học đã chọn
    const selectedNamHoc = namHocOptions.find(nh => nh.id.toString() === selectedNamHocId);
    const hocKyOptions = selectedNamHoc?.hocKys || [];

    const handleClose = () => {
        setSelectedNamHocId("");
        setSelectedHocKy("");
        setErrors({ namHoc: false, hocKy: false });
        onClose();
    };

    const validateForm = () => {
        const newErrors = {
            namHoc: !selectedNamHocId,
            hocKy: !selectedHocKy,
        };
        setErrors(newErrors);
        return !newErrors.namHoc && !newErrors.hocKy;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Sửa lại logic tìm kiếm
        const selectedNamHocData = namHocOptions.find(nh => nh.id.toString() === selectedNamHocId);
        const selectedHocKyData = hocKyOptions.find(hk => hk.id.toString() === selectedHocKy);

        if (!selectedNamHocData || !selectedHocKyData) return;

        // Chuyển trang sử dụng maNamHoc và hocKy làm params
        router.push(
            `/them-lop-hoc-phan/${selectedNamHocData.maNamHoc}/hoc-ky/${selectedHocKyData.hocKy}`
        );
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <FontAwesomeIcon icon={faFileImport} className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Tạo Lớp Học Phần
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Chọn năm học và học kỳ để tạo lớp học phần mới
                        </p>
                    </div>
                </div>

                {/* Thông tin hướng dẫn */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faCircleInfo}
                            className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">Hướng dẫn sử dụng:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                <li>Chọn năm học</li>
                                <li>Chọn học kỳ cần tạo lớp học phần</li>
                                <li>Bấm xác nhận để tiếp tục</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form chọn năm học và học kỳ */}
                <div className="space-y-4 mb-6">
                    {/* Năm học */}
                    <div>
                        <Label className="block mb-2">
                            Năm học <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={namHocOptions.map((nh) => ({
                                value: nh.id.toString(),
                                label: nh.maNamHoc,
                                secondary: nh.tenNamHoc,
                            }))}
                            placeholder="Chọn năm học"
                            onChange={(value) => {
                                setSelectedNamHocId(value);
                                setSelectedHocKy(""); // Reset học kỳ khi đổi năm học
                                setErrors(prev => ({ ...prev, namHoc: false }));
                            }}
                            defaultValue={selectedNamHocId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm năm học..."
                        />
                        {errors.namHoc && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
                                Vui lòng chọn năm học
                            </p>
                        )}
                    </div>

                    {/* Học kỳ */}
                    <div>
                        <Label className="block mb-2">
                            Học kỳ <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={hocKyOptions.map((hk) => ({
                                value: hk.id.toString(),
                                label: `Học kỳ ${hk.hocKy}`,
                                secondary: `${new Date(hk.ngayBatDau).toLocaleDateString("vi-VN")} - ${new Date(hk.ngayKetThuc).toLocaleDateString("vi-VN")}`,
                            }))}
                            placeholder={selectedNamHocId ? "Chọn học kỳ" : "Vui lòng chọn năm học trước"}
                            onChange={(value) => {
                                setSelectedHocKy(value);
                                setErrors(prev => ({ ...prev, hocKy: false }));
                            }}
                            defaultValue={selectedHocKy}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm học kỳ..."
                            disabled={!selectedNamHocId}
                        />
                        {errors.hocKy && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
                                Vui lòng chọn học kỳ
                            </p>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleClose}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit}>
                        Xác nhận
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== ITEMS COUNT INFO COMPONENT ====================
interface ItemsCountInfoProps {
    pagination: PaginationData;
}

const ItemsCountInfo: React.FC<ItemsCountInfoProps> = ({ pagination }) => {
    const { total, page, limit } = pagination;

    const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>
                Hiển thị{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {startItem}
                </span>
                {" - "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {endItem}
                </span>
                {" "}trên{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {total}
                </span>
                {" "}kết quả
            </span>
        </div>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ LỚP HỌC PHẦN ====================
export default function QuanLyLopHocPhanPage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [lopHocPhans, setLopHocPhans] = useState<LopHocPhan[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deletingLopHocPhan, setDeletingLopHocPhan] = useState<LopHocPhan | null>(null);
    const [editingLopHocPhan, setEditingLopHocPhan] = useState<LopHocPhan | null>(null);
    const [viewingLopHocPhan, setViewingLopHocPhan] = useState<LopHocPhan | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isImportSinhVienExcelModalOpen, setIsImportSinhVienExcelModalOpen] = useState(false);


    // State cho filter
    const [filterMonHocId, setFilterMonHocId] = useState("");
    const [filterGiangVienId, setFilterGiangVienId] = useState("");
    const [filterHocKyId, setFilterHocKyId] = useState("");
    const [filterNienKhoaId, setFilterNienKhoaId] = useState("");
    const [filterNganhId, setFilterNganhId] = useState("");
    const [filterNamHocId, setFilterNamHocId] = useState("");
    const [filterKhoaDiem, setFilterKhoaDiem] = useState<string>("");
    const [filterExpanded, setFilterExpanded] = useState(false);

    // State cho form sửa
    const [maLopHocPhan, setMaLopHocPhan] = useState("");
    const [giangVienId, setGiangVienId] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    
    // State cho thông tin tín chỉ giảng dạy
    const [tinChiInfo, setTinChiInfo] = useState<{
        currentCredits: number;
        newCredits: number;
        isLoading: boolean;
    }>({
        currentCredits: 0,
        newCredits: 0,
        isLoading: false,
    });

    // State cho options
    const [monHocOptions, setMonHocOptions] = useState<MonHocOption[]>([]);
    const [giangVienOptions, setGiangVienOptions] = useState<GiangVienOption[]>([]);
    const [namHocOptions, setNamHocOptions] = useState<NamHocOption[]>([]);
    const [nienKhoaOptions, setNienKhoaOptions] = useState<NienKhoaOption[]>([]);
    const [khoaOptions, setKhoaOptions] = useState<KhoaOption[]>([]);
    const [nganhOptions, setNganhOptions] = useState<NganhOption[]>([]);
    // Thêm vào phần khai báo state
    const [isImportLHPExcelModalOpen, setIsImportLHPExcelModalOpen] = useState(false);

    // Thêm sau dòng:  const [isImportLHPExcelModalOpen, setIsImportLHPExcelModalOpen] = useState(false);
    const [isDownloadBangDiemModalOpen, setIsDownloadBangDiemModalOpen] = useState(false);
    const [downloadingLopHocPhan, setDownloadingLopHocPhan] = useState<LopHocPhan | null>(null);

    // State để theo dõi dropdown ĐANG MỞ
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const [isCreateLHPModalOpen, setIsCreateLHPModalOpen] = useState(false);
    const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false); // ← THÊM DÒNG NÀY
    // State để theo dõi dropdown ĐANG MỞ

    // Mở modal từ thanh search header (?modal=tao-lhp | nhap-lhp-excel | them-sv-lhp)
    useEffect(() => {
        const modal = searchParams.get("modal");
        if (modal === "tao-lhp") {
            setIsCreateLHPModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "nhap-lhp-excel") {
            setIsImportLHPExcelModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "them-sv-lhp") {
            setIsImportSinhVienExcelModalOpen(true);
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const toggleDropdown = (lopHocPhanId: number) => {
        setActiveDropdownId((prev) =>
            prev === lopHocPhanId ? null : lopHocPhanId
        );
    };

    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    // THÊM 2 FUNCTION NÀY:
    const toggleHeaderDropdown = () => {
        setIsHeaderDropdownOpen((prev) => !prev);
    };

    const closeHeaderDropdown = () => {
        setIsHeaderDropdownOpen(false);
    };


    const [errors, setErrors] = useState({
        maLopHocPhan: false,
        giangVienId: false,
    });

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Fetch danh sách lớp học phần
    const fetchLopHocPhans = async (
        page: number = 1,
        search: string = "",
        monHocIdFilter: string = "",
        giangVienIdFilter: string = "",
        hocKyIdFilter: string = "",
        nienKhoaIdFilter: string = "",
        nganhIdFilter: string = "",
        khoaDiemFilter: string = "",
    ) => {
        try {
            const accessToken = getCookie("access_token");
            const FILTER_CHUA_CO_GIANG_VIEN = "__none__";
            let url = `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (monHocIdFilter) url += `&monHocId=${monHocIdFilter}`;
            if (giangVienIdFilter === FILTER_CHUA_CO_GIANG_VIEN) {
                url += `&chuaCoGiangVien=1`;
            } else if (giangVienIdFilter) {
                url += `&giangVienId=${giangVienIdFilter}`;
            }
            if (hocKyIdFilter) url += `&hocKyId=${hocKyIdFilter}`;
            if (nienKhoaIdFilter) url += `&nienKhoaId=${nienKhoaIdFilter}`;
            if (nganhIdFilter) url += `&nganhId=${nganhIdFilter}`;
            if (khoaDiemFilter) url += `&khoaDiem=${khoaDiemFilter}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setLopHocPhans(json.data);
                setPagination(json.pagination);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách lớp học phần");
        }
    };

    // Fetch danh sách môn học
    const fetchMonHoc = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/mon-hoc`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (Array.isArray(json)) {
                setMonHocOptions(json.map((mh: any) => ({
                    id: mh.id,
                    maMonHoc: mh.maMonHoc,
                    tenMonHoc: mh.tenMonHoc,
                })));
            }
        } catch (err) {
            console.error("Không thể tải danh sách môn học:", err);
        }
    };



    // Fetch danh sách giảng viên (có thể lọc theo môn học)
    const fetchGiangVien = async (monHocIdParam?: string) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `${ENV.BACKEND_URL}/danh-muc/giang-vien?page=1&limit=9999`;
            if (monHocIdParam) url += `&monHocId=${monHocIdParam}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setGiangVienOptions(json.data.map((gv: any) => ({
                    id: gv.id,
                    maGiangVien: gv.maGiangVien,
                    hoTen: gv.hoTen,
                    monHocGiangViens: gv.monHocGiangViens || [],
                })));
            }
        } catch (err) {
            console.error("Không thể tải danh sách giảng viên:", err);
        }
    };

    // Fetch danh sách năm học
    const fetchNamHoc = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/dao-tao/nam-hoc?page=1&limit=9999`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setNamHocOptions(json.data.map((nh: any) => ({
                    id: nh.id,
                    maNamHoc: nh.maNamHoc,
                    tenNamHoc: nh.tenNamHoc,
                    hocKys: nh.hocKys || [],
                })));
            }
        } catch (err) {
            console.error("Không thể tải danh sách năm học:", err);
        }
    };

    // Fetch danh sách niên khóa
    const fetchNienKhoa = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nien-khoa?page=1&limit=9999`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setNienKhoaOptions(json.data.map((nk: any) => ({
                    id: nk.id,
                    maNienKhoa: nk.maNienKhoa,
                    tenNienKhoa: nk.tenNienKhoa,
                })));
            }
        } catch (err) {
            console.error("Không thể tải danh sách niên khóa:", err);
        }
    };

    // Fetch danh sách ngành (bao gồm khoa)
    const fetchNganh = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nganh?page=1&limit=9999`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setNganhOptions(json.data.map((n: any) => ({
                    id: n.id,
                    maNganh: n.maNganh,
                    tenNganh: n.tenNganh,
                    khoa: n.khoa,
                })));

                // Extract unique khoa
                if (json.filters && json.filters.khoa) {
                    setKhoaOptions(json.filters.khoa.map((k: any) => ({
                        id: k.id,
                        maKhoa: k.maKhoa,
                        tenKhoa: k.tenKhoa,
                    })));
                }
            }
        } catch (err) {
            console.error("Không thể tải danh sách ngành:", err);
        }
    };

    useEffect(() => {
        fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
    }, [currentPage]);

    useEffect(() => {
        fetchMonHoc();
        fetchGiangVien();
        fetchNamHoc();
        fetchNienKhoa();
        fetchNganh();
    }, []);

    // Tự động set bộ lọc năm học và học kỳ dựa trên thời gian hiện tại
    useEffect(() => {
        if (namHocOptions.length === 0) return;

        const now = new Date();
        let foundNamHoc: NamHocOption | null = null;
        let foundHocKy: { id: number; hocKy: number; ngayBatDau: string; ngayKetThuc: string } | null = null;

        // Tìm năm học và học kỳ mà thời gian hiện tại nằm trong khoảng
        for (const namHoc of namHocOptions) {
            for (const hocKy of namHoc.hocKys) {
                const startDate = new Date(hocKy.ngayBatDau);
                const endDate = new Date(hocKy.ngayKetThuc);
                if (now >= startDate && now <= endDate) {
                    foundNamHoc = namHoc;
                    foundHocKy = hocKy;
                    break;
                }
            }
            if (foundNamHoc) break;
        }

        // Nếu không tìm thấy, tìm khoảng thời gian gần nhất
        if (!foundNamHoc) {
            let minDiff = Infinity;
            for (const namHoc of namHocOptions) {
                for (const hocKy of namHoc.hocKys) {
                    const startDate = new Date(hocKy.ngayBatDau);
                    const endDate = new Date(hocKy.ngayKetThuc);
                    // Tính khoảng cách từ hiện tại đến học kỳ
                    const diffStart = Math.abs(now.getTime() - startDate.getTime());
                    const diffEnd = Math.abs(now.getTime() - endDate.getTime());
                    const diff = Math.min(diffStart, diffEnd);
                    if (diff < minDiff) {
                        minDiff = diff;
                        foundNamHoc = namHoc;
                        foundHocKy = hocKy;
                    }
                }
            }
        }

        // Set filter và áp dụng bộ lọc luôn nếu tìm thấy
        if (foundNamHoc && foundHocKy) {
            setFilterNamHocId(foundNamHoc.id.toString());
            setFilterHocKyId(foundHocKy.id.toString());
            // Áp dụng bộ lọc ngay lập tức
            fetchLopHocPhans(1, "", "", "", foundHocKy.id.toString(), "", "", "");
        }
    }, [namHocOptions]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLopHocPhans(1, searchKeyword.trim(), filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchLopHocPhans(1, searchKeyword.trim(), filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
    };

    const handleResetFilter = () => {
        setFilterMonHocId("");
        setFilterGiangVienId("");
        setFilterHocKyId("");
        setFilterNienKhoaId("");
        setFilterNganhId("");
        setFilterNamHocId("");
        setSearchKeyword("");
        setFilterKhoaDiem("");
        setCurrentPage(1);
        fetchLopHocPhans(1, "", "", "", "", "", "");
    };

    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({
            id: Date.now(),   // 🔥 ép remount
            variant,
            title,
            message,
        });
    };

    // Hàm tính tín chỉ giảng dạy hiện tại của giảng viên trong học kỳ
    // excludeLopHocPhanId: khi sửa LHP thì loại lớp đó khỏi tổng "các lớp khác"
    // currentLopHocPhanCredits: tín chỉ của lớp đang sửa (để tính tổng sau cập nhật)
    // isLhpAssignedToThisGv: true nếu GV đang chọn là GV đang được gán lớp này (để "tín chỉ hiện tại" bao gồm lớp này)
    const calculateTeachingCredits = async (
        giangVienIdParam: string,
        hocKyId: number,
        excludeLopHocPhanId?: number,
        currentLopHocPhanCredits?: number,
        isLhpAssignedToThisGv: boolean = false
    ) => {
        if (!giangVienIdParam || !hocKyId) {
            setTinChiInfo({ currentCredits: 0, newCredits: 0, isLoading: false });
            return;
        }

        setTinChiInfo(prev => ({ ...prev, isLoading: true }));

        try {
            const accessToken = getCookie("access_token");
            // Lấy tất cả lớp học phần của giảng viên trong học kỳ này
            const res = await fetch(
                `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan?giangVienId=${giangVienIdParam}&hocKyId=${hocKyId}&limit=9999`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const json = await res.json();
            
            if (json.data && Array.isArray(json.data)) {
                // Tổng tín chỉ các lớp của GV đang chọn, KHÔNG tính lớp đang sửa (nếu có)
                let creditsExcludeCurrent = 0;
                json.data.forEach((lhp: LopHocPhan) => {
                    if (excludeLopHocPhanId && lhp.id === excludeLopHocPhanId) {
                        return; // Bỏ qua lớp học phần đang sửa
                    }
                    creditsExcludeCurrent += lhp.monHoc.soTinChi;
                });

                const creditsOfCurrentLhp = currentLopHocPhanCredits ?? 0;
                // Tín chỉ hiện tại của GV đang chọn: nếu lớp đang sửa thuộc GV này thì cộng thêm, không thì chỉ tổng từ API
                const currentCredits = creditsExcludeCurrent + (isLhpAssignedToThisGv ? creditsOfCurrentLhp : 0);
                // Tổng sau cập nhật = tổng hiện tại của GV đang chọn + tín chỉ lớp này (sau khi gán/giữ lớp cho GV này)
                const newCredits = creditsExcludeCurrent + creditsOfCurrentLhp;

                setTinChiInfo({
                    currentCredits,
                    newCredits,
                    isLoading: false,
                });
            } else {
                setTinChiInfo({ currentCredits: 0, newCredits: 0, isLoading: false });
            }
        } catch (err) {
            console.error("Lỗi khi tính tín chỉ giảng dạy:", err);
            setTinChiInfo({ currentCredits: 0, newCredits: 0, isLoading: false });
        }
    };

    const validateForm = () => {
        const newErrors = {
            maLopHocPhan: !maLopHocPhan.trim(),
            giangVienId: !giangVienId,
        };
        setErrors(newErrors);
        
        // Kiểm tra giới hạn tín chỉ
        if (tinChiInfo.newCredits > 12) {
            return false;
        }
        
        return !Object.values(newErrors).some((e) => e);
    };

    const resetForm = () => {
        setMaLopHocPhan("");
        setGiangVienId("");
        setGhiChu("");
        setErrors({
            maLopHocPhan: false,
            giangVienId: false,
        });
        setTinChiInfo({
            currentCredits: 0,
            newCredits: 0,
            isLoading: false,
        });
    };

    const handleUpdate = async () => {
        if (!editingLopHocPhan || !validateForm()) return;
        
        // Kiểm tra giới hạn tín chỉ
        if (tinChiInfo.newCredits > 12) {
            showAlert(
                "error",
                "Vượt quá giới hạn tín chỉ",
                `Số tín chỉ giảng dạy của giảng viên trong học kỳ này không được quá 12 tín chỉ. Hiện tại tổng tín chỉ là ${tinChiInfo.newCredits} tín chỉ.`
            );
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/${editingLopHocPhan.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maLopHocPhan: maLopHocPhan.trim(),
                    giangVienId: Number(giangVienId),
                    ghiChu: ghiChu.trim() || null,
                }),
            });

            setIsEditModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật lớp học phần thành công");
                resetForm();
                fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        }
    };

    const openDeleteModal = (lopHocPhan: LopHocPhan) => {
        setDeletingLopHocPhan(lopHocPhan);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingLopHocPhan) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/${deletingLopHocPhan.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsDeleteModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa lớp học phần thành công");
                setDeletingLopHocPhan(null);
                fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        }
    };

    const openEditModal = (lopHocPhan: LopHocPhan) => {
        setEditingLopHocPhan(lopHocPhan);
        setMaLopHocPhan(lopHocPhan.maLopHocPhan);
        const giangVienIdValue = lopHocPhan.giangVien?.id?.toString() || "";
        setGiangVienId(giangVienIdValue);
        setGhiChu(lopHocPhan.ghiChu || "");
        setIsEditModalOpen(true);
        
        // Tính tín chỉ giảng dạy khi mở modal (lớp đang sửa thuộc GV này nên isLhpAssignedToThisGv = true)
        if (giangVienIdValue && lopHocPhan.hocKy?.id) {
            calculateTeachingCredits(giangVienIdValue, lopHocPhan.hocKy.id, lopHocPhan.id, lopHocPhan.monHoc?.soTinChi, true);
        }
    };
    
    // Handler khi thay đổi giảng viên (isLhpAssignedToThisGv = true chỉ khi GV chọn trùng với GV đang gán lớp này)
    const handleGiangVienIdChange = (value: string) => {
        setGiangVienId(value);
        if (editingLopHocPhan && editingLopHocPhan.hocKy?.id) {
            const isSameGv = value === editingLopHocPhan.giangVien?.id?.toString();
            calculateTeachingCredits(value, editingLopHocPhan.hocKy.id, editingLopHocPhan.id, editingLopHocPhan.monHoc?.soTinChi, isSameGv);
        }
    };

    const openViewModal = (lopHocPhan: LopHocPhan) => {
        setViewingLopHocPhan(lopHocPhan);
        setIsViewModalOpen(true);
    };

    const openDownloadModal = (lopHocPhan: LopHocPhan) => {
        setDownloadingLopHocPhan(lopHocPhan);
        setIsDownloadBangDiemModalOpen(true);
    };

    // Lọc học kỳ theo năm học đã chọn cho filter
    const selectedFilterNamHoc = namHocOptions.find(nh => nh.id.toString() === filterNamHocId);
    const filterHocKyOptions = selectedFilterNamHoc?.hocKys || [];

    const DeleteConfirmModal = () => (
        <div className="p-6 sm:p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa lớp học phần
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa lớp học phần{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingLopHocPhan?.maLopHocPhan}
                </span>?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingLopHocPhan(null);
                    }}
                >
                    Hủy
                </Button>
                <Button variant="primary" onClick={confirmDelete}>
                    Xóa
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Lớp Học Phần" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {alert && (
                    <div className="mb-6">
                        <Alert
                            key={alert.id}        // 🔥 reset state mỗi lần show
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            dismissible
                            autoDismiss
                            duration={600000}
                            onClose={() => setAlert(null)}   // 🔥 unmount thật
                        />
                    </div>
                )}

                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Tìm kiếm */}
                    <div className="hidden lg:block w-full lg:max-w-md">
                        <div className="relative">
                            <button
                                onClick={handleSearch}
                                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
                            >
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                />
                            </button>
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo mã lớp học phần..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>
                    {/* Dropdown thao tác chính */}
                    <div className="relative inline-block">
                        <Button
                            variant="outline"
                            onClick={toggleHeaderDropdown}  // ← ĐỔI TỪ toggleDropdown(-1)
                            className="dropdown-toggle"
                            endIcon={<FaAngleDown
                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${isHeaderDropdownOpen ? "rotate-180" : "rotate-0"}`}  // ← ĐỔI
                            />}
                        >
                            Thao tác
                        </Button>

                        <Dropdown
                            isOpen={isHeaderDropdownOpen}  // ← ĐỔI TỪ activeDropdownId === -1
                            onClose={closeHeaderDropdown}  // ← ĐỔI TỪ closeDropdown
                            className="w-56 mt-2 right-0 border-2 border-gray-300 dark:border-gray-700 shadow-lg rounded-lg"
                        >
                            <div className="py-1">
                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsCreateLHPModalOpen(true);
                                        closeHeaderDropdown();  // ← ĐỔI
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faFileImport} className="w-4" />
                                    Tạo Lớp Học Phần
                                </DropdownItem>

                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsImportLHPExcelModalOpen(true);
                                        closeHeaderDropdown();  // ← ĐỔI
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faFileImport} className="w-4" />
                                    Nhập LHP từ Excel
                                </DropdownItem>

                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsImportSinhVienExcelModalOpen(true);
                                        closeHeaderDropdown();  // ← ĐỔI
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="w-4" />
                                    Thêm SV vào LHP
                                </DropdownItem>

                                {/* Thống kê SV trượt môn đã được chuyển sang trang Quản lý Sinh viên */}
                            </div>
                        </Dropdown>
                    </div>
                </div>

                {/* Khối lọc - có thể thu gọn/mở rộng */}
                {(() => {
                    const activeFilterCount = [
                        filterMonHocId,
                        filterGiangVienId,
                        filterNamHocId,
                        filterHocKyId,
                        filterNienKhoaId,
                        filterNganhId,
                        filterKhoaDiem,
                    ].filter(Boolean).length;
                    return (
                        <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden transition-shadow hover:shadow-sm">
                            {/* Header luôn hiển thị - click để thu gọn/mở rộng */}
                            <button
                                type="button"
                                onClick={() => setFilterExpanded((prev) => !prev)}
                                className="w-full flex items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded-t-lg"
                                aria-expanded={filterExpanded}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-medium text-gray-800 dark:text-white/90">
                                        Bộ lọc
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                            {activeFilterCount} đang áp dụng
                                        </span>
                                    )}
                                </div>
                                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 shrink-0">
                                    {filterExpanded ? (
                                        <>
                                            <span className="text-sm hidden sm:inline">Thu gọn</span>
                                            <FaAngleUp className="w-4 h-4 transition-transform" />
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm hidden sm:inline">Mở rộng</span>
                                            <FaAngleDown className="w-4 h-4 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* Nội dung bộ lọc - hiển thị khi mở rộng */}
                            <div
                                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                                    filterExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                            >
                                <div className="min-h-0 overflow-hidden">
                                    <div className="px-4 pb-4 pt-0 border-t border-gray-200/80 dark:border-gray-700/80">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                            {/* Lọc theo Môn học */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Môn học</Label>
                                                <SearchableSelect
                                                    options={monHocOptions.map((mh) => ({
                                                        value: mh.id.toString(),
                                                        label: mh.maMonHoc,
                                                        secondary: mh.tenMonHoc,
                                                    }))}
                                                    placeholder="Tất cả môn học"
                                                    onChange={(value) => setFilterMonHocId(value)}
                                                    defaultValue={filterMonHocId}
                                                    showSecondary={true}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm môn học..."
                                                />
                                            </div>

                                            {/* Lọc theo Giảng viên */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Giảng viên</Label>
                                                <SearchableSelect
                                                    options={[
                                                        { value: "__none__", label: "Chưa có giảng viên", secondary: "LHP chưa phân công GV" },
                                                        ...giangVienOptions.map((gv) => ({
                                                            value: gv.id.toString(),
                                                            label: gv.maGiangVien,
                                                            secondary: gv.hoTen,
                                                        })),
                                                    ]}
                                                    placeholder="Tất cả giảng viên"
                                                    onChange={(value) => setFilterGiangVienId(value)}
                                                    defaultValue={filterGiangVienId}
                                                    showSecondary={true}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm giảng viên..."
                                                />
                                            </div>

                                            {/* Lọc theo Năm học */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Năm học</Label>
                                                <SearchableSelect
                                                    options={namHocOptions.map((nh) => ({
                                                        value: nh.id.toString(),
                                                        label: nh.maNamHoc,
                                                        secondary: nh.tenNamHoc,
                                                    }))}
                                                    placeholder="Tất cả năm học"
                                                    onChange={(value) => {
                                                        setFilterNamHocId(value);
                                                        setFilterHocKyId("");
                                                    }}
                                                    defaultValue={filterNamHocId}
                                                    showSecondary={true}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm năm học..."
                                                />
                                            </div>

                                            {/* Lọc theo Học kỳ */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Học kỳ</Label>
                                                <SearchableSelect
                                                    options={filterHocKyOptions.map((hk) => ({
                                                        value: hk.id.toString(),
                                                        label: `Học kỳ ${hk.hocKy}`,
                                                        secondary: `${new Date(hk.ngayBatDau).toLocaleDateString("vi-VN")} - ${new Date(hk.ngayKetThuc).toLocaleDateString("vi-VN")}`,
                                                    }))}
                                                    placeholder={filterNamHocId ? "Tất cả học kỳ" : "Chọn năm học trước"}
                                                    onChange={(value) => setFilterHocKyId(value)}
                                                    defaultValue={filterHocKyId}
                                                    showSecondary={true}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm học kỳ..."
                                                    disabled={!filterNamHocId}
                                                />
                                            </div>

                                            {/* Lọc theo Niên khóa */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Niên khóa</Label>
                                                <SearchableSelect
                                                    options={nienKhoaOptions.map((nk) => ({
                                                        value: nk.id.toString(),
                                                        label: nk.maNienKhoa,
                                                        secondary: nk.tenNienKhoa,
                                                    }))}
                                                    placeholder="Tất cả niên khóa"
                                                    onChange={(value) => setFilterNienKhoaId(value)}
                                                    defaultValue={filterNienKhoaId}
                                                    showSecondary={true}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm niên khóa..."
                                                />
                                            </div>

                                            {/* Lọc theo Ngành */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Ngành</Label>
                                                <SearchableSelect
                                                    options={nganhOptions.map((n) => ({
                                                        value: n.id.toString(),
                                                        label: n.maNganh,
                                                        secondary: n.tenNganh,
                                                    }))}
                                                    placeholder="Tất cả ngành"
                                                    onChange={(value) => setFilterNganhId(value)}
                                                    defaultValue={filterNganhId}
                                                    showSecondary={true}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm ngành..."
                                                />
                                            </div>

                                            {/* Khóa điểm */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Khóa điểm</Label>
                                                <SearchableSelect
                                                    options={KHOA_DIEM_OPTIONS.map((opt) => ({
                                                        value: opt.value,
                                                        label: opt.label,
                                                    }))}
                                                    placeholder="Tất cả"
                                                    onChange={(value) => setFilterKhoaDiem(value)}
                                                    defaultValue={filterKhoaDiem}
                                                    showSecondary={false}
                                                    maxDisplayOptions={10}
                                                    searchPlaceholder="Tìm trạng thái..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <Button onClick={handleFilter} className="h-10">
                                                Áp dụng bộ lọc
                                            </Button>
                                            <Button variant="outline" onClick={handleResetFilter} className="h-10">
                                                Đặt lại
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1000px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[15%_18%_12%_15%_12%_12%_16%]">
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã LHP
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Giảng viên
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Ngành
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Môn
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã NK
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Khóa điểm
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {lopHocPhans.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 col-span-7">
                                                Không có dữ liệu lớp học phần
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lopHocPhans.map((lhp) => (
                                            <TableRow key={lhp.id} className="grid grid-cols-[15%_18%_12%_15%_12%_12%_16%] items-center">
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {lhp.maLopHocPhan}
                                                </TableCell>
                                                <TableCell
                                                    className={`px-5 py-4 font-medium ${lhp.giangVien?.hoTen
                                                            ? "text-gray-800 dark:text-white/90"
                                                            : "text-red-600 dark:text-red-400"
                                                        }`}
                                                >
                                                    {lhp.giangVien?.hoTen ?? "Chưa có giảng viên"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {lhp.nganh.maNganh}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {lhp.monHoc.maMonHoc}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {lhp.nienKhoa.maNienKhoa}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={getKhoaDiemColor(lhp.khoaDiem)}>
                                                        {getKhoaDiemLabel(lhp.khoaDiem)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(lhp.id)}
                                                            className="dropdown-toggle flex items-center gap-1.5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === lhp.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === lhp.id}
                                                            onClose={closeDropdown}
                                                            className="w-48 mt-2 right-0"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onClick={() => {
                                                                        openViewModal(lhp);
                                                                        closeDropdown();
                                                                    }}

                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onClick={() => openEditModal(lhp)}
                                                                    onItemClick={closeDropdown}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-2 w-4" />
                                                                    Chỉnh sửa
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="a"
                                                                    href={`${ENV.FRONTEND_ADMIN_URL}/quan-ly-lop-hoc-phan/quan-ly-sv-lhp/${lhp.id}`}
                                                                >
                                                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2 w-4" />
                                                                    Chi tiết lớp
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onClick={() => { openDownloadModal(lhp) }}
                                                                    onItemClick={closeDropdown}
                                                                >
                                                                    <FontAwesomeIcon icon={faFileArrowDown} className="mr-2 w-4" />
                                                                    Tải xuống Excel
                                                                </DropdownItem>

                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onClick={() => openDeleteModal(lhp)}
                                                                    onItemClick={closeDropdown}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="mr-2 w-4" />
                                                                    Xóa
                                                                </DropdownItem>
                                                            </div>
                                                        </Dropdown>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Pagination và Items Count Info */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <ItemsCountInfo pagination={pagination} />

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center sm:justify-end">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Sửa Lớp Học Phần */}
            <EditLopHocPhanModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingLopHocPhan(null);
                }}
                lopHocPhan={editingLopHocPhan}
                giangVienOptions={giangVienOptions}
                maLopHocPhan={maLopHocPhan}
                giangVienId={giangVienId}
                ghiChu={ghiChu}
                onMaLopHocPhanChange={setMaLopHocPhan}
                onGiangVienIdChange={handleGiangVienIdChange}
                onGhiChuChange={setGhiChu}
                onSubmit={handleUpdate}
                errors={errors}
                tinChiInfo={tinChiInfo}
            />
            {/* Modal Xem chi tiết */}
            <ViewLopHocPhanModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingLopHocPhan(null);
                }}
                lopHocPhan={viewingLopHocPhan}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingLopHocPhan(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            <ImportSinhVienExcelModal
                isOpen={isImportSinhVienExcelModalOpen}
                onClose={() => setIsImportSinhVienExcelModalOpen(false)}
                onSuccess={() => fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem)}
                showAlert={showAlert}
            />

            {/* Modal Nhập LHP từ Excel */}
            <ImportLHPExcelModal
                isOpen={isImportLHPExcelModalOpen}
                onClose={() => setIsImportLHPExcelModalOpen(false)}
                onSuccess={() => fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem)}
                showAlert={showAlert}
            />

            {/* Modal Tải xuống bảng điểm */}
            <DownloadBangDiemModal
                isOpen={isDownloadBangDiemModalOpen}
                onClose={() => {
                    setIsDownloadBangDiemModalOpen(false);
                    setDownloadingLopHocPhan(null);
                }}
                lopHocPhan={downloadingLopHocPhan}
                showAlert={showAlert}
            />

            {/* Modal Tạo Lớp Học Phần */}
            <CreateLHPModal
                isOpen={isCreateLHPModalOpen}
                onClose={() => setIsCreateLHPModalOpen(false)}
                namHocOptions={namHocOptions}
            />
        </div>
    );
}