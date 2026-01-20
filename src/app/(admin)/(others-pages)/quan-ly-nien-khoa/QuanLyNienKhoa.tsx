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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface NienKhoa {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    moTa: string | null;
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

// ==================== NIÊN KHÓA MODAL - COMPONENT RIÊNG ====================
interface NienKhoaModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEdit: boolean;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: string;
    namKetThuc: string;
    moTa: string;
    onMaNienKhoaChange: (value: string) => void;
    onTenNienKhoaChange: (value: string) => void;
    onNamBatDauChange: (value: string) => void;
    onNamKetThucChange: (value: string) => void;
    onMoTaChange: (value: string) => void;
    onSubmit: () => void;
    errors: {
        maNienKhoa: boolean;
        tenNienKhoa: boolean;
        namBatDau: boolean;
        namKetThuc: boolean;
        moTa: boolean;
    };
}

const NienKhoaModal: React.FC<NienKhoaModalProps> = ({
    isOpen,
    onClose,
    isEdit,
    maNienKhoa,
    tenNienKhoa,
    namBatDau,
    namKetThuc,
    moTa,
    onMaNienKhoaChange,
    onTenNienKhoaChange,
    onNamBatDauChange,
    onNamKetThucChange,
    onMoTaChange,
    onSubmit,
    errors,
}) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    {isEdit ? "Sửa Niên khóa" : "Tạo mới Niên khóa"}
                </h3>
                <div className="space-y-5">
                    <div>
                        <Label>Mã Niên khóa</Label>
                        <Input
                            defaultValue={maNienKhoa}
                            onChange={(e) => onMaNienKhoaChange(e.target.value)}
                            error={errors.maNienKhoa}
                            hint={errors.maNienKhoa ? "Mã niên khóa không được để trống" : ""}
                        />
                    </div>
                    <div>
                        <Label>Tên Niên khóa</Label>
                        <Input
                            defaultValue={tenNienKhoa}
                            onChange={(e) => onTenNienKhoaChange(e.target.value)}
                            error={errors.tenNienKhoa}
                            hint={errors.tenNienKhoa ? "Tên niên khóa không được để trống" : ""}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Năm bắt đầu</Label>
                            <Input
                                type="number"
                                defaultValue={namBatDau}
                                onChange={(e) => onNamBatDauChange(e.target.value)}
                                error={errors.namBatDau}
                                hint={errors.namBatDau ? "Vui lòng nhập năm bắt đầu" : ""}
                            />
                        </div>
                        <div>
                            <Label>Năm kết thúc</Label>
                            <Input
                                type="number"
                                defaultValue={namKetThuc}
                                onChange={(e) => onNamKetThucChange(e.target.value)}
                                error={errors.namKetThuc}
                                hint={errors.namKetThuc ? "Vui lòng nhập năm kết thúc" : ""}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Mô tả</Label>
                        <TextArea
                            placeholder="Nhập mô tả cho niên khóa"
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
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {total}
                </span>
                {" "}kết quả
            </span>
        </div>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ NIÊN KHÓA ====================
export default function QuanLyNienKhoaPage() {
    const [nienKhoas, setNienKhoas] = useState<NienKhoa[]>([]);
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
    const [deletingNienKhoa, setDeletingNienKhoa] = useState<NienKhoa | null>(null);
    const [editingNienKhoa, setEditingNienKhoa] = useState<NienKhoa | null>(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    // State riêng cho form
    const [maNienKhoa, setMaNienKhoa] = useState("");
    const [tenNienKhoa, setTenNienKhoa] = useState("");
    const [namBatDau, setNamBatDau] = useState("");
    const [namKetThuc, setNamKetThuc] = useState("");
    const [moTa, setMoTa] = useState("");

    const [errors, setErrors] = useState({
        maNienKhoa: false,
        tenNienKhoa: false,
        namBatDau: false,
        namKetThuc: false,
        moTa: false,
    });

    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    const fetchNienKhoas = async (page: number = 1, keyword: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            const searchParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
            const res = await fetch(
                `http://localhost:3000/danh-muc/nien-khoa?page=${page}&limit=10${searchParam}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const json = await res.json();
            if (json.data) {
                setNienKhoas(json.data);
                setPagination(json.pagination);
                // Không set currentPage từ backend → giữ state nội bộ
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải danh sách niên khóa");
        }
    };

    useEffect(() => {
        fetchNienKhoas(currentPage, searchKeyword);
    }, [currentPage]);

    const handleSearch = () => {
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
        fetchNienKhoas(1, searchKeyword.trim());
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
            maNienKhoa: !maNienKhoa.trim(),
            tenNienKhoa: !tenNienKhoa.trim(),
            namBatDau: !namBatDau || isNaN(Number(namBatDau)),
            namKetThuc: !namKetThuc || isNaN(Number(namKetThuc)),
            moTa: !moTa.trim(),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    const resetForm = () => {
        setMaNienKhoa("");
        setTenNienKhoa("");
        setNamBatDau("");
        setNamKetThuc("");
        setMoTa("");
        setErrors({
            maNienKhoa: false,
            tenNienKhoa: false,
            namBatDau: false,
            namKetThuc: false,
            moTa: false,
        });
    };

    const handleCreate = async () => {
        if (!validateForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/nien-khoa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNienKhoa: maNienKhoa.trim(),
                    tenNienKhoa: tenNienKhoa.trim(),
                    namBatDau: Number(namBatDau),
                    namKetThuc: Number(namKetThuc),
                    moTa: moTa.trim(),
                }),
            });

            setIsCreateModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Tạo mới niên khóa thành công");
                resetForm();
                fetchNienKhoas(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Tạo mới thất bại");
            }
        } catch (err) {
            setIsCreateModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo niên khóa");
        }
    };

    const handleUpdate = async () => {
        if (!editingNienKhoa || !validateForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/nien-khoa/${editingNienKhoa.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maNienKhoa: maNienKhoa.trim(),
                        tenNienKhoa: tenNienKhoa.trim(),
                        namBatDau: Number(namBatDau),
                        namKetThuc: Number(namKetThuc),
                        moTa: moTa.trim(),
                    }),
                }
            );

            setIsEditModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật niên khóa thành công");
                resetForm();
                fetchNienKhoas(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsEditModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        }
    };

    const openDeleteModal = (nienKhoa: NienKhoa) => {
        setDeletingNienKhoa(nienKhoa);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingNienKhoa) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/danh-muc/nien-khoa/${deletingNienKhoa.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa niên khóa thành công");
                setDeletingNienKhoa(null);
                fetchNienKhoas(currentPage, searchKeyword);
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        }
    };

    const openEditModal = (nienKhoa: NienKhoa) => {
        setEditingNienKhoa(nienKhoa);
        setMaNienKhoa(nienKhoa.maNienKhoa);
        setTenNienKhoa(nienKhoa.tenNienKhoa);
        setNamBatDau(nienKhoa.namBatDau.toString());
        setNamKetThuc(nienKhoa.namKetThuc.toString());
        setMoTa(nienKhoa.moTa || "");
        setIsEditModalOpen(true);
    };

    const DeleteConfirmModal = () => (
        <div className="p-6 sm:p-8 max-w-md w-full">
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác nhận xóa niên khóa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                Bạn có chắc chắn muốn xóa niên khóa{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                    {deletingNienKhoa?.tenNienKhoa}
                </span>{" "}
                (mã: {deletingNienKhoa?.maNienKhoa})?
                Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeletingNienKhoa(null);
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
            <PageBreadcrumb pageTitle="Quản lý Niên khóa" />

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
                    <div className="hidden lg:block w-full lg:max-w-md">
                        <div className="relative">
                            <button
                                onClick={handleSearch}
                                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
                            >
                                <FontAwesomeIcon
                                    icon={faMagnifyingGlass}
                                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                    aria-hidden="true"
                                />
                            </button>
                            <input
                                type="text"
                                placeholder="Tìm kiếm niên khóa..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            resetForm();
                            setIsCreateModalOpen(true);
                        }}
                    >
                        Tạo mới Niên khóa
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[900px]">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[10%_20%_13%_13%_30%_10%]">
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Mã Niên khóa
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Tên Niên khóa
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Năm bắt đầu
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">
                                            Năm kết thúc
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
                                    {nienKhoas.map((nk) => (
                                        <TableRow key={nk.id} className="grid grid-cols-[10%_20%_13%_13%_30%_10%] items-center">
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {nk.maNienKhoa}
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                {nk.tenNienKhoa}
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge variant="solid" color="primary">
                                                    {nk.namBatDau}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <Badge variant="solid" color="primary">
                                                    {nk.namKetThuc}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                <div
                                                    className="max-w-[180px] truncate overflow-hidden text-ellipsis whitespace-nowrap"
                                                    title={nk.moTa || ""}
                                                >
                                                    {nk.moTa || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-5 py-4">
                                                <div className="flex gap-2 justify-center">
                                                    <Button size="sm" variant="primary" onClick={() => openEditModal(nk)}>
                                                        Sửa
                                                    </Button>
                                                    <Button size="sm" variant="primary" onClick={() => openDeleteModal(nk)}>
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
            <NienKhoaModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                    setEditingNienKhoa(null);
                }}
                isEdit={isEditModalOpen}
                maNienKhoa={maNienKhoa}
                tenNienKhoa={tenNienKhoa}
                namBatDau={namBatDau}
                namKetThuc={namKetThuc}
                moTa={moTa}
                onMaNienKhoaChange={setMaNienKhoa}
                onTenNienKhoaChange={setTenNienKhoa}
                onNamBatDauChange={setNamBatDau}
                onNamKetThucChange={setNamKetThuc}
                onMoTaChange={setMoTa}
                onSubmit={isEditModalOpen ? handleUpdate : handleCreate}
                errors={errors}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingNienKhoa(null);
                }}
                className="max-w-md"
            >
                <DeleteConfirmModal />
            </Modal>
        </div>
    );
}