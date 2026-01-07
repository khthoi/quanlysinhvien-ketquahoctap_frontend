"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Pagination from "../tables/Pagination";
import { Modal } from "@/components/ui/modal"; // Điều chỉnh path nếu cần
import Select from "../form/Select";

interface Product {
  id: number;
  name: string;
  variants: string;
  category: string;
  price: string;
  status: "Delivered" | "Pending" | "Canceled";
  image: string;
}

// Dữ liệu giả lập (5 items hiện tại)
const rawData: Product[] = [
  {
    id: 1,
    name: "MacBook Pro 13”",
    variants: "2 Variants",
    category: "Laptop",
    price: "$2399.00",
    status: "Delivered",
    image: "/images/product/product-01.jpg",
  },
  {
    id: 2,
    name: "Apple Watch Ultra",
    variants: "1 Variant",
    category: "Watch",
    price: "$879.00",
    status: "Pending",
    image: "/images/product/product-02.jpg",
  },
  {
    id: 3,
    name: "iPhone 15 Pro Max",
    variants: "2 Variants",
    category: "SmartPhone",
    price: "$1869.00",
    status: "Delivered",
    image: "/images/product/product-03.jpg",
  },
  {
    id: 4,
    name: "iPad Pro 3rd Gen",
    variants: "2 Variants",
    category: "Electronics",
    price: "$1699.00",
    status: "Canceled",
    image: "/images/product/product-04.jpg",
  },
  {
    id: 5,
    name: "AirPods Pro 2nd Gen",
    variants: "1 Variant",
    category: "Accessories",
    price: "$240.00",
    status: "Delivered",
    image: "/images/product/product-05.jpg",
  },
];

export default function RecentOrders() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedKhoa, setSelectedKhoa] = useState<any>(null);
  const [selectedNganh, setSelectedNganh] = useState<any>(null);
  const [selectedMonHoc, setSelectedMonHoc] = useState<any>(null);
  const [selectedGiangVien, setSelectedGiangVien] = useState<any>(null);
  const [selectedNienKhoa, setSelectedNienKhoa] = useState<any>(null);
  const [selectedHocKy, setSelectedHocKy] = useState<any>(null);

  // Pagination state (giả lập)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = 50; // Giả lập tổng số đơn hàng
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Dữ liệu hiển thị theo trang (ở đây dùng rawData lặp lại để demo)
  const displayedData = rawData; // Thực tế sẽ slice theo page

  const khoaList = [
    { id: 1, name: "Khoa Công Nghệ Thông Tin" },
    { id: 2, name: "Khoa Kinh Tế" },
    { id: 3, name: "Khoa Kỹ Thuật" },
  ];

  const nganhByKhoa: Record<number, any[]> = {
    1: [
      { id: 1, name: "Công nghệ thông tin" },
      { id: 2, name: "Hệ thống thông tin" },
    ],
    2: [
      { id: 3, name: "Kinh tế học" },
      { id: 4, name: "Quản trị kinh doanh" },
    ],
    3: [
      { id: 5, name: "Kỹ thuật cơ khí" },
      { id: 6, name: "Kỹ thuật điện" },
    ],
  };

  const monHocList = [
    { id: 1, name: "Lập trình Web" },
    { id: 2, name: "Cơ sở dữ liệu" },
    { id: 3, name: "Toán cao cấp" },
  ];

  const giangVienList = [
    { id: 1, name: "TS. Nguyễn Văn A" },
    { id: 2, name: "TS. Trần Thị B" },
    { id: 3, name: "ThS. Phạm Văn C" },
  ];

  const nienKhoaList = [
    { id: 1, name: "K2025" },
    { id: 2, name: "K2024" },
    { id: 3, name: "K2023" },
  ];

  const hocKyList = [
    { id: 1, name: "Học kỳ 1" },
    { id: 2, name: "Học kỳ 2" },
    { id: 3, name: "Học kỳ hè" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Orders
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
            Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>

      {/* Filter Modal - Dùng component Modal của bạn */}
      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Lọc dữ liệu
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Chọn các tiêu chí để lọc danh sách đơn hàng
          </p>

          <div className="space-y-5">
            {/* Khoa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Khoa
              </label>
              <Select
                options={[
                  ...khoaList.map((k) => ({ value: k.id.toString(), label: k.name })),
                ]}
                placeholder="-- Chọn khoa --"
                placeholderDisabled={false}
                onChange={(value) => {
                  const khoa = khoaList.find((k) => k.id === Number(value)) || null;
                  setSelectedKhoa(khoa);
                  setSelectedNganh(null);
                }}
                defaultValue={selectedKhoa?.id?.toString() || ""}
              />
            </div>

            {/* Ngành - disabled nếu chưa chọn khoa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngành
              </label>
              <Select
                options={[
                  ...(selectedKhoa
                    ? nganhByKhoa[selectedKhoa.id]?.map((n) => ({
                        value: n.id.toString(),
                        label: n.name,
                      })) || []
                    : []),
                ]}
                placeholder="-- Chọn ngành --"
                placeholderDisabled={false}
                onChange={(value) => {
                  const nganh =
                    nganhByKhoa[selectedKhoa?.id]?.find((n) => n.id === Number(value)) || null;
                  setSelectedNganh(nganh);
                }}
                defaultValue={selectedNganh?.id?.toString() || ""}
                disabled={!selectedKhoa}
              />
            </div>

            {/* Các field khác */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Môn học
              </label>
              <Select
                options={[
                  ...monHocList.map((m) => ({ value: m.id.toString(), label: m.name })),
                ]}
                placeholder="-- Chọn môn học --"
                placeholderDisabled={false}
                onChange={(value) =>
                  setSelectedMonHoc(monHocList.find((m) => m.id === Number(value)) || null)
                }
                defaultValue={selectedMonHoc?.id?.toString() || ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Giảng viên
              </label>
              <Select
              options={[
                ...giangVienList.map((g) => ({ value: g.id.toString(), label: g.name })),
              ]}
              placeholder="-- Chọn giảng viên --"
              placeholderDisabled={false}
              onChange={(value: string) =>
                setSelectedGiangVien(giangVienList.find((g) => g.id === Number(value)) || null)
              }
              defaultValue={selectedGiangVien?.id?.toString() || ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Niên khóa
              </label>
              <Select
                options={[
                  ...nienKhoaList.map((n) => ({ value: n.id.toString(), label: n.name })),
                ]}
                placeholder="--Chọn niên khoá--"
                placeholderDisabled={false}
                onChange={(value) =>
                  setSelectedNienKhoa(nienKhoaList.find((n) => n.id === Number(value)) || null)
                }
                defaultValue={selectedNienKhoa?.id?.toString() || ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Học kỳ
              </label>
              <Select
                options={[
                  ...hocKyList.map((h) => ({ value: h.id.toString(), label: h.name })),
                ]}
                placeholder="-- Chọn học kỳ --"
                placeholderDisabled={false}
                onChange={(value) =>
                  setSelectedHocKy(hocKyList.find((h) => h.id === Number(value)) || null)
                }
                defaultValue={selectedHocKy?.id?.toString() || ""}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                console.log("Áp dụng filter:", {
                  khoa: selectedKhoa,
                  nganh: selectedNganh,
                  monHoc: selectedMonHoc,
                  giangVien: selectedGiangVien,
                  nienKhoa: selectedNienKhoa,
                  hocKy: selectedHocKy,
                });
                setIsFilterOpen(false);
                // TODO: Gọi API lọc dữ liệu thật ở đây
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </Modal>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Products
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayedData.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {product.name}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {product.variants}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.category}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {product.price}
                </TableCell>
                <TableCell className="py-3">
                  <Badge
                    size="sm"
                    color={
                      product.status === "Delivered"
                        ? "success"
                        : product.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} của {totalItems} kết quả
        </p>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}