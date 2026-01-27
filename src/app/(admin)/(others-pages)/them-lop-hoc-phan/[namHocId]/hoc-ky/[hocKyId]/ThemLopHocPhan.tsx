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
import Switch from "@/components/form/switch/Switch";

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
        soSinhVienThamGia: 0,
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
    // State cho cảnh báo số lượng sinh viên trong modal edit
    const [sinhVienWarning, setSinhVienWarning] = useState<{
        type: "warning" | "error";
        message: string;
    } | null>(null);

    // State cho modal tạo lớp học phần mới
    const [isCreateLopModalOpen, setIsCreateLopModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        maLopHocPhan: "",
        maNganh: "",
        maNienKhoa: "",
        maMonHoc: "",
        maGiangVien: "",
        soSinhVienThamGia: 40,
        ghiChu: "",
        phanBoLaiSinhVien: false,
    });
    const [createGiangVienWarning, setCreateGiangVienWarning] = useState<string | null>(null);
    const [createSinhVienWarning, setCreateSinhVienWarning] = useState<{
        type: "warning" | "error";
        message: string;
    } | null>(null);
    const [phanBoPreview, setPhanBoPreview] = useState<{
        danhSachLop: { maLopHocPhan: string; soSinhVien: number }[];
        lopMoi: { maLopHocPhan: string; soSinhVien: number };
        isValid: boolean;
        message?: string;
    } | null>(null);

    // Map lưu số lượng sinh viên gốc theo ngành + niên khóa + môn học (từ API)
    const [originalSinhVienMap, setOriginalSinhVienMap] = useState<Map<string, number>>(new Map());

    // Tạo key cho map sinh viên
    const getSinhVienMapKey = (maNganh: string, maNienKhoa: string, maMonHoc: string) => {
        return `${maNganh}_${maNienKhoa}_${maMonHoc}`;
    };

    // Lấy danh sách unique ngành từ data cho modal tạo
    const uniqueNganhsForCreate = useMemo(() => {
        const nganhs = [...new Set(lopHocPhans.map(lhp => lhp.maNganh))];
        return nganhs.map(nganh => ({ value: nganh, label: nganh }));
    }, [lopHocPhans]);

    // Lấy danh sách unique niên khóa từ data cho modal tạo
    const uniqueNienKhoasForCreate = useMemo(() => {
        const nienKhoas = [...new Set(lopHocPhans.map(lhp => lhp.maNienKhoa))];
        return nienKhoas.map(nk => ({ value: nk, label: nk }));
    }, [lopHocPhans]);

    // Lấy danh sách unique môn học từ data cho modal tạo
    const uniqueMonHocsForCreate = useMemo(() => {
        const monHocs = [...new Set(lopHocPhans.map(lhp => lhp.maMonHoc))];
        return monHocs.map(mh => {
            const lhp = lopHocPhans.find(l => l.maMonHoc === mh);
            return {
                value: mh,
                label: mh,
                soTinChi: lhp?.soTinChi || 0,
            };
        });
    }, [lopHocPhans]);

    // Hàm tạo mã lớp học phần tự động
    const generateMaLopHocPhan = (maNganh: string, maNienKhoa: string, maMonHoc: string): string => {
        if (!maNganh || !maNienKhoa || !maMonHoc) return "";

        // Lọc các lớp học phần cùng ngành, niên khóa, môn học
        const existingLops = lopHocPhans.filter(
            lhp => lhp.maNganh === maNganh && lhp.maNienKhoa === maNienKhoa && lhp.maMonHoc === maMonHoc
        );

        // Tìm số thứ tự lớp phù hợp
        let soThuTu = 1;
        while (true) {
            const maLopMoi = `${maMonHoc}_${maNienKhoa}_${maNganh}_${soThuTu}`;
            const isExist = existingLops.some(lhp => lhp.maLopHocPhan === maLopMoi);
            if (!isExist) {
                return maLopMoi;
            }
            soThuTu++;
        }
    };

    // Hàm lấy số tín chỉ của môn học
    const getSoTinChiMonHoc = (maMonHoc: string): number => {
        const lhp = lopHocPhans.find(l => l.maMonHoc === maMonHoc);
        return lhp?.soTinChi || 0;
    };

    // Hàm tính phân bổ sinh viên
    const calculatePhanBoSinhVien = (
        maNganh: string,
        maNienKhoa: string,
        maMonHoc: string,
        maLopMoi: string
    ): {
        danhSachLop: { maLopHocPhan: string; soSinhVien: number }[];
        lopMoi: { maLopHocPhan: string; soSinhVien: number };
        isValid: boolean;
        message?: string;
    } => {
        const MIN_SINH_VIEN = 20;

        // Lấy tổng sinh viên gốc của nhóm
        const key = getSinhVienMapKey(maNganh, maNienKhoa, maMonHoc);
        const tongSinhVienGoc = originalSinhVienMap.get(key) || 0;

        // Lấy danh sách lớp hiện tại của nhóm
        const existingLops = lopHocPhans.filter(
            lhp => lhp.maNganh === maNganh && lhp.maNienKhoa === maNienKhoa && lhp.maMonHoc === maMonHoc
        );

        // Tổng số lớp bao gồm cả lớp mới
        const tongSoLop = existingLops.length + 1;

        // Chia đều số sinh viên
        const soSinhVienMoiLop = Math.floor(tongSinhVienGoc / tongSoLop);
        const soDu = tongSinhVienGoc % tongSoLop;

        // Kiểm tra nếu số sinh viên mỗi lớp không đủ tối thiểu
        if (soSinhVienMoiLop < MIN_SINH_VIEN) {
            return {
                danhSachLop: [],
                lopMoi: { maLopHocPhan: maLopMoi, soSinhVien: 0 },
                isValid: false,
                message: `Không thể phân bổ! Số sinh viên mỗi lớp (${soSinhVienMoiLop} SV) thấp hơn mức tối thiểu ${MIN_SINH_VIEN} SV/lớp.`,
            };
        }

        // Phân bổ sinh viên cho các lớp hiện tại
        const danhSachLop: { maLopHocPhan: string; soSinhVien: number }[] = [];

        // Sắp xếp các lớp theo số thứ tự
        const sortedLops = [...existingLops].sort((a, b) => {
            const numA = parseInt(a.maLopHocPhan.split('_').pop() || '0');
            const numB = parseInt(b.maLopHocPhan.split('_').pop() || '0');
            return numA - numB;
        });

        let duDaChia = 0;
        sortedLops.forEach((lhp, index) => {
            const soSinhVien = soSinhVienMoiLop + (duDaChia < soDu ? 1 : 0);
            danhSachLop.push({
                maLopHocPhan: lhp.maLopHocPhan,
                soSinhVien,
            });
            duDaChia++;
        });

        // Sinh viên cho lớp mới
        const soSinhVienLopMoi = soSinhVienMoiLop + (duDaChia < soDu ? 1 : 0);

        return {
            danhSachLop,
            lopMoi: { maLopHocPhan: maLopMoi, soSinhVien: soSinhVienLopMoi },
            isValid: true,
        };
    };

    // Lấy danh sách giảng viên phù hợp cho môn học (dùng cho modal tạo)
    const getGiangVienOptionsForCreate = (maMonHoc: string) => {
        if (!maMonHoc) return [];
        const gvsForMonHoc = giangViens.filter(gv =>
            gv.monHocGiangViens.some(mhgv => mhgv.monHoc.maMonHoc === maMonHoc)
        );
        return gvsForMonHoc.map(gv => ({
            value: gv.maGiangVien,
            label: gv.maGiangVien,
            secondary: gv.hoTen,
        }));
    };

    // Map tính tổng sinh viên hiện tại theo ngành + niên khóa + môn học
    const currentSinhVienMap = useMemo(() => {
        const map = new Map<string, { tongSinhVien: number; danhSachLop: { maLopHocPhan: string; soSinhVien: number }[] }>();

        lopHocPhans.forEach((lhp) => {
            const key = getSinhVienMapKey(lhp.maNganh, lhp.maNienKhoa, lhp.maMonHoc);
            if (map.has(key)) {
                const current = map.get(key)!;
                map.set(key, {
                    tongSinhVien: current.tongSinhVien + lhp.soSinhVienThamGia,
                    danhSachLop: [...current.danhSachLop, { maLopHocPhan: lhp.maLopHocPhan, soSinhVien: lhp.soSinhVienThamGia }],
                });
            } else {
                map.set(key, {
                    tongSinhVien: lhp.soSinhVienThamGia,
                    danhSachLop: [{ maLopHocPhan: lhp.maLopHocPhan, soSinhVien: lhp.soSinhVienThamGia }],
                });
            }
        });

        return map;
    }, [lopHocPhans]);

    // Hàm kiểm tra số lượng sinh viên khi thay đổi
    const checkSinhVienLimit = (
        maNganh: string,
        maNienKhoa: string,
        maMonHoc: string,
        maLopHocPhanHienTai: string,
        soSinhVienMoi: number,
        soSinhVienCu: number
    ): { type: "ok" | "warning" | "error"; tongHienTai: number; tongGoc: number; chenh: number } => {
        const key = getSinhVienMapKey(maNganh, maNienKhoa, maMonHoc);
        const tongGoc = originalSinhVienMap.get(key) || 0;

        // Tính tổng hiện tại (không bao gồm lớp đang edit)
        const currentData = currentSinhVienMap.get(key);
        let tongKhongBaoGomLopHienTai = 0;

        if (currentData) {
            currentData.danhSachLop.forEach((lop) => {
                if (lop.maLopHocPhan !== maLopHocPhanHienTai) {
                    tongKhongBaoGomLopHienTai += lop.soSinhVien;
                }
            });
        }

        const tongMoi = tongKhongBaoGomLopHienTai + soSinhVienMoi;
        const chenh = tongGoc - tongMoi;

        if (tongMoi > tongGoc) {
            return { type: "error", tongHienTai: tongMoi, tongGoc, chenh };
        } else if (tongMoi < tongGoc) {
            return { type: "warning", tongHienTai: tongMoi, tongGoc, chenh };
        }

        return { type: "ok", tongHienTai: tongMoi, tongGoc, chenh };
    };

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

    // Mở modal tạo lớp học phần mới
    const openCreateLopModal = () => {
        setCreateFormData({
            maLopHocPhan: "",
            maNganh: "",
            maNienKhoa: "",
            maMonHoc: "",
            maGiangVien: "",
            soSinhVienThamGia: 40,
            ghiChu: "",
            phanBoLaiSinhVien: false,
        });
        setCreateGiangVienWarning(null);
        setCreateSinhVienWarning(null);
        setPhanBoPreview(null);
        setIsCreateLopModalOpen(true);
    };

    // Đóng modal tạo lớp học phần mới
    const closeCreateLopModal = () => {
        setIsCreateLopModalOpen(false);
        setCreateFormData({
            maLopHocPhan: "",
            maNganh: "",
            maNienKhoa: "",
            maMonHoc: "",
            maGiangVien: "",
            soSinhVienThamGia: 40,
            ghiChu: "",
            phanBoLaiSinhVien: false,
        });
        setCreateGiangVienWarning(null);
        setCreateSinhVienWarning(null);
        setPhanBoPreview(null);
    };

    // Xử lý thay đổi form tạo lớp học phần
    const handleCreateFormChange = (field: string, value: string | number | boolean) => {
        setCreateFormData((prev) => {
            const newData = { ...prev, [field]: value };

            // Tự động tạo mã lớp học phần khi có đủ thông tin
            if (field === "maNganh" || field === "maNienKhoa" || field === "maMonHoc") {
                const maNganh = field === "maNganh" ? (value as string) : prev.maNganh;
                const maNienKhoa = field === "maNienKhoa" ? (value as string) : prev.maNienKhoa;
                const maMonHoc = field === "maMonHoc" ? (value as string) : prev.maMonHoc;

                if (maNganh && maNienKhoa && maMonHoc) {
                    newData.maLopHocPhan = generateMaLopHocPhan(maNganh, maNienKhoa, maMonHoc);

                    // Tính phân bổ nếu đang bật chế độ phân bổ
                    if (newData.phanBoLaiSinhVien) {
                        const preview = calculatePhanBoSinhVien(maNganh, maNienKhoa, maMonHoc, newData.maLopHocPhan);
                        setPhanBoPreview(preview);
                        if (preview.isValid) {
                            newData.soSinhVienThamGia = preview.lopMoi.soSinhVien;
                        }
                    }
                }

                // Reset giảng viên khi đổi môn học
                if (field === "maMonHoc") {
                    newData.maGiangVien = "";
                    setCreateGiangVienWarning(null);
                }
            }

            return newData;
        });

        // Kiểm tra tín chỉ giảng viên
        if (field === "maGiangVien" && value) {
            const maMonHoc = createFormData.maMonHoc;
            const soTinChi = getSoTinChiMonHoc(maMonHoc);

            const currentTinChi = giangVienTinChiMap.get(value as string)?.tongTinChi || 0;
            const newTinChi = currentTinChi + soTinChi;

            if (newTinChi > 12) {
                const gv = giangViens.find(g => g.maGiangVien === value);
                const tenGV = gv ? gv.hoTen : value;
                setCreateGiangVienWarning(
                    `Giảng viên "${tenGV}" hiện đang có ${currentTinChi} tín chỉ. ` +
                    `Nếu thêm lớp này (${soTinChi} TC), tổng sẽ là ${newTinChi} TC, vượt quá giới hạn 12 tín chỉ!`
                );
            } else {
                setCreateGiangVienWarning(null);
            }
        }

        // Kiểm tra số lượng sinh viên
        if (field === "soSinhVienThamGia") {
            const soSinhVien = value as number;
            const MIN_SINH_VIEN = 20;
            const MAX_SINH_VIEN = 40;

            if (soSinhVien < MIN_SINH_VIEN) {
                setCreateSinhVienWarning({
                    type: "error",
                    message: `Số lượng sinh viên tối thiểu của một lớp học phần phải là ${MIN_SINH_VIEN} SV. Hiện tại: ${soSinhVien} SV.`,
                });
            } else if (soSinhVien > MAX_SINH_VIEN) {
                setCreateSinhVienWarning({
                    type: "error",
                    message: `Vượt quá số lượng sinh viên tối đa của một lớp học phần (${MAX_SINH_VIEN} SV). Hiện tại: ${soSinhVien} SV.`,
                });
            } else {
                setCreateSinhVienWarning(null);
            }
        }

        // Xử lý khi bật/tắt phân bổ lại sinh viên
        if (field === "phanBoLaiSinhVien") {
            const isPhanBo = value as boolean;
            if (isPhanBo && createFormData.maNganh && createFormData.maNienKhoa && createFormData.maMonHoc) {
                const preview = calculatePhanBoSinhVien(
                    createFormData.maNganh,
                    createFormData.maNienKhoa,
                    createFormData.maMonHoc,
                    createFormData.maLopHocPhan
                );
                setPhanBoPreview(preview);

                if (preview.isValid) {
                    setCreateFormData(prev => ({
                        ...prev,
                        soSinhVienThamGia: preview.lopMoi.soSinhVien,
                        phanBoLaiSinhVien: true,
                    }));
                    setCreateSinhVienWarning(null);
                } else {
                    setCreateSinhVienWarning({
                        type: "error",
                        message: preview.message || "Không thể phân bổ sinh viên",
                    });
                }
            } else {
                setPhanBoPreview(null);
            }
        }
    };

    // Xử lý tạo lớp học phần mới
    const handleCreateLop = () => {
        const { maLopHocPhan, maNganh, maNienKhoa, maMonHoc, maGiangVien, soSinhVienThamGia, ghiChu, phanBoLaiSinhVien } = createFormData;

        // Validate
        if (!maLopHocPhan || !maNganh || !maNienKhoa || !maMonHoc || !maGiangVien) {
            showAlert("error", "Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        const soTinChi = getSoTinChiMonHoc(maMonHoc);

        // Tạo lớp học phần mới
        const newLop: LopHocPhanDeXuat = {
            stt: lopHocPhans.length + 1,
            maLopHocPhan,
            ghiChu,
            maNganh,
            maNienKhoa,
            maMonHoc,
            maNamHoc: namHocId,
            hocKy: parseInt(hocKyId),
            soTinChi,
            maGiangVien,
            soSinhVienThamGia,
        };

        // Nếu bật phân bổ lại, cập nhật số sinh viên các lớp khác
        if (phanBoLaiSinhVien && phanBoPreview && phanBoPreview.isValid) {
            setLopHocPhans(prev => {
                const updated = prev.map(lhp => {
                    const found = phanBoPreview.danhSachLop.find(p => p.maLopHocPhan === lhp.maLopHocPhan);
                    if (found) {
                        return { ...lhp, soSinhVienThamGia: found.soSinhVien };
                    }
                    return lhp;
                });
                return [...updated, newLop];
            });
        } else {
            setLopHocPhans(prev => [...prev, newLop]);
        }

        closeCreateLopModal();
        showAlert("success", "Thành công", `Đã thêm lớp học phần ${maLopHocPhan}`);
    };

    // Kiểm tra có thể tạo lớp hay không
    const canCreateLop = (): boolean => {
        const { maLopHocPhan, maNganh, maNienKhoa, maMonHoc, maGiangVien, soSinhVienThamGia, phanBoLaiSinhVien } = createFormData;

        if (!maLopHocPhan || !maNganh || !maNienKhoa || !maMonHoc || !maGiangVien) {
            return false;
        }

        if (createGiangVienWarning) {
            return false;
        }

        if (createSinhVienWarning?.type === "error") {
            return false;
        }

        if (phanBoLaiSinhVien && phanBoPreview && !phanBoPreview.isValid) {
            return false;
        }

        return true;
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

                // Tạo map lưu số lượng sinh viên gốc theo ngành + niên khóa + môn học
                const sinhVienMap = new Map<string, number>();
                json.data.forEach((lhp: LopHocPhanDeXuat) => {
                    const key = getSinhVienMapKey(lhp.maNganh, lhp.maNienKhoa, lhp.maMonHoc);
                    if (sinhVienMap.has(key)) {
                        sinhVienMap.set(key, sinhVienMap.get(key)! + lhp.soSinhVienThamGia);
                    } else {
                        sinhVienMap.set(key, lhp.soSinhVienThamGia);
                    }
                });
                setOriginalSinhVienMap(sinhVienMap);
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

    const openEditModal = (lhp: LopHocPhanDeXuat) => {
        setEditingLopHocPhan(lhp);
        setEditFormData({
            maLopHocPhan: lhp.maLopHocPhan,
            ghiChu: lhp.ghiChu,
            maGiangVien: lhp.maGiangVien,
            soSinhVienThamGia: lhp.soSinhVienThamGia,
        });
        setGiangVienTinChiWarning(null); // Reset warning khi mở modal
        setSinhVienWarning(null); // Reset warning sinh viên khi mở modal
        setIsEditModalOpen(true);
        closeDropdown();
    };

    const handleEditFormChange = (field: string, value: string | number) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }));

        // Kiểm tra tín chỉ khi thay đổi giảng viên
        if (field === "maGiangVien" && editingLopHocPhan) {
            const result = checkGiangVienTinChi(
                value as string,
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

        // Kiểm tra số lượng sinh viên khi thay đổi
        if (field === "soSinhVienThamGia" && editingLopHocPhan) {
            const soSinhVienMoi = typeof value === "number" ? value : parseInt(value as string) || 0;

            const MIN_SINH_VIEN = 20;
            const MAX_SINH_VIEN = 40;

            // Kiểm tra số lượng sinh viên tối thiểu
            if (soSinhVienMoi < MIN_SINH_VIEN) {
                setSinhVienWarning({
                    type: "error",
                    message: `Số lượng sinh viên tối thiểu của một lớp học phần phải là ${MIN_SINH_VIEN} SV. Hiện tại: ${soSinhVienMoi} SV.`,
                });
                return;
            }

            // Kiểm tra số lượng sinh viên tối đa
            if (soSinhVienMoi > MAX_SINH_VIEN) {
                setSinhVienWarning({
                    type: "error",
                    message: `Vượt quá số lượng sinh viên tối đa của một lớp học phần (${MAX_SINH_VIEN} SV). Hiện tại: ${soSinhVienMoi} SV.`,
                });
                return;
            }

            const result = checkSinhVienLimit(
                editingLopHocPhan.maNganh,
                editingLopHocPhan.maNienKhoa,
                editingLopHocPhan.maMonHoc,
                editingLopHocPhan.maLopHocPhan,
                soSinhVienMoi,
                editingLopHocPhan.soSinhVienThamGia
            );

            if (result.type === "error") {
                setSinhVienWarning({
                    type: "error",
                    message: `Vượt quá số lượng sinh viên cho phép! Tổng sinh viên của ngành "${editingLopHocPhan.maNganh}" - niên khóa "${editingLopHocPhan.maNienKhoa}" - môn "${editingLopHocPhan.maMonHoc}" sẽ là ${result.tongHienTai} SV, vượt quá giới hạn ${result.tongGoc} SV (thừa ${Math.abs(result.chenh)} SV).`,
                });
            } else if (result.type === "warning") {
                setSinhVienWarning({
                    type: "warning",
                    message: `Lưu ý: Tổng sinh viên của ngành "${editingLopHocPhan.maNganh}" - niên khóa "${editingLopHocPhan.maNienKhoa}" - môn "${editingLopHocPhan.maMonHoc}" sẽ là ${result.tongHienTai} SV, thiếu ${result.chenh} SV so với số lượng dự kiến (${result.tongGoc} SV).`,
                });
            } else {
                setSinhVienWarning(null);
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
                        soSinhVienThamGia: editFormData.soSinhVienThamGia,
                    }
                    : lhp
            )
        );

        setIsEditModalOpen(false);
        setEditingLopHocPhan(null);
        setSinhVienWarning(null);
        setGiangVienTinChiWarning(null);
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
                            onClick={openCreateLopModal}
                            startIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Thêm lớp học phần
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => setIsConfirmCreateModalOpen(true)}
                            disabled={lopHocPhans.length === 0}
                            startIcon={<FontAwesomeIcon icon={faCheck} />}
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
                    setGiangVienTinChiWarning(null);
                    setSinhVienWarning(null);
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
                                </div>

                                {/* Hiển thị thông tin số lượng sinh viên của ngành + niên khóa + môn học */}
                                {(() => {
                                    const key = getSinhVienMapKey(editingLopHocPhan.maNganh, editingLopHocPhan.maNienKhoa, editingLopHocPhan.maMonHoc);
                                    const tongGoc = originalSinhVienMap.get(key) || 0;
                                    const currentData = currentSinhVienMap.get(key);
                                    const tongHienTai = currentData?.tongSinhVien || 0;
                                    const soLop = currentData?.danhSachLop.length || 0;

                                    return (
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                Thông tin sinh viên cho nhóm này:
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="light" color="info">
                                                    Tổng sinh viên: {tongGoc} SV
                                                </Badge>
                                                <Badge variant="light" color="primary">
                                                    Số lớp: {soLop}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })()}
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
                                {/* Số lượng sinh viên */}
                                <div>
                                    <Label>Số lượng sinh viên</Label>
                                    <Input
                                        type="number"
                                        min={20}
                                        max={40}
                                        defaultValue={editFormData.soSinhVienThamGia.toString()}
                                        onChange={(e) => handleEditFormChange("soSinhVienThamGia", parseInt(e.target.value) || 0)}
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Số lượng sinh viên ban đầu: {editingLopHocPhan.soSinhVienThamGia} | Giới hạn: 20 - 40 SV/lớp
                                    </p>
                                    {/* Cảnh báo số lượng sinh viên */}
                                    {sinhVienWarning && (
                                        <div className={`mt-2 p-3 rounded-lg border ${sinhVienWarning.type === "error"
                                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                            }`}>
                                            <div className="flex items-start gap-2">
                                                <FontAwesomeIcon
                                                    icon={sinhVienWarning.type === "error" ? faCircleExclamation : faTriangleExclamation}
                                                    className={`mt-0.5 ${sinhVienWarning.type === "error"
                                                        ? "text-red-500 dark:text-red-400"
                                                        : "text-amber-500 dark:text-amber-400"
                                                        }`}
                                                />
                                                <p className={`text-sm ${sinhVienWarning.type === "error"
                                                    ? "text-red-700 dark:text-red-300"
                                                    : "text-amber-700 dark:text-amber-300"
                                                    }`}>
                                                    {sinhVienWarning.message}
                                                </p>
                                            </div>
                                        </div>
                                    )}
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
                                        setGiangVienTinChiWarning(null);
                                        setSinhVienWarning(null);
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSaveEdit}
                                    disabled={!!giangVienTinChiWarning || sinhVienWarning?.type === "error"}
                                    className={(giangVienTinChiWarning || sinhVienWarning?.type === "error") ? "opacity-50 cursor-not-allowed" : ""}
                                >
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
            {/* Modal Tạo Lớp Học Phần Mới */}
            <Modal
                isOpen={isCreateLopModalOpen}
                onClose={closeCreateLopModal}
                className="max-w-4xl"
            >
                <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <FontAwesomeIcon icon={faPlus} className="text-xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Thêm Lớp Học Phần Mới
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Năm học: {namHocId} - Học kỳ: {hocKyId}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cột trái */}
                        <div className="space-y-5">
                            {/* Ngành */}
                            <div>
                                <Label>Ngành <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={uniqueNganhsForCreate}
                                    placeholder="Chọn ngành"
                                    onChange={(value) => handleCreateFormChange("maNganh", value)}
                                    defaultValue={createFormData.maNganh}
                                    searchPlaceholder="Tìm mã ngành..."
                                />
                            </div>

                            {/* Niên khóa */}
                            <div>
                                <Label>Niên khóa <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={uniqueNienKhoasForCreate}
                                    placeholder="Chọn niên khóa"
                                    onChange={(value) => handleCreateFormChange("maNienKhoa", value)}
                                    defaultValue={createFormData.maNienKhoa}
                                    searchPlaceholder="Tìm mã niên khóa..."
                                />
                            </div>

                            {/* Môn học */}
                            <div>
                                <Label>Môn học <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={uniqueMonHocsForCreate}
                                    placeholder="Chọn môn học"
                                    onChange={(value) => handleCreateFormChange("maMonHoc", value)}
                                    defaultValue={createFormData.maMonHoc}
                                    searchPlaceholder="Tìm mã môn học..."
                                />
                                {createFormData.maMonHoc && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Số tín chỉ: {getSoTinChiMonHoc(createFormData.maMonHoc)} TC
                                    </p>
                                )}
                            </div>

                            {/* Mã lớp học phần (tự động) */}
                            <div>
                                <Label>Mã Lớp Học Phần</Label>
                                <Input
                                    defaultValue={createFormData.maLopHocPhan}
                                    onChange={(e) => handleCreateFormChange("maLopHocPhan", e.target.value)}
                                    placeholder="Tự động tạo khi chọn ngành, niên khóa, môn học"
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Mã lớp được tự động tạo, có thể chỉnh sửa nếu cần
                                </p>
                            </div>
                        </div>

                        {/* Cột phải */}
                        <div className="space-y-5">
                            {/* Giảng viên */}
                            <div>
                                <Label>Giảng viên <span className="text-red-500">*</span></Label>
                                <SearchableSelect
                                    options={getGiangVienOptionsForCreate(createFormData.maMonHoc)}
                                    placeholder={createFormData.maMonHoc ? "Chọn giảng viên" : "Vui lòng chọn môn học trước"}
                                    onChange={(value) => handleCreateFormChange("maGiangVien", value)}
                                    defaultValue={createFormData.maGiangVien}
                                    showSecondary={true}
                                    searchPlaceholder="Tìm mã hoặc tên GV..."
                                />
                                {!createFormData.maMonHoc && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                        Vui lòng chọn môn học để xem danh sách giảng viên phụ trách
                                    </p>
                                )}

                                {/* Hiển thị thông tin tín chỉ hiện tại của giảng viên */}
                                {createFormData.maGiangVien && giangVienTinChiMap.has(createFormData.maGiangVien) && (
                                    <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                            Giảng viên này hiện đang có{" "}
                                            <strong>{giangVienTinChiMap.get(createFormData.maGiangVien)?.tongTinChi || 0}</strong> tín chỉ
                                            trong học kỳ này
                                        </p>
                                    </div>
                                )}

                                {/* Cảnh báo vượt quá tín chỉ */}
                                {createGiangVienWarning && (
                                    <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <div className="flex items-start gap-2">
                                            <FontAwesomeIcon
                                                icon={faTriangleExclamation}
                                                className="text-red-500 dark:text-red-400 mt-0.5"
                                            />
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                {createGiangVienWarning}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Số lượng sinh viên */}
                            <div>
                                <Label>Số lượng sinh viên <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min={20}
                                    max={40}
                                    defaultValue={createFormData.soSinhVienThamGia.toString()}
                                    onChange={(e) => handleCreateFormChange("soSinhVienThamGia", parseInt(e.target.value) || 0)}
                                    disabled={createFormData.phanBoLaiSinhVien}
                                />
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Giới hạn: 20 - 40 SV/lớp
                                </p>

                                {/* Cảnh báo số lượng sinh viên */}
                                {createSinhVienWarning && (
                                    <div className={`mt-2 p-3 rounded-lg border ${createSinhVienWarning.type === "error"
                                            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                            : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                                        }`}>
                                        <div className="flex items-start gap-2">
                                            <FontAwesomeIcon
                                                icon={createSinhVienWarning.type === "error" ? faCircleExclamation : faTriangleExclamation}
                                                className={`mt-0.5 ${createSinhVienWarning.type === "error"
                                                        ? "text-red-500 dark:text-red-400"
                                                        : "text-amber-500 dark:text-amber-400"
                                                    }`}
                                            />
                                            <p className={`text-sm ${createSinhVienWarning.type === "error"
                                                    ? "text-red-700 dark:text-red-300"
                                                    : "text-amber-700 dark:text-amber-300"
                                                }`}>
                                                {createSinhVienWarning.message}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Ghi chú */}
                            <div>
                                <Label>Ghi chú</Label>
                                <TextArea
                                    placeholder="Nhập ghi chú (nếu có)"
                                    rows={3}
                                    value={createFormData.ghiChu}
                                    onChange={(value) => handleCreateFormChange("ghiChu", value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Phân bổ lại sinh viên */}
                    <div className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-white">Phân bổ lại sinh viên</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Tự động chia đều số sinh viên cho tất cả các lớp cùng ngành, niên khóa, môn học
                                </p>
                            </div>
                            <Switch
                                label=""
                                defaultChecked={createFormData.phanBoLaiSinhVien}
                                disabled={!createFormData.maNganh || !createFormData.maNienKhoa || !createFormData.maMonHoc}
                                onChange={(checked) => handleCreateFormChange("phanBoLaiSinhVien", checked)}
                            />
                        </div>

                        {/* Preview phân bổ */}
                        {createFormData.phanBoLaiSinhVien && phanBoPreview && (
                            <div className={`mt-4 p-4 rounded-lg border ${phanBoPreview.isValid
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                }`}>
                                {phanBoPreview.isValid ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FontAwesomeIcon icon={faCircleCheck} className="text-green-500" />
                                            <h5 className="font-medium text-green-800 dark:text-green-300">
                                                Kết quả phân bổ dự kiến
                                            </h5>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {phanBoPreview.danhSachLop.map((lop, index) => (
                                                <div
                                                    key={index}
                                                    className="p-2 rounded bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/30"
                                                >
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {lop.maLopHocPhan}
                                                    </p>
                                                    <p className="font-semibold text-green-700 dark:text-green-300">
                                                        {lop.soSinhVien} SV
                                                    </p>
                                                </div>
                                            ))}

                                            {/* Lớp mới */}
                                            <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700">
                                                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                                    {phanBoPreview.lopMoi.maLopHocPhan} (Mới)
                                                </p>
                                                <p className="font-semibold text-blue-700 dark:text-blue-300">
                                                    {phanBoPreview.lopMoi.soSinhVien} SV
                                                </p>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-green-600 dark:text-green-400">
                                            Tổng sinh viên: {
                                                phanBoPreview.danhSachLop.reduce((acc, l) => acc + l.soSinhVien, 0) +
                                                phanBoPreview.lopMoi.soSinhVien
                                            } SV / {phanBoPreview.danhSachLop.length + 1} lớp
                                        </p>
                                    </>
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 mt-0.5" />
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            {phanBoPreview.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {!createFormData.maNganh || !createFormData.maNienKhoa || !createFormData.maMonHoc ? (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                Vui lòng chọn ngành, niên khóa và môn học để sử dụng tính năng này
                            </p>
                        ) : null}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="outline" onClick={closeCreateLopModal}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCreateLop}
                            disabled={!canCreateLop()}
                            className={!canCreateLop() ? "opacity-50 cursor-not-allowed" : ""}
                            startIcon={<FontAwesomeIcon icon={faPlus} />}
                        >
                            Tạo lớp học phần
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}