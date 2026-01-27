"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import TextArea from "@/components/form/input/TextArea";
import Badge from "@/components/ui/badge/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faPenToSquare,
    faTrash,
    faCheck,
    faCircleCheck,
    faCircleExclamation,
    faSpinner,
    faTriangleExclamation,
    faPlus,
    faFilter,
    faXmark,
    faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/form/SelectCustom";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { FaAngleDown } from "react-icons/fa6";

// ==================== INTERFACES ====================
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
}

interface LopHocPhanDeXuat {
    stt: number;
    maLopHocPhan: string;
    ghiChu: string;
    maNganh: string;
    maNienKhoa: string;
    maMonHoc: string;
    maNamHoc: string;
    hocKy: number;
    soTinChi: number;
    maGiangVien: string;
    soSinhVienThamGia: number;
}

interface ImportResult {
    message: string;
    summary: {
        success: number;
        failed: number;
        total: number;
    };
    details: Array<{
        index: number;
        maLopHocPhan: string;
        status: "success" | "failed";
        message: string;
        soSinhVienDaDangKy?: number;
    }>;
    success: Array<{
        index: number;
        maLopHocPhan: string;
        message: string;
        soSinhVienDaDangKy: number;
    }>;
    errors: Array<{
        index: number;
        maLopHocPhan: string;
        error: string;
    }>;
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

// ==================== TRANG CHÍNH THÊM LỚP HỌC PHẦN ====================
export default function ThemLopHocPhanPage() {
    const params = useParams();
    const namHocId = params?.namHocId as string;
    const hocKyId = params?.hocKyId as string;
    console.log("namHocId:", namHocId, "hocKyId:", hocKyId);

    // State cho danh sách
    const [lopHocPhans, setLopHocPhans] = useState<LopHocPhanDeXuat[]>([]);
    const [giangViens, setGiangViens] = useState<GiangVien[]>([]);

    // State cho pagination (client-side)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // State cho modals
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConfirmCreateModalOpen, setIsConfirmCreateModalOpen] = useState(false);
    const [editingLopHocPhan, setEditingLopHocPhan] = useState<LopHocPhanDeXuat | null>(null);
    const [deletingLopHocPhan, setDeletingLopHocPhan] = useState<LopHocPhanDeXuat | null>(null);

    // State cho form edit
    const [editFormData, setEditFormData] = useState({
        maLopHocPhan: "",
        ghiChu: "",
        maGiangVien: "",
    });

    // State cho dropdown hành động
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    // State cho filter & search
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFilterGiangVien, setSelectedFilterGiangVien] = useState<string>("");
    const [selectedFilterNganh, setSelectedFilterNganh] = useState<string>("");
    const [selectedFilterNienKhoa, setSelectedFilterNienKhoa] = useState<string>("");
    const [selectedFilterMonHoc, setSelectedFilterMonHoc] = useState<string>("");

    // State cho loading
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // State cho import result
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [resultTab, setResultTab] = useState<"success" | "error">("success");

    // State cho alert
    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // State cho cảnh báo tín chỉ giảng viên trong modal edit
    const [giangVienTinChiWarning, setGiangVienTinChiWarning] = useState<string | null>(null);

    // ==================== COMPUTED VALUES ====================

    // Tính toán summary từ data hiện tại
    const currentSummary = useMemo(() => {
        return {
            tongLop: lopHocPhans.length,
            tongSinhVien: lopHocPhans.reduce((acc, lhp) => acc + lhp.soSinhVienThamGia, 0),
            tongTinChi: lopHocPhans.reduce((acc, lhp) => acc + lhp.soTinChi, 0),
        };
    }, [lopHocPhans]);

    // Map theo dõi số tín chỉ giảng dạy của từng giảng viên trong học kỳ này
    const giangVienTinChiMap = useMemo(() => {
        const map = new Map<string, { tongTinChi: number; danhSachLop: string[] }>();

        lopHocPhans.forEach((lhp) => {
            const maGV = lhp.maGiangVien;
            if (map.has(maGV)) {
                const current = map.get(maGV)!;
                map.set(maGV, {
                    tongTinChi: current.tongTinChi + lhp.soTinChi,
                    danhSachLop: [...current.danhSachLop, lhp.maLopHocPhan],
                });
            } else {
                map.set(maGV, {
                    tongTinChi: lhp.soTinChi,
                    danhSachLop: [lhp.maLopHocPhan],
                });
            }
        });

        return map;
    }, [lopHocPhans]);

    // Hàm kiểm tra tín chỉ khi thay đổi giảng viên
    const checkGiangVienTinChi = (
        maGiangVienMoi: string,
        soTinChiLopHienTai: number,
        maGiangVienCu: string,
        maLopHocPhanHienTai: string
    ): { isOverLimit: boolean; currentTinChi: number; newTinChi: number } => {
        // Lấy tổng tín chỉ hiện tại của giảng viên mới (không tính lớp đang edit nếu cùng GV)
        let currentTinChi = 0;

        if (giangVienTinChiMap.has(maGiangVienMoi)) {
            const data = giangVienTinChiMap.get(maGiangVienMoi)!;
            currentTinChi = data.tongTinChi;

            // Nếu giảng viên mới trùng với giảng viên cũ, không cần trừ đi vì đã tính
            // Nếu khác, giữ nguyên tổng tín chỉ hiện tại
        }

        // Nếu giảng viên mới khác giảng viên cũ, tính tổng tín chỉ mới
        let newTinChi = currentTinChi;
        if (maGiangVienMoi !== maGiangVienCu) {
            newTinChi = currentTinChi + soTinChiLopHienTai;
        }

        return {
            isOverLimit: newTinChi > 12,
            currentTinChi,
            newTinChi,
        };
    };

    // Lấy danh sách unique ngành, niên khóa, môn học từ data
    const uniqueNganhs = useMemo(() => {
        const nganhs = [...new Set(lopHocPhans.map(lhp => lhp.maNganh))];
        return nganhs.map(nganh => ({ value: nganh, label: nganh }));
    }, [lopHocPhans]);

    const uniqueNienKhoas = useMemo(() => {
        const nienKhoas = [...new Set(lopHocPhans.map(lhp => lhp.maNienKhoa))];
        return nienKhoas.map(nk => ({ value: nk, label: nk }));
    }, [lopHocPhans]);

    // Lọc môn học dựa trên giảng viên đã chọn
    const filteredMonHocOptions = useMemo(() => {
        if (selectedFilterGiangVien) {
            const gv = giangViens.find(g => g.maGiangVien === selectedFilterGiangVien);
            if (gv) {
                return gv.monHocGiangViens.map(mhgv => ({
                    value: mhgv.monHoc.maMonHoc,
                    label: mhgv.monHoc.maMonHoc,
                    secondary: mhgv.monHoc.tenMonHoc,
                }));
            }
        }
        // Nếu không có filter giảng viên, lấy tất cả môn học unique
        const monHocs = [...new Set(lopHocPhans.map(lhp => lhp.maMonHoc))];
        return monHocs.map(mh => ({ value: mh, label: mh }));
    }, [selectedFilterGiangVien, giangViens, lopHocPhans]);

    // Lấy danh sách giảng viên options
    const giangVienOptions = useMemo(() => {
        return giangViens.map(gv => ({
            value: gv.maGiangVien,
            label: gv.maGiangVien,
            secondary: gv.hoTen,
        }));
    }, [giangViens]);

    // Lọc danh sách lớp học phần
    const filteredLopHocPhans = useMemo(() => {
        return lopHocPhans.filter(lhp => {
            // Filter by search keyword
            if (searchKeyword && !lhp.maLopHocPhan.toLowerCase().includes(searchKeyword.toLowerCase())) {
                return false;
            }
            // Filter by giảng viên
            if (selectedFilterGiangVien && lhp.maGiangVien !== selectedFilterGiangVien) {
                return false;
            }
            // Filter by ngành
            if (selectedFilterNganh && lhp.maNganh !== selectedFilterNganh) {
                return false;
            }
            // Filter by niên khóa
            if (selectedFilterNienKhoa && lhp.maNienKhoa !== selectedFilterNienKhoa) {
                return false;
            }
            // Filter by môn học
            if (selectedFilterMonHoc && lhp.maMonHoc !== selectedFilterMonHoc) {
                return false;
            }
            return true;
        });
    }, [lopHocPhans, searchKeyword, selectedFilterGiangVien, selectedFilterNganh, selectedFilterNienKhoa, selectedFilterMonHoc]);

    // Pagination
    const pagination: PaginationData = useMemo(() => {
        const total = filteredLopHocPhans.length;
        const totalPages = Math.ceil(total / itemsPerPage);
        return {
            total,
            page: currentPage,
            limit: itemsPerPage,
            totalPages,
        };
    }, [filteredLopHocPhans.length, currentPage, itemsPerPage]);

    // Paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLopHocPhans.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLopHocPhans, currentPage, itemsPerPage]);

    // Lấy danh sách giảng viên phù hợp cho môn học khi edit
    const getGiangVienOptionsForMonHoc = (maMonHoc: string) => {
        const gvsForMonHoc = giangViens.filter(gv =>
            gv.monHocGiangViens.some(mhgv => mhgv.monHoc.maMonHoc === maMonHoc)
        );
        return gvsForMonHoc.map(gv => ({
            value: gv.maGiangVien,
            label: gv.maGiangVien,
            secondary: gv.hoTen,
        }));
    };

    // ==================== API CALLS ====================
    const fetchGiangViens = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/giang-vien?page=1&limit=9999", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setGiangViens(json.data);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách giảng viên");
        }
    };

    const fetchKeHoachLopHocPhan = async () => {
        if (!namHocId || !hocKyId) return;

        setIsLoading(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/giang-day/len-ke-hoach-tao-lhp/json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNamHoc: namHocId,
                    hocKy: parseInt(hocKyId),
                }),
            });
            const json = await res.json();
            if (json.data) {
                setLopHocPhans(json.data);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải kế hoạch tạo lớp học phần");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGiangViens();
        fetchKeHoachLopHocPhan();
    }, [namHocId, hocKyId]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, selectedFilterGiangVien, selectedFilterNganh, selectedFilterNienKhoa, selectedFilterMonHoc]);

    // Reset môn học filter khi thay đổi giảng viên
    useEffect(() => {
        if (selectedFilterGiangVien) {
            setSelectedFilterMonHoc("");
        }
    }, [selectedFilterGiangVien]);

    // ==================== HANDLERS ====================
    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({
            id: Date.now(),
            variant,
            title,
            message,
        });
    };

    const toggleDropdown = (stt: number) => {
        setActiveDropdownId((prev) => (prev === stt ? null : stt));
    };

    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    const clearAllFilters = () => {
        setSearchKeyword("");
        setSelectedFilterGiangVien("");
        setSelectedFilterNganh("");
        setSelectedFilterNienKhoa("");
        setSelectedFilterMonHoc("");
    };

    // Edit handlers
    const openEditModal = (lhp: LopHocPhanDeXuat) => {
        setEditingLopHocPhan(lhp);
        setEditFormData({
            maLopHocPhan: lhp.maLopHocPhan,
            ghiChu: lhp.ghiChu,
            maGiangVien: lhp.maGiangVien,
        });
        setGiangVienTinChiWarning(null); // Reset warning khi mở modal
        setIsEditModalOpen(true);
        closeDropdown();
    };

    const handleEditFormChange = (field: string, value: string) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }));

        // Kiểm tra tín chỉ khi thay đổi giảng viên
        if (field === "maGiangVien" && editingLopHocPhan) {
            const result = checkGiangVienTinChi(
                value,
                editingLopHocPhan.soTinChi,
                editingLopHocPhan.maGiangVien,
                editingLopHocPhan.maLopHocPhan
            );

            if (result.isOverLimit) {
                const gv = giangViens.find(g => g.maGiangVien === value);
                const tenGV = gv ? gv.hoTen : value;
                setGiangVienTinChiWarning(
                    `Giảng viên "${tenGV}" hiện đang có ${result.currentTinChi} tín chỉ. ` +
                    `Nếu thêm lớp này (${editingLopHocPhan.soTinChi} TC), tổng sẽ là ${result.newTinChi} TC, vượt quá giới hạn 12 tín chỉ!`
                );
            } else {
                setGiangVienTinChiWarning(null);
            }
        }
    };
    const handleSaveEdit = () => {
        if (!editingLopHocPhan) return;

        setLopHocPhans((prev) =>
            prev.map((lhp) =>
                lhp.stt === editingLopHocPhan.stt
                    ? {
                        ...lhp,
                        maLopHocPhan: editFormData.maLopHocPhan,
                        ghiChu: editFormData.ghiChu,
                        maGiangVien: editFormData.maGiangVien,
                    }
                    : lhp
            )
        );

        setIsEditModalOpen(false);
        setEditingLopHocPhan(null);
        showAlert("success", "Thành công", "Đã cập nhật thông tin lớp học phần");
    };

    // Delete handlers
    const openDeleteModal = (lhp: LopHocPhanDeXuat) => {
        setDeletingLopHocPhan(lhp);
        setIsDeleteModalOpen(true);
        closeDropdown();
    };

    const handleDelete = () => {
        if (!deletingLopHocPhan) return;

        setLopHocPhans((prev) => prev.filter((lhp) => lhp.stt !== deletingLopHocPhan.stt));
        setIsDeleteModalOpen(false);
        setDeletingLopHocPhan(null);
        showAlert("success", "Thành công", "Đã xóa lớp học phần khỏi danh sách");
    };

    // Create handlers
    const handleConfirmCreate = async () => {
        setIsCreating(true);
        setImportResult(null);

        try {
            const accessToken = getCookie("access_token");

            const bodyData = {
                lopHocPhans: lopHocPhans.map((lhp) => ({
                    maLopHocPhan: lhp.maLopHocPhan,
                    ghiChu: lhp.ghiChu,
                    maNganh: lhp.maNganh,
                    maNienKhoa: lhp.maNienKhoa,
                    maMonHoc: lhp.maMonHoc,
                    maNamHoc: lhp.maNamHoc,
                    hocKy: lhp.hocKy,
                    maGiangVien: lhp.maGiangVien,
                    soSinhVienSeThamGia: lhp.soSinhVienThamGia,
                })),
            };

            const res = await fetch("http://localhost:3000/giang-day/lop-hoc-phan/import-tu-json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(bodyData),
            });

            const result = await res.json();
            setImportResult(result);

            if (result.summary?.success > 0) {
                setResultTab("success");
            } else if (result.summary?.failed > 0) {
                setResultTab("error");
            }
            // Fetch lại dữ liệu table sau khi tạo xong
            await fetchKeHoachLopHocPhan();
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo lớp học phần");
            setIsConfirmCreateModalOpen(false);
        } finally {
            setIsCreating(false);
        }
    };

    const closeConfirmCreateModal = () => {
        setIsConfirmCreateModalOpen(false);
        setImportResult(null);
        setResultTab("success");
    };

    // ==================== RENDER ====================
    return (
        <div>
            <PageBreadcrumb pageTitle={`Thêm hàng loạt Lớp Học Phần trong năm học ${namHocId} - Học kỳ ${hocKyId}`} />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Alert */}
                {alert && (
                    <div className="mb-6">
                        <Alert
                            key={alert.id}
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            dismissible
                            autoDismiss
                            duration={5000}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                {/* Summary Info */}
                {lopHocPhans.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-600 dark:text-blue-400">Tổng số lớp học phần</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{currentSummary.tongLop}</p>
                        </div>
                        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-600 dark:text-green-400">Tổng sinh viên sẽ tham gia</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{currentSummary.tongSinhVien}</p>
                        </div>
                        <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4 border border-purple-200 dark:border-purple-800">
                            <p className="text-sm text-purple-600 dark:text-purple-400">Tổng tín chỉ</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{currentSummary.tongTinChi}</p>
                        </div>
                    </div>
                )}

                {/* Search và Button */}
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="w-full lg:max-w-md">
                        <div className="relative">
                            <button
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
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => setIsConfirmCreateModalOpen(true)}
                            disabled={lopHocPhans.length === 0}
                            startIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Xác nhận tạo lớp học phần ({lopHocPhans.length})
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-4">
                        <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">Bộ lọc</span>
                        {(selectedFilterGiangVien || selectedFilterNganh || selectedFilterNienKhoa || selectedFilterMonHoc) && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={clearAllFilters}
                                className="ml-auto"
                                startIcon={<FontAwesomeIcon icon={faXmark} />}
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filter Giảng viên */}
                        <div>
                            <Label className="mb-2 block text-sm">Giảng viên</Label>
                            <SearchableSelect
                                options={giangVienOptions}
                                placeholder="Tất cả giảng viên"
                                onChange={(value) => setSelectedFilterGiangVien(value)}
                                defaultValue={selectedFilterGiangVien}
                                showSecondary={true}
                                searchPlaceholder="Tìm mã hoặc tên GV..."
                            />
                        </div>

                        {/* Filter Ngành */}
                        <div>
                            <Label className="mb-2 block text-sm">Ngành</Label>
                            <SearchableSelect
                                options={uniqueNganhs}
                                placeholder="Tất cả ngành"
                                onChange={(value) => setSelectedFilterNganh(value)}
                                defaultValue={selectedFilterNganh}
                                searchPlaceholder="Tìm mã ngành..."
                            />
                        </div>

                        {/* Filter Niên khóa */}
                        <div>
                            <Label className="mb-2 block text-sm">Niên khóa</Label>
                            <SearchableSelect
                                options={uniqueNienKhoas}
                                placeholder="Tất cả niên khóa"
                                onChange={(value) => setSelectedFilterNienKhoa(value)}
                                defaultValue={selectedFilterNienKhoa}
                                searchPlaceholder="Tìm mã niên khóa..."
                            />
                        </div>

                        {/* Filter Môn học */}
                        <div>
                            <Label className="mb-2 block text-sm">
                                Môn học
                                {selectedFilterGiangVien && (
                                    <span className="ml-1 text-xs text-blue-500">(theo GV đã chọn)</span>
                                )}
                            </Label>
                            <SearchableSelect
                                options={filteredMonHocOptions}
                                placeholder="Tất cả môn học"
                                onChange={(value) => setSelectedFilterMonHoc(value)}
                                defaultValue={selectedFilterMonHoc}
                                showSecondary={true}
                                searchPlaceholder="Tìm mã môn học..."
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-brand-500" />
                    </div>
                )}

                {/* Table */}
                {!isLoading && (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[1000px]">
                                <Table>
                                    {/* Table Header */}
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow className="grid grid-cols-[20%_10%_12%_15%_18%_10%_15%]">
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left"
                                            >
                                                Mã LHP
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Mã Ngành
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Mã Niên Khóa
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Mã Môn học
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Mã Giảng viên
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Số SV
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Hành động
                                            </TableCell>
                                        </TableRow>
                                    </TableHeader>

                                    {/* Table Body */}
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                        {paginatedData.length === 0 ? (
                                            <TableRow>
                                                <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 col-span-7">
                                                    Không có dữ liệu
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedData.map((lhp) => (
                                                <TableRow
                                                    key={lhp.stt}
                                                    className="grid grid-cols-[20%_10%_12%_15%_18%_10%_15%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 font-medium">
                                                        {lhp.maLopHocPhan}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <Badge variant="light" color="primary">
                                                            {lhp.maNganh}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                                                        {lhp.maNienKhoa}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <Badge variant="light" color="info">
                                                            {lhp.maMonHoc}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center text-gray-600 dark:text-gray-400">
                                                        {lhp.maGiangVien}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <Badge variant="solid" color="success">
                                                            {lhp.soSinhVienThamGia}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <div className="relative inline-block">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleDropdown(lhp.stt)}
                                                                className="dropdown-toggle flex items-center gap-1.5 min-w-[100px] justify-between px-3 py-2"
                                                            >
                                                                Thao tác
                                                                <FaAngleDown
                                                                    className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === lhp.stt ? "rotate-180" : "rotate-0"
                                                                        }`}
                                                                />
                                                            </Button>

                                                            <Dropdown
                                                                isOpen={activeDropdownId === lhp.stt}
                                                                onClose={closeDropdown}
                                                                className="w-40"
                                                            >
                                                                <div className="py-1">
                                                                    <DropdownItem
                                                                        tag="button"
                                                                        onItemClick={closeDropdown}
                                                                        onClick={() => openEditModal(lhp)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2 w-4" />
                                                                        Sửa
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
                )}

                {/* Pagination và Items Count Info */}
                {!isLoading && (
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
                )}
            </div>

            {/* Modal Sửa */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingLopHocPhan(null);
                }}
                className="max-w-xl"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Chỉnh sửa Lớp Học Phần
                    </h3>

                    {editingLopHocPhan && (
                        <>
                            {/* Thông tin không sửa được */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Mã Ngành:</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{editingLopHocPhan.maNganh}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Mã Niên Khóa:</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{editingLopHocPhan.maNienKhoa}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Mã Môn học:</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{editingLopHocPhan.maMonHoc}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Số tín chỉ:</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{editingLopHocPhan.soTinChi}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Số SV tham gia:</span>
                                        <p className="font-medium text-gray-800 dark:text-white">{editingLopHocPhan.soSinhVienThamGia}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Form sửa */}
                            <div className="space-y-5">
                                <div>
                                    <Label>Mã Lớp Học Phần</Label>
                                    <Input
                                        defaultValue={editFormData.maLopHocPhan}
                                        onChange={(e) => handleEditFormChange("maLopHocPhan", e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label>Ghi chú</Label>
                                    <TextArea
                                        placeholder="Nhập ghi chú"
                                        rows={3}
                                        defaultValue={editFormData.ghiChu}
                                        onChange={(value) => handleEditFormChange("ghiChu", value)}
                                    />
                                </div>

                                <div>
                                    <Label>Mã Giảng viên</Label>
                                    <SearchableSelect
                                        options={getGiangVienOptionsForMonHoc(editingLopHocPhan.maMonHoc)}
                                        placeholder="Chọn giảng viên"
                                        onChange={(value) => handleEditFormChange("maGiangVien", value)}
                                        defaultValue={editFormData.maGiangVien}
                                        showSecondary={true}
                                        searchPlaceholder="Tìm mã hoặc tên GV..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Chỉ hiển thị giảng viên phụ trách môn {editingLopHocPhan.maMonHoc}
                                    </p>

                                    {/* Hiển thị thông tin tín chỉ hiện tại của giảng viên đã chọn */}
                                    {editFormData.maGiangVien && giangVienTinChiMap.has(editFormData.maGiangVien) && (
                                        <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                                Giảng viên này hiện đang có{" "}
                                                <strong>{giangVienTinChiMap.get(editFormData.maGiangVien)?.tongTinChi || 0}</strong> tín chỉ
                                                trong học kỳ này
                                            </p>
                                        </div>
                                    )}

                                    {/* Cảnh báo vượt quá tín chỉ */}
                                    {giangVienTinChiWarning && (
                                        <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <div className="flex items-start gap-2">
                                                <FontAwesomeIcon
                                                    icon={faTriangleExclamation}
                                                    className="text-red-500 dark:text-red-400 mt-0.5"
                                                />
                                                <p className="text-sm text-red-700 dark:text-red-300">
                                                    {giangVienTinChiWarning}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingLopHocPhan(null);
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingLopHocPhan(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <FontAwesomeIcon icon={faTrash} className="text-xl text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Xác nhận xóa
                            </h3>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Bạn có chắc chắn muốn xóa lớp học phần{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {deletingLopHocPhan?.maLopHocPhan}
                        </span>{" "}
                        khỏi danh sách?
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
                        <Button
                            variant="primary"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Xác nhận tạo lớp học phần */}
            <Modal
                isOpen={isConfirmCreateModalOpen}
                onClose={() => {
                    if (!isCreating) {
                        closeConfirmCreateModal();
                    }
                }}
                className="max-w-4xl"
            >
                <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${importResult
                            ? importResult.summary.failed === 0
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-amber-100 dark:bg-amber-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                            }`}>
                            <FontAwesomeIcon
                                icon={
                                    importResult
                                        ? importResult.summary.failed === 0
                                            ? faCircleCheck
                                            : faTriangleExclamation
                                        : faPlus
                                }
                                className={`text-2xl ${importResult
                                    ? importResult.summary.failed === 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-amber-600 dark:text-amber-400"
                                    : "text-blue-600 dark:text-blue-400"
                                    }`}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                {importResult ? "Kết quả tạo lớp học phần" : "Xác nhận tạo lớp học phần"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {importResult
                                    ? importResult.message
                                    : `Tạo ${lopHocPhans.length} lớp học phần cho ${namHocId} - Học kỳ ${hocKyId}`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Nội dung trước khi tạo */}
                    {!importResult && !isCreating && (
                        <>
                            {/* Summary */}
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-center border border-blue-200 dark:border-blue-800">
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        {lopHocPhans.length}
                                    </p>
                                    <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Số lớp</p>
                                </div>
                                <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4 text-center border border-green-200 dark:border-green-800">
                                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                        {lopHocPhans.reduce((acc, lhp) => acc + lhp.soSinhVienThamGia, 0)}
                                    </p>
                                    <p className="text-sm text-green-600/70 dark:text-green-400/70">Tổng SV</p>
                                </div>
                                <div className="rounded-xl bg-purple-50 dark:bg-purple-900/20 p-4 text-center border border-purple-200 dark:border-purple-800">
                                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                        {lopHocPhans.reduce((acc, lhp) => acc + lhp.soTinChi, 0)}
                                    </p>
                                    <p className="text-sm text-purple-600/70 dark:text-purple-400/70">Tổng TC</p>
                                </div>
                            </div>

                            {/* Cảnh báo */}
                            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20">
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <FontAwesomeIcon
                                            icon={faTriangleExclamation}
                                            className="text-lg text-amber-600 dark:text-amber-400 mt-0.5"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                                Lưu ý
                                            </h4>
                                            <ul className="text-sm text-amber-700/80 dark:text-amber-300/70 space-y-1 list-disc list-inside">
                                                <li>Hành động này sẽ tạo các lớp học phần vào hệ thống</li>
                                                <li>Sinh viên sẽ được tự động đăng ký vào các lớp</li>
                                                <li>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center">
                                Bạn có chắc chắn muốn tạo <strong>{lopHocPhans.length}</strong> lớp học phần?
                            </p>
                        </>
                    )}

                    {/* Loading state */}
                    {isCreating && (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full border-4 border-blue-100 dark:border-blue-900/50"></div>
                                <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <FontAwesomeIcon
                                        icon={faPlus}
                                        className="text-2xl text-blue-500"
                                    />
                                </div>
                            </div>
                            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                                Đang tạo lớp học phần...
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Vui lòng đợi trong giây lát
                            </p>
                        </div>
                    )}

                    {/* Kết quả sau khi tạo */}
                    {importResult && (
                        <>
                            {/* Summary */}
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 text-center border border-gray-200 dark:border-gray-700">
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {importResult.summary.total}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tổng xử lý</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {importResult.summary.success}
                                    </p>
                                    <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">Thành công</p>
                                </div>
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-center border border-red-200 dark:border-red-800">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {importResult.summary.failed}
                                    </p>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70">Thất bại</p>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="mb-4 flex border-b border-gray-200 dark:border-gray-700">
                                {/* Tabs */}
                                <div className="mb-4 flex gap-2">
                                    <Button
                                        variant={resultTab === "success" ? "primary" : "outline"}
                                        size="sm"
                                        onClick={() => setResultTab("success")}
                                        startIcon={<FontAwesomeIcon icon={faCircleCheck} />}
                                        className={resultTab === "success"
                                            ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                                            : "text-gray-500 hover:text-emerald-600 hover:border-emerald-300 dark:text-gray-400 dark:hover:text-emerald-400"
                                        }
                                    >
                                        Thành công ({importResult.success?.length || 0})
                                    </Button>
                                    <Button
                                        variant={resultTab === "error" ? "primary" : "outline"}
                                        size="sm"
                                        onClick={() => setResultTab("error")}
                                        startIcon={<FontAwesomeIcon icon={faCircleExclamation} />}
                                        className={resultTab === "error"
                                            ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                            : "text-gray-500 hover:text-red-600 hover:border-red-300 dark:text-gray-400 dark:hover:text-red-400"
                                        }
                                    >
                                        Thất bại ({importResult.errors?.length || 0})
                                    </Button>
                                </div>
                            </div>

                            {/* Table Thành công */}
                            {resultTab === "success" && (
                                <div className="max-h-64 overflow-y-auto rounded-lg border border-emerald-200 dark:border-emerald-900/30 bg-white dark:bg-gray-900">
                                    {(!importResult.success || importResult.success.length === 0) ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Không có lớp học phần nào được tạo thành công
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="border-b border-emerald-100 dark:border-emerald-900/30 top-0 bg-emerald-50 dark:bg-emerald-900/20">
                                                <TableRow className="grid grid-cols-[10%_25%_45%_20%]">
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center">
                                                        STT
                                                    </TableCell>
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center">
                                                        Mã LHP
                                                    </TableCell>
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-left">
                                                        Thông báo
                                                    </TableCell>
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center">
                                                        Số SV đăng ký
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-emerald-100 dark:divide-emerald-900/30 text-sm">
                                                {(importResult.success || []).map((item) => (
                                                    <TableRow key={item.index} className="grid grid-cols-[10%_25%_45%_20%] hover:bg-emerald-50/50 dark:hover:bg-emerald-900/5">
                                                        <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-medium">
                                                            {item.index}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                            {item.maLopHocPhan}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-emerald-600 dark:text-emerald-400 text-xs">
                                                            {item.message}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-center">
                                                            <Badge variant="solid" color="success">
                                                                {item.soSinhVienDaDangKy}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            )}

                            {/* Table Thất bại */}
                            {resultTab === "error" && (
                                <div className="max-h-64 overflow-y-auto rounded-lg border border-red-200 dark:border-red-900/30 bg-white dark:bg-gray-900">
                                    {(!importResult.errors || importResult.errors.length === 0) ? (
                                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            Không có lỗi nào xảy ra
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader className="border-b border-red-100 dark:border-red-900/30 top-0 bg-red-50 dark:bg-red-900/20">
                                                <TableRow className="grid grid-cols-[10%_25%_65%]">
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center">
                                                        STT
                                                    </TableCell>
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-center">
                                                        Mã LHP
                                                    </TableCell>
                                                    <TableCell isHeader className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300 text-xs text-left">
                                                        Lỗi
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-red-100 dark:divide-red-900/30 text-sm">
                                                {(importResult.errors || []).map((item) => (
                                                    <TableRow key={item.index} className="grid grid-cols-[10%_25%_65%] hover:bg-red-50/50 dark:hover:bg-red-900/5">
                                                        <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-medium">
                                                            {item.index}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-gray-800 dark:text-white text-center font-mono text-xs">
                                                            {item.maLopHocPhan}
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2 text-red-600 dark:text-red-400 text-xs">
                                                            {item.error}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            )}

                            {/* Thông báo tổng kết */}
                            {importResult.summary.failed === 0 && importResult.summary.success > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 text-xl" />
                                        </div>
                                        <p className="text-green-700 dark:text-green-400 font-semibold">
                                            Tất cả lớp học phần đã được tạo thành công!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {importResult.summary.failed > 0 && importResult.summary.success > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-500 text-xl" />
                                        </div>
                                        <p className="text-amber-700 dark:text-amber-400 font-semibold">
                                            Đã tạo {importResult.summary.success} lớp, {importResult.summary.failed} lớp bị lỗi
                                        </p>
                                    </div>
                                </div>
                            )}

                            {importResult.summary.success === 0 && importResult.summary.failed > 0 && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-800">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                            <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 text-xl" />
                                        </div>
                                        <p className="text-red-700 dark:text-red-400 font-semibold">
                                            Không có lớp học phần nào được tạo thành công
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-6">
                        {!importResult ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={closeConfirmCreateModal}
                                    disabled={isCreating}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleConfirmCreate}
                                    disabled={isCreating}
                                    startIcon={
                                        isCreating
                                            ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                            : <FontAwesomeIcon icon={faCheck} />
                                    }
                                >
                                    {isCreating ? "Đang xử lý..." : "Xác nhận tạo"}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="primary"
                                onClick={closeConfirmCreateModal}
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