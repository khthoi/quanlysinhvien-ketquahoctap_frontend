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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface Khoa {
  id: number;
  maKhoa: string;
  tenKhoa: string;
  moTa:  string;
  ngayThanhLap: string;
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
        <span className="font-medium text-gray-700 dark: text-gray-300">
          {total}
        </span>
        {" "}kết quả
      </span>
    </div>
  );
};

// ==================== KHOA MODAL - COMPONENT RIÊNG, ỔN ĐỊNH ====================
interface KhoaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit: boolean;
  maKhoa: string;
  tenKhoa: string;
  moTa: string;
  selectedDate: string;
  onMaKhoaChange: (value: string) => void;
  onTenKhoaChange: (value: string) => void;
  onMoTaChange: (value: string) => void;
  onDateChange: (date:  string) => void;
  onSubmit: () => void;
  errors: {
    maKhoa: boolean;
    tenKhoa: boolean;
    moTa: boolean;
    ngayThanhLap: boolean;
  };
}

const KhoaModal: React.FC<KhoaModalProps> = ({
  isOpen,
  onClose,
  isEdit,
  maKhoa,
  tenKhoa,
  moTa,
  selectedDate,
  onMaKhoaChange,
  onTenKhoaChange,
  onMoTaChange,
  onDateChange,
  onSubmit,
  errors,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6 sm:p-8">
        <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {isEdit ? "Sửa Khoa" : "Tạo mới Khoa"}
        </h3>
        <div className="space-y-5">
          <div>
            <Label>Mã Khoa</Label>
            <Input
              defaultValue={maKhoa}
              onChange={(e) => onMaKhoaChange(e.target.value)}
              error={errors.maKhoa}
              hint={errors.maKhoa ? "Mã khoa không được để trống" : ""}
            />
          </div>
          <div>
            <Label>Tên Khoa</Label>
            <Input
              defaultValue={tenKhoa}
              onChange={(e) => onTenKhoaChange(e.target. value)}
              error={errors.tenKhoa}
              hint={errors.tenKhoa ? "Tên khoa không được để trống" : ""}
            />
          </div>
          <div>
            <Label>Mô tả</Label>
            <TextArea
              placeholder="Nhập mô tả cho khoa"
              rows={4}
              defaultValue={moTa}
              onChange={onMoTaChange}
              error={errors.moTa}
              hint={errors.moTa ? "Mô tả không được để trống" :  ""}
            />
          </div>
          <div>
            <Label>Ngày thành lập</Label>
            <DatePicker
              id={isEdit ? "edit-ngayThanhLap" : "create-ngayThanhLap"}
              defaultDate={selectedDate}
              onChange={([date]:  any) => {
                if (date) {
                  const formatted = date.toISOString().split("T")[0];
                  onDateChange(formatted);
                } else {
                  onDateChange("");
                }
              }}
            />
            {errors.ngayThanhLap && (
              <p className="mt-1 text-sm text-error-500">
                Ngày thành lập không được để trống
              </p>
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

// ==================== TRANG CHÍNH QUẢN LÝ KHOA ====================
export default function QuanLyKhoaPage() {
  const [khoas, setKhoas] = useState<Khoa[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total:  0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingKhoa, setDeletingKhoa] = useState<Khoa | null>(null);
  const [editingKhoa, setEditingKhoa] = useState<Khoa | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  // State riêng cho form
  const [maKhoa, setMaKhoa] = useState("");
  const [tenKhoa, setTenKhoa] = useState("");
  const [moTa, setMoTa] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [errors, setErrors] = useState({
    maKhoa: false,
    tenKhoa: false,
    moTa: false,
    ngayThanhLap: false,
  });

  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const fetchKhoas = async (page: number = 1, keyword: string = "") => {
    try {
      const accessToken = getCookie("access_token");
      const searchParam = keyword ? `&search=${encodeURIComponent(keyword)}` : "";
      const res = await fetch(
        `http://localhost:3000/danh-muc/khoa?page=${page}&limit=10${searchParam}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const json = await res.json();
      if (json.data) {
        setKhoas(json. data);
        setPagination(json.pagination);
        setCurrentPage(json.pagination.page);
      }
    } catch (err) {
      showAlert("error", "Lỗi", "Không thể tải danh sách khoa");
    }
  };

  useEffect(() => {
    fetchKhoas(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    fetchKhoas(1, searchKeyword. trim());
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
    setMaKhoa("");
    setTenKhoa("");
    setMoTa("");
    setSelectedDate("");
    setErrors({ maKhoa:  false, tenKhoa: false, moTa: false, ngayThanhLap: false });
  };

  const handleCreate = async () => {

    try {
      const accessToken = getCookie("access_token");
      const res = await fetch("http://localhost:3000/danh-muc/khoa", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          maKhoa: maKhoa.trim(),
          tenKhoa: tenKhoa.trim(),
          moTa: moTa. trim(),
          ngayThanhLap: selectedDate,
        }),
      });

      setIsCreateModalOpen(false);
      if (res.ok) {
        showAlert("success", "Thành công", "Tạo mới khoa thành công");
        resetForm();
        fetchKhoas(currentPage);
      } else {
        const err = await res.json();
        showAlert("error", "Lỗi", err.message || "Tạo mới thất bại");
      }
    } catch (err) {
      setIsCreateModalOpen(false);
      showAlert("error", "Lỗi", "Có lỗi xảy ra khi tạo khoa");
    }
  };

  const handleUpdate = async () => {
    if (!editingKhoa) return;

    try {
      const accessToken = getCookie("access_token");
      const res = await fetch(
        `http://localhost:3000/danh-muc/khoa/${editingKhoa.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            maKhoa: maKhoa.trim(),
            tenKhoa: tenKhoa.trim(),
            moTa:  moTa.trim(),
            ngayThanhLap:  selectedDate,
          }),
        }
      );

      setIsEditModalOpen(false);
      if (res.ok) {
        showAlert("success", "Thành công", "Cập nhật khoa thành công");
        resetForm();
        fetchKhoas(currentPage);
      } else {
        const err = await res.json();
        showAlert("error", "Lỗi", err. message || "Cập nhật thất bại");
      }
    } catch (err) {
      setIsEditModalOpen(false);
      showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
    }
  };

  const openDeleteModal = (khoa: Khoa) => {
    setDeletingKhoa(khoa);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (! deletingKhoa) return;

    try {
      const accessToken = getCookie("access_token");
      const res = await fetch(`http://localhost:3000/danh-muc/khoa/${deletingKhoa.id}`, {
        method:  "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setIsDeleteModalOpen(false);
      if (res.ok) {
        showAlert("success", "Thành công", "Xóa khoa thành công");
        setDeletingKhoa(null);
        fetchKhoas(currentPage);
      } else {
        const err = await res. json();
        showAlert("error", "Lỗi", err.message || "Xóa thất bại");
      }
    } catch (err) {
      setIsDeleteModalOpen(false);
      showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
    }
  };

  const openEditModal = (khoa: Khoa) => {
    setEditingKhoa(khoa);
    setMaKhoa(khoa.maKhoa);
    setTenKhoa(khoa. tenKhoa);
    setMoTa(khoa.moTa);
    setSelectedDate(khoa.ngayThanhLap);
    setIsEditModalOpen(true);
  };

  const DeleteConfirmModal = () => (
    <div className="p-6 sm: p-8 max-w-md w-full">
      <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
        Xác nhận xóa khoa
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
        Bạn có chắc chắn muốn xóa khoa{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {deletingKhoa?.tenKhoa}
        </span>{" "}
        với mã khoa{" "}
        <span className="font-semibold text-gray-900 dark:text-white">
          {deletingKhoa?.maKhoa}
        </span>
        ?  Hành động này không thể hoàn tác. 
      </p>
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setDeletingKhoa(null);
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

  function formatDateVN(dateInput: string | Date): string {
    if (! dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const day = String(date. getDate()).padStart(2, "0");
    const month = String(date. getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Khoa" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {alert && (
          <div className="mb-6">
            <Alert
              variant={alert. variant}
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
                onClick={() => handleSearch()}
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
                placeholder="Tìm kiếm khoa..."
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
            Tạo mới Khoa
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow className="grid grid-cols-[10%_25%_30%_15%_20%]">
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">Mã Khoa</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">Tên Khoa</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">Mô tả</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">Ngày thành lập</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-theme-xs">Hành động</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm text-center">
                  {khoas.map((khoa) => (
                    <TableRow key={khoa.id} className="grid grid-cols-[10%_25%_30%_15%_20%] items-center">
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {khoa.maKhoa}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {khoa.tenKhoa}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        <div
                          className="max-w-[220px] truncate overflow-hidden 
             text-ellipsis whitespace-nowrap cursor-pointer"
                          title={khoa.moTa}
                        >
                          {khoa.moTa}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 dark: text-gray-400">
                        {formatDateVN(khoa.ngayThanhLap)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" variant="primary" onClick={() => openEditModal(khoa)}>
                            Sửa
                          </Button>
                          <Button size="sm" variant="primary" onClick={() => openDeleteModal(khoa)}>
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

      {/* Modal Tạo mới */}
      <KhoaModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        isEdit={false}
        maKhoa={maKhoa}
        tenKhoa={tenKhoa}
        moTa={moTa}
        selectedDate={selectedDate}
        onMaKhoaChange={setMaKhoa}
        onTenKhoaChange={setTenKhoa}
        onMoTaChange={setMoTa}
        onDateChange={setSelectedDate}
        onSubmit={handleCreate}
        errors={errors}
      />

      {/* Modal Sửa */}
      <KhoaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
          setEditingKhoa(null);
        }}
        isEdit={true}
        maKhoa={maKhoa}
        tenKhoa={tenKhoa}
        moTa={moTa}
        selectedDate={selectedDate}
        onMaKhoaChange={setMaKhoa}
        onTenKhoaChange={setTenKhoa}
        onMoTaChange={setMoTa}
        onDateChange={setSelectedDate}
        onSubmit={handleUpdate}
        errors={errors}
      />

      {/* Modal Xóa */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingKhoa(null);
        }}
        className="max-w-md"
      >
        <DeleteConfirmModal />
      </Modal>
    </div>
  );
}