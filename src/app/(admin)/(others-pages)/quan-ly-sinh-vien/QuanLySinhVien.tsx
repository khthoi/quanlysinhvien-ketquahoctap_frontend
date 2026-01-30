"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import Badge from "@/components/ui/badge/Badge";
import SearchableSelect from "@/components/form/SelectCustom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faEye,
    faPenToSquare,
    faTrash,
    faEdit,
    faGlassCheers,
    faMedal,
    faGraduationCap,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import TextArea from "@/components/form/input/TextArea";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";
import { useDropzone } from "react-dropzone";
import {
    faCloudArrowUp,
    faDownload,
    faFileExcel,
    faUsersGear,
    faCircleCheck,
    faCircleExclamation,
    faSpinner,
    faFileInvoice,  // THÊM MỚI - icon cho xuất phiếu điểm
    faUserXmark,
    faCircleInfo,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type TinhTrang = "DANG_HOC" | "THOI_HOC" | "DA_TOT_NGHIEP" | "BAO_LUU";
type tinhTrangOptions = "DANG_HOC" | "THOI_HOC" | "BAO_LUU";
type GioiTinh = "NAM" | "NU";
type LoaiQuyetDinh = "KHEN_THUONG" | "KY_LUAT";

type VAI_TRO = "ADMIN" | "GIANG_VIEN" | "SINH_VIEN" | "CAN_BO_PHONG_DAO_TAO";

interface Lop {
    id: number;
    maLop: string;
    tenLop: string;
    nganh: {
        id: number;
        maNganh: string;
        tenNganh: string;
    };
    nienKhoa: {
        id: number;
        maNienKhoa: string;
        tenNienKhoa: string;
    };
}

interface SinhVien {
    id: number;
    maSinhVien: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: GioiTinh;
    diaChi: string;
    email: string;
    sdt: string;
    ngayNhapHoc: string;
    tinhTrang: TinhTrang;
    lop: Lop;
    nguoiDung: NguoiDung;
}

interface NguoiDung {
    id: number;
    tenDangNhap: string;
    vaiTro: VAI_TRO;
    ngayTao: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface NganhOption {
    id: number;
    maNganh: string;
    tenNganh: string;
}

interface NienKhoaOption {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
}

interface LopOption {
    id: number;
    maLop: string;
    tenLop: string;
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

interface ThanhTich {
    id: number;
    loai: LoaiQuyetDinh;
    noiDung: string;
    ngayQuyetDinh: string;
}

interface ThanhTichResponse {
    sinhVien: {
        id: number;
        maSinhVien: string;
        hoTen: string;
        lop: Lop;
    };
    khenThuongKyLuat: ThanhTich[];
}


const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// Hàm chuyển enum tinhTrang thành tên tiếng Việt
const getTinhTrangLabel = (tinhTrang: TinhTrang): string => {
    switch (tinhTrang) {
        case "DANG_HOC":
            return "Đang học";
        case "THOI_HOC":
            return "Thôi học";
        case "DA_TOT_NGHIEP":
            return "Đã tốt nghiệp";
        case "BAO_LUU":
            return "Bảo lưu";
        default:
            return tinhTrang;
    }
};

const getTinhTrangColor = (tinhTrang: TinhTrang): "success" | "error" | "primary" | "warning" => {
    switch (tinhTrang) {
        case "DANG_HOC":
            return "success";
        case "THOI_HOC":
            return "error";
        case "DA_TOT_NGHIEP":
            return "primary";
        case "BAO_LUU":
            return "warning";
    }
};

const getGioiTinhLabel = (gioiTinh: GioiTinh): string => {
    return gioiTinh === "NAM" ? "Nam" : "Nữ";
};

// ==================== SINH VIÊN MODAL ====================
interface SinhVienModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    maSinhVien: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: GioiTinh | "";
    diaChi: string;
    email: string;
    sdt: string;
    ngayNhapHoc: string;
    tinhTrang: TinhTrang | "";
    lopId: string;
    lopOptions: LopOption[];
    onMaSinhVienChange: (value: string) => void;
    onHoTenChange: (value: string) => void;
    onNgaySinhChange: (value: string) => void;
    onGioiTinhChange: (value: GioiTinh | "") => void;
    onDiaChiChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onSdtChange: (value: string) => void;
    onNgayNhapHocChange: (value: string) => void;
    onTinhTrangChange: (value: TinhTrang | "") => void;
    onLopIdChange: (value: string) => void;
    onSearchLop: (search: string) => void;
    onSubmit: () => void;
    errors: {
        maSinhVien: boolean;
        hoTen: boolean;
        ngaySinh: boolean;
        gioiTinh: boolean;
        diaChi: boolean;
        email: boolean;
        sdt: boolean;
        ngayNhapHoc: boolean;
        tinhTrang: boolean;
        lopId: boolean;
    };
}

const SinhVienModal: React.FC<SinhVienModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    maSinhVien,
    hoTen,
    ngaySinh,
    gioiTinh,
    diaChi,
    email,
    sdt,
    ngayNhapHoc,
    tinhTrang,
    lopId,
    lopOptions,
    onMaSinhVienChange,
    onHoTenChange,
    onNgaySinhChange,
    onGioiTinhChange,
    onDiaChiChange,
    onEmailChange,
    onSdtChange,
    onNgayNhapHocChange,
    onTinhTrangChange,
    onLopIdChange,
    onSearchLop,
    onSubmit,
    errors,
}) => {
    const [lopSearchKeyword, setLopSearchKeyword] = useState("");

    if (!isOpen) return null;

    const isDaTotNghiepReadOnly = isEdit && tinhTrang === "DA_TOT_NGHIEP";
    const selectedLop = lopOptions.find((o) => o.id.toString() === lopId);
    const lopDisplayText = selectedLop ? `${selectedLop.maLop} - ${selectedLop.tenLop}` : lopId || "—";

    const gioiTinhOptions = [
        { value: "NAM", label: "Nam" },
        { value: "NU", label: "Nữ" },
    ];

    const tinhTrangOptions = [
        { value: "DANG_HOC", label: "Đang học" },
        { value: "THOI_HOC", label: "Thôi học" },
        { value: "BAO_LUU", label: "Bảo lưu" },
    ];

    // Modal sửa nhưng sinh viên đã tốt nghiệp → chỉ hiển thị thông tin, không cho sửa
    if (isDaTotNghiepReadOnly) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
                <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Thông tin Sinh viên (đã tốt nghiệp)
                    </h3>
                    <div className="mb-6">
                        <Alert
                            variant="warning"
                            title="Không thể sửa"
                            message="Thông tin về sinh viên đã tốt nghiệp có giá trị về mặt pháp lý, không thể sửa."
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mã Sinh viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{maSinhVien || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Họ và Tên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{hoTen || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {ngaySinh ? new Date(ngaySinh).toLocaleDateString("vi-VN") : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Giới tính</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {gioiTinh ? getGioiTinhLabel(gioiTinh as GioiTinh) : "—"}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                            <p className="font-medium text-gray-800 dark:text-white">{diaChi || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-800 dark:text-white">{email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sdt || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày nhập học</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {ngayNhapHoc ? new Date(ngayNhapHoc).toLocaleDateString("vi-VN") : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tình trạng</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {tinhTrang ? getTinhTrangLabel(tinhTrang as TinhTrang) : "—"}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lớp</p>
                            <p className="font-medium text-gray-800 dark:text-white">{lopDisplayText}</p>
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
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Sinh viên" : "Tạo mới Sinh viên"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label>Mã Sinh viên</Label>
                        <Input
                            defaultValue={maSinhVien}
                            onChange={(e) => onMaSinhVienChange(e.target.value)}
                            error={errors.maSinhVien}
                            hint={errors.maSinhVien ? "Mã sinh viên không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Họ và Tên</Label>
                        <Input
                            defaultValue={hoTen}
                            onChange={(e) => onHoTenChange(e.target.value)}
                            error={errors.hoTen}
                            hint={errors.hoTen ? "Họ tên không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Ngày sinh</Label>
                        <Input
                            type="date"
                            defaultValue={ngaySinh}
                            onChange={(e) => onNgaySinhChange(e.target.value)}
                            error={errors.ngaySinh}
                            hint={errors.ngaySinh ? "Ngày sinh không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Giới tính</Label>
                        <SearchableSelect
                            options={gioiTinhOptions}
                            placeholder="Chọn giới tính"
                            onChange={(value) => onGioiTinhChange((value as GioiTinh) || "")}
                            defaultValue={gioiTinh || ""}
                            showSecondary={false}
                        />
                        {errors.gioiTinh && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn giới tính</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Địa chỉ</Label>
                        <Input
                            defaultValue={diaChi}
                            onChange={(e) => onDiaChiChange(e.target.value)}
                            error={errors.diaChi}
                            hint={errors.diaChi ? "Địa chỉ không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            defaultValue={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            error={errors.email}
                            hint={errors.email ? "Email không hợp lệ" : ""}
                        />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input
                            defaultValue={sdt}
                            onChange={(e) => onSdtChange(e.target.value)}
                            error={errors.sdt}
                            hint={errors.sdt ? "Số điện thoại không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Ngày nhập học</Label>
                        <Input
                            type="date"
                            defaultValue={ngayNhapHoc}
                            onChange={(e) => onNgayNhapHocChange(e.target.value)}
                            error={errors.ngayNhapHoc}
                            hint={errors.ngayNhapHoc ? "Ngày nhập học không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Tình trạng</Label>
                        <SearchableSelect
                            options={tinhTrangOptions}
                            placeholder="Chọn tình trạng"
                            onChange={(value) => onTinhTrangChange((value as tinhTrangOptions) || "")}
                            defaultValue={tinhTrang || ""}
                            showSecondary={false}
                        />
                        {errors.tinhTrang && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn tình trạng</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Lớp</Label>
                        <SearchableSelect
                            options={lopOptions.map((lop) => ({
                                value: lop.id.toString(),
                                label: lop.maLop,
                                secondary: lop.tenLop,
                            }))}
                            placeholder="Chọn lớp"
                            onChange={(value) => onLopIdChange(value)}
                            defaultValue={lopId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm trong danh sách..."
                        />
                        {errors.lopId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn lớp</p>
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

// ==================== MODAL XEM CHI TIẾT ====================
interface ViewSinhVienModalProps {
    isOpen: boolean;
    onClose: () => void;
    sinhVien: SinhVien | null;
}

const ViewSinhVienModal: React.FC<ViewSinhVienModalProps> = ({
    isOpen,
    onClose,
    sinhVien,
}) => {
    if (!isOpen || !sinhVien) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết Sinh viên
                </h3>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">

                        {/* Hàng 1 */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mã sinh viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.maSinhVien}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Họ và tên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.hoTen}</p>
                        </div>

                        {/* Hàng 2 */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {new Date(sinhVien.ngaySinh).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Giới tính</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {getGioiTinhLabel(sinhVien.gioiTinh)}
                            </p>
                        </div>

                        {/* Hàng 3 */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.sdt}</p>
                        </div>

                        {/* Hàng 4 */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày nhập học</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {new Date(sinhVien.ngayNhapHoc).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tình trạng</p>
                            <Badge variant="solid" color={getTinhTrangColor(sinhVien.tinhTrang)}>
                                {getTinhTrangLabel(sinhVien.tinhTrang)}
                            </Badge>
                        </div>

                        {/* Hàng 5 */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lớp</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {sinhVien.lop.maLop} - {sinhVien.lop.tenLop}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngành</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {sinhVien.lop.nganh.maNganh} - {sinhVien.lop.nganh.tenNganh}
                            </p>
                        </div>

                        {/* Hàng 6 – Niên khóa */}
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Niên khóa</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {sinhVien.lop.nienKhoa.maNienKhoa} - {sinhVien.lop.nienKhoa.tenNienKhoa}
                            </p>
                        </div>

                        {/* Hàng 7 – Địa chỉ */}
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.diaChi}</p>
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

// ==================== INTERFACES CHO IMPORT EXCEL ====================
interface ImportSinhVienSuccessRow {
    row: number;
    maSinhVien: string;
    hoTen: string;
}

interface ImportSinhVienErrorRow {
    row: number;
    maSinhVien: string;
    error: string;
}

interface ImportSinhVienResult {
    message?: string;
    totalRows?: number;
    success: number;
    failed: number;
    errors?: ImportSinhVienErrorRow[];
    successRows?: ImportSinhVienSuccessRow[];
}

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
    const [importResult, setImportResult] = useState<ImportSinhVienResult | null>(null);
    const [importError, setImportError] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");
    const [hasImported, setHasImported] = useState(false);

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
        const templateUrl = "/templates/mau-nhap-sinh-vien.xlsx";
        const link = document.createElement("a");
        link.href = templateUrl;
        link.download = "mau-nhap-sinh-vien.xlsx";
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

            const res = await fetch("http://localhost:3000/sinh-vien/import", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result: ImportSinhVienResult = await res.json();

            if (res.ok) {
                setImportResult(result);
                setActiveTab(result.failed > 0 ? "error" : "success");
                setHasImported(true);
            } else {
                setImportError((result as any).message || "Nhập sinh viên thất bại");
            }
        } catch (err) {
            setImportError("Có lỗi xảy ra khi nhập sinh viên từ Excel");
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
                    `Đã thêm ${importResult.success} sinh viên${importResult.failed > 0 ? `, ${importResult.failed} lỗi` : ""}`
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
                    Nhập sinh viên bằng Excel
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
                                        {importResult.message || `Đã xử lý ${(importResult.success || 0) + (importResult.failed || 0)} dòng dữ liệu`}
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
                                                        Mã sinh viên
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Họ tên
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
                                                                {row.maSinhVien}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">
                                                            {row.hoTen}
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
                                                    Đã nhập thành công {importResult.success} sinh viên
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
                                                        Mã sinh viên
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
                                                                {err.maSinhVien || 'N/A'}
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

                        {/* Hướng dẫn */}
                        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50 flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faCircleExclamation}
                                        className="text-blue-500"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                        Hướng dẫn nhập sinh viên
                                    </h4>
                                    <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">1.</span>
                                            <span>Tải file mẫu Excel bằng nút bên trên</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">2.</span>
                                            <span>Điền thông tin sinh viên theo định dạng trong file mẫu</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">3.</span>
                                            <span>Các cột bắt buộc: <strong>Mã SV, Họ tên, Ngày sinh, Giới tính, Email, SĐT, Mã lớp</strong></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">4.</span>
                                            <span>Lớp phải tồn tại trong hệ thống trước khi import</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Dropzone */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Chọn file Excel nhập sinh viên</Label>
                            <div
                                className={`transition border-2 border-dashed cursor-pointer rounded-xl 
                                    ${fileError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                                    ${isDragActive ? 'border-brand-500 bg-gray-100 dark:bg-gray-800' : 'hover:border-brand-500 dark:hover:border-brand-500'}
                                `}
                            >
                                <div
                                    {...getRootProps()}
                                    className={`rounded-xl p-8 lg:p-10
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
                                                    Hoặc click để chọn file
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
                                startIcon={isUploading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faFileExcel} />}
                            >
                                {isUploading ? "Đang xử lý..." : "Nhập sinh viên"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

// ==================== MODAL XÉT TỐT NGHIỆP ====================
interface XetTotNghiepModalProps {
    isOpen: boolean;
    onClose: () => void;
    nienKhoaOptions: NienKhoaOption[];
}

const XetTotNghiepModal: React.FC<XetTotNghiepModalProps> = ({
    isOpen,
    onClose,
    nienKhoaOptions,
}) => {
    const [selectedNienKhoaId, setSelectedNienKhoaId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleClose = () => {
        setSelectedNienKhoaId("");
        setError(null);
        setIsLoading(false);
        setIsSuccess(false);
        onClose();
    };

    const handleReset = () => {
        setSelectedNienKhoaId("");
        setError(null);
        setIsSuccess(false);
    };

    const getSelectedNienKhoa = () => {
        return nienKhoaOptions.find(nk => nk.id.toString() === selectedNienKhoaId);
    };


    const handleXetTotNghiep = async () => {
        if (!selectedNienKhoaId) {
            setError("Vui lòng chọn niên khóa");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/sinh-vien/xet-tot-nghiep/thong-ke`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        nienKhoaId: Number(selectedNienKhoaId),
                    }),
                }
            );

            if (res.ok) {
                // Xử lý tải file Excel
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;

                const nienKhoa = getSelectedNienKhoa();
                link.download = `Thống kê sinh viên tốt nghiệp Khoá ${nienKhoa?.maNienKhoa || ''}.xlsx`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                setIsSuccess(true);
            } else {
                const err = await res.json();
                setError(err.message || "Xét tốt nghiệp thất bại");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi xét tốt nghiệp");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <FontAwesomeIcon
                            icon={faGraduationCap}
                            className="text-2xl text-emerald-600 dark:text-emerald-400"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Xét Tốt Nghiệp & Xuất Thống Kê
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Xét và xuất danh sách sinh viên tốt nghiệp theo niên khóa
                        </p>
                    </div>
                </div>

                {/* Hướng dẫn sử dụng */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faCircleExclamation}
                                    className="text-lg text-blue-600 dark: text-blue-400 mt-0.5"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    Hướng dẫn sử dụng
                                </h4>
                                <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1.5">
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                        <span>Chọn <strong>Niên khóa</strong> cần xét tốt nghiệp</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                        <span>Hệ thống sẽ xét tốt nghiệp cho tất cả sinh viên thuộc niên khóa đã chọn</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                                        <span>File Excel thống kê sẽ được trả về sau khi xét xong</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form chọn Niên khóa và Ngành */}
                {!isSuccess && (
                    <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" />
                            Chọn niên khóa xét tốt nghiệp
                        </h4>

                        {/* Chọn Niên khóa */}
                        <div>
                            <Label className="mb-2 block text-sm font-medium">
                                Niên khóa <span className="text-red-500">*</span>
                            </Label>
                            <SearchableSelect
                                options={nienKhoaOptions.map((nk) => ({
                                    value: nk.id.toString(),
                                    label: nk.maNienKhoa,
                                    secondary: nk.tenNienKhoa,
                                }))}
                                placeholder="Chọn niên khóa..."
                                onChange={(value) => {
                                    setSelectedNienKhoaId(value);
                                    setError(null);
                                }}
                                defaultValue={selectedNienKhoaId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm niên khóa..."
                            />
                        </div>

                        {/* Hiển thị thông tin đã chọn */}
                        {(selectedNienKhoaId) && (
                            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Thông tin đã chọn: </p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedNienKhoaId && (
                                        <Badge variant="solid" color="primary">
                                            Niên khóa: {getSelectedNienKhoa()?.tenNienKhoa}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Thông tin file sẽ xuất */}
                {!isSuccess && selectedNienKhoaId && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-900/20">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faFileExcel}
                                        className="text-lg text-emerald-600 dark:text-emerald-400 mt-0.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                                        Thông tin file xuất
                                    </h4>
                                    <ul className="text-sm text-emerald-700/80 dark:text-emerald-300/70 space-y-1.5">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            <span>Định dạng:  <strong>Excel (.xlsx)</strong></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            <span>
                                                Tên file: <strong>Thống kê sinh viên tốt nghiệp Khoá {getSelectedNienKhoa()?.maNienKhoa}.xlsx</strong>
                                            </span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            <span>Nội dung:  Danh sách sinh viên đạt/không đạt tốt nghiệp & xếp loại TN</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hiển thị lỗi */}
                {error && (
                    <div className="mb-6">
                        <Alert
                            variant="error"
                            title="Lỗi"
                            message={error}
                        />
                    </div>
                )}

                {/* Hiển thị thành công */}
                {isSuccess && (
                    <div className="mb-6">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark: bg-emerald-900/20 p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800/50 mb-4">
                                    <FontAwesomeIcon
                                        icon={faCircleCheck}
                                        className="text-3xl text-emerald-600 dark:text-emerald-400"
                                    />
                                </div>
                                <h4 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                                    Xét tốt nghiệp thành công!
                                </h4>
                                <p className="text-sm text-emerald-700/80 dark:text-emerald-300/70 mb-3">
                                    File thống kê đã được tải xuống tự động.
                                </p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Badge variant="solid" color="primary">
                                        Niên khóa: {getSelectedNienKhoa()?.tenNienKhoa}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isLoading && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center">
                        <div className="relative mb-4">
                            <div className="h-16 w-16 rounded-full border-4 border-emerald-100 dark:border-emerald-900/50"></div>
                            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <FontAwesomeIcon
                                    icon={faGraduationCap}
                                    className="text-xl text-emerald-500"
                                />
                            </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Đang xét tốt nghiệp và tạo báo cáo...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Vui lòng đợi trong giây lát
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    {isSuccess ? (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                Xét niên khóa/ngành khác
                            </Button>
                            <Button variant="primary" onClick={handleClose}>
                                Đóng
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleXetTotNghiep}
                                disabled={!selectedNienKhoaId || isLoading}
                                startIcon={
                                    isLoading
                                        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        : <FontAwesomeIcon icon={faGraduationCap} />
                                }
                            >
                                {isLoading ? "Đang xử lý..." : "Xét Tốt Nghiệp"}
                            </Button>
                        </>
                    )}
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
    const router = useRouter();
    const [selectedNamHocId, setSelectedNamHocId] = useState("");
    const [selectedHocKy, setSelectedHocKy] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ namHoc: false, hocKy: false });

    const selectedNamHoc = namHocOptions.find((nh) => nh.id.toString() === selectedNamHocId);
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
            const selectedNamHocData = namHocOptions.find((nh) => nh.id.toString() === selectedNamHocId);
            const selectedHocKyData = hocKyOptions.find((hk) => hk.id.toString() === selectedHocKy);

            if (!selectedNamHocData || !selectedHocKyData) {
                showAlert("error", "Lỗi", "Không tìm thấy thông tin năm học hoặc học kỳ");
                setIsLoading(false);
                return;
            }

            const res = await fetch("http://localhost:3000/bao-cao/de-xuat-hoc-lai", {
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
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `thong-ke-sv-truot-mon-${selectedNamHocData.maNamHoc}-HK${selectedHocKyData.hocKy}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert(
                    "success",
                    "Thành công",
                    "Đã xuất file thống kê sinh viên trượt môn và đề xuất học lại"
                );
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

    const handleViewUI = () => {
        if (!validateForm()) return;

        const selectedNamHocData = namHocOptions.find((nh) => nh.id.toString() === selectedNamHocId);
        const selectedHocKyData = hocKyOptions.find((hk) => hk.id.toString() === selectedHocKy);

        if (!selectedNamHocData || !selectedHocKyData) {
            showAlert("error", "Lỗi", "Không tìm thấy thông tin năm học hoặc học kỳ");
            return;
        }

        // Điều hướng sang giao diện theo maNamHoc và hocKy, dùng Next router để chuyển trang nhanh
        const url = `http://localhost:3001/them-sinh-vien-hoc-lai/${selectedNamHocData.maNamHoc}/hoc-ky/${selectedHocKyData.hocKy}`;
        router.push(url);
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
                        <h3 className="text-xl font-semibold text-gray-800 dark:text:white/90 dark:text-white">
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
                        <div className="space-y-1.5 text-sm text-blue-800 dark:text-blue-100">
                            <p>
                                Chọn <strong>Năm học</strong> và <strong>Học kỳ</strong> để hệ thống thống kê
                                sinh viên trượt môn và đề xuất học lại.
                            </p>
                            <p className="text-blue-700/80 dark:text-blue-200/80">
                                Sau khi chọn xong, bạn có thể:
                            </p>
                            <ul className="list-disc list-inside text-blue-700/80 dark:text-blue-200/80 space-y-0.5">
                                <li>
                                    Nhấn <strong>Xuất thống kê</strong> để tải file Excel, bao gồm thông tin SV và các môn học bị trượt.
                                </li>
                                <li>
                                    Hoặc nhấn <strong>Xem</strong> để chuyển sang giao diện hệ thống hỗ trợ quản
                                    lý đề xuất học lại theo năm học và học kỳ đã chọn.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form chọn Năm học và Học kỳ */}
                <div className="space-y-4 mb-6">
                    <div>
                        <Label className="mb-2 block text-sm font-medium">
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
                                setSelectedHocKy("");
                                setErrors((prev) => ({ ...prev, namHoc: false }));
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

                    <div>
                        <Label className="mb-2 block text-sm font-medium">
                            Học kỳ <span className="text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                            options={hocKyOptions.map((hk) => ({
                                value: hk.id.toString(),
                                label: `Học kỳ ${hk.hocKy}`,
                                secondary: `${new Date(hk.ngayBatDau).toLocaleDateString(
                                    "vi-VN"
                                )} - ${new Date(hk.ngayKetThuc).toLocaleDateString("vi-VN")}`,
                            }))}
                            placeholder={selectedNamHocId ? "Chọn học kỳ" : "Vui lòng chọn năm học trước"}
                            onChange={(value) => {
                                setSelectedHocKy(value);
                                setErrors((prev) => ({ ...prev, hocKy: false }));
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
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleViewUI}
                        disabled={isLoading || !selectedNamHocId || !selectedHocKy}
                        startIcon={<FontAwesomeIcon icon={faEye} />}
                    >
                        Xem
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

// ==================== TRANG CHÍNH QUẢN LÝ SINH VIÊN ====================
export default function QuanLySinhVienPage() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [sinhViens, setSinhViens] = useState<SinhVien[]>([]);
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deletingSinhVien, setDeletingSinhVien] = useState<SinhVien | null>(null);
    const [editingSinhVien, setEditingSinhVien] = useState<SinhVien | null>(null);
    const [viewingSinhVien, setViewingSinhVien] = useState<SinhVien | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    // State cho form
    const [maSinhVien, setMaSinhVien] = useState("");
    const [hoTen, setHoTen] = useState("");
    const [ngaySinh, setNgaySinh] = useState("");
    const [gioiTinh, setGioiTinh] = useState<GioiTinh | "">("");
    const [diaChi, setDiaChi] = useState("");
    const [email, setEmail] = useState("");
    const [sdt, setSdt] = useState("");
    const [ngayNhapHoc, setNgayNhapHoc] = useState("");
    const [tinhTrang, setTinhTrang] = useState<TinhTrang | "">("");
    const [lopId, setLopId] = useState("");

    // State cho filter
    const [filterTinhTrang, setFilterTinhTrang] = useState<TinhTrang | "">("");
    const [filterLopId, setFilterLopId] = useState("");
    const [filterNganhId, setFilterNganhId] = useState("");
    const [filterNienKhoaId, setFilterNienKhoaId] = useState("");

    // State cho options
    const [lopOptions, setLopOptions] = useState<LopOption[]>([]);
    const [nganhOptions, setNganhOptions] = useState<NganhOption[]>([]);
    const [nienKhoaOptions, setNienKhoaOptions] = useState<NienKhoaOption[]>([]);
    const [lopOptionsForModal, setLopOptionsForModal] = useState<LopOption[]>([]);
    const [namHocOptions, setNamHocOptions] = useState<NamHocOption[]>([]);

    // State cho modal khen thưởng/kỷ luật
    const [isThanhTichModalOpen, setIsThanhTichModalOpen] = useState(false);
    const [selectedSinhVienForThanhTich, setSelectedSinhVienForThanhTich] = useState<SinhVien | null>(null);
    const [thanhTichData, setThanhTichData] = useState<ThanhTichResponse | null>(null);
    const [filterLoaiQuyetDinh, setFilterLoaiQuyetDinh] = useState<LoaiQuyetDinh | "">("");

    // State cho modal tạo tài khoản
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
    const [creatingAccountSinhVien, setCreatingAccountSinhVien] = useState<SinhVien | null>(null);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    // State cho modal thêm quyết định
    const [isAddQuyetDinhModalOpen, setIsAddQuyetDinhModalOpen] = useState(false);
    const [selectedSinhVienForAdd, setSelectedSinhVienForAdd] = useState<SinhVien | null>(null);
    const [addLoaiQuyetDinh, setAddLoaiQuyetDinh] = useState<LoaiQuyetDinh | "">("");
    const [addNoiDung, setAddNoiDung] = useState("");
    const [addNgayQuyetDinh, setAddNgayQuyetDinh] = useState("");
    const [addErrors, setAddErrors] = useState({
        loai: false,
        noiDung: false,
        ngayQuyetDinh: false,
    });

    // State cho modal import excel
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
    // State cho modal xét tốt nghiệp
    const [isXetTotNghiepModalOpen, setIsXetTotNghiepModalOpen] = useState(false);
    // State để theo dõi dropdown ĐANG MỞ (chỉ 1 cái duy nhất)
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);

    // State cho modal xuất phiếu điểm
    const [isExportPhieuDiemModalOpen, setIsExportPhieuDiemModalOpen] = useState(false);
    const [exportingPhieuDiemSinhVien, setExportingPhieuDiemSinhVien] = useState<SinhVien | null>(null);
    const [isExportingPhieuDiem, setIsExportingPhieuDiem] = useState(false);

    // State cho modal cấp tài khoản hàng loạt
    const [isBulkCreateAccountModalOpen, setIsBulkCreateAccountModalOpen] = useState(false);
    const [isBulkCreatingAccounts, setIsBulkCreatingAccounts] = useState(false);
    const [bulkCreateResult, setBulkCreateResult] = useState<{
        message: string;
        totalSinhVien: number;
        success: number;
        failed: number;
        errors: Array<{
            sinhVienId: number;
            maSinhVien: string;
            error: string;
        }>;
    } | null>(null);

    // State cho modal thống kê sinh viên trượt môn
    const [isThongKeSVTruotMonModalOpen, setIsThongKeSVTruotMonModalOpen] = useState(false);

    // Mở modal từ thanh search header (?modal=cap-tk-hang-loat | xet-tot-nghiep | thong-ke-truot-mon | nhap-excel)
    useEffect(() => {
        const modal = searchParams.get("modal");
        if (modal === "cap-tk-hang-loat") {
            setIsBulkCreateAccountModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "xet-tot-nghiep") {
            setIsXetTotNghiepModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "thong-ke-truot-mon") {
            setIsThongKeSVTruotMonModalOpen(true);
            router.replace(pathname, { scroll: false });
        } else if (modal === "nhap-excel") {
            setIsImportExcelModalOpen(true);
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);

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

    const toggleHeaderDropdown = () => {
        setIsHeaderDropdownOpen((prev) => !prev);
    };

    const closeHeaderDropdown = () => {
        setIsHeaderDropdownOpen(false);
    };

    const [errors, setErrors] = useState({
        maSinhVien: false,
        hoTen: false,
        ngaySinh: false,
        gioiTinh: false,
        diaChi: false,
        email: false,
        sdt: false,
        ngayNhapHoc: false,
        tinhTrang: false,
        lopId: false,
    });

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    const tinhTrangFilterOptions = [
        { value: "DANG_HOC", label: "Đang học" },
        { value: "THOI_HOC", label: "Thôi học" },
        { value: "DA_TOT_NGHIEP", label: "Đã tốt nghiệp" },
        { value: "BAO_LUU", label: "Bảo lưu" },
    ];

    const loaiQuyetDinhOptions = [
        { value: "KHEN_THUONG", label: "Khen thưởng" },
        { value: "KY_LUAT", label: "Kỷ luật" },
    ];

    // Fetch danh sách sinh viên
    const fetchSinhViens = async (
        page: number = 1,
        search: string = "",
        tinhTrangFilter: TinhTrang | "" = "",
        lopIdFilter: string = "",
        nganhIdFilter: string = "",
        nienKhoaIdFilter: string = ""
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/sinh-vien?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (tinhTrangFilter) url += `&tinhTrang=${tinhTrangFilter}`;
            if (lopIdFilter) url += `&lopId=${lopIdFilter}`;
            if (nganhIdFilter) url += `&nganhId=${nganhIdFilter}`;
            if (nienKhoaIdFilter) url += `&nienKhoaId=${nienKhoaIdFilter}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setSinhViens(json.data);
                setPagination(json.pagination);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách sinh viên");
        }
    };

    // Fetch danh sách lớp và filters
    const fetchLopAndFilters = async (search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/lop?page=1&limit=9999`;
            if (search) url += `?search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                const lops = json.data.map((lop: any) => ({
                    id: lop.id,
                    maLop: lop.maLop,
                    tenLop: lop.tenLop,
                }));
                setLopOptions(lops);
            }

            if (json.filters) {
                if (json.filters.nganh && Array.isArray(json.filters.nganh)) {
                    setNganhOptions(
                        json.filters.nganh.map((n: any) => ({
                            id: n.id,
                            maNganh: n.maNganh,
                            tenNganh: n.tenNganh,
                        }))
                    );
                }
                if (json.filters.nienKhoa && Array.isArray(json.filters.nienKhoa)) {
                    setNienKhoaOptions(
                        json.filters.nienKhoa.map((nk: any) => ({
                            id: nk.id,
                            maNienKhoa: nk.maNienKhoa,
                            tenNienKhoa: nk.tenNienKhoa,
                        }))
                    );
                }
            }
        } catch (err) {
            console.error("Không thể tải danh sách lớp:", err);
        }
    };

    // Fetch danh sách năm học (phục vụ thống kê SV trượt môn)
    const fetchNamHoc = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/nam-hoc?page=1&limit=9999", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
                setNamHocOptions(
                    json.data.map((nh: any) => ({
                        id: nh.id,
                        maNamHoc: nh.maNamHoc,
                        tenNamHoc: nh.tenNamHoc,
                        hocKys: nh.hocKys || [],
                    }))
                );
            }
        } catch (err) {
            console.error("Không thể tải danh sách năm học:", err);
        }
    };

    // Fetch lớp cho modal
    const fetchLopForModal = async (search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/lop?page=1&limit=9999`;
            if (search) url += `?search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setLopOptionsForModal(
                    json.data.map((lop: any) => ({
                        id: lop.id,
                        maLop: lop.maLop,
                        tenLop: lop.tenLop,
                    }))
                );
            }
        } catch (err) {
            console.error("Không thể tải danh sách lớp:", err);
        }
    };

    useEffect(() => {
        fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
    }, [currentPage]);

    useEffect(() => {
        fetchLopAndFilters();
        fetchNamHoc();
    }, []);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchSinhViens(1, searchKeyword.trim(), filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchSinhViens(1, searchKeyword.trim(), filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
    };

    const handleResetFilter = () => {
        setFilterTinhTrang("");
        setFilterLopId("");
        setFilterNganhId("");
        setFilterNienKhoaId("");
        setSearchKeyword("");
        setCurrentPage(1);
        fetchSinhViens(1, "", "", "", "", "");
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const newErrors = {
            maSinhVien: !maSinhVien.trim(),
            hoTen: !hoTen.trim(),
            ngaySinh: !ngaySinh,
            gioiTinh: gioiTinh === "",
            diaChi: !diaChi.trim(),
            email: !email.trim() || !emailRegex.test(email),
            sdt: !sdt.trim(),
            ngayNhapHoc: !ngayNhapHoc,
            tinhTrang: tinhTrang === "",
            lopId: !lopId,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const resetForm = () => {
        setMaSinhVien("");
        setHoTen("");
        setNgaySinh("");
        setGioiTinh("");
        setDiaChi("");
        setEmail("");
        setSdt("");
        setNgayNhapHoc("");
        setTinhTrang("");
        setLopId("");
        setErrors({
            maSinhVien: false,
            hoTen: false,
            ngaySinh: false,
            gioiTinh: false,
            diaChi: false,
            email: false,
            sdt: false,
            ngayNhapHoc: false,
            tinhTrang: false,
            lopId: false,
        });
    };

    const formatToYMD = (input: any) => {
        if (!input) return "";

        // Nếu input là Date object
        if (input instanceof Date && !isNaN(input as any)) {
            const yyyy = input.getFullYear();
            const mm = String(input.getMonth() + 1).padStart(2, "0");
            const dd = String(input.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
        }

        // Nếu dạng yyyy-mm-dd → trả luôn
        if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
            return input;
        }

        // Nếu dạng dd/mm/yyyy → convert
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
            const [dd, mm, yyyy] = input.split("/");
            return `${yyyy}-${mm}-${dd}`;
        }

        // Nếu dạng mm/dd/yyyy → convert theo Mỹ
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
            const [mm, dd, yyyy] = input.split("/");
            return `${yyyy}-${mm}-${dd}`;
        }

        // Nếu timestamp (số)
        if (!isNaN(Number(input))) {
            const date = new Date(Number(input));
            if (!isNaN(date as any)) {
                return formatToYMD(date);
            }
        }

        // fallback — thử parse
        const date = new Date(input);
        if (!isNaN(date as any)) {
            return formatToYMD(date);
        }

        return ""; // Không parse được
    };


    const handleCreate = async () => {
        if (!validateForm()) return;

        const ngaySinhFormatted = formatToYMD(ngaySinh);
        const ngayNhapHocFormatted = formatToYMD(ngayNhapHoc);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/sinh-vien", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maSinhVien: maSinhVien.trim(),
                    hoTen: hoTen.trim(),
                    ngaySinh: ngaySinhFormatted,
                    gioiTinh,
                    diaChi: diaChi.trim(),
                    email: email.trim(),
                    sdt: sdt.trim(),
                    ngayNhapHoc: ngayNhapHocFormatted,
                    tinhTrang,
                    lopId: Number(lopId),
                }),
            });

            setIsCreateModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Tạo mới sinh viên thành công");
                resetForm();
                fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo mới thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo sinh viên");
        } finally {
            setIsCreateModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const handleUpdate = async () => {
        if (!editingSinhVien || !validateForm()) return;

        const ngaySinhFormatted = formatToYMD(ngaySinh);
        const ngayNhapHocFormatted = formatToYMD(ngayNhapHoc);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/sinh-vien/${editingSinhVien.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maSinhVien: maSinhVien.trim(),
                    hoTen: hoTen.trim(),
                    ngaySinh: ngaySinhFormatted,
                    gioiTinh,
                    diaChi: diaChi.trim(),
                    email: email.trim(),
                    sdt: sdt.trim(),
                    ngayNhapHoc: ngayNhapHocFormatted,
                    tinhTrang,
                    lopId: Number(lopId),
                }),
            });

            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật sinh viên thành công");
                resetForm();
                fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
        } finally {
            setIsEditModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openDeleteModal = (sinhVien: SinhVien) => {
        setDeletingSinhVien(sinhVien);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingSinhVien) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/sinh-vien/${deletingSinhVien.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa sinh viên thành công");
                setDeletingSinhVien(null);
                fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        } finally {
            setIsDeleteModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Xử lý tạo tài khoản hàng loạt
    const handleBulkCreateAccounts = async () => {
        setIsBulkCreatingAccounts(true);
        setBulkCreateResult(null);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                "http://localhost:3000/auth/users/sinh-vien/auto-create-accounts",
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
                fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
            } else {
                showAlert("error", "Lỗi", result.message || "Tạo tài khoản hàng loạt thất bại");
                setIsBulkCreateAccountModalOpen(false);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo tài khoản hàng loạt");
            setIsBulkCreateAccountModalOpen(false);
        } finally {
            setIsBulkCreatingAccounts(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Đóng modal và reset state
    const closeBulkCreateModal = () => {
        setIsBulkCreateAccountModalOpen(false);
        setBulkCreateResult(null);
    };

    // Mở modal xuất phiếu điểm
    const openExportPhieuDiemModal = (sinhVien: SinhVien) => {
        setExportingPhieuDiemSinhVien(sinhVien);
        setIsExportPhieuDiemModalOpen(true);
    };

    // Đóng modal xuất phiếu điểm
    const closeExportPhieuDiemModal = () => {
        setIsExportPhieuDiemModalOpen(false);
        setExportingPhieuDiemSinhVien(null);
    };

    // Xử lý xuất phiếu điểm
    const handleExportPhieuDiem = async () => {
        if (!exportingPhieuDiemSinhVien) return;

        setIsExportingPhieuDiem(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/bao-cao/phieu-diem/${exportingPhieuDiemSinhVien.id}`,
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
                link.download = `Bảng điểm cá nhân của SV ${exportingPhieuDiemSinhVien.maSinhVien}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert("success", "Thành công", `Đã xuất phiếu điểm cho sinh viên ${exportingPhieuDiemSinhVien.hoTen}`);
                closeExportPhieuDiemModal();
            } else {
                const err = await res.json();
                closeExportPhieuDiemModal();
                showAlert("error", "Lỗi", err.message || "Không thể xuất phiếu điểm");
            }
        } catch (err) {
            console.error("Lỗi xuất phiếu điểm:", err);
            closeExportPhieuDiemModal();
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xuất phiếu điểm");
        } finally {
            setIsExportingPhieuDiem(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const openEditModal = (sinhVien: SinhVien) => {
        setEditingSinhVien(sinhVien);
        setMaSinhVien(sinhVien.maSinhVien);
        setHoTen(sinhVien.hoTen);
        setNgaySinh(sinhVien.ngaySinh);
        setGioiTinh(sinhVien.gioiTinh);
        setDiaChi(sinhVien.diaChi);
        setEmail(sinhVien.email);
        setSdt(sinhVien.sdt);
        setNgayNhapHoc(sinhVien.ngayNhapHoc);
        setTinhTrang(sinhVien.tinhTrang);
        setLopId(sinhVien.lop.id.toString());
        fetchLopForModal();
        setIsEditModalOpen(true);
    };

    const openViewModal = (sinhVien: SinhVien) => {
        setViewingSinhVien(sinhVien);
        setIsViewModalOpen(true);
    };

    const openCreateModal = () => {
        resetForm();
        fetchLopForModal();
        setIsCreateModalOpen(true);
    };

    // Fetch danh sách khen thưởng/kỷ luật
    const fetchThanhTich = async (sinhVienId: number, loai: LoaiQuyetDinh | "" = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/sinh-vien/thanh-tich/${sinhVienId}`;
            if (loai) url += `?loai=${loai}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (res.ok) {
                setThanhTichData(json);
            } else {
                showAlert("error", "Lỗi", "Không thể tải danh sách khen thưởng/kỷ luật");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
        }
    };

    // Xóa quyết định khen thưởng/kỷ luật
    const handleDeleteQuyetDinh = async (quyetDinhId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa quyết định này?")) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/sinh-vien/khen-thuong/${quyetDinhId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            closeThanhTichModal();
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa quyết định thành công");
                // Refresh danh sách
                if (selectedSinhVienForThanhTich) {
                    fetchThanhTich(selectedSinhVienForThanhTich.id, filterLoaiQuyetDinh);
                }
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            closeThanhTichModal();
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        } finally {
            setIsThanhTichModalOpen(false);
            setSelectedSinhVienForThanhTich(null);
            setThanhTichData(null);
            setFilterLoaiQuyetDinh("");
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Mở modal xem khen thưởng/kỷ luật
    const openThanhTichModal = (sinhVien: SinhVien) => {
        setSelectedSinhVienForThanhTich(sinhVien);
        setFilterLoaiQuyetDinh("");
        fetchThanhTich(sinhVien.id);
        setIsThanhTichModalOpen(true);
    };

    // Đóng modal xem khen thưởng/kỷ luật
    const closeThanhTichModal = () => {
        setIsThanhTichModalOpen(false);
        setSelectedSinhVienForThanhTich(null);
        setThanhTichData(null);
        setFilterLoaiQuyetDinh("");
    };

    // Lọc khen thưởng/kỷ luật
    const handleFilterThanhTich = () => {
        if (selectedSinhVienForThanhTich) {
            fetchThanhTich(selectedSinhVienForThanhTich.id, filterLoaiQuyetDinh);
        }
    };

    // Mở modal thêm quyết định
    const openAddQuyetDinhModal = (sinhVien: SinhVien) => {
        setSelectedSinhVienForAdd(sinhVien);
        setAddLoaiQuyetDinh("");
        setAddNoiDung("");
        setAddNgayQuyetDinh("");
        setAddErrors({ loai: false, noiDung: false, ngayQuyetDinh: false });
        setIsAddQuyetDinhModalOpen(true);
    };

    // Đóng modal thêm quyết định
    const closeAddQuyetDinhModal = () => {
        setIsAddQuyetDinhModalOpen(false);
        setSelectedSinhVienForAdd(null);
        setAddLoaiQuyetDinh("");
        setAddNoiDung("");
        setAddNgayQuyetDinh("");
        setAddErrors({ loai: false, noiDung: false, ngayQuyetDinh: false });
    };

    // Thêm quyết định khen thưởng/kỷ luật
    const handleAddQuyetDinh = async () => {
        const newErrors = {
            loai: addLoaiQuyetDinh === "",
            noiDung: !addNoiDung.trim(),
            ngayQuyetDinh: !addNgayQuyetDinh,
        };
        setAddErrors(newErrors);

        if (Object.values(newErrors).some((e) => e)) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/sinh-vien/khen-thuong/${selectedSinhVienForAdd?.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    loai: addLoaiQuyetDinh,
                    noiDung: addNoiDung.trim(),
                    ngayQuyetDinh: addNgayQuyetDinh,
                }),
            });

            if (res.ok) {
                showAlert("success", "Thành công", "Thêm quyết định thành công");
                closeAddQuyetDinhModal();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm quyết định thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm quyết định");
        } finally {
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            closeAddQuyetDinhModal();
        }
    };

    // Hàm chuyển loại quyết định thành label
    const getLoaiQuyetDinhLabel = (loai: LoaiQuyetDinh): string => {
        return loai === "KHEN_THUONG" ? "Khen thưởng" : "Kỷ luật";
    };

    // Hàm lấy màu badge cho loại quyết định
    const getLoaiQuyetDinhColor = (loai: LoaiQuyetDinh): "success" | "error" => {
        return loai === "KHEN_THUONG" ? "success" : "error";
    };

    // Mở modal tạo tài khoản
    const openCreateAccountModal = (sinhVien: SinhVien) => {
        setCreatingAccountSinhVien(sinhVien);
        setIsCreateAccountModalOpen(true);
    };

    // Xử lý tạo tài khoản
    const handleCreateAccount = async () => {
        if (!creatingAccountSinhVien) return;

        setIsCreatingAccount(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/auth/users/sinh-vien/${creatingAccountSinhVien.id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsCreateAccountModalOpen(false);
            setCreatingAccountSinhVien(null);

            if (res.ok) {
                showAlert(
                    "success",
                    "Thành công",
                    `Đã tạo tài khoản cho sinh viên "${creatingAccountSinhVien.hoTen}" với mật khẩu mặc định:  123456`
                );
                // Refresh lại danh sách để cập nhật trạng thái nguoiDung
                fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo tài khoản thất bại");
            }
        } catch (err) {
            setIsCreateAccountModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo tài khoản");
        } finally {
            setIsCreatingAccount(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    const DeleteConfirmModal = () => (
        <div className="p-6 sm:p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa sinh viên
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa sinh viên{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingSinhVien?.hoTen}
                </span>{" "}
                (MSV:  {deletingSinhVien?.maSinhVien})?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingSinhVien(null);
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
            <PageBreadcrumb pageTitle="Quản lý Sinh viên" />

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
                            duration={15000}
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
                                placeholder="Tìm kiếm sinh viên theo tên hoặc mã sinh viên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                                        openCreateModal();
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="w-4" />
                                    Tạo mới Sinh viên
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
                                        setIsBulkCreateAccountModalOpen(true);
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faUsersGear} className="w-4" />
                                    Cấp tài khoản hàng loạt
                                </DropdownItem>

                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsXetTotNghiepModalOpen(true);
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md"
                                >
                                    <FontAwesomeIcon icon={faGraduationCap} className="w-4" />
                                    Xét tốt nghiệp
                                </DropdownItem>

                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                <DropdownItem
                                    tag="button"
                                    onClick={() => {
                                        setIsThongKeSVTruotMonModalOpen(true);
                                        closeHeaderDropdown();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                                >
                                    <FontAwesomeIcon icon={faUserXmark} className="w-4" />
                                    TK SV trượt môn
                                </DropdownItem>
                            </div>
                        </Dropdown>
                    </div>
                </div>

                {/* Khối lọc */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Label className="block mb-3 text-base font-medium">Bộ lọc</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Lọc theo Tình trạng */}
                        <div>
                            <Label className="block mb-2 text-sm">Tình trạng</Label>
                            <SearchableSelect
                                options={tinhTrangFilterOptions}
                                placeholder="Tất cả tình trạng"
                                onChange={(value) => setFilterTinhTrang((value as TinhTrang) || "")}
                                defaultValue={filterTinhTrang || ""}
                                showSecondary={false}
                            />
                        </div>

                        {/* Lọc theo Lớp */}
                        <div>
                            <Label className="block mb-2 text-sm">Lớp</Label>
                            <SearchableSelect
                                options={lopOptions.map((lop) => ({
                                    value: lop.id.toString(),
                                    label: lop.maLop,
                                    secondary: lop.tenLop,
                                }))}
                                placeholder="Tất cả lớp"
                                onChange={(value) => setFilterLopId(value)}
                                defaultValue={filterLopId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm lớp..."
                            />
                        </div>

                        {/* Lọc theo Ngành */}
                        <div>
                            <Label className="block mb-2 text-sm">Ngành</Label>
                            <SearchableSelect
                                options={nganhOptions.map((nganh) => ({
                                    value: nganh.id.toString(),
                                    label: nganh.maNganh,
                                    secondary: nganh.tenNganh,
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
                        <div className="min-w-[1000px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[12%_21%_14%_14%_12%_12%_15%]">
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã SV
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Họ tên
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Tình trạng
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Lớp
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Ngành
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Niên khóa
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {sinhViens.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 col-span-7">
                                                Không có dữ liệu sinh viên
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sinhViens.map((sv) => (
                                            <TableRow key={sv.id} className="grid grid-cols-[12%_21%_14%_14%_12%_12%_15%] items-center">
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.maSinhVien}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.hoTen}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={getTinhTrangColor(sv.tinhTrang)}>
                                                        {getTinhTrangLabel(sv.tinhTrang)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.lop.maLop}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.lop.nganh.maNganh}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.lop.nienKhoa.maNienKhoa}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(sv.id)}
                                                            className="dropdown-toggle flex items-center gap-1.5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === sv.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === sv.id}
                                                            onClose={closeDropdown}
                                                            className="w-56 mt-2 right-0"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    disabled={sv.nguoiDung !== null && sv.nguoiDung !== undefined}
                                                                    onClick={() => {
                                                                        if (!sv.nguoiDung) {
                                                                            openCreateAccountModal(sv);
                                                                        }
                                                                    }}
                                                                    className={sv.nguoiDung ? "opacity-50 cursor-not-allowed" : ""}
                                                                >
                                                                    <FontAwesomeIcon icon={faUserPlus} className="mr-2 w-4" />
                                                                    {sv.nguoiDung ? "Đã có tài khoản" : "Tạo tài khoản"}
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openViewModal(sv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openEditModal(sv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-2 w-4" />
                                                                    Chỉnh sửa
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openAddQuyetDinhModal(sv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faMedal} className="mr-2 w-4" />
                                                                    Thêm quyết định
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openThanhTichModal(sv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 w-4" />
                                                                    Xem thành tích
                                                                </DropdownItem>

                                                                {/* THÊM MỚI - Xuất phiếu điểm */}
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openExportPhieuDiemModal(sv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFileInvoice} className="mr-2 w-4" />
                                                                    Xuất phiếu điểm
                                                                </DropdownItem>

                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteModal(sv)}
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

            {/* Modal Tạo mới & Sửa */}
            <SinhVienModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingSinhVien(null);
                }}
                isEdit={isEditModalOpen}
                maSinhVien={maSinhVien}
                hoTen={hoTen}
                ngaySinh={ngaySinh}
                gioiTinh={gioiTinh}
                diaChi={diaChi}
                email={email}
                sdt={sdt}
                ngayNhapHoc={ngayNhapHoc}
                tinhTrang={tinhTrang}
                lopId={lopId}
                lopOptions={lopOptionsForModal}
                onMaSinhVienChange={setMaSinhVien}
                onHoTenChange={setHoTen}
                onNgaySinhChange={setNgaySinh}
                onGioiTinhChange={setGioiTinh}
                onDiaChiChange={setDiaChi}
                onEmailChange={setEmail}
                onSdtChange={setSdt}
                onNgayNhapHocChange={setNgayNhapHoc}
                onTinhTrangChange={setTinhTrang}
                onLopIdChange={setLopId}
                onSearchLop={fetchLopForModal}
                onSubmit={isEditModalOpen ? handleUpdate : handleCreate}
                errors={errors}
            />

            {/* Modal Xem chi tiết */}
            <ViewSinhVienModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingSinhVien(null);
                }}
                sinhVien={viewingSinhVien}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingSinhVien(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            {/* Modal Xem danh sách Khen thưởng/Kỷ luật */}
            <Modal
                isOpen={isThanhTichModalOpen}
                onClose={closeThanhTichModal}
                className="max-w-6xl"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Khen thưởng & Kỷ luật
                    </h3>

                    {/* Thông tin sinh viên */}
                    {thanhTichData && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Mã sinh viên</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{thanhTichData.sinhVien.maSinhVien}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Họ tên</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{thanhTichData.sinhVien.hoTen}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Lớp</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{thanhTichData.sinhVien.lop.maLop}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Ngành</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{thanhTichData.sinhVien.lop.nganh.tenNganh}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bộ lọc */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 sm:max-w-xs">
                            <SearchableSelect
                                options={loaiQuyetDinhOptions}
                                placeholder="Tất cả loại quyết định"
                                onChange={(value) => setFilterLoaiQuyetDinh((value as LoaiQuyetDinh) || "")}
                                defaultValue={filterLoaiQuyetDinh}
                                showSecondary={false}
                            />
                        </div>
                        <Button onClick={handleFilterThanhTich} className="h-11">
                            Lọc
                        </Button>
                    </div>

                    {/* Bảng danh sách */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Loại quyết định
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Nội dung
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Ngày quyết định
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                    {thanhTichData?.khenThuongKyLuat && thanhTichData.khenThuongKyLuat.length > 0 ? (
                                        thanhTichData.khenThuongKyLuat.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <Badge variant="solid" color={getLoaiQuyetDinhColor(item.loai)}>
                                                        {getLoaiQuyetDinhLabel(item.loai)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-400">
                                                    <div
                                                        className="max-w-[220px] truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                                        title={item.noiDung || ""}
                                                    >
                                                        {item.noiDung || "-"}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-center">
                                                    {new Date(item.ngayQuyetDinh).toLocaleDateString("vi-VN")}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteQuyetDinh(item.id)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu khen thưởng/kỷ luật
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button variant="outline" onClick={closeThanhTichModal}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Thêm Quyết định Khen thưởng/Kỷ luật */}
            <Modal
                isOpen={isAddQuyetDinhModalOpen}
                onClose={closeAddQuyetDinhModal}
                className="max-w-lg"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Thêm Quyết định Khen thưởng/Kỷ luật
                    </h3>

                    {/* Thông tin sinh viên */}
                    {selectedSinhVienForAdd && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sinh viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {selectedSinhVienForAdd.maSinhVien} - {selectedSinhVienForAdd.hoTen}
                            </p>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <Label>Loại quyết định</Label>
                            <SearchableSelect
                                options={loaiQuyetDinhOptions}
                                placeholder="Chọn loại quyết định"
                                onChange={(value) => setAddLoaiQuyetDinh((value as LoaiQuyetDinh) || "")}
                                defaultValue={addLoaiQuyetDinh}
                                showSecondary={false}
                            />
                            {addErrors.loai && (
                                <p className="mt-1 text-sm text-error-500">Vui lòng chọn loại quyết định</p>
                            )}
                        </div>

                        <div>
                            <Label>Nội dung</Label>
                            <TextArea
                                defaultValue={addNoiDung}
                                rows={4}
                                onChange={(value) => setAddNoiDung(value)}
                                placeholder="Nhập nội dung quyết định..."
                                error={addErrors.noiDung}
                                hint={addErrors.noiDung ? "Nội dung không được để trống" : ""}
                            />
                        </div>

                        <div>
                            <Label>Ngày quyết định</Label>
                            <Input
                                type="date"
                                defaultValue={addNgayQuyetDinh}
                                onChange={(e) => setAddNgayQuyetDinh(e.target.value)}
                                error={addErrors.ngayQuyetDinh}
                                hint={addErrors.ngayQuyetDinh ? "Ngày quyết định không được để trống" : ""}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button variant="outline" onClick={closeAddQuyetDinhModal}>
                            Hủy
                        </Button>
                        <Button onClick={handleAddQuyetDinh}>
                            Thêm
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Import Excel */}
            <ImportSinhVienExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onSuccess={() => {
                    fetchSinhViens(currentPage, searchKeyword, filterTinhTrang, filterLopId, filterNganhId, filterNienKhoaId);
                }}
                showAlert={showAlert}
            />

            {/* Modal Xét Tốt Nghiệp */}
            <XetTotNghiepModal
                isOpen={isXetTotNghiepModalOpen}
                onClose={() => setIsXetTotNghiepModalOpen(false)}
                nienKhoaOptions={nienKhoaOptions}
            />

            {/* Modal Thống kê SV trượt môn */}
            <ThongKeSVTruotMonModal
                isOpen={isThongKeSVTruotMonModalOpen}
                onClose={() => setIsThongKeSVTruotMonModalOpen(false)}
                namHocOptions={namHocOptions}
                showAlert={showAlert}
            />

            {/* Modal Tạo tài khoản */}
            <Modal
                isOpen={isCreateAccountModalOpen}
                onClose={() => {
                    if (!isCreatingAccount) {
                        setIsCreateAccountModalOpen(false);
                        setCreatingAccountSinhVien(null);
                    }
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserPlus} className="text-brand-500" />
                        Tạo tài khoản hệ thống
                    </h3>

                    {/* Thông tin sinh viên */}
                    {creatingAccountSinhVien && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Mã SV:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountSinhVien.maSinhVien}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Họ tên:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountSinhVien.hoTen}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountSinhVien.email}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Lớp:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountSinhVien.lop.maLop} - {creatingAccountSinhVien.lop.tenLop}
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
                            <li>Tên đăng nhập:  <strong>{creatingAccountSinhVien?.maSinhVien}</strong></li>
                            <li>Vai trò:  <strong>Sinh viên</strong></li>
                            <li>Mật khẩu mặc định: <strong>123456</strong></li>
                        </ul>
                    </div>

                    {/* Cảnh báo */}
                    <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            ⚠️ Vui lòng thông báo cho sinh viên đổi mật khẩu sau khi đăng nhập lần đầu.
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Bạn có chắc chắn muốn tạo tài khoản hệ thống cho sinh viên{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {creatingAccountSinhVien?.hoTen}
                        </span>?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateAccountModalOpen(false);
                                setCreatingAccountSinhVien(null);
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
                                Tạo tài khoản cho tất cả sinh viên chưa có tài khoản
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
                                                    <span>Tên đăng nhập: <strong>Mã sinh viên</strong></span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>Mật khẩu mặc định: <strong>123456</strong></span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    <span>Vai trò: <strong>Sinh viên</strong></span>
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
                                                Vui lòng thông báo cho các sinh viên đổi mật khẩu sau khi đăng nhập lần đầu để đảm bảo an toàn tài khoản.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                                Hệ thống sẽ tự động tạo tài khoản cho <strong>tất cả sinh viên chưa có tài khoản</strong>.
                                <br />Sinh viên đã có tài khoản sẽ được bỏ qua.
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
                                        {bulkCreateResult.totalSinhVien ? bulkCreateResult.totalSinhVien : 0}
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
                                            Đã tạo thành công <strong>{bulkCreateResult.success}</strong> tài khoản sinh viên
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
                                                    <th className="px-3 py-2 text-left text-red-700 dark:text-red-300 font-medium">Mã SV</th>
                                                    <th className="px-3 py-2 text-left text-red-700 dark:text-red-300 font-medium">Lỗi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                                                {bulkCreateResult.errors.map((err, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-2 text-red-800 dark:text-red-200 font-medium">
                                                            {err.maSinhVien}
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

            {/* Modal Xuất phiếu điểm cá nhân */}
            <Modal
                isOpen={isExportPhieuDiemModalOpen}
                onClose={() => {
                    if (!isExportingPhieuDiem) {
                        closeExportPhieuDiemModal();
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
                    {exportingPhieuDiemSinhVien && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Mã sinh viên:</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {exportingPhieuDiemSinhVien.maSinhVien}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Họ tên:</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {exportingPhieuDiemSinhVien.hoTen}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Lớp:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {exportingPhieuDiemSinhVien.lop.maLop}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Ngành:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {exportingPhieuDiemSinhVien.lop.nganh.tenNganh}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Niên khóa:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {exportingPhieuDiemSinhVien.lop.nienKhoa.tenNienKhoa}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Tình trạng:</span>
                                    <Badge variant="solid" color={getTinhTrangColor(exportingPhieuDiemSinhVien.tinhTrang)}>
                                        {getTinhTrangLabel(exportingPhieuDiemSinhVien.tinhTrang)}
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
                                            <span>Tên file: <strong>Bảng điểm cá nhân của SV {exportingPhieuDiemSinhVien?.maSinhVien}</strong></span>
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
                            onClick={closeExportPhieuDiemModal}
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
}