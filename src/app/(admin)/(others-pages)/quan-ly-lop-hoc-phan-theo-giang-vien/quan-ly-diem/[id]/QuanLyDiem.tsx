"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faEye, faEdit, faTriangleExclamation, faCircleInfo, faCircleCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";
import { useDropzone } from "react-dropzone";
import { faCloudArrowUp, faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";

type LoaiThamGia = "CHINH_QUY" | "HOC_LAI" | "HOC_CAI_THIEN" | "HOC_BO_SUNG";

interface LopHocPhanInfo {
    id: number;
    maLopHocPhan: string;
    monHoc: string;
    mamonHoc: string;
    hocKy: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    maNienKhoa: string;
    tenNienKhoa: string;
    maNganh: string;
    tenNganh: string;
    namhoc: string;
    giangVien: string;
    maGiangVien: string;
    siSo: number;
    khoaDiem: boolean;
}

interface Diem {
    id: number;
    diemQuaTrinh: string;
    diemThanhPhan: string;
    diemThi: string;
    TBCHP: number;
    DiemSo: number;
    DiemChu: string;
}

interface SinhVienInfo {
    id: number;
    maSinhVien: string;
    hoTen: string;
    tenlop: string;
    malop: string;
    nganh: string;
    manganh: string;
    nienKhoa: string;
}

interface SinhVienDiem {
    sinhVien: SinhVienInfo;
    loaiThamGia: LoaiThamGia;
    ngayDangKy: string;
    diem: Diem | null;
    chuaCoDiem: boolean;
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

// Hàm chuyển loại tham gia thành tiếng Việt
const getLoaiThamGiaLabel = (loaiThamGia: LoaiThamGia): string => {
    switch (loaiThamGia) {
        case "CHINH_QUY":
            return "Chính quy";
        case "HOC_LAI":
            return "Học lại";
        case "HOC_CAI_THIEN":
            return "Cải thiện";
        case "HOC_BO_SUNG":
            return "Học bổ sung";
        default:
            return loaiThamGia;
    }
};

// Hàm lấy màu badge cho loại tham gia
const getLoaiThamGiaColor = (loaiThamGia: LoaiThamGia): "success" | "error" | "warning" | "info" => {
    switch (loaiThamGia) {
        case "CHINH_QUY":
            return "success";
        case "HOC_LAI":
            return "error";
        case "HOC_CAI_THIEN":
            return "warning";
        case "HOC_BO_SUNG":
            return "info";
        default:
            return "info";
    }
};

// ==================== MODAL XEM CHI TIẾT SINH VIÊN ====================
interface ViewSinhVienModalProps {
    isOpen: boolean;
    onClose: () => void;
    sinhVienDiem: SinhVienDiem | null;
}

const ViewSinhVienModal: React.FC<ViewSinhVienModalProps> = ({
    isOpen,
    onClose,
    sinhVienDiem,
}) => {
    if (!isOpen || !sinhVienDiem) return null;

    const { sinhVien, loaiThamGia, ngayDangKy, diem, chuaCoDiem } = sinhVienDiem;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết Sinh Viên
                </h3>

                {/* Thông tin sinh viên */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                        Thông tin sinh viên
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mã sinh viên</p>
                            <p className="font-medium text-gray-800 dark: text-white">{sinhVien.maSinhVien}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Họ tên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.hoTen}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lớp niên chế</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {sinhVien.malop} - {sinhVien.tenlop}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngành</p>
                            <p className="font-medium text-gray-800 dark: text-white">
                                {sinhVien.manganh} - {sinhVien.nganh}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Niên khóa</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.nienKhoa}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loại tham gia</p>
                            <Badge variant="solid" color={getLoaiThamGiaColor(loaiThamGia)}>
                                {getLoaiThamGiaLabel(loaiThamGia)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày đăng ký</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {new Date(ngayDangKy).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái điểm</p>
                            <Badge variant="solid" color={chuaCoDiem ? "warning" : "success"}>
                                {chuaCoDiem ? "Chưa có điểm" : "Có điểm"}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Bảng điểm */}
                <div className="mb-6">
                    <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                        Bảng điểm
                    </h4>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                        Điểm quá trình
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                        Điểm thành phần
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                        Điểm thi
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                        TBCHP
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                        Điểm số
                                    </TableCell>
                                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                        Điểm chữ
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                {chuaCoDiem || !diem ? (
                                    <TableRow>
                                        <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400" cols={6}>
                                            Sinh viên chưa có điểm
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-center">
                                            {diem.diemQuaTrinh}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark: text-white/90 text-center">
                                            {diem.diemThanhPhan}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-center">
                                            {diem.diemThi}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-center">
                                            {diem.TBCHP}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-gray-800 dark: text-white/90 text-center">
                                            {diem.DiemSo}
                                        </TableCell>
                                        <TableCell className="px-5 py-4 text-center">
                                            <Badge variant="solid" color="success">
                                                {diem.DiemChu}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL SỬA ĐIỂM ====================
interface EditDiemModalProps {
    isOpen: boolean;
    onClose: () => void;
    sinhVienDiem: SinhVienDiem | null;
    diemQuaTrinh: string;
    diemThanhPhan: string;
    diemThi: string;
    onDiemQuaTrinhChange: (value: string) => void;
    onDiemThanhPhanChange: (value: string) => void;
    onDiemThiChange: (value: string) => void;
    onSubmit: () => void;
    errors: {
        diemQuaTrinh: string;
        diemThanhPhan: string;
        diemThi: string;
    };
}

const EditDiemModal: React.FC<EditDiemModalProps> = ({
    isOpen,
    onClose,
    sinhVienDiem,
    diemQuaTrinh,
    diemThanhPhan,
    diemThi,
    onDiemQuaTrinhChange,
    onDiemThanhPhanChange,
    onDiemThiChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen || !sinhVienDiem) return null;

    const { sinhVien } = sinhVienDiem;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Sửa điểm sinh viên
                </h3>

                {/* Thông tin sinh viên */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-sm text-gray-500 dark: text-gray-400">Mã sinh viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.maSinhVien}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Họ tên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.hoTen}</p>
                        </div>
                    </div>
                </div>

                {/* Form nhập điểm */}
                <div className="space-y-4">
                    <div>
                        <Label>Điểm quá trình</Label>
                        <Input
                            type="number"
                            step={0.01}
                            min="0"
                            max="10"
                            defaultValue={diemQuaTrinh}
                            onChange={(e) => onDiemQuaTrinhChange(e.target.value)}
                            error={!!errors.diemQuaTrinh}
                            hint={errors.diemQuaTrinh}
                            placeholder="Nhập điểm từ 0 đến 10"
                        />
                    </div>
                    <div>
                        <Label>Điểm thành phần</Label>
                        <Input
                            type="number"
                            step={0.01}
                            min="0"
                            max="10"
                            defaultValue={diemThanhPhan}
                            onChange={(e) => onDiemThanhPhanChange(e.target.value)}
                            error={!!errors.diemThanhPhan}
                            hint={errors.diemThanhPhan}
                            placeholder="Nhập điểm từ 0 đến 10"
                        />
                    </div>
                    <div>
                        <Label>Điểm thi</Label>
                        <Input
                            type="number"
                            step={0.01}
                            min="0"
                            max="10"
                            defaultValue={diemThi}
                            onChange={(e) => onDiemThiChange(e.target.value)}
                            error={!!errors.diemThi}
                            hint={errors.diemThi}
                            placeholder="Nhập điểm từ 0 đến 10"
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

// ==================== MODAL NHẬP ĐIỂM EXCEL ====================
interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    lopHocPhanId: string;
    maLopHocPhan?: string;
    onSuccess: () => void;
    showAlert: (variant: "success" | "error" | "warning" | "info", title: string, message: string) => void;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
    isOpen,
    onClose,
    lopHocPhanId,
    maLopHocPhan,
    onSuccess,
    showAlert,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadErrors, setUploadErrors] = useState<{
        row: number;
        maSinhVien: string;
        error: string;
    }[]>([]);
    const [uploadSuccess, setUploadSuccess] = useState<number>(0);
    const [uploadFailed, setUploadFailed] = useState<number>(0);
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");
    const [hasImported, setHasImported] = useState(false);
    const [successRows, setSuccessRows] = useState<{
        row: number;
        maSinhVien: string;
        diemQuaTrinh: number;
        diemThanhPhan: number;
        diemThi: number;
    }[]>([]);

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

    const handleDownloadTemplate = async () => {
        if (!lopHocPhanId) return;
        setIsDownloadingTemplate(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/${lopHocPhanId}/export-mau-nhap-diem`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                showAlert("error", "Lỗi", err.message || "Không thể tải file mẫu");
                return;
            }
            const blob = await res.blob();
            const disposition = res.headers.get("Content-Disposition");
            const filenameMatch = disposition?.match(/filename="?([^";\n]+)"?/);
            const fallbackFilename = maLopHocPhan
                ? `Mẫu nhập điểm LHP ${maLopHocPhan}.xlsx`
                : `mau-nhap-diem-${lopHocPhanId}.xlsx`;
            const filename = filenameMatch?.[1] || fallbackFilename;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Lỗi tải file mẫu:", err);
            showAlert("error", "Lỗi", "Không thể tải file mẫu nhập điểm");
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
        setUploadErrors([]);
        setUploadSuccess(0);
        setUploadFailed(0);

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch(
                `${ENV.BACKEND_URL}/ket-qua/nhap-diem-excel/${lopHocPhanId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                }
            );
            const data = await res.json();

            if (res.ok) {
                setUploadSuccess(data.success || 0);
                setUploadFailed(data.failed || 0);
                setHasImported(true);

                // Lưu successRows nếu có
                if (data.successRows && data.successRows.length > 0) {
                    setSuccessRows(data.successRows);
                }

                // Kiểm tra nếu có lỗi trong response
                if (data.errors && data.errors.length > 0) {
                    setUploadErrors(data.errors);
                    setActiveTab("error"); // Tự động chọn tab lỗi nếu có lỗi
                } else {
                    setActiveTab("success");
                }
                onSuccess();
            } else {
                showAlert("error", "Lỗi", data.message || "Nhập điểm thất bại");
            }
        } catch (err) {
            console.error("Lỗi nhập điểm Excel:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi nhập điểm");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (hasImported && uploadSuccess > 0) {
            showAlert(
                uploadFailed > 0 ? "warning" : "success",
                uploadFailed > 0 ? "Hoàn tất với cảnh báo" : "Thành công",
                `Đã nhập điểm ${uploadSuccess} sinh viên${uploadFailed > 0 ? `, ${uploadFailed} lỗi` : ""}`
            );
        }
        setSelectedFile(null);
        setFileError("");
        setUploadErrors([]);
        setUploadSuccess(0);
        setUploadFailed(0);
        setActiveTab("success");
        setHasImported(false);
        setSuccessRows([]);
        onClose();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
        setActiveTab("success");
    };

    const resetForNewUpload = () => {
        setSelectedFile(null);
        setFileError("");
        setUploadErrors([]);
        setUploadSuccess(0);
        setUploadFailed(0);
        setActiveTab("success");
        setHasImported(false);
        setSuccessRows([]);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Nhập điểm bằng Excel
                </h3>

                {/* === CẢNH BÁO QUAN TRỌNG (màu đỏ) === */}
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
                                    Cảnh báo quan trọng – Hành động không thể hoàn tác:
                                </h4>
                                <ul className="text-sm text-amber-700/80 dark:text-amber-300/70 space-y-1.5 list-disc list-inside">
                                    <li>Hệ thống sẽ <strong>ghi đè toàn bộ điểm</strong> của lớp học phần này khi nhập điểm mới</li>
                                    <li>Lớp học phần <strong>đã khóa điểm</strong> sẽ <strong>không cho phép nhập điểm</strong></li>
                                    <li>Chỉ giảng viên phụ trách LHP mới được nhập điểm cho lớp học phần đó</li>
                                    <li>Điểm không hợp lệ (ngoài 0-10 hoặc thiếu) sẽ bị bỏ qua, nhưng điểm hợp lệ sẽ <strong>ghi đè hoàn toàn</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* === HƯỚNG DẪN SỬ DỤNG (màu xanh) === */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <FontAwesomeIcon
                                    icon={faCircleInfo}
                                    className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                                />
                            </div>
                            <div className="flex-1 space-y-3 text-sm text-blue-700/90 dark:text-blue-300/80">
                                <p className="font-semibold text-blue-800 dark:text-blue-200">
                                    Hướng dẫn nhập điểm bằng Excel
                                </p>
                                <p>
                                    <strong>Bước 1 — Tải file mẫu:</strong> Bấm nút &quot;Tải file Excel mẫu&quot; bên dưới. File tải về đã chứa <strong>danh sách sinh viên của lớp học phần này</strong> với các cột: STT, Mã sinh viên, Họ và tên, Ngày sinh (dd/mm/yyyy), Lớp niên chế, Điểm 10%, Điểm 30%, Điểm 60%.
                                </p>
                                <p>
                                    <strong>Bước 2 — Điền điểm:</strong> Chỉ cần nhập điểm vào 3 cột <strong>Điểm 10%</strong> (cột F), <strong>Điểm 30%</strong> (cột G), <strong>Điểm 60%</strong> (cột H). <strong>Không xóa hoặc sửa</strong> cột Mã sinh viên (cột B) — hệ thống dùng mã này để nhận diện sinh viên.
                                </p>
                                <p>
                                    <strong>Bước 3 — Tải file lên:</strong> Lưu file Excel, quay lại đây và chọn file vừa chỉnh sửa để tải lên, sau đó bấm &quot;Nhập điểm&quot;.
                                </p>
                                <p>
                                    <strong>Quy định điểm:</strong> Mỗi điểm phải trong khoảng <strong>0 đến 10</strong>. Điểm đã có sẵn trong file mẫu (nếu sinh viên đã có điểm trước đó) có thể giữ nguyên hoặc sửa lại khi nhập.
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
                        disabled={isDownloadingTemplate}
                        startIcon={<FontAwesomeIcon icon={faDownload} />}
                        className="w-full"
                    >
                        {isDownloadingTemplate ? "Đang tải..." : "Tải file Excel mẫu (theo lớp học phần)"}
                    </Button>
                </div>

                {/* Dropzone */}
                <div className="mb-6">
                    <Label className="mb-2 block">Chọn file Excel nhập điểm</Label>
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

                {/* ==================== HIỂN THỊ KẾT QUẢ IMPORT ==================== */}
                {hasImported && (uploadSuccess > 0 || uploadFailed > 0) && (
                    <div className="mb-6 space-y-4">
                        {/* Thống kê tổng quan */}
                        <div className={`p-5 rounded-xl border ${uploadFailed === 0
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800/50'
                                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-800/50'
                            }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${uploadFailed === 0
                                        ? 'bg-green-100 dark:bg-green-800/50'
                                        : 'bg-yellow-100 dark:bg-yellow-800/50'
                                    }`}>
                                    <FontAwesomeIcon
                                        icon={uploadFailed === 0 ? faCircleCheck : faCircleExclamation}
                                        className={`text-xl ${uploadFailed === 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h4 className={`text-lg font-semibold ${uploadFailed === 0
                                            ? 'text-green-800 dark:text-green-300'
                                            : 'text-yellow-800 dark:text-yellow-300'
                                        }`}>
                                        {uploadFailed === 0 ? 'Nhập điểm thành công!' : 'Hoàn tất với một số lỗi'}
                                    </h4>
                                    <p className={`text-sm ${uploadFailed === 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                        Đã xử lý {uploadSuccess + uploadFailed} sinh viên
                                    </p>
                                </div>
                            </div>

                            {/* Grid thống kê */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                        {uploadSuccess + uploadFailed}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng số dòng</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-green-200 dark:border-green-700 shadow-sm">
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {uploadSuccess}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thành công</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-red-200 dark:border-red-700 shadow-sm">
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {uploadFailed}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thất bại</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs chuyển đổi */}
                        {((successRows && successRows.length > 0) ||
                            (uploadErrors && uploadErrors.length > 0)) && (
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
                                        Thành công ({successRows?.length || uploadSuccess || 0})
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
                                        Thất bại ({uploadErrors?.length || 0})
                                    </button>
                                </div>
                            )}

                        {/* ==================== TABLE THÀNH CÔNG ==================== */}
                        {activeTab === "success" && (
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 overflow-hidden">
                                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-200 dark:border-green-800/50">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />
                                        Chi tiết các sinh viên nhập điểm thành công
                                    </h4>
                                </div>

                                {successRows && successRows.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[10%_20%_20%_20%_30%]">
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
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Điểm QT
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Điểm TP
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Điểm Thi
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {successRows.map((row, idx) => (
                                                    <TableRow
                                                        key={idx}
                                                        className="grid grid-cols-[10%_20%_20%_20%_30%] bg-white dark:bg-gray-900 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
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
                                                        <TableCell className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                                                            {row.diemQuaTrinh}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                                                            {row.diemThanhPhan}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                                                            {row.diemThi}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        {uploadSuccess > 0 ? (
                                            <>
                                                <FontAwesomeIcon icon={faCircleCheck} className="text-4xl mb-3 text-green-400" />
                                                <p className="text-green-600 dark:text-green-400">
                                                    Đã nhập điểm thành công {uploadSuccess} sinh viên
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faFileExcel} className="text-4xl mb-3 text-gray-300 dark:text-gray-600" />
                                                <p>Không có sinh viên nào được nhập điểm thành công</p>
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

                                {uploadErrors && uploadErrors.length > 0 ? (
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
                                                {uploadErrors.map((err, idx) => (
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
                                        <p className="text-green-600 dark:text-green-400">Tất cả sinh viên đều nhập điểm thành công!</p>
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

                {/* Buttons - chỉ hiển thị khi chưa import */}
                {!hasImported && (
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            startIcon={isUploading ? undefined : <FontAwesomeIcon icon={faFileExcel} />}
                        >
                            {isUploading ? "Đang xử lý..." : "Nhập điểm"}
                        </Button>
                    </div>
                )}
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

// ==================== TRANG CHÍNH ====================
export default function ChiTietLopHocPhanPage() {
    const params = useParams();
    const lopHocPhanId = params?.id as string;

    const [lopHocPhanInfo, setLopHocPhanInfo] = useState<LopHocPhanInfo | null>(null);
    const [danhSachSinhVien, setDanhSachSinhVien] = useState<SinhVienDiem[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [viewingSinhVien, setViewingSinhVien] = useState<SinhVienDiem | null>(null);
    const [editingSinhVien, setEditingSinhVien] = useState<SinhVienDiem | null>(null);

    // State cho form sửa điểm
    const [diemQuaTrinh, setDiemQuaTrinh] = useState("");
    const [diemThanhPhan, setDiemThanhPhan] = useState("");
    const [diemThi, setDiemThi] = useState("");
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

    const [errors, setErrors] = useState({
        diemQuaTrinh: "",
        diemThanhPhan: "",
        diemThi: "",
    });

    const [importResult, setImportResult] = useState<{
        success: number;
        failed: number;
        errors: { row: number; maSinhVien: string; error: string }[];
    } | null>(null);

    // State để theo dõi dropdown đang mở
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    const toggleDropdown = (sinhVienId: number) => {
        setActiveDropdownId((prev) =>
            prev === sinhVienId ? null : sinhVienId
        );
    };

    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Fetch danh sách sinh viên và điểm
    const fetchDanhSachSinhVien = async (page: number = 1, search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/danh-sach-sinh-vien/${lopHocPhanId}?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();

            if (json.lopHocPhan) {
                setLopHocPhanInfo(json.lopHocPhan);
            }
            if (json.data) {
                setDanhSachSinhVien(json.data);
            }
            if (json.pagination) {
                setPagination(json.pagination);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách sinh viên");
        }
    };

    useEffect(() => {
        if (lopHocPhanId) {
            fetchDanhSachSinhVien(currentPage, searchKeyword);
        }
    }, [lopHocPhanId, currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchDanhSachSinhVien(1, searchKeyword.trim());
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

    // Validate điểm
    const validateDiem = (value: string): string => {
        if (value === "") return "";
        const num = parseFloat(value);
        if (isNaN(num)) return "Điểm phải là số";
        if (num < 0 || num > 10) return "Điểm phải từ 0 đến 10";
        return "";
    };

    const validateForm = (): boolean => {
        const newErrors = {
            diemQuaTrinh: validateDiem(diemQuaTrinh),
            diemThanhPhan: validateDiem(diemThanhPhan),
            diemThi: validateDiem(diemThi),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e !== "");
    };

    const resetForm = () => {
        setDiemQuaTrinh("");
        setDiemThanhPhan("");
        setDiemThi("");
        setErrors({
            diemQuaTrinh: "",
            diemThanhPhan: "",
            diemThi: "",
        });
    };

    const handleUpdateDiem = async () => {
        if (!editingSinhVien || !validateForm()) return;

        // Kiểm tra xem sinh viên có điểm chưa
        if (!editingSinhVien.diem) {
            showAlert("error", "Lỗi", "Sinh viên chưa có bản ghi điểm để cập nhật");
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/ket-qua/${editingSinhVien.diem.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    diemQuaTrinh: diemQuaTrinh ? parseFloat(diemQuaTrinh) : null,
                    diemThanhPhan: diemThanhPhan ? parseFloat(diemThanhPhan) : null,
                    diemThi: diemThi ? parseFloat(diemThi) : null,
                }),
            });

            setIsEditModalOpen(false);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật điểm thành công");
                resetForm();
                fetchDanhSachSinhVien(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật điểm thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật điểm");
        }
    };

    const openViewModal = (sinhVienDiem: SinhVienDiem) => {
        setViewingSinhVien(sinhVienDiem);
        setIsViewModalOpen(true);
    };

    const openEditModal = (sinhVienDiem: SinhVienDiem) => {
        setEditingSinhVien(sinhVienDiem);
        if (sinhVienDiem.diem) {
            setDiemQuaTrinh(sinhVienDiem.diem.diemQuaTrinh ?? "");
            setDiemThanhPhan(sinhVienDiem.diem.diemThanhPhan ?? "");
            setDiemThi(sinhVienDiem.diem.diemThi ?? "");
        } else {
            resetForm();
        }
        setIsEditModalOpen(true);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Chi tiết Lớp Học Phần" />

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
                            duration={5000}
                            onClose={() => setAlert(null)}   // 🔥 unmount thật
                        />
                    </div>
                )}


                {/* Thông tin lớp học phần */}
                {lopHocPhanInfo && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                            Thông tin Lớp Học Phần
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Mã lớp học phần</p>
                                <p className="font-medium text-gray-800 dark:text-white">{lopHocPhanInfo.maLopHocPhan}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Môn học</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {lopHocPhanInfo.mamonHoc} - {lopHocPhanInfo.monHoc}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Giảng viên</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {lopHocPhanInfo.maGiangVien} - {lopHocPhanInfo.giangVien}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark: text-gray-400">Ngành</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {lopHocPhanInfo.maNganh} - {lopHocPhanInfo.tenNganh}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark: text-gray-400">Niên khóa</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {lopHocPhanInfo.maNienKhoa} - {lopHocPhanInfo.tenNienKhoa}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Năm học - Học kỳ</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {lopHocPhanInfo.namhoc} - Học kỳ {lopHocPhanInfo.hocKy}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Thời gian</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {new Date(lopHocPhanInfo.ngayBatDau).toLocaleDateString("vi-VN")} - {new Date(lopHocPhanInfo.ngayKetThuc).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sĩ số</p>
                                <Badge variant="solid" color="info">
                                    {lopHocPhanInfo.siSo} sinh viên
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái khóa điểm</p>
                                <Badge variant="solid" color={lopHocPhanInfo.khoaDiem ? "error" : "success"}>
                                    {lopHocPhanInfo.khoaDiem ? "Đã khóa" : "Chưa khóa"}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tìm kiếm và Button nhập Excel */}
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full lg:max-w-md">
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
                                placeholder="Tìm kiếm theo mã sinh viên hoặc tên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    {/* Button nhập điểm Excel */}
                    <div className="flex-shrink-0">
                        <Button
                            variant="primary"
                            onClick={() => setIsImportExcelModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faFileExcel} />}
                            disabled={lopHocPhanInfo?.khoaDiem}
                        >
                            Nhập điểm bằng Excel
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                     <TableRow className="grid grid-cols-[15%_20%_12%_10%_10%_10%_10%_13%]">
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã sinh viên
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Họ và tên
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Loại tham gia
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Điểm 10%
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Điểm 30%
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            Điểm 60%
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs text-center">
                                            TBCHP
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {danhSachSinhVien.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 col-span-8">
                                                Không có dữ liệu sinh viên
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        danhSachSinhVien.map((item) => (
                                            <TableRow key={item.sinhVien.id} className="grid grid-cols-[15%_20%_12%_10%_10%_10%_10%_13%] items-center">
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {item.sinhVien.maSinhVien}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {item.sinhVien.hoTen}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={getLoaiThamGiaColor(item.loaiThamGia)}>
                                                        {getLoaiThamGiaLabel(item.loaiThamGia)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center text-gray-800 dark:text-white/90">
                                                    {item.chuaCoDiem || !item.diem ? (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                    ) : (
                                                        item.diem.diemQuaTrinh ?? "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center text-gray-800 dark:text-white/90">
                                                    {item.chuaCoDiem || !item.diem ? (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                    ) : (
                                                        item.diem.diemThanhPhan ?? "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center text-gray-800 dark:text-white/90">
                                                    {item.chuaCoDiem || !item.diem ? (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                    ) : (
                                                        item.diem.diemThi ?? "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center text-gray-800 dark:text-white/90">
                                                    {item.chuaCoDiem || !item.diem ? (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
                                                    ) : (
                                                        item.diem.TBCHP ?? "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(item.sinhVien.id)}
                                                            className="dropdown-toggle flex items-center gap-1. 5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === item.sinhVien.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === item.sinhVien.id}
                                                            onClose={closeDropdown}
                                                            className="w-48 mt-2 right-0"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openViewModal(item)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openEditModal(item)}
                                                                    disabled={lopHocPhanInfo?.khoaDiem || item.chuaCoDiem}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-2 w-4" />
                                                                    Sửa điểm
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

            {/* Modal Xem chi tiết */}
            <ViewSinhVienModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingSinhVien(null);
                }}
                sinhVienDiem={viewingSinhVien}
            />

            {/* Modal Sửa điểm */}
            <EditDiemModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingSinhVien(null);
                }}
                sinhVienDiem={editingSinhVien}
                diemQuaTrinh={diemQuaTrinh}
                diemThanhPhan={diemThanhPhan}
                diemThi={diemThi}
                onDiemQuaTrinhChange={setDiemQuaTrinh}
                onDiemThanhPhanChange={setDiemThanhPhan}
                onDiemThiChange={setDiemThi}
                onSubmit={handleUpdateDiem}
                errors={errors}
            />

            {/* Modal Nhập điểm từ Excel */}
            <ImportExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                lopHocPhanId={lopHocPhanId}
                maLopHocPhan={lopHocPhanInfo?.maLopHocPhan}
                onSuccess={() => fetchDanhSachSinhVien(currentPage, searchKeyword)}
                showAlert={showAlert}
            />
        </div>
    );
}