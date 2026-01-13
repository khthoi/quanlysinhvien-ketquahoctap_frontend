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
import { faMagnifyingGlass, faEye, faTrash, faEdit, faFileExcel, faLock } from "@fortawesome/free-solid-svg-icons";
import TextArea from "@/components/form/input/TextArea";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";

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
                            <p className="font-medium text-gray-800 dark: text-white">{lopHocPhan.monHoc.soTinChi}</p>
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
                            <p className="font-medium text-gray-800 dark: text-white">
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
            let url = `http://localhost:3000/giang-day/lop-hoc-phan/giang-vien/me?page=${page}&limit=10`;
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

            if (res.ok) {
                showAlert("success", "Thành công", `Đã khóa điểm lớp học phần "${khoaDiemLopHocPhan.maLopHocPhan}" thành công`);
                // Refresh lại danh sách
                fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId, filterTrangThai);
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

    useEffect(() => {
        fetchLopHocPhans(currentPage, searchKeyword, filterMonHocId, filterGiangVienId, filterHocKyId, filterNienKhoaId, filterNganhId);
    }, [currentPage]);

    useEffect(() => {
        fetchMonHoc();
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
            hocKyId: !hocKyId,
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
        setNamHocId("");
        setHocKyId("");
        setNienKhoaId("");
        setKhoaId("");
        setNganhId("");
        setGhiChu("");
        setKhoaDiem(false);
        setErrors({
            maLopHocPhan: false,
            monHocId: false,
            giangVienId: false,
            hocKyId: false,
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
                    hocKyId: Number(hocKyId),
                    nienKhoaId: Number(nienKhoaId),
                    nganhId: Number(nganhId),
                    ghiChu: ghiChu.trim() || null,
                    khoaDiem,
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
                                                    {lhp.siSo}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {lhp.nganh.maNganh}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark: text-white/90">
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
                                                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2 w-4" />
                                                                    Nhập điểm
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
                                    <span className="text-gray-500 dark: text-gray-400">Học kỳ:</span>
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
                        </span>?
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
        </div>
    );
}