"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";
import {
    faMagnifyingGlass,
    faEye,
    faUserMinus,
    faTriangleExclamation,
    faCircleInfo,
    faTrashCan,           // THÊM MỚI
    faSpinner,            // THÊM MỚI
    faCircleCheck,        // THÊM MỚI
    faCircleExclamation   // THÊM MỚI
} from "@fortawesome/free-solid-svg-icons";
import Checkbox from "@/components/form/input/Checkbox"; // THÊM MỚI

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
            return "Học cải thiện";
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

    // State cho modal xóa sinh viên
    const [isDeleteSinhVienModalOpen, setIsDeleteSinhVienModalOpen] = useState(false);
    const [deletingSinhVien, setDeletingSinhVien] = useState<SinhVienDiem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // State cho checkbox và xóa hàng loạt
    const [selectedSinhVienIds, setSelectedSinhVienIds] = useState<number[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [bulkDeleteResults, setBulkDeleteResults] = useState<Array<{
        id: number;
        maSinhVien: string;
        hoTen: string;
        status: "success" | "failed";
        message: string;
    }> | null>(null);

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
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Fetch danh sách sinh viên và điểm
    const fetchDanhSachSinhVien = async (page: number = 1, search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/giang-day/lop-hoc-phan/danh-sach-sinh-vien/${lopHocPhanId}?page=${page}&limit=10`;
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
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
    };

    // Mở modal xóa sinh viên
    const openDeleteSinhVienModal = (sinhVienDiem: SinhVienDiem) => {
        setDeletingSinhVien(sinhVienDiem);
        setIsDeleteSinhVienModalOpen(true);
    };

    // Xử lý xóa sinh viên khỏi lớp học phần
    const handleDeleteSinhVien = async () => {
        if (!deletingSinhVien || !lopHocPhanId) return;

        setIsDeleting(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/giang-day/lop-hoc-phan/${lopHocPhanId}/sinh-vien-dang-ky/${deletingSinhVien.sinhVien.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteSinhVienModalOpen(false);
            setDeletingSinhVien(null);

            if (res.ok) {
                showAlert(
                    "success",
                    "Thành công",
                    `Đã xóa sinh viên ${deletingSinhVien.sinhVien.maSinhVien} - ${deletingSinhVien.sinhVien.hoTen} khỏi lớp học phần`
                );
                fetchDanhSachSinhVien(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa sinh viên thất bại");
            }
        } catch (err) {
            setIsDeleteSinhVienModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa sinh viên");
        } finally {
            setIsDeleting(false);
        }
    };

    const openViewModal = (sinhVienDiem: SinhVienDiem) => {
        setViewingSinhVien(sinhVienDiem);
        setIsViewModalOpen(true);
    };

    // ==================== CHECKBOX & BULK DELETE HANDLERS ====================

    // Lấy danh sách sinh viên có thể xóa (chưa có điểm)
    const deletableSinhViens = danhSachSinhVien.filter(item => item.chuaCoDiem);

    // Kiểm tra xem tất cả sinh viên có thể xóa đã được chọn chưa
    const isAllSelected = deletableSinhViens.length > 0 &&
        deletableSinhViens.every(item => selectedSinhVienIds.includes(item.sinhVien.id));

    // Kiểm tra trạng thái indeterminate
    const isIndeterminate = selectedSinhVienIds.length > 0 &&
        selectedSinhVienIds.length < deletableSinhViens.length;

    // Toggle chọn tất cả (chỉ chọn những sinh viên chưa có điểm)
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedSinhVienIds(deletableSinhViens.map(item => item.sinhVien.id));
        } else {
            setSelectedSinhVienIds([]);
        }
    };

    // Toggle chọn một sinh viên
    const handleSelectOne = (sinhVienId: number, checked: boolean) => {
        if (checked) {
            setSelectedSinhVienIds(prev => [...prev, sinhVienId]);
        } else {
            setSelectedSinhVienIds(prev => prev.filter(id => id !== sinhVienId));
        }
    };

    // Kiểm tra một sinh viên có được chọn không
    const isSelected = (sinhVienId: number) => selectedSinhVienIds.includes(sinhVienId);

    // Reset selection khi chuyển trang hoặc search
    useEffect(() => {
        setSelectedSinhVienIds([]);
    }, [currentPage, searchKeyword]);

    // Mở modal xóa hàng loạt
    const openBulkDeleteModal = () => {
        if (selectedSinhVienIds.length === 0) {
            showAlert("warning", "Cảnh báo", "Vui lòng chọn ít nhất một sinh viên để xóa");
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
            setSelectedSinhVienIds([]);
            fetchDanhSachSinhVien(currentPage, searchKeyword);
        }
    };

    // Xử lý xóa hàng loạt
    const handleBulkDelete = async () => {
        if (!lopHocPhanId) return;

        setIsBulkDeleting(true);
        const results: Array<{
            id: number;
            maSinhVien: string;
            hoTen: string;
            status: "success" | "failed";
            message: string;
        }> = [];

        const accessToken = getCookie("access_token");

        // Lấy thông tin các sinh viên được chọn
        const selectedSinhViens = danhSachSinhVien.filter(
            item => selectedSinhVienIds.includes(item.sinhVien.id)
        );

        for (const item of selectedSinhViens) {
            try {
                const res = await fetch(
                    `http://localhost:3000/giang-day/lop-hoc-phan/${lopHocPhanId}/sinh-vien-dang-ky/${item.sinhVien.id}`,
                    {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                if (res.ok) {
                    results.push({
                        id: item.sinhVien.id,
                        maSinhVien: item.sinhVien.maSinhVien,
                        hoTen: item.sinhVien.hoTen,
                        status: "success",
                        message: "Xóa thành công",
                    });
                } else {
                    const err = await res.json();
                    results.push({
                        id: item.sinhVien.id,
                        maSinhVien: item.sinhVien.maSinhVien,
                        hoTen: item.sinhVien.hoTen,
                        status: "failed",
                        message: err.message || "Xóa thất bại",
                    });
                }
            } catch (err) {
                results.push({
                    id: item.sinhVien.id,
                    maSinhVien: item.sinhVien.maSinhVien,
                    hoTen: item.sinhVien.hoTen,
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

    return (
        <div>
            <PageBreadcrumb pageTitle="Chi tiết Lớp Học Phần" />

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
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ngành</p>
                                <p className="font-medium text-gray-800 dark:text-white">
                                    {lopHocPhanInfo.maNganh} - {lopHocPhanInfo.tenNganh}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Niên khóa</p>
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

                {/* Tìm kiếm và Button xóa hàng loạt */}
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
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2. 5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    {/* Button Xóa hàng loạt - THÊM MỚI */}
                    <div className="flex gap-3">
                        {selectedSinhVienIds.length > 0 && (
                            <Button
                                variant="danger"
                                onClick={openBulkDeleteModal}
                                startIcon={<FontAwesomeIcon icon={faTrashCan} />}
                            >
                                Xóa khỏi lớp ({selectedSinhVienIds.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[5%_18%_18%_18%_18%_23%]">
                                        {/* Checkbox chọn tất cả */}
                                        <TableCell isHeader className="px-3 py-3 font-medium text-gray-500 text-theme-xs flex items-center justify-center">
                                            <Checkbox
                                                checked={isAllSelected}
                                                indeterminate={isIndeterminate}
                                                onChange={handleSelectAll}
                                                disabled={deletableSinhViens.length === 0}
                                            />
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã sinh viên
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã lớp niên chế
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Loại tham gia
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Có điểm
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {danhSachSinhVien.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-8 text-center text-gray-500 dark: text-gray-400 col-span-6">
                                                Không có dữ liệu sinh viên
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        danhSachSinhVien.map((item) => (
                                            <TableRow
                                                key={item.sinhVien.id}
                                                className={`grid grid-cols-[5%_18%_18%_18%_18%_23%] items-center ${isSelected(item.sinhVien.id) ? "bg-brand-50 dark: bg-brand-900/10" : ""
                                                    }`}
                                            >
                                                {/* Checkbox - disabled nếu đã có điểm */}
                                                <TableCell className="px-3 py-4 flex items-center justify-center">
                                                    <Checkbox
                                                        checked={isSelected(item.sinhVien.id)}
                                                        onChange={(checked) => handleSelectOne(item.sinhVien.id, checked)}
                                                        disabled={!item.chuaCoDiem}
                                                    />
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {item.sinhVien.maSinhVien}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {item.sinhVien.malop}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={getLoaiThamGiaColor(item.loaiThamGia)}>
                                                        {getLoaiThamGiaLabel(item.loaiThamGia)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={item.chuaCoDiem ? "warning" : "success"}>
                                                        {item.chuaCoDiem ? "Chưa có" : "Có"}
                                                    </Badge>
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

                                                                {/* THÊM MỚI - Divider và DropdownItem Xóa sinh viên */}
                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteSinhVienModal(item)}
                                                                    disabled={!item.chuaCoDiem}
                                                                    className={!item.chuaCoDiem
                                                                        ? "opacity-50 cursor-not-allowed"
                                                                        : "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon icon={faUserMinus} className="mr-2 w-4" />
                                                                    Xóa khỏi lớp
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

            {/* Modal Xóa sinh viên khỏi lớp học phần */}
            <Modal
                isOpen={isDeleteSinhVienModalOpen}
                onClose={() => {
                    if (!isDeleting) {
                        setIsDeleteSinhVienModalOpen(false);
                        setDeletingSinhVien(null);
                    }
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    {/* Header với icon cảnh báo */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <FontAwesomeIcon
                                icon={faUserMinus}
                                className="text-2xl text-red-600 dark:text-red-400"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Xóa sinh viên khỏi lớp
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Hành động này không thể hoàn tác
                            </p>
                        </div>
                    </div>

                    {/* Thông tin sinh viên sẽ xóa */}
                    {deletingSinhVien && (
                        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Mã sinh viên:</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {deletingSinhVien.sinhVien.maSinhVien}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Họ tên:</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {deletingSinhVien.sinhVien.hoTen}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Lớp niên chế:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {deletingSinhVien.sinhVien.malop}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Loại tham gia:</span>
                                    <Badge variant="solid" color={getLoaiThamGiaColor(deletingSinhVien.loaiThamGia)}>
                                        {getLoaiThamGiaLabel(deletingSinhVien.loaiThamGia)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cảnh báo */}
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
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1 text-sm">
                                        Lưu ý quan trọng
                                    </h4>
                                    <ul className="text-xs text-amber-700/80 dark:text-amber-300/70 space-y-1 list-disc list-inside">
                                        <li>Sinh viên sẽ bị xóa hoàn toàn khỏi lớp học phần này</li>
                                        <li>Sinh viên cần đăng ký lại nếu muốn tham gia lớp</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin về sinh viên đã có điểm */}
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faCircleInfo}
                                        className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-blue-700/80 dark:text-blue-300/70">
                                        <strong>Lưu ý:</strong> Chỉ có thể xóa sinh viên chưa có điểm.
                                        Đối với sinh viên đã có điểm, vui lòng liên hệ <strong>Phòng Đào tạo</strong> để được hỗ trợ.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                        Chắc chắn muốn xóa sinh viên này khỏi lớp học phần?
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteSinhVienModalOpen(false);
                                setDeletingSinhVien(null);
                            }}
                            disabled={isDeleting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDeleteSinhVien}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Đang xóa...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faUserMinus} className="mr-2" />
                                    Xác nhận xóa
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* Modal Xóa hàng loạt sinh viên */}
            <Modal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => {
                    if (!isBulkDeleting) {
                        closeBulkDeleteModal();
                    }
                }}
                className="max-w-2xl"
            >
                <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <FontAwesomeIcon
                                icon={faTrashCan}
                                className="text-2xl text-red-600 dark:text-red-400"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Xóa hàng loạt sinh viên khỏi lớp
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {bulkDeleteResults
                                    ? "Kết quả xóa sinh viên"
                                    : `Đã chọn ${selectedSinhVienIds.length} sinh viên`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Nội dung trước khi xóa */}
                    {!bulkDeleteResults && !isBulkDeleting && (
                        <>
                            {/* Thông tin lớp học phần */}
                            {lopHocPhanInfo && (
                                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark: border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Lớp học phần: <strong className="text-gray-800 dark:text-white">{lopHocPhanInfo.maLopHocPhan}</strong>
                                        {" - "}
                                        <span>{lopHocPhanInfo.monHoc}</span>
                                    </p>
                                </div>
                            )}

                            {/* Danh sách sinh viên sẽ xóa */}
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Danh sách sinh viên sẽ bị xóa khỏi lớp:
                                </h4>
                                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">STT</th>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Mã SV</th>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Họ tên</th>
                                                <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Lớp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {danhSachSinhVien
                                                .filter(item => selectedSinhVienIds.includes(item.sinhVien.id))
                                                .map((item, index) => (
                                                    <tr key={item.sinhVien.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{index + 1}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-white font-medium">{item.sinhVien.maSinhVien}</td>
                                                        <td className="px-4 py-2 text-gray-800 dark:text-white">{item.sinhVien.hoTen}</td>
                                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{item.sinhVien.malop}</td>
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
                                                <li>Sinh viên sẽ bị xóa hoàn toàn khỏi lớp học phần</li>
                                                <li>Sinh viên cần đăng ký lại nếu muốn tham gia lớp</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin bổ sung */}
                            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <FontAwesomeIcon
                                                icon={faCircleInfo}
                                                className="text-lg text-blue-600 dark:text-blue-400 mt-0.5"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-blue-700/80 dark:text-blue-300/70">
                                                <strong>Lưu ý:</strong> Chỉ có thể xóa sinh viên chưa có điểm.
                                                Sinh viên đã có điểm không thể chọn và không nằm trong danh sách này.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                                Bạn có chắc chắn muốn xóa <strong>{selectedSinhVienIds.length}</strong> sinh viên đã chọn khỏi lớp học phần?
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
                                        icon={faUserMinus}
                                        className="text-2xl text-red-500"
                                    />
                                </div>
                            </div>
                            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                                Đang xóa sinh viên...
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
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tổng xử lý</p>
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
                                            Đã xóa thành công <strong>{getDeleteSummary().success}</strong> sinh viên khỏi lớp học phần
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
                                                <th className="px-3 py-2 text-left text-gray-600 dark: text-gray-400 font-medium">Mã SV</th>
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
                                                        {result.maSinhVien}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-800 dark:text-white">
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
                                            : <FontAwesomeIcon icon={faUserMinus} />
                                    }
                                >
                                    {isBulkDeleting ? "Đang xóa..." : `Xác nhận xóa ${selectedSinhVienIds.length} sinh viên`}
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