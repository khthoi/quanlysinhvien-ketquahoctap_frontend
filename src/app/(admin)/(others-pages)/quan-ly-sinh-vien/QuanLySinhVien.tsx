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
import { faMagnifyingGlass, faEye, faPenToSquare, faTrash, faEdit, faGlassCheers, faMedal, faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import TextArea from "@/components/form/input/TextArea";

type TinhTrang = "DANG_HOC" | "THOI_HOC" | "DA_TOT_NGHIEP" | "BAO_LUU";
type GioiTinh = "NAM" | "NU";
type LoaiQuyetDinh = "KHEN_THUONG" | "KY_LUAT";

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

    const gioiTinhOptions = [
        { value: "NAM", label: "Nam" },
        { value: "NU", label: "Nữ" },
    ];

    const tinhTrangOptions = [
        { value: "DANG_HOC", label: "Đang học" },
        { value: "THOI_HOC", label: "Thôi học" },
        { value: "DA_TOT_NGHIEP", label: "Đã tốt nghiệp" },
        { value: "BAO_LUU", label: "Bảo lưu" },
    ];

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
                            onChange={(value) => onTinhTrangChange((value as TinhTrang) || "")}
                            defaultValue={tinhTrang || ""}
                            showSecondary={false}
                        />
                        {errors.tinhTrang && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn tình trạng</p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Lớp</Label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Nhập mã hoặc tên lớp để tìm..."
                                    value={lopSearchKeyword}
                                    onChange={(e) => setLopSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            onSearchLop(lopSearchKeyword.trim());
                                        }
                                    }}
                                    className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-4 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => onSearchLop(lopSearchKeyword.trim())}
                                className="h-11 whitespace-nowrap"
                            >
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 mr-2" />
                                Tìm kiếm
                            </Button>
                        </div>
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
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mã sinh viên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.maSinhVien}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Họ và tên</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.hoTen}</p>
                        </div>
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
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.diaChi}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-800 dark: text-white">{sinhVien.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</p>
                            <p className="font-medium text-gray-800 dark:text-white">{sinhVien.sdt}</p>
                        </div>
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
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Lớp</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {sinhVien.lop.maLop} - {sinhVien.lop.tenLop}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngành</p>
                            <p className="font-medium text-gray-800 dark: text-white">
                                {sinhVien.lop.nganh.maNganh} - {sinhVien.lop.nganh.tenNganh}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm text-gray-500 dark: text-gray-400">Niên khóa</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {sinhVien.lop.nienKhoa.maNienKhoa} - {sinhVien.lop.nienKhoa.tenNienKhoa}
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
                <span className="font-medium text-gray-700 dark: text-gray-300">
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

// ==================== TRANG CHÍNH QUẢN LÝ SINH VIÊN ====================
export default function QuanLySinhVienPage() {
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

    // State cho modal khen thưởng/kỷ luật
    const [isThanhTichModalOpen, setIsThanhTichModalOpen] = useState(false);
    const [selectedSinhVienForThanhTich, setSelectedSinhVienForThanhTich] = useState<SinhVien | null>(null);
    const [thanhTichData, setThanhTichData] = useState<ThanhTichResponse | null>(null);
    const [filterLoaiQuyetDinh, setFilterLoaiQuyetDinh] = useState<LoaiQuyetDinh | "">("");

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
            let url = `http://localhost:3000/danh-muc/lop`;
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

    // Fetch lớp cho modal
    const fetchLopForModal = async (search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/lop`;
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
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
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

            setIsEditModalOpen(false);
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
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
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
            closeThanhTichModal
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
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
                                placeholder="Tìm kiếm sinh viên theo tên hoặc mã sinh viên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={openCreateModal}>
                            Tạo mới Sinh viên
                        </Button>
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
                                    <TableRow className="grid grid-cols-[10%_14%_14%_12%_12%_12%_26%]">
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
                                            <TableRow key={sv.id} className="grid grid-cols-[10%_14%_14%_12%_12%_12%_26%] items-center">
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
                                                <TableCell className="px-5 py-4 text-gray-800 dark: text-white/90">
                                                    {sv.lop.maLop}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.lop.nganh.maNganh}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {sv.lop.nienKhoa.maNienKhoa}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex gap-3 justify-center">
                                                        <Button variant="outline" size="sm" onClick={() => openViewModal(sv)}>
                                                            <FontAwesomeIcon icon={faEye} />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => openEditModal(sv)}>
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => openDeleteModal(sv)}>
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => openAddQuyetDinhModal(sv)}>
                                                            <FontAwesomeIcon icon={faMedal} />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => openThanhTichModal(sv)}>
                                                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                                                        </Button>
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
                <div className="p-6 sm: p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Thêm Quyết định Khen thưởng/Kỷ luật
                    </h3>

                    {/* Thông tin sinh viên */}
                    {selectedSinhVienForAdd && (
                        <div className="mb-6 p-4 bg-gray-50 dark: bg-gray-800/50 rounded-lg border border-gray-200 dark: border-gray-700">
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
        </div>
    );
}