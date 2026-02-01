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
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/form/SelectCustom";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Checkbox from "@/components/form/input/Checkbox";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { FaAngleDown } from "react-icons/fa6";
import { useDropzone } from "react-dropzone";
import { faCloudArrowUp, faDownload, faFileExcel, faLightbulb, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

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

interface tongSinhVienTheoNienKhoa {
    nienKhoa: number;
    maNienKhoa: string;
    soLuong: number;
}

// Cập nhật interface ChuongTrinhResponse
interface ChuongTrinhResponse {
    message: string;
    chuongTrinh: ChuongTrinh;
    apDung: ApDung[];
    monHocs: MonHocCTDT[];
    lopHocPhans: LopHocPhan[]; // Thêm mới
    tongSinhVienTheoNienKhoa: tongSinhVienTheoNienKhoa[]; // Thêm mới
    tongSinhVienApDung: number; // Thêm mới
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ==================== INTERFACES CHO IMPORT EXCEL ====================
interface ImportSuccessRow {
    row: number;
    maMonHoc: string;
    thuTuHocKy: number;
}

interface ImportErrorRow {
    row: number;
    maMonHoc: string;
    error: string;
}

interface ImportMonHocResult {
    message: string;
    totalRows: number;
    success: number;
    failed: number;
    errors: ImportErrorRow[];
    successRows: ImportSuccessRow[];
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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-5xl">
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
                                <TableRow className="grid grid-cols-[23%_20%_15%_17%_10%_15%]">
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
                                            className="grid grid-cols-[23%_20%_15%_17%_10%_15%] items-center"
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
                                            <TableCell className="px-4 py-3 text-center text-gray-800 dark:text-white/90">
                                                <Badge variant="solid" color={lhp.khoaDiem ? "error" : "success"}>
                                                    {lhp.khoaDiem ? "Khóa điểm" : "Mở điểm"}
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
    onGiangVienSearch: (search: string) => void;
    formData: {
        maLopHocPhan: string;
        giangVienId: string;
        nienKhoaId: string;
        ghiChu: string;
    };
    onFormChange: (field: string, value: string | boolean) => void;
    onSubmit: () => void;
    errors: {
        maLopHocPhan: boolean;
        giangVienId: boolean;
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
    onGiangVienSearch,
    formData,
    onFormChange,
    onSubmit,
    errors,
}) => {
    const [giangVienSearchKeyword, setGiangVienSearchKeyword] = useState("");
    const [namHocSearchKeyword, setNamHocSearchKeyword] = useState("");

    if (!isOpen || !monHocInfo) return null;

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

// ==================== MODAL NHẬP MÔN HỌC EXCEL ====================
interface ImportMonHocExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    chuongTrinhId: string;
}

// ==================== MODAL NHẬP MÔN HỌC EXCEL ====================
const ImportMonHocExcelModal: React.FC<ImportMonHocExcelModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    chuongTrinhId,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [importResult, setImportResult] = useState<ImportMonHocResult | null>(null);
    const [importError, setImportError] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");
    const [hasImported, setHasImported] = useState(false); // Flag để track đã import thành công

    const onDrop = (acceptedFiles: File[], rejectedFiles: any[]) => {
        setFileError("");

        if (rejectedFiles.length > 0) {
            setFileError("Chỉ chấp nhận file Excel (.xlsx)");
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (!file.name.endsWith('.xlsx')) {
                setFileError("Chỉ chấp nhận file Excel (.xlsx)");
                return;
            }
            setSelectedFile(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        },
        maxFiles: 1,
        multiple: false,
    });

    const handleDownloadTemplate = async () => {
        setIsDownloading(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/chuong-trinh/export-mau-excel", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;

                const contentDisposition = res.headers.get("content-disposition");
                let filename = "mau-nhap-mon-hoc-ctdt.xlsx";
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="?(.+)"?/);
                    if (match) filename = match[1];
                }

                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                setFileError("Không thể tải file mẫu");
            }
        } catch (err) {
            setFileError("Có lỗi xảy ra khi tải file mẫu");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setFileError("Vui lòng chọn file Excel");
            return;
        }

        setIsUploading(true);
        setImportResult(null);
        setImportError("");

        try {
            const accessToken = getCookie("access_token");
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch(`http://localhost:3000/dao-tao/chuong-trinh/${chuongTrinhId}/mon-hoc/import-excel`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const result: ImportMonHocResult = await res.json();

            if (res.ok) {
                // Set result trước
                setImportResult(result);
                setActiveTab(result.failed > 0 ? "error" : "success");
                setHasImported(true);
                // Không gọi onSuccess() ở đây, sẽ gọi khi đóng modal
            } else {
                setImportError(result.message || "Nhập môn học thất bại");
            }
        } catch (err) {
            setImportError("Có lỗi xảy ra khi nhập môn học từ Excel");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        // Nếu đã import thành công, gọi onSuccess để refresh data
        if (hasImported) {
            onSuccess();
        }
        // Reset tất cả state
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
        setActiveTab("success");
        setHasImported(false);
        onClose();
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError("");
    };

    const resetForNewUpload = () => {
        setSelectedFile(null);
        setFileError("");
        setImportResult(null);
        setImportError("");
        setActiveTab("success");
        // Giữ hasImported = true nếu đã import trước đó
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Nhập môn học vào CTĐT bằng Excel
                </h3>

                {/* ==================== HIỂN THỊ KẾT QUẢ IMPORT ==================== */}
                {importResult !== null && (
                    <div className="space-y-6">
                        {/* Header tổng kết */}
                        <div className={`p-5 rounded-xl border ${importResult.failed === 0
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800/50'
                                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-800/50'
                            }`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${importResult.failed === 0
                                        ? 'bg-green-100 dark:bg-green-800/50'
                                        : 'bg-yellow-100 dark:bg-yellow-800/50'
                                    }`}>
                                    <FontAwesomeIcon
                                        icon={importResult.failed === 0 ? faCheckCircle : faLightbulb}
                                        className={`text-xl ${importResult.failed === 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <h4 className={`text-lg font-semibold ${importResult.failed === 0
                                            ? 'text-green-800 dark:text-green-300'
                                            : 'text-yellow-800 dark:text-yellow-300'
                                        }`}>
                                        {importResult.failed === 0 ? 'Nhập dữ liệu thành công!' : 'Hoàn tất với một số lỗi'}
                                    </h4>
                                    <p className={`text-sm ${importResult.failed === 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-yellow-600 dark:text-yellow-400'
                                        }`}>
                                        {importResult.message}
                                    </p>
                                </div>
                            </div>

                            {/* Grid thống kê */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                        {importResult.totalRows}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tổng số dòng</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-green-200 dark:border-green-700 shadow-sm">
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {importResult.success}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thành công</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border border-red-200 dark:border-red-700 shadow-sm">
                                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {importResult.failed}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thất bại</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs chuyển đổi */}
                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setActiveTab("success")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === "success"
                                        ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCheckCircle} className={activeTab === "success" ? "text-green-500" : ""} />
                                Thành công ({importResult.successRows?.length || 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("error")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === "error"
                                        ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faTimesCircle} className={activeTab === "error" ? "text-red-500" : ""} />
                                Thất bại ({importResult.errors?.length || 0})
                            </button>
                        </div>

                        {/* ==================== TABLE THÀNH CÔNG ==================== */}
                        {activeTab === "success" && (
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 overflow-hidden">
                                <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-200 dark:border-green-800/50">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                                        Chi tiết các dòng nhập thành công
                                    </h4>
                                </div>

                                {importResult.successRows && importResult.successRows.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[15%_50%_35%]">
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Dòng
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Mã môn học
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Thứ tự học kỳ
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {importResult.successRows.map((row, idx) => (
                                                    <TableRow
                                                        key={idx}
                                                        className="grid grid-cols-[15%_50%_35%] bg-white dark:bg-gray-900 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors"
                                                    >
                                                        <TableCell className="px-4 py-3 text-center">
                                                            <Badge variant="light" color="success">
                                                                {row.row}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left">
                                                            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                                                                {row.maMonHoc}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-center">
                                                            <Badge variant="solid" color="info">
                                                                Học kỳ {row.thuTuHocKy}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        <FontAwesomeIcon icon={faFileExcel} className="text-4xl mb-3 text-gray-300 dark:text-gray-600" />
                                        <p>Không có dòng nào được nhập thành công</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ==================== TABLE LỖI ==================== */}
                        {activeTab === "error" && (
                            <div className="rounded-xl border border-red-200 dark:border-red-800/50 overflow-hidden">
                                <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-200 dark:border-red-800/50">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
                                        Chi tiết các dòng bị lỗi
                                    </h4>
                                </div>

                                {importResult.errors && importResult.errors.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[12%_23%_65%]">
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-center text-xs uppercase tracking-wider"
                                                    >
                                                        Dòng
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Mã môn học
                                                    </TableCell>
                                                    <TableCell
                                                        isHeader
                                                        className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider"
                                                    >
                                                        Mô tả lỗi
                                                    </TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {importResult.errors.map((err, idx) => (
                                                    <TableRow
                                                        key={idx}
                                                        className="grid grid-cols-[12%_23%_65%] bg-white dark:bg-gray-900 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors"
                                                    >
                                                        <TableCell className="px-4 py-3 text-center">
                                                            <Badge variant="light" color="error">
                                                                {err.row}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left">
                                                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                                                {err.maMonHoc === "N/A" ? (
                                                                    <span className="text-gray-400 italic">N/A</span>
                                                                ) : (
                                                                    err.maMonHoc
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-3 text-left">
                                                            <span className="text-sm text-red-600 dark:text-red-400">
                                                                {err.error}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-4xl mb-3 text-green-400 dark:text-green-500" />
                                        <p className="text-green-600 dark:text-green-400">Tất cả các dòng đều nhập thành công!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Buttons sau khi import */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={resetForNewUpload}>
                                Nhập file khác
                            </Button>
                            <Button onClick={handleClose}>
                                Hoàn tất
                            </Button>
                        </div>
                    </div>
                )}

                {/* ==================== HIỂN THỊ LỖI TỔNG QUÁT ==================== */}
                {importError && importResult === null && (
                    <div className="mb-6 p-5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
                                <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    className="text-xl text-red-600 dark:text-red-400"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-red-800 dark:text-red-300">
                                    Lỗi nhập dữ liệu
                                </h4>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {importError}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-3">
                            <Button variant="outline" size="sm" onClick={resetForNewUpload}>
                                Thử lại
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleClose}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}

                {/* ==================== FORM UPLOAD ==================== */}
                {importResult === null && !importError && (
                    <>
                        {/* Button tải file mẫu */}
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                disabled={isDownloading}
                                startIcon={<FontAwesomeIcon icon={faDownload} />}
                                className="w-full"
                            >
                                {isDownloading ? "Đang tải..." : "Tải file Excel mẫu"}
                            </Button>
                        </div>

                        {/* Hướng dẫn */}
                        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800/50 flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faLightbulb}
                                        className="text-blue-500"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                        Hướng dẫn nhập môn học
                                    </h4>
                                    <ul className="text-sm text-blue-700/80 dark:text-blue-300/70 space-y-1.5">
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">1.</span>
                                            <span>Tải file mẫu Excel bằng nút bên trên</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">2.</span>
                                            <span>Điền thông tin môn học theo định dạng trong file mẫu</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">3.</span>
                                            <span>Các cột bắt buộc: <strong>Mã môn học</strong>, <strong>Thứ tự học kỳ</strong></span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="font-semibold text-blue-500">4.</span>
                                            <span>Môn học phải tồn tại trong danh mục hệ thống trước khi import</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Lưu ý */}
                        <div className="mb-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800/50 flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={faLightbulb}
                                        className="text-yellow-500"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                        Lưu ý quan trọng
                                    </h4>
                                    <ul className="text-sm text-yellow-700/80 dark:text-yellow-300/70 space-y-1">
                                        <li>• Không thể thêm môn học đã tồn tại trong chương trình</li>
                                        <li>• Hệ thống sẽ bỏ qua các dòng lỗi và tiếp tục xử lý các dòng hợp lệ</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Dropzone */}
                        <div className="mb-6">
                            <Label className="mb-2 block">Chọn file Excel nhập môn học</Label>
                            <div
                                className={`transition border-2 border-dashed cursor-pointer rounded-xl 
                                    ${fileError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                                    ${isDragActive ? 'border-brand-500 bg-gray-100 dark:bg-gray-800' : 'hover:border-brand-500 dark:hover:border-brand-500'}
                                `}
                            >
                                <div
                                    {...getRootProps()}
                                    className={`rounded-xl p-8 lg:p-10
                                        ${isDragActive
                                            ? "bg-gray-100 dark:bg-gray-800"
                                            : "bg-gray-50 dark:bg-gray-900"
                                        }
                                    `}
                                >
                                    <input {...getInputProps()} />

                                    <div className="flex flex-col items-center">
                                        <div className="mb-4 flex justify-center">
                                            <div className={`flex h-16 w-16 items-center justify-center rounded-full 
                                                ${selectedFile
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}
                                            >
                                                <FontAwesomeIcon
                                                    icon={selectedFile ? faFileExcel : faCloudArrowUp}
                                                    className="text-2xl"
                                                />
                                            </div>
                                        </div>

                                        {selectedFile ? (
                                            <>
                                                <p className="mb-2 font-medium text-gray-800 dark:text-white/90">
                                                    {selectedFile.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile();
                                                    }}
                                                    className="mt-3 text-sm text-red-500 hover:text-red-600 underline"
                                                >
                                                    Hủy chọn file
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <h4 className="mb-2 font-semibold text-gray-800 dark:text-white/90">
                                                    {isDragActive ? "Thả file vào đây" : "Kéo & thả file vào đây"}
                                                </h4>
                                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                    Chỉ chấp nhận file Excel (.xlsx)
                                                </p>
                                                <span className="font-medium underline text-sm text-brand-500">
                                                    Hoặc click để chọn file
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {fileError && (
                                <p className="mt-2 text-sm text-red-500">{fileError}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                                startIcon={isUploading ? undefined : <FontAwesomeIcon icon={faFileExcel} />}
                            >
                                {isUploading ? "Đang xử lý..." : "Xác nhận nhập"}
                            </Button>
                        </div>
                    </>
                )}
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
    const [hocKyFilter, setHocKyFilter] = useState<string>("");

    // State cho modals
    const [isThemModalOpen, setIsThemModalOpen] = useState(false);
    const [isSuaModalOpen, setIsSuaModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingChiTiet, setEditingChiTiet] = useState<MonHocCTDT | null>(null);
    const [deletingChiTiet, setDeletingChiTiet] = useState<MonHocCTDT | null>(null);
    // State cho modal import excel
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);

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
        id: number;
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

    const [themLopHocPhanFormData, setThemLopHocPhanFormData] = useState({
        maLopHocPhan: "",
        giangVienId: "",
        nienKhoaId: "",
        ghiChu: "",
    });

    const [themLopHocPhanErrors, setThemLopHocPhanErrors] = useState({
        maLopHocPhan: false,
        giangVienId: false,
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
            let url = `http://localhost:3000/danh-muc/mon-hoc/paginated?page=1&limit=9999`;
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
        setAlert({
            id: Date.now(),   // 🔥 ép remount
            variant,
            title,
            message,
        });
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
            nienKhoaId: "",
            ghiChu: "",
        });
        setThemLopHocPhanErrors({
            maLopHocPhan: false,
            giangVienId: false,
            nienKhoaId: false,
        });
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
        setIsThemLopHocPhanModalOpen(true);
    };

    // Xử lý tìm kiếm giảng viên
    const handleGiangVienSearch = (search: string) => {
        if (selectedMonHocForLopHocPhan) {
            fetchGiangVienOptions(selectedMonHocForLopHocPhan.monHoc.id, search);
        }
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
                        nienKhoaId: Number(themLopHocPhanFormData.nienKhoaId),
                        nganhId: chuongTrinh.chuongTrinh.nganh.id,
                        ghiChu: themLopHocPhanFormData.ghiChu.trim() || null,
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
    const tongSoTinChi = sortedChiTiet.reduce((acc, ct) => acc + ct.monHoc.soTinChi, 0);

    // Lọc theo thứ tự học kỳ
    const filteredChiTiet =
        hocKyFilter === ""
            ? sortedChiTiet
            : sortedChiTiet.filter((ct) => ct.thuTuHocKy === Number(hocKyFilter));
    const filteredTongSoTinChi = filteredChiTiet.reduce((acc, ct) => acc + ct.monHoc.soTinChi, 0);
    const hocKyFilterOptions = [
        ...[...new Set(sortedChiTiet.map((ct) => ct.thuTuHocKy))].sort((a, b) => a - b).map((hk) => ({
            value: String(hk),
            label: `Học kỳ ${hk}`,
        })),
    ];

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
                            key={alert.id}        // 🔥 reset state mỗi lần show
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            dismissible
                            autoDismiss
                            duration={600000}
                            onClose={() => setAlert(null)}   // 🔥 unmount thật
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

                        {/* Tổng số sinh viên đang áp dụng CTDT */}
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tổng số sinh viên đang áp dụng CTDT</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                                <Badge variant="solid" color="success">
                                    {chuongTrinh.tongSinhVienApDung} sinh viên
                                </Badge>
                            </p>
                        </div>

                        {/* Niên khóa áp dụng */}
                        {chuongTrinh.apDung?.length > 0 && (
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Niên khóa áp dụng</p>
                                    <SearchableSelect
                                        options={chuongTrinh.apDung.map((ad) => {
                                            const matched = chuongTrinh.tongSinhVienTheoNienKhoa.find(
                                                (nk) => nk.nienKhoa === ad.nienKhoa.id
                                            );
                                            return {
                                                value: ad.nienKhoa.id.toString(),
                                                label: ad.nienKhoa.maNienKhoa,
                                                secondary: `${ad.nienKhoa.tenNienKhoa} (Áp dụng: ${formatDateVN(
                                                    ad.ngayApDung
                                                )}) - Tổng số sinh viên: ${matched?.soLuong ?? 0}`,
                                            };
                                        })}
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
                <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Danh sách Môn học ({filteredChiTiet.length} môn - {filteredTongSoTinChi} tín chỉ)
                        </h3>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            onClick={() => setIsImportExcelModalOpen(true)}
                            startIcon={<FontAwesomeIcon icon={faFileExcel} />}
                        >
                            Nhập từ Excel
                        </Button>
                    </div>
                </div>

                {/* Bộ lọc theo thứ tự học kỳ - bên trái, dưới tiêu đề */}
                {sortedChiTiet.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Lọc theo học kỳ:
                        </span>
                        <div className="min-w-[180px]">
                            <SearchableSelect
                                options={hocKyFilterOptions}
                                placeholder="Tất cả học kỳ"
                                onChange={(value) => setHocKyFilter(value ?? "")}
                                defaultValue={hocKyFilter}
                                showSecondary={false}
                                maxDisplayOptions={12}
                                searchPlaceholder="Tìm học kỳ..."
                            />
                        </div>
                        {hocKyFilter !== "" && (
                            <button
                                type="button"
                                onClick={() => setHocKyFilter("")}
                                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}

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
                                    {filteredChiTiet.length === 0 ? (
                                        <TableRow>
                                            <TableCell cols={7} className="px-5 py-8 text-center text-gray-500 dark: text-gray-400">
                                                {sortedChiTiet.length === 0
                                                    ? "Chưa có môn học nào trong chương trình"
                                                    : "Không có môn học nào thuộc học kỳ đã chọn"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredChiTiet.map((ct) => (
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
                            Tổng cộng: <strong>{filteredChiTiet.length}</strong> môn học,{" "}
                            <strong>{filteredTongSoTinChi}</strong> tín chỉ
                            {hocKyFilter !== "" && (
                                <span className="ml-2 text-brand-600 dark:text-brand-400">(đang lọc)</span>
                            )}
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2">
                                <Badge variant="solid" color="success">ĐC</Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {filteredChiTiet.filter(ct => ct.monHoc.loaiMon === "DAI_CUONG").length} môn
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Badge variant="solid" color="primary">CN</Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {filteredChiTiet.filter(ct => ct.monHoc.loaiMon === "CHUYEN_NGANH").length} môn
                                </span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Badge variant="solid" color="warning">TC</Badge>
                                <span className="text-gray-500 dark:text-gray-400">
                                    {filteredChiTiet.filter(ct => ct.monHoc.loaiMon === "TU_CHON").length} môn
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
                onGiangVienSearch={handleGiangVienSearch}
                formData={themLopHocPhanFormData}
                onFormChange={handleThemLopHocPhanFormChange}
                onSubmit={handleThemLopHocPhan}
                errors={themLopHocPhanErrors}
            />

            {/* Modal Import Excel */}
            <ImportMonHocExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onSuccess={() => {
                    fetchChuongTrinh();
                }}
                chuongTrinhId={chuongTrinhId}
            />

            {/* Nút Thêm môn học (FAB) - giống trang Tạo CTĐT */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    variant="primary"
                    onClick={openThemModal}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3.5 font-semibold shadow-lg ring-2 ring-white/20 dark:ring-black/20 hover:shadow-xl hover:scale-105 active:scale-100 transition-all"
                >
                    <FontAwesomeIcon icon={faPlus} className="h-5 w-5" />
                    <span className="pr-1">Thêm môn học</span>
                </Button>
            </div>
        </div>
    );
}