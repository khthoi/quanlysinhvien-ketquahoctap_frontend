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
    faFileExcel,
    faLock,
    faDownload,           // THÊM MỚI
    faSpinner,            // THÊM MỚI
    faCircleInfo,         // THÊM MỚI
    faTriangleExclamation // THÊM MỚI
} from "@fortawesome/free-solid-svg-icons";
import TextArea from "@/components/form/input/TextArea";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

type TrangThai = "DANG_HOC" | "DA_KET_THUC" | "CHUA_BAT_DAU";

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

const KHOA_DIEM_OPTIONS: { label: string; value: string }[] = [
    { label: "Đã khóa", value: "true" },
    { label: "Chưa khóa", value: "false" },
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

// Hàm chuyển trạng thái khóa điểm thành tên tiếng Việt
const getKhoaDiemLabel = (khoaDiem: boolean): string => {
    return khoaDiem ? "Đã khóa" : "Chưa khóa";
};

const getKhoaDiemColor = (khoaDiem: boolean): "error" | "success" => {
    return khoaDiem ? "error" : "success";
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

    // State cho filter
    const [filterMonHocId, setFilterMonHocId] = useState("");
    const [filterGiangVienId, setFilterGiangVienId] = useState("");
    const [filterHocKyId, setFilterHocKyId] = useState("");
    const [filterNienKhoaId, setFilterNienKhoaId] = useState("");
    const [filterNganhId, setFilterNganhId] = useState("");
    const [filterNamHocId, setFilterNamHocId] = useState("");
    const [filterKhoaDiem, setFilterKhoaDiem] = useState<string>("");
    const [filterExpanded, setFilterExpanded] = useState(false);

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

    // State cho modal tải xuống Excel
    const [isDownloadExcelModalOpen, setIsDownloadExcelModalOpen] = useState(false);
    const [downloadingExcelLopHocPhan, setDownloadingExcelLopHocPhan] = useState<LopHocPhan | null>(null);
    const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

    // State cho options
    const [monHocOptions, setMonHocOptions] = useState<MonHocOption[]>([]);
    const [namHocOptions, setNamHocOptions] = useState<NamHocOption[]>([]);
    const [nienKhoaOptions, setNienKhoaOptions] = useState<NienKhoaOption[]>([]);
    const [khoaOptions, setKhoaOptions] = useState<KhoaOption[]>([]);
    const [nganhOptions, setNganhOptions] = useState<NganhOption[]>([]);

    // State cho modal khóa điểm
    const [isKhoaDiemModalOpen, setIsKhoaDiemModalOpen] = useState(false);
    const [khoaDiemLopHocPhan, setKhoaDiemLopHocPhan] = useState<LopHocPhan | null>(null);
    const [isKhoaDiemLoading, setIsKhoaDiemLoading] = useState(false);

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
        hocKyId: false,
        nienKhoaId: false,
        nganhId: false,
    });

    const [alert, setAlert] = useState<{
        id: number;
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
        khoaDiemFilter: string = "",
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/giang-day/lop-hoc-phan/giang-vien/me?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (monHocIdFilter) url += `&monHocId=${monHocIdFilter}`;
            if (giangVienIdFilter) url += `&giangVienId=${giangVienIdFilter}`;
            if (hocKyIdFilter) url += `&hocKyId=${hocKyIdFilter}`;
            if (nienKhoaIdFilter) url += `&nienKhoaId=${nienKhoaIdFilter}`;
            if (nganhIdFilter) url += `&nganhId=${nganhIdFilter}`;
            if (khoaDiemFilter) url += `&khoaDiem=${khoaDiemFilter}`;

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

    // Mở modal khóa điểm
    const openKhoaDiemModal = (lopHocPhan: LopHocPhan) => {
        setKhoaDiemLopHocPhan(lopHocPhan);
        setIsKhoaDiemModalOpen(true);
    };

    // Xử lý khóa điểm
    const handleKhoaDiem = async () => {
        if (!khoaDiemLopHocPhan) return;

        setIsKhoaDiemLoading(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/giang-day/lop-hoc-phan/khoa-diem/${khoaDiemLopHocPhan.id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsKhoaDiemModalOpen(false);
            setKhoaDiemLopHocPhan(null);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            if (res.ok) {
                showAlert("success", "Thành công", `Đã khóa điểm lớp học phần "${khoaDiemLopHocPhan.maLopHocPhan}" thành công`);
                // Refresh lại danh sách
                fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Khóa điểm thất bại");
            }
        } catch (err) {
            setIsKhoaDiemModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi khóa điểm");
        } finally {
            setIsKhoaDiemLoading(false);
        }
    };

    // Mở modal tải xuống Excel
    const openDownloadExcelModal = (lopHocPhan: LopHocPhan) => {
        setDownloadingExcelLopHocPhan(lopHocPhan);
        setIsDownloadExcelModalOpen(true);
    };

    // Đóng modal tải xuống Excel
    const closeDownloadExcelModal = () => {
        setIsDownloadExcelModalOpen(false);
        setDownloadingExcelLopHocPhan(null);
    };

    // Xử lý tải xuống Excel
    const handleDownloadExcel = async () => {
        if (!downloadingExcelLopHocPhan) return;

        setIsDownloadingExcel(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/bao-cao/bang-diem-lop-hoc-phan/${downloadingExcelLopHocPhan.id}`,
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
                link.download = `Bang diem lop hoc phan ${downloadingExcelLopHocPhan.maLopHocPhan}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                showAlert("success", "Thành công", `Đã tải xuống bảng điểm lớp học phần ${downloadingExcelLopHocPhan.maLopHocPhan}`);
                closeDownloadExcelModal();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Không thể tải xuống bảng điểm");
            }
        } catch (err) {
            console.error("Lỗi tải xuống Excel:", err);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tải xuống bảng điểm");
        } finally {
            setIsDownloadingExcel(false);
        }
    };

    useEffect(() => {
        fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId);
    }, [currentPage]);

    useEffect(() => {
        fetchMonHoc();
        fetchNamHoc();
        fetchNienKhoa();
        fetchNganh();
    }, []);

    // Tự động set bộ lọc năm học và học kỳ dựa trên thời gian hiện tại
    useEffect(() => {
        if (namHocOptions.length === 0) return;

        const now = new Date();
        let foundNamHoc: NamHocOption | null = null;
        let foundHocKy: { id: number; hocKy: number; ngayBatDau: string; ngayKetThuc: string } | null = null;

        // Tìm năm học và học kỳ mà thời gian hiện tại nằm trong khoảng
        for (const namHoc of namHocOptions) {
            for (const hocKy of namHoc.hocKys) {
                const startDate = new Date(hocKy.ngayBatDau);
                const endDate = new Date(hocKy.ngayKetThuc);
                if (now >= startDate && now <= endDate) {
                    foundNamHoc = namHoc;
                    foundHocKy = hocKy;
                    break;
                }
            }
            if (foundNamHoc) break;
        }

        // Nếu không tìm thấy, tìm khoảng thời gian gần nhất
        if (!foundNamHoc) {
            let minDiff = Infinity;
            for (const namHoc of namHocOptions) {
                for (const hocKy of namHoc.hocKys) {
                    const startDate = new Date(hocKy.ngayBatDau);
                    const endDate = new Date(hocKy.ngayKetThuc);
                    // Tính khoảng cách từ hiện tại đến học kỳ
                    const diffStart = Math.abs(now.getTime() - startDate.getTime());
                    const diffEnd = Math.abs(now.getTime() - endDate.getTime());
                    const diff = Math.min(diffStart, diffEnd);
                    if (diff < minDiff) {
                        minDiff = diff;
                        foundNamHoc = namHoc;
                        foundHocKy = hocKy;
                    }
                }
            }
        }

        // Set filter và áp dụng bộ lọc luôn nếu tìm thấy
        if (foundNamHoc && foundHocKy) {
            setFilterNamHocId(foundNamHoc.id.toString());
            setFilterHocKyId(foundHocKy.id.toString());
            // Áp dụng bộ lọc ngay lập tức
            fetchLopHocPhans(1, "", "", "", foundHocKy.id.toString(), "", "", "");
        }
    }, [namHocOptions]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLopHocPhans(1, searchKeyword.trim(), filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchLopHocPhans(1, searchKeyword.trim(), filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterKhoaDiem);
    };

    const handleResetFilter = () => {
        setFilterMonHocId("");
        setFilterGiangVienId("");
        setFilterHocKyId("");
        setFilterNienKhoaId("");
        setFilterNganhId("");
        setFilterNamHocId("");
        setSearchKeyword("");
        setFilterKhoaDiem("");
        setCurrentPage(1);
        fetchLopHocPhans(1, "", "", "", "", "", "");
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
        const newErrors = {
            maLopHocPhan: !maLopHocPhan.trim(),
            monHocId: !monHocId,
            giangVienId: !giangVienId,
            hocKyId: !hocKyId,
            nienKhoaId: !nienKhoaId,
            nganhId: !nganhId,
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const openViewModal = (lopHocPhan: LopHocPhan) => {
        setViewingLopHocPhan(lopHocPhan);
        setIsViewModalOpen(true);
    };

    // Lọc học kỳ theo năm học đã chọn cho filter
    const selectedFilterNamHoc = namHocOptions.find(nh => nh.id.toString() === filterNamHocId);
    const filterHocKyOptions = selectedFilterNamHoc?.hocKys || [];

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Lớp Học Phần" />

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
                </div>

                {/* Khối lọc - có thể thu gọn/mở rộng */}
                {(() => {
                    const activeFilterCount = [
                        filterMonHocId,
                        filterGiangVienId,
                        filterNamHocId,
                        filterHocKyId,
                        filterNienKhoaId,
                        filterNganhId,
                        filterKhoaDiem,
                    ].filter(Boolean).length;
                    return (
                        <div className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden transition-shadow hover:shadow-sm">
                            {/* Header luôn hiển thị - click để thu gọn/mở rộng */}
                            <button
                                type="button"
                                onClick={() => setFilterExpanded((prev) => !prev)}
                                className="w-full flex items-center justify-between gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 rounded-t-lg"
                                aria-expanded={filterExpanded}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-medium text-gray-800 dark:text-white/90">
                                        Bộ lọc
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                                            {activeFilterCount} đang áp dụng
                                        </span>
                                    )}
                                </div>
                                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 shrink-0">
                                    {filterExpanded ? (
                                        <>
                                            <span className="text-sm hidden sm:inline">Thu gọn</span>
                                            <FaAngleUp className="w-4 h-4 transition-transform" />
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm hidden sm:inline">Mở rộng</span>
                                            <FaAngleDown className="w-4 h-4 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* Nội dung bộ lọc - hiển thị khi mở rộng */}
                            <div
                                className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                                    filterExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                            >
                                <div className="min-h-0 overflow-hidden">
                                    <div className="px-4 pb-4 pt-0 border-t border-gray-200/80 dark:border-gray-700/80">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
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
                                                        setFilterHocKyId("");
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

                                            {/* Khóa điểm */}
                                            <div>
                                                <Label className="block mb-2 text-sm">Khóa điểm</Label>
                                                <SearchableSelect
                                                    options={KHOA_DIEM_OPTIONS.map((opt) => ({
                                                        value: opt.value,
                                                        label: opt.label,
                                                    }))}
                                                    placeholder="Tất cả"
                                                    onChange={(value) => setFilterKhoaDiem(value)}
                                                    defaultValue={filterKhoaDiem}
                                                    showSecondary={false}
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
                                </div>
                            </div>
                        </div>
                    );
                })()}

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
                                            Sĩ số
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
                                            Khóa điểm
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
                                                    {lhp.siSo}
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
                                                    <Badge variant="solid" color={getKhoaDiemColor(lhp.khoaDiem)}>
                                                        {getKhoaDiemLabel(lhp.khoaDiem)}
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
                                                            className="w-48"
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
                                                                    tag="a"
                                                                    href={`http://localhost:3001/quan-ly-lop-hoc-phan-theo-giang-vien/quan-ly-diem/${lhp.id}`}
                                                                    onItemClick={closeDropdown}
                                                                >
                                                                    <FontAwesomeIcon icon={lhp.khoaDiem ? faEye : faFileExcel} className="mr-2 w-4" />
                                                                    {lhp.khoaDiem ? "Xem điểm" : "Nhập điểm"}
                                                                </DropdownItem>

                                                                {/* THÊM MỚI - Tải xuống Excel */}
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDownloadExcelModal(lhp)}
                                                                >
                                                                    <FontAwesomeIcon icon={faDownload} className="mr-2 w-4" />
                                                                    Tải xuống Excel
                                                                </DropdownItem>

                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    disabled={lhp.khoaDiem}
                                                                    onClick={() => {
                                                                        if (!lhp.khoaDiem) {
                                                                            openKhoaDiemModal(lhp);
                                                                        }
                                                                    }}
                                                                    className={
                                                                        lhp.khoaDiem
                                                                            ? "opacity-50 cursor-not-allowed"
                                                                            : "dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                                    }
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={faLock}
                                                                        className={`mr-2 w-4 ${!lhp.khoaDiem ? "text-red-600 dark:text-red-400" : ""}`}
                                                                    />
                                                                    {lhp.khoaDiem ? "Đã khóa điểm" : "Khóa điểm"}
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
            <ViewLopHocPhanModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingLopHocPhan(null);
                }}
                lopHocPhan={viewingLopHocPhan}
            />

            {/* Modal Xác nhận Khóa điểm */}
            <Modal
                isOpen={isKhoaDiemModalOpen}
                onClose={() => {
                    if (!isKhoaDiemLoading) {
                        setIsKhoaDiemModalOpen(false);
                        setKhoaDiemLopHocPhan(null);
                    }
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faLock} className="text-warning-500" />
                        Xác nhận Khóa điểm
                    </h3>

                    {/* Thông tin lớp học phần */}
                    {khoaDiemLopHocPhan && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark: border-gray-700">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Mã LHP:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {khoaDiemLopHocPhan.maLopHocPhan}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Môn học:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {khoaDiemLopHocPhan.monHoc.tenMonHoc}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Sĩ số:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {khoaDiemLopHocPhan.siSo} sinh viên
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Học kỳ:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        HK{khoaDiemLopHocPhan.hocKy.hocKy} - {khoaDiemLopHocPhan.hocKy.namHoc.tenNamHoc}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cảnh báo */}
                    <div className="mb-6 p-3 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
                        <p className="text-sm text-warning-800 dark:text-warning-300">
                            ⚠️ <strong>Lưu ý:</strong> Sau khi khóa điểm, bạn sẽ không thể chỉnh sửa điểm của lớp học phần này nữa. Hành động này không thể hoàn tác.
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Bạn có chắc chắn muốn <strong>khóa điểm</strong> lớp học phần{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {khoaDiemLopHocPhan?.maLopHocPhan}
                        </span> ?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsKhoaDiemModalOpen(false);
                                setKhoaDiemLopHocPhan(null);
                            }}
                            disabled={isKhoaDiemLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleKhoaDiem}
                            disabled={isKhoaDiemLoading}
                            startIcon={!isKhoaDiemLoading ? <FontAwesomeIcon icon={faLock} /> : undefined}
                        >
                            {isKhoaDiemLoading ? "Đang xử lý..." : "Xác nhận Khóa điểm"}
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* Modal Tải xuống Excel bảng điểm */}
            <Modal
                isOpen={isDownloadExcelModalOpen}
                onClose={() => {
                    if (!isDownloadingExcel) {
                        closeDownloadExcelModal();
                    }
                }}
                className="max-w-2xl"
            >
                <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <FontAwesomeIcon
                                icon={faFileExcel}
                                className="text-2xl text-green-600 dark:text-green-400"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Tải xuống bảng điểm
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Xuất file Excel danh sách điểm sinh viên
                            </p>
                        </div>
                    </div>

                    {/* Thông tin lớp học phần */}
                    {downloadingExcelLopHocPhan && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                Thông tin lớp học phần
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Mã LHP:</span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {downloadingExcelLopHocPhan.maLopHocPhan}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Môn học:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {downloadingExcelLopHocPhan.monHoc.tenMonHoc}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Mã môn:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {downloadingExcelLopHocPhan.monHoc.maMonHoc}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Sĩ số:</span>
                                    <Badge variant="solid" color="info">
                                        {downloadingExcelLopHocPhan.siSo} sinh viên
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Học kỳ: </span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        HK{downloadingExcelLopHocPhan.hocKy.hocKy} - {downloadingExcelLopHocPhan.hocKy.namHoc.tenNamHoc}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Trạng thái:</span>
                                    <Badge variant="solid" color={getTrangThaiColor(downloadingExcelLopHocPhan.trangThai)}>
                                        {getTrangThaiLabel(downloadingExcelLopHocPhan.trangThai)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thông tin file sẽ xuất */}
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faFileExcel}
                                        className="text-lg text-green-600 dark: text-green-400 mt-0.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                                        Thông tin file xuất
                                    </h4>
                                    <ul className="text-sm text-green-700/80 dark:text-green-300/70 space-y-1.5">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            <span>Tên file: <strong className="break-all">Bang diem lop hoc phan {downloadingExcelLopHocPhan?.maLopHocPhan}.xlsx</strong></span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            <span>Nội dung: Danh sách điểm tất cả sinh viên trong lớp</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin hướng dẫn */}
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
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                        Hướng dẫn sử dụng
                                    </h4>
                                    <p className="text-sm text-blue-700/80 dark:text-blue-300/70">
                                        File Excel sẽ chứa danh sách sinh viên cùng với điểm quá trình, điểm thành phần,
                                        điểm thi và điểm tổng kết. Có thể sử dụng để in ấn hoặc báo cáo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                                        Lưu ý quan trọng
                                    </h4>
                                    <ul className="text-sm text-amber-700/80 dark:text-amber-300/70 space-y-1 list-disc list-inside">
                                        <li>Bạn chỉ có thể xuất bảng điểm của lớp học phần mình phụ trách</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading state */}
                    {isDownloadingExcel && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-3">
                            <FontAwesomeIcon
                                icon={faSpinner}
                                className="text-xl text-green-500 animate-spin"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                                Đang tạo file Excel...
                            </span>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={closeDownloadExcelModal}
                            disabled={isDownloadingExcel}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDownloadExcel}
                            disabled={isDownloadingExcel}
                            startIcon={
                                isDownloadingExcel
                                    ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    : <FontAwesomeIcon icon={faDownload} />
                            }
                        >
                            {isDownloadingExcel ? "Đang tải..." : "Tải xuống Excel"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}