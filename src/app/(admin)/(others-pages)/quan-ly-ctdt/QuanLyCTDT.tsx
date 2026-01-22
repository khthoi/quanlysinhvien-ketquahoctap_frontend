"use client";

import React, { useEffect, useState } from "react";
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
    faChevronDown,
    faChevronUp,
    faArrowLeft,
    faCloudArrowUp,      // Thêm mới
    faDownload,          // Thêm mới
    faFileExcel,         // Thêm mới
    faBookOpen,          // Thêm mới
    faCircleInfo,        // Thêm mới
    faListOl,            // Thêm mới
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/form/SelectCustom";
import { useDropzone } from "react-dropzone";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { FaAngleDown } from "react-icons/fa6";

// ==================== INTERFACES ====================
interface Khoa {
    id: number;
    maKhoa: string;
    tenKhoa: string;
}

interface Nganh {
    id: number;
    maNganh: string;
    tenNganh: string;
    moTa: string | null;
    khoa: Khoa;
}

interface NienKhoa {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    moTa: string;
}

interface ApDungChuongTrinh {
    id: number;
    nienKhoa: NienKhoa;
    ngayApDung: string;
    ghiChu: string | null;
}

interface ChuongTrinhDaoTao {
    id: number;
    maChuongTrinh: string;
    tenChuongTrinh: string;
    thoiGianDaoTao: number;
    nganh: Nganh;
    apDungChuongTrinhs: ApDungChuongTrinh[];
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ==================== HELPER FUNCTIONS ====================
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
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

// Format date to YYYY-MM-DD
const formatDateNoTimezone = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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

// ==================== CHƯƠNG TRÌNH ĐÀO TẠO MODAL ====================
interface ChuongTrinhModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    formData: {
        maChuongTrinh: string;
        tenChuongTrinh: string;
        thoiGianDaoTao: string;
        nganhId: string;
    };
    nganhOptions: Nganh[];
    khoaOptions: Khoa[];
    selectedKhoaId: string;
    onKhoaChange: (value: string) => void;
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        maChuongTrinh: boolean;
        tenChuongTrinh: boolean;
        thoiGianDaoTao: boolean;
        nganhId: boolean;
    };
}

const ChuongTrinhModal: React.FC<ChuongTrinhModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    formData,
    nganhOptions,
    khoaOptions,
    selectedKhoaId,
    onKhoaChange,
    onFormChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Chương trình Đào tạo" : "Thêm Chương trình Đào tạo"}
                </h3>
                <div className="space-y-5">
                    {/* Mã Chương trình */}
                    <div>
                        <Label>Mã Chương trình</Label>
                        <Input
                            defaultValue={formData.maChuongTrinh}
                            onChange={(e) => onFormChange("maChuongTrinh", e.target.value)}
                            placeholder="VD: CNTT2021"
                            error={errors.maChuongTrinh}
                            hint={errors.maChuongTrinh ? "Mã chương trình không được để trống" : ""}
                        />
                    </div>

                    {/* Tên Chương trình */}
                    <div>
                        <Label>Tên Chương trình</Label>
                        <Input
                            defaultValue={formData.tenChuongTrinh}
                            onChange={(e) => onFormChange("tenChuongTrinh", e.target.value)}
                            placeholder="VD: Cử nhân Công nghệ Thông tin"
                            error={errors.tenChuongTrinh}
                            hint={errors.tenChuongTrinh ? "Tên chương trình không được để trống" : ""}
                        />
                    </div>

                    {/* Thời gian đào tạo */}
                    <div>
                        <Label>Thời gian đào tạo (năm)</Label>
                        <Input
                            type="number"
                            defaultValue={formData.thoiGianDaoTao}
                            onChange={(e) => onFormChange("thoiGianDaoTao", e.target.value)}
                            placeholder="VD:  4"
                            error={errors.thoiGianDaoTao}
                            hint={errors.thoiGianDaoTao ? "Thời gian đào tạo không được để trống" : ""}
                        />
                    </div>

                    {/* Chọn Khoa (để lọc Ngành) */}
                    <div>
                        <Label>Khoa (để lọc ngành)</Label>
                        <SearchableSelect
                            options={khoaOptions.map((k) => ({
                                value: k.id.toString(),
                                label: k.maKhoa,
                                secondary: k.tenKhoa,
                            }))}
                            placeholder="Chọn khoa để lọc ngành"
                            onChange={onKhoaChange}
                            defaultValue={selectedKhoaId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm khoa..."
                        />
                    </div>

                    {/* Chọn Ngành */}
                    <div>
                        <Label>Ngành</Label>
                        <SearchableSelect
                            options={nganhOptions.map((n) => ({
                                value: n.id.toString(),
                                label: n.maNganh,
                                secondary: n.tenNganh,
                            }))}
                            placeholder="Chọn ngành"
                            onChange={(value) => onFormChange("nganhId", value)}
                            defaultValue={formData.nganhId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm ngành..."
                        />
                        {errors.nganhId && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn ngành
                            </p>
                        )}
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

// ==================== ÁP DỤNG CHƯƠNG TRÌNH MODAL ====================
interface ApDungModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        chuongTrinhId: string;
        nienKhoaId: string;
        ngayApDung: string;
        ghiChu: string;
    };
    chuongTrinhOptions: ChuongTrinhDaoTao[];
    nienKhoaOptions: NienKhoa[];
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        chuongTrinhId: boolean;
        nienKhoaId: boolean;
        ngayApDung: boolean;
    };
    // Thêm prop để lấy thông tin ngành/khoa từ chương trình đã chọn
    selectedChuongTrinh: ChuongTrinhDaoTao | null;
}


const ApDungModal: React.FC<ApDungModalProps> = ({
    isOpen,
    onClose,
    formData,
    chuongTrinhOptions,
    nienKhoaOptions,
    onFormChange,
    onSubmit,
    errors,
    selectedChuongTrinh,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Áp dụng Chương trình Đào tạo
                </h3>
                <div className="space-y-5">
                    {/* Chọn Chương trình */}
                    <div>
                        <Label>Chương trình Đào tạo</Label>
                        <SearchableSelect
                            options={chuongTrinhOptions.map((ct) => ({
                                value: ct.id.toString(),
                                label: ct.maChuongTrinh,
                                secondary: ct.tenChuongTrinh,
                            }))}
                            placeholder="Chọn chương trình đào tạo"
                            onChange={(value) => onFormChange("chuongTrinhId", value)}
                            defaultValue={formData.chuongTrinhId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm chương trình..."
                        />
                        {errors.chuongTrinhId && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn chương trình đào tạo
                            </p>
                        )}
                    </div>

                    {/* Hiển thị thông tin Ngành và Khoa của chương trình đã chọn */}
                    {selectedChuongTrinh && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Label className="block mb-3 text-sm font-medium">Thông tin chương trình</Label>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Ngành:</span>
                                    <Badge variant="solid" color="primary">
                                        {selectedChuongTrinh.nganh.maNganh}
                                    </Badge>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {selectedChuongTrinh.nganh.tenNganh}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Khoa:</span>
                                    <Badge variant="solid" color="info">
                                        {selectedChuongTrinh.nganh.khoa.maKhoa}
                                    </Badge>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {selectedChuongTrinh.nganh.khoa.tenKhoa}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chọn Niên khóa */}
                    <div>
                        <Label>Niên khóa</Label>
                        <SearchableSelect
                            options={nienKhoaOptions.map((nk) => ({
                                value: nk.id.toString(),
                                label: nk.maNienKhoa,
                                secondary: nk.tenNienKhoa,
                            }))}
                            placeholder="Chọn niên khóa"
                            onChange={(value) => onFormChange("nienKhoaId", value)}
                            defaultValue={formData.nienKhoaId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm niên khóa..."
                        />
                        {errors.nienKhoaId && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn niên khóa
                            </p>
                        )}
                    </div>

                    {/* Ngày Áp dụng */}
                    <div>
                        <Label>Ngày Áp dụng</Label>
                        <DatePicker
                            id="apdung-ngayApDung"
                            defaultDate={formData.ngayApDung || undefined}
                            onChange={([date]: any) => {
                                if (date) {
                                    const formatted = formatDateNoTimezone(date);
                                    onFormChange("ngayApDung", formatted);
                                } else {
                                    onFormChange("ngayApDung", "");
                                }
                            }}
                        />
                        {errors.ngayApDung && (
                            <p className="mt-1 text-sm text-error-500">
                                Ngày áp dụng không được để trống
                            </p>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <Label>Ghi chú</Label>
                        <TextArea
                            placeholder="Nhập ghi chú (tùy chọn)"
                            rows={3}
                            defaultValue={formData.ghiChu}
                            onChange={(value) => onFormChange("ghiChu", value)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        Áp dụng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL IMPORT MÔN HỌC EXCEL ====================
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

    const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError("");

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
        const templateUrl = "/templates/mau-nhap-mon-hoc-ctdt.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-mon-hoc-ctdt.xlsx";
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

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("http://localhost:3000/dao-tao/chuong-trinh/mon-hoc/import-excel", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result = await res.json();

            if (res.ok) {
                if (result.errors?.length > 0) {
                    const errorMessages = result.errors
                        .slice(0, 5)
                        .map((err: any) =>
                            `Dòng ${err.row}${err.maMonHoc ? ` (${err.maMonHoc})` : ""}:  ${err.error}`
                        )
                        .join("\n");

                    const moreErrors = result.errors.length > 5
                        ? `\n...  và ${result.errors.length - 5} lỗi khác`
                        : "";

                    showAlert(
                        "warning",
                        "Nhập môn học hoàn tất với cảnh báo",
                        `Tổng:  ${result.totalRows}, Thành công: ${result.success}, Thất bại: ${result.failed}\n${errorMessages}${moreErrors}`
                    );
                } else {
                    showAlert(
                        "success",
                        "Thành công",
                        `Nhập môn học từ Excel thành công.  Đã thêm ${result.success} môn học vào chương trình đào tạo.`
                    );
                }
                handleClose();
                onSuccess();
            } else {
                showAlert("error", "Lỗi", result.message || "Nhập môn học thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi nhập môn học");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setFileError("");
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <FontAwesomeIcon icon={faBookOpen} className="text-xl text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Nhập môn học bằng Excel
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Thêm hàng loạt môn học vào chương trình đào tạo
                        </p>
                    </div>
                </div>

                {/* Button tải file mẫu */}
                <div className="mb-5">
                    <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                        className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark: border-emerald-700 dark:text-emerald-400 dark:hover: bg-emerald-900/20"
                    >
                        Tải file Excel mẫu
                    </Button>
                </div>

                {/* Dropzone */}
                <div className="mb-6">
                    <Label className="mb-2 block text-sm font-medium">Chọn file Excel</Label>
                    <div
                        className={`transition border-2 border-dashed cursor-pointer rounded-xl 
                            ${fileError ? 'border-red-400' : 'border-gray-300 dark:border-gray-700'}
                            ${isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'hover:border-emerald-400 dark:hover:border-emerald-600'}
                        `}
                    >
                        <div
                            {...getRootProps()}
                            className={`rounded-xl p-6 lg:p-8
                                ${isDragActive
                                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                                    : "bg-gray-50 dark:bg-gray-900"
                                }
                            `}
                        >
                            <input {...getInputProps()} />

                            <div className="flex flex-col items-center">
                                {/* Icon */}
                                <div className="mb-4 flex justify-center">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-full 
                                        ${selectedFile
                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
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
                                        <p className="mb-1 font-medium text-gray-800 dark:text-white/90 text-sm">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile();
                                            }}
                                            className="mt-3 text-xs text-red-500 hover:text-red-600 underline font-medium"
                                        >
                                            Hủy
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-sm">
                                            {isDragActive ? "Thả file vào đây" : "Kéo & thả file vào đây"}
                                        </h4>
                                        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Chỉ chấp nhận file Excel (.xlsx)
                                        </p>
                                        <span className="font-medium underline text-xs text-emerald-600 dark:text-emerald-400">
                                            Hoặc chọn file từ máy tính
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {fileError && (
                        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCircleInfo} />
                            {fileError}
                        </p>
                    )}
                </div>

                {/* Lưu ý */}
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/20">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        <FontAwesomeIcon icon={faListOl} className="mr-2" />
                        <strong>Lưu ý:</strong> Môn học phải tồn tại trong hệ thống trước khi thêm vào chương trình đào tạo.
                    </p>
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isUploading ? "Đang xử lý..." : "Nhập môn học"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ CHƯƠNG TRÌNH ĐÀO TẠO ====================
export default function QuanLyChuongTrinhDaoTaoPage() {
    // State cho danh sách và pagination
    const [chuongTrinhs, setChuongTrinhs] = useState<ChuongTrinhDaoTao[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);

    // State cho dropdown rows
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const [activeCtdtDropdownId, setActiveCtdtDropdownId] = useState<number | null>(null);

    // State cho options
    const [nganhOptions, setNganhOptions] = useState<Nganh[]>([]);
    const [nienKhoaOptions, setNienKhoaOptions] = useState<NienKhoa[]>([]);
    const [khoaOptions, setKhoaOptions] = useState<Khoa[]>([]);

    // State cho filter
    const [filterNganhId, setFilterNganhId] = useState("");
    const [filterNienKhoaId, setFilterNienKhoaId] = useState("");
    const [filterKhoaId, setFilterKhoaId] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");

    // State cho modals
    const [isCreateChuongTrinhModalOpen, setIsCreateChuongTrinhModalOpen] = useState(false);
    const [isEditChuongTrinhModalOpen, setIsEditChuongTrinhModalOpen] = useState(false);
    const [isDeleteChuongTrinhModalOpen, setIsDeleteChuongTrinhModalOpen] = useState(false);
    const [isApDungModalOpen, setIsApDungModalOpen] = useState(false);
    const [isDeleteApDungModalOpen, setIsDeleteApDungModalOpen] = useState(false);

    const [editingChuongTrinh, setEditingChuongTrinh] = useState<ChuongTrinhDaoTao | null>(null);
    const [deletingChuongTrinh, setDeletingChuongTrinh] = useState<ChuongTrinhDaoTao | null>(null);
    const [deletingApDung, setDeletingApDung] = useState<{ apDung: ApDungChuongTrinh; chuongTrinh: ChuongTrinhDaoTao } | null>(null);
    // State cho modal import môn học Excel
    const [isImportMonHocModalOpen, setIsImportMonHocModalOpen] = useState(false);

    // State cho form chương trình
    const [chuongTrinhFormData, setChuongTrinhFormData] = useState({
        maChuongTrinh: "",
        tenChuongTrinh: "",
        thoiGianDaoTao: "",
        nganhId: "",
    });
    const [modalKhoaId, setModalKhoaId] = useState("");
    const [modalNganhOptions, setModalNganhOptions] = useState<Nganh[]>([]);
    const [selectedApDungChuongTrinh, setSelectedApDungChuongTrinh] = useState<ChuongTrinhDaoTao | null>(null);
    // State cho form áp dụng
    const [apDungFormData, setApDungFormData] = useState({
        chuongTrinhId: "",
        nienKhoaId: "",
        ngayApDung: "",
        ghiChu: "",
    });
    const [apDungModalKhoaId, setApDungModalKhoaId] = useState("");
    const [apDungModalNganhOptions, setApDungModalNganhOptions] = useState<Nganh[]>([]);

    // State cho errors
    const [chuongTrinhErrors, setChuongTrinhErrors] = useState({
        maChuongTrinh: false,
        tenChuongTrinh: false,
        thoiGianDaoTao: false,
        nganhId: false,
    });

    const [apDungErrors, setApDungErrors] = useState({
        chuongTrinhId: false,
        nienKhoaId: false,
        ngayApDung: false,
    });

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // ==================== API CALLS ====================
    const fetchChuongTrinhs = async (
        page: number = 1,
        search: string = "",
        nganhId: string = "",
        nienKhoaId: string = ""
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/dao-tao/chuong-trinh?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (nganhId) url += `&nganhId=${nganhId}`;
            if (nienKhoaId) url += `&nienKhoaId=${nienKhoaId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setChuongTrinhs(json.data);
                setPagination({
                    total: json.pagination.total || 0,
                    page: json.pagination.page || 1,
                    limit: json.pagination.limit || 10,
                    totalPages: json.pagination.totalPages || 1,
                });
                setCurrentPage(json.pagination.page || 1);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách chương trình đào tạo");
        }
    };

    const fetchNganhs = async (khoaId: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/nganh?page=1&limit=9999`;
            if (khoaId) url += `&khoaId=${khoaId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNganhOptions(json.data);
            }
            if (json.filters?.khoa) {
                setKhoaOptions(json.filters.khoa);
            }
        } catch (err) {
            console.error("Không thể tải danh sách ngành:", err);
        }
    };

    const fetchNganhsForModal = async (khoaId: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/nganh?page=1&limit=100`;
            if (khoaId) url += `&khoaId=${khoaId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setModalNganhOptions(json.data);
            }
        } catch (err) {
            console.error("Không thể tải danh sách ngành:", err);
        }
    };

    const fetchNganhsForApDungModal = async (khoaId: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/nganh?page=1&limit=100`;
            if (khoaId) url += `&khoaId=${khoaId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setApDungModalNganhOptions(json.data);
            }
        } catch (err) {
            console.error("Không thể tải danh sách ngành:", err);
        }
    };

    const fetchNienKhoas = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/danh-muc/nien-khoa?page=1&limit=9999`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNienKhoaOptions(json.data);
            }
        } catch (err) {
            console.error("Không thể tải danh sách niên khóa:", err);
        }
    };

    // Fetch data khi component mount
    useEffect(() => {
        fetchNganhs();
        fetchNienKhoas();
    }, []);

    // Fetch chương trình khi currentPage thay đổi
    useEffect(() => {
        fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
    }, [currentPage]);

    // Fetch ngành khi khoa filter thay đổi
    useEffect(() => {
        fetchNganhs(filterKhoaId);
    }, [filterKhoaId]);

    // Fetch ngành cho modal khi khoa thay đổi
    useEffect(() => {
        fetchNganhsForModal(modalKhoaId);
    }, [modalKhoaId]);

    // Fetch ngành cho áp dụng modal khi khoa thay đổi
    useEffect(() => {
        fetchNganhsForApDungModal(apDungModalKhoaId);
    }, [apDungModalKhoaId]);

    // ==================== HANDLERS ====================
    const handleSearch = () => {
        setCurrentPage(1);
        fetchChuongTrinhs(1, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchChuongTrinhs(1, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
    };

    const handleResetFilter = () => {
        setFilterNganhId("");
        setFilterNienKhoaId("");
        setFilterKhoaId("");
        setSearchKeyword("");
        setCurrentPage(1);
        fetchChuongTrinhs(1, "", "", "");
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

    const resetChuongTrinhForm = () => {
        setChuongTrinhFormData({
            maChuongTrinh: "",
            tenChuongTrinh: "",
            thoiGianDaoTao: "",
            nganhId: "",
        });
        setModalKhoaId("");
        setChuongTrinhErrors({
            maChuongTrinh: false,
            tenChuongTrinh: false,
            thoiGianDaoTao: false,
            nganhId: false,
        });
    };

    const resetApDungForm = () => {
        setApDungFormData({
            chuongTrinhId: "",
            nienKhoaId: "",
            ngayApDung: "",
            ghiChu: "",
        });
        setSelectedApDungChuongTrinh(null);
        setApDungErrors({
            chuongTrinhId: false,
            nienKhoaId: false,
            ngayApDung: false,
        });
    };

    const handleChuongTrinhFormChange = (field: string, value: string) => {
        setChuongTrinhFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleApDungFormChange = (field: string, value: string) => {
        setApDungFormData((prev) => ({ ...prev, [field]: value }));

        // Khi chọn chương trình, cập nhật selectedApDungChuongTrinh
        if (field === "chuongTrinhId") {
            const selected = chuongTrinhs.find((ct) => ct.id.toString() === value);
            setSelectedApDungChuongTrinh(selected || null);
        }
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const isRowExpanded = (id: number) => expandedRows.includes(id);

    // Toggle dropdown CTĐT:
    // - Click vào dropdown đang mở → đóng
    // - Click dropdown khác → mở dropdown mới và đóng cái cũ
    const toggleCtdtDropdown = (ctdtId: number) => {
        setActiveCtdtDropdownId(prev =>
            prev === ctdtId ? null : ctdtId
        );
    };

    // Đóng dropdown CTĐT (khi chọn item hoặc click ra ngoài)
    const closeCtdtDropdown = () => {
        setActiveCtdtDropdownId(null);
    };



    // Validate chương trình form
    const validateChuongTrinhForm = (): boolean => {
        const newErrors = {
            maChuongTrinh: !chuongTrinhFormData.maChuongTrinh.trim(),
            tenChuongTrinh: !chuongTrinhFormData.tenChuongTrinh.trim(),
            thoiGianDaoTao: !chuongTrinhFormData.thoiGianDaoTao,
            nganhId: !chuongTrinhFormData.nganhId,
        };
        setChuongTrinhErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Validate áp dụng form
    const validateApDungForm = (): boolean => {
        const newErrors = {
            chuongTrinhId: !apDungFormData.chuongTrinhId,
            nienKhoaId: !apDungFormData.nienKhoaId,
            ngayApDung: !apDungFormData.ngayApDung,
        };
        setApDungErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Create Chương trình
    const handleCreateChuongTrinh = async () => {
        if (!validateChuongTrinhForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/chuong-trinh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maChuongTrinh: chuongTrinhFormData.maChuongTrinh.trim(),
                    tenChuongTrinh: chuongTrinhFormData.tenChuongTrinh.trim(),
                    thoiGianDaoTao: Number(chuongTrinhFormData.thoiGianDaoTao),
                    nganhId: Number(chuongTrinhFormData.nganhId),
                }),
            });

            setIsCreateChuongTrinhModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm chương trình đào tạo thành công");
                resetChuongTrinhForm();
                fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm chương trình thất bại");
            }
        } catch (err) {
            setIsCreateChuongTrinhModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm chương trình");
        }
    };

    // Update Chương trình
    const handleUpdateChuongTrinh = async () => {
        if (!editingChuongTrinh || !validateChuongTrinhForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/chuong-trinh/${editingChuongTrinh.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maChuongTrinh: chuongTrinhFormData.maChuongTrinh.trim(),
                        tenChuongTrinh: chuongTrinhFormData.tenChuongTrinh.trim(),
                        thoiGianDaoTao: Number(chuongTrinhFormData.thoiGianDaoTao),
                        nganhId: Number(chuongTrinhFormData.nganhId),
                    }),
                }
            );

            setIsEditChuongTrinhModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật chương trình đào tạo thành công");
                resetChuongTrinhForm();
                setEditingChuongTrinh(null);
                fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật chương trình thất bại");
            }
        } catch (err) {
            setIsEditChuongTrinhModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật chương trình");
        } finally {
            setIsEditChuongTrinhModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Delete Chương trình
    const confirmDeleteChuongTrinh = async () => {
        if (!deletingChuongTrinh) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/chuong-trinh/${deletingChuongTrinh.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteChuongTrinhModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa chương trình đào tạo thành công");
                setDeletingChuongTrinh(null);
                fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa chương trình thất bại");
            }
        } catch (err) {
            setIsDeleteChuongTrinhModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa chương trình");
        } finally {
            setIsDeleteChuongTrinhModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Create Áp dụng
    const handleCreateApDung = async () => {
        if (!validateApDungForm()) return;

        // Lấy nganhId từ chương trình đã chọn
        if (!selectedApDungChuongTrinh) {
            showAlert("error", "Lỗi", "Vui lòng chọn chương trình đào tạo");
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/ap-dung", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    chuongTrinhId: Number(apDungFormData.chuongTrinhId),
                    nganhId: selectedApDungChuongTrinh.nganh.id,
                    nienKhoaId: Number(apDungFormData.nienKhoaId),
                    ngayApDung: apDungFormData.ngayApDung,
                    ghiChu: apDungFormData.ghiChu.trim() || null,
                }),
            });

            setIsApDungModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Áp dụng chương trình đào tạo thành công");
                resetApDungForm();
                fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Áp dụng chương trình thất bại");
            }
        } catch (err) {
            setIsApDungModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi áp dụng chương trình");
        } finally {
            setIsApDungModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Delete Áp dụng
    const confirmDeleteApDung = async () => {
        if (!deletingApDung) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/ap-dung/${deletingApDung.apDung.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteApDungModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa áp dụng chương trình thành công");
                setDeletingApDung(null);
                fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa áp dụng thất bại");
            }
        } catch (err) {
            setIsDeleteApDungModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa áp dụng");
        } finally {
            setIsDeleteApDungModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Open modals
    const openEditChuongTrinhModal = (chuongTrinh: ChuongTrinhDaoTao) => {
        setEditingChuongTrinh(chuongTrinh);
        setChuongTrinhFormData({
            maChuongTrinh: chuongTrinh.maChuongTrinh,
            tenChuongTrinh: chuongTrinh.tenChuongTrinh,
            thoiGianDaoTao: chuongTrinh.thoiGianDaoTao.toString(),
            nganhId: chuongTrinh.nganh.id.toString(),
        });
        setModalKhoaId(chuongTrinh.nganh.khoa.id.toString());
        fetchNganhsForModal(chuongTrinh.nganh.khoa.id.toString());
        setIsEditChuongTrinhModalOpen(true);
    };

    const openDeleteChuongTrinhModal = (chuongTrinh: ChuongTrinhDaoTao) => {
        setDeletingChuongTrinh(chuongTrinh);
        setIsDeleteChuongTrinhModalOpen(true);
    };

    const openDeleteApDungModal = (apDung: ApDungChuongTrinh, chuongTrinh: ChuongTrinhDaoTao) => {
        setDeletingApDung({ apDung, chuongTrinh });
        setIsDeleteApDungModalOpen(true);
    };

    const openChiTietChuongTrinhDaoTao = (chuongTrinh: ChuongTrinhDaoTao) => {
        window.location.href = `/quan-ly-ctdt/chi-tiet-ctdt/${chuongTrinh.id}`;
    }

    const openCreateChuongTrinhModal = () => {
        resetChuongTrinhForm();
        fetchNganhsForModal("");
        setIsCreateChuongTrinhModalOpen(true);
    };

    const openApDungModal = () => {
        resetApDungForm();
        setIsApDungModalOpen(true);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Chương trình Đào tạo" />

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
                            duration={15000}
                            onClose={() => setAlert(null)}   // 🔥 unmount thật
                        />
                    </div>
                )}

                {/* Search và Buttons */}
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
                                placeholder="Tìm kiếm chương trình đào tạo..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {/* Button Nhập môn học Excel - THÊM MỚI */}
                        <Button
                            variant="primary"
                            onClick={() => setIsImportMonHocModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faFileExcel} />}
                        >
                            Nhập môn học Excel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={openApDungModal}
                        >
                            Áp dụng Chương trình
                        </Button>
                        <Button
                            onClick={openCreateChuongTrinhModal}
                        >
                            Tạo Chương trình
                        </Button>
                    </div>
                </div>

                {/* Filter */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Label className="block mb-3 text-base font-medium">Bộ lọc</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Lọc theo Khoa */}
                        <div>
                            <Label className="block mb-2 text-sm">Khoa</Label>
                            <SearchableSelect
                                options={khoaOptions.map((k) => ({
                                    value: k.id.toString(),
                                    label: k.maKhoa,
                                    secondary: k.tenKhoa,
                                }))}
                                placeholder="Tất cả khoa"
                                onChange={(value) => setFilterKhoaId(value)}
                                defaultValue={filterKhoaId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm khoa..."
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

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[900px]">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[5%_15%_30%_12%_15%_23%]">
                                        <TableCell
                                            isHeader
                                            className="px-3 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            <span className="sr-only">Expand</span>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left"
                                        >
                                            Mã Chương trình
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left"
                                        >
                                            Tên Chương trình
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Thời gian ĐT
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Mã Ngành
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
                                    {chuongTrinhs.length === 0 ? (
                                        <TableRow>
                                            <TableCell cols={6} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu chương trình đào tạo
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        chuongTrinhs.map((ct) => (
                                            <React.Fragment key={ct.id}>
                                                {/* Main Row */}
                                                <TableRow
                                                    className={`grid grid-cols-[5%_15%_30%_12%_15%_23%] items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${isRowExpanded(ct.id)
                                                        ? "bg-gray-50 dark:bg-white/[0.02]"
                                                        : ""
                                                        }`}
                                                >
                                                    <TableCell className="px-3 py-4 flex items-center justify-center">
                                                        <button
                                                            onClick={() => toggleRow(ct.id)}
                                                            disabled={ct.apDungChuongTrinhs.length === 0}
                                                            className={`flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors ${ct.apDungChuongTrinhs.length > 0
                                                                ? "hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                                                : "opacity-30 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            <ChevronIcon isOpen={isRowExpanded(ct.id)} />
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center text-gray-800 dark:text-white/90">
                                                        <div className="flex items-center gap-2">
                                                            {ct.maChuongTrinh}
                                                            {ct.apDungChuongTrinhs.length > 0 && (
                                                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                                                                    {ct.apDungChuongTrinhs.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                        {ct.tenChuongTrinh}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center">
                                                        <Badge variant="solid" color="info">
                                                            {ct.thoiGianDaoTao} năm
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center text-gray-800 dark:text-white/90">
                                                        {ct.nganh.maNganh}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center">
                                                        <div className="relative inline-block">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleCtdtDropdown(ct.id)}
                                                                className="dropdown-toggle flex items-center gap-1.5 min-w-[110px] justify-between px-3 py-2"
                                                            >
                                                                Thao tác
                                                                <FaAngleDown
                                                                    className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeCtdtDropdownId === ct.id ? "rotate-180" : "rotate-0"
                                                                        }`}
                                                                />
                                                            </Button>

                                                            <Dropdown
                                                                isOpen={activeCtdtDropdownId === ct.id}
                                                                onClose={closeCtdtDropdown}
                                                                className="w-56 mt-2 right-0"
                                                            >
                                                                <div className="py-1">
                                                                    {/* Xem chi tiết */}
                                                                    <DropdownItem
                                                                        tag="a"
                                                                        href={`/quan-ly-ctdt/chi-tiet-ctdt/${ct.id}`}
                                                                        onItemClick={closeCtdtDropdown}
                                                                    >
                                                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 w-4" />
                                                                        Xem chi tiết
                                                                    </DropdownItem>

                                                                    {/* Chỉnh sửa */}
                                                                    <DropdownItem
                                                                        tag="button"
                                                                        onItemClick={closeCtdtDropdown}
                                                                        onClick={() => openEditChuongTrinhModal(ct)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2 w-4" />
                                                                        Chỉnh sửa
                                                                    </DropdownItem>

                                                                    <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                    {/* Xóa */}
                                                                    <DropdownItem
                                                                        tag="button"
                                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                        onItemClick={closeCtdtDropdown}
                                                                        onClick={() => openDeleteChuongTrinhModal(ct)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} className="mr-2 w-4" />
                                                                        Xóa
                                                                    </DropdownItem>
                                                                </div>
                                                            </Dropdown>
                                                        </div>

                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Sub-Rows (Áp dụng) */}
                                                {isRowExpanded(ct.id) && ct.apDungChuongTrinhs.length > 0 && (
                                                    <>
                                                        {/* Sub-Table Header */}
                                                        <TableRow className="grid grid-cols-[5%_15%_30%_12%_15%_23%] items-center bg-gray-100/80 dark:bg-white/[0.04] border-t border-gray-200 dark:border-white/[0.05]">
                                                            <TableCell className="px-3 py-2.5">
                                                                <span></span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                                Niên khóa
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                                Ngành
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                Ngày Áp dụng
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                Ghi chú
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                Hành động
                                                            </TableCell>
                                                        </TableRow>

                                                        {/* Sub-Rows Data */}
                                                        {ct.apDungChuongTrinhs.map((ad, index) => (
                                                            <TableRow
                                                                key={ad.id}
                                                                className={`grid grid-cols-[5%_15%_30%_12%_15%_23%] items-center bg-gray-50/50 dark:bg-white/[0.01] ${index === ct.apDungChuongTrinhs.length - 1
                                                                    ? "border-b border-gray-200 dark:border-white/[0.05]"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <TableCell className="px-3 py-3 flex items-center justify-center">
                                                                    {/* Connector line */}
                                                                    <div className="flex items-center justify-center h-full">
                                                                        <div className="flex flex-col items-center">
                                                                            <div
                                                                                className={`w-px bg-gray-300 dark:bg-white/[0.15] ${index === 0 ? "h-1/2" : "h-full"
                                                                                    }`}
                                                                            />
                                                                            <div className="w-2 h-2 rounded-full bg-brand-400 dark:bg-brand-500" />
                                                                            {index !== ct.apDungChuongTrinhs.length - 1 && (
                                                                                <div className="w-px h-1/2 bg-gray-300 dark:bg-white/[0.15]" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-700 dark:text-gray-200">
                                                                    <span className="text-sm font-medium">
                                                                        {ad.nienKhoa.maNienKhoa} - {ad.nienKhoa.tenNienKhoa}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                                                    <span className="text-sm">
                                                                        {ct.nganh.maNganh} - {ct.nganh.tenNganh}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                    <Badge variant="solid" color="primary">
                                                                        {formatDateVN(ad.ngayApDung)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                                                    <span className="text-sm truncate block max-w-[150px]" title={ad.ghiChu || ""}>
                                                                        {ad.ghiChu || "-"}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => openDeleteApDungModal(ad, ct)}
                                                                        className="p-2 text-error-500 border-error-300 hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </>
                                                )}
                                            </React.Fragment>
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

                {/* Table Footer Summary */}
                <div className="mt-4 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tổng số {chuongTrinhs.length} chương trình đào tạo với{" "}
                            {chuongTrinhs.reduce((acc, ct) => acc + ct.apDungChuongTrinhs.length, 0)}{" "}
                            lượt áp dụng
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setExpandedRows(chuongTrinhs.map((ct) => ct.id))}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark: bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
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

            {/* Modal Thêm Chương trình */}
            <ChuongTrinhModal
                isOpen={isCreateChuongTrinhModalOpen}
                onClose={() => {
                    setIsCreateChuongTrinhModalOpen(false);
                    resetChuongTrinhForm();
                }}
                isEdit={false}
                formData={chuongTrinhFormData}
                nganhOptions={modalNganhOptions}
                khoaOptions={khoaOptions}
                selectedKhoaId={modalKhoaId}
                onKhoaChange={(value) => {
                    setModalKhoaId(value);
                    setChuongTrinhFormData((prev) => ({ ...prev, nganhId: "" }));
                }}
                onFormChange={handleChuongTrinhFormChange}
                onSubmit={handleCreateChuongTrinh}
                errors={chuongTrinhErrors}
            />

            {/* Modal Sửa Chương trình */}
            <ChuongTrinhModal
                isOpen={isEditChuongTrinhModalOpen}
                onClose={() => {
                    setIsEditChuongTrinhModalOpen(false);
                    resetChuongTrinhForm();
                    setEditingChuongTrinh(null);
                }}
                isEdit={true}
                formData={chuongTrinhFormData}
                nganhOptions={modalNganhOptions}
                khoaOptions={khoaOptions}
                selectedKhoaId={modalKhoaId}
                onKhoaChange={(value) => {
                    setModalKhoaId(value);
                    setChuongTrinhFormData((prev) => ({ ...prev, nganhId: "" }));
                }}
                onFormChange={handleChuongTrinhFormChange}
                onSubmit={handleUpdateChuongTrinh}
                errors={chuongTrinhErrors}
            />

            {/* Modal Áp dụng Chương trình */}
            <ApDungModal
                isOpen={isApDungModalOpen}
                onClose={() => {
                    setIsApDungModalOpen(false);
                    resetApDungForm();
                }}
                formData={apDungFormData}
                chuongTrinhOptions={chuongTrinhs}
                nienKhoaOptions={nienKhoaOptions}
                onFormChange={handleApDungFormChange}
                onSubmit={handleCreateApDung}
                errors={apDungErrors}
                selectedChuongTrinh={selectedApDungChuongTrinh}
            />

            {/* Modal Xóa Chương trình */}
            <Modal
                isOpen={isDeleteChuongTrinhModalOpen}
                onClose={() => {
                    setIsDeleteChuongTrinhModalOpen(false);
                    setDeletingChuongTrinh(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Xác nhận xóa chương trình đào tạo
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn xóa chương trình đào tạo{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {deletingChuongTrinh?.tenChuongTrinh}
                        </span>{" "}
                        (Mã:  {deletingChuongTrinh?.maChuongTrinh})?
                        <br /><br />
                        <span className="text-error-500">
                           Cần xoá liên kết niên khoá của chương trình này trước khi xoá chương trình.
                        </span>
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteChuongTrinhModalOpen(false);
                                setDeletingChuongTrinh(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={confirmDeleteChuongTrinh}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Xóa Áp dụng */}
            <Modal
                isOpen={isDeleteApDungModalOpen}
                onClose={() => {
                    setIsDeleteApDungModalOpen(false);
                    setDeletingApDung(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Xác nhận xóa áp dụng chương trình
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn xóa áp dụng chương trình{" "}
                        <span className="font-semibold text-brand-600 dark: text-brand-400">
                            {deletingApDung?.chuongTrinh.tenChuongTrinh}
                        </span>{" "}
                        cho niên khóa{" "}
                        <span className="font-semibold text-gray-900 dark: text-white">
                            {deletingApDung?.apDung.nienKhoa.tenNienKhoa}
                        </span>
                        ? <br /><br />
                        <p className="text-red-500">Hành động này không thể hoàn tác.</p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteApDungModalOpen(false);
                                setDeletingApDung(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={confirmDeleteApDung}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Import Môn học Excel */}
            <ImportMonHocExcelModal
                isOpen={isImportMonHocModalOpen}
                onClose={() => setIsImportMonHocModalOpen(false)}
                onSuccess={() => {
                    fetchChuongTrinhs(currentPage, searchKeyword.trim(), filterNganhId, filterNienKhoaId);
                }}
                showAlert={showAlert}
            />
        </div>
    );
}