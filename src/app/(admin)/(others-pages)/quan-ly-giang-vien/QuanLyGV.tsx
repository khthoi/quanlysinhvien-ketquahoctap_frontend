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
import DatePicker from "@/components/form/date-picker";
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
    faEye,
    faChevronDown,
    faChevronUp,
    faUnlink,
    faPlus,
    faUserPlus
} from "@fortawesome/free-solid-svg-icons";
import { ChevronDownIcon } from "@/icons";
import Select from "@/components/form/Select";
import SearchableSelect from "@/components/form/SelectCustom";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { FaAngleDown } from "react-icons/fa6";

// ==================== INTERFACES ====================
enum VaiTro {
    ADMIN = "ADMIN",
    GIANG_VIEN = "GIANG_VIEN",
    SINH_VIEN = "SINH_VIEN",
    CAN_BO_PHONG_DAO_TAO = "CAN_BO_PHONG_DAO_TAO",
}

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
    nguoiDung: NguoiDung;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface NguoiDung {
    id: number;
    username: string;
    vaiTro: VaiTro;
    ngayTao: string;
}

// ==================== HELPER FUNCTIONS ====================
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// Chuyển đổi loại môn sang tiếng Việt
const getLoaiMonLabel = (loaiMon: string): string => {
    switch (loaiMon) {
        case "CHUYEN_NGANH":
            return "Chuyên ngành";
        case "DAI_CUONG":
            return "Đại cương";
        case "TU_CHON":
            return "Tự chọn";
        default:
            return loaiMon;
    }
};

// Lấy màu cho badge loại môn
const getLoaiMonColor = (loaiMon: string): "primary" | "success" | "warning" | "info" | "error" => {
    switch (loaiMon) {
        case "CHUYEN_NGANH":
            return "primary";
        case "DAI_CUONG":
            return "success";
        case "TU_CHON":
            return "warning";
        default:
            return "info";
    }
};

// Chuyển đổi giới tính sang tiếng Việt
const getGioiTinhLabel = (gioiTinh: string): string => {
    switch (gioiTinh) {
        case "NAM":
            return "Nam";
        case "NU":
            return "Nữ";
        case "KHONG_XAC_DINH":
            return "Không xác định";
        default:
            return gioiTinh;
    }
};

// Lấy màu cho badge giới tính
const getGioiTinhColor = (gioiTinh: string): "primary" | "success" | "warning" | "info" | "error" => {
    switch (gioiTinh) {
        case "NAM":
            return "primary";
        case "NU":
            return "error";
        case "KHONG_XAC_DINH":
            return "warning";
        default:
            return "info";
    }
};

// Format ngày tháng
const formatDateVN = (dateInput: string | Date): string => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// ==================== CHEVRON ICON COMPONENT ====================
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <FontAwesomeIcon
        icon={isOpen ? faChevronUp : faChevronDown}
        className={`w-4 h-4 transition-transform duration-200`}
    />
);

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

// ==================== GIẢNG VIÊN MODAL ====================
interface GiangVienModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    formData: {
        maGiangVien: string;
        hoTen: string;
        ngaySinh: string;
        email: string;
        sdt: string;
        gioiTinh: string;
        diaChi: string;
    };
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        maGiangVien: boolean;
        hoTen: boolean;
        ngaySinh: boolean;
        email: boolean;
        sdt: boolean;
        gioiTinh: boolean;
        diaChi: boolean;
    };
}

const GiangVienModal: React.FC<GiangVienModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    formData,
    onFormChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    const gioiTinhOptions = [
        { value: "NAM", label: "Nam" },
        { value: "NU", label: "Nữ" },
        { value: "KHONG_XAC_DINH", label: "Không xác định" },
    ];

    function formatDateNoTimezone(date: Date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Giảng Viên" : "Thêm Giảng Viên"}
                </h3>
                <div className="space-y-5">
                    {/* Mã Giảng Viên */}
                    <div>
                        <Label>Mã Giảng Viên</Label>
                        <Input
                            defaultValue={formData.maGiangVien}
                            onChange={(e) => onFormChange("maGiangVien", e.target.value)}
                            error={errors.maGiangVien}
                            hint={errors.maGiangVien ? "Mã giảng viên không được để trống" : ""}
                        />
                    </div>

                    {/* Họ và Tên */}
                    <div>
                        <Label>Họ và Tên</Label>
                        <Input
                            defaultValue={formData.hoTen}
                            onChange={(e) => onFormChange("hoTen", e.target.value)}
                            error={errors.hoTen}
                            hint={errors.hoTen ? "Họ tên không được để trống" : ""}
                        />
                    </div>

                    {/* Ngày Sinh */}
                    <div>
                        <Label>Ngày Sinh</Label>
                        <DatePicker
                            id={isEdit ? "edit-ngaySinh" : "create-ngaySinh"}
                            defaultDate={formData.ngaySinh || undefined}   // tránh truyền ""
                            onChange={([date]: any) => {
                                if (date) {
                                    const formatted = formatDateNoTimezone(date);
                                    onFormChange("ngaySinh", formatted);
                                } else {
                                    onFormChange("ngaySinh", "");
                                }
                            }}
                        />

                        {errors.ngaySinh && (
                            <p className="mt-1 text-sm text-error-500">
                                Ngày sinh không được để trống
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            defaultValue={formData.email}
                            onChange={(e) => onFormChange("email", e.target.value)}
                            error={errors.email}
                            hint={errors.email ? "Email không được để trống" : ""}
                        />
                    </div>

                    {/* Số Điện Thoại */}
                    <div>
                        <Label>Số Điện Thoại</Label>
                        <Input
                            defaultValue={formData.sdt}
                            onChange={(e) => onFormChange("sdt", e.target.value)}
                            error={errors.sdt}
                            hint={errors.sdt ? "Số điện thoại không được để trống" : ""}
                        />
                    </div>

                    {/* Giới Tính */}
                    <div>
                        <Label>Giới Tính</Label>
                        <div className="relative">
                            <Select
                                options={gioiTinhOptions}
                                placeholder="Chọn giới tính"
                                onChange={(value: string) => onFormChange("gioiTinh", value)}
                                defaultValue={formData.gioiTinh}
                                className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                        {errors.gioiTinh && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn giới tính
                            </p>
                        )}
                    </div>

                    {/* Địa Chỉ */}
                    <div>
                        <Label>Địa Chỉ</Label>
                        <TextArea
                            placeholder="Nhập địa chỉ"
                            rows={3}
                            defaultValue={formData.diaChi}
                            onChange={(value) => onFormChange("diaChi", value)}
                            error={errors.diaChi}
                            hint={errors.diaChi ? "Địa chỉ không được để trống" : ""}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== CHI TIẾT GIẢNG VIÊN MODAL ====================
interface ChiTietModalProps {
    isOpen: boolean;
    onClose: () => void;
    giangVien: GiangVien | null;
}

const ChiTietModal: React.FC<ChiTietModalProps> = ({
    isOpen,
    onClose,
    giangVien,
}) => {
    if (!isOpen || !giangVien) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết Giảng Viên
                </h3>

                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Mã GV:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.maGiangVien}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Họ và tên:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.hoTen}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{formatDateVN(giangVien.ngaySinh)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark: text-gray-400">Giới tính:</span>
                            <p className="mt-1">
                                <Badge variant="solid" color={getGioiTinhColor(giangVien.gioiTinh)}>
                                    {getGioiTinhLabel(giangVien.gioiTinh)}
                                </Badge>
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
                            <p className="font-medium text-gray-800 dark: text-white/90">{giangVien.email}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại:</span>
                            <p className="font-medium text-gray-800 dark:text-white/90">{giangVien.sdt}</p>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 dark: text-gray-400">Địa chỉ:</span>
                            <p className="font-medium text-gray-800 dark: text-white/90">{giangVien.diaChi}</p>
                        </div>
                    </div>
                </div>

                {/* Danh sách môn học phân công */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-3">
                        Môn học được phân công ({giangVien.monHocGiangViens.length})
                    </h4>
                    {giangVien.monHocGiangViens.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-2 px-3 text-left text-gray-500 dark: text-gray-400">Mã môn</th>
                                        <th className="py-2 px-3 text-left text-gray-500 dark: text-gray-400">Tên môn</th>
                                        <th className="py-2 px-3 text-center text-gray-500 dark:text-gray-400">Loại môn</th>
                                        <th className="py-2 px-3 text-center text-gray-500 dark: text-gray-400 ">Số tín chỉ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {giangVien.monHocGiangViens.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90">{item.monHoc.maMonHoc}</td>
                                            <td className="py-2 px-3 text-gray-800 dark:text-white/90">{item.monHoc.tenMonHoc}</td>
                                            <td className="py-2 px-3 text-center">
                                                <Badge variant="solid" color={getLoaiMonColor(item.monHoc.loaiMon)}>
                                                    {getLoaiMonLabel(item.monHoc.loaiMon)}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-3 text-center text-gray-800 dark:text-white/90">{item.monHoc.soTinChi}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Chưa được phân công môn học nào
                        </p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ GIẢNG VIÊN ====================
export default function QuanLyGiangVienPage() {
    // State cho danh sách và pagination
    const [giangViens, setGiangViens] = useState<GiangVien[]>([]);
    const [monHocOptions, setMonHocOptions] = useState<MonHoc[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [currentPage, setCurrentPage] = useState(1);

    // State cho dropdown rows
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    // State cho modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [deletingGiangVien, setDeletingGiangVien] = useState<GiangVien | null>(null);
    const [editingGiangVien, setEditingGiangVien] = useState<GiangVien | null>(null);
    const [viewingGiangVien, setViewingGiangVien] = useState<GiangVien | null>(null);
    // State cho modal tạo tài khoản
    const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
    const [creatingAccountGiangVien, setCreatingAccountGiangVien] = useState<GiangVien | null>(null);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    // State cho form
    const [formData, setFormData] = useState({
        maGiangVien: "",
        hoTen: "",
        ngaySinh: "",
        email: "",
        sdt: "",
        gioiTinh: "",
        diaChi: "",
    });

    // State để theo dõi dropdown ĐANG MỞ (chỉ 1 cái duy nhất)
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

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


    // State cho filter & search
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedFilterMonHocId, setSelectedFilterMonHocId] = useState<number | "">("");

    const [errors, setErrors] = useState({
        maGiangVien: false,
        hoTen: false,
        ngaySinh: false,
        email: false,
        sdt: false,
        gioiTinh: false,
        diaChi: false,
    });

    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Thêm các state mới
    const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false);
    const [unassignData, setUnassignData] = useState<{
        giangVienId: number;
        monHocId: number;
        tenMonHoc: string;
        hoTen: string;
    } | null>(null);

    // ==================== API CALLS ====================
    const fetchGiangViens = async (
        page: number = 1,
        search: string = "",
        monHocId: number | "" = ""
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/giang-vien?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (monHocId) url += `&monHocId=${monHocId}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setGiangViens(json.data);
                setPagination({
                    total: json.pagination.total || 0,
                    page: json.pagination.page || 1,
                    limit: json.pagination.limit || 10,
                    totalPages: json.pagination.totalPages || 1,
                });
                setCurrentPage(json.pagination.page || 1);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách giảng viên");
        }
    };

    const fetchMonHocOptions = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (Array.isArray(json)) {
                setMonHocOptions(json);
            }
        } catch (err) {
            console.error("Không thể tải danh sách môn học:", err);
        }
    };

    // Fetch danh sách môn học options khi component mount
    useEffect(() => {
        fetchMonHocOptions();
    }, []);

    // Fetch giảng viên khi currentPage thay đổi
    useEffect(() => {
        fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
    }, [currentPage]);

    // ==================== HANDLERS ====================
    const handleSearch = () => {
        setCurrentPage(1);
        fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchGiangViens(1, searchKeyword.trim(), selectedFilterMonHocId);
    };

    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const resetForm = () => {
        setFormData({
            maGiangVien: "",
            hoTen: "",
            ngaySinh: "",
            email: "",
            sdt: "",
            gioiTinh: "",
            diaChi: "",
        });
        setErrors({
            maGiangVien: false,
            hoTen: false,
            ngaySinh: false,
            email: false,
            sdt: false,
            gioiTinh: false,
            diaChi: false,
        });
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const isRowExpanded = (id: number) => expandedRows.includes(id);

    // Create
    const handleCreate = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/giang-vien", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maGiangVien: formData.maGiangVien.trim(),
                    hoTen: formData.hoTen.trim(),
                    ngaySinh: formData.ngaySinh,
                    email: formData.email.trim(),
                    sdt: formData.sdt.trim(),
                    gioiTinh: formData.gioiTinh,
                    diaChi: formData.diaChi.trim(),
                }),
            });

            setIsCreateModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm giảng viên thành công");
                resetForm();
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm mới thất bại");
            }
        } catch (err) {
            setIsCreateModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm giảng viên");
        }
    };

    // Update
    const handleUpdate = async () => {
        if (!editingGiangVien) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/giang-vien/${editingGiangVien.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maGiangVien: formData.maGiangVien.trim(),
                        hoTen: formData.hoTen.trim(),
                        ngaySinh: formData.ngaySinh,
                        email: formData.email.trim(),
                        sdt: formData.sdt.trim(),
                        gioiTinh: formData.gioiTinh,
                        diaChi: formData.diaChi.trim(),
                    }),
                }
            );

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật giảng viên thành công");
                resetForm();
                setEditingGiangVien(null);
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        }
    };

    // Delete
    const confirmDelete = async () => {
        if (!deletingGiangVien) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/giang-vien/${deletingGiangVien.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa giảng viên thành công");
                setDeletingGiangVien(null);
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        }
    };

    const handleUnassignMonHoc = async () => {
        if (!unassignData) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/giang-vien/${unassignData.giangVienId}/phan-cong-mon-hoc/${unassignData.monHocId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsUnassignModalOpen(false);
            setUnassignData(null);

            if (res.ok) {
                showAlert("success", "Thành công", `Đã hủy phân công môn học "${unassignData.tenMonHoc}" cho giảng viên`);
                // Refresh lại danh sách
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Hủy phân công thất bại");
            }
        } catch (err) {
            setIsUnassignModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi hủy phân công");
        }
    };

    const openUnassignModal = (giangVienId: number, monHocId: number, tenMonHoc: string, hoTen: string) => {
        setUnassignData({ giangVienId, monHocId, tenMonHoc, hoTen });
        setIsUnassignModalOpen(true);
    };

    // Mở modal tạo tài khoản
    const openCreateAccountModal = (giangVien: GiangVien) => {
        setCreatingAccountGiangVien(giangVien);
        setIsCreateAccountModalOpen(true);
    };

    // Xử lý tạo tài khoản
    const handleCreateAccount = async () => {
        if (!creatingAccountGiangVien) return;

        setIsCreatingAccount(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/auth/users/giang-vien/${creatingAccountGiangVien.id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsCreateAccountModalOpen(false);
            setCreatingAccountGiangVien(null);

            if (res.ok) {
                showAlert(
                    "success",
                    "Thành công",
                    `Đã tạo tài khoản cho giảng viên "${creatingAccountGiangVien.hoTen}" với mật khẩu mặc định:  123456`
                );
                // Refresh lại danh sách để cập nhật trạng thái nguoiDung
                fetchGiangViens(currentPage, searchKeyword.trim(), selectedFilterMonHocId);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo tài khoản thất bại");
            }
        } catch (err) {
            setIsCreateAccountModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo tài khoản");
        } finally {
            setIsCreatingAccount(false);
        }
    };

    // Open modals
    const openEditModal = (giangVien: GiangVien) => {
        setEditingGiangVien(giangVien);
        setFormData({
            maGiangVien: giangVien.maGiangVien,
            hoTen: giangVien.hoTen,
            ngaySinh: giangVien.ngaySinh,
            email: giangVien.email,
            sdt: giangVien.sdt,
            gioiTinh: giangVien.gioiTinh,
            diaChi: giangVien.diaChi,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (giangVien: GiangVien) => {
        setDeletingGiangVien(giangVien);
        setIsDeleteModalOpen(true);
    };

    const openDetailModal = (giangVien: GiangVien) => {
        setViewingGiangVien(giangVien);
        setIsDetailModalOpen(true);
    };

    // Delete Confirm Modal Component
    const DeleteConfirmModal = () => (
        <div className="p-6 sm: p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa giảng viên
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa giảng viên{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingGiangVien?.hoTen}
                </span>{" "}
                (Mã:  {deletingGiangVien?.maGiangVien})?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingGiangVien(null);
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
            <PageBreadcrumb pageTitle="Quản lý Giảng Viên & Phân công Môn học" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Alert */}
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

                {/* Search và Button Thêm */}
                <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
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
                                placeholder="Tìm kiếm giảng viên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            resetForm();
                            setIsCreateModalOpen(true);
                        }}
                    >
                        Thêm Giảng Viên
                    </Button>
                </div>

                {/* Filter theo Môn học */}
                <div className="mb-6">
                    <Label className="block mb-2">Lọc theo Môn học</Label>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex-1 sm:max-w-md">
                            <SearchableSelect
                                options={monHocOptions.map((mon) => ({
                                    value: mon.id.toString(),
                                    label: mon.maMonHoc,
                                    secondary: mon.tenMonHoc,
                                }))}
                                placeholder="Tất cả môn học"
                                onChange={(value) =>
                                    setSelectedFilterMonHocId(value ? Number(value) : "")
                                }
                                defaultValue={
                                    selectedFilterMonHocId ? selectedFilterMonHocId.toString() : ""
                                }
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Nhập mã hoặc tên môn học..."
                            />
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
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[8%_15%_22%_12%_18%_25%]">
                                        <TableCell
                                            isHeader
                                            className="px-3 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            <span className="sr-only">Expand column</span>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                        >
                                            Mã GV
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                        >
                                            Họ và Tên
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Giới tính
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Số điện thoại
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>

                                {/* Table Body */}
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                    {giangViens.map((gv) => (
                                        <React.Fragment key={gv.id}>
                                            {/* Main Row */}
                                            <TableRow
                                                className={`grid grid-cols-[8%_15%_22%_12%_18%_25%] items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${isRowExpanded(gv.id)
                                                    ? "bg-gray-50 dark:bg-white/[0.02]"
                                                    : ""
                                                    }`}
                                            >
                                                <TableCell className="px-3 py-4 flex items-center justify-center">
                                                    <button
                                                        onClick={() => toggleRow(gv.id)}
                                                        disabled={gv.monHocGiangViens.length === 0}
                                                        className={`flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors ${gv.monHocGiangViens.length > 0
                                                            ? "hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                                            : "opacity-30 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        <ChevronIcon isOpen={isRowExpanded(gv.id)} />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center text-gray-800 dark:text-white/90">
                                                    <div className="flex items-center gap-2">
                                                        {gv.maGiangVien}
                                                        {gv.monHocGiangViens.length > 0 && (
                                                            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                                                                {gv.monHocGiangViens.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center text-gray-800 dark:text-white/90">
                                                    {gv.hoTen}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center">
                                                    <Badge
                                                        variant="solid"
                                                        color={getGioiTinhColor(gv.gioiTinh)}
                                                    >
                                                        {getGioiTinhLabel(gv.gioiTinh)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    {gv.sdt}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(gv.id)}
                                                            className="dropdown-toggle flex items-center gap-1.5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === gv.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === gv.id}
                                                            onClose={closeDropdown}
                                                            className="w-56 mt-2 right-0"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDetailModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openEditModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faPenToSquare} className="mr-2 w-4" />
                                                                    Chỉnh sửa
                                                                </DropdownItem>
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    disabled={gv.nguoiDung !== null}
                                                                    onClick={() => {
                                                                        if (gv.nguoiDung === null) {
                                                                            openCreateAccountModal(gv);
                                                                        }
                                                                    }}
                                                                    className={gv.nguoiDung !== null ? "opacity-50 cursor-not-allowed" : ""}
                                                                >
                                                                    <FontAwesomeIcon icon={faUserPlus} className="mr-2 w-4" />
                                                                    {gv.nguoiDung !== null ? "Đã có tài khoản" : "Tạo tài khoản"}
                                                                </DropdownItem>
                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteModal(gv)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} className="mr-2 w-4" />
                                                                    Xóa
                                                                </DropdownItem>
                                                            </div>
                                                        </Dropdown>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Expanded Sub-Rows (Môn học) */}
                                            {isRowExpanded(gv.id) && gv.monHocGiangViens.length > 0 && (
                                                <>
                                                    {/* Sub-Table Header */}
                                                    <TableRow className="grid grid-cols-[5%_15%_25%_12%_18%_25%] items-center bg-gray-100/80 dark: bg-white/[0.04] border-t border-gray-200 dark:border-white/[0.05]">
                                                        <TableCell className="px-3 py-2.5">
                                                            <span></span>
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            Mã Môn
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                                            Tên Môn Học
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Loại Môn
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Số Tín Chỉ
                                                        </TableCell>
                                                        <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider flex items-center justify-center">
                                                            Hành động
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Sub-Rows Data */}
                                                    {gv.monHocGiangViens.map((monHocGV, index) => (
                                                        <TableRow
                                                            key={monHocGV.id}
                                                            className={`grid grid-cols-[5%_15%_25%_12%_18%_25%] items-center bg-gray-50/50 dark:bg-white/[0.01] ${index === gv.monHocGiangViens.length - 1
                                                                ? "border-b border-gray-200 dark:border-white/[0.05]"
                                                                : ""
                                                                }`}
                                                        >
                                                            <TableCell className="px-3 py-3 text-center">
                                                                {/* Connector line */}
                                                                <div className="flex items-center justify-center h-full">
                                                                    <div className="flex flex-col items-center">
                                                                        <div
                                                                            className={`w-px bg-gray-300 dark:bg-white/[0.15] ${index === 0 ? "h-1/2" : "h-full"
                                                                                }`}
                                                                        />
                                                                        <div className="w-2 h-2 rounded-full bg-brand-400 dark:bg-brand-500" />
                                                                        {index !== gv.monHocGiangViens.length - 1 && (
                                                                            <div className="w-px h-1/2 bg-gray-300 dark:bg-white/[0.15]" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-700 dark:text-gray-200">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">{monHocGV.monHoc.maMonHoc}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300">
                                                                <span className="text-sm">{monHocGV.monHoc.tenMonHoc}</span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                <Badge
                                                                    variant="solid"
                                                                    color={getLoaiMonColor(monHocGV.monHoc.loaiMon)}
                                                                >
                                                                    {getLoaiMonLabel(monHocGV.monHoc.loaiMon)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                                                                <span className="text-sm font-medium">{monHocGV.monHoc.soTinChi} tín chỉ</span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        openUnassignModal(
                                                                            gv.id,
                                                                            monHocGV.monHoc.id,
                                                                            monHocGV.monHoc.tenMonHoc,
                                                                            gv.hoTen
                                                                        )
                                                                    }
                                                                    className="p-2 text-error-500 border-error-300 hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
                                                                >
                                                                    <FontAwesomeIcon icon={faUnlink} className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </React.Fragment>
                                    ))}
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

                {/* Table Footer Summary */}
                <div className="mt-4 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tổng số {giangViens.length} giảng viên với{" "}
                            {giangViens.reduce(
                                (acc, gv) => acc + gv.monHocGiangViens.length,
                                0
                            )}{" "}
                            môn học được phân công
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setExpandedRows(giangViens.map((gv) => gv.id))}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark: bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
                            >
                                Mở rộng tất cả
                            </button>
                            <button
                                onClick={() => setExpandedRows([])}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark: bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark: hover:bg-white/[0.05] transition-colors"
                            >
                                Thu gọn tất cả
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Thêm mới */}
            <GiangVienModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                isEdit={false}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleCreate}
                errors={errors}
            />

            {/* Modal Sửa */}
            <GiangVienModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingGiangVien(null);
                }}
                isEdit={true}
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleUpdate}
                errors={errors}
            />

            {/* Modal Chi tiết */}
            <ChiTietModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setViewingGiangVien(null);
                }}
                giangVien={viewingGiangVien}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingGiangVien(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            {/* Modal Hủy phân công môn học */}
            <Modal
                isOpen={isUnassignModalOpen}
                onClose={() => {
                    setIsUnassignModalOpen(false);
                    setUnassignData(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Xác nhận hủy phân công
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn <strong>hủy phân công</strong> môn học{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {unassignData?.tenMonHoc}
                        </span>{" "}
                        khỏi giảng viên{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {unassignData?.hoTen}
                        </span>
                        ?<br /><br />
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsUnassignModalOpen(false);
                                setUnassignData(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={handleUnassignMonHoc}>
                            Hủy phân công
                        </Button>
                    </div>
                </div>
            </Modal>
            {/* Modal Tạo tài khoản */}
            <Modal
                isOpen={isCreateAccountModalOpen}
                onClose={() => {
                    if (!isCreatingAccount) {
                        setIsCreateAccountModalOpen(false);
                        setCreatingAccountGiangVien(null);
                    }
                }}
                className="max-w-md"
            >
                <div className="p-6 sm: p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUserPlus} className="text-brand-500" />
                        Tạo tài khoản hệ thống
                    </h3>

                    {/* Thông tin giảng viên */}
                    {creatingAccountGiangVien && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Mã GV:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountGiangVien.maGiangVien}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Họ tên:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountGiangVien.hoTen}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {creatingAccountGiangVien.email}
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
                            <li>Tên đăng nhập:  <strong>{creatingAccountGiangVien?.maGiangVien}</strong></li>
                            <li>Vai trò:  <strong>Giảng viên</strong></li>
                            <li>Mật khẩu mặc định: <strong>123456</strong></li>
                        </ul>
                    </div>

                    {/* Cảnh báo */}
                    <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            ⚠️ Vui lòng thông báo cho giảng viên đổi mật khẩu sau khi đăng nhập lần đầu.
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Bạn có chắc chắn muốn tạo tài khoản hệ thống cho giảng viên{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {creatingAccountGiangVien?.hoTen}
                        </span>?
                    </p>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateAccountModalOpen(false);
                                setCreatingAccountGiangVien(null);
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
        </div>
    );
}