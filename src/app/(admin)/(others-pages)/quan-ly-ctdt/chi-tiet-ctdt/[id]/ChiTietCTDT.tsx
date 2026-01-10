"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    faArrowLeft,
    faMagnifyingGlassPlus,
    faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/form/SelectCustom";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Checkbox from "@/components/form/input/Checkbox";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";

// ==================== INTERFACES ====================
interface Nganh {
    id: number;
    maNganh: string;
    tenNganh: string;
    moTa: string | null;
}

interface NienKhoa {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    moTa: string;
}

interface ApDung {
    nienKhoa: NienKhoa;
    ngayApDung: string;
    ghiChu: string | null;
}

interface MonHoc {
    id: number;
    maMonHoc: string;
    tenMonHoc: string;
    loaiMon: "CHUYEN_NGANH" | "DAI_CUONG" | "TU_CHON";
    soTinChi: number;
    moTa: string;
}

interface MonHocCTDT {
    id: number;
    thuTuHocKy: number;
    monHoc: MonHoc;
    ghiChu: string | null;
}

interface ChuongTrinh {
    id: number;
    maChuongTrinh: string;
    tenChuongTrinh: string;
    thoiGianDaoTao: number;
    nganh: Nganh;
}

// Thêm sau interface ChuongTrinhResponse
interface LopHocPhan {
    id: number;
    maLopHocPhan: string;
    monHoc: string; // Mã môn học
    hocKy: string;
    nienKhoa: string;
    giangVien: string;
    siSo: number;
    khoaDiem: boolean;
}

interface GiangVien {
    id: number;
    maGiangVien: string;
    hoTen: string;
    email: string;
    sdt: string;
}

interface HocKy {
    id: number;
    hocKy: number;
    ngayBatDau: string;
    ngayKetThuc: string;
}

interface NamHoc {
    id: number;
    maNamHoc: string;
    tenNamHoc: string;
    namBatDau: number;
    namKetThuc: number;
    hocKys: HocKy[];
}

// Cập nhật interface ChuongTrinhResponse
interface ChuongTrinhResponse {
    message: string;
    chuongTrinh: ChuongTrinh;
    apDung: ApDung[];
    monHocs: MonHocCTDT[];
    lopHocPhans: LopHocPhan[]; // Thêm mới
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

// ==================== THÊM MÔN HỌC MODAL ====================
interface ThemMonHocModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        thuTuHocKy: string;
        monHocId: string;
        ghiChu: string;
    };
    monHocOptions: MonHoc[];
    monHocPagination: PaginationData;
    monHocSearchKeyword: string;
    monHocFilterLoaiMon: string;
    onMonHocSearch: (search: string) => void;
    onMonHocFilterLoaiMon: (loaiMon: string) => void;
    onMonHocLoadMore: () => void;
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        thuTuHocKy: boolean;
        monHocId: boolean;
    };
    thoiGianDaoTao: number;
}

const ThemMonHocModal: React.FC<ThemMonHocModalProps> = ({
    isOpen,
    onClose,
    formData,
    monHocOptions,
    monHocFilterLoaiMon,
    onMonHocFilterLoaiMon,
    onFormChange,
    onSubmit,
    errors,
    thoiGianDaoTao,
}) => {

    if (!isOpen) return null;

    const loaiMonOptions = [
        { value: "", label: "Tất cả loại môn" },
        { value: "DAI_CUONG", label: "Đại cương" },
        { value: "CHUYEN_NGANH", label: "Chuyên ngành" },
        { value: "TU_CHON", label: "Tự chọn" },
    ];

    // Tạo options cho học kỳ dựa trên thời gian đào tạo
    const hocKyOptions = [];
    for (let i = 1; i <= thoiGianDaoTao * 2; i++) {
        hocKyOptions.push({ value: i.toString(), label: `Học kỳ ${i}` });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Thêm Môn học vào Chương trình
                </h3>
                <div className="space-y-5">
                    {/* Thứ tự Học kỳ */}
                    <div>
                        <Label>Thứ tự Học kỳ</Label>
                        <SearchableSelect
                            options={hocKyOptions}
                            placeholder="Chọn học kỳ"
                            onChange={(value) => onFormChange("thuTuHocKy", value)}
                            defaultValue={formData.thuTuHocKy}
                            showSecondary={false}
                        />
                        {errors.thuTuHocKy && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn học kỳ
                            </p>
                        )}
                    </div>

                    {/* Lọc loại môn */}
                    <div>
                        <Label>Lọc theo loại môn</Label>
                        <SearchableSelect
                            options={loaiMonOptions}
                            placeholder="Tất cả loại môn"
                            onChange={(value) => onMonHocFilterLoaiMon(value)}
                            defaultValue={monHocFilterLoaiMon}
                            showSecondary={false}
                        />
                    </div>

                    {/* Chọn Môn học */}
                    <div>
                        <Label>Môn học</Label>
                        <SearchableSelect
                            options={monHocOptions.map((m) => ({
                                value: m.id.toString(),
                                label: m.maMonHoc,
                                secondary: `${m.tenMonHoc} (${m.soTinChi} TC - ${getLoaiMonLabel(m.loaiMon)})`,
                            }))}
                            placeholder="Chọn môn học"
                            onChange={(value) => onFormChange("monHocId", value)}
                            defaultValue={formData.monHocId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm trong danh sách..."
                        />
                        {errors.monHocId && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn môn học
                            </p>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <Label>Ghi chú</Label>
                        <TextArea
                            placeholder="Nhập ghi chú (tùy chọn)"
                            rows={3}
                            defaultValue={formData.ghiChu}
                            onChange={(value) => onFormChange("ghiChu", value)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        Thêm mới
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== SỬA MÔN HỌC MODAL ====================
interface SuaMonHocModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        thuTuHocKy: string;
        ghiChu: string;
    };
    monHocInfo: MonHocCTDT | null;
    onFormChange: (field: string, value: string) => void;
    onSubmit: () => void;
    errors: {
        thuTuHocKy: boolean;
    };
    thoiGianDaoTao: number;
}

const SuaMonHocModal: React.FC<SuaMonHocModalProps> = ({
    isOpen,
    onClose,
    formData,
    monHocInfo,
    onFormChange,
    onSubmit,
    errors,
    thoiGianDaoTao,
}) => {
    if (!isOpen) return null;

    // Tạo options cho học kỳ dựa trên thời gian đào tạo
    const hocKyOptions = [];
    for (let i = 1; i <= thoiGianDaoTao * 2; i++) {
        hocKyOptions.push({ value: i.toString(), label: `Học kỳ ${i}` });
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark: text-white/90">
                    Sửa Môn học trong Chương trình
                </h3>

                {/* Thông tin môn học */}
                {monHocInfo && (
                    <div>
                        <Label>Môn học</Label>
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">
                                        {monHocInfo.monHoc.maMonHoc} - {monHocInfo.monHoc.tenMonHoc}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <Label>Loại môn học</Label>
                            <div className="mt-2">
                                <Badge variant="solid" color={getLoaiMonColor(monHocInfo.monHoc.loaiMon)}>
                                    {getLoaiMonLabel(monHocInfo.monHoc.loaiMon)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}


                <div className="space-y-5">
                    {/* Thứ tự Học kỳ */}
                    <div>
                        <Label>Thứ tự Học kỳ</Label>
                        <SearchableSelect
                            options={hocKyOptions}
                            placeholder="Chọn học kỳ"
                            onChange={(value) => onFormChange("thuTuHocKy", value)}
                            defaultValue={formData.thuTuHocKy}
                            showSecondary={false}
                        />
                        {errors.thuTuHocKy && (
                            <p className="mt-1 text-sm text-error-500">
                                Vui lòng chọn học kỳ
                            </p>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <Label>Ghi chú</Label>
                        <TextArea
                            placeholder="Nhập ghi chú (tùy chọn)"
                            rows={3}
                            defaultValue={formData.ghiChu}
                            onChange={(value) => onFormChange("ghiChu", value)}
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        Cập nhật
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== MODAL XEM LỚP HỌC PHẦN ====================
interface XemLopHocPhanModalProps {
    isOpen: boolean;
    onClose: () => void;
    monHocInfo: MonHocCTDT | null;
    lopHocPhans: LopHocPhan[];
}

const XemLopHocPhanModal: React.FC<XemLopHocPhanModalProps> = ({
    isOpen,
    onClose,
    monHocInfo,
    lopHocPhans,
}) => {
    if (!isOpen || !monHocInfo) return null;

    // Lọc các lớp học phần theo mã môn học
    const filteredLopHocPhans = lopHocPhans.filter(
        (lhp) => lhp.monHoc === monHocInfo.monHoc.maMonHoc
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Danh sách Lớp học phần
                </h3>

                {/* Thông tin môn học */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mã môn học</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                                {monHocInfo.monHoc.maMonHoc}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tên môn học</p>
                            <p className="font-semibold text-gray-800 dark: text-white">
                                {monHocInfo.monHoc.tenMonHoc}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loại môn</p>
                            <Badge variant="solid" color={getLoaiMonColor(monHocInfo.monHoc.loaiMon)}>
                                {getLoaiMonLabel(monHocInfo.monHoc.loaiMon)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Table lớp học phần */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow className="grid grid-cols-[23%_20%_15%_20%_10%_12%]">
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">
                                        Mã LHP
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">
                                        Học kỳ
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                                        Niên khóa
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">
                                        Giảng viên
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                                        Sĩ số
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">
                                        Trạng thái
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                {filteredLopHocPhans.length === 0 ? (
                                    <TableRow>
                                        <TableCell cols={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Chưa có lớp học phần nào cho môn học này
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLopHocPhans.map((lhp) => (
                                        <TableRow
                                            key={lhp.id}
                                            className="grid grid-cols-[23%_20%_15%_20%_10%_12%] items-center"
                                        >
                                            <TableCell className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                                                <span className="truncate block max-w-[140px]" title={lhp.maLopHocPhan}>
                                                    {lhp.maLopHocPhan}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                <span className="text-sm truncate block max-w-[140px]" title={lhp.hocKy}>
                                                    {lhp.hocKy}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <Badge variant="solid" color="primary">
                                                    {lhp.nienKhoa}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {lhp.giangVien}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center text-gray-800 dark:text-white/90">
                                                {lhp.siSo}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <Badge variant="solid" color={lhp.khoaDiem ? "error" : "success"}>
                                                    {lhp.khoaDiem ? "Đã khóa điểm" : "Mở"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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

// ==================== MODAL THÊM LỚP HỌC PHẦN ====================
interface ThemLopHocPhanModalProps {
    isOpen: boolean;
    onClose: () => void;
    monHocInfo: MonHocCTDT | null;
    nganhInfo: Nganh | null;
    apDungNienKhoas: ApDung[];
    giangVienOptions: GiangVien[];
    namHocOptions: NamHoc[];
    selectedNamHocId: string;
    onNamHocChange: (value: string) => void;
    onGiangVienSearch: (search: string) => void;
    onNamHocSearch: (search: string) => void;
    formData: {
        maLopHocPhan: string;
        giangVienId: string;
        hocKyId: string;
        nienKhoaId: string;
        ghiChu: string;
        khoaDiem: boolean;
    };
    onFormChange: (field: string, value: string | boolean) => void;
    onSubmit: () => void;
    errors: {
        maLopHocPhan: boolean;
        giangVienId: boolean;
        hocKyId: boolean;
        nienKhoaId: boolean;
    };
}

const ThemLopHocPhanModal: React.FC<ThemLopHocPhanModalProps> = ({
    isOpen,
    onClose,
    monHocInfo,
    nganhInfo,
    apDungNienKhoas,
    giangVienOptions,
    namHocOptions,
    selectedNamHocId,
    onNamHocChange,
    onGiangVienSearch,
    onNamHocSearch,
    formData,
    onFormChange,
    onSubmit,
    errors,
}) => {
    const [giangVienSearchKeyword, setGiangVienSearchKeyword] = useState("");
    const [namHocSearchKeyword, setNamHocSearchKeyword] = useState("");

    if (!isOpen || !monHocInfo) return null;

    // Lấy danh sách học kỳ từ năm học được chọn
    const selectedNamHoc = namHocOptions.find((nh) => nh.id.toString() === selectedNamHocId);
    const hocKyOptions = selectedNamHoc?.hocKys || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Thêm Lớp học phần
                </h3>

                <div className="space-y-5">
                    {/* Thông tin môn học (readonly) */}
                    <div>
                        <Label>Môn học</Label>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="font-medium text-gray-800 dark: text-white">
                                {monHocInfo.monHoc.maMonHoc} - {monHocInfo.monHoc.tenMonHoc}
                            </p>
                            <div className="mt-2">
                                <Badge variant="solid" color={getLoaiMonColor(monHocInfo.monHoc.loaiMon)}>
                                    {getLoaiMonLabel(monHocInfo.monHoc.loaiMon)} • {monHocInfo.monHoc.soTinChi} TC
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Ngành (readonly) */}
                    <div>
                        <Label>Ngành</Label>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="font-medium text-gray-800 dark:text-white">
                                {nganhInfo?.maNganh} - {nganhInfo?.tenNganh}
                            </p>
                        </div>
                    </div>

                    {/* Mã lớp học phần */}
                    <div>
                        <Label>Mã lớp học phần</Label>
                        <Input
                            placeholder="VD: LHP001"
                            defaultValue={formData.maLopHocPhan}
                            onChange={(e) => onFormChange("maLopHocPhan", e.target.value)}
                            error={errors.maLopHocPhan}
                            hint={errors.maLopHocPhan ? "Mã lớp học phần không được để trống" : ""}
                        />
                    </div>

                    {/* Niên khóa */}
                    <div>
                        <Label>Niên khóa</Label>
                        <SearchableSelect
                            options={apDungNienKhoas.map((ad) => ({
                                value: ad.nienKhoa.id.toString(),
                                label: ad.nienKhoa.maNienKhoa,
                                secondary: ad.nienKhoa.tenNienKhoa,
                            }))}
                            placeholder="Chọn niên khóa"
                            onChange={(value) => onFormChange("nienKhoaId", value)}
                            defaultValue={formData.nienKhoaId}
                            showSecondary={true}
                        />
                        {errors.nienKhoaId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn niên khóa</p>
                        )}
                    </div>

                    {/* Năm học */}
                    <div>
                        <Label>Năm học</Label>
                        <SearchableSelect
                            options={namHocOptions.map((nh) => ({
                                value: nh.id.toString(),
                                label: nh.maNamHoc,
                                secondary: nh.tenNamHoc,
                            }))}
                            placeholder="Chọn năm học"
                            onChange={(value) => {
                                onNamHocChange(value);
                                onFormChange("hocKyId", ""); // Reset học kỳ khi đổi năm học
                            }}
                            defaultValue={selectedNamHocId}
                            showSecondary={true}
                        />
                    </div>

                    {/* Học kỳ */}
                    <div>
                        <Label>Học kỳ</Label>
                        <SearchableSelect
                            options={hocKyOptions.map((hk) => ({
                                value: hk.id.toString(),
                                label: `Học kỳ ${hk.hocKy}`,
                                secondary: `${formatDateVN(hk.ngayBatDau)} - ${formatDateVN(hk.ngayKetThuc)}`,
                            }))}
                            placeholder={selectedNamHocId ? "Chọn học kỳ" : "Vui lòng chọn năm học trước"}
                            onChange={(value) => onFormChange("hocKyId", value)}
                            defaultValue={formData.hocKyId}
                            showSecondary={true}
                            disabled={!selectedNamHocId || hocKyOptions.length === 0}
                        />
                        {errors.hocKyId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn học kỳ</p>
                        )}
                        {selectedNamHocId && hocKyOptions.length === 0 && (
                            <p className="mt-1 text-sm text-warning-500">Năm học này chưa có học kỳ nào</p>
                        )}
                    </div>

                    {/* Giảng viên */}
                    <div>
                        <Label>Giảng viên</Label>
                        <SearchableSelect
                            options={giangVienOptions.map((gv) => ({
                                value: gv.id.toString(),
                                label: gv.maGiangVien,
                                secondary: gv.hoTen,
                            }))}
                            placeholder="Chọn giảng viên"
                            onChange={(value) => onFormChange("giangVienId", value)}
                            defaultValue={formData.giangVienId}
                            showSecondary={true}
                            maxDisplayOptions={10}
                        />
                        {errors.giangVienId && (
                            <p className="mt-1 text-sm text-error-500">Vui lòng chọn giảng viên</p>
                        )}
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <Label>Ghi chú</Label>
                        <TextArea
                            placeholder="Nhập ghi chú (tùy chọn)"
                            rows={3}
                            defaultValue={formData.ghiChu}
                            onChange={(value) => onFormChange("ghiChu", value)}
                        />
                    </div>

                    {/* Khóa điểm */}
                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="khoaDiem"
                            checked={formData.khoaDiem}
                            onChange={(checked) => onFormChange("khoaDiem", checked)}
                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                        />
                        <Label htmlFor="khoaDiem" className="mb-0 cursor-pointer">
                            Khóa điểm
                        </Label>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSubmit}>
                        Thêm mới
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ==================== TRANG CHÍNH QUẢN LÝ MÔN HỌC CHƯƠNG TRÌNH ====================
export default function QuanLyMonHocChuongTrinhPage() {
    const params = useParams();
    const router = useRouter();
    const chuongTrinhId = params?.id as string;

    // State cho dữ liệu chính
    const [chuongTrinh, setChuongTrinh] = useState<ChuongTrinhResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State cho filter niên khóa hiển thị
    const [selectedNienKhoaId, setSelectedNienKhoaId] = useState("");

    // State cho danh sách môn học options
    const [monHocOptions, setMonHocOptions] = useState<MonHoc[]>([]);
    const [monHocPagination, setMonHocPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
    });
    const [monHocSearchKeyword, setMonHocSearchKeyword] = useState("");
    const [monHocFilterLoaiMon, setMonHocFilterLoaiMon] = useState("");

    // State cho modals
    const [isThemModalOpen, setIsThemModalOpen] = useState(false);
    const [isSuaModalOpen, setIsSuaModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingChiTiet, setEditingChiTiet] = useState<MonHocCTDT | null>(null);
    const [deletingChiTiet, setDeletingChiTiet] = useState<MonHocCTDT | null>(null);

    // State cho form thêm
    const [themFormData, setThemFormData] = useState({
        thuTuHocKy: "",
        monHocId: "",
        ghiChu: "",
    });

    // State cho form sửa
    const [suaFormData, setSuaFormData] = useState({
        thuTuHocKy: "",
        ghiChu: "",
    });

    // State cho errors
    const [themErrors, setThemErrors] = useState({
        thuTuHocKy: false,
        monHocId: false,
    });

    const [suaErrors, setSuaErrors] = useState({
        thuTuHocKy: false,
    });

    const [alert, setAlert] = useState<{
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // State cho modal xem lớp học phần
    const [isXemLopHocPhanModalOpen, setIsXemLopHocPhanModalOpen] = useState(false);
    const [selectedMonHocForLopHocPhan, setSelectedMonHocForLopHocPhan] = useState<MonHocCTDT | null>(null);

    // State cho modal thêm lớp học phần
    const [isThemLopHocPhanModalOpen, setIsThemLopHocPhanModalOpen] = useState(false);
    const [giangVienOptions, setGiangVienOptions] = useState<GiangVien[]>([]);
    const [namHocOptions, setNamHocOptions] = useState<NamHoc[]>([]);
    const [selectedNamHocIdForLHP, setSelectedNamHocIdForLHP] = useState("");

    const [themLopHocPhanFormData, setThemLopHocPhanFormData] = useState({
        maLopHocPhan: "",
        giangVienId: "",
        hocKyId: "",
        nienKhoaId: "",
        ghiChu: "",
        khoaDiem: false,
    });

    const [themLopHocPhanErrors, setThemLopHocPhanErrors] = useState({
        maLopHocPhan: false,
        giangVienId: false,
        hocKyId: false,
        nienKhoaId: false,
    });

    // State để theo dõi dropdown ĐANG MỞ (chỉ 1 cái duy nhất)
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    // Toggle: nếu click vào dropdown đang mở → đóng nó, ngược lại mở nó và đóng cái khác
    const toggleDropdown = (chiTietId: number) => {
        setActiveDropdownId((prev) =>
            prev === chiTietId ? null : chiTietId
        );
    };

    // Close cụ thể (dùng khi chọn item hoặc click ngoài)
    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    // ==================== API CALLS ====================
    const fetchChuongTrinh = async () => {
        if (!chuongTrinhId) return;

        setIsLoading(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/chuong-trinh/tat-ca-mon-hoc/${chuongTrinhId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            const json: ChuongTrinhResponse = await res.json();
            if (res.ok) {
                setChuongTrinh(json);
            } else {
                showAlert("error", "Lỗi", json.message || "Không thể tải thông tin chương trình");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMonHocOptions = async (
        page: number = 1,
        search: string = "",
        loaiMon: string = ""
    ) => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/mon-hoc`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (loaiMon) url += `&loaiMon=${loaiMon}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setMonHocOptions(json.data);
                setMonHocPagination(json.pagination);
            }
        } catch (err) {
            console.error("Không thể tải danh sách môn học:", err);
        }
    };

    // Fetch giảng viên có thể dạy môn học
    const fetchGiangVienOptions = async (monHocId: number, search: string = "") => {
        try {
            const accessToken = getCookie("access_token");
            let url = `http://localhost:3000/danh-muc/giang-vien?page=1&limit=9999&monHocId=${monHocId}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setGiangVienOptions(json.data);
            }
        } catch (err) {
            console.error("Không thể tải danh sách giảng viên:", err);
        }
    };

    // Fetch năm học
    const fetchNamHocOptions = async (search: string = "") => {
        try {
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
                setNamHocOptions(json.data);
            }
        } catch (err) {
            console.error("Không thể tải danh sách năm học:", err);
        }
    };

    // Fetch dữ liệu khi component mount
    useEffect(() => {
        fetchChuongTrinh();
    }, [chuongTrinhId]);

    // Fetch môn học khi filter thay đổi
    useEffect(() => {
        if (isThemModalOpen) {
            fetchMonHocOptions(1, monHocSearchKeyword, monHocFilterLoaiMon);
        }
    }, [monHocFilterLoaiMon, isThemModalOpen]);

    // ==================== HANDLERS ====================
    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({ variant, title, message });
        setTimeout(() => setAlert(null), 5000);
    };

    const resetThemForm = () => {
        setThemFormData({
            thuTuHocKy: "",
            monHocId: "",
            ghiChu: "",
        });
        setThemErrors({
            thuTuHocKy: false,
            monHocId: false,
        });
        setMonHocSearchKeyword("");
        setMonHocFilterLoaiMon("");
    };

    const resetSuaForm = () => {
        setSuaFormData({
            thuTuHocKy: "",
            ghiChu: "",
        });
        setSuaErrors({
            thuTuHocKy: false,
        });
    };

    const handleThemFormChange = (field: string, value: string) => {
        setThemFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSuaFormChange = (field: string, value: string) => {
        setSuaFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMonHocSearch = (search: string) => {
        setMonHocSearchKeyword(search);
        fetchMonHocOptions(1, search, monHocFilterLoaiMon);
    };

    const handleMonHocFilterLoaiMon = (loaiMon: string) => {
        setMonHocFilterLoaiMon(loaiMon);
    };

    const handleMonHocLoadMore = () => {
        if (monHocPagination.page < monHocPagination.totalPages) {
            fetchMonHocOptions(
                monHocPagination.page + 1,
                monHocSearchKeyword,
                monHocFilterLoaiMon
            );
        }
    };

    // Reset form thêm lớp học phần
    const resetThemLopHocPhanForm = () => {
        setThemLopHocPhanFormData({
            maLopHocPhan: "",
            giangVienId: "",
            hocKyId: "",
            nienKhoaId: "",
            ghiChu: "",
            khoaDiem: false,
        });
        setThemLopHocPhanErrors({
            maLopHocPhan: false,
            giangVienId: false,
            hocKyId: false,
            nienKhoaId: false,
        });
        setSelectedNamHocIdForLHP("");
    };

    // Handle form change cho thêm lớp học phần
    const handleThemLopHocPhanFormChange = (field: string, value: string | boolean) => {
        setThemLopHocPhanFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Validate form thêm lớp học phần
    const validateThemLopHocPhanForm = (): boolean => {
        const newErrors = {
            maLopHocPhan: !themLopHocPhanFormData.maLopHocPhan.trim(),
            giangVienId: !themLopHocPhanFormData.giangVienId,
            hocKyId: !themLopHocPhanFormData.hocKyId,
            nienKhoaId: !themLopHocPhanFormData.nienKhoaId,
        };
        setThemLopHocPhanErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Mở modal xem lớp học phần
    const openLophocPhancuaMonhocModal = (monHoc: MonHocCTDT) => {
        setSelectedMonHocForLopHocPhan(monHoc);
        setIsXemLopHocPhanModalOpen(true);
    };

    // Mở modal thêm lớp học phần
    const themLophocPhancuaMonhocModal = (monHoc: MonHocCTDT) => {
        setSelectedMonHocForLopHocPhan(monHoc);
        resetThemLopHocPhanForm();
        fetchGiangVienOptions(monHoc.monHoc.id);
        fetchNamHocOptions();
        setIsThemLopHocPhanModalOpen(true);
    };

    // Xử lý tìm kiếm giảng viên
    const handleGiangVienSearch = (search: string) => {
        if (selectedMonHocForLopHocPhan) {
            fetchGiangVienOptions(selectedMonHocForLopHocPhan.monHoc.id, search);
        }
    };

    // Xử lý tìm kiếm năm học
    const handleNamHocSearch = (search: string) => {
        fetchNamHocOptions(search);
    };

    // Xử lý thêm lớp học phần
    const handleThemLopHocPhan = async () => {
        if (!validateThemLopHocPhanForm() || !selectedMonHocForLopHocPhan || !chuongTrinh) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/giang-day/lop-hoc-phan`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        maLopHocPhan: themLopHocPhanFormData.maLopHocPhan.trim(),
                        giangVienId: Number(themLopHocPhanFormData.giangVienId),
                        monHocId: selectedMonHocForLopHocPhan.monHoc.id,
                        hocKyId: Number(themLopHocPhanFormData.hocKyId),
                        nienKhoaId: Number(themLopHocPhanFormData.nienKhoaId),
                        nganhId: chuongTrinh.chuongTrinh.nganh.id,
                        ghiChu: themLopHocPhanFormData.ghiChu.trim() || null,
                        khoaDiem: themLopHocPhanFormData.khoaDiem,
                    }),
                }
            );

            setIsThemLopHocPhanModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm lớp học phần thành công");
                resetThemLopHocPhanForm();
                fetchChuongTrinh();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm lớp học phần thất bại");
            }
        } catch (err) {
            setIsThemLopHocPhanModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm lớp học phần");
        }
    };

    // Validate form thêm
    const validateThemForm = (): boolean => {
        const newErrors = {
            thuTuHocKy: !themFormData.thuTuHocKy,
            monHocId: !themFormData.monHocId,
        };
        setThemErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Validate form sửa
    const validateSuaForm = (): boolean => {
        const newErrors = {
            thuTuHocKy: !suaFormData.thuTuHocKy,
        };
        setSuaErrors(newErrors);
        return !Object.values(newErrors).some((e) => e);
    };

    // Thêm môn học
    const handleThemMonHoc = async () => {
        if (!validateThemForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/chuong-trinh/mon-hoc/${chuongTrinhId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        thuTuHocKy: Number(themFormData.thuTuHocKy),
                        monHocId: Number(themFormData.monHocId),
                        ghiChu: themFormData.ghiChu.trim() || null,
                    }),
                }
            );

            setIsThemModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Thêm môn học vào chương trình thành công");
                resetThemForm();
                fetchChuongTrinh();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Thêm môn học thất bại");
            }
        } catch (err) {
            setIsThemModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi thêm môn học");
        }
    };

    // Sửa chi tiết chương trình
    const handleSuaChiTiet = async () => {
        if (!editingChiTiet || !validateSuaForm()) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/chuong-trinh/chi-tiet/${editingChiTiet.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        thuTuHocKy: Number(suaFormData.thuTuHocKy),
                        ghiChu: suaFormData.ghiChu.trim() || null,
                    }),
                }
            );

            setIsSuaModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Cập nhật môn học thành công");
                resetSuaForm();
                setEditingChiTiet(null);
                fetchChuongTrinh();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Cập nhật thất bại");
            }
        } catch (err) {
            setIsSuaModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi cập nhật");
        }
    };

    // Xóa chi tiết chương trình
    const confirmDeleteChiTiet = async () => {
        if (!deletingChiTiet) return;

        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(
                `http://localhost:3000/dao-tao/chuong-trinh/chi-tiet/${deletingChiTiet.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setIsDeleteModalOpen(false);
            if (res.ok) {
                showAlert("success", "Thành công", "Xóa môn học khỏi chương trình thành công");
                setDeletingChiTiet(null);
                fetchChuongTrinh();
            } else {
                const err = await res.json();
                showAlert("error", "Lỗi", err.message || "Xóa thất bại");
            }
        } catch (err) {
            setIsDeleteModalOpen(false);
            showAlert("error", "Lỗi", "Có lỗi xảy ra khi xóa");
        }
    };

    // Mở modals
    const openThemModal = () => {
        resetThemForm();
        fetchMonHocOptions(1, "", "");
        setIsThemModalOpen(true);
    };

    const openSuaModal = (chiTiet: MonHocCTDT) => {
        setEditingChiTiet(chiTiet);
        setSuaFormData({
            thuTuHocKy: chiTiet.thuTuHocKy.toString(),
            ghiChu: chiTiet.ghiChu || "",
        });
        setIsSuaModalOpen(true);
    };

    const openDeleteModal = (chiTiet: MonHocCTDT) => {
        setDeletingChiTiet(chiTiet);
        setIsDeleteModalOpen(true);
    };

    const sortedChiTiet = chuongTrinh?.monHocs
        ? [...chuongTrinh.monHocs].sort((a, b) => a.thuTuHocKy - b.thuTuHocKy)
        : [];
    // Tính tổng số tín chỉ
    const tongSoTinChi = sortedChiTiet.reduce((acc, ct) => acc + ct.monHoc.soTinChi, 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
            </div>
        );
    }

    if (!chuongTrinh) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="text-gray-500 dark: text-gray-400">
                    Không tìm thấy chương trình đào tạo
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="Quản lý Môn học của Chương trình Đào tạo" />

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

                {/* Nút quay lại */}
                <div className="mb-6">
                    <Button variant="outline" onClick={() => router.back()}>
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                </div>

                {/* Thông tin Chương trình Đào tạo */}
                <div className="mb-8 p-6 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 rounded-xl border border-brand-200 dark:border-brand-700">

                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {chuongTrinh.chuongTrinh.tenChuongTrinh}
                    </h2>

                    <div className="space-y-4 text-left">

                        {/* Mã chương trình */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Mã chương trình</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                                {chuongTrinh.chuongTrinh.maChuongTrinh}
                            </p>
                        </div>

                        {/* Thời gian đào tạo */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Thời gian đào tạo</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                                <Badge variant="solid" color="info">
                                    {chuongTrinh.chuongTrinh.thoiGianDaoTao} năm
                                </Badge>
                            </p>
                        </div>

                        {/* Ngành */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Ngành</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                                <Badge variant="solid" color="primary">
                                    {chuongTrinh.chuongTrinh.nganh?.maNganh}
                                </Badge> - {chuongTrinh.chuongTrinh.nganh?.tenNganh}
                            </p>
                        </div>

                        {/* Niên khóa áp dụng */}
                        {chuongTrinh.apDung?.length > 0 && (
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Niên khóa áp dụng</p>
                                    <SearchableSelect
                                        options={chuongTrinh.apDung.map((ad) => ({
                                            value: ad.nienKhoa.id.toString(),
                                            label: ad.nienKhoa.maNienKhoa,
                                            secondary: `${ad.nienKhoa.tenNienKhoa} (Áp dụng: ${formatDateVN(ad.ngayApDung)})`,
                                        }))}
                                        placeholder="Xem niên khóa áp dụng"
                                        onChange={(value) => setSelectedNienKhoaId(value)}
                                        defaultValue={selectedNienKhoaId}
                                        showSecondary={true}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>



                {/* Header và Nút thêm */}
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark: text-white">
                            Danh sách Môn học ({sortedChiTiet.length} môn - {tongSoTinChi} tín chỉ)
                        </h3>
                    </div>
                    <Button onClick={openThemModal}>
                        Thêm Môn học
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[900px]">
                            <Table>
                                {/* Table Header */}
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow className="grid grid-cols-[10%_12%_25%_10%_13%_15%_15%]">
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                        >
                                            Học kỳ
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left"
                                        >
                                            Mã Môn
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left"
                                        >
                                            Tên Môn học
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                        >
                                            Tín chỉ
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                        >
                                            Loại môn
                                        </TableCell>
                                        <TableCell
                                            isHeader
                                            className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                        >
                                            Ghi chú
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
                                    {sortedChiTiet.length === 0 ? (
                                        <TableRow>
                                            <TableCell cols={7} className="px-5 py-8 text-center text-gray-500 dark: text-gray-400">
                                                Chưa có môn học nào trong chương trình
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sortedChiTiet.map((ct) => (
                                            <TableRow
                                                key={ct.id}
                                                className="grid grid-cols-[10%_12%_25%_10%_13%_15%_15%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                            >
                                                <TableCell className="px-5 py-4 text-center">
                                                    <Badge variant="solid" color="info">
                                                        HK {ct.thuTuHocKy}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                                                    {ct.monHoc.maMonHoc}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                    {ct.monHoc.tenMonHoc}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center text-gray-800 dark:text-white/90">
                                                    {ct.monHoc.soTinChi}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-center">
                                                    <Badge variant="solid" color={getLoaiMonColor(ct.monHoc.loaiMon)}>
                                                        {getLoaiMonLabel(ct.monHoc.loaiMon)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">
                                                    <span className="text-sm truncate block max-w-[120px]" title={ct.ghiChu || ""}>
                                                        {ct.ghiChu || "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 flex items-center justify-center">
                                                    <div className="relative inline-block">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleDropdown(ct.id)}
                                                            className="dropdown-toggle flex items-center gap-1.5 min-w-[100px] justify-between px-3 py-2"
                                                        >
                                                            Thao tác
                                                            <FaAngleDown
                                                                className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === ct.id ? "rotate-180" : "rotate-0"
                                                                    }`}
                                                            />
                                                        </Button>

                                                        <Dropdown
                                                            isOpen={activeDropdownId === ct.id}
                                                            onClose={closeDropdown}
                                                            className="w-56 mt-2 right-0"
                                                        >
                                                            <div className="py-1">
                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openSuaModal(ct)}
                                                                >
                                                                    <FontAwesomeIcon icon={faPenToSquare} className="mr-2 w-4" />
                                                                    Chỉnh sửa
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openLophocPhancuaMonhocModal(ct)}
                                                                >
                                                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2 w-4" />
                                                                    Xem lớp học phần
                                                                </DropdownItem>

                                                                <DropdownItem
                                                                    tag="button"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => themLophocPhancuaMonhocModal(ct)}
                                                                >
                                                                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="mr-2 w-4" />
                                                                    Thêm lớp học phần
                                                                </DropdownItem>

                                                                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                <DropdownItem
                                                                    tag="button"
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                    onItemClick={closeDropdown}
                                                                    onClick={() => openDeleteModal(ct)}
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

                {/* Table Footer Summary */}
                <div className="mt-4 px-5 py-3 border border-gray-200 rounded-lg bg-gray-50/50 dark:border-white/[0.05] dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tổng cộng:  <strong>{sortedChiTiet.length}</strong> môn học,{" "}
                            <strong>{tongSoTinChi}</strong> tín chỉ
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <Badge variant="solid" color="success">ĐC</Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {sortedChiTiet.filter(ct => ct.monHoc.loaiMon === "DAI_CUONG").length} môn
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Badge variant="solid" color="primary">CN</Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {sortedChiTiet.filter(ct => ct.monHoc.loaiMon === "CHUYEN_NGANH").length} môn
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Badge variant="solid" color="warning">TC</Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {sortedChiTiet.filter(ct => ct.monHoc.loaiMon === "TU_CHON").length} môn
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Thêm Môn học */}
            <ThemMonHocModal
                isOpen={isThemModalOpen}
                onClose={() => {
                    setIsThemModalOpen(false);
                    resetThemForm();
                }}
                formData={themFormData}
                monHocOptions={monHocOptions}
                monHocPagination={monHocPagination}
                monHocSearchKeyword={monHocSearchKeyword}
                monHocFilterLoaiMon={monHocFilterLoaiMon}
                onMonHocSearch={handleMonHocSearch}
                onMonHocFilterLoaiMon={handleMonHocFilterLoaiMon}
                onMonHocLoadMore={handleMonHocLoadMore}
                onFormChange={handleThemFormChange}
                onSubmit={handleThemMonHoc}
                errors={themErrors}
                thoiGianDaoTao={chuongTrinh.chuongTrinh.thoiGianDaoTao}
            />

            {/* Modal Sửa Môn học */}
            <SuaMonHocModal
                isOpen={isSuaModalOpen}
                onClose={() => {
                    setIsSuaModalOpen(false);
                    resetSuaForm();
                    setEditingChiTiet(null);
                }}
                formData={suaFormData}
                monHocInfo={editingChiTiet || null}
                onFormChange={handleSuaFormChange}
                onSubmit={handleSuaChiTiet}
                errors={suaErrors}
                thoiGianDaoTao={chuongTrinh.chuongTrinh.thoiGianDaoTao}
            />

            {/* Modal Xóa */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeletingChiTiet(null);
                }}
                className="max-w-md"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Xác nhận xóa môn học
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                        Bạn có chắc chắn muốn xóa môn học{" "}
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                            {deletingChiTiet?.monHoc.maMonHoc} - {deletingChiTiet?.monHoc.tenMonHoc}
                        </span>{" "}
                        khỏi chương trình đào tạo?
                        <br /><br />
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setDeletingChiTiet(null);
                            }}
                        >
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={confirmDeleteChiTiet}>
                            Xóa
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Xem Lớp học phần */}
            <XemLopHocPhanModal
                isOpen={isXemLopHocPhanModalOpen}
                onClose={() => {
                    setIsXemLopHocPhanModalOpen(false);
                    setSelectedMonHocForLopHocPhan(null);
                }}
                monHocInfo={selectedMonHocForLopHocPhan}
                lopHocPhans={chuongTrinh?.lopHocPhans || []}
            />

            {/* Modal Thêm Lớp học phần */}
            <ThemLopHocPhanModal
                isOpen={isThemLopHocPhanModalOpen}
                onClose={() => {
                    setIsThemLopHocPhanModalOpen(false);
                    setSelectedMonHocForLopHocPhan(null);
                    resetThemLopHocPhanForm();
                }}
                monHocInfo={selectedMonHocForLopHocPhan}
                nganhInfo={chuongTrinh?.chuongTrinh.nganh || null}
                apDungNienKhoas={chuongTrinh?.apDung || []}
                giangVienOptions={giangVienOptions}
                namHocOptions={namHocOptions}
                selectedNamHocId={selectedNamHocIdForLHP}
                onNamHocChange={setSelectedNamHocIdForLHP}
                onGiangVienSearch={handleGiangVienSearch}
                onNamHocSearch={handleNamHocSearch}
                formData={themLopHocPhanFormData}
                onFormChange={handleThemLopHocPhanFormChange}
                onSubmit={handleThemLopHocPhan}
                errors={themLopHocPhanErrors}
            />
        </div>
    );
}