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
    faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDownIcon } from "@/icons";
import Select from "@/components/form/Select";
import SearchableSelect from "@/components/form/SelectCustom";
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
                <span className="font-medium text-gray-700 dark: text-gray-300">
                    {total}
                </span>
                {" "}kết quả
            </span>
        </div>
    );
};

// ==================== GIẢNG VIÊN MODAL ====================
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
    errors: {
        maGiangVien: boolean;
        hoTen: boolean;
        ngaySinh: boolean;
        email: boolean;
        sdt: boolean;
        gioiTinh: boolean;
        diaChi: boolean;
    };
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

    const gioiTinhOptions = [
        { value: "NAM", label: "Nam" },
        { value: "NU", label: "Nữ" },
        { value: "KHONG_XAC_DINH", label: "Không xác định" },
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
                            defaultValue={formData.maGiangVien}
                            onChange={(e) => onFormChange("maGiangVien", e.target.value)}
                            error={errors.maGiangVien}
                            hint={errors.maGiangVien ? "Mã giảng viên không được để trống" : ""}
                        />
                    </div>

                    {/* Họ và Tên */}
                    <div>
                        <Label>Họ và Tên</Label>
                        <Input
                            defaultValue={formData.hoTen}
                            onChange={(e) => onFormChange("hoTen", e.target.value)}
                            error={errors.hoTen}
                            hint={errors.hoTen ? "Họ tên không được để trống" : ""}
                        />
                    </div>

                    {/* Ngày Sinh */}
                    <div>
                        <Label>Ngày Sinh</Label>
                        <DatePicker
                            id={isEdit ? "edit-ngaySinh" : "create-ngaySinh"}
                            defaultDate={formData.ngaySinh || undefined}   // tránh truyền ""
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
                            <p className="mt-1 text-sm text-error-500">
                                Ngày sinh không được để trống
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            defaultValue={formData.email}
                            onChange={(e) => onFormChange("email", e.target.value)}
                            error={errors.email}
                            hint={errors.email ? "Email không được để trống" : ""}
                        />
                    </div>

                    {/* Số Điện Thoại */}
                    <div>
                        <Label>Số Điện Thoại</Label>
                        <Input
                            defaultValue={formData.sdt}
                            onChange={(e) => onFormChange("sdt", e.target.value)}
                            error={errors.sdt}
                            hint={errors.sdt ? "Số điện thoại không được để trống" : ""}
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
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn giới tính
                            </p>
                        )}
                    </div>

                    {/* Địa Chỉ */}
                    <div>
                        <Label>Địa Chỉ</Label>
                        <TextArea
                            placeholder="Nhập địa chỉ"
                            rows={3}
                            defaultValue={formData.diaChi}
                            onChange={(value) => onFormChange("diaChi", value)}
                            error={errors.diaChi}
                            hint={errors.diaChi ? "Địa chỉ không được để trống" : ""}
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
        const templateUrl = "/templates/mau-nhap-giang-vien.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-giang-vien.xlsx";
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

            const res = await fetch("http://localhost:3000/danh-muc/giang-vien/import-excel", {
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
                        .map((err: any) =>
                            `Dòng ${err.row}${err.maGiangVien ? ` (${err.maGiangVien})` : ""}: ${err.error}`
                        )
                        .join("\n");

                    showAlert(
                        "warning",
                        "Nhập giảng viên hoàn tất với cảnh báo",
                        `Tổng: ${result.totalRows}, Thành công: ${result.success}, Thất bại: ${result.failed}\n${errorMessages}`
                    );
                } else {
                    showAlert(
                        "success",
                        "Thành công",
                        `Nhập giảng viên từ Excel thành công. Đã thêm ${result.success} giảng viên.`
                    );
                }
                handleClose();
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
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Nhập giảng viên bằng Excel
                </h3>

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
                    <Label className="mb-2 block">Chọn file Excel nhập lớp</Label>
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
                                            Xóa file
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
            </div>
        </Modal>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ GIẢNG VIÊN ====================
export default function QuanLyGiangVienPage() {
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

    // State cho checkbox và xóa hàng loạt
    const [selectedGiangVienIds, setSelectedGiangVienIds] = useState<number[]>([]);
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

    const [errors, setErrors] = useState({
        maGiangVien: false,
        hoTen: false,
        ngaySinh: false,
        email: false,
        sdt: false,
        gioiTinh: false,
        diaChi: false,
    });

    const [alert, setAlert] = useState<{
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
            let url = `http://localhost:3000/danh-muc/giang-vien?page=${page}&limit=10`;
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

    const fetchMonHocOptions = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc", {
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

    // Fetch giảng viên khi currentPage thay đổi
    useEffect(() => {
        fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
    }, [currentPage]);

    // ==================== HANDLERS ====================
    const handleSearch = () => {
        setCurrentPage(1);
        fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
    };

    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
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
        setErrors({
            maGiangVien: false,
            hoTen: false,
            ngaySinh: false,
            email: false,
            sdt: false,
            gioiTinh: false,
            diaChi: false,
        });
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
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/giang-vien", {
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

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/giang-vien/${editingGiangVien.id}`,
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
        }
    };

    // Delete
    const confirmDelete = async () => {
        if (!deletingGiangVien) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/giang-vien/${deletingGiangVien.id}`,
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
                `http://localhost:3000/danh-muc/giang-vien/${unassignData.giangVienId}/phan-cong-mon-hoc/${unassignData.monHocId}`,
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
        }
    };

    const openUnassignModal = (giangVienId: number, monHocId: number, tenMonHoc: string, hoTen: string) => {
        setUnassignData({ giangVienId, monHocId, tenMonHoc, hoTen });
        setIsUnassignModalOpen(true);
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
                `http://localhost:3000/auth/users/giang-vien/${creatingAccountGiangVien.id}`,
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
                "http://localhost:3000/auth/users/giang-vien/auto-create-accounts",
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

    // Kiểm tra xem tất cả giảng viên hiện tại có được chọn không
    const isAllSelected = giangViens.length > 0 && selectedGiangVienIds.length === giangViens.length;

    // Kiểm tra xem có một số (không phải tất cả) được chọn không - cho trạng thái indeterminate
    const isIndeterminate = selectedGiangVienIds.length > 0 && selectedGiangVienIds.length < giangViens.length;

    // Toggle chọn tất cả
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedGiangVienIds(giangViens.map(gv => gv.id));
        } else {
            setSelectedGiangVienIds([]);
        }
    };

    // Toggle chọn một giảng viên
    const handleSelectOne = (giangVienId: number, checked: boolean) => {
        if (checked) {
            setSelectedGiangVienIds(prev => [...prev, giangVienId]);
        } else {
            setSelectedGiangVienIds(prev => prev.filter(id => id !== giangVienId));
        }
    };

    // Kiểm tra một giảng viên có được chọn không
    const isSelected = (giangVienId: number) => selectedGiangVienIds.includes(giangVienId);

    // Reset selection khi chuyển trang hoặc filter
    useEffect(() => {
        setSelectedGiangVienIds([]);
    }, [currentPage, searchKeyword, selectedFilterMonHocId]);

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
        // Nếu đã xóa xong, reset selection và refresh data
        if (bulkDeleteResults) {
            setSelectedGiangVienIds([]);
            fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
        }
    };

    // Xử lý xóa hàng loạt
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

        // Lấy thông tin các giảng viên được chọn
        const selectedGiangViens = giangViens.filter(gv => selectedGiangVienIds.includes(gv.id));

        for (const gv of selectedGiangViens) {
            try {
                const res = await fetch(
                    `http://localhost:3000/danh-muc/giang-vien/${gv.id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (res.ok) {
                    results.push({
                        id: gv.id,
                        maGiangVien: gv.maGiangVien,
                        hoTen: gv.hoTen,
                        status: "success",
                        message: "Xóa thành công",
                    });
                } else {
                    const err = await res.json();
                    results.push({
                        id: gv.id,
                        maGiangVien: gv.maGiangVien,
                        hoTen: gv.hoTen,
                        status: "failed",
                        message: err.message || "Xóa thất bại",
                    });
                }
            } catch (err) {
                results.push({
                    id: gv.id,
                    maGiangVien: gv.maGiangVien,
                    hoTen: gv.hoTen,
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
        setFormData({
            maGiangVien: giangVien.maGiangVien,
            hoTen: giangVien.hoTen,
            ngaySinh: giangVien.ngaySinh,
            email: giangVien.email,
            sdt: giangVien.sdt,
            gioiTinh: giangVien.gioiTinh,
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
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            autoDismiss
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
                            />
                        </div>

                        <Button onClick={handleFilter} className="w-full sm:w-auto h-11">
                            Lọc
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
                                    <TableRow className="grid grid-cols-[5%_5%_12%_20%_10%_15%_33%]">
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
                                                className={`grid grid-cols-[5%_5%_12%_20%_10%_15%_33%] items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${isRowExpanded(gv.id) ? "bg-gray-50 dark:bg-white/[0.02]" : ""
                                                    } ${isSelected(gv.id) ? "bg-brand-50 dark:bg-brand-900/10" : ""}`}
                                            >
                                                {/* Checkbox */}
                                                <TableCell className="px-3 py-4 flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected(gv.id)}
                                                        onChange={(checked) => handleSelectOne(gv.id, checked)}
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
                            {/* Danh sách giảng viên sẽ xóa */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Danh sách giảng viên sẽ bị xóa:
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
                                            {giangViens
                                                .filter(gv => selectedGiangVienIds.includes(gv.id))
                                                .map((gv, index) => (
                                                    <tr key={gv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-white font-medium">{gv.maGiangVien}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-white">{gv.hoTen}</td>
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{gv.email}</td>
                                                    </tr>
                                                ))}
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
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Chi tiết kết quả
                                </h4>
                                <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-gray-600 dark: text-gray-400 font-medium">Mã GV</th>
                                                <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Họ tên</th>
                                                <th className="px-3 py-2 text-center text-gray-600 dark: text-gray-400 font-medium">Trạng thái</th>
                                                <th className="px-3 py-2 text-left text-gray-600 dark: text-gray-400 font-medium">Chi tiết</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {bulkDeleteResults.map((result) => (
                                                <tr
                                                    key={result.id}
                                                    className={result.status === 'failed' ? 'bg-red-50 dark:bg-red-900/10' : ''}
                                                >
                                                    <td className="px-3 py-2 text-gray-800 dark:text-white font-medium">
                                                        {result.maGiangVien}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-800 dark: text-white">
                                                        {result.hoTen}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {result.status === 'success' ? (
                                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                                <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
                                                                Thành công
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                                                <FontAwesomeIcon icon={faCircleExclamation} className="text-xs" />
                                                                Thất bại
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">
                                                        {result.message}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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