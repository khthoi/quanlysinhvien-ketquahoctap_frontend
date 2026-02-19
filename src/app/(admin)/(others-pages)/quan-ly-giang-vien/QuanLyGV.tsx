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
import Badge from "@/components/ui/badge/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faPenToSquare,
    faTrash,
    faEye,
    faChevronDown,
    faChevronUp,
    faUnlink,
    faPlus,
    faUserPlus,
    faUsersGear,
    faCircleCheck,
    faCircleExclamation,
    faSpinner,
    faTrashCan,
    faTriangleExclamation,
    faInfoCircle,
    faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDownIcon } from "@/icons";
import Select from "@/components/form/Select";
import SearchableSelect from "@/components/form/SelectCustom";
import MultiSelectCustom from "@/components/form/MultiSelectCustom";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { FaAngleDown } from "react-icons/fa6";
import { useDropzone } from "react-dropzone";
import { faCloudArrowUp, faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "@/components/form/input/Checkbox";

// ==================== INTERFACES ====================
enum VaiTro {
    ADMIN = "ADMIN",
    GIANG_VIEN = "GIANG_VIEN",
    SINH_VIEN = "SINH_VIEN",
    CAN_BO_PHONG_DAO_TAO = "CAN_BO_PHONG_DAO_TAO",
}

interface MonHoc {
    id: number;
    tenMonHoc: string;
    maMonHoc: string;
    loaiMon: "CHUYEN_NGANH" | "DAI_CUONG" | "TU_CHON";
    soTinChi: number;
    moTa: string;
}

interface MonHocGiangVien {
    id: number;
    monHoc: MonHoc;
    ghiChu: string | null;
}

interface GiangVien {
    id: number;
    maGiangVien: string;
    hoTen: string;
    ngaySinh: string;
    email: string;
    sdt: string;
    gioiTinh: "NAM" | "NU" | "KHONG_XAC_DINH";
    diaChi: string;
    monHocGiangViens: MonHocGiangVien[];
    nguoiDung: NguoiDung;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface NguoiDung {
    id: number;
    username: string;
    vaiTro: VaiTro;
    ngayTao: string;
}

// ==================== HELPER FUNCTIONS ====================
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// Chuyển đổi loại môn sang tiếng Việt
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

// Lấy màu cho badge loại môn
const getLoaiMonColor = (loaiMon: string): "primary" | "success" | "warning" | "info" | "error" => {
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

// Chuyển đổi giới tính sang tiếng Việt
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

// Lấy màu cho badge giới tính
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

// Format ngày tháng
const formatDateVN = (dateInput: string | Date): string => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// ==================== CHEVRON ICON COMPONENT ====================
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <FontAwesomeIcon
        icon={isOpen ? faChevronUp : faChevronDown}
        className={`w-4 h-4 transition-transform duration-200`}
    />
);

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

// ==================== GIẢNG VIÊN MODAL ====================
export type GiangVienFormErrors = {
    maGiangVien: string;
    hoTen: string;
    ngaySinh: string;
    email: string;
    sdt: string;
    gioiTinh: string;
    diaChi: string;
};

interface GiangVienModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    formData: {
        maGiangVien: string;
        hoTen: string;
        ngaySinh: string;
        email: string;
        sdt: string;
        gioiTinh: string;
        diaChi: string;
    };
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: GiangVienFormErrors;
}

const GiangVienModal: React.FC<GiangVienModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    formData,
    onFormChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    // Chỉ cho chọn Nam hoặc Nữ
    const gioiTinhOptions = [
        { value: "NAM", label: "Nam" },
        { value: "NU", label: "Nữ" },
    ];

    function formatDateNoTimezone(date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Giảng Viên" : "Thêm Giảng Viên"}
                </h3>
                <div className="space-y-5">
                    {/* Mã Giảng Viên */}
                    <div>
                        <Label>Mã Giảng Viên</Label>
                        <Input
                            value={formData.maGiangVien}
                            onChange={(e) => onFormChange("maGiangVien", e.target.value)}
                            error={!!errors.maGiangVien}
                            hint={errors.maGiangVien}
                            placeholder="Nhập mã giảng viên"
                        />
                    </div>

                    {/* Họ và Tên */}
                    <div>
                        <Label>Họ và Tên</Label>
                        <Input
                            value={formData.hoTen}
                            onChange={(e) => onFormChange("hoTen", e.target.value)}
                            error={!!errors.hoTen}
                            hint={errors.hoTen}
                            placeholder="Nhập họ tên"
                        />
                    </div>

                    {/* Ngày Sinh */}
                    <div>
                        <Label>Ngày Sinh</Label>
                        <DatePicker
                            id={isEdit ? "edit-ngaySinh" : "create-ngaySinh"}
                            defaultDate={formData.ngaySinh || undefined}
                            onChange={([date]: any) => {
                                if (date) {
                                    const formatted = formatDateNoTimezone(date);
                                    onFormChange("ngaySinh", formatted);
                                } else {
                                    onFormChange("ngaySinh", "");
                                }
                            }}
                        />
                        {errors.ngaySinh && (
                            <p className="mt-1.5 text-xs text-error-500">{errors.ngaySinh}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => onFormChange("email", e.target.value)}
                            error={!!errors.email}
                            hint={errors.email}
                            placeholder="Nhập email"
                        />
                    </div>

                    {/* Số Điện Thoại */}
                    <div>
                        <Label>Số Điện Thoại</Label>
                        <Input
                            type="tel"
                            value={formData.sdt}
                            onChange={(e) => onFormChange("sdt", e.target.value)}
                            error={!!errors.sdt}
                            hint={errors.sdt}
                            placeholder="VD: 0123456789 hoặc +84912345678"
                        />
                    </div>

                    {/* Giới Tính */}
                    <div>
                        <Label>Giới Tính</Label>
                        <div className="relative">
                            <SearchableSelect
                                options={gioiTinhOptions}
                                placeholder="Chọn giới tính"
                                onChange={(value: string) => onFormChange("gioiTinh", value)}
                                defaultValue={formData.gioiTinh}
                                className="dark:bg-dark-900"
                            />
                        </div>
                        {errors.gioiTinh && (
                            <p className="mt-1.5 text-xs text-error-500">{errors.gioiTinh}</p>
                        )}
                    </div>

                    {/* Địa Chỉ */}
                    <div>
                        <Label>Địa Chỉ</Label>
                        <TextArea
                            placeholder="Nhập địa chỉ"
                            rows={3}
                            value={formData.diaChi}
                            onChange={(value) => onFormChange("diaChi", value)}
                            error={!!errors.diaChi}
                            hint={errors.diaChi}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== CHI TIẾT GIẢNG VIÊN MODAL ====================
interface ChiTietModalProps {
    isOpen: boolean;
    onClose: () => void;
    giangVien: GiangVien | null;
}

const ChiTietModal: React.FC<ChiTietModalProps> = ({
    isOpen,
    onClose,
    giangVien,
}) => {
    if (!isOpen || !giangVien) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết Giảng Viên
                </h3>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Mã GV:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.maGiangVien}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Họ và tên:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.hoTen}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{formatDateVN(giangVien.ngaySinh)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Giới tính:</span>
                            <p className="mt-1">
                                <Badge variant="solid" color={getGioiTinhColor(giangVien.gioiTinh)}>
                                    {getGioiTinhLabel(giangVien.gioiTinh)}
                                </Badge>
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.email}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.sdt}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.diaChi}</p>
                        </div>
                    </div>
                </div>

                {/* Danh sách môn học phân công */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-3">
                        Môn học được phân công ({giangVien.monHocGiangViens.length})
                    </h4>
                    {giangVien.monHocGiangViens.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-2 px-3 text-left text-gray-500 dark: text-gray-400">Mã môn</th>
                                        <th className="py-2 px-3 text-left text-gray-500 dark: text-gray-400">Tên môn</th>
                                        <th className="py-2 px-3 text-center text-gray-500 dark:text-gray-400">Loại môn</th>
                                        <th className="py-2 px-3 text-center text-gray-500 dark: text-gray-400 ">Số tín chỉ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {giangVien.monHocGiangViens.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90">{item.monHoc.maMonHoc}</td>
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90">{item.monHoc.tenMonHoc}</td>
                                            <td className="py-2 px-3 text-center">
                                                <Badge variant="solid" color={getLoaiMonColor(item.monHoc.loaiMon)}>
                                                    {getLoaiMonLabel(item.monHoc.loaiMon)}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-800 dark:text-white/90">{item.monHoc.soTinChi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Chưa được phân công môn học nào
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL NHẬP GIẢNG VIÊN EXCEL ====================
interface ImportGiangVienExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ImportGiangVienExcelModal: React.FC<ImportGiangVienExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    showAlert,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

    // Cập nhật state lưu kết quả import theo response mới
    const [importResult, setImportResult] = useState<{
        message: string;
        totalRowsSheet1: number;
        successSheet1: number;
        failedSheet1: number;
        totalRowsSheet2: number;
        successSheet2: number;
        failedSheet2: number;
        errors: Array<{
            sheet: string;
            row: number;
            maGiangVien: string;
            maMonHoc?: string;
            error: string;
        }>;
        success: Array<{
            sheet: string;
            row: number;
            maGiangVien: string;
            maMonHoc?: string;
            message: string;
        }>;
    } | null>(null);

    // State để toggle hiển thị chi tiết thành công
    const [showSuccessDetails, setShowSuccessDetails] = useState(false);

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

    // Sửa lại hàm tải file mẫu - fetch từ API
    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/giang-vien/export-excel-template`, {
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
                // Format tên file theo yêu cầu
                link.download = "Mẫu nhập excel giảng viên kèm phân công môn học.xlsx";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                showAlert("error", "Lỗi", "Không thể tải file mẫu");
            }
        } catch (err) {
            console.error("Lỗi tải file mẫu:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tải file mẫu");
        } finally {
            setIsDownloadingTemplate(false);
        }
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

            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/giang-vien/import-excel`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                // Lưu kết quả theo format response mới
                setImportResult({
                    message: result.message || "",
                    totalRowsSheet1: result.totalRowsSheet1 || 0,
                    successSheet1: result.successSheet1 || 0,
                    failedSheet1: result.failedSheet1 || 0,
                    totalRowsSheet2: result.totalRowsSheet2 || 0,
                    successSheet2: result.successSheet2 || 0,
                    failedSheet2: result.failedSheet2 || 0,
                    errors: result.errors || [],
                    success: result.success || [],
                });

                // Gọi callback reload
                onSuccess();
            } else {
                showAlert("error", "Lỗi", result.message || "Nhập giảng viên thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi nhập giảng viên");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setShowSuccessDetails(false);
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
    };

    // Lọc errors và success theo sheet
    const getErrorsBySheet = (sheet: string) =>
        importResult?.errors.filter(e => e.sheet === sheet) || [];

    const getSuccessBySheet = (sheet: string) =>
        importResult?.success.filter(s => s.sheet === sheet) || [];

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <FontAwesomeIcon icon={faFileExcel} className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Nhập giảng viên bằng Excel
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nhập thông tin giảng viên và phân công môn học từ file Excel
                        </p>
                    </div>
                </div>

                {/* Button tải file mẫu */}
                <div className="mb-6">
                    <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        disabled={isDownloadingTemplate}
                        startIcon={
                            isDownloadingTemplate
                                ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                : <FontAwesomeIcon icon={faDownload} />
                        }
                        className="w-full"
                    >
                        {isDownloadingTemplate ? "Đang tải..." : "Tải file Excel mẫu"}
                    </Button>
                </div>

                {/* Thông tin về cấu trúc file Excel */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Cấu trúc file Excel mẫu
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {/* Sheet 1 */}
                                    <div className="p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold">1</span>
                                            <span className="font-medium text-blue-800 dark:text-blue-200">Sheet "Giảng viên"</span>
                                        </div>
                                        <ul className="text-blue-700/80 dark:text-blue-300/70 space-y-1 ml-8 list-disc">
                                            <li>Mã giảng viên (bắt buộc)</li>
                                            <li>Họ tên, Email, SĐT</li>
                                            <li>Ngày sinh, Giới tính, Địa chỉ</li>
                                        </ul>
                                    </div>
                                    {/* Sheet 2 */}
                                    <div className="p-3 bg-white/60 dark:bg-gray-800/40 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">2</span>
                                            <span className="font-medium text-blue-800 dark:text-blue-200">Sheet "Phân công môn học"</span>
                                        </div>
                                        <ul className="text-blue-700/80 dark:text-blue-300/70 space-y-1 ml-8 list-disc">
                                            <li>Mã giảng viên</li>
                                            <li>Mã môn học</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lưu ý quan trọng */}
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
                                    Lưu ý quan trọng
                                </h4>
                                <ul className="text-sm text-amber-700/80 dark:text-amber-300/70 space-y-1 list-disc list-inside">
                                    <li>Đảm bảo các trường bắt buộc được điền đầy đủ</li>
                                    <li>Mã giảng viên và Email phải là duy nhất trong hệ thống</li>
                                    <li>Hệ thống sẽ xử lý dữ liệu ở Sheet 1 trước, sau đó mới đến Sheet 2</li>
                                    <li>Mã môn học & mã Giảng viên ở Sheet 2 phải tồn tại trong hệ thống</li>
                                    <li>Chỉ chấp nhận file định dạng <strong>.xlsx</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dropzone */}
                <div className="mb-6">
                    <Label className="mb-2 block">Chọn file Excel nhập giảng viên</Label>
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
                                            Hủy chọn file
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
                    <div className="mb-6 space-y-5">
                        {/* Message tổng quan */}
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-center font-semibold text-gray-800 dark:text-white text-lg">
                                {importResult.message}
                            </p>
                        </div>

                        {/* ====== SHEET 1: GIẢNG VIÊN ====== */}
                        <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 overflow-hidden">
                            {/* Header Sheet 1 */}
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold">1</span>
                                        <h4 className="font-semibold text-white text-lg">Sheet "Giảng viên"</h4>
                                    </div>
                                    {/* Summary badges */}
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                            Tổng: {importResult.totalRowsSheet1}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-green-400/30 text-white text-sm font-medium">
                                            Thành công: {importResult.successSheet1}
                                        </span>
                                        {importResult.failedSheet1 > 0 && (
                                            <span className="px-3 py-1 rounded-full bg-red-800/30 text-white text-sm font-medium">
                                                Lỗi: {importResult.failedSheet1}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Sheet 1 */}
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10">
                                {/* Lỗi Sheet 1 */}
                                {getErrorsBySheet("Giảng viên").length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500" />
                                            <span className="font-medium text-red-600 dark:text-red-400 text-sm">
                                                Lỗi ({getErrorsBySheet("Giảng viên").length})
                                            </span>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto border border-red-200 dark:border-red-900/30 rounded-lg bg-white dark:bg-gray-900">
                                            <Table>
                                                <TableHeader className="border-b border-red-100 dark:border-red-900/30 sticky top-0 bg-red-50 dark:bg-red-900/20">
                                                    <TableRow>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[15%]">
                                                            Dòng
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[25%]">
                                                            Mã GV
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-left w-[60%]">
                                                            Lỗi
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-red-100 dark:divide-red-900/30 text-sm">
                                                    {getErrorsBySheet("Giảng viên").map((err, index) => (
                                                        <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-900/5">
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-medium">
                                                                {err.row}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                                {err.maGiangVien}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-red-600 dark:text-red-400 text-xs">
                                                                {err.error}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Thành công Sheet 1 */}
                                {getSuccessBySheet("Giảng viên").length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />
                                            <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                                                Thành công ({getSuccessBySheet("Giảng viên").length})
                                            </span>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto border border-green-200 dark:border-green-900/30 rounded-lg bg-white dark:bg-gray-900">
                                            <Table>
                                                <TableHeader className="border-b border-green-100 dark:border-green-900/30 sticky top-0 bg-green-50 dark:bg-green-900/20">
                                                    <TableRow>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[15%]">
                                                            Dòng
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[25%]">
                                                            Mã GV
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-left w-[60%]">
                                                            Kết quả
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-green-100 dark:divide-green-900/30 text-sm">
                                                    {getSuccessBySheet("Giảng viên").map((item, index) => (
                                                        <TableRow key={index} className="hover:bg-green-50/50 dark:hover:bg-green-900/5">
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-medium">
                                                                {item.row}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                                {item.maGiangVien}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-green-600 dark:text-green-400 text-xs">
                                                                {item.message}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Không có dữ liệu Sheet 1 */}
                                {getErrorsBySheet("Giảng viên").length === 0 && getSuccessBySheet("Giảng viên").length === 0 && (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                        Không có dữ liệu xử lý ở sheet này
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ====== SHEET 2: PHÂN CÔNG MÔN HỌC ====== */}
                        <div className="rounded-xl border border-green-200 dark:border-green-800/50 overflow-hidden">
                            {/* Header Sheet 2 */}
                            <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-sm font-bold">2</span>
                                        <h4 className="font-semibold text-white text-lg">Sheet "Phân công môn học"</h4>
                                    </div>
                                    {/* Summary badges */}
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                                            Tổng: {importResult.totalRowsSheet2}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-green-400/30 text-white text-sm font-medium">
                                            Thành công: {importResult.successSheet2}
                                        </span>
                                        {importResult.failedSheet2 > 0 && (
                                            <span className="px-3 py-1 rounded-full bg-red-800/30 text-white text-sm font-medium">
                                                Lỗi: {importResult.failedSheet2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Sheet 2 */}
                            <div className="p-4 bg-green-50/50 dark:bg-green-900/10">
                                {/* Lỗi Sheet 2 */}
                                {getErrorsBySheet("Phân công môn học").length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500" />
                                            <span className="font-medium text-red-600 dark:text-red-400 text-sm">
                                                Lỗi ({getErrorsBySheet("Phân công môn học").length})
                                            </span>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto border border-red-200 dark:border-red-900/30 rounded-lg bg-white dark:bg-gray-900">
                                            <Table>
                                                <TableHeader className="border-b border-red-100 dark:border-red-900/30 sticky top-0 bg-red-50 dark:bg-red-900/20">
                                                    <TableRow>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[12%]">
                                                            Dòng
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                            Mã GV
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                            Mã MH
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-left w-[48%]">
                                                            Lỗi
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-red-100 dark:divide-red-900/30 text-sm">
                                                    {getErrorsBySheet("Phân công môn học").map((err, index) => (
                                                        <TableRow key={index} className="hover:bg-red-50/50 dark:hover:bg-red-900/5">
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-medium">
                                                                {err.row}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                                {err.maGiangVien}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                                {err.maMonHoc || "-"}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-red-600 dark:text-red-400 text-xs">
                                                                {err.error}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Thành công Sheet 2 */}
                                {getSuccessBySheet("Phân công môn học").length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />
                                            <span className="font-medium text-green-600 dark:text-green-400 text-sm">
                                                Thành công ({getSuccessBySheet("Phân công môn học").length})
                                            </span>
                                        </div>
                                        <div className="max-h-40 overflow-y-auto border border-green-200 dark:border-green-900/30 rounded-lg bg-white dark:bg-gray-900">
                                            <Table>
                                                <TableHeader className="border-b border-green-100 dark:border-green-900/30 sticky top-0 bg-green-50 dark:bg-green-900/20">
                                                    <TableRow>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[12%]">
                                                            Dòng
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                            Mã GV
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center w-[20%]">
                                                            Mã MH
                                                        </TableCell>
                                                        <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-left w-[48%]">
                                                            Kết quả
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody className="divide-y divide-green-100 dark:divide-green-900/30 text-sm">
                                                    {getSuccessBySheet("Phân công môn học").map((item, index) => (
                                                        <TableRow key={index} className="hover:bg-green-50/50 dark:hover:bg-green-900/5">
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-medium">
                                                                {item.row}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                                {item.maGiangVien}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                                {item.maMonHoc || "-"}
                                                            </TableCell>
                                                            <TableCell className="px-3 py-2 text-green-600 dark:text-green-400 text-xs">
                                                                {item.message}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}

                                {/* Không có dữ liệu Sheet 2 */}
                                {getErrorsBySheet("Phân công môn học").length === 0 && getSuccessBySheet("Phân công môn học").length === 0 && (
                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                        Không có dữ liệu xử lý ở sheet này
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thông báo thành công hoàn toàn */}
                        {importResult.errors.length === 0 && (importResult.successSheet1 > 0 || importResult.successSheet2 > 0) && (
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-xl" />
                                    </div>
                                    <p className="text-green-700 dark:text-green-400 font-semibold">
                                        Nhập dữ liệu từ Excel thành công! Không có lỗi nào xảy ra.
                                    </p>
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
                            startIcon={
                                isUploading
                                    ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    : <FontAwesomeIcon icon={faFileExcel} />
                            }
                        >
                            {isUploading ? "Đang xử lý..." : "Nhập giảng viên"}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ GIẢNG VIÊN ====================
export default function QuanLyGiangVienPage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    // State cho danh sách và pagination
    const [giangViens, setGiangViens] = useState<GiangVien[]>([]);
    const [monHocOptions, setMonHocOptions] = useState<MonHoc[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);

    // State cho dropdown rows
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    // State cho modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [deletingGiangVien, setDeletingGiangVien] = useState<GiangVien | null>(null);
    const [editingGiangVien, setEditingGiangVien] = useState<GiangVien | null>(null);
    const [viewingGiangVien, setViewingGiangVien] = useState<GiangVien | null>(null);
    // State cho modal tạo tài khoản
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
    const [creatingAccountGiangVien, setCreatingAccountGiangVien] = useState<GiangVien | null>(null);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);
    // Thêm vào phần khai báo state trong QuanLyLopNienChePage
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
    // State cho modal cấp tài khoản hàng loạt
    const [isBulkCreateAccountModalOpen, setIsBulkCreateAccountModalOpen] = useState(false);
    const [isBulkCreatingAccounts, setIsBulkCreatingAccounts] = useState(false);

    // Mở modal từ thanh search header (?modal=cap-tk-hang-loat)
    useEffect(() => {
        const modal = searchParams.get("modal");
        if (modal === "cap-tk-hang-loat") {
            setIsBulkCreateAccountModalOpen(true);
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);
    const [bulkCreateResult, setBulkCreateResult] = useState<{
        message: string;
        totalGiangVien: number;
        success: number;
        failed: number;
        errors: Array<{
            giangVienId: number;
            maGiangVien: string;
            error: string;
        }>;
    } | null>(null);

    // State cho phân công môn học trực tiếp cho giảng viên
    const [isPhanCongModalOpen, setIsPhanCongModalOpen] = useState(false);
    const [phanCongGiangVien, setPhanCongGiangVien] = useState<GiangVien | null>(null);
    const [selectedMonHocIdsForPhanCong, setSelectedMonHocIdsForPhanCong] = useState<string[]>([]);
    const [isPhanCongLoading, setIsPhanCongLoading] = useState(false);
    // Môn học đang được chọn để xem chi tiết trong modal phân công
    const [selectedMonHocDetailId, setSelectedMonHocDetailId] = useState<string>("");

    // State cho checkbox và xóa hàng loạt (giữ selection khi chuyển trang)
    const [selectedGiangVienIds, setSelectedGiangVienIds] = useState<number[]>([]);
    const [selectedGiangVienMap, setSelectedGiangVienMap] = useState<Record<number, { maGiangVien: string; hoTen: string; email?: string }>>({});
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkDeleteResults, setBulkDeleteResults] = useState<Array<{
        id: number;
        maGiangVien: string;
        hoTen: string;
        status: "success" | "failed";
        message: string;
    }> | null>(null);

    // State cho form
    const [formData, setFormData] = useState({
        maGiangVien: "",
        hoTen: "",
        ngaySinh: "",
        email: "",
        sdt: "",
        gioiTinh: "",
        diaChi: "",
    });

    // State để theo dõi dropdown ĐANG MỞ (chỉ 1 cái duy nhất)
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    // Toggle: nếu click vào dropdown đang mở → đóng nó, ngược lại mở nó và đóng cái khác
    const toggleDropdown = (sinhVienId: number) => {
        setActiveDropdownId((prev) =>
            prev === sinhVienId ? null : sinhVienId
        );
    };

    // Close dropdown (gọi khi chọn item hoặc click ngoài)
    const closeDropdown = () => {
        setActiveDropdownId(null);
    };


    // State cho filter & search
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFilterMonHocId, setSelectedFilterMonHocId] = useState<number | "">("");
    const [onlyUnassigned, setOnlyUnassigned] = useState(false);
    const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false);
    const [unassignedAllGiangViens, setUnassignedAllGiangViens] = useState<GiangVien[]>([]);

    const emptyErrors: GiangVienFormErrors = {
        maGiangVien: "",
        hoTen: "",
        ngaySinh: "",
        email: "",
        sdt: "",
        gioiTinh: "",
        diaChi: "",
    };
    const [errors, setErrors] = useState<GiangVienFormErrors>(emptyErrors);

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Thêm các state mới
    const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
    const [unassignData, setUnassignData] = useState<{
        giangVienId: number;
        monHocId: number;
        tenMonHoc: string;
        hoTen: string;
    } | null>(null);

    // ==================== API CALLS ====================
    const fetchGiangViens = async (
        page: number = 1,
        search: string = "",
        monHocId: number | "" = ""
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `${ENV.BACKEND_URL}/danh-muc/giang-vien?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (monHocId) url += `&monHocId=${monHocId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setGiangViens(json.data);
                setPagination({
                    total: json.pagination.total || 0,
                    page: json.pagination.page || 1,
                    limit: json.pagination.limit || 10,
                    totalPages: json.pagination.totalPages || 1,
                });
                setCurrentPage(json.pagination.page || 1);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách giảng viên");
        }
    };

    // Fetch danh sách giảng viên chưa được phân công bất kỳ môn học nào
    const fetchGiangViensChuaPhanCong = async (search: string = "") => {
        try {
            setIsLoadingUnassigned(true);
            setUnassignedAllGiangViens([]);
            const accessToken = getCookie("access_token");
            let url = `${ENV.BACKEND_URL}/danh-muc/giang-vien?page=1&limit=99999`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();

            if (json.data) {
                const allGiangViens: GiangVien[] = json.data;
                const unassignedGiangViens = allGiangViens.filter(
                    (gv) => !gv.monHocGiangViens || gv.monHocGiangViens.length === 0
                );

                setUnassignedAllGiangViens(unassignedGiangViens);
                setCurrentPage(1);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách giảng viên chưa được phân công");
        } finally {
            setIsLoadingUnassigned(false);
        }
    };

    const fetchMonHocOptions = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/mon-hoc`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (Array.isArray(json)) {
                setMonHocOptions(json);
            }
        } catch (err) {
            console.error("Không thể tải danh sách môn học:", err);
        }
    };

    // Fetch danh sách môn học options khi component mount
    useEffect(() => {
        fetchMonHocOptions();
    }, []);

    // Fetch giảng viên khi currentPage hoặc chế độ lọc thay đổi
    useEffect(() => {
        if (!onlyUnassigned) {
            fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
        }
    }, [currentPage, onlyUnassigned]);

    // Phân trang client-side cho danh sách giảng viên chưa được phân công
    useEffect(() => {
        if (!onlyUnassigned) return;

        const limit = 10;
        const total = unassignedAllGiangViens.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(currentPage, totalPages);
        const start = (safePage - 1) * limit;
        const pageData = unassignedAllGiangViens.slice(start, start + limit);

        setGiangViens(pageData);
        setPagination({
            total,
            page: safePage,
            limit,
            totalPages,
        });

        if (safePage !== currentPage) {
            setCurrentPage(safePage);
        }
    }, [currentPage, onlyUnassigned, unassignedAllGiangViens]);

    // ==================== HANDLERS ====================
    const handleSearch = () => {
        setCurrentPage(1);
        if (onlyUnassigned) {
            fetchGiangViensChuaPhanCong(searchKeyword.trim());
        } else {
            fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
        }
    };

    const handleFilter = () => {
        setCurrentPage(1);
        if (onlyUnassigned) {
            fetchGiangViensChuaPhanCong(searchKeyword.trim());
        } else {
            fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
        }
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
        setFormData({
            maGiangVien: "",
            hoTen: "",
            ngaySinh: "",
            email: "",
            sdt: "",
            gioiTinh: "",
            diaChi: "",
        });
        setErrors(emptyErrors);
    };

    /** Validate form trước khi tạo/sửa. Trả về valid và object lỗi (message per field). */
    const validateForm = (): { valid: boolean; formErrors: GiangVienFormErrors } => {
        const formErrors: GiangVienFormErrors = { ...emptyErrors };
        let valid = true;

        const ma = formData.maGiangVien?.trim() ?? "";
        if (!ma) {
            formErrors.maGiangVien = "Mã giảng viên không được để trống";
            valid = false;
        }

        const hoTen = formData.hoTen?.trim() ?? "";
        if (!hoTen) {
            formErrors.hoTen = "Họ tên không được để trống";
            valid = false;
        }

        const ngaySinh = formData.ngaySinh?.trim() ?? "";
        if (!ngaySinh) {
            formErrors.ngaySinh = "Ngày sinh không được để trống";
            valid = false;
        } else {
            const d = new Date(ngaySinh);
            if (isNaN(d.getTime())) {
                formErrors.ngaySinh = "Ngày sinh không hợp lệ";
                valid = false;
            }
        }

        const email = formData.email?.trim() ?? "";
        if (!email) {
            formErrors.email = "Email không được để trống";
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            formErrors.email = "Email không đúng định dạng (VD: email@domain.com)";
            valid = false;
        }

        const sdtRaw = formData.sdt?.trim() ?? "";
        if (!sdtRaw) {
            formErrors.sdt = "Số điện thoại không được để trống";
            valid = false;
        } else {
            const sdtCleaned = sdtRaw.replace(/[\s\-.]/g, "");
            const vnPhoneRegex = /^(\+84|84|0)?[3-9]\d{8}$/;
            if (!vnPhoneRegex.test(sdtCleaned)) {
                formErrors.sdt = "Số điện thoại không đúng định dạng (VD: 0123456789 hoặc +84912345678)";
                valid = false;
            }
        }

        const gioiTinh = formData.gioiTinh?.trim() ?? "";
        if (!gioiTinh || !["NAM", "NU"].includes(gioiTinh)) {
            formErrors.gioiTinh = "Vui lòng chọn giới tính (Nam hoặc Nữ)";
            valid = false;
        }

        const diaChi = formData.diaChi?.trim() ?? "";
        if (!diaChi) {
            formErrors.diaChi = "Địa chỉ không được để trống";
            valid = false;
        }

        return { valid, formErrors };
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const isRowExpanded = (id: number) => expandedRows.includes(id);

    // Create
    const handleCreate = async () => {
        const { valid, formErrors } = validateForm();
        if (!valid) {
            setErrors(formErrors);
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/giang-vien`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maGiangVien: formData.maGiangVien.trim(),
                    hoTen: formData.hoTen.trim(),
                    ngaySinh: formData.ngaySinh,
                    email: formData.email.trim(),
                    sdt: formData.sdt.trim(),
                    gioiTinh: formData.gioiTinh,
                    diaChi: formData.diaChi.trim(),
                }),
            });

            setIsCreateModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm giảng viên thành công");
                resetForm();
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm mới thất bại");
            }
        } catch (err) {
            setIsCreateModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm giảng viên");
        }
    };

    // Update
    const handleUpdate = async () => {
        if (!editingGiangVien) return;

        const { valid, formErrors } = validateForm();
        if (!valid) {
            setErrors(formErrors);
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/danh-muc/giang-vien/${editingGiangVien.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maGiangVien: formData.maGiangVien.trim(),
                        hoTen: formData.hoTen.trim(),
                        ngaySinh: formData.ngaySinh,
                        email: formData.email.trim(),
                        sdt: formData.sdt.trim(),
                        gioiTinh: formData.gioiTinh,
                        diaChi: formData.diaChi.trim(),
                    }),
                }
            );

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật giảng viên thành công");
                resetForm();
                setEditingGiangVien(null);
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        } finally {
            setIsEditModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Delete
    const confirmDelete = async () => {
        if (!deletingGiangVien) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/danh-muc/giang-vien/${deletingGiangVien.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa giảng viên thành công");
                setDeletingGiangVien(null);
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        }
    };

    const handleUnassignMonHoc = async () => {
        if (!unassignData) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/danh-muc/giang-vien/${unassignData.giangVienId}/phan-cong-mon-hoc/${unassignData.monHocId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsUnassignModalOpen(false);
            setUnassignData(null);

            if (res.ok) {
                showAlert("success", "Thành công", `Đã hủy phân công môn học "${unassignData.tenMonHoc}" cho giảng viên`);
                // Refresh lại danh sách
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Hủy phân công thất bại");
            }
        } catch (err) {
            setIsUnassignModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi hủy phân công");
        } finally {
            setIsUnassignModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openUnassignModal = (giangVienId: number, monHocId: number, tenMonHoc: string, hoTen: string) => {
        setUnassignData({ giangVienId, monHocId, tenMonHoc, hoTen });
        setIsUnassignModalOpen(true);
    };

    // Mở modal phân công môn học cho một giảng viên
    const openPhanCongMonHocModal = (giangVien: GiangVien) => {
        setPhanCongGiangVien(giangVien);
        setSelectedMonHocIdsForPhanCong([]);
        setIsPhanCongModalOpen(true);
        setSelectedMonHocDetailId("");
    };

    const closePhanCongMonHocModal = () => {
        setIsPhanCongModalOpen(false);
        setPhanCongGiangVien(null);
        setSelectedMonHocIdsForPhanCong([]);
        setIsPhanCongLoading(false);
        setSelectedMonHocDetailId("");
    };

    // Xử lý phân công môn học cho giảng viên
    const handlePhanCongMonHoc = async () => {
        if (!phanCongGiangVien) return;
        if (selectedMonHocIdsForPhanCong.length === 0) {
            showAlert("warning", "Cảnh báo", "Vui lòng chọn ít nhất một môn học để phân công");
            return;
        }

        setIsPhanCongLoading(true);
        const accessToken = getCookie("access_token");
        let success = 0;
        let failed = 0;

        for (const monHocId of selectedMonHocIdsForPhanCong) {
            try {
                const res = await fetch(`${ENV.BACKEND_URL}/danh-muc/giang-vien/phancongmonhoc`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        giangVienId: phanCongGiangVien.id,
                        monHocId: Number(monHocId),
                    }),
                });

                if (res.ok) {
                    success++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            }
        }

        const tenGV = phanCongGiangVien.hoTen;

        setIsPhanCongLoading(false);
        setIsPhanCongModalOpen(false);
        setSelectedMonHocIdsForPhanCong([]);
        setPhanCongGiangVien(null);
        setSelectedMonHocDetailId("");

        if (success > 0 && failed === 0) {
            showAlert("success", "Thành công", `Đã phân công ${success} môn học cho giảng viên "${tenGV}"`);
        } else if (success > 0 && failed > 0) {
            showAlert(
                "warning",
                "Hoàn tất với cảnh báo",
                `Phân công thành công ${success} môn, thất bại ${failed} môn cho giảng viên "${tenGV}"`
            );
        } else {
            showAlert("error", "Lỗi", `Không thể phân công môn học cho giảng viên "${tenGV}"`);
        }

        fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
    };

    // Mở modal tạo tài khoản
    const openCreateAccountModal = (giangVien: GiangVien) => {
        setCreatingAccountGiangVien(giangVien);
        setIsCreateAccountModalOpen(true);
    };

    // Xử lý tạo tài khoản
    const handleCreateAccount = async () => {
        if (!creatingAccountGiangVien) return;

        setIsCreatingAccount(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/auth/users/giang-vien/${creatingAccountGiangVien.id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsCreateAccountModalOpen(false);
            setCreatingAccountGiangVien(null);

            if (res.ok) {
                showAlert(
                    "success",
                    "Thành công",
                    `Đã tạo tài khoản cho giảng viên "${creatingAccountGiangVien.hoTen}" với mật khẩu mặc định:  123456`
                );
                // Refresh lại danh sách để cập nhật trạng thái nguoiDung
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo tài khoản thất bại");
            }
        } catch (err) {
            setIsCreateAccountModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo tài khoản");
        } finally {
            setIsCreatingAccount(false);
        }
    };

    // Xử lý tạo tài khoản hàng loạt
    const handleBulkCreateAccounts = async () => {
        setIsBulkCreatingAccounts(true);
        setBulkCreateResult(null);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/auth/users/giang-vien/auto-create-accounts`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const result = await res.json();

            if (res.ok) {
                setBulkCreateResult(result);
                // Refresh lại danh sách để cập nhật trạng thái nguoiDung
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                showAlert("error", "Lỗi", result.message || "Tạo tài khoản hàng loạt thất bại");
                setIsBulkCreateAccountModalOpen(false);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo tài khoản hàng loạt");
            setIsBulkCreateAccountModalOpen(false);
        } finally {
            setIsBulkCreatingAccounts(false);
        }
    };

    // Đóng modal và reset state
    const closeBulkCreateModal = () => {
        setIsBulkCreateAccountModalOpen(false);
        setBulkCreateResult(null);
    };

    // ==================== CHECKBOX & BULK DELETE HANDLERS ====================

    const currentPageIds = giangViens.map(gv => gv.id);
    const selectedOnCurrentPage = selectedGiangVienIds.filter(id => currentPageIds.includes(id));
    const isAllSelected = giangViens.length > 0 && selectedOnCurrentPage.length === giangViens.length;
    const isIndeterminate = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < giangViens.length;

    // Toggle chọn tất cả trên trang hiện tại (merge với selection từ trang khác)
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const idsToAdd = giangViens.map(gv => gv.id);
            const newMap: Record<number, { maGiangVien: string; hoTen: string; email?: string }> = { ...selectedGiangVienMap };
            giangViens.forEach(gv => {
                newMap[gv.id] = { maGiangVien: gv.maGiangVien, hoTen: gv.hoTen, email: gv.email };
            });
            setSelectedGiangVienIds(prev => [...new Set([...prev, ...idsToAdd])]);
            setSelectedGiangVienMap(newMap);
        } else {
            const idsToRemove = new Set(currentPageIds);
            setSelectedGiangVienIds(prev => prev.filter(id => !idsToRemove.has(id)));
            setSelectedGiangVienMap(prev => {
                const next = { ...prev };
                idsToRemove.forEach(id => delete next[id]);
                return next;
            });
        }
    };

    // Toggle chọn một giảng viên
    const handleSelectOne = (giangVienId: number, checked: boolean, gv?: GiangVien) => {
        if (checked) {
            setSelectedGiangVienIds(prev => (prev.includes(giangVienId) ? prev : [...prev, giangVienId]));
            if (gv) {
                setSelectedGiangVienMap(prev => ({
                    ...prev,
                    [giangVienId]: { maGiangVien: gv.maGiangVien, hoTen: gv.hoTen, email: gv.email },
                }));
            }
        } else {
            setSelectedGiangVienIds(prev => prev.filter(id => id !== giangVienId));
            setSelectedGiangVienMap(prev => {
                const next = { ...prev };
                delete next[giangVienId];
                return next;
            });
        }
    };

    const isSelected = (giangVienId: number) => selectedGiangVienIds.includes(giangVienId);

    const clearSelection = () => {
        setSelectedGiangVienIds([]);
        setSelectedGiangVienMap({});
    };

    // Mở modal xóa hàng loạt
    const openBulkDeleteModal = () => {
        if (selectedGiangVienIds.length === 0) {
            showAlert("warning", "Cảnh báo", "Vui lòng chọn ít nhất một giảng viên để xóa");
            return;
        }
        setBulkDeleteResults(null);
        setIsBulkDeleteModalOpen(true);
    };

    // Đóng modal xóa hàng loạt
    const closeBulkDeleteModal = () => {
        setIsBulkDeleteModalOpen(false);
        setBulkDeleteResults(null);
        if (bulkDeleteResults) {
            clearSelection();
            fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
        }
    };

    // Xử lý xóa hàng loạt (theo danh sách đã chọn trên mọi trang)
    const handleBulkDelete = async () => {
        setIsBulkDeleting(true);
        const results: Array<{
            id: number;
            maGiangVien: string;
            hoTen: string;
            status: "success" | "failed";
            message: string;
        }> = [];

        const accessToken = getCookie("access_token");
        const displayInfo = (id: number) => selectedGiangVienMap[id] ?? { maGiangVien: `#${id}`, hoTen: "N/A", email: "—" };

        for (const giangVienId of selectedGiangVienIds) {
            const { maGiangVien, hoTen } = displayInfo(giangVienId);
            try {
                const res = await fetch(
                    `${ENV.BACKEND_URL}/danh-muc/giang-vien/${giangVienId}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (res.ok) {
                    results.push({
                        id: giangVienId,
                        maGiangVien,
                        hoTen,
                        status: "success",
                        message: "Xóa thành công",
                    });
                } else {
                    const err = await res.json();
                    results.push({
                        id: giangVienId,
                        maGiangVien,
                        hoTen,
                        status: "failed",
                        message: err.message || "Xóa thất bại",
                    });
                }
            } catch (err) {
                results.push({
                    id: giangVienId,
                    maGiangVien,
                    hoTen,
                    status: "failed",
                    message: "Lỗi kết nối",
                });
            }
        }

        setBulkDeleteResults(results);
        setIsBulkDeleting(false);
    };

    // Đếm số thành công/thất bại
    const getDeleteSummary = () => {
        if (!bulkDeleteResults) return { success: 0, failed: 0 };
        return {
            success: bulkDeleteResults.filter(r => r.status === "success").length,
            failed: bulkDeleteResults.filter(r => r.status === "failed").length,
        };
    };

    // Open modals
    const openEditModal = (giangVien: GiangVien) => {
        setEditingGiangVien(giangVien);
        // Giới tính chỉ chấp nhận Nam/Nữ; nếu đang lưu "Không xác định" thì để trống để user chọn lại
        const gioiTinhForm = (giangVien.gioiTinh === "NAM" || giangVien.gioiTinh === "NU")
            ? giangVien.gioiTinh
            : "";
        setFormData({
            maGiangVien: giangVien.maGiangVien,
            hoTen: giangVien.hoTen,
            ngaySinh: giangVien.ngaySinh,
            email: giangVien.email,
            sdt: giangVien.sdt,
            gioiTinh: gioiTinhForm,
            diaChi: giangVien.diaChi,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (giangVien: GiangVien) => {
        setDeletingGiangVien(giangVien);
        setIsDeleteModalOpen(true);
    };

    const openDetailModal = (giangVien: GiangVien) => {
        setViewingGiangVien(giangVien);
        setIsDetailModalOpen(true);
    };

    // Delete Confirm Modal Component
    const DeleteConfirmModal = () => (
        <div className="p-6 sm: p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa giảng viên
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa giảng viên{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingGiangVien?.hoTen}
                </span>{" "}
                (Mã:  {deletingGiangVien?.maGiangVien})?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingGiangVien(null);
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
            <PageBreadcrumb pageTitle="Quản lý Giảng Viên & Phân công Môn học" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Alert */}
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

                {/* Search và Button Thêm */}
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
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
                                placeholder="Tìm kiếm giảng viên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {/* Button Cấp tài khoản hàng loạt - THÊM MỚI */}
                        {selectedGiangVienIds.length > 0 && (
                            <Button
                                variant="danger"
                                onClick={openBulkDeleteModal}
                                startIcon={<FontAwesomeIcon icon={faTrashCan} />}
                            >
                                Xóa ({selectedGiangVienIds.length})
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            onClick={() => setIsBulkCreateAccountModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faUsersGear} />}
                        >
                            Cấp tài khoản hàng loạt
                        </Button>
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
                            Thêm Giảng Viên
                        </Button>
                    </div>
                </div>

                {/* Filter theo Môn học */}
                <div className="mb-6">
                    <Label className="block mb-2">Lọc theo Môn học</Label>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 sm:max-w-md">
                            <SearchableSelect
                                options={monHocOptions.map((mon) => ({
                                    value: mon.id.toString(),
                                    label: mon.maMonHoc,
                                    secondary: mon.tenMonHoc,
                                }))}
                                placeholder="Tất cả môn học"
                                onChange={(value) =>
                                    setSelectedFilterMonHocId(value ? Number(value) : "")
                                }
                                defaultValue={
                                    selectedFilterMonHocId ? selectedFilterMonHocId.toString() : ""
                                }
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Nhập mã hoặc tên môn học..."
                                disabled={onlyUnassigned}
                            />
                        </div>

                        <Button
                            onClick={handleFilter}
                            className="w-full sm:w-auto h-11"
                            disabled={onlyUnassigned}
                        >
                            Lọc
                        </Button>
                    </div>

                    {/* Bộ lọc giảng viên chưa được phân công bất kỳ môn học nào */}
                    <div className="mt-4">
                        <Checkbox
                            checked={onlyUnassigned}
                            onChange={async (checked) => {
                                setOnlyUnassigned(checked);
                                setCurrentPage(1);
                                if (checked) {
                                    await fetchGiangViensChuaPhanCong(searchKeyword.trim());
                                } else {
                                    await fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
                                }
                            }}
                            label={
                                <span className="flex items-center gap-2">
                                    <span className="font-normal">
                                        Chỉ hiển thị giảng viên{" "}
                                        <span className="font-medium">chưa được phân công môn học</span>
                                    </span>
                                    {isLoadingUnassigned && (
                                        <FontAwesomeIcon
                                            icon={faSpinner}
                                            className="h-4 w-4 animate-spin text-gray-400"
                                        />
                                    )}
                                </span>
                            }
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[900px]">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[5%_5%_25%_25%_10%_15%_15%]">
                                        <TableCell
                                            isHeader
                                            className="px-3 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                onChange={handleSelectAll}
                                                disabled={giangViens.length === 0}
                                            />
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-3 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            <span className="sr-only">Expand column</span>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                        >
                                            Mã GV
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                        >
                                            Họ và Tên
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Giới tính
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Số điện thoại
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                {/* Table Body */}
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                    {giangViens.map((gv) => (
                                        <React.Fragment key={gv.id}>
                                            {/* Main Row */}
                                            <TableRow
                                                className={`grid grid-cols-[5%_5%_25%_25%_10%_15%_15%] items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${isRowExpanded(gv.id) ? "bg-gray-50 dark:bg-white/[0.02]" : ""
                                                    } ${isSelected(gv.id) ? "bg-brand-50 dark:bg-brand-900/10" : ""}`}
                                            >
                                                {/* Checkbox */}
                                                <TableCell className="px-3 py-4 flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected(gv.id)}
                                                        onChange={(checked) => handleSelectOne(gv.id, checked, gv)}
                                                    />
                                                </TableCell>
                                                <TableCell className="px-3 py-4 flex items-center justify-center">
                                                    <button
                                                        onClick={() => toggleRow(gv.id)}
                                                        disabled={gv.monHocGiangViens.length === 0}
                                                        className={`flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors ${gv.monHocGiangViens.length > 0
                                                            ? "hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                                            : "opacity-30 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        <ChevronIcon isOpen={isRowExpanded(gv.id)} />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center text-gray-800 dark:text-white/90">
                                                    <div className="flex items-center gap-2">
                                                        {gv.maGiangVien}
                                                        {gv.monHocGiangViens.length > 0 && (
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                                                                {gv.monHocGiangViens.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center text-gray-800 dark:text-white/90">
                                                    {gv.hoTen}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center">
                                                    <Badge
                                                        variant="solid"
                                                        color={getGioiTinhColor(gv.gioiTinh)}
                                                    >
                                                        {getGioiTinhLabel(gv.gioiTinh)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    {gv.sdt}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(gv.id)}
                                                            className="dropdown-toggle flex items-center gap-1.5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === gv.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === gv.id}
                                                            onClose={closeDropdown}
                                                            className="w-56"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDetailModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openEditModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faPenToSquare} className="mr-2 w-4" />
                                                                    Chỉnh sửa
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openPhanCongMonHocModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTableColumns} className="mr-2 w-4" />
                                                                    Phân công môn học
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    disabled={gv.nguoiDung !== null}
                                                                    onClick={() => {
                                                                        if (gv.nguoiDung === null) {
                                                                            openCreateAccountModal(gv);
                                                                        }
                                                                    }}
                                                                    className={gv.nguoiDung !== null ? "opacity-50 cursor-not-allowed" : ""}
                                                                >
                                                                    <FontAwesomeIcon icon={faUserPlus} className="mr-2 w-4" />
                                                                    {gv.nguoiDung !== null ? "Đã có tài khoản" : "Tạo tài khoản"}
                                                                </DropdownItem>
                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="mr-2 w-4" />
                                                                    Xóa
                                                                </DropdownItem>
                                                            </div>
                                                        </Dropdown>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Sub-Rows (Môn học) */}
                                            {isRowExpanded(gv.id) && gv.monHocGiangViens.length > 0 && (
                                                <>
                                                    {/* Sub-Table Header */}
                                                    <TableRow className="grid grid-cols-[5%_15%_25%_12%_18%_25%] items-center bg-gray-100/80 dark:bg-white/[0.04] border-t border-gray-200 dark:border-white/[0.05]">
                                                        <TableCell className="px-3 py-2.5">
                                                            <span></span>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            Mã Môn
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            Tên Môn Học
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Loại Môn
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Số Tín Chỉ
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Hành động
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Sub-Rows Data */}
                                                    {gv.monHocGiangViens.map((monHocGV, index) => (
                                                        <TableRow
                                                            key={monHocGV.id}
                                                            className={`grid grid-cols-[5%_15%_25%_12%_18%_25%] items-center bg-gray-50/50 dark:bg-white/[0.01] ${index === gv.monHocGiangViens.length - 1
                                                                ? "border-b border-gray-200 dark:border-white/[0.05]"
                                                                : ""
                                                                }`}
                                                        >
                                                            <TableCell className="px-3 py-3 text-center">
                                                                {/* Connector line */}
                                                                <div className="flex items-center justify-center h-full">
                                                                    <div className="flex flex-col items-center">
                                                                        <div
                                                                            className={`w-px bg-gray-300 dark:bg-white/[0.15] ${index === 0 ? "h-1/2" : "h-full"
                                                                                }`}
                                                                        />
                                                                        <div className="w-2 h-2 rounded-full bg-brand-400 dark:bg-brand-500" />
                                                                        {index !== gv.monHocGiangViens.length - 1 && (
                                                                            <div className="w-px h-1/2 bg-gray-300 dark:bg-white/[0.15]" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-700 dark:text-gray-200">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{monHocGV.monHoc.maMonHoc}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                                                <span className="text-sm">{monHocGV.monHoc.tenMonHoc}</span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                <Badge
                                                                    variant="solid"
                                                                    color={getLoaiMonColor(monHocGV.monHoc.loaiMon)}
                                                                >
                                                                    {getLoaiMonLabel(monHocGV.monHoc.loaiMon)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                                                                <span className="text-sm font-medium">{monHocGV.monHoc.soTinChi} tín chỉ</span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        openUnassignModal(
                                                                            gv.id,
                                                                            monHocGV.monHoc.id,
                                                                            monHocGV.monHoc.tenMonHoc,
                                                                            gv.hoTen
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

                {/* Table Footer Summary */}
                <div className="mt-4 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tổng số {giangViens.length} giảng viên với{" "}
                            {giangViens.reduce(
                                (acc, gv) => acc + gv.monHocGiangViens.length,
                                0
                            )}{" "}
                            môn học được phân công
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setExpandedRows(giangViens.map((gv) => gv.id))}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark: bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
                            >
                                Mở rộng tất cả
                            </button>
                            <button
                                onClick={() => setExpandedRows([])}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark: bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark: hover:bg-white/[0.05] transition-colors"
                            >
                                Thu gọn tất cả
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Thêm mới */}
            <GiangVienModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                isEdit={false}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleCreate}
                errors={errors}
            />

            {/* Modal Sửa */}
            <GiangVienModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingGiangVien(null);
                }}
                isEdit={true}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleUpdate}
                errors={errors}
            />

            {/* Modal Chi tiết */}
            <ChiTietModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setViewingGiangVien(null);
                }}
                giangVien={viewingGiangVien}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingGiangVien(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            {/* Modal Hủy phân công môn học */}
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
                        Xác nhận hủy phân công
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn <strong>hủy phân công</strong> môn học{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {unassignData?.tenMonHoc}
                        </span>{" "}
                        khỏi giảng viên{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {unassignData?.hoTen}
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
                        <Button variant="primary" onClick={handleUnassignMonHoc}>
                            Hủy phân công
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Phân công môn học cho giảng viên */}
            <Modal
                isOpen={isPhanCongModalOpen}
                onClose={() => {
                    if (!isPhanCongLoading) {
                        closePhanCongMonHocModal();
                    }
                }}
                className="max-w-2xl"
            >
                <div className="p-6 sm:p-8 max-h-[85vh] overflow-y-auto">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faTableColumns} className="text-brand-500" />
                        Phân công môn học cho giảng viên
                    </h3>

                    {phanCongGiangVien && (
                        <>
                            {/* Thông tin giảng viên */}
                            <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
                                <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                                    Thông tin giảng viên
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Mã GV:</span>{" "}
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {phanCongGiangVien.maGiangVien}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Họ tên:</span>{" "}
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {phanCongGiangVien.hoTen}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Email:</span>{" "}
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {phanCongGiangVien.email}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Số môn đã phân công:</span>{" "}
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {phanCongGiangVien.monHocGiangViens.length}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Chọn môn học phân công */}
                            <div className="mb-6 space-y-4">
                                <div>
                                    <Label className="block mb-2">Chọn môn học để phân công (có thể chọn nhiều)</Label>
                                    <MultiSelectCustom
                                        options={monHocOptions.map((mh) => ({
                                            value: mh.id.toString(),
                                            label: mh.maMonHoc,
                                            secondary: mh.tenMonHoc,
                                        }))}
                                        placeholder="Chọn các môn học"
                                        onChange={(values) => {
                                            setSelectedMonHocIdsForPhanCong(values);
                                            // Nếu môn chi tiết hiện tại không còn trong danh sách đã chọn thì reset
                                            if (selectedMonHocDetailId && !values.includes(selectedMonHocDetailId)) {
                                                setSelectedMonHocDetailId("");
                                            }
                                        }}
                                        defaultValue={selectedMonHocIdsForPhanCong}
                                        showSecondary={true}
                                        maxDisplayOptions={monHocOptions.length > 0 ? monHocOptions.length : 10}
                                        maxDisplayTags={3}
                                        searchPlaceholder="Tìm môn học..."
                                        selectAllLabel="Chọn tất cả môn học"
                                        showSelectAll={true}
                                        disabledValues={phanCongGiangVien.monHocGiangViens.map((mh) =>
                                            mh.monHoc.id.toString()
                                        )}
                                    />
                                    {selectedMonHocIdsForPhanCong.length > 0 && (
                                        <div className="mt-2 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-sm text-brand-700 dark:text-brand-300">
                                            Đã chọn{" "}
                                            <span className="font-semibold">
                                                {selectedMonHocIdsForPhanCong.length} môn học
                                            </span>{" "}
                                            để phân công.
                                        </div>
                                    )}
                                </div>

                                {/* Searchable select các môn sẽ phân công */}
                                {selectedMonHocIdsForPhanCong.length > 0 && (
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                        <Label className="block mb-2">Chọn môn học để xem chi tiết</Label>
                                        <SearchableSelect
                                            options={monHocOptions
                                                .filter((mh) =>
                                                    selectedMonHocIdsForPhanCong.includes(mh.id.toString())
                                                )
                                                .map((mh) => ({
                                                    value: mh.id.toString(),
                                                    label: mh.maMonHoc,
                                                    secondary: mh.tenMonHoc,
                                                }))}
                                            placeholder="Chọn một môn học trong danh sách đã chọn..."
                                            onChange={(value: string) => setSelectedMonHocDetailId(value || "")}
                                            defaultValue={selectedMonHocDetailId}
                                            showSecondary={true}
                                            maxDisplayOptions={10}
                                            searchPlaceholder="Tìm môn học theo mã hoặc tên..."
                                        />

                                        {/* Khối hiển thị chi tiết môn học */}
                                        {selectedMonHocDetailId && (
                                            (() => {
                                                const detail = monHocOptions.find(
                                                    (mh) => mh.id.toString() === selectedMonHocDetailId
                                                );
                                                if (!detail) return null;
                                                return (
                                                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 p-4 text-sm">
                                                        <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                                            Thông tin chi tiết môn học
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    Mã môn:
                                                                </span>{" "}
                                                                <span className="font-medium text-gray-800 dark:text-white">
                                                                    {detail.maMonHoc}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    Tên môn học:
                                                                </span>{" "}
                                                                <span className="font-medium text-gray-800 dark:text-white">
                                                                    {detail.tenMonHoc}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    Loại môn:
                                                                </span>{" "}
                                                                <Badge
                                                                    variant="solid"
                                                                    color={getLoaiMonColor(detail.loaiMon)}
                                                                >
                                                                    {getLoaiMonLabel(detail.loaiMon)}
                                                                </Badge>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">
                                                                    Số tín chỉ:
                                                                </span>{" "}
                                                                <span className="font-medium text-gray-800 dark:text-white">
                                                                    {detail.soTinChi}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {detail.moTa && (
                                                            <div className="mt-3">
                                                                <span className="text-gray-500 dark:text-gray-400 block mb-1">
                                                                    Mô tả:
                                                                </span>
                                                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                                    {detail.moTa}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Danh sách môn đã phân công hiện tại */}
                            <div className="mb-6">
                                <Label className="block mb-2">Các môn học đã được phân công hiện tại</Label>
                                {phanCongGiangVien.monHocGiangViens.length > 0 ? (
                                    <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                        Mã môn
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">
                                                        Tên môn học
                                                    </th>
                                                    <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 font-medium">
                                                        Số tín chỉ
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                {phanCongGiangVien.monHocGiangViens.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                                                        <td className="px-3 py-2 text-gray-800 dark:text-white">
                                                            {item.monHoc.maMonHoc}
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-700 dark:text-gray-200">
                                                            {item.monHoc.tenMonHoc}
                                                        </td>
                                                        <td className="px-3 py-2 text-center text-gray-800 dark:text-white">
                                                            {item.monHoc.soTinChi}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Giảng viên hiện chưa được phân công môn học nào.
                                    </p>
                                )}
                            </div>

                            {/* Tóm tắt */}
                            {selectedMonHocIdsForPhanCong.length > 0 && (
                                <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 text-sm text-gray-700 dark:text-gray-300">
                                    Phân công giảng viên{" "}
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {phanCongGiangVien.hoTen}
                                    </span>{" "}
                                    giảng dạy{" "}
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {selectedMonHocIdsForPhanCong.length} môn học
                                    </span>
                                    .
                                </div>
                            )}

                            <div className="mt-4 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (!isPhanCongLoading) {
                                            closePhanCongMonHocModal();
                                        }
                                    }}
                                    disabled={isPhanCongLoading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handlePhanCongMonHoc}
                                    disabled={
                                        isPhanCongLoading || selectedMonHocIdsForPhanCong.length === 0
                                    }
                                >
                                    {isPhanCongLoading
                                        ? "Đang phân công..."
                                        : `Xác nhận phân công (${selectedMonHocIdsForPhanCong.length} môn)`}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
            {/* Modal Tạo tài khoản */}
            <Modal
                isOpen={isCreateAccountModalOpen}
                onClose={() => {
                    if (!isCreatingAccount) {
                        setIsCreateAccountModalOpen(false);
                        setCreatingAccountGiangVien(null);
                    }
                }}
                className="max-w-md"
            >
                <div className="p-6 sm: p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserPlus} className="text-brand-500" />
                        Tạo tài khoản hệ thống
                    </h3>

                    {/* Thông tin giảng viên */}
                    {creatingAccountGiangVien && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Mã GV:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountGiangVien.maGiangVien}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Họ tên:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountGiangVien.hoTen}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountGiangVien.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thông tin tài khoản sẽ tạo */}
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                            <strong>Thông tin tài khoản sẽ được tạo: </strong>
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-disc">
                            <li>Tên đăng nhập:  <strong>{creatingAccountGiangVien?.maGiangVien}</strong></li>
                            <li>Vai trò:  <strong>Giảng viên</strong></li>
                            <li>Mật khẩu mặc định: <strong>123456</strong></li>
                        </ul>
                    </div>

                    {/* Cảnh báo */}
                    <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            ⚠️ Vui lòng thông báo cho giảng viên đổi mật khẩu sau khi đăng nhập lần đầu.
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Bạn có chắc chắn muốn tạo tài khoản hệ thống cho giảng viên{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {creatingAccountGiangVien?.hoTen}
                        </span>?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateAccountModalOpen(false);
                                setCreatingAccountGiangVien(null);
                            }}
                            disabled={isCreatingAccount}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateAccount}
                            disabled={isCreatingAccount}
                            startIcon={!isCreatingAccount ? <FontAwesomeIcon icon={faUserPlus} /> : undefined}
                        >
                            {isCreatingAccount ? "Đang tạo..." : "Xác nhận tạo"}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Import Excel */}
            <ImportGiangVienExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onSuccess={() => {
                    fetchGiangViens(currentPage, searchKeyword, selectedFilterMonHocId);
                }}
                showAlert={showAlert}
            />

            {/* Modal Cấp tài khoản hàng loạt */}
            <Modal
                isOpen={isBulkCreateAccountModalOpen}
                onClose={closeBulkCreateModal}
                className="max-w-xl"
            >
                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-lg dark:bg-emerald-600">
                            <FontAwesomeIcon icon={faUsersGear} className="text-xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Cấp tài khoản hàng loạt
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tạo tài khoản cho tất cả giảng viên chưa có tài khoản
                            </p>
                        </div>
                    </div>

                    {/* Nội dung trước khi tạo */}
                    {!bulkCreateResult && !isBulkCreatingAccounts && (
                        <>
                            {/* Thông tin tài khoản sẽ tạo */}
                            <div className="mb-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:border-emerald-800/50 dark:from-emerald-900/20 dark:to-teal-900/20">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800/50">
                                                <FontAwesomeIcon
                                                    icon={faUserPlus}
                                                    className="text-lg text-emerald-600 dark:text-emerald-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                                                Thông tin tài khoản sẽ được tạo
                                            </h4>
                                            <ul className="text-sm text-emerald-700/80 dark:text-emerald-300/70 space-y-1.5">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>Tên đăng nhập: <strong>Mã giảng viên</strong></span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>Mật khẩu mặc định: <strong>123456</strong></span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>Vai trò: <strong>Giảng viên</strong></span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cảnh báo */}
                            <div className="mb-6 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:border-amber-800/50 dark:from-amber-900/20 dark:to-yellow-900/20">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/50">
                                                <FontAwesomeIcon
                                                    icon={faCircleExclamation}
                                                    className="text-lg text-amber-600 dark:text-amber-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                                Lưu ý quan trọng
                                            </h4>
                                            <p className="text-sm text-amber-700/80 dark:text-amber-300/70">
                                                Vui lòng thông báo cho các giảng viên đổi mật khẩu sau khi đăng nhập lần đầu để đảm bảo an toàn tài khoản.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                                Hệ thống sẽ tự động tạo tài khoản cho <strong>tất cả giảng viên chưa có tài khoản</strong>.
                                <br />Giảng viên đã có tài khoản sẽ được bỏ qua.
                            </p>
                        </>
                    )}

                    {/* Loading state */}
                    {isBulkCreatingAccounts && (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full border-4 border-emerald-100 dark:border-emerald-900/50"></div>
                                <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <FontAwesomeIcon
                                        icon={faUsersGear}
                                        className="text-2xl text-emerald-500"
                                    />
                                </div>
                            </div>
                            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                                Đang tạo tài khoản...
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Vui lòng đợi trong giây lát
                            </p>
                        </div>
                    )}

                    {/* Kết quả sau khi tạo */}
                    {bulkCreateResult && (
                        <>
                            {/* Summary */}
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 text-center border border-gray-200 dark:border-gray-700">
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {bulkCreateResult.totalGiangVien}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tổng xử lý</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {bulkCreateResult.success}
                                    </p>
                                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">Thành công</p>
                                </div>
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-center border border-red-200 dark:border-red-800">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {bulkCreateResult.failed}
                                    </p>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70">Thất bại</p>
                                </div>
                            </div>

                            {/* Success message */}
                            {bulkCreateResult.success > 0 && (
                                <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={faCircleCheck}
                                            className="text-emerald-500"
                                        />
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                            Đã tạo thành công <strong>{bulkCreateResult.success}</strong> tài khoản giảng viên
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error list */}
                            {bulkCreateResult.errors && bulkCreateResult.errors.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={faCircleExclamation}
                                            className="text-red-500"
                                        />
                                        Chi tiết lỗi ({bulkCreateResult.errors.length})
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                                        <table className="w-full text-sm">
                                            <thead className="sticky top-0 bg-red-100 dark:bg-red-900/30">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-red-700 dark:text-red-300 font-medium">Mã GV</th>
                                                    <th className="px-3 py-2 text-left text-red-700 dark:text-red-300 font-medium">Lỗi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                                                {bulkCreateResult.errors.map((err, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 text-red-800 dark:text-red-200 font-medium">
                                                            {err.maGiangVien}
                                                        </td>
                                                        <td className="px-3 py-2 text-red-600 dark:text-red-400">
                                                            {err.error}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        {!bulkCreateResult ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={closeBulkCreateModal}
                                    disabled={isBulkCreatingAccounts}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleBulkCreateAccounts}
                                    disabled={isBulkCreatingAccounts}
                                    startIcon={
                                        isBulkCreatingAccounts
                                            ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                            : <FontAwesomeIcon icon={faUsersGear} />
                                    }
                                >
                                    {isBulkCreatingAccounts ? "Đang xử lý..." : "Xác nhận tạo tài khoản"}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={closeBulkCreateModal}
                            >
                                Đóng
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
            {/* Modal Xóa hàng loạt */}
            <Modal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => {
                    if (!isBulkDeleting) {
                        closeBulkDeleteModal();
                    }
                }}
                className="max-w-4xl"
            >
                <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark: bg-red-900/30">
                            <FontAwesomeIcon
                                icon={faTrashCan}
                                className="text-2xl text-red-600 dark:text-red-400"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Xóa hàng loạt giảng viên
                            </h3>
                            <p className="text-sm text-gray-500 dark: text-gray-400">
                                {bulkDeleteResults
                                    ? "Kết quả xóa giảng viên"
                                    : `Đã chọn ${selectedGiangVienIds.length} giảng viên`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Nội dung trước khi xóa */}
                    {!bulkDeleteResults && !isBulkDeleting && (
                        <>
                            {/* Danh sách giảng viên sẽ xóa (tất cả đã chọn, kể cả từ các trang khác) */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Danh sách giảng viên sẽ bị xóa ({selectedGiangVienIds.length}):
                                </h4>
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">STT</th>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Mã GV</th>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Họ tên</th>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {selectedGiangVienIds.map((giangVienId, index) => {
                                                const info = selectedGiangVienMap[giangVienId] ?? { maGiangVien: `#${giangVienId}`, hoTen: "N/A", email: "—" };
                                                return (
                                                    <tr key={giangVienId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-white font-medium">{info.maGiangVien}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-white">{info.hoTen}</td>
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{info.email ?? "—"}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Cảnh báo */}
                            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <FontAwesomeIcon
                                                icon={faTriangleExclamation}
                                                className="text-lg text-red-600 dark: text-red-400 mt-0.5"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                                                Cảnh báo quan trọng
                                            </h4>
                                            <ul className="text-sm text-red-700/80 dark:text-red-300/70 space-y-1 list-disc list-inside">
                                                <li>Hành động này <strong>không thể hoàn tác</strong></li>
                                                <li>Tất cả dữ liệu liên quan đến giảng viên sẽ bị xóa</li>
                                                <li>Bao gồm:  phân công môn học, tài khoản người dùng (nếu có)</li>
                                                <li>Giảng viên đang có lớp học phần sẽ không thể xóa</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin bổ sung */}
                            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <FontAwesomeIcon
                                                icon={faCircleExclamation}
                                                className="text-lg text-amber-600 dark:text-amber-400 mt-0.5"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                                Lưu ý
                                            </h4>
                                            <p className="text-sm text-amber-700/80 dark:text-amber-300/70">
                                                Hệ thống sẽ xóa lần lượt từng giảng viên.  Nếu có giảng viên không thể xóa
                                                (do ràng buộc dữ liệu), hệ thống sẽ bỏ qua và tiếp tục với giảng viên khác.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                                Bạn có chắc chắn muốn xóa <strong>{selectedGiangVienIds.length}</strong> giảng viên đã chọn?
                            </p>
                        </>
                    )}

                    {/* Loading state */}
                    {isBulkDeleting && (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full border-4 border-red-100 dark:border-red-900/50"></div>
                                <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className="text-2xl text-red-500"
                                    />
                                </div>
                            </div>
                            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                                Đang xóa giảng viên...
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Vui lòng đợi trong giây lát
                            </p>
                        </div>
                    )}

                    {/* Kết quả sau khi xóa */}
                    {bulkDeleteResults && (
                        <>
                            {/* Summary */}
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 text-center border border-gray-200 dark: border-gray-700">
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {bulkDeleteResults.length}
                                    </p>
                                    <p className="text-sm text-gray-500 dark: text-gray-400">Tổng xử lý</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {getDeleteSummary().success}
                                    </p>
                                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">Thành công</p>
                                </div>
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-center border border-red-200 dark:border-red-800">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {getDeleteSummary().failed}
                                    </p>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70">Thất bại</p>
                                </div>
                            </div>

                            {/* Success message */}
                            {getDeleteSummary().success > 0 && (
                                <div className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                            icon={faCircleCheck}
                                            className="text-emerald-500"
                                        />
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                            Đã xóa thành công <strong>{getDeleteSummary().success}</strong> giảng viên
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Chi tiết kết quả */}
                            <div className="mb-6">
                                <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFileExcel} className="text-red-500" />
                                    Chi tiết kết quả ({bulkDeleteResults.length})
                                </h4>
                                <div className="overflow-hidden rounded-xl border border-red-200 bg-white dark:border-red-900/30 dark:bg-white/[0.03] max-h-80 overflow-y-auto">
                                    <Table>
                                        {/* Header */}
                                        <TableHeader className="border-b border-red-100 dark:border-red-900/30 top-0 bg-red-50 dark:bg-red-900/10 sticky z-10">
                                            <TableRow className="grid grid-cols-[20%_25%_17%_38%]">
                                                <TableCell
                                                    isHeader
                                                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-center"
                                                >
                                                    Mã GV
                                                </TableCell>

                                                <TableCell
                                                    isHeader
                                                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-left"
                                                >
                                                    Họ tên
                                                </TableCell>

                                                <TableCell
                                                    isHeader
                                                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-center"
                                                >
                                                    Trạng thái
                                                </TableCell>

                                                <TableCell
                                                    isHeader
                                                    className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300 text-xs text-left"
                                                >
                                                    Chi tiết
                                                </TableCell>
                                            </TableRow>
                                        </TableHeader>

                                        {/* Body */}
                                        <TableBody className="divide-y divide-red-100 dark:divide-red-900/30 text-theme-sm">
                                            {bulkDeleteResults.map((result) => (
                                                <TableRow
                                                    key={result.id}
                                                    className={`grid grid-cols-[20%_25%_17%_38%] hover:bg-red-50/50 dark:hover:bg-red-900/5 ${result.status === 'failed'
                                                        ? 'bg-red-50/40 dark:bg-red-900/10'
                                                        : ''
                                                        }`}
                                                >
                                                    {/* Mã GV */}
                                                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-sm text-center font-medium">
                                                        {result.maGiangVien}
                                                    </TableCell>

                                                    {/* Họ tên */}
                                                    <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-sm">
                                                        {result.hoTen}
                                                    </TableCell>

                                                    {/* Trạng thái */}
                                                    <TableCell className="px-4 py-3 text-center text-sm">
                                                        {result.status === 'success' ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                                <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
                                                                Thành công
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                                                                <FontAwesomeIcon icon={faCircleExclamation} className="text-xs" />
                                                                Thất bại
                                                            </span>
                                                        )}
                                                    </TableCell>

                                                    {/* Chi tiết */}
                                                    <TableCell className="px-4 py-3 text-red-600 dark:text-red-400 text-sm">
                                                        {result.message}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                        {!bulkDeleteResults ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={closeBulkDeleteModal}
                                    disabled={isBulkDeleting}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleBulkDelete}
                                    disabled={isBulkDeleting}
                                    className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                                    startIcon={
                                        isBulkDeleting
                                            ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                            : <FontAwesomeIcon icon={faTrashCan} />
                                    }
                                >
                                    {isBulkDeleting ? "Đang xóa..." : `Xác nhận xóa ${selectedGiangVienIds.length} giảng viên`}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={closeBulkDeleteModal}
                            >
                                Đóng
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}