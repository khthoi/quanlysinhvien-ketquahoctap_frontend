"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ENV } from "@/config/env";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Badge from "@/components/ui/badge/Badge";
import SearchableSelect from "@/components/form/SelectCustom";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import Pagination from "@/components/tables/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faTrash,
    faEdit,
    faCircleCheck,
    faCircleExclamation,
    faSpinner,
    faUserPlus,
    faEye,
    faRotateRight,
    faUsers,
    faUserClock,
    faUserGraduate,
    faRefresh,
    faDownload,
    faFileExcel,
    faBook,
    faInfoCircle,
    faFileInvoice,
} from "@fortawesome/free-solid-svg-icons";
import { FaAngleDown } from "react-icons/fa6";

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

// --- Types from API response ---
interface LopHocPhanOption {
    lopHocPhanId: number;
    maLopHocPhan: string;
    monHocId: number;
    maMonHoc: string;
    tenMonHoc: string;
    soTinChi: number;
    nganhId: number;
    tenNganh: string;
    nienKhoaId: number;
    tenNienKhoa: string;
    hocKyId: number;
    hocKy: number;
    maNamHoc: string;
    tenNamHoc: string;
    siSo: number;
    laBestChoice: boolean;
}

interface DeXuatItem {
    sinhVienId: number;
    maSinhVien: string;
    hoTen: string;
    gioiTinh: string;
    sdt: string;
    maLopHocPhanTruot: string;
    diemQuaTrinh: number;
    diemThanhPhan: number;
    diemThi: number;
    diemTBCHP: string;
    diemSo: string;
    diemChu: string;
    danhGia: string;
    bestChoiceLopHocPhan: LopHocPhanOption | null;
    cacLopHocPhanCoTheDangKy: LopHocPhanOption[];
}

// --- Types for "sinh viên đã học lại / đang học lại" ---
interface KetQuaHocLai {
    diemQuaTrinh: number | null;
    diemThanhPhan: number | null;
    diemThi: number | null;
    diemTBCHP: number | null;
    diemChu: string | null;
    diemSo: number | null;
    khoaDiem: boolean;
}

interface LanHocLai {
    lopHocPhanId: number;
    maLopHocPhan: string;
    hocKy: number;
    maNamHoc: string;
    tenNamHoc: string;
    ngayBatDau?: string | null;
    ngayKetThuc?: string | null;
    ketQuaHocTap: KetQuaHocLai | null;
}

interface SinhVienDaHocLaiItem {
    sinhVienId: number;
    maSinhVien: string;
    hoTen: string;
    gioiTinh?: string;
    maMonHocTruot: string;
    tenMonHocTruot: string;
    maLopHocPhanTruot: string;
    diemTBCHPTruot: string;
    cacLanHocLai: LanHocLai[];
}

interface DeXuatResponse {
    maNamHoc: string;
    hocKy: number;
    tenNamHoc: string;
    tongSinhVien: number;
    items: DeXuatItem[];
}

// --- Types for API mới: thong-tin-sinh-vien-truot-mon ---
interface ThongTinSinhVienTruotMonResponse {
    maNamHoc: string;
    hocKy: number;
    tenNamHoc: string;
    tongSinhVienTruot: number;
    soSinhVienChuaHocLai: number;
    danhSachSinhVienTruot: Array<{
        sinhVienId: number;
        maSinhVien: string;
        hoTen: string;
        gioiTinh?: string;
        sdt?: string;
        tinhTrang: string;
        lopHocPhanId: number;
        maLopHocPhan: string;
        monHocId: number;
        maMonHoc: string;
        tenMonHoc: string;
        soTinChi: number;
        diemQuaTrinh: number;
        diemThanhPhan: number;
        diemThi: number;
        diemTBCHP: string;
        diemSo: string;
        diemChu: string;
        daHocLai: boolean;
        dangHocLai: boolean;
        daDat: boolean;
    }>;
    danhSachSinhVienDaHocLai: SinhVienDaHocLaiItem[];
}

const DANH_GIA_TRUOT = "Trượt môn";
const PAGE_SIZE = 10;
const PAGE_SIZE_DA_HOC_LAI = 10;

function formatDanhGia(danhGia: string): string {
    if (!danhGia) return danhGia;
    const u = danhGia.toUpperCase().replace(/\s/g, "_");
    if (u === "TRUOT_MON" || u.includes("TRƯỢT") || u.includes("TRUOT")) return DANH_GIA_TRUOT;
    return danhGia;
}

// --- Edit modal ---
interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: DeXuatItem | null;
    selectedLopHocPhanId: number | null;
    onSelectedLopHocPhanChange: (lopHocPhanId: number | null) => void;
    proposedCountByLopHocPhanId: Record<number, number>;
    onSave: () => void;
    canSave: boolean;
}

// --- Detail modal: Xem thêm (DeXuatItem) ---
interface DetailDeXuatModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: DeXuatItem | null;
}

const DetailDeXuatModal: React.FC<DetailDeXuatModalProps> = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết đề xuất học lại
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã sinh viên</p>
                            <p className="mt-0.5 font-mono text-gray-800 dark:text-white">{item.maSinhVien}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ và tên</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.hoTen}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">LHP trượt</p>
                            <p className="mt-0.5 font-mono text-gray-800 dark:text-white">{item.maLopHocPhanTruot}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Điểm QT / TP / Thi</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.diemQuaTrinh} / {item.diemThanhPhan} / {item.diemThi}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">TBCHP / Điểm số / Điểm chữ</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.diemTBCHP} / {item.diemSo} / {item.diemChu}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">LHP đề xuất</p>
                            <p className="mt-0.5 font-mono text-gray-800 dark:text-white">
                                {item.bestChoiceLopHocPhan ? `${item.bestChoiceLopHocPhan.maLopHocPhan} (sĩ số: ${item.bestChoiceLopHocPhan.siSo})` : "Chưa có"}
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            Các lớp học phần có thể đăng ký ({item.cacLopHocPhanCoTheDangKy.length})
                        </h4>
                        <ul className="space-y-2 max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/80">
                            {item.cacLopHocPhanCoTheDangKy.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Không có lớp phù hợp</li>
                            ) : (
                                item.cacLopHocPhanCoTheDangKy.map((lhp) => (
                                    <li key={lhp.lopHocPhanId} className="px-4 py-3 flex items-center justify-between gap-3 bg-white dark:bg-gray-900/30">
                                        <div>
                                            <span className="font-mono text-gray-800 dark:text-white">{lhp.maLopHocPhan}</span>
                                            {lhp.laBestChoice && (
                                                <Badge variant="light" color="success" className="ml-2 text-xs">Đề xuất</Badge>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {lhp.tenMonHoc} · Sĩ số: {lhp.siSo} · {lhp.tenNamHoc} HK{lhp.hocKy}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Detail modal: Xem thêm (Sinh viên đã học lại) ---
interface DetailDaHocLaiModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: SinhVienDaHocLaiItem | null;
}

function formatDateVi(dateStr: string | null | undefined): string {
    if (!dateStr) return "—";
    try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
        return dateStr;
    }
}

const DetailDaHocLaiModal: React.FC<DetailDaHocLaiModalProps> = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Chi tiết học lại
                </h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã sinh viên</p>
                            <p className="mt-0.5 font-mono text-gray-800 dark:text-white">{item.maSinhVien}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Họ và tên</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.hoTen}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Môn trượt</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.tenMonHocTruot} ({item.maMonHocTruot})</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">LHP trượt</p>
                            <p className="mt-0.5 font-mono text-gray-800 dark:text-white">{item.maLopHocPhanTruot}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Điểm TBCHP khi trượt</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.diemTBCHPTruot}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Số lần học lại</p>
                            <p className="mt-0.5 text-gray-800 dark:text-white">{item.cacLanHocLai.length}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faRotateRight} className="text-brand-500 dark:text-brand-400" />
                            Các lần học lại ({item.cacLanHocLai.length})
                        </h4>
                        <ul className="space-y-3 max-h-72 overflow-y-auto">
                            {item.cacLanHocLai.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                    Chưa có lần học lại nào
                                </li>
                            ) : (
                                item.cacLanHocLai.map((lan) => (
                                    <li
                                        key={lan.lopHocPhanId}
                                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white/90"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <span className="font-mono font-medium text-gray-800 dark:text-white">{lan.maLopHocPhan}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {lan.tenNamHoc} · HK{lan.hocKy}
                                                {(lan.ngayBatDau != null || lan.ngayKetThuc != null) && (
                                                    <> ({formatDateVi(lan.ngayBatDau)} - {formatDateVi(lan.ngayKetThuc)})</>
                                                )}
                                            </span>
                                        </div>
                                        {lan.ketQuaHocTap ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Điểm 10%:</span>
                                                <span className="text-gray-800 dark:text-white">{lan.ketQuaHocTap.diemQuaTrinh ?? "—"}</span>
                                                <span className="sm:col-span-1" />
                                                <span className="text-gray-500 dark:text-gray-400">Điểm 30%:</span>
                                                <span className="text-gray-800 dark:text-white">{lan.ketQuaHocTap.diemThanhPhan ?? "—"}</span>
                                                <span className="sm:col-span-1" />
                                                <span className="text-gray-500 dark:text-gray-400">Điểm 60%:</span>
                                                <span className="text-gray-800 dark:text-white">{lan.ketQuaHocTap.diemThi ?? "—"}</span>
                                                <span className="sm:col-span-1" />
                                                <span className="text-gray-500 dark:text-gray-400">TBCHP:</span>
                                                <span className="font-medium text-gray-800 dark:text-white">
                                                    {lan.ketQuaHocTap.diemTBCHP != null ? lan.ketQuaHocTap.diemTBCHP.toFixed(2) : "—"}
                                                </span>
                                                <span className="sm:col-span-1" />
                                                <span className="text-gray-500 dark:text-gray-400">Điểm chữ:</span>
                                                <span className="text-gray-800 dark:text-white">{lan.ketQuaHocTap.diemChu ?? "—"}</span>
                                                <span className="sm:col-span-1" />
                                                <span className="text-gray-500 dark:text-gray-400">Điểm số (Hệ 4):</span>
                                                <span className="font-medium text-gray-800 dark:text-white">
                                                    {lan.ketQuaHocTap.diemSo != null ? lan.ketQuaHocTap.diemSo.toFixed(1) : "—"}
                                                </span>
                                                <span className="sm:col-span-1" />
                                                <span className="text-gray-500 dark:text-gray-400">Khóa điểm:</span>
                                                <span className="text-gray-800 dark:text-white">{lan.ketQuaHocTap.khoaDiem ? "Đã khóa" : "Chưa khóa"}</span>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có kết quả học tập</p>
                                        )}
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Đóng</Button>
                </div>
            </div>
        </Modal>
    );
};

const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    item,
    selectedLopHocPhanId,
    onSelectedLopHocPhanChange,
    proposedCountByLopHocPhanId,
    onSave,
    canSave,
}) => {
    if (!isOpen || !item) return null;

    const options = item.cacLopHocPhanCoTheDangKy.map((lhp) => ({
        value: lhp.lopHocPhanId.toString(),
        label: lhp.laBestChoice ? `${lhp.maLopHocPhan} (Đề xuất)` : lhp.maLopHocPhan,
        secondary: lhp.tenMonHoc,
    }));

    const selectedLHP = item.cacLopHocPhanCoTheDangKy.find(
        (l) => l.lopHocPhanId === selectedLopHocPhanId
    );
    const currentCountForLHP = selectedLopHocPhanId
        ? proposedCountByLopHocPhanId[selectedLopHocPhanId] ?? 0
        : 0;
    const currentSiSo = selectedLHP?.siSo ?? 0;
    const proposedSiSo = currentSiSo + currentCountForLHP;
    const isOverCapacity = proposedSiSo > 40;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                    Sửa lớp học phần đề xuất
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <Label>Mã sinh viên</Label>
                        <Input disabled value={item.maSinhVien} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <div>
                        <Label>Họ và tên</Label>
                        <Input disabled value={item.hoTen} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <div>
                        <Label>LHP trượt</Label>
                        <Input disabled value={item.maLopHocPhanTruot} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <div>
                        <Label>Điểm TBCHP</Label>
                        <Input disabled value={item.diemTBCHP} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <div>
                        <Label>Điểm số / Điểm chữ</Label>
                        <Input disabled value={`${item.diemSo} / ${item.diemChu}`} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <div>
                        <Label>Đánh giá</Label>
                        <Input disabled value={formatDanhGia(item.danhGia)} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Lớp học phần đăng ký</Label>
                        <SearchableSelect
                            key={item.sinhVienId}
                            options={options}
                            placeholder="Chọn lớp học phần"
                            onChange={(value) => onSelectedLopHocPhanChange(value ? Number(value) : null)}
                            defaultValue={selectedLopHocPhanId?.toString() ?? ""}
                            showSecondary={true}
                            maxDisplayOptions={10}
                            searchPlaceholder="Tìm lớp học phần..."
                        />
                    </div>
                </div>

                {selectedLHP && (
                    <div
                        className={`mt-4 p-4 rounded-xl border ${isOverCapacity
                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"
                                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <FontAwesomeIcon
                                icon={faCircleExclamation}
                                className={`mt-0.5 ${isOverCapacity ? "text-red-500" : "text-amber-500"}`}
                            />
                            <div>
                                <p className={`font-medium ${isOverCapacity ? "text-red-800 dark:text-red-300" : "text-amber-800 dark:text-amber-300"}`}>
                                    {isOverCapacity ? "Vượt sĩ số cho phép" : "Cảnh báo sĩ số"}
                                </p>
                                <p className={`text-sm mt-1 ${isOverCapacity ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-400"}`}>
                                    LHP {selectedLHP.maLopHocPhan}: sĩ số hiện tại {selectedLHP.siSo}, sau khi thêm sinh viên đề xuất: {proposedSiSo} sinh viên.
                                    {isOverCapacity && " Tối đa 40. Không thể lưu."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button onClick={onSave} disabled={!canSave || isOverCapacity}>
                        Lưu
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Confirm add result modal (success / error tables) ---
interface ConfirmResultRow {
    sinhVienId: number;
    maSinhVien: string;
    hoTen: string;
    lopHocPhanId: number;
    maLopHocPhan: string;
    message?: string;
}

interface ConfirmAddResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    successList: ConfirmResultRow[];
    errorList: ConfirmResultRow[];
    isSubmitting: boolean;
}

const ConfirmAddResultModal: React.FC<ConfirmAddResultModalProps> = ({
    isOpen,
    onClose,
    successList,
    errorList,
    isSubmitting,
}) => {
    const [activeTab, setActiveTab] = useState<"success" | "error">("success");
    const totalSuccess = successList.length;
    const totalError = errorList.length;

    useEffect(() => {
        if (totalError > 0) setActiveTab("error");
        else setActiveTab("success");
    }, [totalError]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Kết quả thêm sinh viên vào lớp học phần
                    </h3>
                </div>

                {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                        <div className="relative mb-4">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-5xl text-brand-500 dark:text-brand-400" />
                        </div>
                        <p className="text-sm font-medium">Đang xử lý...</p>
                        <p className="text-xs mt-1 opacity-80">Vui lòng đợi trong giây lát</p>
                    </div>
                ) : (
                    <>
                        {/* Tóm tắt nhanh */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/20 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-800/50">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-lg text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalSuccess}</p>
                                        <p className="text-sm text-green-600 dark:text-green-400/90">Thành công</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-lg text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">{totalError}</p>
                                        <p className="text-sm text-red-600 dark:text-red-400/90">Lỗi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tab chuyển đổi */}
                        <div className="flex gap-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab("success")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "success"
                                        ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm ring-1 ring-green-200 dark:ring-green-800/50"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCircleCheck} className={activeTab === "success" ? "text-green-500 dark:text-green-400" : "text-gray-400 dark:text-gray-500"} />
                                Thành công ({totalSuccess})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("error")}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === "error"
                                        ? "bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-red-200 dark:ring-red-800/50"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCircleExclamation} className={activeTab === "error" ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"} />
                                Lỗi ({totalError})
                            </button>
                        </div>

                        {activeTab === "success" && (
                            <div className="rounded-xl border border-green-200 dark:border-green-800/50 overflow-hidden bg-white dark:bg-gray-900/50">
                                <div className="bg-green-50 dark:bg-green-900/25 px-4 py-3 border-b border-green-200 dark:border-green-800/50">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 dark:text-green-400" />
                                        Chi tiết thêm thành công
                                    </h4>
                                </div>
                                {successList.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="overflow-x-auto">
                                            <div className="min-w-[800px] text-xs leading-tight">
                                                <Table>
                                                    <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 text-[11px]">
                                                        <TableRow className="grid grid-cols-[15%_25%_30%_30%]">
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Mã SV</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Họ tên</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">LHP</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Ghi chú</TableCell>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50 text-[11px] leading-tight">
                                                        {successList.map((row, idx) => (
                                                            <TableRow key={idx} className="grid grid-cols-[15%_25%_30%_30%] items-center hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors">
                                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-gray-200">{row.maSinhVien}</TableCell>
                                                                <TableCell className="px-2 py-2 text-gray-800 dark:text-gray-200"><span className="block truncate" title={row.hoTen}>{row.hoTen}</span></TableCell>
                                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-gray-200">{row.maLopHocPhan}</TableCell>
                                                                <TableCell className="px-2 py-2 text-green-600 dark:text-green-400 font-medium text-[11px]">Đã thêm vào LHP</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-14 text-center">
                                        <FontAwesomeIcon icon={faCircleCheck} className="text-4xl text-green-400 dark:text-green-500 mb-3 opacity-80" />
                                        <p className="text-gray-500 dark:text-gray-400">Không có bản ghi thành công</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "error" && (
                            <div className="rounded-xl border border-red-200 dark:border-red-800/50 overflow-hidden bg-white dark:bg-gray-900/50">
                                <div className="bg-red-50 dark:bg-red-900/25 px-4 py-3 border-b border-red-200 dark:border-red-800/50">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-500 dark:text-red-400" />
                                        Chi tiết lỗi
                                    </h4>
                                </div>
                                {errorList.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="overflow-x-auto">
                                            <div className="min-w-[800px] text-xs leading-tight">
                                                <Table>
                                                    <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10 text-[11px]">
                                                        <TableRow className="grid grid-cols-[15%_25%_30%_30%]">
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Mã SV</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Họ tên</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">LHP</TableCell>
                                                            <TableCell isHeader className="px-2 py-2 font-medium text-gray-600 dark:text-gray-300 text-left text-[11px]">Chi tiết lỗi</TableCell>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50 text-[11px] leading-tight">
                                                        {errorList.map((row, idx) => (
                                                            <TableRow key={idx} className="grid grid-cols-[15%_25%_30%_30%] items-center hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-gray-200">{row.maSinhVien}</TableCell>
                                                                <TableCell className="px-2 py-2 text-gray-800 dark:text-gray-200"><span className="block truncate" title={row.hoTen}>{row.hoTen}</span></TableCell>
                                                                <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-gray-200">{row.maLopHocPhan}</TableCell>
                                                                <TableCell className="px-2 py-2 text-red-600 dark:text-red-400 text-[11px]">{row.message ?? "Lỗi không xác định"}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-14 text-center">
                                        <FontAwesomeIcon icon={faCircleExclamation} className="text-4xl text-red-400 dark:text-red-500 mb-3 opacity-80" />
                                        <p className="text-gray-500 dark:text-gray-400">Không có lỗi</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex justify-end border-t border-gray-100 dark:border-gray-800 pt-6">
                            <Button onClick={onClose} variant="primary">
                                Đóng
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

// --- Stat Card Component ---
interface StatCardProps {
    icon: typeof faUsers;
    title: string;
    value: number | string;
    color: "blue" | "green" | "amber" | "red" | "purple";
    subtitle?: string;
    loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, subtitle, loading }) => {
    const colorClasses = {
        blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400",
        green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400",
        amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400",
        red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400",
        purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400",
    };

    const iconBgClasses = {
        blue: "bg-blue-100 dark:bg-blue-800/50",
        green: "bg-green-100 dark:bg-green-800/50",
        amber: "bg-amber-100 dark:bg-amber-800/50",
        red: "bg-red-100 dark:bg-red-800/50",
        purple: "bg-purple-100 dark:bg-purple-800/50",
    };

    return (
        <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
            <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBgClasses[color]}`}>
                    <FontAwesomeIcon icon={icon} className="text-xl" />
                </div>
                <div>
                    {loading ? (
                        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold">{value}</p>
                    )}
                    <p className="text-sm opacity-90">{title}</p>
                    {subtitle && <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>}
                </div>
            </div>
        </div>
    );
};

export default function ThemSinhvienPage() {
    const params = useParams();
    const namHocId = (params?.namHocId as string) ?? "";
    const hocKyId = (params?.hocKyId as string) ?? "";
    const hocKyNum = parseInt(hocKyId, 10) || 0;

    // State cho API thống kê (API mới - nhanh hơn)
    const [thongKeData, setThongKeData] = useState<ThongTinSinhVienTruotMonResponse | null>(null);
    const [loadingThongKe, setLoadingThongKe] = useState(true);

    // State cho API đề xuất (API cũ - chậm hơn vì tính best choice)
    const [apiData, setApiData] = useState<DeXuatResponse | null>(null);
    const [loadingDeXuat, setLoadingDeXuat] = useState(false);

    const [fetchError, setFetchError] = useState<string | null>(null);
    const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
    const [selectedLHPMap, setSelectedLHPMap] = useState<Record<number, number>>({});
    const [searchKeyword, setSearchKeyword] = useState("");
    const [searchKeywordDaHocLai, setSearchKeywordDaHocLai] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageDaHocLai, setCurrentPageDaHocLai] = useState(1);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
    const [editModalItem, setEditModalItem] = useState<DeXuatItem | null>(null);
    const [detailDeXuatItem, setDetailDeXuatItem] = useState<DeXuatItem | null>(null);
    const [detailDaHocLaiItem, setDetailDaHocLaiItem] = useState<SinhVienDaHocLaiItem | null>(null);
    const [isConfirmAddModalOpen, setIsConfirmAddModalOpen] = useState(false);
    const [isConfirmAddResultModalOpen, setIsConfirmAddResultModalOpen] = useState(false);
    const [confirmSubmitting, setConfirmSubmitting] = useState(false);
    const [confirmSuccessList, setConfirmSuccessList] = useState<ConfirmResultRow[]>([]);
    const [confirmErrorList, setConfirmErrorList] = useState<ConfirmResultRow[]>([]);

    // Tab active: "de-xuat" | "da-hoc-lai"
    const [activeMainTab, setActiveMainTab] = useState<"de-xuat" | "da-hoc-lai">("de-xuat");

    // State cho xuất thống kê Excel
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);

    // State cho modal thêm lớp học phần
    const [isThemLHPModalOpen, setIsThemLHPModalOpen] = useState(false);
    const router = useRouter();

    // Hàm xuất thống kê sinh viên trượt môn
    const handleExportThongKe = async () => {
        if (!namHocId || !hocKyNum) return;
        setIsExporting(true);
        setExportSuccess(null);
        setExportError(null);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/bao-cao/de-xuat-hoc-lai`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maNamHoc: namHocId,
                    hocKy: hocKyNum,
                }),
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `thong-ke-sv-truot-mon-${namHocId}-HK${hocKyNum}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                setExportSuccess("Đã xuất file thống kê sinh viên trượt môn và đề xuất học lại thành công!");
            } else {
                const err = await res.json();
                setExportError(err.message || "Không thể xuất thống kê");
            }
        } catch {
            setExportError("Có lỗi xảy ra khi xuất thống kê");
        } finally {
            setIsExporting(false);
        }
    };

    // Fetch API thống kê (nhanh - không có đề xuất lớp)
    const fetchThongKe = useCallback(async () => {
        if (!namHocId || !hocKyId) return;
        setLoadingThongKe(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/bao-cao/thong-tin-sinh-vien-truot-mon`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ maNamHoc: namHocId, hocKy: hocKyNum }),
            });
            const data = await res.json() as ThongTinSinhVienTruotMonResponse & { message?: string };
            if (res.ok) {
                setThongKeData(data);
            } else {
                setFetchError(data.message ?? "Không tải được dữ liệu thống kê");
            }
        } catch {
            setFetchError("Lỗi kết nối khi tải thống kê");
        } finally {
            setLoadingThongKe(false);
        }
    }, [namHocId, hocKyId, hocKyNum]);

    // Fetch API đề xuất (chậm hơn - có đề xuất lớp)
    const fetchDeXuat = useCallback(async (idsToKeepRemoved?: number[]) => {
        if (!namHocId || !hocKyId) return;
        setLoadingDeXuat(true);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`${ENV.BACKEND_URL}/bao-cao/de-xuat-hoc-lai/json`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ maNamHoc: namHocId, hocKy: hocKyNum }),
            });
            const data = await res.json() as DeXuatResponse & { message?: string };
            if (res.ok) {
                setApiData({
                    maNamHoc: data.maNamHoc,
                    hocKy: data.hocKy,
                    tenNamHoc: data.tenNamHoc,
                    tongSinhVien: data.tongSinhVien ?? 0,
                    items: data.items ?? [],
                });
                setRemovedIds(idsToKeepRemoved?.length ? new Set(idsToKeepRemoved) : new Set());
                const nextMap: Record<number, number> = {};
                (data.items ?? []).forEach((it: DeXuatItem) => {
                    nextMap[it.sinhVienId] =
                        it.bestChoiceLopHocPhan?.lopHocPhanId ??
                        it.cacLopHocPhanCoTheDangKy?.[0]?.lopHocPhanId ??
                        null;
                });
                setSelectedLHPMap(nextMap);
            }
        } catch {
            // Silent error for de-xuat, thong-ke already handled
        } finally {
            setLoadingDeXuat(false);
        }
    }, [namHocId, hocKyId, hocKyNum]);

    // Fetch cả 2 API khi mount
    useEffect(() => {
        setFetchError(null);
        fetchThongKe();
        fetchDeXuat();
    }, [fetchThongKe, fetchDeXuat]);

    const handleRefresh = async () => {
        setFetchError(null);
        await Promise.all([fetchThongKe(), fetchDeXuat()]);
    };

    const displayItems = useMemo(() => {
        if (!apiData?.items) return [];
        return apiData.items.filter((sv) => !removedIds.has(sv.sinhVienId));
    }, [apiData?.items, removedIds]);

    const filteredItems = useMemo(() => {
        if (!searchKeyword.trim()) return displayItems;
        const q = searchKeyword.trim().toLowerCase();
        return displayItems.filter(
            (sv) =>
                sv.maSinhVien.toLowerCase().includes(q) ||
                sv.hoTen.toLowerCase().includes(q)
        );
    }, [displayItems, searchKeyword]);

    const totalFiltered = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages >= 1) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    const proposedCountByLopHocPhanId = useMemo(() => {
        const count: Record<number, number> = {};
        displayItems.forEach((sv) => {
            const lhpId = selectedLHPMap[sv.sinhVienId];
            if (lhpId != null) count[lhpId] = (count[lhpId] ?? 0) + 1;
        });
        return count;
    }, [displayItems, selectedLHPMap]);

    const daHocLaiList = useMemo(
        () => thongKeData?.danhSachSinhVienDaHocLai ?? [],
        [thongKeData?.danhSachSinhVienDaHocLai]
    );
    const filteredDaHocLai = useMemo(() => {
        if (!searchKeywordDaHocLai.trim()) return daHocLaiList;
        const q = searchKeywordDaHocLai.trim().toLowerCase();
        return daHocLaiList.filter(
            (sv) =>
                sv.maSinhVien.toLowerCase().includes(q) ||
                sv.hoTen.toLowerCase().includes(q)
        );
    }, [daHocLaiList, searchKeywordDaHocLai]);
    const totalDaHocLai = filteredDaHocLai.length;
    const totalPagesDaHocLai = Math.max(1, Math.ceil(totalDaHocLai / PAGE_SIZE_DA_HOC_LAI));
    const paginatedDaHocLai = useMemo(() => {
        const start = (currentPageDaHocLai - 1) * PAGE_SIZE_DA_HOC_LAI;
        return filteredDaHocLai.slice(start, start + PAGE_SIZE_DA_HOC_LAI);
    }, [filteredDaHocLai, currentPageDaHocLai]);

    useEffect(() => {
        setCurrentPageDaHocLai(1);
    }, [searchKeywordDaHocLai]);

    useEffect(() => {
        if (currentPageDaHocLai > totalPagesDaHocLai && totalPagesDaHocLai >= 1) setCurrentPageDaHocLai(totalPagesDaHocLai);
    }, [totalPagesDaHocLai, currentPageDaHocLai]);

    const toggleDropdown = (id: string) => {
        setActiveDropdownId((prev) => (prev === id ? null : id));
    };
    const closeDropdown = () => setActiveDropdownId(null);

    const openEditModal = (item: DeXuatItem) => {
        setEditModalItem(item);
    };
    const closeEditModal = () => setEditModalItem(null);

    const handleSaveEdit = () => {
        if (editModalItem && selectedLHPMap[editModalItem.sinhVienId] != null) {
            closeEditModal();
        }
    };

    const handleSelectedLopInModal = (lopHocPhanId: number | null) => {
        if (!editModalItem) return;
        setSelectedLHPMap((prev) => {
            const next = { ...prev };
            if (lopHocPhanId == null) delete next[editModalItem.sinhVienId];
            else next[editModalItem.sinhVienId] = lopHocPhanId;
            return next;
        });
    };

    const editSelectedId = editModalItem ? selectedLHPMap[editModalItem.sinhVienId] ?? null : null;
    const editCanSave = editModalItem != null && editSelectedId != null;

    const removeFromTable = (sinhVienId: number) => {
        setRemovedIds((prev) => new Set(prev).add(sinhVienId));
        closeDropdown();
    };

    const handleViewBangDiem = (sinhVienId: number) => {
        const url = `${ENV.FRONTEND_ADMIN_URL}/quan-ly-sinh-vien/bang-diem/${sinhVienId}`;
        window.open(url, "_blank");
    };

    const openConfirmAddModal = () => {
        setIsConfirmAddModalOpen(true);
    };

    const handleConfirmAdd = async () => {
        const toAdd = displayItems.filter((sv) => selectedLHPMap[sv.sinhVienId] != null);
        if (toAdd.length === 0) return;
        setIsConfirmAddResultModalOpen(true);
        setConfirmSubmitting(true);
        setConfirmSuccessList([]);
        setConfirmErrorList([]);

        const successRows: ConfirmResultRow[] = [];
        const errorRows: ConfirmResultRow[] = [];
        const accessToken = getCookie("access_token");

        for (const sv of toAdd) {
            const lhpId = selectedLHPMap[sv.sinhVienId];
            if (lhpId == null) continue;
            const lhp = sv.cacLopHocPhanCoTheDangKy.find((l) => l.lopHocPhanId === lhpId);
            const maLopHocPhan = lhp?.maLopHocPhan ?? String(lhpId);
            try {
                const res = await fetch(
                    `${ENV.BACKEND_URL}/giang-day/lop-hoc-phan/${lhpId}/sinh-vien-dang-ky/${sv.sinhVienId}`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                    successRows.push({
                        sinhVienId: sv.sinhVienId,
                        maSinhVien: sv.maSinhVien,
                        hoTen: sv.hoTen,
                        lopHocPhanId: lhpId,
                        maLopHocPhan,
                    });
                } else {
                    errorRows.push({
                        sinhVienId: sv.sinhVienId,
                        maSinhVien: sv.maSinhVien,
                        hoTen: sv.hoTen,
                        lopHocPhanId: lhpId,
                        maLopHocPhan,
                        message: (body as any).message ?? "Lỗi không xác định",
                    });
                }
            } catch {
                errorRows.push({
                    sinhVienId: sv.sinhVienId,
                    maSinhVien: sv.maSinhVien,
                    hoTen: sv.hoTen,
                    lopHocPhanId: lhpId,
                    maLopHocPhan,
                    message: "Lỗi kết nối",
                });
            }
        }

        setConfirmSuccessList(successRows);
        setConfirmErrorList(errorRows);
        setConfirmSubmitting(false);
        setIsConfirmAddModalOpen(false);

        const successIds = successRows.map((r) => r.sinhVienId);
        if (successIds.length > 0) {
            setRemovedIds((prev) => {
                const next = new Set(prev);
                successIds.forEach((id) => next.add(id));
                return next;
            });
        }
        // Refresh cả 2 API
        await Promise.all([fetchThongKe(), fetchDeXuat(successIds)]);
    };

    // Thống kê từ API mới
    const tenNamHoc = thongKeData?.tenNamHoc ?? apiData?.tenNamHoc ?? "";
    const tongSinhVienTruot = thongKeData?.tongSinhVienTruot ?? apiData?.tongSinhVien ?? 0;
    // soSinhVienDaHocLai lấy từ thongKeData (danhSachSinhVienDaHocLai)
    const soSinhVienDaHocLai = daHocLaiList.length;
    const soSinhVienChuaHocLai = thongKeData?.soSinhVienChuaHocLai ?? displayItems.length;
    
    // Đếm số sinh viên có LHP đề xuất (bestChoiceLopHocPhan khác null/rỗng)
    const soSinhVienCoLHPDeXuat = useMemo(() => {
        if (!apiData?.items) return 0;
        return apiData.items.filter((sv) => {
            const bestChoice = sv.bestChoiceLopHocPhan;
            return bestChoice !== null && bestChoice !== undefined;
        }).length;
    }, [apiData?.items]);

    // Kiểm tra xem có ít nhất một sinh viên không có LHP đề xuất không
    const coSinhVienKhongCoLHPDeXuat = useMemo(() => {
        if (!apiData?.items || apiData.items.length === 0) return false;
        return apiData.items.some((sv) => {
            const bestChoice = sv.bestChoiceLopHocPhan;
            return bestChoice === null || bestChoice === undefined;
        });
    }, [apiData?.items]);

    const isLoading = loadingThongKe;

    const handleThemLHP = () => {
        router.push(`/them-lop-hoc-phan-hoc-lai/${namHocId}/hocKy/${hocKyId}`);
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Thêm sinh viên học lại" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {fetchError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 flex items-center justify-between">
                        <span>{fetchError}</span>
                        <Button variant="outline" size="sm" onClick={handleRefresh}>
                            <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                            Thử lại
                        </Button>
                    </div>
                )}

                {/* Header với thông tin năm học */}
                <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 border border-brand-200 dark:border-brand-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                Học kỳ {hocKyNum} - {tenNamHoc || namHocId}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Quản lý sinh viên trượt môn và đăng ký học lại
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsThemLHPModalOpen(true)}
                                disabled={!coSinhVienKhongCoLHPDeXuat || isLoading || loadingDeXuat}
                                startIcon={<FontAwesomeIcon icon={faBook} />}
                            >
                                Thêm lớp học phần
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleExportThongKe}
                                disabled={isLoading || isExporting}
                                startIcon={
                                    isExporting ? (
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                    ) : (
                                        <FontAwesomeIcon icon={faDownload} />
                                    )
                                }
                            >
                                {isExporting ? "Đang xuất..." : "Xuất thống kê"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={isLoading || loadingDeXuat}
                                startIcon={<FontAwesomeIcon icon={faRefresh} className={isLoading || loadingDeXuat ? "animate-spin" : ""} />}
                            >
                                Làm mới
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Thông báo xuất thống kê */}
                {exportSuccess && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCircleCheck} />
                            <span>{exportSuccess}</span>
                        </div>
                        <button
                            onClick={() => setExportSuccess(null)}
                            className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {exportError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCircleExclamation} />
                            <span>{exportError}</span>
                        </div>
                        <button
                            onClick={() => setExportError(null)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon={faUsers}
                        title="Tổng SV trượt môn"
                        value={tongSinhVienTruot}
                        color="blue"
                        loading={isLoading}
                    />
                    <StatCard
                        icon={faUserClock}
                        title="Cần học lại"
                        value={soSinhVienChuaHocLai}
                        color="red"
                        subtitle="Chưa đăng ký LHP mới"
                        loading={isLoading}
                    />
                    <StatCard
                        icon={faRotateRight}
                        title="Đã/đang học lại"
                        value={loadingDeXuat ? "..." : soSinhVienDaHocLai}
                        color="amber"
                        loading={false}
                    />
                    <StatCard
                        icon={faUserGraduate}
                        title="Có thể thêm vào LHP"
                        value={loadingDeXuat ? "..." : soSinhVienCoLHPDeXuat}
                        color="green"
                        subtitle={loadingDeXuat ? "Đang tải đề xuất..." : "Sinh viên có LHP đề xuất"}
                        loading={false}
                    />
                </div>

                {/* Main Tabs */}
                <div className="flex gap-1 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setActiveMainTab("de-xuat")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeMainTab === "de-xuat"
                            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                    >
                        <FontAwesomeIcon icon={faUserPlus} />
                        Sinh viên cần học lại ({loadingDeXuat ? "..." : displayItems.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveMainTab("da-hoc-lai")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${activeMainTab === "da-hoc-lai"
                            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            }`}
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                        Đã/đang học lại ({daHocLaiList.length})
                    </button>
                </div>

                {/* Tab Content: Sinh viên cần học lại */}
                {activeMainTab === "de-xuat" && (
                    <>
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:max-w-md">
                        <div className="relative">
                            <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                            <input
                                type="text"
                                placeholder="Tìm theo mã sinh viên hoặc tên..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                            />
                        </div>
                    </div>
                    <Button
                        startIcon={<FontAwesomeIcon icon={faUserPlus} />}
                        onClick={openConfirmAddModal}
                        disabled={displayItems.length === 0 || loadingDeXuat}
                    >
                        Xác nhận thêm sinh viên vào các lớp học phần
                    </Button>
                </div>

                {/* Table: Sinh viên cần học lại (đề xuất) */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                        <div className="min-w-[1000px] text-xs leading-tight">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                                    <TableRow className="grid grid-cols-[8%_14%_16%_7%_7%_7%_7%_7%_16%_11%]">
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left whitespace-nowrap">Mã SV</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Họ tên</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left whitespace-nowrap">LHP trượt</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">Điểm QT</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">Điểm TP</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">Điểm Thi</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">TBCHP</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center">Đánh giá</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left whitespace-nowrap">LHP đề xuất</TableCell>
                                        <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">Hành động</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                {paginatedItems.length === 0 ? (
                                    <TableRow className="text-[11px] leading-tight">
                                        <TableCell cols={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            {loadingDeXuat
                                                ? (
                                                    <div className="flex flex-col items-center justify-center py-4">
                                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-brand-500 dark:text-brand-400 mb-2" />
                                                        <p className="text-sm">Đang tải đề xuất...</p>
                                                    </div>
                                                )
                                                : displayItems.length === 0
                                                    ? (daHocLaiList.length > 0
                                                        ? "Không có sinh viên cần học lại trong kỳ này (xem tab Đã/đang học lại)"
                                                        : "Không có sinh viên cần học lại")
                                                    : "Không có kết quả tìm kiếm"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedItems.map((sv) => {
                                        const rowKey = `${sv.sinhVienId}-${sv.maLopHocPhanTruot}`;
                                        return (
                                            <TableRow
                                            key={rowKey}
                                            className="grid grid-cols-[8%_14%_16%_7%_7%_7%_7%_7%_16%_11%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.maSinhVien}>{sv.maSinhVien}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.hoTen}>{sv.hoTen}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-left"><span className="block truncate" title={sv.maLopHocPhanTruot}>{sv.maLopHocPhanTruot}</span></TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-center">{sv.diemQuaTrinh}</TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-center">{sv.diemThanhPhan}</TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-center">{sv.diemThi}</TableCell>
                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90 text-center">{sv.diemTBCHP}</TableCell>
                                            <TableCell className="px-2 py-2 text-center">
                                                <Badge variant="light" color="error" size="sm" className="text-[11px]">{formatDanhGia(sv.danhGia)}</Badge>
                                            </TableCell>
                                            <TableCell className="px-2 py-2 text-left">
                                                <span className="block truncate font-mono text-gray-800 dark:text-white/90" title={sv.bestChoiceLopHocPhan?.maLopHocPhan ?? "Chưa có"}>
                                                    {sv.bestChoiceLopHocPhan ? `${sv.bestChoiceLopHocPhan.maLopHocPhan} (${sv.bestChoiceLopHocPhan.siSo} SV)` : "Chưa có"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-2 py-2 text-center">
                                                <div className="relative inline-block">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleDropdown(rowKey)}
                                                        className="dropdown-toggle flex items-center gap-1.5 min-w-[90px] justify-between px-3 py-2"
                                                    >
                                                        Thao tác
                                                        <FaAngleDown
                                                            className={`text-gray-500 transition-transform duration-300 shrink-0 ${activeDropdownId === rowKey ? "rotate-180" : "rotate-0"}`}
                                                        />
                                                    </Button>
                                                    <Dropdown
                                                        isOpen={activeDropdownId === rowKey}
                                                        onClose={closeDropdown}
                                                        className="w-48 mt-2 right-0"
                                                    >
                                                        <div className="py-1">
                                                            <DropdownItem
                                                                tag="button"
                                                                onItemClick={closeDropdown}
                                                                onClick={() => { setDetailDeXuatItem(sv); }}
                                                                className="flex items-center gap-2 px-3 py-2"
                                                            >
                                                                <FontAwesomeIcon icon={faEye} className="w-4" />
                                                                Xem thêm
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                tag="button"
                                                                onItemClick={closeDropdown}
                                                                onClick={() => openEditModal(sv)}
                                                                className="flex items-center gap-2 px-3 py-2"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} className="w-4" />
                                                                Sửa
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                tag="button"
                                                                onItemClick={closeDropdown}
                                                                onClick={() => handleViewBangDiem(sv.sinhVienId)}
                                                                className="flex items-center gap-2 px-3 py-2"
                                                            >
                                                                <FontAwesomeIcon icon={faFileInvoice} className="w-4" />
                                                                Bảng điểm
                                                            </DropdownItem>
                                                            <DropdownItem
                                                                tag="button"
                                                                onItemClick={closeDropdown}
                                                                onClick={() => removeFromTable(sv.sinhVienId)}
                                                                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="w-4" />
                                                                Xóa
                                                            </DropdownItem>
                                                        </div>
                                                    </Dropdown>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                </div>

                {/* Pagination & items count */}
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Hiển thị{" "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {totalFiltered === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
                        </span>
                        {" - "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {Math.min(currentPage * PAGE_SIZE, totalFiltered)}
                        </span>
                        {" trên "}
                        <span className="font-medium text-gray-700 dark:text-gray-300">{totalFiltered}</span>
                        {" kết quả"}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center sm:justify-end">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
                    </>
                )}

                {/* Tab Content: Sinh viên đã/đang học lại */}
                {activeMainTab === "da-hoc-lai" && (
                    <>
                        <div className="mb-4 w-full sm:max-w-md">
                            <div className="relative">
                                <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Tìm theo mã sinh viên hoặc tên..."
                                    value={searchKeywordDaHocLai}
                                    onChange={(e) => setSearchKeywordDaHocLai(e.target.value)}
                                    className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                                />
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <div className="min-w-[950px] text-xs leading-tight">
                                    <Table>
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                                            <TableRow className="grid grid-cols-[10%_18%_22%_18%_8%_10%_14%]">
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left whitespace-nowrap">Mã SV</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Họ tên</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Môn trượt</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left whitespace-nowrap">LHP trượt</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">TBCHP</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">Số lần học lại</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center whitespace-nowrap">Hành động</TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                        {paginatedDaHocLai.length === 0 ? (
                                            <TableRow className="text-[11px] leading-tight">
                                                <TableCell cols={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    {filteredDaHocLai.length === 0 && searchKeywordDaHocLai.trim()
                                                        ? "Không có kết quả tìm kiếm"
                                                        : "Không có dữ liệu"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedDaHocLai.map((sv) => {
                                                const rowKey = `${sv.sinhVienId}-${sv.maMonHocTruot}-${sv.maLopHocPhanTruot}`;
                                                return (
                                                    <TableRow
                                                    key={rowKey}
                                                    className="grid grid-cols-[10%_18%_22%_18%_8%_10%_14%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90"><span className="block truncate" title={sv.maSinhVien}>{sv.maSinhVien}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90"><span className="block truncate" title={sv.hoTen}>{sv.hoTen}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90"><span className="block truncate" title={sv.tenMonHocTruot}>{sv.tenMonHocTruot}</span></TableCell>
                                                    <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90"><span className="block truncate" title={sv.maLopHocPhanTruot}>{sv.maLopHocPhanTruot}</span></TableCell>
                                                    <TableCell className="px-2 py-2 text-center text-gray-800 dark:text-white/90">{sv.diemTBCHPTruot}</TableCell>
                                                    <TableCell className="px-2 py-2 text-center">
                                                        <Badge variant="light" color="info" size="sm" className="text-[11px]">{sv.cacLanHocLai.length}</Badge>
                                                    </TableCell>
                                                    <TableCell className="px-2 py-2 text-center">
                                                        <div className="relative inline-block">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleDropdown(rowKey)}
                                                                className="dropdown-toggle flex items-center gap-1.5 min-w-[90px] justify-between px-3 py-2"
                                                            >
                                                                Thao tác
                                                                <FaAngleDown
                                                                    className={`text-gray-500 transition-transform duration-300 shrink-0 ${activeDropdownId === rowKey ? "rotate-180" : "rotate-0"}`}
                                                                />
                                                            </Button>
                                                            <Dropdown
                                                                isOpen={activeDropdownId === rowKey}
                                                                onClose={closeDropdown}
                                                                className="w-48 mt-2 right-0"
                                                            >
                                                                <div className="py-1">
                                                                    <DropdownItem
                                                                        tag="button"
                                                                        onItemClick={closeDropdown}
                                                                        onClick={() => setDetailDaHocLaiItem(sv)}
                                                                        className="flex items-center gap-2 px-3 py-2"
                                                                    >
                                                                        <FontAwesomeIcon icon={faEye} className="w-4" />
                                                                        Xem chi tiết
                                                                    </DropdownItem>
                                                                    <DropdownItem
                                                                        tag="button"
                                                                        onItemClick={closeDropdown}
                                                                        onClick={() => handleViewBangDiem(sv.sinhVienId)}
                                                                        className="flex items-center gap-2 px-3 py-2"
                                                                    >
                                                                        <FontAwesomeIcon icon={faFileInvoice} className="w-4" />
                                                                        Bảng điểm
                                                                    </DropdownItem>
                                                                </div>
                                                            </Dropdown>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Hiển thị{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {totalDaHocLai === 0 ? 0 : (currentPageDaHocLai - 1) * PAGE_SIZE_DA_HOC_LAI + 1}
                                </span>
                                {" - "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {Math.min(currentPageDaHocLai * PAGE_SIZE_DA_HOC_LAI, totalDaHocLai)}
                                </span>
                                {" trên "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">{totalDaHocLai}</span>
                                {" kết quả"}
                            </div>
                            {totalPagesDaHocLai > 1 && (
                                <div className="flex justify-center sm:justify-end">
                                    <Pagination
                                        currentPage={currentPageDaHocLai}
                                        totalPages={totalPagesDaHocLai}
                                        onPageChange={setCurrentPageDaHocLai}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <DetailDeXuatModal
                isOpen={!!detailDeXuatItem}
                onClose={() => setDetailDeXuatItem(null)}
                item={detailDeXuatItem}
            />
            <DetailDaHocLaiModal
                isOpen={!!detailDaHocLaiItem}
                onClose={() => setDetailDaHocLaiItem(null)}
                item={detailDaHocLaiItem}
            />
            <EditModal
                isOpen={!!editModalItem}
                onClose={closeEditModal}
                item={editModalItem}
                selectedLopHocPhanId={editSelectedId}
                onSelectedLopHocPhanChange={handleSelectedLopInModal}
                proposedCountByLopHocPhanId={proposedCountByLopHocPhanId}
                onSave={handleSaveEdit}
                canSave={editCanSave}
            />

            {isConfirmAddModalOpen && (
                <Modal
                    isOpen={isConfirmAddModalOpen}
                    size="2xl"
                    onClose={() => setIsConfirmAddModalOpen(false)}
                >
                    <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Xác nhận thêm sinh viên
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Bạn sẽ thêm {displayItems.filter((sv) => selectedLHPMap[sv.sinhVienId] != null).length} sinh viên vào các lớp học phần tương ứng. Tiếp tục?
                        </p>
                        
                        {/* Table hiển thị danh sách sinh viên sẽ thêm */}
                        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                            <div className="max-w-full overflow-x-auto">
                                <div className="min-w-[800px] text-xs leading-tight">
                                    <Table>
                                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] text-[11px]">
                                            <TableRow className="grid grid-cols-[15%_25%_30%_30%]">
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Mã SV</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">Họ tên</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">LHP đề xuất</TableCell>
                                                <TableCell isHeader className="px-2 py-2 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-left">LHP sẽ thêm vào</TableCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-[11px] leading-tight">
                                            {displayItems
                                                .filter((sv) => selectedLHPMap[sv.sinhVienId] != null)
                                                .map((sv) => {
                                                    const lhpId = selectedLHPMap[sv.sinhVienId];
                                                    const lhp = sv.cacLopHocPhanCoTheDangKy.find((l) => l.lopHocPhanId === lhpId);
                                                    return (
                                                        <TableRow
                                                            key={`${sv.sinhVienId}-${sv.maLopHocPhanTruot}`}
                                                            className="grid grid-cols-[15%_25%_30%_30%] items-center"
                                                        >
                                                            <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90">{sv.maSinhVien}</TableCell>
                                                            <TableCell className="px-2 py-2 text-gray-800 dark:text-white/90"><span className="block truncate" title={sv.hoTen}>{sv.hoTen}</span></TableCell>
                                                            <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90">
                                                                {sv.bestChoiceLopHocPhan?.maLopHocPhan ?? "Chưa có"}
                                                            </TableCell>
                                                            <TableCell className="px-2 py-2 font-mono text-gray-800 dark:text-white/90">
                                                                {lhp ? `${lhp.maLopHocPhan} (sĩ số: ${lhp.siSo})` : "N/A"}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsConfirmAddModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleConfirmAdd}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            <ConfirmAddResultModal
                isOpen={isConfirmAddResultModalOpen}
                onClose={() => setIsConfirmAddResultModalOpen(false)}
                successList={confirmSuccessList}
                errorList={confirmErrorList}
                isSubmitting={confirmSubmitting}
            />

            {/* Modal xác nhận thêm lớp học phần */}
            {isThemLHPModalOpen && (
                <Modal
                    isOpen={isThemLHPModalOpen}
                    onClose={() => setIsThemLHPModalOpen(false)}
                    size="2xl"
                >
                    <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                            Thêm lớp học phần cho sinh viên học lại
                        </h3>

                        {/* Hướng dẫn */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex gap-3">
                                <FontAwesomeIcon
                                    icon={faInfoCircle}
                                    className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0"
                                />
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <p className="font-medium mb-2">Hướng dẫn:</p>
                                    <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                                        <li>Bạn sẽ được chuyển đến trang tạo lớp học phần cho sinh viên học lại</li>
                                        <li>Trang đó sẽ hiển thị danh sách các lớp học phần cần tạo cho các sinh viên không có lớp học phần phù hợp để học ghép</li>
                                        <li>Sau khi tạo lớp học phần, bạn có thể quay lại trang này để thêm sinh viên vào các lớp học phần đã tạo</li>
                                        <li>Quá trình này giúp tạo các lớp học phần mới cho các sinh viên không thể học ghép với lớp hiện có</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Cảnh báo */}
                        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex gap-3">
                                <FontAwesomeIcon
                                    icon={faCircleExclamation}
                                    className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0"
                                />
                                <div className="text-sm text-amber-700 dark:text-amber-300">
                                    <p className="font-medium mb-1">Lưu ý:</p>
                                    <p className="text-amber-600 dark:text-amber-400">
                                        Chỉ các sinh viên không có lớp học phần đề xuất mới cần tạo lớp học phần mới. 
                                        Nếu sinh viên đã có lớp học phần đề xuất, bạn nên thêm họ vào lớp đó thay vì tạo lớp mới.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsThemLHPModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button onClick={handleThemLHP}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
