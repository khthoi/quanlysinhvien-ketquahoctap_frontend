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
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import Select from "@/components/form/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ChevronDownIcon } from "@/icons";
import SearchableSelect from "@/components/form/SelectCustom";
import { useDropzone } from "react-dropzone";
import { faCloudArrowUp, faDownload, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import {
    faLightbulb,      // Thêm mới
    faUserTie,        // Thêm mới
    faTableColumns    // Thêm mới
} from '@fortawesome/free-solid-svg-icons';

type LoaiMon = "DAI_CUONG" | "TU_CHON" | "CHUYEN_NGANH";

interface MonHoc {
    id: number;
    maMonHoc: string;
    tenMonHoc: string;
    loaiMon: LoaiMon;
    soTinChi: number;
    moTa: string | null;
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
                <span className="font-medium text-gray-700 dark: text-gray-300">
                    {total}
                </span>
                {" "}kết quả
            </span>
        </div>
    );
};

// ==================== MODAL NHẬP MÔN HỌC EXCEL ====================
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
                if (result.errors?.length > 0) {
                    const errorMessages = result.errors
                        .map((err: any) =>
                            `Dòng ${err.row}${err.maMonHoc ? ` (${err.maMonHoc})` : ""}: ${err.error}`
                        )
                        .join("\n");

                    showAlert(
                        "warning",
                        "Nhập môn học hoàn tất với cảnh báo",
                        `Tổng: ${result.totalRows}, Thành công: ${result.success}, Thất bại: ${result.failed}\n${errorMessages}`
                    );
                } else {
                    showAlert(
                        "success",
                        "Thành công",
                        `Nhập môn học từ Excel thành công. Đã thêm ${result.success} môn học.`
                    );
                }
                handleClose();
                onSuccess();
            } else {
                showAlert("error", "Lỗi", result.message || "Nhập môn học thất bại");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi nhập môn học từ Excel");
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
                    Nhập môn học bằng Excel
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

                {/* 👇 ĐOẠN MỚI THÊM VÀO ĐÂY 👇 */}
                {/* Thông báo hướng dẫn phân công giảng viên */}
                <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50">
                                    <FontAwesomeIcon
                                        icon={faLightbulb}
                                        className="text-lg text-blue-600 dark:text-blue-400"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                    <FontAwesomeIcon icon={faUserTie} className="mr-2 text-sm" />
                                    Phân công giảng viên
                                </h4>
                                <p className="text-sm text-blue-700/80 dark:text-blue-300/70 leading-relaxed text-justify">
                                    Bạn có thể phân công môn học cho giảng viên trực tiếp trong file Excel bằng cách điền thông tin vào cột thứ 7 của file mẫu.
                                </p>
                            </div>
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



// ==================== TRANG CHÍNH QUẢN LÝ MÔN HỌC ====================
export default function QuanLyMonHocPage() {
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
    const [selectedMonHocId, setSelectedMonHocId] = useState<string>("");
    const [selectedGiangVienId, setSelectedGiangVienId] = useState<string>("");
    const [monHocSearchKeyword, setMonHocSearchKeyword] = useState("");
    const [giangVienSearchKeyword, setGiangVienSearchKeyword] = useState("");
    const [isPhanCongLoading, setIsPhanCongLoading] = useState(false);
    // Thêm vào phần khai báo state trong QuanLyLopNienChePage
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

    const [errors, setErrors] = useState({
        maMonHoc: false,
        tenMonHoc: false,
        loaiMon: false,
        soTinChi: false,
        moTa: false,
    });

    const [alert, setAlert] = useState<{
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

    // Mở modal phân công
    const openPhanCongModal = () => {
        setSelectedMonHocId("");
        setSelectedGiangVienId("");
        setMonHocSearchKeyword("");
        setGiangVienSearchKeyword("");
        fetchMonHocForPhanCong();
        fetchGiangVienForPhanCong();
        setIsPhanCongModalOpen(true);
    };

    // Đóng modal phân công
    const closePhanCongModal = () => {
        setIsPhanCongModalOpen(false);
        setSelectedMonHocId("");
        setSelectedGiangVienId("");
        setMonHocSearchKeyword("");
        setGiangVienSearchKeyword("");
        setMonHocOptionsForPhanCong([]);
        setGiangVienOptions([]);
    };

    // Xử lý phân công môn học
    const handlePhanCong = async () => {
        if (!selectedMonHocId || !selectedGiangVienId) {
            showAlert("warning", "Cảnh báo", "Vui lòng chọn cả môn học và giảng viên");
            return;
        }

        setIsPhanCongLoading(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/giang-vien/phancongmonhoc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    giangVienId: Number(selectedGiangVienId),
                    monHocId: Number(selectedMonHocId),
                }),
            });

            closePhanCongModal();
            if (res.ok) {
                showAlert("success", "Thành công", "Phân công môn học thành công");
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Phân công thất bại");
            }
        } catch (err) {
            closePhanCongModal();
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi phân công môn học");
        } finally {
            setIsPhanCongLoading(false);
        }
    };

    useEffect(() => {
        fetchMonHocs(currentPage, searchKeyword, filterLoaiMon);
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchMonHocs(1, searchKeyword.trim(), filterLoaiMon);
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
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
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
                                placeholder="Tìm kiếm môn học..."
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
                            variant="primary"
                            onClick={openPhanCongModal}
                        >
                            Phân công môn học
                        </Button>
                        <Button
                            onClick={() => {
                                resetForm();
                                setIsCreateModalOpen(true);
                            }}
                        >
                            Tạo mới Môn học
                        </Button>
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
                        <div className="min-w-[900px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[15%_22%_15%_7%_25%_15%]">
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
                                        <TableRow key={mh.id} className="grid grid-cols-[15%_22%_15%_7%_25%_15%] items-center">
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {mh.maMonHoc}
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
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
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

            {/* Modal Phân công môn học */}
            <Modal
                isOpen={isPhanCongModalOpen}
                onClose={closePhanCongModal}
                className="max-w-2xl"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Phân công môn học cho giảng viên
                    </h3>

                    <div className="space-y-6">
                        {/* Khối tìm kiếm Môn học */}
                        <div>
                            <Label className="block mb-2">Chọn Môn học</Label>
                            <div className="mt-3">
                                <SearchableSelect
                                    options={monHocOptionsForPhanCong.map((mh) => ({
                                        value: mh.id.toString(),
                                        label: mh.maMonHoc,
                                        secondary: mh.tenMonHoc,
                                    }))}
                                    placeholder="Chọn môn học"
                                    onChange={(value) => setSelectedMonHocId(value)}
                                    defaultValue={selectedMonHocId}
                                    showSecondary={true}
                                    maxDisplayOptions={10}
                                    searchPlaceholder="Tìm trong danh sách..."
                                />
                            </div>
                            {selectedMonHocId && (
                                <div className="mt-2 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
                                    <p className="text-sm text-brand-600 dark:text-brand-400">
                                        <span className="font-medium">Đã chọn:  </span>
                                        {monHocOptionsForPhanCong.find(mh => mh.id.toString() === selectedMonHocId)?.maMonHoc} -
                                        {monHocOptionsForPhanCong.find(mh => mh.id.toString() === selectedMonHocId)?.tenMonHoc}
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
                                <div className="mt-2 p-3 bg-success-50 dark: bg-success-500/10 rounded-lg">
                                    <p className="text-sm text-success-600 dark: text-success-400">
                                        <span className="font-medium">Đã chọn: </span>
                                        {giangVienOptions.find(gv => gv.id.toString() === selectedGiangVienId)?.maGiangVien} -
                                        {giangVienOptions.find(gv => gv.id.toString() === selectedGiangVienId)?.hoTen}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Thông tin tổng hợp */}
                        {selectedMonHocId && selectedGiangVienId && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Xác nhận phân công:
                                </h4>
                                <p className="text-sm text-gray-600 dark: text-gray-400">
                                    Phân công giảng viên{" "}
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {giangVienOptions.find(gv => gv.id.toString() === selectedGiangVienId)?.hoTen}
                                    </span>{" "}
                                    giảng dạy môn{" "}
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {monHocOptionsForPhanCong.find(mh => mh.id.toString() === selectedMonHocId)?.tenMonHoc}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button variant="outline" onClick={closePhanCongModal}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handlePhanCong}
                            disabled={!selectedMonHocId || !selectedGiangVienId || isPhanCongLoading}
                        >
                            {isPhanCongLoading ? "Đang xử lý..." : "Xác nhận phân công"}
                        </Button>
                    </div>
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
        </div>
    );
}