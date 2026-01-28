"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
    faPlus,
    faPenToSquare,
    faTrash,
    faDownload,
    faSpinner,
    faCheckCircle,
    faTimesCircle,
    faExclamationTriangle,
    faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import SearchableSelect from "@/components/form/SelectCustom";
import MultiSelectCustom from "@/components/form/MultiSelectCustom";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { FaAngleDown } from "react-icons/fa6";

// ==================== INTERFACES ====================
interface Khoa {
    id: number;
    maKhoa: string;
    tenKhoa: string;
}

interface Nganh {
    id: number;
    maNganh: string;
    tenNganh: string;
    moTa: string | null;
    khoa: Khoa;
}

interface NienKhoa {
    id: number;
    maNienKhoa: string;
    tenNienKhoa: string;
    namBatDau: number;
    namKetThuc: number;
    moTa: string;
}

interface MonHoc {
    id: number;
    tenMonHoc: string;
    maMonHoc: string;
    loaiMon: "DAI_CUONG" | "CHUYEN_NGANH" | "TU_CHON";
    soTinChi: number;
    moTa: string;
}

interface MonHocTrongCTDT {
    id?: number;
    thuTuHocKy: number;
    monHoc: MonHoc;
    ghiChu: string;
}

interface ChuongTrinhDaoTao {
    id: number;
    maChuongTrinh: string;
    tenChuongTrinh: string;
    thoiGianDaoTao: number;
    nganh: Nganh;
    apDungChuongTrinhs: Array<{
        id: number;
        nienKhoa: NienKhoa;
        ngayApDung: string;
        ghiChu: string | null;
    }>;
}

interface ApiError {
    message: string;
    field?: string;
}

// ==================== HELPER FUNCTIONS ====================
const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
};

const formatDateNoTimezone = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const getLoaiMonLabel = (loaiMon: string): string => {
    switch (loaiMon) {
        case "DAI_CUONG":
            return "Đại cương";
        case "CHUYEN_NGANH":
            return "Chuyên ngành";
        case "TU_CHON":
            return "Tự chọn";
        default:
            return loaiMon;
    }
};

// ==================== MAIN COMPONENT ====================
export default function TaoCTDT() {
    const router = useRouter();

    // ==================== STATE ====================
    // Form data
    const [formData, setFormData] = useState({
        maChuongTrinh: "",
        tenChuongTrinh: "",
        thoiGianDaoTao: "",
        nganhId: "",
        nienKhoaIds: [] as string[],
        ghiChu: "",
    });

    // Options data
    const [chuongTrinhs, setChuongTrinhs] = useState<ChuongTrinhDaoTao[]>([]);
    const [nganhs, setNganhs] = useState<Nganh[]>([]);
    const [khoas, setKhoas] = useState<Khoa[]>([]);
    const [nienKhoas, setNienKhoas] = useState<NienKhoa[]>([]);
    const [monHocs, setMonHocs] = useState<MonHoc[]>([]);

    // Table data
    const [monHocTrongCTDT, setMonHocTrongCTDT] = useState<MonHocTrongCTDT[]>([]);

    // Filter for loading CTDT
    const [loadFilter, setLoadFilter] = useState({
        nganhId: "",
        nienKhoaId: "",
        chuongTrinhId: "",
    });

    // Modal states
    const [isAddMonHocModalOpen, setIsAddMonHocModalOpen] = useState(false);
    const [isEditMonHocModalOpen, setIsEditMonHocModalOpen] = useState(false);
    const [isCreateCTDTModalOpen, setIsCreateCTDTModalOpen] = useState(false);
    const [isLoadCTDTModalOpen, setIsLoadCTDTModalOpen] = useState(false);
    const [editingMonHoc, setEditingMonHoc] = useState<MonHocTrongCTDT | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);

    // Form for add/edit mon hoc
    const [monHocFormData, setMonHocFormData] = useState({
        thuTuHocKy: "",
        loaiMon: "",
        monHocId: "",
        ghiChu: "",
    });

    // Errors
    const [formErrors, setFormErrors] = useState({
        maChuongTrinh: false,
        tenChuongTrinh: false,
        thoiGianDaoTao: false,
        nganhId: false,
        nienKhoaIds: false,
    });

    const [monHocFormErrors, setMonHocFormErrors] = useState({
        thuTuHocKy: false,
        loaiMon: false,
        monHocId: false,
    });

    // Error message for add mon hoc modal
    const [addMonHocError, setAddMonHocError] = useState<string>("");

    // Alert
    const [alert, setAlert] = useState<{
        id: number;
        variant: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
    } | null>(null);

    // Create CTDT process
    const [createProcess, setCreateProcess] = useState({
        step: 0, // 0: màn xác nhận, 1: bước 1, 2: bước 2, 3: bước 3
        isProcessing: false,
        step1Result: null as any,
        step2Results: [] as Array<{ success: boolean; data?: any; error?: string; nienKhoaId?: string }>,
        step3Results: [] as Array<{ success: boolean; data?: any; error?: string; monHoc?: string }>,
    });

    // Tìm kiếm môn học trong table
    const [monHocTableSearchKeyword, setMonHocTableSearchKeyword] = useState("");

    // ==================== COMPUTED VALUES ====================
    // Filter available nien khoas based on selected nganh
    const availableNienKhoas = useMemo(() => {
        if (!formData.nganhId) return nienKhoas;

        // Get all nien khoas that are already applied to this nganh
        const appliedNienKhoaIds = new Set<number>();
        chuongTrinhs.forEach((ct) => {
            if (ct.nganh.id.toString() === formData.nganhId) {
                ct.apDungChuongTrinhs.forEach((ad) => {
                    appliedNienKhoaIds.add(ad.nienKhoa.id);
                });
            }
        });

        // Return nien khoas that are NOT applied
        return nienKhoas.filter((nk) => !appliedNienKhoaIds.has(nk.id));
    }, [formData.nganhId, nienKhoas, chuongTrinhs]);

    // Filter mon hocs by loai mon
    const filteredMonHocs = useMemo(() => {
        if (!monHocFormData.loaiMon) return monHocs;
        return monHocs.filter((mh) => mh.loaiMon === monHocFormData.loaiMon);
    }, [monHocs, monHocFormData.loaiMon]);

    // Sorted mon hoc trong CTDT
    const sortedMonHocTrongCTDT = useMemo(() => {
        return [...monHocTrongCTDT].sort((a, b) => a.thuTuHocKy - b.thuTuHocKy);
    }, [monHocTrongCTDT]);

    // Môn học đã lọc theo ô tìm kiếm (mã hoặc tên)
    const filteredMonHocTrongCTDT = useMemo(() => {
        const kw = monHocTableSearchKeyword.trim().toLowerCase();
        if (!kw) return sortedMonHocTrongCTDT;
        return sortedMonHocTrongCTDT.filter(
            (mh) =>
                mh.monHoc.maMonHoc.toLowerCase().includes(kw) ||
                mh.monHoc.tenMonHoc.toLowerCase().includes(kw)
        );
    }, [sortedMonHocTrongCTDT, monHocTableSearchKeyword]);

    // Filter chuong trinhs for load modal
    const filteredChuongTrinhs = useMemo(() => {
        let filtered = chuongTrinhs;
        if (loadFilter.nganhId) {
            filtered = filtered.filter((ct) => ct.nganh.id.toString() === loadFilter.nganhId);
        }
        if (loadFilter.nienKhoaId) {
            filtered = filtered.filter((ct) =>
                ct.apDungChuongTrinhs.some((ad) => ad.nienKhoa.id.toString() === loadFilter.nienKhoaId)
            );
        }
        return filtered;
    }, [chuongTrinhs, loadFilter]);

    // ==================== API CALLS ====================
    const fetchChuongTrinhs = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/dao-tao/chuong-trinh?page=1&limit=9999", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setChuongTrinhs(json.data);
            }
        } catch (err) {
            console.error("Error fetching chuong trinhs:", err);
        }
    };

    const fetchNganhs = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/nganh?limit=9999&page=1", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNganhs(json.data);
            }
            if (json.filters?.khoa) {
                setKhoas(json.filters.khoa);
            }
        } catch (err) {
            console.error("Error fetching nganhs:", err);
        }
    };

    const fetchNienKhoas = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/nien-khoa?page=1&limit=9999", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.data) {
                setNienKhoas(json.data);
            }
        } catch (err) {
            console.error("Error fetching nien khoas:", err);
        }
    };

    const fetchMonHocs = async () => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch("http://localhost:3000/danh-muc/mon-hoc", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (Array.isArray(json)) {
                setMonHocs(json);
            }
        } catch (err) {
            console.error("Error fetching mon hocs:", err);
        }
    };

    const fetchMonHocsFromCTDT = async (chuongTrinhId: number) => {
        try {
            const accessToken = getCookie("access_token");
            const res = await fetch(`http://localhost:3000/dao-tao/chuong-trinh/tat-ca-mon-hoc/${chuongTrinhId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const json = await res.json();
            if (json.monHocs) {
                const mappedMonHocs: MonHocTrongCTDT[] = json.monHocs.map((mh: any) => ({
                    id: mh.id,
                    thuTuHocKy: mh.thuTuHocKy,
                    monHoc: mh.monHoc,
                    ghiChu: mh.ghiChu || "",
                }));
                setMonHocTrongCTDT(mappedMonHocs);
                showAlert("success", "Thành công", "Đã tải môn học từ chương trình đào tạo");
            }
        } catch (err) {
            showAlert("error", "Lỗi", "Không thể tải môn học từ chương trình đào tạo");
        }
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        fetchChuongTrinhs();
        fetchNganhs();
        fetchNienKhoas();
        fetchMonHocs();
    }, []);

    // ==================== HANDLERS ====================
    const showAlert = (
        variant: "success" | "error" | "warning" | "info",
        title: string,
        message: string
    ) => {
        setAlert({
            id: Date.now(),
            variant,
            title,
            message,
        });
    };

    const handleFormChange = (field: string, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (field === "nganhId") {
            // Reset nien khoa when nganh changes
            setFormData((prev) => ({ ...prev, nienKhoaIds: [] }));
        }
        // Clear error
        if (field in formErrors) {
            setFormErrors((prev) => ({ ...prev, [field]: false }));
        }
    };

    const validateForm = (): boolean => {
        const errors = {
            maChuongTrinh: !formData.maChuongTrinh.trim(),
            tenChuongTrinh: !formData.tenChuongTrinh.trim(),
            thoiGianDaoTao: !formData.thoiGianDaoTao,
            nganhId: !formData.nganhId,
            nienKhoaIds: formData.nienKhoaIds.length === 0,
        };

        // Check duplicate ma chuong trinh
        if (formData.maChuongTrinh.trim()) {
            const isDuplicate = chuongTrinhs.some(
                (ct) => ct.maChuongTrinh.toLowerCase() === formData.maChuongTrinh.trim().toLowerCase()
            );
            if (isDuplicate) {
                errors.maChuongTrinh = true;
                showAlert("error", "Lỗi", "Mã chương trình đào tạo đã tồn tại");
            }
        }

        setFormErrors(errors);
        return !Object.values(errors).some((e) => e);
    };

    const validateMonHocForm = (): boolean => {
        const errors = {
            thuTuHocKy: !monHocFormData.thuTuHocKy,
            loaiMon: !monHocFormData.loaiMon,
            monHocId: !monHocFormData.monHocId,
        };
        setMonHocFormErrors(errors);
        setAddMonHocError(""); // Clear previous error

        // Check duplicate mon hoc
        if (monHocFormData.monHocId) {
            const isDuplicate = monHocTrongCTDT.some(
                (mh) => mh.monHoc.id.toString() === monHocFormData.monHocId
            );
            if (isDuplicate) {
                setAddMonHocError("Môn học này đã được thêm vào CTĐT");
                return false;
            }
        }

        // Check if any field is empty
        if (Object.values(errors).some((e) => e)) {
            setAddMonHocError("Vui lòng điền đầy đủ thông tin bắt buộc");
            return false;
        }

        return true;
    };

    const handleAddMonHoc = () => {
        if (!validateMonHocForm()) return;

        const selectedMonHoc = monHocs.find((mh) => mh.id.toString() === monHocFormData.monHocId);
        if (!selectedMonHoc) return;

        const newMonHoc: MonHocTrongCTDT = {
            thuTuHocKy: Number(monHocFormData.thuTuHocKy),
            monHoc: selectedMonHoc,
            ghiChu: monHocFormData.ghiChu,
        };

        setMonHocTrongCTDT((prev) => [...prev, newMonHoc]);
        setMonHocFormData({
            thuTuHocKy: "",
            loaiMon: "",
            monHocId: "",
            ghiChu: "",
        });
        setIsAddMonHocModalOpen(false);
        showAlert("success", "Thành công", "Đã thêm môn học vào chương trình đào tạo");
    };

    const handleEditMonHoc = () => {
        if (!editingMonHoc) return;

        const updatedMonHocs = monHocTrongCTDT.map((mh) =>
            mh.monHoc.id === editingMonHoc.monHoc.id
                ? {
                    ...mh,
                    thuTuHocKy: Number(monHocFormData.thuTuHocKy),
                    ghiChu: monHocFormData.ghiChu,
                }
                : mh
        );

        setMonHocTrongCTDT(updatedMonHocs);
        setEditingMonHoc(null);
        setMonHocFormData({
            thuTuHocKy: "",
            loaiMon: "",
            monHocId: "",
            ghiChu: "",
        });
        setIsEditMonHocModalOpen(false);
        showAlert("success", "Thành công", "Đã cập nhật môn học");
    };

    const handleDeleteMonHoc = (monHoc: MonHocTrongCTDT) => {
        setMonHocTrongCTDT((prev) => prev.filter((mh) => mh.monHoc.id !== monHoc.monHoc.id));
        showAlert("success", "Thành công", "Đã xóa môn học khỏi chương trình đào tạo");
    };

    const openEditMonHocModal = (monHoc: MonHocTrongCTDT) => {
        setEditingMonHoc(monHoc);
        setMonHocFormData({
            thuTuHocKy: monHoc.thuTuHocKy.toString(),
            loaiMon: monHoc.monHoc.loaiMon,
            monHocId: monHoc.monHoc.id.toString(),
            ghiChu: monHoc.ghiChu,
        });
        setIsEditMonHocModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleCreateCTDT = () => {
        if (!validateForm()) return;
        setIsCreateCTDTModalOpen(true);
        setCreateProcess({
            step: 0,
            isProcessing: false,
            step1Result: null,
            step2Results: [],
            step3Results: [],
        });
    };

    const confirmAndCreateCTDT = async () => {
        setCreateProcess((prev) => ({
            ...prev,
            step: 1,
            isProcessing: true,
            step1Result: null,
            step2Results: [],
            step3Results: [],
        }));

        const accessToken = getCookie("access_token");

        // Step 1: Create chuong trinh
        try {
            const step1Res = await fetch("http://localhost:3000/dao-tao/chuong-trinh", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    maChuongTrinh: formData.maChuongTrinh.trim(),
                    tenChuongTrinh: formData.tenChuongTrinh.trim(),
                    thoiGianDaoTao: Number(formData.thoiGianDaoTao),
                    nganhId: Number(formData.nganhId),
                }),
            });

            const step1Data = await step1Res.json();

            if (!step1Res.ok) {
                setCreateProcess((prev) => ({
                    ...prev,
                    step: 1,
                    isProcessing: false,
                    step1Result: { success: false, error: step1Data.message || "Lỗi không xác định" },
                }));
                return;
            }

            // Step 1 succeeded, save result
            const step1Result = { success: true, data: step1Data };
            setCreateProcess((prev) => ({
                ...prev,
                step: 2,
                step1Result,
            }));

            // Step 2: Apply to nien khoas
            const step2Promises = formData.nienKhoaIds.map(async (nienKhoaId) => {
                try {
                    const step2Res = await fetch("http://localhost:3000/dao-tao/ap-dung", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({
                            chuongTrinhId: step1Data.id,
                            nganhId: step1Data.nganh.id,
                            nienKhoaId: Number(nienKhoaId),
                            ngayApDung: formatDateNoTimezone(new Date()),
                            ghiChu: formData.ghiChu || null,
                        }),
                    });

                    const step2Data = await step2Res.json();
                    return {
                        success: step2Res.ok,
                        data: step2Res.ok ? step2Data : undefined,
                        error: step2Res.ok ? undefined : step2Data.message || "Lỗi không xác định",
                        nienKhoaId: nienKhoaId,
                    };
                } catch (err: any) {
                    return {
                        success: false,
                        error: err.message || "Lỗi không xác định",
                        nienKhoaId: nienKhoaId,
                    };
                }
            });

            const step2Results = await Promise.all(step2Promises);
            setCreateProcess((prev) => ({
                ...prev,
                step: 3,
                step2Results,
            }));

            // Step 3: Add mon hocs
            const step3Promises = monHocTrongCTDT.map(async (mh) => {
                try {
                    const step3Res = await fetch(
                        `http://localhost:3000/dao-tao/chuong-trinh/mon-hoc/${step1Data.id}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                thuTuHocKy: mh.thuTuHocKy,
                                monHocId: mh.monHoc.id,
                                ghiChu: mh.ghiChu || null,
                            }),
                        }
                    );

                    const step3Data = await step3Res.json();
                    return {
                        success: step3Res.ok,
                        data: step3Res.ok ? step3Data : undefined,
                        error: step3Res.ok ? undefined : step3Data.message || "Lỗi không xác định",
                        monHoc: mh.monHoc.maMonHoc,
                    };
                } catch (err: any) {
                    return {
                        success: false,
                        error: err.message || "Lỗi không xác định",
                        monHoc: mh.monHoc.maMonHoc,
                    };
                }
            });

            const step3Results = await Promise.all(step3Promises);

            // Check if all steps succeeded
            // Step 1 already succeeded (we're here), so we only check step 2 and 3
            const allStep2Success = step2Results.length === 0 || step2Results.every((r) => r.success);
            const allStep3Success = step3Results.length === 0 || step3Results.every((r) => r.success);

            setCreateProcess((prev) => ({
                ...prev,
                isProcessing: false,
                step3Results,
            }));

            // If all steps succeeded, show success message
            if (step1Result.success && allStep2Success && allStep3Success) {
                showAlert("success", "Thành công", "Đã tạo chương trình đào tạo thành công");
                // Reset form và table để chuẩn bị cho lần tạo tiếp theo
                setFormData({
                    maChuongTrinh: "",
                    tenChuongTrinh: "",
                    thoiGianDaoTao: "",
                    nganhId: "",
                    nienKhoaIds: [],
                    ghiChu: "",
                });
                setMonHocTrongCTDT([]);
                setMonHocTableSearchKeyword("");
            }
        } catch (err: any) {
            setCreateProcess((prev) => ({
                ...prev,
                isProcessing: false,
                step1Result: { success: false, error: err.message || "Lỗi không xác định" },
            }));
        }
    };

    const handleLoadCTDT = () => {
        if (!loadFilter.chuongTrinhId) {
            showAlert("error", "Lỗi", "Vui lòng chọn chương trình đào tạo");
            return;
        }
        fetchMonHocsFromCTDT(Number(loadFilter.chuongTrinhId));
        setIsLoadCTDTModalOpen(false);
    };

    const toggleDropdown = (index: number) => {
        setActiveDropdownId(activeDropdownId === index ? null : index);
    };

    const closeDropdown = () => {
        setActiveDropdownId(null);
    };

    return (
        <div className="relative">
            <PageBreadcrumb pageTitle="Tạo mới Chương trình Đào tạo" />

            <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                {/* Alert */}
                {alert && (
                    <div className="mb-6">
                        <Alert
                            key={alert.id}
                            variant={alert.variant}
                            title={alert.title}
                            message={alert.message}
                            dismissible
                            autoDismiss
                            duration={15000}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}

                {/* Header Form */}
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3
                        className={`text-lg font-semibold text-gray-800 dark:text-white/90 ${formData.nienKhoaIds.length > 0 ? "mb-2" : "mb-6"
                            }`}
                    >
                        Thông tin Chương trình Đào tạo
                    </h3>
                    {formData.nienKhoaIds.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Niên khóa đã chọn:
                            </span>
                            {nienKhoas
                                .filter((nk) => formData.nienKhoaIds.includes(nk.id.toString()))
                                .map((nk) => (
                                    <Badge
                                        key={nk.id}
                                        variant="solid"
                                        color="info"
                                        className="inline-flex items-center gap-1"
                                    >
                                        {nk.maNienKhoa} – {nk.tenNienKhoa}
                                    </Badge>
                                ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mã Chương trình */}
                        <div>
                            <Label>Mã Chương trình Đào tạo *</Label>
                            <Input
                                value={formData.maChuongTrinh}
                                onChange={(e) => handleFormChange("maChuongTrinh", e.target.value)}
                                placeholder="VD: CNTT2021"
                                error={formErrors.maChuongTrinh}
                                hint={formErrors.maChuongTrinh ? "Mã chương trình không được để trống hoặc trùng" : ""}
                            />
                        </div>

                        {/* Tên Chương trình */}
                        <div>
                            <Label>Tên Chương trình Đào tạo *</Label>
                            <Input
                                value={formData.tenChuongTrinh}
                                onChange={(e) => handleFormChange("tenChuongTrinh", e.target.value)}
                                placeholder="VD: Cử nhân Công nghệ Thông tin"
                                error={formErrors.tenChuongTrinh}
                                hint={formErrors.tenChuongTrinh ? "Tên chương trình không được để trống" : ""}
                            />
                        </div>

                        {/* Thời gian đào tạo */}
                        <div>
                            <Label>Thời gian Đào tạo (năm) *</Label>
                            <Input
                                type="number"
                                value={formData.thoiGianDaoTao}
                                onChange={(e) => handleFormChange("thoiGianDaoTao", e.target.value)}
                                placeholder="VD: 4"
                                error={formErrors.thoiGianDaoTao}
                                hint={formErrors.thoiGianDaoTao ? "Thời gian đào tạo không được để trống" : ""}
                            />
                        </div>

                        {/* Ngành */}
                        <div>
                            <Label>Ngành *</Label>
                            <SearchableSelect
                                options={nganhs.map((n) => ({
                                    value: n.id.toString(),
                                    label: n.maNganh,
                                    secondary: n.tenNganh,
                                }))}
                                placeholder="Chọn ngành"
                                onChange={(value) => handleFormChange("nganhId", value)}
                                defaultValue={formData.nganhId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm ngành..."
                            />
                            {formErrors.nganhId && (
                                <p className="mt-1 text-sm text-error-500">Vui lòng chọn ngành</p>
                            )}
                        </div>

                        {/* Niên khóa */}
                        <div>
                            <Label>Niên khóa *</Label>
                            <MultiSelectCustom
                                options={availableNienKhoas.map((nk) => ({
                                    value: nk.id.toString(),
                                    label: nk.maNienKhoa,
                                    secondary: nk.tenNienKhoa,
                                }))}
                                placeholder="Chọn niên khóa"
                                onChange={(values) => handleFormChange("nienKhoaIds", values)}
                                defaultValue={formData.nienKhoaIds}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm niên khóa..."
                            />
                            {formErrors.nienKhoaIds && (
                                <p className="mt-1 text-sm text-error-500">Vui lòng chọn ít nhất một niên khóa</p>
                            )}
                            {formData.nganhId && availableNienKhoas.length === 0 && (
                                <p className="mt-1 text-sm text-warning-500">
                                    Tất cả niên khóa của ngành này đã có chương trình đào tạo
                                </p>
                            )}
                        </div>

                        {/* Ghi chú */}
                        <div className="md:col-span-2">
                            <Label>Ghi chú</Label>
                            <TextArea
                                placeholder="Nhập ghi chú (tùy chọn)"
                                rows={3}
                                value={formData.ghiChu}
                                onChange={(value) => handleFormChange("ghiChu", value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => router.push("/quan-ly-ctdt")}>
                            Hủy
                        </Button>
                        <Button variant="primary" onClick={() => setIsLoadCTDTModalOpen(true)}>
                            <FontAwesomeIcon icon={faDownload} />
                            Tải CTĐT
                        </Button>
                        <Button onClick={handleCreateCTDT}>
                            Tạo Chương trình Đào tạo
                        </Button>
                    </div>
                </div>

                {/* Table Môn học */}
                <div className="mb-6">
                    <div className="mb-4 flex flex-col gap-3">
                        {/* Search - nằm trên & bên trái */}
                        <div className="w-full max-w-md">
                            <div className="relative">
                                <button
                                    type="button"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto"
                                    aria-label="Tìm kiếm"
                                >
                                    <FontAwesomeIcon
                                        icon={faMagnifyingGlass}
                                        className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                    />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm môn học theo tên hoặc mã môn học..."
                                    value={monHocTableSearchKeyword}
                                    onChange={(e) => setMonHocTableSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                                    className="h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 
                focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 
                dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Danh sách Môn học ({monHocTrongCTDT.length})
                        </h3>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <div className="min-w-[900px]">
                                <Table>
                                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                        <TableRow className="grid grid-cols-[6%_14%_23%_10%_15%_20%_12%]">
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                            >
                                                HK
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Mã Môn học
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                                            >
                                                Tên Môn học
                                            </TableCell>
                                            <TableCell
                                                isHeader
                                                className="px-5 py-3 font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                                            >
                                                Số TC
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
                                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] text-theme-sm">
                                        {filteredMonHocTrongCTDT.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    cols={7}
                                                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    {monHocTableSearchKeyword.trim()
                                                        ? "Không tìm thấy môn học nào phù hợp với từ khóa tìm kiếm."
                                                        : "Chưa có môn học nào. Hãy thêm môn học vào chương trình đào tạo."}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredMonHocTrongCTDT.map((mh, index) => (
                                                <TableRow
                                                    key={`${mh.monHoc.id}-${index}`}
                                                    className="grid grid-cols-[6%_14%_23%_10%_15%_20%_12%] items-center hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                                                >
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 text-center">
                                                        <Badge variant="solid" color="info">
                                                            {mh.thuTuHocKy}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90 font-medium text-center">
                                                        {mh.monHoc.maMonHoc}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                                                        {mh.monHoc.tenMonHoc}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center text-gray-800 dark:text-white/90">
                                                        {mh.monHoc.soTinChi}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <Badge
                                                            variant="solid"
                                                            color={
                                                                mh.monHoc.loaiMon === "DAI_CUONG"
                                                                    ? "primary"
                                                                    : mh.monHoc.loaiMon === "CHUYEN_NGANH"
                                                                        ? "success"
                                                                        : "warning"
                                                            }
                                                        >
                                                            {getLoaiMonLabel(mh.monHoc.loaiMon)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate">
                                                        {mh.ghiChu || "-"}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 flex items-center justify-center">
                                                        <div className="relative inline-block">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => toggleDropdown(index)}
                                                                className="dropdown-toggle flex items-center gap-1.5 min-w-[110px] justify-between px-3 py-2"
                                                            >
                                                                Thao tác
                                                                <FaAngleDown
                                                                    className={`text-gray-500 transition-transform duration-300 ease-in-out ${activeDropdownId === index ? "rotate-180" : "rotate-0"
                                                                        }`}
                                                                />
                                                            </Button>

                                                            <Dropdown
                                                                isOpen={activeDropdownId === index}
                                                                onClose={closeDropdown}
                                                                className="w-56 mt-2 right-0"
                                                            >
                                                                <div className="py-1">
                                                                    <DropdownItem
                                                                        tag="button"
                                                                        onItemClick={closeDropdown}
                                                                        onClick={() => openEditMonHocModal(mh)}
                                                                    >
                                                                        <FontAwesomeIcon icon={faPenToSquare} className="mr-2 w-4" />
                                                                        Sửa
                                                                    </DropdownItem>

                                                                    <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                                                                    <DropdownItem
                                                                        tag="button"
                                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                                                        onItemClick={closeDropdown}
                                                                        onClick={() => handleDeleteMonHoc(mh)}
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
                </div>
            </div>

            {/* Sticky Add Mon Hoc Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <Button
                    onClick={() => {
                        setMonHocFormData({
                            thuTuHocKy: "",
                            loaiMon: "",
                            monHocId: "",
                            ghiChu: "",
                        });
                        setAddMonHocError("");
                        setMonHocFormErrors({
                            thuTuHocKy: false,
                            loaiMon: false,
                            monHocId: false,
                        });
                        setIsAddMonHocModalOpen(true);
                    }}
                    className="shadow-lg hover:shadow-xl transition-shadow rounded-full w-14 h-14 flex items-center justify-center"
                >
                    <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
                </Button>
            </div>

            {/* Modal Thêm Môn học */}
            <Modal
                isOpen={isAddMonHocModalOpen}
                onClose={() => {
                    setIsAddMonHocModalOpen(false);
                    setMonHocFormData({
                        thuTuHocKy: "",
                        loaiMon: "",
                        monHocId: "",
                        ghiChu: "",
                    });
                    setAddMonHocError("");
                    setMonHocFormErrors({
                        thuTuHocKy: false,
                        loaiMon: false,
                        monHocId: false,
                    });
                }}
                className="max-w-lg"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Thêm Môn học vào CTĐT
                    </h3>

                    {/* Error Alert */}
                    {addMonHocError && (
                        <div className="mb-6">
                            <Alert
                                variant="error"
                                title="Lỗi"
                                message={addMonHocError}
                                dismissible
                                onClose={() => setAddMonHocError("")}
                            />
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Thứ tự học kỳ */}
                        <div>
                            <Label>Thứ tự Học kỳ *</Label>
                            <SearchableSelect
                                options={Array.from({ length: 8 }, (_, i) => ({
                                    value: (i + 1).toString(),
                                    label: `Học kỳ ${i + 1}`,
                                }))}
                                placeholder="Chọn thứ tự học kỳ"
                                onChange={(value) =>
                                    setMonHocFormData((prev) => ({ ...prev, thuTuHocKy: value }))
                                }
                                defaultValue={monHocFormData.thuTuHocKy}
                                showSecondary={false}
                            />
                            {monHocFormErrors.thuTuHocKy && (
                                <p className="mt-1 text-sm text-error-500">Vui lòng chọn thứ tự học kỳ</p>
                            )}
                        </div>

                        {/* Loại môn */}
                        <div>
                            <Label>Loại môn *</Label>
                            <SearchableSelect
                                options={[
                                    { value: "DAI_CUONG", label: "Đại cương" },
                                    { value: "CHUYEN_NGANH", label: "Chuyên ngành" },
                                    { value: "TU_CHON", label: "Tự chọn" },
                                ]}
                                placeholder="Chọn loại môn"
                                onChange={(value) => {
                                    setMonHocFormData((prev) => ({
                                        ...prev,
                                        loaiMon: value,
                                        monHocId: "", // Reset mon hoc when loai mon changes
                                    }));
                                    setAddMonHocError("");
                                    setMonHocFormErrors((prev) => ({ ...prev, loaiMon: false, monHocId: false }));
                                }}
                                defaultValue={monHocFormData.loaiMon}
                                showSecondary={false}
                            />
                            {monHocFormErrors.loaiMon && (
                                <p className="mt-1 text-sm text-error-500">Vui lòng chọn loại môn</p>
                            )}
                        </div>

                        {/* Môn học */}
                        <div>
                            <Label>Môn học *</Label>
                            <SearchableSelect
                                options={filteredMonHocs.map((mh) => ({
                                    value: mh.id.toString(),
                                    label: mh.maMonHoc,
                                    secondary: mh.tenMonHoc,
                                }))}
                                placeholder={
                                    monHocFormData.loaiMon
                                        ? "Chọn môn học"
                                        : "Vui lòng chọn loại môn trước"
                                }
                                onChange={(value) => {
                                    setMonHocFormData((prev) => ({ ...prev, monHocId: value }));
                                    setAddMonHocError("");
                                    setMonHocFormErrors((prev) => ({ ...prev, monHocId: false }));
                                }}
                                defaultValue={monHocFormData.monHocId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm môn học..."
                                disabled={!monHocFormData.loaiMon}
                            />
                            {monHocFormErrors.monHocId && (
                                <p className="mt-1 text-sm text-error-500">Vui lòng chọn môn học</p>
                            )}
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <Label>Ghi chú</Label>
                            <TextArea
                                placeholder="Nhập ghi chú (tùy chọn)"
                                rows={3}
                                value={monHocFormData.ghiChu}
                                onChange={(value) => setMonHocFormData((prev) => ({ ...prev, ghiChu: value }))}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddMonHocModalOpen(false);
                                setMonHocFormData({
                                    thuTuHocKy: "",
                                    loaiMon: "",
                                    monHocId: "",
                                    ghiChu: "",
                                });
                                setAddMonHocError("");
                                setMonHocFormErrors({
                                    thuTuHocKy: false,
                                    loaiMon: false,
                                    monHocId: false,
                                });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleAddMonHoc}>Thêm môn học</Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Sửa Môn học */}
            <Modal
                isOpen={isEditMonHocModalOpen}
                onClose={() => {
                    setIsEditMonHocModalOpen(false);
                    setEditingMonHoc(null);
                    setMonHocFormData({
                        thuTuHocKy: "",
                        loaiMon: "",
                        monHocId: "",
                        ghiChu: "",
                    });
                }}
                className="max-w-lg"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Sửa Môn học trong Chương trình Đào tạo
                    </h3>
                    <div className="space-y-5">
                        {/* Môn học (read-only) */}
                        <div>
                            <Label>Môn học</Label>
                            <Input
                                value={
                                    editingMonHoc
                                        ? `${editingMonHoc.monHoc.maMonHoc} - ${editingMonHoc.monHoc.tenMonHoc}`
                                        : ""
                                }
                                disabled
                                className="bg-gray-100 dark:bg-gray-800"
                            />
                        </div>

                        {/* Thứ tự học kỳ */}
                        <div>
                            <Label>Thứ tự Học kỳ *</Label>
                            <SearchableSelect
                                options={Array.from({ length: 8 }, (_, i) => ({
                                    value: (i + 1).toString(),
                                    label: `Học kỳ ${i + 1}`,
                                }))}
                                placeholder="Chọn thứ tự học kỳ"
                                onChange={(value) =>
                                    setMonHocFormData((prev) => ({ ...prev, thuTuHocKy: value }))
                                }
                                defaultValue={monHocFormData.thuTuHocKy}
                                showSecondary={false}
                            />
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <Label>Ghi chú</Label>
                            <TextArea
                                placeholder="Nhập ghi chú (tùy chọn)"
                                rows={3}
                                value={monHocFormData.ghiChu}
                                onChange={(value) => setMonHocFormData((prev) => ({ ...prev, ghiChu: value }))}
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditMonHocModalOpen(false);
                                setEditingMonHoc(null);
                                setMonHocFormData({
                                    thuTuHocKy: "",
                                    loaiMon: "",
                                    monHocId: "",
                                    ghiChu: "",
                                });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleEditMonHoc}>Cập nhật</Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Xác nhận Tạo CTĐT */}
            <Modal
                isOpen={isCreateCTDTModalOpen}
                onClose={() => {
                    if (!createProcess.isProcessing) {
                        setIsCreateCTDTModalOpen(false);
                        setCreateProcess({
                            step: 0,
                            isProcessing: false,
                            step1Result: null,
                            step2Results: [],
                            step3Results: [],
                        });
                    }
                }}
                className="max-w-4xl"
            >
                <div className="p-6 sm:p-8">
                    {/* Màn xác nhận (step 0): hiển thị thông tin tóm tắt trước khi tạo */}
                    {createProcess.step === 0 && !createProcess.isProcessing && (
                        <>
                            <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                                Xác nhận Tạo Chương trình Đào tạo
                            </h3>
                            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                                Vui lòng kiểm tra thông tin dưới đây trước khi xác nhận tạo chương trình đào tạo.
                            </p>

                            <div className="mb-8 space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/30">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Mã chương trình
                                        </span>
                                        <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                            {formData.maChuongTrinh || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Tên chương trình
                                        </span>
                                        <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                            {formData.tenChuongTrinh || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Thời gian đào tạo
                                        </span>
                                        <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                            {formData.thoiGianDaoTao ? `${formData.thoiGianDaoTao} năm` : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Ngành
                                        </span>
                                        <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                            {(() => {
                                                const n = nganhs.find((x) => x.id.toString() === formData.nganhId);
                                                return n ? `${n.maNganh} – ${n.tenNganh}` : "—";
                                            })()}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Niên khóa áp dụng
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.nienKhoaIds.length === 0 ? (
                                            <span className="text-gray-500 dark:text-gray-400">—</span>
                                        ) : (
                                            nienKhoas
                                                .filter((nk) => formData.nienKhoaIds.includes(nk.id.toString()))
                                                .map((nk) => (
                                                    <Badge
                                                        key={nk.id}
                                                        variant="solid"
                                                        color="info"
                                                        className="inline-flex"
                                                    >
                                                        {nk.maNienKhoa} – {nk.tenNienKhoa}
                                                    </Badge>
                                                ))
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Số môn học trong CTĐT
                                    </span>
                                    <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                                        {monHocTrongCTDT.length} môn học
                                    </p>
                                </div>
                                {formData.ghiChu && (
                                    <div>
                                        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Ghi chú
                                        </span>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                            {formData.ghiChu}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateCTDTModalOpen(false);
                                        setCreateProcess({
                                            step: 0,
                                            isProcessing: false,
                                            step1Result: null,
                                            step2Results: [],
                                            step3Results: [],
                                        });
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button onClick={confirmAndCreateCTDT}>Xác nhận tạo</Button>
                            </div>
                        </>
                    )}

                    {/* Tiến trình tạo (step 1/2/3): tabs + nội dung từng bước */}
                    {createProcess.step > 0 && (
                        <>
                            <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                                Tiến trình Tạo Chương trình Đào tạo
                            </h3>

                            {/* Tabs */}
                            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setCreateProcess((prev) => ({ ...prev, step: 1 }))}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${createProcess.step === 1
                                            ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                            }`}
                                    >
                                        Bước 1: Tạo CTĐT
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (createProcess.step1Result?.success || createProcess.step2Results.length > 0) {
                                                setCreateProcess((prev) => ({ ...prev, step: 2 }));
                                            }
                                        }}
                                        disabled={!createProcess.step1Result?.success && createProcess.step2Results.length === 0}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${createProcess.step === 2
                                            ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                            : (createProcess.step1Result?.success || createProcess.step2Results.length > 0)
                                                ? "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                : "border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                            }`}
                                    >
                                        Bước 2: Áp dụng Niên khóa
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (createProcess.step2Results.length > 0 || createProcess.step3Results.length > 0) {
                                                setCreateProcess((prev) => ({ ...prev, step: 3 }));
                                            }
                                        }}
                                        disabled={createProcess.step2Results.length === 0 && createProcess.step3Results.length === 0}
                                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${createProcess.step === 3
                                            ? "border-brand-500 text-brand-600 dark:text-brand-400"
                                            : (createProcess.step2Results.length > 0 || createProcess.step3Results.length > 0)
                                                ? "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                : "border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                            }`}
                                    >
                                        Bước 3: Thêm Môn học
                                    </button>
                                </div>
                            </div>

                            {/* Step 1 Content */}
                            {createProcess.step === 1 && (
                                <div className="space-y-4">
                                    {createProcess.isProcessing && !createProcess.step1Result && (
                                        <div className="flex items-center justify-center py-8">
                                            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-brand-500 animate-spin mr-3" />
                                            <span className="text-gray-600 dark:text-gray-400">Đang tạo chương trình đào tạo...</span>
                                        </div>
                                    )}

                                    {createProcess.step1Result && (
                                        <div
                                            className={`p-4 rounded-lg border ${createProcess.step1Result.success
                                                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <FontAwesomeIcon
                                                    icon={createProcess.step1Result.success ? faCheckCircle : faTimesCircle}
                                                    className={`w-5 h-5 mt-0.5 ${createProcess.step1Result.success ? "text-green-600" : "text-red-600"
                                                        }`}
                                                />
                                                <div className="flex-1">
                                                    <p
                                                        className={`font-medium ${createProcess.step1Result.success
                                                            ? "text-green-900 dark:text-green-100"
                                                            : "text-red-900 dark:text-red-100"
                                                            }`}
                                                    >
                                                        {createProcess.step1Result.success
                                                            ? "Tạo chương trình đào tạo thành công"
                                                            : "Tạo chương trình đào tạo thất bại"}
                                                    </p>
                                                    {createProcess.step1Result.success && createProcess.step1Result.data && (
                                                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                                            <p>Mã CTĐT: {createProcess.step1Result.data.maChuongTrinh}</p>
                                                            <p>Tên CTĐT: {createProcess.step1Result.data.tenChuongTrinh}</p>
                                                            <p>ID: {createProcess.step1Result.data.id}</p>
                                                        </div>
                                                    )}
                                                    {createProcess.step1Result.error && (
                                                        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                                                            {createProcess.step1Result.error}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2 Content */}
                            {createProcess.step === 2 && (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {createProcess.isProcessing && createProcess.step2Results.length === 0 && (
                                        <div className="flex items-center justify-center py-8">
                                            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-brand-500 animate-spin mr-3" />
                                            <span className="text-gray-600 dark:text-gray-400">Đang áp dụng niên khóa...</span>
                                        </div>
                                    )}

                                    {createProcess.step2Results.length > 0 && (
                                        <div className="space-y-3">
                                            {createProcess.step2Results.map((result, index) => {
                                                const nienKhoa = result.nienKhoaId
                                                    ? nienKhoas.find((nk) => nk.id.toString() === result.nienKhoaId)
                                                    : null;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`p-4 rounded-lg border ${result.success
                                                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                                            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <FontAwesomeIcon
                                                                icon={result.success ? faCheckCircle : faTimesCircle}
                                                                className={`w-5 h-5 mt-0.5 ${result.success ? "text-green-600" : "text-red-600"
                                                                    }`}
                                                            />
                                                            <div className="flex-1">
                                                                <p
                                                                    className={`font-medium ${result.success
                                                                        ? "text-green-900 dark:text-green-100"
                                                                        : "text-red-900 dark:text-red-100"
                                                                        }`}
                                                                >
                                                                    {nienKhoa
                                                                        ? `Niên khóa ${nienKhoa.maNienKhoa} - ${nienKhoa.tenNienKhoa}`
                                                                        : `Niên khóa #${index + 1}`}
                                                                </p>
                                                                {result.success && result.data && (
                                                                    <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                                                        Áp dụng thành công
                                                                    </p>
                                                                )}
                                                                {result.error && (
                                                                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                                                        {result.error}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3 Content */}
                            {createProcess.step === 3 && (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {createProcess.isProcessing && createProcess.step3Results.length === 0 && (
                                        <div className="flex items-center justify-center py-8">
                                            <FontAwesomeIcon icon={faSpinner} className="w-6 h-6 text-brand-500 animate-spin mr-3" />
                                            <span className="text-gray-600 dark:text-gray-400">Đang thêm môn học...</span>
                                        </div>
                                    )}

                                    {createProcess.step3Results.length > 0 && (
                                        <div className="space-y-3">
                                            {createProcess.step3Results.map((result, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg border ${result.success
                                                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                                        : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <FontAwesomeIcon
                                                            icon={result.success ? faCheckCircle : faTimesCircle}
                                                            className={`w-5 h-5 mt-0.5 ${result.success ? "text-green-600" : "text-red-600"
                                                                }`}
                                                        />
                                                        <div className="flex-1">
                                                            <p
                                                                className={`font-medium ${result.success
                                                                    ? "text-green-900 dark:text-green-100"
                                                                    : "text-red-900 dark:text-red-100"
                                                                    }`}
                                                            >
                                                                {result.monHoc || `Môn học #${index + 1}`}
                                                            </p>
                                                            {result.success && (
                                                                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                                                    Thêm thành công
                                                                </p>
                                                            )}
                                                            {result.error && (
                                                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                                                    {result.error}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (!createProcess.isProcessing) {
                                            setIsCreateCTDTModalOpen(false);
                                            setCreateProcess({
                                                step: 0,
                                                isProcessing: false,
                                                step1Result: null,
                                                step2Results: [],
                                                step3Results: [],
                                            });
                                        }
                                    }}
                                    disabled={createProcess.isProcessing}
                                >
                                    {createProcess.isProcessing ? "Đang xử lý..." : "Đóng"}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/* Modal Tải CTĐT */}
            <Modal
                isOpen={isLoadCTDTModalOpen}
                onClose={() => setIsLoadCTDTModalOpen(false)}
                className="max-w-lg"
            >
                <div className="p-6 sm:p-8">
                    <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
                        Tải Chương trình Đào tạo
                    </h3>
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Chọn ngành và/hoặc niên khóa để lọc danh sách chương trình đào tạo. Sau đó chọn chương trình
                            đào tạo để tải danh sách môn học.
                        </p>
                    </div>
                    <div className="space-y-5">
                        {/* Chọn Ngành */}
                        <div>
                            <Label>Ngành (tùy chọn)</Label>
                            <SearchableSelect
                                options={nganhs.map((n) => ({
                                    value: n.id.toString(),
                                    label: n.maNganh,
                                    secondary: n.tenNganh,
                                }))}
                                placeholder="Tất cả ngành"
                                onChange={(value) =>
                                    setLoadFilter((prev) => ({ ...prev, nganhId: value, chuongTrinhId: "" }))
                                }
                                defaultValue={loadFilter.nganhId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm ngành..."
                            />
                        </div>

                        {/* Chọn Niên khóa */}
                        <div>
                            <Label>Niên khóa (tùy chọn)</Label>
                            <SearchableSelect
                                options={nienKhoas.map((nk) => ({
                                    value: nk.id.toString(),
                                    label: nk.maNienKhoa,
                                    secondary: nk.tenNienKhoa,
                                }))}
                                placeholder="Tất cả niên khóa"
                                onChange={(value) =>
                                    setLoadFilter((prev) => ({ ...prev, nienKhoaId: value, chuongTrinhId: "" }))
                                }
                                defaultValue={loadFilter.nienKhoaId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm niên khóa..."
                            />
                        </div>

                        {/* Chọn Chương trình */}
                        <div>
                            <Label>Chương trình Đào tạo *</Label>
                            <SearchableSelect
                                options={filteredChuongTrinhs.map((ct) => ({
                                    value: ct.id.toString(),
                                    label: ct.maChuongTrinh,
                                    secondary: ct.tenChuongTrinh,
                                }))}
                                placeholder="Chọn chương trình đào tạo"
                                onChange={(value) => setLoadFilter((prev) => ({ ...prev, chuongTrinhId: value }))}
                                defaultValue={loadFilter.chuongTrinhId}
                                showSecondary={true}
                                maxDisplayOptions={10}
                                searchPlaceholder="Tìm chương trình..."
                            />
                            {filteredChuongTrinhs.length === 0 && (loadFilter.nganhId || loadFilter.nienKhoaId) && (
                                <p className="mt-1 text-sm text-warning-500">
                                    Không tìm thấy chương trình đào tạo phù hợp
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsLoadCTDTModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleLoadCTDT} disabled={!loadFilter.chuongTrinhId}>
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
