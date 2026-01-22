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
import Badge from "@/components/ui/badge/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faPenToSquare,
    faTrash,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/form/SelectCustom";

// ==================== INTERFACES ====================
interface HocKy {
    id: number;
    hocKy: number;
    ngayBatDau: string;
    ngayKetThuc: string;
    namHoc?: NamHoc;
}

interface NamHoc {
    id: number;
    maNamHoc: string;
    tenNamHoc: string;
    namBatDau: number;
    namKetThuc: number;
    hocKys: HocKy[];
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

// Format date to YYYY-MM-DD
const formatDateNoTimezone = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

// Lấy màu cho badge năm
const getNamColor = (type: "start" | "end"): "primary" | "success" | "warning" | "info" | "error" => {
    return type === "start" ? "success" : "primary";
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
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {total}
                </span>
                {" "}kết quả
            </span>
        </div>
    );
};

// ==================== NĂM HỌC MODAL ====================
interface NamHocModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    formData: {
        maNamHoc: string;
        tenNamHoc: string;
        namBatDau: string;
        namKetThuc: string;
    };
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        maNamHoc: boolean;
        tenNamHoc: boolean;
        namBatDau: boolean;
        namKetThuc: boolean;
    };
}

const NamHocModal: React.FC<NamHocModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    formData,
    onFormChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Năm học" : "Thêm Năm học"}
                </h3>
                <div className="space-y-5">
                    {/* Mã Năm học */}
                    <div>
                        <Label>Mã Năm học</Label>
                        <Input
                            defaultValue={formData.maNamHoc}
                            onChange={(e) => onFormChange("maNamHoc", e.target.value)}
                            placeholder="VD: NH2024"
                            error={errors.maNamHoc}
                            hint={errors.maNamHoc ? "Mã năm học không được để trống" : ""}
                        />
                    </div>

                    {/* Tên Năm học */}
                    <div>
                        <Label>Tên Năm học</Label>
                        <Input
                            defaultValue={formData.tenNamHoc}
                            onChange={(e) => onFormChange("tenNamHoc", e.target.value)}
                            placeholder="VD: 2024-2025"
                            error={errors.tenNamHoc}
                            hint={errors.tenNamHoc ? "Tên năm học không được để trống" : ""}
                        />
                    </div>

                    {/* Năm Bắt đầu */}
                    <div>
                        <Label>Năm Bắt đầu</Label>
                        <Input
                            type="number"
                            defaultValue={formData.namBatDau}
                            onChange={(e) => onFormChange("namBatDau", e.target.value)}
                            placeholder="VD: 2024"
                            error={errors.namBatDau}
                            hint={errors.namBatDau ? "Năm bắt đầu không được để trống" : ""}
                        />
                    </div>

                    {/* Năm Kết thúc */}
                    <div>
                        <Label>Năm Kết thúc</Label>
                        <Input
                            type="number"
                            defaultValue={formData.namKetThuc}
                            onChange={(e) => onFormChange("namKetThuc", e.target.value)}
                            placeholder="VD:  2025"
                            error={errors.namKetThuc}
                            hint={errors.namKetThuc ? "Năm kết thúc không được để trống" : ""}
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

// ==================== HỌC KỲ MODAL ====================
interface HocKyModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        hocKy: string;
        ngayBatDau: string;
        ngayKetThuc: string;
        namHocId: string;
    };
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        hocKy: boolean;
        ngayBatDau: boolean;
        ngayKetThuc: boolean;
        namHocId: boolean;
    };
    // Các props mới từ cha truyền xuống
    namHocSearchKeyword: string;
    setNamHocSearchKeyword: (value: string) => void;
    namHocOptions: NamHoc[];
    isLoadingNamHoc: boolean;
    handleSearchNamHoc: () => void;
}

const HocKyModal: React.FC<HocKyModalProps> = ({
    isOpen,
    onClose,
    formData,
    onFormChange,
    onSubmit,
    errors,
    namHocSearchKeyword,
    setNamHocSearchKeyword,
    namHocOptions,
    isLoadingNamHoc,
    handleSearchNamHoc,
}) => {
    if (!isOpen) return null;

    const hocKyOptions = [
        { value: "1", label: "Học kỳ 1" },
        { value: "2", label: "Học kỳ 2" },
        // { value: "3", label: "Học kỳ hè" }, // nếu cần
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Thêm Học kỳ
                </h3>

                <div className="space-y-6">
                    {/* Chọn Năm học - có tìm kiếm */}
                    <div>
                        <Label>Năm học</Label>
                        <SearchableSelect
                            options={namHocOptions.map((nh) => ({
                                value: nh.id.toString(),
                                label: nh.maNamHoc,
                                secondary: nh.tenNamHoc,
                            }))}
                            placeholder="Chọn năm học"
                            onChange={(value) => onFormChange("namHocId", value)}
                            defaultValue={formData.namHocId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm trong danh sách..."
                        />

                        {errors.namHocId && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn năm học
                            </p>
                        )}

                        {formData.namHocId && (
                            <div className="mt-2 p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
                                <p className="text-sm text-brand-600 dark:text-brand-400">
                                    <span className="font-medium">Đã chọn: </span>
                                    {namHocOptions.find(nh => nh.id.toString() === formData.namHocId)?.maNamHoc} - {namHocOptions.find(nh => nh.id.toString() === formData.namHocId)?.tenNamHoc || 'Đang tải...'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Học kỳ */}
                    <div>
                        <Label>Học kỳ</Label>
                        <SearchableSelect
                            options={hocKyOptions}
                            placeholder="Chọn học kỳ"
                            onChange={(value) => onFormChange("hocKy", value)}
                            defaultValue={formData.hocKy}
                            showSecondary={false}
                        />
                        {errors.hocKy && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn học kỳ
                            </p>
                        )}
                    </div>

                    {/* Ngày bắt đầu & kết thúc */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <Label >Ngày Bắt đầu</Label>
                            <DatePicker
                                id="hocky-ngayBatDau"
                                defaultDate={formData.ngayBatDau ? new Date(formData.ngayBatDau) : undefined}
                                onChange={(date: Date | Date[]) => {
                                    const selectedDate = Array.isArray(date) ? date[0] : date;
                                    if (selectedDate) {
                                        onFormChange("ngayBatDau", formatDateNoTimezone(selectedDate));
                                    } else {
                                        onFormChange("ngayBatDau", "");
                                    }
                                }}
                            />
                            {errors.ngayBatDau && (
                                <p className="mt-1 text-sm text-error-500">Ngày bắt đầu không được để trống</p>
                            )}
                        </div>

                        <div>
                            <Label>Ngày Kết thúc</Label>
                            <DatePicker
                                id="hocky-ngayKetThuc"
                                defaultDate={formData.ngayKetThuc ? new Date(formData.ngayKetThuc) : undefined}
                                onChange={(date: Date | Date[]) => {
                                    const selectedDate = Array.isArray(date) ? date[0] : date;
                                    if (selectedDate) {
                                        onFormChange("ngayKetThuc", formatDateNoTimezone(selectedDate));
                                    } else {
                                        onFormChange("ngayKetThuc", "");
                                    }
                                }}
                            />
                            {errors.ngayKetThuc && (
                                <p className="mt-1 text-sm text-error-500">Ngày kết thúc không được để trống</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit} disabled={isLoadingNamHoc}>
                        Thêm mới
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ NĂM HỌC & HỌC KỲ ====================
export default function QuanLyNamHocHocKyPage() {
    // State cho danh sách và pagination
    const [namHocs, setNamHocs] = useState<NamHoc[]>([]);
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
    const [isCreateNamHocModalOpen, setIsCreateNamHocModalOpen] = useState(false);
    const [isEditNamHocModalOpen, setIsEditNamHocModalOpen] = useState(false);
    const [isDeleteNamHocModalOpen, setIsDeleteNamHocModalOpen] = useState(false);
    const [isCreateHocKyModalOpen, setIsCreateHocKyModalOpen] = useState(false);
    const [isDeleteHocKyModalOpen, setIsDeleteHocKyModalOpen] = useState(false);

    const [editingNamHoc, setEditingNamHoc] = useState<NamHoc | null>(null);
    const [deletingNamHoc, setDeletingNamHoc] = useState<NamHoc | null>(null);
    const [deletingHocKy, setDeletingHocKy] = useState<{ hocKy: HocKy; namHoc: NamHoc } | null>(null);

    // State cho form năm học
    const [namHocFormData, setNamHocFormData] = useState({
        maNamHoc: "",
        tenNamHoc: "",
        namBatDau: "",
        namKetThuc: "",
    });

    // State cho form học kỳ
    const [hocKyFormData, setHocKyFormData] = useState({
        hocKy: "",
        ngayBatDau: "",
        ngayKetThuc: "",
        namHocId: "",
    });

    // State cho filter & search
    const [searchKeyword, setSearchKeyword] = useState("");

    // State cho errors
    const [namHocErrors, setNamHocErrors] = useState({
        maNamHoc: false,
        tenNamHoc: false,
        namBatDau: false,
        namKetThuc: false,
    });

    const [hocKyErrors, setHocKyErrors] = useState({
        hocKy: false,
        ngayBatDau: false,
        ngayKetThuc: false,
        namHocId: false,
    });

    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Thêm vào phần khai báo state
    const [namHocSearchKeyword, setNamHocSearchKeyword] = useState("");
    const [namHocOptionsForModal, setNamHocOptionsForModal] = useState<NamHoc[]>([]);
    const [isLoadingNamHoc, setIsLoadingNamHoc] = useState(false);

    // Hàm fetch năm học cho modal
    const fetchNamHocForModal = async (search: string = "") => {
        try {
            setIsLoadingNamHoc(true);
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/dao-tao/nam-hoc?page=1&limit=9999`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNamHocOptionsForModal(json.data);
            }
        } catch (err) {
            console.error("Không thể tải danh sách năm học cho modal:", err);
            showAlert("error", "Lỗi", "Không thể tải danh sách năm học");
        } finally {
            setIsLoadingNamHoc(false);
        }
    };

    // Load mặc định khi mở modal
    useEffect(() => {
        if (isCreateHocKyModalOpen) {
            fetchNamHocForModal(); // load danh sách mặc định
            setNamHocSearchKeyword(""); // reset ô tìm kiếm
        }
    }, [isCreateHocKyModalOpen]);

    // Xử lý nút tìm kiếm
    const handleSearchNamHoc = () => {
        fetchNamHocForModal(namHocSearchKeyword.trim());
    };

    // ==================== API CALLS ====================
    const fetchNamHocs = async (page: number = 1, search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/dao-tao/nam-hoc?page=${page}&limit=10`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNamHocs(json.data);
                setPagination({
                    total: json.pagination.total || 0,
                    page: json.pagination.page || 1,
                    limit: json.pagination.limit || 10,
                    totalPages: json.pagination.totalPages || 1,
                });
                setCurrentPage(json.pagination.page || 1);
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách năm học");
        }
    };

    // Fetch năm học khi currentPage thay đổi
    useEffect(() => {
        fetchNamHocs(currentPage, searchKeyword.trim());
    }, [currentPage]);

    // ==================== HANDLERS ====================
    const handleSearch = () => {
        setCurrentPage(1);
        fetchNamHocs(1, searchKeyword.trim());
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

    const resetNamHocForm = () => {
        setNamHocFormData({
            maNamHoc: "",
            tenNamHoc: "",
            namBatDau: "",
            namKetThuc: "",
        });
        setNamHocErrors({
            maNamHoc: false,
            tenNamHoc: false,
            namBatDau: false,
            namKetThuc: false,
        });
    };

    const resetHocKyForm = () => {
        setHocKyFormData({
            hocKy: "",
            ngayBatDau: "",
            ngayKetThuc: "",
            namHocId: "",
        });
        setHocKyErrors({
            hocKy: false,
            ngayBatDau: false,
            ngayKetThuc: false,
            namHocId: false,
        });
    };

    const handleNamHocFormChange = (field: string, value: string) => {
        setNamHocFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleHocKyFormChange = (field: string, value: string) => {
        setHocKyFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleRow = (id: number) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const isRowExpanded = (id: number) => expandedRows.includes(id);

    // Validate năm học form
    const validateNamHocForm = (): boolean => {
        const newErrors = {
            maNamHoc: !namHocFormData.maNamHoc.trim(),
            tenNamHoc: !namHocFormData.tenNamHoc.trim(),
            namBatDau: !namHocFormData.namBatDau,
            namKetThuc: !namHocFormData.namKetThuc,
        };
        setNamHocErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Validate học kỳ form
    const validateHocKyForm = (): boolean => {
        const newErrors = {
            hocKy: !hocKyFormData.hocKy,
            ngayBatDau: !hocKyFormData.ngayBatDau,
            ngayKetThuc: !hocKyFormData.ngayKetThuc,
            namHocId: !hocKyFormData.namHocId,
        };
        setHocKyErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Create Năm học
    const handleCreateNamHoc = async () => {
        if (!validateNamHocForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/nam-hoc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNamHoc: namHocFormData.maNamHoc.trim(),
                    tenNamHoc: namHocFormData.tenNamHoc.trim(),
                    namBatDau: Number(namHocFormData.namBatDau),
                    namKetThuc: Number(namHocFormData.namKetThuc),
                }),
            });

            setIsCreateNamHocModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm năm học thành công");
                resetNamHocForm();
                fetchNamHocs(currentPage, searchKeyword.trim());
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm năm học thất bại");
            }
        } catch (err) {
            setIsCreateNamHocModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm năm học");
        }
    };

    // Update Năm học
    const handleUpdateNamHoc = async () => {
        if (!editingNamHoc || !validateNamHocForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/nam-hoc/${editingNamHoc.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maNamHoc: namHocFormData.maNamHoc.trim(),
                        tenNamHoc: namHocFormData.tenNamHoc.trim(),
                        namBatDau: Number(namHocFormData.namBatDau),
                        namKetThuc: Number(namHocFormData.namKetThuc),
                    }),
                }
            );

            setIsEditNamHocModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật năm học thành công");
                resetNamHocForm();
                setEditingNamHoc(null);
                fetchNamHocs(currentPage, searchKeyword.trim());
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật năm học thất bại");
            }
        } catch (err) {
            setIsEditNamHocModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật năm học");
        } finally {
            setEditingNamHoc(null);
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Delete Năm học
    const confirmDeleteNamHoc = async () => {
        if (!deletingNamHoc) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/nam-hoc/${deletingNamHoc.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteNamHocModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa năm học thành công");
                setDeletingNamHoc(null);
                fetchNamHocs(currentPage, searchKeyword.trim());
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa năm học thất bại");
            }
        } catch (err) {
            setIsDeleteNamHocModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa năm học");
        } finally {
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Create Học kỳ
    const handleCreateHocKy = async () => {
        if (!validateHocKyForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/hoc-ky", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    hocKy: Number(hocKyFormData.hocKy),
                    ngayBatDau: hocKyFormData.ngayBatDau,
                    ngayKetThuc: hocKyFormData.ngayKetThuc,
                    namHocId: Number(hocKyFormData.namHocId),
                }),
            });

            setIsCreateHocKyModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm học kỳ thành công");
                resetHocKyForm();
                fetchNamHocs(currentPage, searchKeyword.trim());
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm học kỳ thất bại");
            }
        } catch (err) {
            setIsCreateHocKyModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm học kỳ");
        }
    };

    // Delete Học kỳ
    const confirmDeleteHocKy = async () => {
        if (!deletingHocKy) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/hoc-ky/${deletingHocKy.hocKy.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteHocKyModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa học kỳ thành công");
                setDeletingHocKy(null);
                fetchNamHocs(currentPage, searchKeyword.trim());
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa học kỳ thất bại");
            }
        } catch (err) {
            setIsDeleteHocKyModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa học kỳ");
        } finally {
            // 👉 Cuộn lên đầu trang
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // Open modals
    const openEditNamHocModal = (namHoc: NamHoc) => {
        setEditingNamHoc(namHoc);
        setNamHocFormData({
            maNamHoc: namHoc.maNamHoc,
            tenNamHoc: namHoc.tenNamHoc,
            namBatDau: namHoc.namBatDau.toString(),
            namKetThuc: namHoc.namKetThuc.toString(),
        });
        setIsEditNamHocModalOpen(true);
    };

    const openDeleteNamHocModal = (namHoc: NamHoc) => {
        setDeletingNamHoc(namHoc);
        setIsDeleteNamHocModalOpen(true);
    };

    const openDeleteHocKyModal = (hocKy: HocKy, namHoc: NamHoc) => {
        setDeletingHocKy({ hocKy, namHoc });
        setIsDeleteHocKyModalOpen(true);
    };

    // Get học kỳ label
    const getHocKyLabel = (hocKy: number): string => {
        switch (hocKy) {
            case 1:
                return "Học kỳ 1";
            case 2:
                return "Học kỳ 2";
            case 3:
                return "Học kỳ hè";
            default:
                return `Học kỳ ${hocKy}`;
        }
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Năm học & Học kỳ" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Alert */}
                {alert && (
                    <div className="mb-6">
                        <Alert
                            key={alert.id}        // 🔥 reset state mỗi lần show
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            dismissible
                            autoDismiss
                            duration={15000}
                            onClose={() => setAlert(null)}   // 🔥 unmount thật
                        />
                    </div>
                )}

                {/* Search và Buttons */}
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
                                placeholder="Tìm kiếm năm học..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder: text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => {
                                resetHocKyForm();
                                setIsCreateHocKyModalOpen(true);
                            }}
                        >
                            Thêm Học kỳ
                        </Button>
                        <Button
                            onClick={() => {
                                resetNamHocForm();
                                setIsCreateNamHocModalOpen(true);
                            }}
                        >
                            Thêm Năm học
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[800px]">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[6%_15%_24%_15%_15%_25%]">
                                        <TableCell
                                            isHeader
                                            className="px-3 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            <span className="sr-only">Expand</span>
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left"
                                        >
                                            Mã Năm học
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                        >
                                            Tên Năm học
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Năm Bắt đầu
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 flex items-center justify-center"
                                        >
                                            Năm Kết thúc
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
                                    {namHocs.length === 0 ? (
                                        <TableRow>
                                            <TableCell cols={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                                                Không có dữ liệu năm học
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        namHocs.map((nh) => (
                                            <React.Fragment key={nh.id}>
                                                {/* Main Row */}
                                                <TableRow
                                                    className={`grid grid-cols-[6%_15%_24%_15%_15%_25%] items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${isRowExpanded(nh.id)
                                                        ? "bg-gray-50 dark: bg-white/[0.02]"
                                                        : ""
                                                        }`}
                                                >
                                                    <TableCell className="px-3 py-4 flex items-center justify-center">
                                                        <button
                                                            onClick={() => toggleRow(nh.id)}
                                                            disabled={nh.hocKys.length === 0}
                                                            className={`flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 transition-colors ${nh.hocKys.length > 0
                                                                ? "hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                                                                : "opacity-30 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            <ChevronIcon isOpen={isRowExpanded(nh.id)} />
                                                        </button>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center text-gray-800 dark:text-white/90">
                                                        <div className="flex items-center gap-2">
                                                            {nh.maNamHoc}
                                                            {nh.hocKys.length > 0 && (
                                                                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-white/[0.05] dark:text-gray-400">
                                                                    {nh.hocKys.length} HK
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-center">
                                                        {nh.tenNamHoc}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center">
                                                        <Badge variant="solid" color={getNamColor("start")}>
                                                            {nh.namBatDau}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center">
                                                        <Badge variant="solid" color={getNamColor("end")}>
                                                            {nh.namKetThuc}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                onClick={() => openEditNamHocModal(nh)}
                                                                className="p-2"
                                                            >
                                                                Sửa
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                onClick={() => openDeleteNamHocModal(nh)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Sub-Rows (Học kỳ) */}
                                                {isRowExpanded(nh.id) && nh.hocKys.length > 0 && (
                                                    <>
                                                        {/* Sub-Table Header */}
                                                        <TableRow className="grid grid-cols-[6%_15%_24%_15%_15%_25%] items-center bg-gray-100/80 dark:bg-white/[0.04] border-t border-gray-200 dark:border-white/[0.05]">
                                                            <TableCell className="px-3 py-2. 5">
                                                                <span></span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-left">
                                                                Học kỳ
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                Ngày Bắt đầu
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                Ngày Kết thúc
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                <span></span>
                                                            </TableCell>
                                                            <TableCell className="px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-center">
                                                                Hành động
                                                            </TableCell>
                                                        </TableRow>

                                                        {/* Sub-Rows Data */}
                                                        {nh.hocKys.map((hk, index) => (
                                                            <TableRow
                                                                key={hk.id}
                                                                className={`grid grid-cols-[6%_15%_24%_15%_15%_25%] items-center bg-gray-50/50 dark:bg-white/[0.01] ${index === nh.hocKys.length - 1
                                                                    ? "border-b border-gray-200 dark:border-white/[0.05]"
                                                                    : ""
                                                                    }`}
                                                            >
                                                                <TableCell className="px-3 py-3 flex items-center justify-center">
                                                                    {/* Connector line */}
                                                                    <div className="flex items-center justify-center h-full">
                                                                        <div className="flex flex-col items-center">
                                                                            <div
                                                                                className={`w-px bg-gray-300 dark:bg-white/[0.15] ${index === 0 ? "h-1/2" : "h-full"
                                                                                    }`}
                                                                            />
                                                                            <div className="w-2 h-2 rounded-full bg-brand-400 dark:bg-brand-500" />
                                                                            {index !== nh.hocKys.length - 1 && (
                                                                                <div className="w-px h-1/2 bg-gray-300 dark:bg-white/[0.15]" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-700 dark:text-gray-200 flex items-center justify-left">
                                                                    <Badge variant="solid" color="info">
                                                                        {getHocKyLabel(hk.hocKy)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 text-center">
                                                                    <span className="text-sm">{formatDateVN(hk.ngayBatDau)}</span>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 text-center">
                                                                    <span className="text-sm">{formatDateVN(hk.ngayKetThuc)}</span>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 text-gray-600 dark:text-gray-300 text-center">
                                                                    <span></span>
                                                                </TableCell>
                                                                <TableCell className="px-5 py-3 flex items-center justify-center">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => openDeleteHocKyModal(hk, nh)}
                                                                        className="p-2 text-error-500 border-error-300 hover:bg-error-50 dark:border-error-500/30 dark:hover:bg-error-500/10"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </>
                                                )}
                                            </React.Fragment>
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

                {/* Table Footer Summary */}
                <div className="mt-4 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tổng số {namHocs.length} năm học với{" "}
                            {namHocs.reduce((acc, nh) => acc + nh.hocKys.length, 0)}{" "}
                            học kỳ
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setExpandedRows(namHocs.map((nh) => nh.id))}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
                            >
                                Mở rộng tất cả
                            </button>
                            <button
                                onClick={() => setExpandedRows([])}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-white/[0.03] dark:border-white/[0.1] dark:text-gray-300 dark:hover:bg-white/[0.05] transition-colors"
                            >
                                Thu gọn tất cả
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Thêm Năm học */}
            <NamHocModal
                isOpen={isCreateNamHocModalOpen}
                onClose={() => {
                    setIsCreateNamHocModalOpen(false);
                    resetNamHocForm();
                }}
                isEdit={false}
                formData={namHocFormData}
                onFormChange={handleNamHocFormChange}
                onSubmit={handleCreateNamHoc}
                errors={namHocErrors}
            />

            {/* Modal Sửa Năm học */}
            <NamHocModal
                isOpen={isEditNamHocModalOpen}
                onClose={() => {
                    setIsEditNamHocModalOpen(false);
                    resetNamHocForm();
                    setEditingNamHoc(null);
                }}
                isEdit={true}
                formData={namHocFormData}
                onFormChange={handleNamHocFormChange}
                onSubmit={handleUpdateNamHoc}
                errors={namHocErrors}
            />

            {/* Modal Thêm Học kỳ */}
            <HocKyModal
                isOpen={isCreateHocKyModalOpen}
                onClose={() => {
                    setIsCreateHocKyModalOpen(false);
                    resetHocKyForm();
                    setNamHocSearchKeyword(""); // reset khi đóng
                    setNamHocOptionsForModal([]); // optional: clear danh sách
                }}
                formData={hocKyFormData}
                onFormChange={handleHocKyFormChange}
                onSubmit={handleCreateHocKy}
                errors={hocKyErrors}
                // Truyền thêm các props mới
                namHocSearchKeyword={namHocSearchKeyword}
                setNamHocSearchKeyword={setNamHocSearchKeyword}
                namHocOptions={namHocOptionsForModal}
                isLoadingNamHoc={isLoadingNamHoc}
                handleSearchNamHoc={handleSearchNamHoc}
            />

            {/* Modal Xóa Năm học */}
            <Modal
                isOpen={isDeleteNamHocModalOpen}
                onClose={() => {
                    setIsDeleteNamHocModalOpen(false);
                    setDeletingNamHoc(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Xác nhận xóa năm học
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn xóa năm học{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {deletingNamHoc?.tenNamHoc}
                        </span>{" "}
                        (Mã:  {deletingNamHoc?.maNamHoc})?
                        <br /><br />
                        <span className="text-error-500">
                            Lưu ý:  Cần xoá các học kỳ trong năm học này trước.
                        </span>
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteNamHocModalOpen(false);
                                setDeletingNamHoc(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={confirmDeleteNamHoc}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Xóa Học kỳ */}
            <Modal
                isOpen={isDeleteHocKyModalOpen}
                onClose={() => {
                    setIsDeleteHocKyModalOpen(false);
                    setDeletingHocKy(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark: text-white/90">
                        Xác nhận xóa học kỳ
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn xóa{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {deletingHocKy ? getHocKyLabel(deletingHocKy.hocKy.hocKy) : ""}
                        </span>{" "}
                        của năm học{" "}
                        <span className="font-semibold text-gray-900 dark:text-white">
                            {deletingHocKy?.namHoc.tenNamHoc}
                        </span>
                        ? <br /><br />
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteHocKyModalOpen(false);
                                setDeletingHocKy(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={confirmDeleteHocKy}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}