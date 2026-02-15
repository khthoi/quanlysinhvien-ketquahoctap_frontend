"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import SearchableSelect from "@/components/form/SelectCustom";
import Pagination from "@/components/tables/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faTrash,
    faEye,
    faSpinner,
    faCircleCheck,
    faCircleExclamation,
    faInfoCircle,
    faUsers,
    faGraduationCap,
    faBook,
} from "@fortawesome/free-solid-svg-icons";

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// --- Types ---
interface SinhVien {
    id: number;
    maSinhVien: string;
    hoTen: string;
    nganhId: number;
    maNganh: string;
    nienKhoaId: number;
    maNienKhoa: string;
    namBatDau: number;
    yeuCauHocPhanId: number;
    loaiYeuCau: "HOC_BO_SUNG" | "HOC_CAI_THIEN";
}

interface LopHocPhanDeXuat {
    maLopHocPhan: string;
    monHocId: number;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    nganhId: number;
    maNganh: string;
    tenNganh: string;
    nienKhoaId: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    hocKyId: number;
    hocKy: number;
    maNamHoc: string;
    tenNamHoc: string;
    giangVienId: number;
    maGiangVien: string;
    hoTenGiangVien: string;
    soSinhVienCanHoc: number;
    danhSachSinhVien: SinhVien[];
}

interface DeXuatLHPResponse {
    maNamHoc: string;
    tenNamHoc: string;
    hocKy: number;
    danhSachLopHocPhanDeXuat: LopHocPhanDeXuat[];
    tongSoLop: number;
    tongSoSinhVien: number;
}

interface NienKhoaOption {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
}

interface NganhOption {
    id: number;
    maNganh: string;
    tenNganh: string;
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
}

interface CreateResult {
    maLopHocPhan: string;
    status: "success" | "failed";
    message: string;
}

const PAGE_SIZE = 10;

// Helper function to get badge color for loaiYeuCau
const getLoaiYeuCauBadge = (loaiYeuCau: string) => {
    if (loaiYeuCau === "HOC_BO_SUNG") {
        return (
            <Badge variant="light" color="info" size="sm">
                Học bổ sung
            </Badge>
        );
    } else if (loaiYeuCau === "HOC_CAI_THIEN") {
        return (
            <Badge variant="light" color="warning" size="sm">
                Học cải thiện
            </Badge>
        );
    }
    return (
        <Badge variant="light" color="light" size="sm">
            {loaiYeuCau}
        </Badge>
    );
};

// --- Detail Modal ---
interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    lopHocPhan: LopHocPhanDeXuat | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, lopHocPhan }) => {
    if (!isOpen || !lopHocPhan) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết lớp học phần đề xuất
                </h3>

                {/* Thông tin lớp học phần */}
                <div className="mb-6 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã lớp học phần</p>
                            <p className="mt-0.5 font-mono text-gray-800 dark:text-white">{lopHocPhan.maLopHocPhan}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Môn học</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{lopHocPhan.maMonHoc} - {lopHocPhan.tenMonHoc}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số tín chỉ</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{lopHocPhan.soTinChi}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngành</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{lopHocPhan.maNganh} - {lopHocPhan.tenNganh}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Niên khóa</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{lopHocPhan.maNienKhoa} - {lopHocPhan.tenNienKhoa}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Giảng viên</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{lopHocPhan.maGiangVien} - {lopHocPhan.hoTenGiangVien}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Học kỳ</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">HK{lopHocPhan.hocKy} - {lopHocPhan.tenNamHoc}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số sinh viên</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{lopHocPhan.soSinhVienCanHoc} sinh viên</p>
                        </div>
                    </div>
                </div>

                {/* Table sinh viên */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-brand-500 dark:text-brand-400" />
                        Danh sách sinh viên ({lopHocPhan.danhSachSinhVien.length})
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[700px] text-xs leading-tight">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                                        <TableRow className="grid grid-cols-[6%_18%_22%_18%_18%_18%]">
                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">STT</TableCell>
                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Mã SV</TableCell>
                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Họ tên</TableCell>
                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Ngành</TableCell>
                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Niên khóa</TableCell>
                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Loại tham gia</TableCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                        {lopHocPhan.danhSachSinhVien.length === 0 ? (
                                            <TableRow>
                                                <TableCell cols={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    Không có sinh viên
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            lopHocPhan.danhSachSinhVien.map((sv, idx) => (
                                                <TableRow key={sv.id} className="grid grid-cols-[6%_18%_22%_18%_18%_18%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                    <TableCell className="px-2 py-2 text-center text-gray-800 dark:text-white/90">{idx + 1}</TableCell>
                                                    <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.maSinhVien}>{sv.maSinhVien}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.hoTen}>{sv.hoTen}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.maNganh}>{sv.maNganh}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.maNienKhoa}>{sv.maNienKhoa}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-center">
                                                        {getLoaiYeuCauBadge(sv.loaiYeuCau)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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

// --- Confirm Add Modal ---
interface ConfirmAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    lopHocPhans: LopHocPhanDeXuat[];
    onConfirm: () => void;
    isSubmitting: boolean;
}

const ConfirmAddModal: React.FC<ConfirmAddModalProps> = ({
    isOpen,
    onClose,
    lopHocPhans,
    onConfirm,
    isSubmitting,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-6xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Xác nhận thêm lớp học phần
                </h3>

                {/* Hướng dẫn */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">Hướng dẫn:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                <li>Bạn sẽ thêm {lopHocPhans.length} lớp học phần vào hệ thống</li>
                                <li>Hệ thống sẽ tự động thêm các sinh viên vào lớp học phần tương ứng</li>
                                <li>Quá trình này có thể mất vài phút, vui lòng không đóng cửa sổ này</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Table danh sách lớp học phần */}
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1000px] text-xs leading-tight">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                                    <TableRow className="grid grid-cols-[8%_20%_20%_15%_15%_22%]">
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">STT</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Mã LHP</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Môn học</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Ngành</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Niên khóa</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Giảng viên</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                    {lopHocPhans.map((lhp, idx) => (
                                        <TableRow key={idx} className="grid grid-cols-[8%_20%_20%_15%_15%_22%] items-center">
                                            <TableCell className="px-2 py-2 text-center text-gray-800 dark:text-white/90">{idx + 1}</TableCell>
                                            <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={lhp.maLopHocPhan}>{lhp.maLopHocPhan}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={`${lhp.maMonHoc} - ${lhp.tenMonHoc}`}>{lhp.maMonHoc} - {lhp.tenMonHoc}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={lhp.maNganh}>{lhp.maNganh}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={lhp.maNienKhoa}>{lhp.maNienKhoa}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={lhp.hoTenGiangVien}>{lhp.hoTenGiangVien}</span></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Xác nhận"
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
    successList: CreateResult[];
    errorList: CreateResult[];
    isSubmitting: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({
    isOpen,
    onClose,
    successList,
    errorList,
    isSubmitting,
}) => {
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");

    useEffect(() => {
        if (errorList.length > 0) setActiveTab("error");
        else setActiveTab("success");
    }, [errorList.length]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Kết quả thêm lớp học phần
                </h3>

                {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-5xl text-brand-500 dark:text-brand-400 mb-4" />
                        <p className="text-sm font-medium">Đang xử lý...</p>
                        <p className="text-xs mt-1 opacity-80">Vui lòng đợi trong giây lát</p>
                    </div>
                ) : (
                    <>
                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/20 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/50">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-lg text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{successList.length}</p>
                                        <p className="text-sm text-green-600 dark:text-green-400/90">Thành công</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-lg text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{errorList.length}</p>
                                        <p className="text-sm text-red-600 dark:text-red-400/90">Lỗi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("success")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    activeTab === "success"
                                        ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm ring-1 ring-green-200 dark:ring-green-800/50"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                <FontAwesomeIcon icon={faCircleCheck} className={activeTab === "success" ? "text-green-500 dark:text-green-400" : "text-gray-400 dark:text-gray-500"} />
                                Thành công ({successList.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("error")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    activeTab === "error"
                                        ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-200 dark:ring-red-800/50"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                <FontAwesomeIcon icon={faCircleExclamation} className={activeTab === "error" ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"} />
                                Lỗi ({errorList.length})
                            </button>
                        </div>

                        {/* Success Table */}
                        {activeTab === "success" && (
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 overflow-hidden bg-white dark:bg-gray-900/50">
                                <div className="bg-green-50 dark:bg-green-900/25 px-4 py-3 border-b border-green-200 dark:border-green-800/50">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 dark:text-green-400" />
                                        Chi tiết thêm thành công
                                    </h4>
                                </div>
                                {successList.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="overflow-x-auto">
                                            <div className="min-w-[800px] text-xs leading-tight">
                                                <Table>
                                                    <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 text-[11px]">
                                                        <TableRow className="grid grid-cols-[50%_50%]">
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Mã LHP</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Ghi chú</TableCell>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50 text-[11px] leading-tight">
                                                        {successList.map((row, idx) => (
                                                            <TableRow key={idx} className="grid grid-cols-[50%_50%] items-center hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors">
                                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-gray-200">{row.maLopHocPhan}</TableCell>
                                                                <TableCell className="px-2 py-2 text-green-600 dark:text-green-400 font-medium text-[11px]">Đã thêm thành công</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-14 text-center">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-4xl text-green-400 dark:text-green-500 mb-3 opacity-80" />
                                        <p className="text-gray-500 dark:text-gray-400">Không có bản ghi thành công</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error Table */}
                        {activeTab === "error" && (
                            <div className="rounded-xl border border-red-200 dark:border-red-800/50 overflow-hidden bg-white dark:bg-gray-900/50">
                                <div className="bg-red-50 dark:bg-red-900/25 px-4 py-3 border-b border-red-200 dark:border-red-800/50">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 dark:text-red-400" />
                                        Chi tiết lỗi
                                    </h4>
                                </div>
                                {errorList.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="overflow-x-auto">
                                            <div className="min-w-[800px] text-xs leading-tight">
                                                <Table>
                                                    <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 text-[11px]">
                                                        <TableRow className="grid grid-cols-[30%_70%]">
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Mã LHP</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Chi tiết lỗi</TableCell>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50 text-[11px] leading-tight">
                                                        {errorList.map((row, idx) => (
                                                            <TableRow key={idx} className="grid grid-cols-[30%_70%] items-center hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-gray-200">{row.maLopHocPhan}</TableCell>
                                                                <TableCell className="px-2 py-2 text-red-600 dark:text-red-400 text-[11px]">{row.message ?? "Lỗi không xác định"}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-14 text-center">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-4xl text-red-400 dark:text-red-500 mb-3 opacity-80" />
                                        <p className="text-gray-500 dark:text-gray-400">Không có lỗi</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6">
                            <Button onClick={onClose} variant="primary">
                                Đóng
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default function LHPBosungCaithien() {
    const [apiData, setApiData] = useState<DeXuatLHPResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [detailItem, setDetailItem] = useState<LopHocPhanDeXuat | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultSuccessList, setResultSuccessList] = useState<CreateResult[]>([]);
    const [resultErrorList, setResultErrorList] = useState<CreateResult[]>([]);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState<LopHocPhanDeXuat | null>(null);

    // Filter states
    const [filterNienKhoaId, setFilterNienKhoaId] = useState("");
    const [filterNganhId, setFilterNganhId] = useState("");
    const [filterMonHocId, setFilterMonHocId] = useState("");
    const [filterGiangVienId, setFilterGiangVienId] = useState("");

    // Options for filters
    const [nienKhoaOptions, setNienKhoaOptions] = useState<NienKhoaOption[]>([]);
    const [nganhOptions, setNganhOptions] = useState<NganhOption[]>([]);
    const [monHocOptions, setMonHocOptions] = useState<MonHocOption[]>([]);
    const [giangVienOptions, setGiangVienOptions] = useState<GiangVienOption[]>([]);

    // Fetch API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/giang-day/de-xuat-lop-hoc-phan-cho-hoc-bo-sung-cai-thien`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const data = await res.json() as DeXuatLHPResponse & { message?: string };
            if (res.ok) {
                setApiData(data);
                // Extract options from data
                const uniqueNienKhoa = new Map<number, NienKhoaOption>();
                const uniqueNganh = new Map<number, NganhOption>();
                const uniqueMonHoc = new Map<number, MonHocOption>();
                const uniqueGiangVien = new Map<number, GiangVienOption>();

                data.danhSachLopHocPhanDeXuat.forEach((lhp) => {
                    if (!uniqueNienKhoa.has(lhp.nienKhoaId)) {
                        uniqueNienKhoa.set(lhp.nienKhoaId, {
                            id: lhp.nienKhoaId,
                            maNienKhoa: lhp.maNienKhoa,
                            tenNienKhoa: lhp.tenNienKhoa,
                        });
                    }
                    if (!uniqueNganh.has(lhp.nganhId)) {
                        uniqueNganh.set(lhp.nganhId, {
                            id: lhp.nganhId,
                            maNganh: lhp.maNganh,
                            tenNganh: lhp.tenNganh,
                        });
                    }
                    if (!uniqueMonHoc.has(lhp.monHocId)) {
                        uniqueMonHoc.set(lhp.monHocId, {
                            id: lhp.monHocId,
                            maMonHoc: lhp.maMonHoc,
                            tenMonHoc: lhp.tenMonHoc,
                        });
                    }
                    if (!uniqueGiangVien.has(lhp.giangVienId)) {
                        uniqueGiangVien.set(lhp.giangVienId, {
                            id: lhp.giangVienId,
                            maGiangVien: lhp.maGiangVien,
                            hoTen: lhp.hoTenGiangVien,
                        });
                    }
                });

                setNienKhoaOptions(Array.from(uniqueNienKhoa.values()));
                setNganhOptions(Array.from(uniqueNganh.values()));
                setMonHocOptions(Array.from(uniqueMonHoc.values()));
                setGiangVienOptions(Array.from(uniqueGiangVien.values()));
            } else {
                setFetchError(data.message ?? "Không tải được dữ liệu");
            }
        } catch {
            setFetchError("Lỗi kết nối khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const displayItems = useMemo(() => {
        if (!apiData?.danhSachLopHocPhanDeXuat) return [];
        return apiData.danhSachLopHocPhanDeXuat.filter((lhp) => !removedIds.has(lhp.maLopHocPhan));
    }, [apiData?.danhSachLopHocPhanDeXuat, removedIds]);

    const filteredItems = useMemo(() => {
        let items = displayItems;

        // Search filter
        if (searchKeyword.trim()) {
            const q = searchKeyword.trim().toLowerCase();
            items = items.filter((lhp) =>
                lhp.maLopHocPhan.toLowerCase().includes(q)
            );
        }

        // Other filters
        if (filterNienKhoaId) {
            items = items.filter((lhp) => lhp.nienKhoaId.toString() === filterNienKhoaId);
        }
        if (filterNganhId) {
            items = items.filter((lhp) => lhp.nganhId.toString() === filterNganhId);
        }
        if (filterMonHocId) {
            items = items.filter((lhp) => lhp.monHocId.toString() === filterMonHocId);
        }
        if (filterGiangVienId) {
            items = items.filter((lhp) => lhp.giangVienId.toString() === filterGiangVienId);
        }

        return items;
    }, [displayItems, searchKeyword, filterNienKhoaId, filterNganhId, filterMonHocId, filterGiangVienId]);

    const totalFiltered = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, filterNienKhoaId, filterNganhId, filterMonHocId, filterGiangVienId]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages >= 1) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const handleRemove = (lhp: LopHocPhanDeXuat) => {
        setDeleteConfirmItem(lhp);
    };

    const handleConfirmDelete = () => {
        if (deleteConfirmItem) {
            setRemovedIds((prev) => new Set(prev).add(deleteConfirmItem.maLopHocPhan));
            setDeleteConfirmItem(null);
        }
    };

    const handleConfirmAdd = async () => {
        const toAdd = displayItems;
        if (toAdd.length === 0) return;

        setIsSubmitting(true);
        setIsResultModalOpen(true);
        setResultSuccessList([]);
        setResultErrorList([]);
        setIsConfirmModalOpen(false);

        const successList: CreateResult[] = [];
        const errorList: CreateResult[] = [];
        const accessToken = getCookie("access_token");

        for (const lhp of toAdd) {
            try {
                const res = await fetch("${ENV.BACKEND_URL}/giang-day/tao-lop-hoc-phan-cho-hoc-bo-sung-cai-thien", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maLopHocPhan: lhp.maLopHocPhan,
                        monHocId: lhp.monHocId,
                        nganhId: lhp.nganhId,
                        nienKhoaId: lhp.nienKhoaId,
                        hocKyId: lhp.hocKyId,
                        giangVienId: lhp.giangVienId,
                        ghiChu: null,
                    }),
                });

                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                    successList.push({
                        maLopHocPhan: lhp.maLopHocPhan,
                        status: "success",
                        message: "Thêm thành công",
                    });
                } else {
                    errorList.push({
                        maLopHocPhan: lhp.maLopHocPhan,
                        status: "failed",
                        message: (body as any).message ?? "Lỗi không xác định",
                    });
                }
            } catch {
                errorList.push({
                    maLopHocPhan: lhp.maLopHocPhan,
                    status: "failed",
                    message: "Lỗi kết nối",
                });
            }
        }

        setResultSuccessList(successList);
        setResultErrorList(errorList);
        setIsSubmitting(false);

        // Remove successful items
        if (successList.length > 0) {
            const successMa = new Set(successList.map((r) => r.maLopHocPhan));
            setRemovedIds((prev) => {
                const next = new Set(prev);
                successMa.forEach((ma) => next.add(ma));
                return next;
            });
        }

        // Refresh data
        await fetchData();
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Tạo lớp học phần học bổ sung và cải thiện" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {fetchError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 flex items-center justify-between">
                        <span>{fetchError}</span>
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <FontAwesomeIcon icon={faSpinner} className="mr-2" />
                            Thử lại
                        </Button>
                    </div>
                )}

                {/* Header với thông tin năm học */}
                {apiData && (
                    <div className="mb-6 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    Học kỳ {apiData.hocKy} - {apiData.tenNamHoc}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Tạo lớp học phần cho sinh viên học bổ sung và cải thiện
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Thông tin tổng quan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50">
                                <FontAwesomeIcon icon={faBook} className="text-xl text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {loading ? "..." : apiData?.tongSoLop ?? 0}
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400/90">Tổng số lớp</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/50">
                                <FontAwesomeIcon icon={faUsers} className="text-xl text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {loading ? "..." : apiData?.tongSoSinhVien ?? 0}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400/90">Tổng số sinh viên</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/50">
                                <FontAwesomeIcon icon={faGraduationCap} className="text-xl text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                                    {displayItems.length}
                                </p>
                                <p className="text-sm text-amber-600 dark:text-amber-400/90">Lớp còn lại</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hướng dẫn sử dụng */}
                <div className="mb-6 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <FontAwesomeIcon
                                icon={faInfoCircle}
                                className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                Hướng dẫn sử dụng
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                <li>Trang này hiển thị danh sách các lớp học phần cần tạo cho sinh viên học bổ sung và cải thiện</li>
                                <li>Các lớp học phần này được đề xuất khi không có lớp học phần phù hợp để học ghép</li>
                                <li>Bạn có thể xem chi tiết từng lớp học phần và danh sách sinh viên sẽ tham gia</li>
                                <li>Sử dụng bộ lọc để tìm kiếm lớp học phần theo tiêu chí mong muốn</li>
                                <li>Nhấn nút "Thêm lớp học phần" để tạo các lớp học phần vào hệ thống</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Nút thêm lớp học phần */}
                <div className="mb-6">
                    <Button
                        startIcon={<FontAwesomeIcon icon={faBook} />}
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={displayItems.length === 0 || loading}
                    >
                        Thêm lớp học phần ({displayItems.length})
                    </Button>
                </div>

                {/* Tìm kiếm */}
                <div className="mb-4 w-full sm:max-w-md">
                    <div className="relative">
                        <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        <input
                            type="text"
                            placeholder="Tìm theo mã lớp học phần..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                        />
                    </div>
                </div>

                {/* Bộ lọc */}
                <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bộ lọc</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label className="block mb-2 text-xs">Niên khóa</Label>
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
                        <div>
                            <Label className="block mb-2 text-xs">Ngành</Label>
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
                        <div>
                            <Label className="block mb-2 text-xs">Môn học</Label>
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
                        <div>
                            <Label className="block mb-2 text-xs">Giảng viên</Label>
                            <SearchableSelect
                                options={giangVienOptions.map((gv) => ({
                                    value: gv.id.toString(),
                                    label: gv.maGiangVien,
                                    secondary: gv.hoTen,
                                }))}
                                placeholder="Tất cả giảng viên"
                                onChange={(value) => setFilterGiangVienId(value)}
                                defaultValue={filterGiangVienId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm giảng viên..."
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1000px] text-xs leading-tight">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                                    <TableRow className="grid grid-cols-[6%_16%_18%_12%_12%_15%_8%_13%]">
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">STT</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Mã LHP</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Môn học</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Niên khóa</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Ngành</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Giảng viên</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Sĩ số</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Hành động</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                    {paginatedItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell cols={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                {loading ? (
                                                    <div className="flex flex-col items-center justify-center py-4">
                                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-brand-500 dark:text-brand-400 mb-2" />
                                                        <p className="text-sm">Đang tải...</p>
                                                    </div>
                                                ) : displayItems.length === 0
                                                    ? "Không có lớp học phần đề xuất"
                                                    : "Không có kết quả tìm kiếm"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedItems.map((lhp, idx) => (
                                            <TableRow key={lhp.maLopHocPhan} className="grid grid-cols-[6%_16%_18%_12%_12%_15%_8%_13%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <TableCell className="px-2 py-2 text-center text-gray-800 dark:text-white/90">
                                                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90 text-left">
                                                    <span className="block truncate" title={lhp.maLopHocPhan}>{lhp.maLopHocPhan}</span>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left">
                                                    <span className="block truncate" title={`${lhp.maMonHoc} - ${lhp.tenMonHoc}`}>
                                                        {lhp.maMonHoc} - {lhp.tenMonHoc}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left">
                                                    <span className="block truncate" title={lhp.maNienKhoa}>{lhp.maNienKhoa}</span>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left">
                                                    <span className="block truncate" title={lhp.maNganh}>{lhp.maNganh}</span>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left">
                                                    <span className="block truncate" title={lhp.hoTenGiangVien}>{lhp.hoTenGiangVien}</span>
                                                </TableCell>
                                                <TableCell className="px-2 py-2 text-center text-gray-800 dark:text-white/90">
                                                    {lhp.soSinhVienCanHoc}
                                                </TableCell>
                                                <TableCell className="px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => setDetailItem(lhp)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(lhp)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                        </button>
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

                {/* Pagination */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Hiển thị{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                        </span>
                        {" - "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {Math.min(currentPage * PAGE_SIZE, totalFiltered)}
                        </span>
                        {" trên "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{totalFiltered}</span>
                        {" kết quả"}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center sm:justify-end">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* Delete Confirm Modal */}
            {deleteConfirmItem && (
                <Modal
                    isOpen={!!deleteConfirmItem}
                    onClose={() => setDeleteConfirmItem(null)}
                    size="2xl"
                >
                    <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                            Xác nhận xóa lớp học phần
                        </h3>

                        {/* Cảnh báo */}
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex gap-3">
                                <FontAwesomeIcon
                                    icon={faCircleExclamation}
                                    className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0"
                                />
                                <div className="text-sm text-red-700 dark:text-red-300">
                                    <p className="font-medium mb-1">Cảnh báo:</p>
                                    <p className="text-red-600 dark:text-red-400">
                                        Bạn đang xóa lớp học phần khỏi danh sách đề xuất. Lớp học phần này sẽ không được thêm vào hệ thống khi bạn nhấn nút "Thêm lớp học phần".
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hướng dẫn */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex gap-3">
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                                />
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <p className="font-medium mb-2">Hướng dẫn:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                        <li>Xóa lớp học phần khỏi danh sách chỉ ẩn nó khỏi danh sách đề xuất, không xóa dữ liệu gốc</li>
                                        <li>Bạn có thể làm mới trang để khôi phục lại danh sách ban đầu</li>
                                        <li>Nếu bạn muốn thêm lớp học phần này sau, hãy làm mới trang và thêm lại</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin lớp học phần */}
                        <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã lớp học phần</p>
                                    <p className="mt-0.5 font-mono text-gray-800 dark:text-white">{deleteConfirmItem.maLopHocPhan}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Môn học</p>
                                    <p className="mt-0.5 text-gray-800 dark:text-white">{deleteConfirmItem.maMonHoc} - {deleteConfirmItem.tenMonHoc}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số sinh viên</p>
                                    <p className="mt-0.5 text-gray-800 dark:text-white">{deleteConfirmItem.soSinhVienCanHoc} sinh viên</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ngành</p>
                                    <p className="mt-0.5 text-gray-800 dark:text-white">{deleteConfirmItem.maNganh} - {deleteConfirmItem.tenNganh}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>
                                Hủy
                            </Button>
                            <Button onClick={handleConfirmDelete} variant="danger">
                                Xác nhận xóa
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            <DetailModal
                isOpen={!!detailItem}
                onClose={() => setDetailItem(null)}
                lopHocPhan={detailItem}
            />
            <ConfirmAddModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                lopHocPhans={displayItems}
                onConfirm={handleConfirmAdd}
                isSubmitting={isSubmitting}
            />
            <ResultModal
                isOpen={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                successList={resultSuccessList}
                errorList={resultErrorList}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
