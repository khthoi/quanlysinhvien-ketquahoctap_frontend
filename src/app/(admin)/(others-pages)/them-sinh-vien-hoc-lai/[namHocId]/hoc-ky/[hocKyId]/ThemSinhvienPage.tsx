"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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

interface DeXuatResponse {
    maNamHoc: string;
    hocKy: number;
    tenNamHoc: string;
    tongSinhVien: number;
    items: DeXuatItem[];
}

const DANH_GIA_TRUOT = "Trượt môn";
const PAGE_SIZE = 10;

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
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
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
            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl">
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
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[13%_22%_35%_30%]">
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">Mã SV</TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">Họ tên</TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">LHP</TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">Ghi chú</TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50">
                                                {successList.map((row, idx) => (
                                                    <TableRow key={idx} className="grid grid-cols-[13%_22%_35%_30%] hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors">
                                                          <TableCell className="px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">{row.maSinhVien}</TableCell>
                                                        <TableCell className="px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">{row.hoTen}</TableCell>
                                                        <TableCell className="px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">{row.maLopHocPhan}</TableCell>
                                                        <TableCell className="px-4 py-3 font-mono text-sm text-green-600 dark:text-green-400 font-medium">Đã thêm vào LHP</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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
                                        <Table>
                                            <TableHeader className="bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10">
                                                <TableRow className="grid grid-cols-[13%_22%_35%_30%]">
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">Mã SV</TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">Họ tên</TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">LHP</TableCell>
                                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-600 dark:text-gray-300 text-left text-xs uppercase tracking-wider">Chi tiết lỗi</TableCell>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700/80 bg-white dark:bg-gray-900/50">
                                                {errorList.map((row, idx) => (
                                                    <TableRow key={idx} className="grid grid-cols-[13%_22%_35%_30%] hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                                                        <TableCell className="px-4 py-3 font-mono text-sm text-gray-800 dark:text-gray-200">{row.maSinhVien}</TableCell>
                                                        <TableCell className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{row.hoTen}</TableCell>
                                                        <TableCell className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{row.maLopHocPhan}</TableCell>
                                                        <TableCell className="px-4 py-3 font-mono text-red-600 dark:text-red-400 text-sm">{row.message ?? "Lỗi không xác định"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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

export default function ThemSinhvienPage() {
    const params = useParams();
    const namHocId = (params?.namHocId as string) ?? "";
    const hocKyId = (params?.hocKyId as string) ?? "";
    const hocKyNum = parseInt(hocKyId, 10) || 0;

    const [apiData, setApiData] = useState<DeXuatResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
    const [selectedLHPMap, setSelectedLHPMap] = useState<Record<number, number>>({});
    const [searchKeyword, setSearchKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const [editModalItem, setEditModalItem] = useState<DeXuatItem | null>(null);
    const [isConfirmAddModalOpen, setIsConfirmAddModalOpen] = useState(false);
    const [isConfirmAddResultModalOpen, setIsConfirmAddResultModalOpen] = useState(false);
    const [confirmSubmitting, setConfirmSubmitting] = useState(false);
    const [confirmSuccessList, setConfirmSuccessList] = useState<ConfirmResultRow[]>([]);
    const [confirmErrorList, setConfirmErrorList] = useState<ConfirmResultRow[]>([]);

    const fetchDeXuat = useCallback(async (idsToKeepRemoved?: number[]) => {
        if (!namHocId || !hocKyId) return;
        setLoading(true);
        setFetchError(null);
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/bao-cao/de-xuat-hoc-lai/json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ maNamHoc: namHocId, hocKy: hocKyNum }),
            });
            const data: DeXuatResponse = await res.json();
            if (res.ok) {
                setApiData({ ...data });
                setRemovedIds(idsToKeepRemoved?.length ? new Set(idsToKeepRemoved) : new Set());
                const nextMap: Record<number, number> = {};
                data.items.forEach((it) => {
                    nextMap[it.sinhVienId] =
                        it.bestChoiceLopHocPhan?.lopHocPhanId ??
                        it.cacLopHocPhanCoTheDangKy[0]?.lopHocPhanId ??
                        null;
                });
                setSelectedLHPMap(nextMap);
            } else {
                setFetchError((data as any).message ?? "Không tải được dữ liệu");
            }
        } catch {
            setFetchError("Lỗi kết nối");
        } finally {
            setLoading(false);
        }
    }, [namHocId, hocKyId, hocKyNum]);

    useEffect(() => {
        fetchDeXuat();
    }, [fetchDeXuat]);

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

    const toggleDropdown = (id: number) => {
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
                    `http://localhost:3000/giang-day/lop-hoc-phan/${lhpId}/sinh-vien-dang-ky/${sv.sinhVienId}`,
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
        await fetchDeXuat(successIds);
    };

    const tenNamHoc = apiData?.tenNamHoc ?? "";
    const tongSinhVien = apiData?.tongSinhVien ?? 0;
    const soSinhVienHienThi = displayItems.length;

    return (
        <div>
            <PageBreadcrumb pageTitle="Thêm sinh viên học lại" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {fetchError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300">
                        {fetchError}
                    </div>
                )}

                {/* Header */}
                <div className="mb-6 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Năm học</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{apiData?.maNamHoc ?? namHocId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tên năm học</p>
                            <p className="font-semibold text-gray-800 dark:text-white">{tenNamHoc || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Học kỳ & Số SV cần học lại (hiển thị)</p>
                            <p className="font-semibold text-gray-800 dark:text-white">
                                Học kỳ {hocKyNum} — {soSinhVienHienThi} sinh viên
                            </p>
                        </div>
                    </div>
                </div>

                {/* Toolbar: search + confirm button */}
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
                        disabled={displayItems.length === 0}
                    >
                        Xác nhận thêm sinh viên vào các lớp học phần
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="overflow-x-auto">
                        <Table className="w-full table-fixed">
                            <colgroup>
                                <col style={{ width: "12%" }} />
                                <col style={{ width: "14%" }} />
                                <col style={{ width: "17%" }} />
                                <col style={{ width: "8%" }} />
                                <col style={{ width: "8%" }} />
                                <col style={{ width: "9%" }} />
                                <col style={{ width: "8%" }} />
                                <col style={{ width: "14%" }} />
                            </colgroup>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-left whitespace-nowrap">Mã sinh viên</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-left">Họ tên</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-left whitespace-nowrap">LHP trượt</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-center whitespace-nowrap">TBCHP</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-center whitespace-nowrap">Điểm số</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-center whitespace-nowrap">Điểm chữ</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-center">Đánh giá</TableCell>
                                    <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-theme-xs text-center whitespace-nowrap">Hành động</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                {paginatedItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell cols={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            {displayItems.length === 0 ? "Không có sinh viên cần học lại" : "Không có kết quả tìm kiếm"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedItems.map((sv) => (
                                        <TableRow key={sv.sinhVienId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                            <TableCell className="px-4 py-3 font-mono text-gray-800 dark:text-white/90 text-left max-w-0"><span className="block truncate" title={sv.maSinhVien}>{sv.maSinhVien}</span></TableCell>
                                            <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-left max-w-0"><span className="block truncate" title={sv.hoTen}>{sv.hoTen}</span></TableCell>
                                            <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-left max-w-0"><span className="block truncate" title={sv.maLopHocPhanTruot}>{sv.maLopHocPhanTruot}</span></TableCell>
                                            <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-center">{sv.diemTBCHP}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-center">{sv.diemSo}</TableCell>
                                            <TableCell className="px-4 py-3 text-gray-800 dark:text-white/90 text-center">{sv.diemChu}</TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <Badge variant="light" color="error">{formatDanhGia(sv.danhGia)}</Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                <div className="relative inline-block">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleDropdown(sv.sinhVienId)}
                                                        className="dropdown-toggle flex items-center gap-1.5 min-w-[90px] justify-between px-3 py-2"
                                                    >
                                                        Thao tác
                                                        <FaAngleDown
                                                            className={`text-gray-500 transition-transform duration-300 shrink-0 ${activeDropdownId === sv.sinhVienId ? "rotate-180" : "rotate-0"}`}
                                                        />
                                                    </Button>
                                                    <Dropdown
                                                        isOpen={activeDropdownId === sv.sinhVienId}
                                                        onClose={closeDropdown}
                                                        className="w-48 mt-2 right-0"
                                                    >
                                                        <div className="py-1">
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
                                    ))
                                )}
                            </TableBody>
                        </Table>
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
            </div>

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
                    onClose={() => setIsConfirmAddModalOpen(false)}
                    className="max-w-md"
                >
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                            Xác nhận thêm sinh viên
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Bạn sẽ thêm {displayItems.filter((sv) => selectedLHPMap[sv.sinhVienId] != null).length} sinh viên vào các lớp học phần tương ứng. Tiếp tục?
                        </p>
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
        </div>
    );
}
