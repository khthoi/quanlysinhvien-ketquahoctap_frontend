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
import { FaAngleDown } from "react-icons/fa6";
import Checkbox from "@/components/form/input/Checkbox";
import Switch from "@/components/form/switch/Switch";
import { useDropzone } from "react-dropzone";

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
    giangVien: GiangVien;
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

const TRANG_THAI_OPTIONS: { label: string; value: TrangThai | "" }[] = [
    { label: "Đang diễn ra", value: "DANG_HOC" },
    { label: "Đã kết thúc", value: "DA_KET_THUC" },
    { label: "Chưa bắt đầu", value: "CHUA_BAT_DAU" },
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
                                {lopHocPhan.giangVien.maGiangVien} - {lopHocPhan.giangVien.hoTen}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email giảng viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{lopHocPhan.giangVien.email}</p>
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
    monHocOptions: MonHocOption[];
    giangVienOptions: GiangVienOption[];
    nienKhoaOptions: NienKhoaOption[];
    khoaOptions: KhoaOption[];
    nganhOptions: NganhOption[];
    // Form values
    maLopHocPhan: string;
    monHocId: string;
    giangVienId: string;
    namHocId: string;
    nienKhoaId: string;
    khoaId: string;
    nganhId: string;
    ghiChu: string;
    // Handlers
    onMaLopHocPhanChange: (value: string) => void;
    onMonHocIdChange: (value: string) => void;
    onGiangVienIdChange: (value: string) => void;
    onNienKhoaIdChange: (value: string) => void;
    onKhoaIdChange: (value: string) => void;
    onNganhIdChange: (value: string) => void;
    onGhiChuChange: (value: string) => void;
    onSubmit: () => void;
    errors: {
        maLopHocPhan: boolean;
        monHocId: boolean;
        giangVienId: boolean;
        nienKhoaId: boolean;
        nganhId: boolean;
    };
}

const EditLopHocPhanModal: React.FC<EditLopHocPhanModalProps> = ({
    isOpen,
    onClose,
    lopHocPhan,
    monHocOptions,
    giangVienOptions,
    nienKhoaOptions,
    khoaOptions,
    nganhOptions,
    maLopHocPhan,
    monHocId,
    giangVienId,
    nienKhoaId,
    khoaId,
    nganhId,
    ghiChu,
    onMaLopHocPhanChange,
    onMonHocIdChange,
    onGiangVienIdChange,
    onNienKhoaIdChange,
    onKhoaIdChange,
    onNganhIdChange,
    onGhiChuChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    // Lọc ngành theo khoa đã chọn
    const nganhFilteredOptions = nganhOptions.filter(n => n.khoa.id.toString() === khoaId);

    // Lọc giảng viên theo môn học đã chọn
    const giangVienFilteredOptions = giangVienOptions.filter(gv =>
        gv.monHocGiangViens.some(mhgv => mhgv.monHoc.id.toString() === monHocId)
    );

    const khoaDiemOptions = [
        { value: "false", label: "Chưa khóa" },
        { value: "true", label: "Đã khóa" },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Sửa Lớp Học Phần
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <Label>Mã Lớp Học Phần</Label>
                        <Input
                            defaultValue={maLopHocPhan}
                            onChange={(e) => onMaLopHocPhanChange(e.target.value)}
                            error={errors.maLopHocPhan}
                            hint={errors.maLopHocPhan ? "Mã lớp học phần không được để trống" : ""}
                        />
                    </div>

                    {/* Môn học */}
                    <div>
                        <Label>Môn học</Label>
                        <SearchableSelect
                            options={monHocOptions.map((mh) => ({
                                value: mh.id.toString(),
                                label: mh.maMonHoc,
                                secondary: mh.tenMonHoc,
                            }))}
                            placeholder="Chọn môn học"
                            onChange={(value) => {
                                onMonHocIdChange(value);
                                onGiangVienIdChange(""); // Reset giảng viên khi đổi môn học
                            }}
                            defaultValue={monHocId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm môn học..."
                        />
                        {errors.monHocId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn môn học</p>
                        )}
                    </div>

                    {/* Giảng viên - phụ thuộc vào môn học */}
                    <div>
                        <Label>Giảng viên</Label>
                        <SearchableSelect
                            options={giangVienFilteredOptions.map((gv) => ({
                                value: gv.id.toString(),
                                label: gv.maGiangVien,
                                secondary: gv.hoTen,
                            }))}
                            placeholder={monHocId ? "Chọn giảng viên" : "Vui lòng chọn môn học trước"}
                            onChange={(value) => onGiangVienIdChange(value)}
                            defaultValue={giangVienId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm giảng viên..."
                            disabled={!monHocId}
                        />
                        {errors.giangVienId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn giảng viên</p>
                        )}
                    </div>

                    {/* Niên khóa */}
                    <div>
                        <Label>Niên khóa</Label>
                        <SearchableSelect
                            options={nienKhoaOptions.map((nk) => ({
                                value: nk.id.toString(),
                                label: nk.maNienKhoa,
                                secondary: nk.tenNienKhoa,
                            }))}
                            placeholder="Chọn niên khóa"
                            onChange={(value) => onNienKhoaIdChange(value)}
                            defaultValue={nienKhoaId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm niên khóa..."
                        />
                        {errors.nienKhoaId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn niên khóa</p>
                        )}
                    </div>

                    {/* Khoa */}
                    <div>
                        <Label>Khoa</Label>
                        <SearchableSelect
                            options={khoaOptions.map((k) => ({
                                value: k.id.toString(),
                                label: k.maKhoa,
                                secondary: k.tenKhoa,
                            }))}
                            placeholder="Chọn khoa"
                            onChange={(value) => {
                                onKhoaIdChange(value);
                                onNganhIdChange(""); // Reset ngành khi đổi khoa
                            }}
                            defaultValue={khoaId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm khoa..."
                        />
                    </div>

                    {/* Ngành - phụ thuộc vào khoa */}
                    <div>
                        <Label>Ngành</Label>
                        <SearchableSelect
                            options={nganhFilteredOptions.map((n) => ({
                                value: n.id.toString(),
                                label: n.maNganh,
                                secondary: n.tenNganh,
                            }))}
                            placeholder={khoaId ? "Chọn ngành" : "Vui lòng chọn khoa trước"}
                            onChange={(value) => onNganhIdChange(value)}
                            defaultValue={nganhId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm ngành..."
                            disabled={!khoaId}
                        />
                        {errors.nganhId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn ngành</p>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div className="md:col-span-2">
                        <Label>Ghi chú</Label>
                        <TextArea
                            defaultValue={ghiChu}
                            rows={3}
                            onChange={(value) => onGhiChuChange(value)}
                            placeholder="Nhập ghi chú..."
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        Cập nhật
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

    const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError("");

        if (rejectedFiles.length > 0) {
            setFileError("Chỉ chấp nhận file Excel (.xlsx)");
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            // Kiểm tra thêm extension
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
        // Đường dẫn file mẫu - bạn có thể sửa lại sau
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

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch(
                `http://localhost:3000/giang-day/lop-hoc-phan/them-sv-bang-excel`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );

            const data = await res.json();
            console.log("Response nhập sinh viên Excel:", data); // Log response

            handleClose();

            if (res.ok) {
                const { summary, errors, detailByClass } = data;

                let fullMessage = `Tổng: ${summary.total} | Thành công: ${summary.success} | Thất bại: ${summary.failed}\n\n`;

                // -----------------------------------------------------------------
                // 1️⃣ XỬ LÝ THEO TỪNG LỚP HỌC PHẦN (detailByClass)
                // -----------------------------------------------------------------
                if (detailByClass && Object.keys(detailByClass).length > 0) {
                    fullMessage += "📚 Kết quả theo từng lớp học phần:\n";

                    for (const classCode of Object.keys(detailByClass)) {
                        const cls = detailByClass[classCode];

                        fullMessage += `\n— Lớp: ${classCode} —\n`;
                        fullMessage += `✓ Thành công: ${cls.success}\n`;
                        fullMessage += `✗ Thất bại: ${cls.failed}\n`;

                        if (cls.errors && cls.errors.length > 0) {
                            fullMessage += `⚠️ Danh sách lỗi:\n`;

                            cls.errors.forEach((err: { row: any; maSinhVien: any; error: any; }) => {
                                fullMessage += `• Dòng ${err.row} – MSSV ${err.maSinhVien}: ${err.error}\n`;
                            });
                        }
                    }

                    fullMessage += "\n";
                }

                // -----------------------------------------------------------------
                // 2️⃣ XỬ LÝ LỖI TỔNG (errors)
                // -----------------------------------------------------------------
                if (errors && errors.length > 0) {
                    fullMessage += "❌ Lỗi tổng hợp:\n";

                    errors.forEach((err: { maLopHocPhan: any; row: any; maSinhVien: any; error: any; }) => {
                        fullMessage += `• LHP ${err.maLopHocPhan} – Dòng ${err.row} – MSSV ${err.maSinhVien}: ${err.error}\n`;
                    });

                    // ALERT WARNING
                    showAlert(
                        "warning",
                        "Thêm sinh viên hoàn tất với một số lỗi",
                        fullMessage
                    );
                } else {
                    // ALERT SUCCESS
                    showAlert(
                        "success",
                        "Thành công",
                        `Đã thêm ${summary.success} sinh viên vào lớp học phần.`
                    );
                }

                // Gọi callback reload
                onSuccess();
            }
            else {
                showAlert("error", "Lỗi", data.message || "Thêm sinh viên thất bại");
            }
        } catch (err) {
            console.error("Lỗi nhập sinh viên Excel:", err);
            handleClose();
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm sinh viên");
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
                    Thêm sinh viên vào LHP bằng Excel
                </h3>

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
                        {isUploading ? "Đang xử lý..." : "Thêm sinh viên"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL THỐNG KÊ LHP ĐỀ XUẤT ====================
interface ThongKeLHPDeXuatModalProps {
    isOpen: boolean;
    onClose: () => void;
    namHocOptions: NamHocOption[];
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ThongKeLHPDeXuatModal: React.FC<ThongKeLHPDeXuatModalProps> = ({
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

            const res = await fetch("http://localhost:3000/giang-day/len-ke-hoach-tao-lhp", {
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
                link.download = `thong-ke-lhp-de-xuat-${selectedNamHocData.maNamHoc}-HK${selectedHocKyData.hocKy}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert("success", "Thành công", "Đã xuất file thống kê lớp học phần đề xuất");
                handleClose();
            } else {
                const err = await res.json();
                handleClose();
                showAlert("error", "Lỗi", err.message || "Không thể xuất thống kê");
            }
        } catch (err) {
            console.error("Lỗi xuất thống kê LHP đề xuất:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xuất thống kê");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        <FontAwesomeIcon icon={faChartBar} className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Xuất thống kê LHP đề xuất
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tạo danh sách lớp học phần dự kiến
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
                            <p className="font-medium mb-1">Hướng dẫn sử dụng: </p>
                            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                <li>Chọn năm học và học kỳ cần xuất thống kê</li>
                                <li>Hệ thống sẽ tạo file Excel chứa danh sách LHP đề xuất</li>
                                <li>File có thể dùng để import tạo LHP hàng loạt</li>
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

                {/* Cảnh báo */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex gap-3">
                        <FontAwesomeIcon
                            icon={faTriangleExclamation}
                            className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0"
                        />
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                            <p className="font-medium">Lưu ý:</p>
                            <p className="text-amber-600 dark:text-amber-400">
                                Thống kê được tạo dựa trên chương trình đào tạo và số lượng sinh viên hiện tại.
                                Vui lòng kiểm tra kỹ trước khi sử dụng.
                            </p>
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
                `http://localhost:3000/giang-day/lop-hoc-phan/import-tu-excel`,
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
                                <li>Tải file mẫu và điền đầy đủ thông tin</li>
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
                                            className="mt-3 text-sm text-red-500 hover: text-red-600 underline"
                                        >
                                            Xóa file
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
                                <li>Đảm bảo mã môn học, giảng viên, ngành, niên khóa đã tồn tại</li>
                                <li>Hệ thống sẽ bỏ qua các dòng có lỗi và tiếp tục xử lý</li>
                                <li>Kiểm tra kỹ dữ liệu trước khi import</li>
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
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Dòng</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Mã LHP</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Trạng thái</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {importResult.details.map((item, index) => (
                                        <tr key={index} className={item.status === 'failed' ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                            <td className="px-3 py-2 text-gray-800 dark:text-white">{item.row}</td>
                                            <td className="px-3 py-2 text-gray-800 dark:text-white font-mono text-xs">
                                                {item.maLopHocPhan}
                                            </td>
                                            <td className="px-3 py-2">
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
                                            </td>
                                            <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">
                                                {item.message}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                `http://localhost:3000/bao-cao/bang-diem-lop-hoc-phan/${lopHocPhan.id}`,
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
                                {lopHocPhan.giangVien.hoTen}
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
                            Danh sach sinh vien LHP {lopHocPhan.maLopHocPhan}. xlsx
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
                                <li>File Excel bao gồm đề xuất môn học cần học lại</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form chọn năm học và học kỳ */}
                <div className="space-y-4 mb-6">
                    {/* Năm h��c */}
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
                                <li>Danh sách sinh viên có điểm F hoặc không đạt</li>
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
                                <li>Chỉ thống kê các lớp học phần đã kết thúc và có điểm</li>
                                <li>Sinh viên có điểm dưới 4.0 hoặc điểm chữ F được xem là trượt</li>
                                <li>Dữ liệu dựa trên kết quả học tập chính thức</li>
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

// ==================== TRANG CHÍNH QUẢN LÝ LỚP HỌC PHẦN ====================
export default function QuanLyLopHocPhanPage() {
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
    const [filterTrangThai, setFilterTrangThai] = useState<TrangThai | "">("");

    // State cho form sửa
    const [maLopHocPhan, setMaLopHocPhan] = useState("");
    const [monHocId, setMonHocId] = useState("");
    const [giangVienId, setGiangVienId] = useState("");
    const [namHocId, setNamHocId] = useState("");
    const [hocKyId, setHocKyId] = useState("");
    const [nienKhoaId, setNienKhoaId] = useState("");
    const [khoaId, setKhoaId] = useState("");
    const [nganhId, setNganhId] = useState("");
    const [ghiChu, setGhiChu] = useState("");
    const [khoaDiem, setKhoaDiem] = useState(false);

    // State cho options
    const [monHocOptions, setMonHocOptions] = useState<MonHocOption[]>([]);
    const [giangVienOptions, setGiangVienOptions] = useState<GiangVienOption[]>([]);
    const [namHocOptions, setNamHocOptions] = useState<NamHocOption[]>([]);
    const [nienKhoaOptions, setNienKhoaOptions] = useState<NienKhoaOption[]>([]);
    const [khoaOptions, setKhoaOptions] = useState<KhoaOption[]>([]);
    const [nganhOptions, setNganhOptions] = useState<NganhOption[]>([]);
    // Thêm vào phần khai báo state
    const [isThongKeLHPModalOpen, setIsThongKeLHPModalOpen] = useState(false);
    const [isImportLHPExcelModalOpen, setIsImportLHPExcelModalOpen] = useState(false);

    // Thêm sau dòng:  const [isImportLHPExcelModalOpen, setIsImportLHPExcelModalOpen] = useState(false);
    const [isDownloadBangDiemModalOpen, setIsDownloadBangDiemModalOpen] = useState(false);
    const [downloadingLopHocPhan, setDownloadingLopHocPhan] = useState<LopHocPhan | null>(null);
    const [isThongKeSVTruotMonModalOpen, setIsThongKeSVTruotMonModalOpen] = useState(false);

    // State để theo dõi dropdown ĐANG MỞ
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    const toggleDropdown = (lopHocPhanId: number) => {
        setActiveDropdownId((prev) =>
            prev === lopHocPhanId ? null : lopHocPhanId
        );
    };

    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    const [errors, setErrors] = useState({
        maLopHocPhan: false,
        monHocId: false,
        giangVienId: false,
        nienKhoaId: false,
        nganhId: false,
    });

    const [alert, setAlert] = useState<{
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
        trangThaiFilter: TrangThai | "" = "",
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/giang-day/lop-hoc-phan?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (monHocIdFilter) url += `&monHocId=${monHocIdFilter}`;
            if (giangVienIdFilter) url += `&giangVienId=${giangVienIdFilter}`;
            if (hocKyIdFilter) url += `&hocKyId=${hocKyIdFilter}`;
            if (nienKhoaIdFilter) url += `&nienKhoaId=${nienKhoaIdFilter}`;
            if (nganhIdFilter) url += `&nganhId=${nganhIdFilter}`;
            if (trangThaiFilter) url += `&trangThai=${trangThaiFilter}`;

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
            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc", {
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
            let url = "http://localhost:3000/danh-muc/giang-vien?page=1&limit=9999";
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
            const res = await fetch("http://localhost:3000/dao-tao/nam-hoc?page=1&limit=9999", {
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
            const res = await fetch("http://localhost:3000/danh-muc/nien-khoa?page=1&limit=9999", {
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
            const res = await fetch("http://localhost:3000/danh-muc/nganh?page=1&limit=9999", {
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
        fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId);
    }, [currentPage]);

    useEffect(() => {
        fetchMonHoc();
        fetchGiangVien();
        fetchNamHoc();
        fetchNienKhoa();
        fetchNganh();
    }, []);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLopHocPhans(1, searchKeyword.trim(), filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterTrangThai === "" ? "" : filterTrangThai);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchLopHocPhans(1, searchKeyword.trim(), filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterTrangThai === "" ? "" : filterTrangThai);
    };

    const handleResetFilter = () => {
        setFilterMonHocId("");
        setFilterGiangVienId("");
        setFilterHocKyId("");
        setFilterNienKhoaId("");
        setFilterNganhId("");
        setFilterNamHocId("");
        setSearchKeyword("");
        setFilterTrangThai("");
        setCurrentPage(1);
        fetchLopHocPhans(1, "", "", "", "", "", "");
    };

    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const validateForm = () => {
        const newErrors = {
            maLopHocPhan: !maLopHocPhan.trim(),
            monHocId: !monHocId,
            giangVienId: !giangVienId,
            nienKhoaId: !nienKhoaId,
            nganhId: !nganhId,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const resetForm = () => {
        setMaLopHocPhan("");
        setMonHocId("");
        setGiangVienId("");
        setNienKhoaId("");
        setKhoaId("");
        setNganhId("");
        setGhiChu("");
        setErrors({
            maLopHocPhan: false,
            monHocId: false,
            giangVienId: false,
            nienKhoaId: false,
            nganhId: false,
        });
    };

    const handleUpdate = async () => {
        if (!editingLopHocPhan || !validateForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/giang-day/lop-hoc-phan/${editingLopHocPhan.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maLopHocPhan: maLopHocPhan.trim(),
                    giangVienId: Number(giangVienId),
                    monHocId: Number(monHocId),
                    nienKhoaId: Number(nienKhoaId),
                    nganhId: Number(nganhId),
                    ghiChu: ghiChu.trim() || null,
                }),
            });

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật lớp học phần thành công");
                resetForm();
                fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId);
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
            const res = await fetch(`http://localhost:3000/giang-day/lop-hoc-phan/${deletingLopHocPhan.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa lớp học phần thành công");
                setDeletingLopHocPhan(null);
                fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId);
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
        setMonHocId(lopHocPhan.monHoc.id.toString());
        setGiangVienId(lopHocPhan.giangVien.id.toString());

        // Tìm năm học từ học kỳ
        const foundNamHoc = namHocOptions.find(nh =>
            nh.hocKys.some(hk => hk.id === lopHocPhan.hocKy.id)
        );
        if (foundNamHoc) {
            setNamHocId(foundNamHoc.id.toString());
        }

        setHocKyId(lopHocPhan.hocKy.id.toString());
        setNienKhoaId(lopHocPhan.nienKhoa.id.toString());
        setKhoaId(lopHocPhan.nganh.khoa.id.toString());
        setNganhId(lopHocPhan.nganh.id.toString());
        setGhiChu(lopHocPhan.ghiChu || "");
        setKhoaDiem(lopHocPhan.khoaDiem);

        setIsEditModalOpen(true);
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
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            autoDismiss
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
                    {/* Thay thế phần này trong JSX */}
                    <div className="flex gap-2 mr-1 ml-auto">
                        <Button
                            variant="primary"
                            onClick={() => setIsThongKeLHPModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faChartBar} />}
                        >
                            TK LHP đề xuất
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsThongKeSVTruotMonModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faUserXmark} />}
                        >
                            TK SV Trượt môn
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsImportLHPExcelModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faFileImport} />}
                        >
                            Nhập LHP
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsImportSinhVienExcelModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faFileExcel} />}
                        >
                            Thêm SV vào LHP
                        </Button>
                    </div>
                </div>

                {/* Khối lọc */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Label className="block mb-3 text-base font-medium">Bộ lọc</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    setFilterHocKyId(""); // Reset học kỳ khi đổi năm học
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
                        <div>
                            <Label className="block mb-2 text-sm">Trạng thái</Label>
                            <SearchableSelect
                                options={TRANG_THAI_OPTIONS.map((opt) => ({
                                    value: opt.value,
                                    label: opt.label,
                                }))}
                                placeholder="Tất cả trạng thái"
                                onChange={(value) => setFilterTrangThai(value as TrangThai | "")}
                                defaultValue={filterTrangThai}
                                showSecondary={true}
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
                                            Trạng thái
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
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
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
                                                    <Badge variant="solid" color={getTrangThaiColor(lhp.trangThai)}>
                                                        {getTrangThaiLabel(lhp.trangThai)}
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
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openViewModal(lhp)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openEditModal(lhp)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-2 w-4" />
                                                                    Chỉnh sửa
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    tag="a"
                                                                    href={`http://localhost:3001/quan-ly-lop-hoc-phan/quan-ly-diem/${lhp.id}`}
                                                                    onItemClick={closeDropdown}
                                                                >
                                                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-2 w-4" />
                                                                    Chi tiết lớp
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDownloadModal(lhp)}
                                                                >
                                                                    <FontAwesomeIcon icon={faFileArrowDown} className="mr-2 w-4" />
                                                                    Tải xuống Excel
                                                                </DropdownItem>

                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteModal(lhp)}
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
                monHocOptions={monHocOptions}
                giangVienOptions={giangVienOptions}
                nienKhoaOptions={nienKhoaOptions}
                khoaOptions={khoaOptions}
                nganhOptions={nganhOptions}
                maLopHocPhan={maLopHocPhan}
                monHocId={monHocId}
                giangVienId={giangVienId}
                namHocId={namHocId}
                nienKhoaId={nienKhoaId}
                khoaId={khoaId}
                nganhId={nganhId}
                ghiChu={ghiChu}
                onMaLopHocPhanChange={setMaLopHocPhan}
                onMonHocIdChange={setMonHocId}
                onGiangVienIdChange={setGiangVienId}
                onNienKhoaIdChange={setNienKhoaId}
                onKhoaIdChange={setKhoaId}
                onNganhIdChange={setNganhId}
                onGhiChuChange={setGhiChu}
                onSubmit={handleUpdate}
                errors={errors}
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
                onSuccess={() => fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId)}
                showAlert={showAlert}
            />

            {/* Modal Thống kê LHP đề xuất */}
            <ThongKeLHPDeXuatModal
                isOpen={isThongKeLHPModalOpen}
                onClose={() => setIsThongKeLHPModalOpen(false)}
                namHocOptions={namHocOptions}
                showAlert={showAlert}
            />

            {/* Modal Nhập LHP từ Excel */}
            <ImportLHPExcelModal
                isOpen={isImportLHPExcelModalOpen}
                onClose={() => setIsImportLHPExcelModalOpen(false)}
                onSuccess={() => fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId)}
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

            {/* Modal Thống kê SV Trượt môn */}
            <ThongKeSVTruotMonModal
                isOpen={isThongKeSVTruotMonModalOpen}
                onClose={() => setIsThongKeSVTruotMonModalOpen(false)}
                namHocOptions={namHocOptions}
                showAlert={showAlert}
            />
        </div>
    );
}