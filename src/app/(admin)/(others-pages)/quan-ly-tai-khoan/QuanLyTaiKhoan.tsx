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
    faUserPlus,
    faKey,
    faEnvelope,
    faPhone,
    faTriangleExclamation,
    faCircleInfo,
    faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";

type VAI_TRO = "ADMIN" | "GIANG_VIEN" | "SINH_VIEN" | "CAN_BO_PHONG_DAO_TAO";
type GioiTinh = "NAM" | "NU" | "KHONG_XAC_DINH";

interface Profile {
    type: "giangvien" | "sinhvien";
    id: number;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: GioiTinh;
    diaChi: string;
    maSinhVien?: string; // Chỉ có ở sinh viên
}

interface NguoiDung {
    id: number;
    tenDangNhap: string;
    vaiTro: VAI_TRO;
    ngayTao: string;
    profile: Profile | null;
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

// Hàm chuyển enum vaiTro thành tên tiếng Việt
const getVaiTroLabel = (vaiTro: VAI_TRO): string => {
    switch (vaiTro) {
        case "ADMIN":
            return "Quản Trị Viên";
        case "CAN_BO_PHONG_DAO_TAO":
            return "Cán bộ";
        case "SINH_VIEN":
            return "Sinh viên";
        case "GIANG_VIEN":
            return "Giảng viên";
        default:
            return vaiTro;
    }
};

const getVaiTroColor = (vaiTro: VAI_TRO): "success" | "error" | "primary" | "warning" => {
    switch (vaiTro) {
        case "ADMIN":
            return "error";
        case "CAN_BO_PHONG_DAO_TAO":
            return "warning";
        case "SINH_VIEN":
            return "success";
        case "GIANG_VIEN":
            return "primary";
        default:
            return "primary";
    }
};

const getGioiTinhLabel = (gioiTinh: GioiTinh): string => {
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

// ==================== MODAL XEM CHI TIẾT ====================
interface ViewNguoiDungModalProps {
    isOpen: boolean;
    onClose: () => void;
    nguoiDung: NguoiDung | null;
}

const ViewNguoiDungModal: React.FC<ViewNguoiDungModalProps> = ({
    isOpen,
    onClose,
    nguoiDung,
}) => {
    if (!isOpen || !nguoiDung) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết Người dùng
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tên đăng nhập</p>
                            <p className="font-medium text-gray-800 dark:text-white">{nguoiDung.tenDangNhap}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vai trò</p>
                            <Badge variant="solid" color={getVaiTroColor(nguoiDung.vaiTro)}>
                                {getVaiTroLabel(nguoiDung.vaiTro)}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {new Date(nguoiDung.ngayTao).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                    </div>

                    {nguoiDung.profile && (
                        <>
                            <hr className="my-4 border-gray-200 dark:border-gray-700" />
                            <h4 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
                                Thông tin {nguoiDung.profile.type === "giangvien" ? "Giảng viên" : "Sinh viên"}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                {nguoiDung.profile.type === "sinhvien" && nguoiDung.profile.maSinhVien && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark: text-gray-400">Mã sinh viên</p>
                                        <p className="font-medium text-gray-800 dark:text-white">{nguoiDung.profile.maSinhVien}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Họ và tên</p>
                                    <p className="font-medium text-gray-800 dark: text-white">{nguoiDung.profile.hoTen}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ngày sinh</p>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {new Date(nguoiDung.profile.ngaySinh).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Giới tính</p>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {getGioiTinhLabel(nguoiDung.profile.gioiTinh)}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{nguoiDung.profile.diaChi}</p>
                                </div>
                            </div>
                        </>
                    )}
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

// ==================== MODAL SỬA NGƯỜI DÙNG ====================
interface EditNguoiDungModalProps {
    isOpen: boolean;
    onClose: () => void;
    nguoiDung: NguoiDung | null;
    vaiTro: VAI_TRO | "";
    onVaiTroChange: (value: VAI_TRO | "") => void;
    onSubmit: () => void;
    errors: {
        vaiTro: boolean;
    };
}

const EditNguoiDungModal: React.FC<EditNguoiDungModalProps> = ({
    isOpen,
    onClose,
    nguoiDung,
    vaiTro,
    onVaiTroChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen || !nguoiDung) return null;

    // Xác định options cho vai trò
    const isGiangVien = nguoiDung.profile?.type === "giangvien";
    const isSinhVien = nguoiDung.profile?.type === "sinhvien";
    const isAdmin = nguoiDung.vaiTro === "ADMIN";

    // Không cho đổi role nếu là ADMIN hoặc Sinh viên
    const canChangeRole = !isAdmin && !isSinhVien;

    const vaiTroOptions = isGiangVien
        ? [
            { value: "GIANG_VIEN", label: "Giảng viên" },
            { value: "CAN_BO_PHONG_DAO_TAO", label: "Cán bộ" },
        ]
        : isSinhVien
            ? [{ value: "SINH_VIEN", label: "Sinh viên" }]
            : isAdmin
                ? [{ value: "ADMIN", label: "Quản Trị Viên" }]
                : [
                    { value: "ADMIN", label: "Quản Trị Viên" },
                    { value: "GIANG_VIEN", label: "Giảng viên" },
                    { value: "CAN_BO_PHONG_DAO_TAO", label: "Cán bộ" },
                    { value: "SINH_VIEN", label: "Sinh viên" },
                ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Sửa Người dùng
                </h3>
                <div className="space-y-5">
                    {/* Tên đăng nhập - Chỉ hiển thị, không cho sửa */}
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <Input
                            defaultValue={nguoiDung.tenDangNhap}
                            disabled={true}
                            className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <FontAwesomeIcon icon={faCircleInfo} className="mr-1" />
                            Không thể thay đổi tên đăng nhập
                        </p>
                    </div>

                    {/* Vai trò */}
                    <div>
                        <Label>Vai trò</Label>
                        <SearchableSelect
                            options={vaiTroOptions}
                            placeholder="Chọn vai trò"
                            onChange={(value) => onVaiTroChange((value as VAI_TRO) || "")}
                            defaultValue={vaiTro || ""}
                            showSecondary={false}
                            disabled={!canChangeRole}
                        />
                        {isAdmin && (
                            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                                Không thể thay đổi vai trò của Quản trị viên
                            </p>
                        )}
                        {isSinhVien && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Không thể thay đổi vai trò của sinh viên
                            </p>
                        )}
                        {errors.vaiTro && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn vai trò</p>
                        )}
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={!canChangeRole}>
                        Cập nhật
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL TẠO TÀI KHOẢN CÁN BỘ ====================
interface CreateCanBoModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenDangNhap: string;
    password: string;
    onTenDangNhapChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => void;
    errors: {
        tenDangNhap: boolean;
        password: boolean;
    };
    isCreating: boolean;
}

const CreateCanBoModal: React.FC<CreateCanBoModalProps> = ({
    isOpen,
    onClose,
    tenDangNhap,
    password,
    onTenDangNhapChange,
    onPasswordChange,
    onSubmit,
    errors,
    isCreating,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserPlus} className="text-brand-500" />
                    Tạo tài khoản Cán bộ phòng Đào tạo
                </h3>

                {/* Thông tin vai trò */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Vai trò:</strong> Cán bộ phòng Đào tạo
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <Input
                            defaultValue={tenDangNhap}
                            onChange={(e) => onTenDangNhapChange(e.target.value)}
                            error={errors.tenDangNhap}
                            hint={errors.tenDangNhap ? "Tên đăng nhập không được để trống" : ""}
                            placeholder="Nhập tên đăng nhập..."
                        />
                    </div>
                    <div>
                        <Label>Mật khẩu</Label>
                        <Input
                            type="password"
                            defaultValue={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            error={errors.password}
                            hint={errors.password ? "Mật khẩu không được để trống" : ""}
                            placeholder="Nhập mật khẩu..."
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isCreating}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isCreating}>
                        {isCreating ? "Đang tạo..." : "Tạo tài khoản"}
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

// ==================== TRANG CHÍNH QUẢN LÝ NGƯỜI DÙNG ====================
export default function QuanLyNguoiDungPage() {
    const [nguoiDungs, setNguoiDungs] = useState<NguoiDung[]>([]);
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
    const [isCreateCanBoModalOpen, setIsCreateCanBoModalOpen] = useState(false);

    const [deletingNguoiDung, setDeletingNguoiDung] = useState<NguoiDung | null>(null);
    const [editingNguoiDung, setEditingNguoiDung] = useState<NguoiDung | null>(null);
    const [viewingNguoiDung, setViewingNguoiDung] = useState<NguoiDung | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    // State cho form sửa
    const [editVaiTro, setEditVaiTro] = useState<VAI_TRO | "">("");

    // State cho form tạo cán bộ
    const [createTenDangNhap, setCreateTenDangNhap] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [isCreatingCanBo, setIsCreatingCanBo] = useState(false);

    // State cho modal khôi phục mật khẩu
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [resetPasswordNguoiDung, setResetPasswordNguoiDung] = useState<NguoiDung | null>(null);
    const [resetEmail, setResetEmail] = useState("");
    const [resetSdt, setResetSdt] = useState("");
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resetPasswordErrors, setResetPasswordErrors] = useState({
        email: "",
        sdt: "",
    });

    // State để theo dõi dropdown ĐANG MỞ
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    const toggleDropdown = (nguoiDungId: number) => {
        setActiveDropdownId((prev) =>
            prev === nguoiDungId ? null : nguoiDungId
        );
    };

    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    const [editErrors, setEditErrors] = useState({
        vaiTro: false,
    });

    const [createErrors, setCreateErrors] = useState({
        tenDangNhap: false,
        password: false,
    });

    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Fetch danh sách người dùng
    const fetchNguoiDungs = async (
        page: number = 1,
        search: string = ""
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/auth/users?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNguoiDungs(json.data);
                setPagination(json.pagination);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách người dùng");
        }
    };

    useEffect(() => {
        fetchNguoiDungs(currentPage, searchKeyword);
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchNguoiDungs(1, searchKeyword.trim());
    };

    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const validateEditForm = () => {
        const newErrors = {
            vaiTro: editVaiTro === "",
        };
        setEditErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const validateCreateForm = () => {
        const newErrors = {
            tenDangNhap: !createTenDangNhap.trim(),
            password: !createPassword.trim(),
        };
        setCreateErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const resetEditForm = () => {
        setEditVaiTro("");
        setEditErrors({
            vaiTro: false,
        });
    };

    const resetCreateForm = () => {
        setCreateTenDangNhap("");
        setCreatePassword("");
        setCreateErrors({
            tenDangNhap: false,
            password: false,
        });
    };

    const handleUpdate = async () => {
        if (!editingNguoiDung || !validateEditForm()) return;

        // Không cho sửa nếu là ADMIN
        if (editingNguoiDung.vaiTro === "ADMIN") {
            showAlert("error", "Lỗi", "Không thể thay đổi vai trò của Quản trị viên");
            return;
        }

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/auth/users/${editingNguoiDung.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    vaiTro: editVaiTro,
                }),
            });

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật người dùng thành công");
                resetEditForm();
                fetchNguoiDungs(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        }
    };

    const handleCreateCanBo = async () => {
        if (!validateCreateForm()) return;

        setIsCreatingCanBo(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/auth/new-users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    tenDangNhap: createTenDangNhap.trim(),
                    password: createPassword.trim(),
                    vaiTro: "CAN_BO_PHONG_DAO_TAO",
                }),
            });

            setIsCreateCanBoModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Tạo tài khoản cán bộ thành công");
                resetCreateForm();
                fetchNguoiDungs(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo tài khoản thất bại");
            }
        } catch (err) {
            setIsCreateCanBoModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo tài khoản");
        } finally {
            setIsCreatingCanBo(false);
        }
    };

    // Validate email
    const validateEmail = (email: string): string => {
        if (!email.trim()) return "Email không được để trống";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Email không hợp lệ";
        return "";
    };

    // Validate số điện thoại
    const validateSdt = (sdt: string): string => {
        if (!sdt.trim()) return "Số điện thoại không được để trống";
        const sdtRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
        if (!sdtRegex.test(sdt)) return "Số điện thoại không hợp lệ (VD: 0912345678)";
        return "";
    };

    // Validate form khôi phục mật khẩu
    const validateResetPasswordForm = (): boolean => {
        const emailError = validateEmail(resetEmail);
        const sdtError = validateSdt(resetSdt);

        setResetPasswordErrors({
            email: emailError,
            sdt: sdtError,
        });

        return !emailError && !sdtError;
    };

    // Reset form khôi phục mật khẩu
    const resetResetPasswordForm = () => {
        setResetEmail("");
        setResetSdt("");
        setResetPasswordErrors({
            email: "",
            sdt: "",
        });
    };

    // Mở modal khôi phục mật khẩu
    const openResetPasswordModal = (nguoiDung: NguoiDung) => {
        setResetPasswordNguoiDung(nguoiDung);

        setResetEmail("");
        setResetSdt("");

        setResetPasswordErrors({ email: "", sdt: "" });
        setIsResetPasswordModalOpen(true);
    };

    // Đóng modal khôi phục mật khẩu
    const closeResetPasswordModal = () => {
        setIsResetPasswordModalOpen(false);
        setResetPasswordNguoiDung(null);
        resetResetPasswordForm();
    };

    // Xử lý khôi phục mật khẩu
    const handleResetPassword = async () => {
        if (!resetPasswordNguoiDung || !validateResetPasswordForm()) return;

        setIsResettingPassword(true);

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    userId: resetPasswordNguoiDung.id,
                    email: resetEmail.trim(),
                    sdt: resetSdt.trim(),
                }),
            });

            if (res.ok) {
                closeResetPasswordModal();
                showAlert(
                    "success",
                    "Thành công",
                    `Đã khôi phục mật khẩu cho người dùng "${resetPasswordNguoiDung.tenDangNhap}".  Mật khẩu mới đã được gửi đến email ${resetEmail}.`
                );
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Khôi phục mật khẩu thất bại.  Vui lòng kiểm tra lại thông tin.");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi khôi phục mật khẩu");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const openDeleteModal = (nguoiDung: NguoiDung) => {
        setDeletingNguoiDung(nguoiDung);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingNguoiDung) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/auth/users/${deletingNguoiDung.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa người dùng thành công");
                setDeletingNguoiDung(null);
                fetchNguoiDungs(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        }
    };

    const openEditModal = (nguoiDung: NguoiDung) => {
        setEditingNguoiDung(nguoiDung);
        setEditVaiTro(nguoiDung.vaiTro);
        setIsEditModalOpen(true);
    };

    const openViewModal = (nguoiDung: NguoiDung) => {
        setViewingNguoiDung(nguoiDung);
        setIsViewModalOpen(true);
    };

    const openCreateCanBoModal = () => {
        resetCreateForm();
        setIsCreateCanBoModalOpen(true);
    };

    const DeleteConfirmModal = () => (
        <div className="p-6 sm:p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa người dùng
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa người dùng{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingNguoiDung?.tenDangNhap}
                </span>
                ?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingNguoiDung(null);
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
            <PageBreadcrumb pageTitle="Quản lý Người dùng" />

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
                                placeholder="Tìm kiếm theo tên đăng nhập..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2. 5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={openCreateCanBoModal}
                            startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                        >
                            Tạo tài khoản Cán bộ phòng ĐT
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[25%_25%_25%_25%]">
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Tên đăng nhập
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Vai trò
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Ngày tạo
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                                    {nguoiDungs.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-8 text-center text-gray-500 dark:text-gray-400 col-span-4">
                                                Không có dữ liệu người dùng
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        nguoiDungs.map((nd) => (
                                            <TableRow key={nd.id} className="grid grid-cols-[25%_25%_25%_25%] items-center">
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {nd.tenDangNhap}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Badge variant="solid" color={getVaiTroColor(nd.vaiTro)}>
                                                        {getVaiTroLabel(nd.vaiTro)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark: text-white/90">
                                                    {new Date(nd.ngayTao).toLocaleDateString("vi-VN")}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(nd.id)}
                                                            className="dropdown-toggle flex items-center gap-1. 5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === nd.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === nd.id}
                                                            onClose={closeDropdown}
                                                            className="w-48 mt-2 right-0"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    disabled={nd.profile === null}
                                                                    onClick={() => {
                                                                        if (nd.profile) {
                                                                            openViewModal(nd);
                                                                        }
                                                                    }}
                                                                    className={nd.profile === null ? "opacity-50 cursor-not-allowed" : ""}
                                                                >
                                                                    <FontAwesomeIcon icon={faEye} className="mr-2 w-4" />
                                                                    Xem chi tiết
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openEditModal(nd)}
                                                                >
                                                                    <FontAwesomeIcon icon={faEdit} className="mr-2 w-4" />
                                                                    Sửa
                                                                </DropdownItem>

                                                                {/* THÊM MỚI - Khôi phục mật khẩu */}
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openResetPasswordModal(nd)}
                                                                >
                                                                    <FontAwesomeIcon icon={faKey} className="mr-2 w-4" />
                                                                    Reset mật khẩu
                                                                </DropdownItem>

                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteModal(nd)}
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

            {/* Modal Xem chi tiết */}
            <ViewNguoiDungModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setViewingNguoiDung(null);
                }}
                nguoiDung={viewingNguoiDung}
            />

            {/* Modal Sửa */}
            <EditNguoiDungModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    resetEditForm();
                    setEditingNguoiDung(null);
                }}
                nguoiDung={editingNguoiDung}
                vaiTro={editVaiTro}
                onVaiTroChange={setEditVaiTro}
                onSubmit={handleUpdate}
                errors={editErrors}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingNguoiDung(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>

            {/* Modal Tạo tài khoản Cán bộ */}
            <CreateCanBoModal
                isOpen={isCreateCanBoModalOpen}
                onClose={() => {
                    setIsCreateCanBoModalOpen(false);
                    resetCreateForm();
                }}
                tenDangNhap={createTenDangNhap}
                password={createPassword}
                onTenDangNhapChange={setCreateTenDangNhap}
                onPasswordChange={setCreatePassword}
                onSubmit={handleCreateCanBo}
                errors={createErrors}
                isCreating={isCreatingCanBo}
            />

            {/* Modal Khôi phục mật khẩu */}
            <Modal
                isOpen={isResetPasswordModalOpen}
                onClose={() => {
                    if (!isResettingPassword) {
                        closeResetPasswordModal();
                    }
                }}
                className="max-w-2xl"
            >
                <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <FontAwesomeIcon
                                icon={faKey}
                                className="text-2xl text-amber-600 dark:text-amber-400"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                                Khôi phục mật khẩu
                            </h3>
                            <p className="text-sm text-gray-500 dark: text-gray-400">
                                Đặt lại mật khẩu cho người dùng
                            </p>
                        </div>
                    </div>

                    {/* Thông tin người dùng */}
                    {resetPasswordNguoiDung && (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark: border-gray-700">
                            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                Thông tin người dùng
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Tên đăng nhập: </span>
                                    <span className="font-semibold text-gray-800 dark:text-white">
                                        {resetPasswordNguoiDung.tenDangNhap}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Vai trò:</span>
                                    <Badge variant="solid" color={getVaiTroColor(resetPasswordNguoiDung.vaiTro)}>
                                        {getVaiTroLabel(resetPasswordNguoiDung.vaiTro)}
                                    </Badge>
                                </div>
                                {resetPasswordNguoiDung.profile && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Họ tên:</span>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {resetPasswordNguoiDung.profile.hoTen}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hướng dẫn */}
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-900/20">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faCircleInfo}
                                        className="text-lg text-blue-600 dark: text-blue-400 mt-0.5"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                                        Hướng dẫn
                                    </h4>
                                    <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1 list-disc list-inside">
                                        <li>Nhập email và số điện thoại đã đăng ký của người dùng</li>
                                        <li>Thông tin phải khớp với dữ liệu trong hệ thống</li>
                                        <li>Mật khẩu mới sẽ được gửi đến email người dùng</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form nhập thông tin */}
                    <div className="space-y-5 mb-6">
                        {/* Email */}
                        <div>
                            <Label className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="email"
                                defaultValue={resetEmail}
                                onChange={(e) => {
                                    setResetEmail(e.target.value);
                                    if (resetPasswordErrors.email) {
                                        setResetPasswordErrors(prev => ({ ...prev, email: "" }));
                                    }
                                }}
                                error={!!resetPasswordErrors.email}
                                hint={resetPasswordErrors.email}
                                placeholder="Nhập email của người dùng..."
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <Label className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPhone} className="text-gray-500" />
                                Số điện thoại <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="tel"
                                defaultValue={resetSdt}
                                onChange={(e) => {
                                    setResetSdt(e.target.value);
                                    if (resetPasswordErrors.sdt) {
                                        setResetPasswordErrors(prev => ({ ...prev, sdt: "" }));
                                    }
                                }}
                                error={!!resetPasswordErrors.sdt}
                                hint={resetPasswordErrors.sdt}
                                placeholder="Nhập số điện thoại (VD: 0912345678)..."
                            />
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
                                    <ul className="text-xs text-amber-700/80 dark:text-amber-300/70 space-y-1 list-disc list-inside">
                                        <li>Mật khẩu cũ sẽ bị vô hiệu hóa ngay lập tức</li>
                                        <li>Người dùng cần kiểm tra email để lấy mật khẩu mới</li>
                                        <li>Khuyến nghị người dùng đổi mật khẩu sau khi đăng nhập</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={closeResetPasswordModal}
                            disabled={isResettingPassword}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleResetPassword}
                            disabled={isResettingPassword}
                            startIcon={
                                isResettingPassword
                                    ? undefined
                                    : <FontAwesomeIcon icon={faKey} />
                            }
                        >
                            {isResettingPassword ? "Đang xử lý..." : "Xác nhận khôi phục"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}