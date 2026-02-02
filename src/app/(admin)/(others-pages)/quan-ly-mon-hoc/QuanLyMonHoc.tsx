"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faChevronDown, faChevronUp, faUnlink, faCircleCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { ChevronDownIcon } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { FaAngleDown } from "react-icons/fa6";
import SearchableSelect from "@/components/form/SelectCustom";
import { useDropzone } from "react-dropzone";
import { faCloudArrowUp, faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
    faLightbulb,
    faBook,
    faTableColumns
} from '@fortawesome/free-solid-svg-icons';
import MultiSelectCustom from "@/components/form/MultiSelectCustom";

type LoaiMon = "DAI_CUONG" | "TU_CHON" | "CHUYEN_NGANH";

interface GiangVienInMonHoc {
    id: number;
    maGiangVien: string;
    hoTen: string;
    sdt: string | null;
    gioiTinh: "NAM" | "NU" | "KHONG_XAC_DINH";
}
interface GiangVienMonHocItem {
    id: number;
    giangVien: GiangVienInMonHoc;
    ghiChu?: string | null;
}
interface MonHoc {
    id: number;
    maMonHoc: string;
    tenMonHoc: string;
    loaiMon: LoaiMon;
    soTinChi: number;
    moTa: string | null;
    giangVienMonHocs?: GiangVienMonHocItem[];
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface GiangVienOption {
    id: number;
    maGiangVien: string;
    hoTen: string;
}

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// Hàm chuyển enum loaiMon thành tên tiếng Việt
const getLoaiMonLabel = (loai: LoaiMon): string => {
    switch (loai) {
        case "DAI_CUONG":
            return "Đại Cương";
        case "TU_CHON":
            return "Tự Chọn";
        case "CHUYEN_NGANH":
            return "Chuyên Ngành";
        default:
            return loai;
    }
};

const getLoaiMonColor = (loai: LoaiMon): "success" | "warning" | "primary" => {
    switch (loai) {
        case "DAI_CUONG":
            return "success";
        case "TU_CHON":
            return "warning";
        case "CHUYEN_NGANH":
            return "primary";
    }
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
const getGioiTinhColor = (gioiTinh: string): "primary" | "success" | "warning" | "info" | "error" => {
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

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <FontAwesomeIcon
        icon={isOpen ? faChevronUp : faChevronDown}
        className="w-4 h-4 transition-transform duration-200"
    />
);

// ==================== MÔN HỌC MODAL ====================
interface MonHocModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    maMonHoc: string;
    tenMonHoc: string;
    loaiMon: LoaiMon | "";
    soTinChi: string;
    moTa: string;
    onMaMonHocChange: (value: string) => void;
    onTenMonHocChange: (value: string) => void;
    onLoaiMonChange: (value: LoaiMon | "") => void;
    onSoTinChiChange: (value: string) => void;
    onMoTaChange: (value: string) => void;
    onSubmit: () => void;
    errors: {
        maMonHoc: boolean;
        tenMonHoc: boolean;
        loaiMon: boolean;
        soTinChi: boolean;
        moTa: boolean;
    };
}

const MonHocModal: React.FC<MonHocModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    maMonHoc,
    tenMonHoc,
    loaiMon,
    soTinChi,
    moTa,
    onMaMonHocChange,
    onTenMonHocChange,
    onLoaiMonChange,
    onSoTinChiChange,
    onMoTaChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    const loaiMonOptions = [
        { value: "DAI_CUONG", label: "Đại Cương" },
        { value: "TU_CHON", label: "Tự Chọn" },
        { value: "CHUYEN_NGANH", label: "Chuyên Ngành" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Môn học" : "Tạo mới Môn học"}
                </h3>
                <div className="space-y-5">
                    <div>
                        <Label>Mã Môn học</Label>
                        <Input
                            defaultValue={maMonHoc}
                            onChange={(e) => onMaMonHocChange(e.target.value)}
                            error={errors.maMonHoc}
                            hint={errors.maMonHoc ? "Mã môn học không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Tên Môn học</Label>
                        <Input
                            defaultValue={tenMonHoc}
                            onChange={(e) => onTenMonHocChange(e.target.value)}
                            error={errors.tenMonHoc}
                            hint={errors.tenMonHoc ? "Tên môn học không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Loại Môn</Label>
                        <div className="relative">
                            <SearchableSelect
                                options={loaiMonOptions}
                                placeholder="Chọn loại môn"
                                onChange={(value) => onLoaiMonChange((value as LoaiMon) || "")}
                                defaultValue={loaiMon || undefined}
                                className="dark:bg-dark-900"
                            />
                        </div>
                        {errors.loaiMon && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn loại môn</p>
                        )}
                    </div>
                    <div>
                        <Label>Số Tín chỉ</Label>
                        <Input
                            type="number"
                            min="1"
                            defaultValue={soTinChi}
                            onChange={(e) => onSoTinChiChange(e.target.value)}
                            error={errors.soTinChi}
                            hint={errors.soTinChi ? "Số tín chỉ phải lớn hơn 0" : ""}
                        />
                    </div>
                    <div>
                        <Label>Mô tả</Label>
                        <TextArea
                            placeholder="Nhập mô tả cho môn học"
                            rows={4}
                            defaultValue={moTa || ""}
                            onChange={onMoTaChange}
                            error={errors.moTa}
                            hint={errors.moTa ? "Mô tả không được để trống" : ""}
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        {isEdit ? "Cập nhật" : "Tạo mới"}
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

    // Tính số items đang hiển thị
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

// ==================== MODAL NHẬP MÔN HỌC EXCEL ====================
interface ImportResult {
    totalRows: number;
    success: number;
    failed: number;
    errors: Array<{
        row: number;
        maMonHoc?: string;
        error: string;
    }>;
    successRows?: Array<{
        row: number;
        maMonHoc: string;
        tenMonHoc: string;
    }>;
}

interface ImportMonHocExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ImportMonHocExcelModal: React.FC<ImportMonHocExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    showAlert,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importError, setImportError] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");
    const [hasImported, setHasImported] = useState(false);

    const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError("");
        setImportResult(null);
        setImportError("");

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
        const templateUrl = "/templates/mau-nhap-mon-hoc.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-mon-hoc.xlsx";
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
        setImportError("");

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc/import-excel", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                setImportResult(result);
                setHasImported(true);
                // Tự động chọn tab dựa trên kết quả
                if (result.failed > 0) {
                    setActiveTab("error");
                } else {
                    setActiveTab("success");
                }
                onSuccess(); // Refresh danh sách
            } else {
                setImportError(result.message || "Nhập môn học thất bại");
            }
        } catch (err) {
            setImportError("Có lỗi xảy ra khi nhập môn học từ Excel");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (hasImported && importResult && importResult.success > 0) {
            showAlert(
                importResult.errors?.length > 0 ? "warning" : "success",
                importResult.errors?.length > 0 ? "Hoàn tất với cảnh báo" : "Thành công",
                `Đã thêm ${importResult.success} môn học${importResult.failed > 0 ? `, ${importResult.failed} lỗi` : ""}`
            );
        }
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
        setActiveTab("success");
        setHasImported(false);
        onClose();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCloseAndNotify = () => {
        if (importResult && importResult.success > 0) {
            showAlert(
                importResult.errors?.length > 0 ? "warning" : "success",
                importResult.errors?.length > 0 ? "Hoàn tất với cảnh báo" : "Thành công",
                `Đã thêm ${importResult.success} môn học${importResult.failed > 0 ? `, ${importResult.failed} lỗi` : ""}`
            );
        }
        handleClose();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
        setActiveTab("success");
    };

    const resetForNewUpload = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
        setActiveTab("success");
        setHasImported(false);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Nhập môn học bằng Excel
                </h3>

                {/* Hiển thị kết quả import */}
                {importResult && (
                    <div className="mb-6 space-y-4">
                        {/* Thống kê tổng quan */}
                        <div className={`p-5 rounded-xl border ${importResult.failed === 0
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800/50'
                                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-800/50'
                            }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${importResult.failed === 0
                                        ? 'bg-green-100 dark:bg-green-800/50'
                                        : 'bg-yellow-100 dark:bg-yellow-800/50'
                                    }`}>
                                    <FontAwesomeIcon
                                        icon={importResult.failed === 0 ? faCircleCheck : faCircleExclamation}
                                        className={`text-xl ${importResult.failed === 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h4 className={`text-lg font-semibold ${importResult.failed === 0
                                            ? 'text-green-800 dark:text-green-300'
                                            : 'text-yellow-800 dark:text-yellow-300'
                                        }`}>
                                        {importResult.failed === 0 ? 'Nhập dữ liệu thành công!' : 'Hoàn tất với một số lỗi'}
                                    </h4>
                                    <p className={`text-sm ${importResult.failed === 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                        Đã xử lý {(importResult.success || 0) + (importResult.failed || 0)} dòng dữ liệu
                                    </p>
                                </div>
                            </div>

                            {/* Grid thống kê */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                        {(importResult.success || 0) + (importResult.failed || 0)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng số dòng</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-green-200 dark:border-green-700 shadow-sm">
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {importResult.success || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thành công</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-red-200 dark:border-red-700 shadow-sm">
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {importResult.failed || 0}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thất bại</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs chuyển đổi */}
                        {((importResult.successRows && importResult.successRows.length > 0) ||
                            (importResult.errors && importResult.errors.length > 0)) && (
                                <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("success")}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === "success"
                                                ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faCircleCheck} className={activeTab === "success" ? "text-green-500" : ""} />
                                        Thành công ({importResult.successRows?.length || importResult.success || 0})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("error")}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === "error"
                                                ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={faCircleExclamation} className={activeTab === "error" ? "text-red-500" : ""} />
                                        Thất bại ({importResult.errors?.length || 0})
                                    </button>
                                </div>
                            )}

                        {/* ==================== TABLE THÀNH CÔNG ==================== */}
                        {activeTab === "success" && (
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 overflow-hidden">
                                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-200 dark:border-green-800/50">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />
                                        Chi tiết các dòng nhập thành công
                                    </h4>
                                </div>

                                {importResult.successRows && importResult.successRows.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[15%_35%_50%]">
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Dòng
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Mã môn học
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Tên môn học
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {importResult.successRows.map((row, idx) => (
                                                    <TableRow
                                                        key={idx}
                                                        className="grid grid-cols-[15%_35%_50%] bg-white dark:bg-gray-900 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                                                    >
                                                        <TableCell className="px-4 py-3 text-center">
                                                            <Badge variant="light" color="success">
                                                                {row.row}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left">
                                                            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                                                                {row.maMonHoc}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                                            {row.tenMonHoc}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        {importResult.success > 0 ? (
                                            <>
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-4xl mb-3 text-green-400" />
                                                <p className="text-green-600 dark:text-green-400">
                                                    Đã nhập thành công {importResult.success} môn học
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faFileExcel} className="text-4xl mb-3 text-gray-300 dark:text-gray-600" />
                                                <p>Không có dòng nào được nhập thành công</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ==================== TABLE LỖI ==================== */}
                        {activeTab === "error" && (
                            <div className="rounded-xl border border-red-200 dark:border-red-800/50 overflow-hidden">
                                <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-200 dark:border-red-800/50">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500" />
                                        Chi tiết các dòng bị lỗi
                                    </h4>
                                </div>

                                {importResult.errors && importResult.errors.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[12%_23%_65%]">
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Dòng
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Mã môn học
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Mô tả lỗi
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {importResult.errors.map((err, idx) => (
                                                    <TableRow
                                                        key={idx}
                                                        className="grid grid-cols-[12%_23%_65%] bg-white dark:bg-gray-900 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors"
                                                    >
                                                        <TableCell className="px-4 py-3 text-center">
                                                            <Badge variant="light" color="error">
                                                                {err.row}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left">
                                                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                                                {err.maMonHoc || 'N/A'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left">
                                                            <span className="text-sm text-red-600 dark:text-red-400">
                                                                {err.error}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-4xl mb-3 text-green-400" />
                                        <p className="text-green-600 dark:text-green-400">Tất cả các dòng đều nhập thành công!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buttons sau khi import */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={resetForNewUpload}>
                                Nhập file khác
                            </Button>
                            <Button onClick={handleClose}>
                                Hoàn tất
                            </Button>
                        </div>
                    </div>
                )}

                {/* Hiển thị lỗi tổng quát */}
                {importError && importResult === null && (
                    <div className="mb-6 p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
                                <FontAwesomeIcon
                                    icon={faCircleExclamation}
                                    className="text-xl text-red-600 dark:text-red-400"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-red-800 dark:text-red-300">
                                    Lỗi nhập dữ liệu
                                </h4>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {importError}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={resetForNewUpload}>
                                Thử lại
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleClose}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}

                {/* Form upload - chỉ hiển thị khi chưa có kết quả */}
                {!importResult && !importError && (
                    <>
                        {/* Button tải file mẫu */}
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                startIcon={<FontAwesomeIcon icon={faDownload} />}
                                className="w-full"
                            >
                                Tải file Excel mẫu
                            </Button>
                        </div>

                        {/* Hướng dẫn */}
                        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-start gap-3">
                                <FontAwesomeIcon
                                    icon={faLightbulb}
                                    className="text-blue-500 mt-0.5"
                                />
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                        Hướng dẫn
                                    </h4>
                                    <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1">
                                        <li>• Tải file mẫu và điền thông tin môn học theo định dạng</li>
                                        <li>• Các cột bắt buộc: Mã môn, Tên môn, Loại môn, Số tín chỉ</li>
                                        <li>• Loại môn: DAI_CUONG, TU_CHON, CHUYEN_NGANH</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Dropzone */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Chọn file Excel nhập môn học</Label>
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
                                        {/* Icon */}
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

                                        {/* Text Content */}
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

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                                startIcon={isUploading ? undefined : <FontAwesomeIcon icon={faFileExcel} />}
                            >
                                {isUploading ? "Đang xử lý..." : "Xác nhận"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

// ==================== MODAL XUẤT MÔN HỌC EXCEL ====================
interface ExportMonHocExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ExportMonHocExcelModal: React.FC<ExportMonHocExcelModalProps> = ({
    isOpen,
    onClose,
    showAlert,
}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            const accessToken = getCookie("access_token");

            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc/export-excel", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "Danh sách môn học trong hệ thống.xlsx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert(
                    "success",
                    "Thành công",
                    "Xuất danh sách môn học ra Excel thành công"
                );
                onClose();
            } else {
                const error = await res.json();
                showAlert("error", "Lỗi", error.message || "Xuất Excel thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xuất Excel");
        } finally {
            setIsExporting(false);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Xuất danh sách môn học ra Excel
                </h3>

                {/* Thông tin hướng dẫn */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50">
                                    <FontAwesomeIcon
                                        icon={faTableColumns}
                                        className="text-lg text-blue-600 dark:text-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    Thông tin file Excel
                                </h4>
                                <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1.5">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>File sẽ chứa toàn bộ thông tin môn học trong hệ thống</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>Bao gồm: Mã môn, Tên môn, Loại môn, Số tín chỉ, Mô tả, GV phụ trách</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>Tên file: <span className="font-medium">Danh sách môn học trong hệ thống.xlsx</span></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500">•</span>
                                        <span>File có thể dùng để lưu trữ hoặc làm cơ sở dữ liệu tham khảo</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Khung hiển thị thông tin xuất */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                <FontAwesomeIcon
                                    icon={faFileExcel}
                                    className="text-xl text-green-600 dark:text-green-400"
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white/90">
                                    Sẵn sàng xuất dữ liệu
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Nhấn "Xác nhận" để tải file Excel
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lưu ý */}
                <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                    <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                            icon={faLightbulb}
                            className="text-yellow-600 dark:text-yellow-400 mt-0.5"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                                Lưu ý
                            </p>
                            <p className="text-sm text-yellow-700/80 dark:text-yellow-300/70">
                                Dữ liệu được xuất ra dựa trên tất cả môn học hiện có trong hệ thống, không phân biệt bộ lọc hoặc tìm kiếm đang áp dụng.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isExporting}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                        startIcon={isExporting ? undefined : <FontAwesomeIcon icon={faDownload} />}
                    >
                        {isExporting ? "Đang xuất..." : "Xác nhận"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


// ==================== TRANG CHÍNH QUẢN LÝ MÔN HỌC ====================
export default function QuanLyMonHocPage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [monHocs, setMonHocs] = useState<MonHoc[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingMonHoc, setDeletingMonHoc] = useState<MonHoc | null>(null);
    const [editingMonHoc, setEditingMonHoc] = useState<MonHoc | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isExportExcelModalOpen, setIsExportExcelModalOpen] = useState(false);

    // State cho form
    const [maMonHoc, setMaMonHoc] = useState("");
    const [tenMonHoc, setTenMonHoc] = useState("");
    const [loaiMon, setLoaiMon] = useState<LoaiMon | "">("");
    const [soTinChi, setSoTinChi] = useState("");
    const [moTa, setMoTa] = useState("");

    // State cho filter loại môn
    const [filterLoaiMon, setFilterLoaiMon] = useState<LoaiMon | "">("");

    // State cho modal phân công
    const [isPhanCongModalOpen, setIsPhanCongModalOpen] = useState(false);
    const [monHocOptionsForPhanCong, setMonHocOptionsForPhanCong] = useState<MonHoc[]>([]);
    const [giangVienOptions, setGiangVienOptions] = useState<GiangVienOption[]>([]);
    const [selectedMonHocIds, setSelectedMonHocIds] = useState<string[]>([]);
    const [selectedGiangVienId, setSelectedGiangVienId] = useState<string>("");
    const [monHocSearchKeyword, setMonHocSearchKeyword] = useState("");
    const [giangVienSearchKeyword, setGiangVienSearchKeyword] = useState("");
    const [isPhanCongLoading, setIsPhanCongLoading] = useState(false);
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<number[]>([]);
    const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
    const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
    const [unassignData, setUnassignData] = useState<{
        giangVienId: number;
        monHocId: number;
        tenMonHoc: string;
        hoTenGiangVien: string;
    } | null>(null);

    // Mở modal từ thanh search header (?modal=them-mon-hoc | nhap-excel | xuat-excel | phan-cong)
    useEffect(() => {
        const modal = searchParams.get("modal");
        if (modal === "them-mon-hoc") {
            setIsCreateModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "nhap-excel") {
            setIsImportExcelModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "xuat-excel") {
            setIsExportExcelModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "phan-cong") {
            setIsPhanCongModalOpen(true);
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    // Thêm state mới cho tiến trình phân công
    const [phanCongProgress, setPhanCongProgress] = useState<{
        total: number;
        current: number;
        success: number;
        failed: number;
        isProcessing: boolean;
        results: Array<{ monHocId: string; tenMonHoc: string; success: boolean; message: string }>;
    }>({
        total: 0,
        current: 0,
        success: 0,
        failed: 0,
        isProcessing: false,
        results: [],
    });

    const [errors, setErrors] = useState({
        maMonHoc: false,
        tenMonHoc: false,
        loaiMon: false,
        soTinChi: false,
        moTa: false,
    });

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    const fetchMonHocs = async (page: number = 1, search: string = "", loaiMonFilter: LoaiMon | "" = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/mon-hoc/paginated?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (loaiMonFilter) url += `&loaiMon=${loaiMonFilter}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setMonHocs(json.data);
                setPagination(json.pagination);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách môn học");
        }
    };

    // Fetch môn học cho phân công
    const fetchMonHocForPhanCong = async (search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/mon-hoc`;
            if (search) url += `?search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (Array.isArray(json)) {
                setMonHocOptionsForPhanCong(json);
            }
        } catch (err) {
            console.error("Không thể tải danh sách môn học:", err);
        }
    };

    // Fetch giảng viên cho phân công
    const fetchGiangVienForPhanCong = async (search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/giang-vien?page=1&limit=9999`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setGiangVienOptions(
                    json.data.map((gv: any) => ({
                        id: gv.id,
                        maGiangVien: gv.maGiangVien,
                        hoTen: gv.hoTen,
                    }))
                );
            }
        } catch (err) {
            console.error("Không thể tải danh sách giảng viên:", err);
        }
    };

    // Xử lý tìm kiếm môn học trong modal phân công
    const handleSearchMonHocForPhanCong = () => {
        fetchMonHocForPhanCong(monHocSearchKeyword.trim());
    };

    // Xử lý tìm kiếm giảng viên trong modal phân công
    const handleSearchGiangVienForPhanCong = () => {
        fetchGiangVienForPhanCong(giangVienSearchKeyword.trim());
    };

    // hàm openPhanCongModal
    const openPhanCongModal = () => {
        setSelectedMonHocIds([]);
        setSelectedGiangVienId("");
        setMonHocSearchKeyword("");
        setGiangVienSearchKeyword("");
        setPhanCongProgress({
            total: 0,
            current: 0,
            success: 0,
            failed: 0,
            isProcessing: false,
            results: [],
        });
        fetchMonHocForPhanCong();
        fetchGiangVienForPhanCong();
        setIsPhanCongModalOpen(true);
    };

    // hàm closePhanCongModal
    const closePhanCongModal = () => {
        setIsPhanCongModalOpen(false);
        setSelectedMonHocIds([]);
        setSelectedGiangVienId("");
        setMonHocSearchKeyword("");
        setGiangVienSearchKeyword("");
        setMonHocOptionsForPhanCong([]);
        setGiangVienOptions([]);
        setPhanCongProgress({
            total: 0,
            current: 0,
            success: 0,
            failed: 0,
            isProcessing: false,
            results: [],
        });
    };

    // Xử lý phân công môn học
    const handlePhanCong = async () => {
        if (selectedMonHocIds.length === 0 || !selectedGiangVienId) {
            showAlert("warning", "Cảnh báo", "Vui lòng chọn ít nhất một môn học và giảng viên");
            return;
        }

        setIsPhanCongLoading(true);
        setPhanCongProgress({
            total: selectedMonHocIds.length,
            current: 0,
            success: 0,
            failed: 0,
            isProcessing: true,
            results: [],
        });

        const accessToken = getCookie("access_token");
        const results: Array<{ monHocId: string; tenMonHoc: string; success: boolean; message: string }> = [];

        // Xử lý từng môn học trong hàng đợi
        for (let i = 0; i < selectedMonHocIds.length; i++) {
            const monHocId = selectedMonHocIds[i];
            const monHoc = monHocOptionsForPhanCong.find(mh => mh.id.toString() === monHocId);
            const tenMonHoc = monHoc?.tenMonHoc || monHocId;

            try {
                const res = await fetch("http://localhost:3000/danh-muc/giang-vien/phancongmonhoc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        giangVienId: Number(selectedGiangVienId),
                        monHocId: Number(monHocId),
                    }),
                });

                if (res.ok) {
                    results.push({ monHocId, tenMonHoc, success: true, message: "Thành công" });
                    setPhanCongProgress(prev => ({
                        ...prev,
                        current: i + 1,
                        success: prev.success + 1,
                        results: [...results],
                    }));
                } else {
                    const err = await res.json();
                    results.push({ monHocId, tenMonHoc, success: false, message: err.message || "Phân công thất bại" });
                    setPhanCongProgress(prev => ({
                        ...prev,
                        current: i + 1,
                        failed: prev.failed + 1,
                        results: [...results],
                    }));
                }
            } catch (err) {
                results.push({ monHocId, tenMonHoc, success: false, message: "Có lỗi xảy ra" });
                setPhanCongProgress(prev => ({
                    ...prev,
                    current: i + 1,
                    failed: prev.failed + 1,
                    results: [...results],
                }));
            }

            // Delay nhỏ giữa các request để tránh quá tải server
            if (i < selectedMonHocIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        setPhanCongProgress(prev => ({
            ...prev,
            isProcessing: false,
        }));
        setIsPhanCongLoading(false);
    };

    // Hàm đóng modal và hiển thị kết quả
    const handleClosePhanCongWithResult = () => {
        const { success, failed } = phanCongProgress;

        if (success > 0 && failed === 0) {
            showAlert("success", "Thành công", `Đã phân công ${success} môn học thành công`);
        } else if (success > 0 && failed > 0) {
            showAlert("warning", "Hoàn tất với cảnh báo", `Thành công: ${success}, Thất bại: ${failed}`);
        } else if (failed > 0) {
            showAlert("error", "Lỗi", `Phân công thất bại: ${failed} môn học`);
        }

        closePhanCongModal();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        fetchMonHocs(currentPage, searchKeyword, filterLoaiMon);
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchMonHocs(1, searchKeyword.trim(), filterLoaiMon);
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };
    const isRowExpanded = (id: number) => expandedRows.includes(id);

    const toggleHeaderDropdown = () => setIsHeaderDropdownOpen((prev) => !prev);
    const closeHeaderDropdown = () => setIsHeaderDropdownOpen(false);

    const openUnassignModal = (giangVienId: number, monHocId: number, tenMonHoc: string, hoTenGiangVien: string) => {
        setUnassignData({ giangVienId, monHocId, tenMonHoc, hoTenGiangVien });
        setIsUnassignModalOpen(true);
    };

    const handleUnassignPhanCong = async () => {
        if (!unassignData) return;
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/giang-vien/${unassignData.giangVienId}/phan-cong-mon-hoc/${unassignData.monHocId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setIsUnassignModalOpen(false);
            setUnassignData(null);
            if (res.ok) {
                showAlert("success", "Thành công", `Đã gỡ phân công môn học "${unassignData.tenMonHoc}" khỏi giảng viên "${unassignData.hoTenGiangVien}".`);
                fetchMonHocs(currentPage, searchKeyword.trim(), filterLoaiMon);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Gỡ phân công thất bại");
            }
        } catch (err) {
            setIsUnassignModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi gỡ phân công");
        } finally {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchMonHocs(1, searchKeyword.trim(), filterLoaiMon);
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

    const validateForm = () => {
        const newErrors = {
            maMonHoc: !maMonHoc.trim(),
            tenMonHoc: !tenMonHoc.trim(),
            loaiMon: loaiMon === "",
            soTinChi: !soTinChi || Number(soTinChi) <= 0,
            moTa: !moTa.trim(),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const resetForm = () => {
        setMaMonHoc("");
        setTenMonHoc("");
        setLoaiMon("");
        setSoTinChi("");
        setMoTa("");
        setErrors({
            maMonHoc: false,
            tenMonHoc: false,
            loaiMon: false,
            soTinChi: false,
            moTa: false,
        });
    };

    const handleCreate = async () => {
        if (!validateForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maMonHoc: maMonHoc.trim(),
                    tenMonHoc: tenMonHoc.trim(),
                    loaiMon,
                    soTinChi: Number(soTinChi),
                    moTa: moTa.trim(),
                }),
            });

            setIsCreateModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Tạo mới môn học thành công");
                resetForm();
                fetchMonHocs(currentPage, searchKeyword, filterLoaiMon);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo mới thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo môn học");
        } finally {
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const handleUpdate = async () => {
        if (!editingMonHoc || !validateForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/danh-muc/mon-hoc/${editingMonHoc.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maMonHoc: maMonHoc.trim(),
                    tenMonHoc: tenMonHoc.trim(),
                    loaiMon,
                    soTinChi: Number(soTinChi),
                    moTa: moTa.trim(),
                }),
            });

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật môn học thành công");
                resetForm();
                fetchMonHocs(currentPage, searchKeyword, filterLoaiMon);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        } finally {
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openDeleteModal = (monHoc: MonHoc) => {
        setDeletingMonHoc(monHoc);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingMonHoc) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/danh-muc/mon-hoc/${deletingMonHoc.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa môn học thành công");
                setDeletingMonHoc(null);
                fetchMonHocs(currentPage, searchKeyword, filterLoaiMon);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        } finally {
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openEditModal = (monHoc: MonHoc) => {
        setEditingMonHoc(monHoc);
        setMaMonHoc(monHoc.maMonHoc);
        setTenMonHoc(monHoc.tenMonHoc);
        setLoaiMon(monHoc.loaiMon);
        setSoTinChi(monHoc.soTinChi.toString());
        setMoTa(monHoc.moTa || "");
        setIsEditModalOpen(true);
    };

    const DeleteConfirmModal = () => (
        <div className="p-6 sm:p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa môn học
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa môn học{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingMonHoc?.tenMonHoc}
                </span>{" "}
                (mã: {deletingMonHoc?.maMonHoc})?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingMonHoc(null);
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
            <PageBreadcrumb pageTitle="Quản lý Môn học" />

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
                                placeholder="Tìm kiếm môn học, mã hoặc tên giảng viên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="relative inline-block">
                        <Button
                            variant="outline"
                            onClick={toggleHeaderDropdown}
                            className="dropdown-toggle"
                            endIcon={
                                <FaAngleDown
                                    className={`text-gray-500 transition-transform duration-300 ease-in-out ${isHeaderDropdownOpen ? "rotate-180" : "rotate-0"}`}
                                />
                            }
                        >
                            Thao tác
                        </Button>
                        <Dropdown
                            isOpen={isHeaderDropdownOpen}
                            onClose={closeHeaderDropdown}
                            className="w-64 mt-2 right-0 border-2 border-gray-300 dark:border-gray-700 shadow-lg rounded-lg"
                        >
                            <div className="py-1">
                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        resetForm();
                                        setIsCreateModalOpen(true);
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faBook} className="w-4" />
                                    Tạo mới Môn học
                                </DropdownItem>
                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsImportExcelModalOpen(true);
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="w-4" />
                                    Nhập từ Excel
                                </DropdownItem>
                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsExportExcelModalOpen(true);
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faDownload} className="w-4" />
                                    Xuất Excel
                                </DropdownItem>
                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        openPhanCongModal();
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faTableColumns} className="w-4" />
                                    Phân công môn học
                                </DropdownItem>
                            </div>
                        </Dropdown>
                    </div>
                </div>

                {/* Khối lọc loại môn */}
                <div className="mb-6">
                    <Label className="block mb-2">Lọc theo Loại môn</Label>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 sm:max-w-md">
                            <div className="relative">
                                <SearchableSelect
                                    options={[
                                        { value: "DAI_CUONG", label: "Đại Cương" },
                                        { value: "TU_CHON", label: "Tự Chọn" },
                                        { value: "CHUYEN_NGANH", label: "Chuyên Ngành" },
                                    ]}
                                    placeholder="Tất cả loại môn"
                                    onChange={(value) => setFilterLoaiMon((value as LoaiMon) || "")}
                                    defaultValue={filterLoaiMon || ""}
                                    className="dark:bg-dark-900"
                                />
                            </div>
                        </div>

                        <Button onClick={handleFilter} className="w-full sm:w-auto h-11">
                            Lọc
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[950px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[5%_12%_20%_12%_6%_22%_15%]">
                                        <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-theme-xs flex items-center justify-center">
                                            <span className="sr-only">Mở rộng</span>
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Môn
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Tên Môn
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Loại Môn
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Tín chỉ
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mô tả
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {monHocs.map((mh) => (
                                        <React.Fragment key={mh.id}>
                                            <TableRow className="grid grid-cols-[5%_12%_20%_12%_6%_22%_15%] items-center">
                                                <TableCell className="px-3 py-4 flex items-center justify-center">
                                                    <button
                                                        onClick={() => toggleRow(mh.id)}
                                                        disabled={!(mh.giangVienMonHocs && mh.giangVienMonHocs.length > 0)}
                                                        className={`flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors ${mh.giangVienMonHocs && mh.giangVienMonHocs.length > 0
                                                            ? "hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                                            : "opacity-30 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        <ChevronIcon isOpen={isRowExpanded(mh.id)} />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    <div className="flex items-center gap-2">
                                                        {mh.maMonHoc}
                                                        {mh.giangVienMonHocs && mh.giangVienMonHocs.length > 0 && (
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                                                                {mh.giangVienMonHocs.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {mh.tenMonHoc}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={getLoaiMonColor(mh.loaiMon)}>
                                                        {getLoaiMonLabel(mh.loaiMon)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {mh.soTinChi}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400 text-left">
                                                    <div
                                                        className="max-w-[200px] truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                                        title={mh.moTa || ""}
                                                    >
                                                        {mh.moTa || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex gap-2 justify-center">
                                                        <Button size="sm" variant="primary" onClick={() => openEditModal(mh)}>
                                                            Sửa
                                                        </Button>
                                                        <Button size="sm" variant="primary" onClick={() => openDeleteModal(mh)}>
                                                            Xóa
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {/* Expanded: Giảng viên phụ trách */}
                                            {isRowExpanded(mh.id) && mh.giangVienMonHocs && mh.giangVienMonHocs.length > 0 && (
                                                <>
                                                    <TableRow className="grid grid-cols-[5%_12%_20%_12%_8%_20%_15%] items-center bg-gray-100/80 dark:bg-white/[0.04] border-t border-gray-200 dark:border-white/[0.05]">
                                                        <TableCell className="px-3 py-2.5"><span /></TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            Mã GV
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            Họ và tên
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            SĐT
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Giới tính
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5"><span /></TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Hành động
                                                        </TableCell>
                                                    </TableRow>
                                                    {mh.giangVienMonHocs.map((gvmh, index) => (
                                                        <TableRow
                                                            key={gvmh.id}
                                                            className={`grid grid-cols-[5%_12%_20%_12%_8%_20%_15%] items-center bg-gray-50/50 dark:bg-white/[0.01] ${index === mh.giangVienMonHocs!.length - 1
                                                                ? "border-b border-gray-200 dark:border-white/[0.05]"
                                                                : ""
                                                                }`}
                                                        >
                                                            <TableCell className="px-3 py-3 text-center">
                                                                <div className="flex items-center justify-center h-full">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`w-px bg-gray-300 dark:bg-white/[0.15] ${index === 0 ? "h-1/2" : "h-full"}`} />
                                                                        <div className="w-2 h-2 rounded-full bg-brand-400 dark:bg-brand-500" />
                                                                        {index !== mh.giangVienMonHocs!.length - 1 && (
                                                                            <div className="w-px h-1/2 bg-gray-300 dark:bg-white/[0.15]" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-700 dark:text-gray-200 font-medium text-sm">
                                                                {gvmh.giangVien.maGiangVien}
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 text-sm">
                                                                {gvmh.giangVien.hoTen}
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 text-sm">
                                                                {gvmh.giangVien.sdt || "—"}
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                <Badge variant="solid" color={getGioiTinhColor(gvmh.giangVien.gioiTinh)}>
                                                                    {getGioiTinhLabel(gvmh.giangVien.gioiTinh)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3"><span /></TableCell>
                                                            <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        openUnassignModal(
                                                                            gvmh.giangVien.id,
                                                                            mh.id,
                                                                            mh.tenMonHoc,
                                                                            gvmh.giangVien.hoTen
                                                                        )
                                                                    }
                                                                    className="p-2 text-error-500 border-error-300 hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
                                                                >
                                                                    <FontAwesomeIcon icon={faUnlink} className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Pagination và Items Count Info */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Items Count Info - Bên trái */}
                    <ItemsCountInfo pagination={pagination} />

                    {/* Pagination - Bên phải hoặc giữa */}
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

                {/* Table Footer Summary - Mở rộng / Thu gọn tất cả */}
                <div className="mt-4 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tổng số {monHocs.length} môn học với{" "}
                            {monHocs.reduce(
                                (acc, mh) => acc + (mh.giangVienMonHocs?.length ?? 0),
                                0
                            )}{" "}
                            giảng viên phụ trách
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setExpandedRows(
                                        monHocs
                                            .filter((mh) => mh.giangVienMonHocs && mh.giangVienMonHocs.length > 0)
                                            .map((mh) => mh.id)
                                    )
                                }
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
                            >
                                Mở rộng tất cả
                            </button>
                            <button
                                onClick={() => setExpandedRows([])}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
                            >
                                Thu gọn tất cả
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Tạo mới & Sửa */}
            <MonHocModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingMonHoc(null);
                }}
                isEdit={isEditModalOpen}
                maMonHoc={maMonHoc}
                tenMonHoc={tenMonHoc}
                loaiMon={loaiMon}
                soTinChi={soTinChi}
                moTa={moTa}
                onMaMonHocChange={setMaMonHoc}
                onTenMonHocChange={setTenMonHoc}
                onLoaiMonChange={setLoaiMon}
                onSoTinChiChange={setSoTinChi}
                onMoTaChange={setMoTa}
                onSubmit={isEditModalOpen ? handleUpdate : handleCreate}
                errors={errors}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingMonHoc(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            {/* Modal Xác nhận gỡ phân công giảng viên */}
            <Modal
                isOpen={isUnassignModalOpen}
                onClose={() => {
                    setIsUnassignModalOpen(false);
                    setUnassignData(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Xác nhận xoá phân công giảng viên
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn <strong>gỡ phân công</strong> môn học{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {unassignData?.tenMonHoc}
                        </span>{" "}
                        khỏi giảng viên{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {unassignData?.hoTenGiangVien}
                        </span>
                        ?<br /><br />
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsUnassignModalOpen(false);
                                setUnassignData(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleUnassignPhanCong}>
                            Gỡ liên kết
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Phân công môn học */}
            <Modal
                isOpen={isPhanCongModalOpen}
                onClose={closePhanCongModal}
                className="max-w-2xl"
            >
                <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Phân công môn học cho giảng viên
                    </h3>

                    {/* Hiển thị tiến trình phân công */}
                    {phanCongProgress.isProcessing || phanCongProgress.results.length > 0 ? (
                        <div className="space-y-4">
                            {/* Progress bar */}
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {phanCongProgress.isProcessing ? "Đang xử lý..." : "Hoàn tất"}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {phanCongProgress.current} / {phanCongProgress.total}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-brand-500 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${(phanCongProgress.current / phanCongProgress.total) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Thống kê */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {phanCongProgress.total}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tổng số</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-green-200 dark:border-green-700">
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {phanCongProgress.success}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Thành công</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-red-200 dark:border-red-700">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {phanCongProgress.failed}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Thất bại</p>
                                </div>
                            </div>

                            {/* Danh sách kết quả */}
                            {phanCongProgress.results.length > 0 && (
                                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                            Chi tiết kết quả
                                        </h4>
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {phanCongProgress.results.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`px-4 py-3 flex items-center justify-between ${result.success
                                                            ? "bg-green-50 dark:bg-green-900/10"
                                                            : "bg-red-50 dark:bg-red-900/10"
                                                        }`}
                                                >
                                                    <span className="text-sm text-gray-800 dark:text-gray-200">
                                                        {result.tenMonHoc}
                                                    </span>
                                                    <Badge
                                                        variant="light"
                                                        color={result.success ? "success" : "error"}
                                                    >
                                                        {result.success ? "Thành công" : result.message}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Buttons sau khi hoàn tất */}
                            {!phanCongProgress.isProcessing && (
                                <div className="flex justify-end gap-3 pt-2">
                                    <Button onClick={handleClosePhanCongWithResult}>
                                        Hoàn tất
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Form chọn môn học và giảng viên
                        <>
                            <div className="space-y-6">
                                {/* Khối chọn Môn học - MultiSelect */}
                                <div>
                                    <Label className="block mb-2">Chọn Môn học (có thể chọn nhiều)</Label>
                                    <div className="mt-3">
                                        <MultiSelectCustom
                                            options={monHocOptionsForPhanCong.map((mh) => ({
                                                value: mh.id.toString(),
                                                label: mh.maMonHoc,
                                                secondary: mh.tenMonHoc,
                                            }))}
                                            placeholder="Chọn các môn học"
                                            onChange={(values) => setSelectedMonHocIds(values)}
                                            defaultValue={selectedMonHocIds}
                                            showSecondary={true}
                                            maxDisplayOptions={10}
                                            maxDisplayTags={3}
                                            searchPlaceholder="Tìm môn học..."
                                            selectAllLabel="Chọn tất cả môn học"
                                            showSelectAll={true}
                                        />
                                    </div>
                                    {selectedMonHocIds.length > 0 && (
                                        <div className="mt-2 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
                                            <p className="text-sm text-brand-600 dark:text-brand-400">
                                                <span className="font-medium">Đã chọn: </span>
                                                {selectedMonHocIds.length} môn học
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200 dark:border-gray-700" />

                                {/* Khối tìm kiếm Giảng viên */}
                                <div>
                                    <Label className="block mb-2">Chọn Giảng viên</Label>
                                    <div className="mt-3">
                                        <SearchableSelect
                                            options={giangVienOptions.map((gv) => ({
                                                value: gv.id.toString(),
                                                label: gv.maGiangVien,
                                                secondary: gv.hoTen,
                                            }))}
                                            placeholder="Chọn giảng viên"
                                            onChange={(value) => setSelectedGiangVienId(value)}
                                            defaultValue={selectedGiangVienId}
                                            showSecondary={true}
                                            maxDisplayOptions={10}
                                            searchPlaceholder="Tìm trong danh sách..."
                                        />
                                    </div>
                                    {selectedGiangVienId && (
                                        <div className="mt-2 p-3 bg-success-50 dark:bg-success-500/10 rounded-lg">
                                            <p className="text-sm text-success-600 dark:text-success-400">
                                                <span className="font-medium">Đã chọn: </span>
                                                {giangVienOptions.find(gv => gv.id.toString() === selectedGiangVienId)?.maGiangVien} - {giangVienOptions.find(gv => gv.id.toString() === selectedGiangVienId)?.hoTen}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Thông tin tổng hợp */}
                                {selectedMonHocIds.length > 0 && selectedGiangVienId && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Xác nhận phân công:
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Phân công giảng viên{" "}
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {giangVienOptions.find(gv => gv.id.toString() === selectedGiangVienId)?.hoTen}
                                            </span>{" "}
                                            giảng dạy{" "}
                                            <span className="font-semibold text-gray-800 dark:text-white">
                                                {selectedMonHocIds.length} môn học
                                            </span>
                                        </p>
                                        {/* Danh sách môn học được chọn */}
                                        <div className="mt-3 max-h-32 overflow-y-auto">
                                            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                                {selectedMonHocIds.map((id) => {
                                                    const mh = monHocOptionsForPhanCong.find(m => m.id.toString() === id);
                                                    return (
                                                        <li key={id} className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                                            {mh?.maMonHoc} - {mh?.tenMonHoc}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button variant="outline" onClick={closePhanCongModal}>
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handlePhanCong}
                                    disabled={selectedMonHocIds.length === 0 || !selectedGiangVienId || isPhanCongLoading}
                                >
                                    {isPhanCongLoading ? "Đang xử lý..." : `Xác nhận phân công (${selectedMonHocIds.length} môn)`}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal Import Excel */}
            <ImportMonHocExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onSuccess={() => {
                    fetchMonHocs(currentPage, searchKeyword, filterLoaiMon);
                }}
                showAlert={showAlert}
            />
            {/* Modal Export Excel */}
            <ExportMonHocExcelModal
                isOpen={isExportExcelModalOpen}
                onClose={() => setIsExportExcelModalOpen(false)}
                showAlert={showAlert}
            />
        </div>
    );
}