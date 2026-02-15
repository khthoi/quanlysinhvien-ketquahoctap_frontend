"use client";
import { ENV } from "@/config/env";

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
import DatePicker from "@/components/form/date-picker";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge"; // Giả định path đúng
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ChevronDownIcon } from "@/icons";
import Select from "@/components/form/Select";
import SearchableSelect from "@/components/form/SelectCustom";
import { useDropzone } from "react-dropzone";
import {
    faCloudArrowUp,
    faDownload,
    faFileExcel,
    faCircleCheck,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

interface Nganh {
    id: number;
    maNganh: string;
    tenNganh: string;
    moTa: string | null;
    khoa: {
        id: number;
        maKhoa: string;
        tenKhoa: string;
    };
}

interface KhoaOption {
    id: number;
    tenKhoa: string;
    maKhoa: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// ==================== NGÀNH MODAL ====================
export type NganhFormErrors = {
    maNganh: string;
    tenNganh: string;
    moTa: string;
    khoaId: string;
};

interface NganhModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    maNganh: string;
    tenNganh: string;
    moTa: string;
    khoaId: number | "";
    khoaOptions: KhoaOption[];
    onMaNganhChange: (value: string) => void;
    onTenNganhChange: (value: string) => void;
    onMoTaChange: (value: string) => void;
    onKhoaIdChange: (value: number | "") => void;
    onSubmit: () => void;
    errors: NganhFormErrors;
}

const NganhModal: React.FC<NganhModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    maNganh,
    tenNganh,
    moTa,
    khoaId,
    khoaOptions,
    onMaNganhChange,
    onTenNganhChange,
    onMoTaChange,
    onKhoaIdChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Ngành" : "Tạo mới Ngành"}
                </h3>
                <div className="space-y-5">
                    <div>
                        <Label>Mã Ngành</Label>
                        <Input
                            value={maNganh}
                            onChange={(e) => onMaNganhChange(e.target.value)}
                            error={!!errors.maNganh}
                            hint={errors.maNganh}
                            placeholder="Nhập mã ngành"
                        />
                    </div>
                    <div>
                        <Label>Tên Ngành</Label>
                        <Input
                            value={tenNganh}
                            onChange={(e) => onTenNganhChange(e.target.value)}
                            error={!!errors.tenNganh}
                            hint={errors.tenNganh}
                            placeholder="Nhập tên ngành"
                        />
                    </div>
                    <div>
                        <Label>Mô tả</Label>
                        <TextArea
                            placeholder="Nhập mô tả cho ngành"
                            rows={4}
                            value={moTa}
                            onChange={onMoTaChange}
                            error={!!errors.moTa}
                            hint={errors.moTa}
                        />
                    </div>
                    <div>
                        <Label>Khoa</Label>
                        <div className="relative">
                            <SearchableSelect
                                options={khoaOptions.map((khoa) => ({
                                    value: khoa.id.toString(),
                                    label: khoa.maKhoa,
                                    secondary: khoa.tenKhoa,
                                }))}
                                placeholder="Chọn khoa"
                                onChange={(value) => onKhoaIdChange(value ? Number(value) : "")}
                                defaultValue={khoaId ? khoaId.toString() : undefined}
                                className="dark:bg-dark-900"
                                showSecondary={true}
                            />
                        </div>
                        {errors.khoaId && (
                            <p className="mt-1.5 text-xs text-error-500">{errors.khoaId}</p>
                        )}
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

// ==================== MODAL NHẬP NGÀNH EXCEL ====================
interface ImportNganhExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ImportNganhExcelModal: React.FC<ImportNganhExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    showAlert,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [importError, setImportError] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");
    const [hasImported, setHasImported] = useState(false);
    // Thêm state lưu kết quả import
    const [importResult, setImportResult] = useState<{
        totalRows: number;
        success: number;
        failed: number;
        errors: { row: number; maNganh?: string; error: string }[];
        successRows?: { row: number; maNganh: string; tenNganh: string }[];
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
        const templateUrl = "/templates/mau-nhap-nganh.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-nganh.xlsx";
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

            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nganh/import-excel`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                // Lưu kết quả vào state thay vì đóng modal
                setImportResult({
                    totalRows: result.totalRows || 0,
                    success: result.success || 0,
                    failed: result.failed || 0,
                    errors: result.errors || [],
                    successRows: result.successRows || [],
                });
                setActiveTab(result.failed > 0 ? "error" : "success");
                setHasImported(true);
            } else {
                setImportError(result.message || "Nhập ngành thất bại");
            }
        } catch (err) {
            setImportError("Có lỗi xảy ra khi nhập ngành");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (hasImported) {
            onSuccess();
            if (importResult && importResult.success > 0) {
                showAlert(
                    importResult.failed > 0 ? "warning" : "success",
                    importResult.failed > 0 ? "Hoàn tất với cảnh báo" : "Thành công",
                    `Đã thêm ${importResult.success} ngành${importResult.failed > 0 ? `, ${importResult.failed} lỗi` : ""}`
                );
            }
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

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
    };

    const resetForNewUpload = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
        setActiveTab("success");
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Nhập ngành bằng Excel
                </h3>

                {/* ==================== HIỂN THỊ KẾT QUẢ IMPORT ==================== */}
                {importResult !== null && (
                    <div className="space-y-6">
                        {/* Header tổng kết */}
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
                                                        Mã ngành
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Tên ngành
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
                                                                {row.maNganh}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                                            {row.tenNganh}
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
                                                    Đã nhập thành công {importResult.success} ngành
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
                                                        Mã ngành
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
                                                                {err.maNganh || 'N/A'}
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

                {/* ==================== HIỂN THỊ LỖI TỔNG QUÁT ==================== */}
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

                {/* ==================== FORM UPLOAD ==================== */}
                {importResult === null && !importError && (
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

                        {/* Dropzone */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Chọn file Excel nhập ngành</Label>
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
// ==================== TRANG CHÍNH QUẢN LÝ NGÀNH ====================
export default function QuanLyNganhPage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [nganhs, setNganhs] = useState<Nganh[]>([]);
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
    const [deletingNganh, setDeletingNganh] = useState<Nganh | null>(null);
    const [editingNganh, setEditingNganh] = useState<Nganh | null>(null);

    // State cho form
    const [maNganh, setMaNganh] = useState("");
    const [tenNganh, setTenNganh] = useState("");
    const [moTa, setMoTa] = useState("");
    const [khoaId, setKhoaId] = useState<number | "">("");

    // State cho filter & search
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFilterKhoaId, setSelectedFilterKhoaId] = useState<number | "">("");
    const [khoaOptions, setKhoaOptions] = useState<KhoaOption[]>([]);
    // Thêm vào phần khai báo state trong QuanLyLopNienChePage
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

    // Mở modal từ thanh search header (?modal=them-nganh | nhap-excel)
    useEffect(() => {
        const modal = searchParams.get("modal");
        if (modal === "them-nganh") {
            setIsCreateModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "nhap-excel") {
            setIsImportExcelModalOpen(true);
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    const emptyErrors: NganhFormErrors = {
        maNganh: "",
        tenNganh: "",
        moTa: "",
        khoaId: "",
    };
    const [errors, setErrors] = useState<NganhFormErrors>(emptyErrors);

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    const fetchNganhs = async (page: number = 1, search: string = "", khoaFilter: number | "" = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `${ENV.BACKEND_URL}/danh-muc/nganh?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (khoaFilter) url += `&khoaId=${khoaFilter}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNganhs(json.data);
                setPagination(json.pagination);
                if (json.filters?.khoa) {
                    setKhoaOptions(json.filters.khoa);
                }
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách ngành");
        }
    };

    useEffect(() => {
        fetchNganhs(currentPage);
    }, [currentPage]);

    const handleSearch = () => {
        fetchNganhs(1, searchKeyword.trim(), selectedFilterKhoaId);
    };

    const handleFilter = () => {
        fetchNganhs(1, searchKeyword.trim(), selectedFilterKhoaId);
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

    const resetForm = () => {
        setMaNganh("");
        setTenNganh("");
        setMoTa("");
        setKhoaId("");
        setErrors(emptyErrors);
    };

    /** Validate form trước khi tạo/sửa. Trả về valid và object lỗi (message per field). */
    const validateForm = (): { valid: boolean; formErrors: NganhFormErrors } => {
        const formErrors: NganhFormErrors = { ...emptyErrors };
        let valid = true;

        const ma = maNganh?.trim() ?? "";
        if (!ma) {
            formErrors.maNganh = "Mã ngành không được để trống";
            valid = false;
        }

        const ten = tenNganh?.trim() ?? "";
        if (!ten) {
            formErrors.tenNganh = "Tên ngành không được để trống";
            valid = false;
        }

        const mt = moTa?.trim() ?? "";
        if (!mt) {
            formErrors.moTa = "Mô tả không được để trống";
            valid = false;
        }

        if (khoaId === "" || (typeof khoaId === "number" && (isNaN(khoaId) || khoaId <= 0))) {
            formErrors.khoaId = "Vui lòng chọn khoa";
            valid = false;
        }

        return { valid, formErrors };
    };

    const handleCreate = async () => {
        const { valid, formErrors } = validateForm();
        if (!valid) {
            setErrors(formErrors);
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nganh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNganh: maNganh.trim(),
                    tenNganh: tenNganh.trim(),
                    moTa: moTa.trim(),
                    khoaId: Number(khoaId),
                }),
            });

            setIsCreateModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Tạo mới ngành thành công");
                resetForm();
                fetchNganhs(currentPage, searchKeyword.trim(), selectedFilterKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo mới thất bại");
            }
        } catch (err) {
            setIsCreateModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo ngành");
        }
    };

    const handleUpdate = async () => {
        if (!editingNganh) return;

        const { valid, formErrors } = validateForm();
        if (!valid) {
            setErrors(formErrors);
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nganh/${editingNganh.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNganh: maNganh.trim(),
                    tenNganh: tenNganh.trim(),
                    moTa: moTa.trim(),
                    khoaId: Number(khoaId),
                }),
            });

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật ngành thành công");
                resetForm();
                fetchNganhs(currentPage, searchKeyword.trim(), selectedFilterKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsEditModalOpen(false);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openDeleteModal = (nganh: Nganh) => {
        setDeletingNganh(nganh);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingNganh) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/nganh/${deletingNganh.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa ngành thành công");
                setDeletingNganh(null);
                fetchNganhs(currentPage, searchKeyword.trim(), selectedFilterKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        } finally {
            setIsDeleteModalOpen(false);
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openEditModal = (nganh: Nganh) => {
        setEditingNganh(nganh);
        setMaNganh(nganh.maNganh);
        setTenNganh(nganh.tenNganh);
        setMoTa(nganh.moTa || "");
        setKhoaId(nganh.khoa.id);
        setIsEditModalOpen(true);
    };

    const DeleteConfirmModal = () => (
        <div className="p-6 sm:p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa ngành
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa ngành{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingNganh?.tenNganh}
                </span>{" "}
                (mã: {deletingNganh?.maNganh})?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingNganh(null);
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
            <PageBreadcrumb pageTitle="Quản lý Ngành" />

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
                    {/* Khối tìm kiếm */}
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
                                placeholder="Tìm kiếm ngành..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => setIsImportExcelModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faFileExcel} />}
                        >
                            Nhập từ Excel
                        </Button>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsCreateModalOpen(true);
                            }}
                        >
                            Tạo mới Ngành
                        </Button>
                    </div>
                </div>

                {/* Khối filter khoa */}
                <div className="mb-6">
                    <Label className="block mb-2">Lọc theo Khoa</Label>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 sm:max-w-md">
                            <div className="relative">
                                <SearchableSelect
                                    options={[
                                        ...khoaOptions.map((khoa) => ({
                                            value: khoa.id.toString(),
                                            label: khoa.maKhoa,
                                            secondary: khoa.tenKhoa,
                                            placeholder: "Chọn khoa",
                                        })),
                                    ]}
                                    onChange={(value) => setSelectedFilterKhoaId(value ? Number(value) : "")}
                                    defaultValue={selectedFilterKhoaId ? selectedFilterKhoaId.toString() : ""}
                                    className="dark:bg-dark-900"
                                    showSecondary={true}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleFilter}
                            className="w-full sm:w-auto"
                        >
                            Lọc
                        </Button>
                    </div>
                </div>
                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[15%_20%_30%_15%_20%]">
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Ngành
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Tên Ngành
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mô tả
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Khoa
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {nganhs.map((nganh) => (
                                        <TableRow key={nganh.id} className="grid grid-cols-[15%_20%_30%_15%_20%] items-center">
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {nganh.maNganh}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {nganh.tenNganh}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                <div
                                                    className="max-w-[220px] truncate overflow-hidden 
                                     text-ellipsis text-left whitespace-nowrap cursor-pointer"
                                                    title={nganh.moTa ?? undefined}
                                                >
                                                    {nganh.moTa ?? "--"}
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-5 py-4">
                                                <Badge variant="solid" color="primary">
                                                    {nganh.khoa.maKhoa}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => openEditModal(nganh)}
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => openDeleteModal(nganh)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
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
            </div>

            {/* Modal Tạo mới & Sửa */}
            <NganhModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingNganh(null);
                }}
                isEdit={isEditModalOpen}
                maNganh={maNganh}
                tenNganh={tenNganh}
                moTa={moTa}
                khoaId={khoaId}
                khoaOptions={khoaOptions}
                onMaNganhChange={setMaNganh}
                onTenNganhChange={setTenNganh}
                onMoTaChange={setMoTa}
                onKhoaIdChange={setKhoaId}
                onSubmit={isEditModalOpen ? handleUpdate : handleCreate}
                errors={errors}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingNganh(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            {/* Modal Import Excel */}
            <ImportNganhExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onSuccess={() => {
                    fetchNganhs(currentPage, searchKeyword, selectedFilterKhoaId);
                }}
                showAlert={showAlert}
            />
        </div>
    );
}