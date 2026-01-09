"use client";
import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import Alert from "../ui/alert/Alert";
import TextArea from "../form/input/TextArea";
import { FaPen } from "react-icons/fa";
import DatePicker from "../form/date-picker";

interface GiangVienProfile {
  maGiangVien: string;
  hoTen: string;
  ngaySinh: string;
  email: string;
  sdt: string;
  gioiTinh: "NAM" | "NU" | "KHONG_XAC_DINH";
  diaChi: string;
}

export default function UserInfoCard() {
  const [profileData, setProfileData] = useState<GiangVienProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [hoTen, setHoTen] = useState("");
  const [ngaySinh, setNgaySinh] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sdt, setSdt] = useState("");
  const [gioiTinh, setGioiTinh] = useState("NAM");
  const [diaChi, setDiaChi] = useState("");

  // Error states
  const [hoTenError, setHoTenError] = useState(false);
  const [ngaySinhError, setNgaySinhError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [sdtError, setSdtError] = useState(false);
  const [diaChiError, setDiaChiError] = useState(false);

  // State cho alert ngoài (thành công/thất bại API)
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    show: boolean;
  }>({ type: "success", message: "", show: false });

  // State cho alert trong modal (validation và lỗi khác)
  const [modalAlert, setModalAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    show: boolean;
  }>({ type: "success", message: "", show: false });

  // Hàm đóng alert
  const closeAlert = () => setAlert((a) => ({ ...a, show: false }));
  const closeModalAlert = () => setModalAlert((a) => ({ ...a, show: false }));

  const options = [
    { value: "NAM", label: "Nam" },
    { value: "NU", label: "Nữ" },
    { value: "KHONG_XAC_DINH", label: "Không xác định" },
  ];

  const { isOpen, openModal, closeModal } = useModal();

  // Get access token from cookie
  const getAccessToken = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie =>
      cookie.trim().startsWith('access_token=')
    );
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = getAccessToken();
        if (!token) {
          console.error("No access token found");
          return;
        }

        const response = await fetch("http://localhost:3000/danh-muc/giang-vien/me/my-profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const { id, ...profileWithoutId } = data;
          setProfileData(profileWithoutId);
        } else {
          console.error("Failed to fetch profile:", response.status);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    return `${day} ${monthNames[month - 1]}, ${year}`;
  };

  // Format gender for display
  const formatGioiTinh = (gioiTinh: string) => {
    const genderMap: Record<string, string> = {
      NAM: "Nam",
      NU: "Nữ",
      KHONG_XAC_DINH: "Không xác định"
    };
    return genderMap[gioiTinh] || gioiTinh;
  };

  // Handle open modal and populate form
  const handleOpenModal = () => {
    if (profileData) {
      setHoTen(profileData.hoTen);
      setNgaySinh(profileData.ngaySinh);
      setEmail(profileData.email);
      setSdt(profileData.sdt);
      setGioiTinh(profileData.gioiTinh);
      setDiaChi(profileData.diaChi);

      // Reset errors
      setHoTenError(false);
      setNgaySinhError(false);
      setEmailError(false);
      setSdtError(false);
      setDiaChiError(false);

      // Reset modal alert
      setModalAlert({ type: "success", message: "", show: false });
    }
    openModal();
  };

  const handleSelectChange = (value: string) => {
    setGioiTinh(value);
  };

  // Validation functions
  const validateHoTen = (value: string) => {
    const isValid = value.trim().length > 0;
    setHoTenError(!isValid);
    return isValid;
  };

  const validateNgaySinh = (value: string) => {
    const isValid = value.trim().length > 0;
    setNgaySinhError(!isValid);
    return isValid;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = value.trim().length > 0 && emailRegex.test(value);
    setEmailError(!isValid);
    return isValid;
  };

  const validateSdt = (value: string) => {
    const isValid = value.trim().length >= 10 && value.trim().length <= 15;
    setSdtError(!isValid);
    return isValid;
  };

  const validateDiaChi = (value: string) => {
    const isValid = value.trim().length > 0;
    setDiaChiError(!isValid);
    return isValid;
  };

  const handleSave = async () => {
    // Reset all errors first
    setHoTenError(false);
    setNgaySinhError(false);
    setEmailError(false);
    setSdtError(false);
    setDiaChiError(false);
    setModalAlert({ type: "success", message: "", show: false });

    // Nếu không thay đổi gì thì hiện alert info trong modal
    if (
      profileData &&
      hoTen === profileData.hoTen &&
      ngaySinh === profileData.ngaySinh &&
      email === profileData.email &&
      sdt === profileData.sdt &&
      gioiTinh === profileData.gioiTinh &&
      diaChi === profileData.diaChi
    ) {
      setModalAlert({
        type: "info",
        message: "Bạn chưa thay đổi thông tin nào.",
        show: true,
      });
      return;
    }

    // Validate all fields
    const isHoTenValid = validateHoTen(hoTen);
    const isNgaySinhValid = validateNgaySinh(ngaySinh || "");
    const isEmailValid = validateEmail(email);
    const isSdtValid = validateSdt(sdt);
    const isDiaChiValid = validateDiaChi(diaChi);

    if (!isHoTenValid || !isNgaySinhValid || !isEmailValid || !isSdtValid || !isDiaChiValid) {
      setModalAlert({
        type: "error",
        message: "Vui lòng kiểm tra lại các trường thông tin.",
        show: true,
      });
      return;
    }

    // Đóng modal ngay sau khi validation pass để thấy được alert
    closeModal();
    setIsSaving(true);

    try {
      const token = getAccessToken();
      if (!token) {
        setAlert({
          type: "error",
          message: "Không tìm thấy access token.",
          show: true,
        });
        setIsSaving(false);
        return;
      }

      const response = await fetch("http://localhost:3000/danh-muc/giang-vien/me/my-profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hoTen,
          ngaySinh,
          email,
          sdt,
          gioiTinh,
          diaChi,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        const { id, ...profileWithoutId } = updatedData;
        setProfileData(profileWithoutId);

        // Hiển thị alert thành công ở ngoài
        setAlert({
          type: "success",
          message: "Cập nhật thông tin thành công!",
          show: true,
        });
      } else {
        const errorData = await response.json();

        // Hiển thị alert thất bại ở ngoài
        setAlert({
          type: "error",
          message: errorData?.message || "Cập nhật thất bại.",
          show: true,
        });
      }
    } catch (error) {
      // Hiển thị alert lỗi kết nối ở ngoài
      setAlert({
        type: "warning",
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        show: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Thêm handler để ngăn đóng modal khi có lỗi
  const handleCloseModal = () => {
    // Reset modal alert khi đóng modal
    setModalAlert({ type: "success", message: "", show: false });
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Đang tải...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Không thể tải thông tin</p>
      </div>
    );
  }

  function formatDateNoTimezone(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}


  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      {/* Hiển thị alert API thành công/thất bại ở ngoài */}
      {alert.show && (
        <div className="mb-4">
          <Alert
            variant={alert.type}
            title={
              alert.type === "success"
                ? "Thành công"
                : alert.type === "error"
                  ? "Lỗi"
                  : alert.type === "warning"
                    ? "Cảnh báo"
                    : "Thông tin"
            }
            message={alert.message}
            showLink={false}
            autoDismiss={true}
            duration={5000}
            onClose={closeAlert}
          />
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Thông tin cá nhân của giảng viên
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Mã Giảng Viên
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profileData.maGiangVien}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Họ và tên
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profileData.hoTen}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Ngày sinh
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(profileData.ngaySinh)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Địa chỉ email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profileData.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Số điện thoại
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profileData.sdt}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Địa chỉ
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profileData.diaChi}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Giới tính
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatGioiTinh(profileData.gioiTinh)}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <FaPen />
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleCloseModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Cập nhật thông tin cá nhân của bạn tại đây.
            </p>
          </div>

          {/* Hiển thị alert validation và lỗi khác trong modal */}
          {modalAlert.show && (
            <div className="mb-4 px-2">
              <Alert
                variant={modalAlert.type}
                title={
                  modalAlert.type === "success"
                    ? "Thành công"
                    : modalAlert.type === "error"
                      ? "Lỗi"
                      : modalAlert.type === "warning"
                        ? "Cảnh báo"
                        : "Thông tin"
                }
                message={modalAlert.message}
                showLink={false}
                autoDismiss={true}
                duration={5000}
                onClose={closeModalAlert}
              />
            </div>
          )}

          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div className="mt-0">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Thông tin cá nhân
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Họ và tên <span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    defaultValue={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    error={hoTenError}
                    hint={hoTenError ? "Vui lòng nhập họ tên" : ""}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Giới tính <span className="text-error-500">*</span></Label>
                  <Select
                    options={options}
                    onChange={handleSelectChange}
                    className="dark:bg-dark-900"
                    defaultValue={gioiTinh}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Ngày sinh <span className="text-error-500">*</span></Label>
                  <DatePicker
                    id="ngaySinh"
                    defaultDate={ngaySinh || undefined}
                    onChange={(dates: Date[]) => {
                      if (dates && dates.length > 0) {
                        const formatted = formatDateNoTimezone(dates[0]);
                        setNgaySinh(formatted);
                      }
                    }}
                    placeholder="Chọn ngày sinh"
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Email <span className="text-error-500">*</span></Label>
                  <Input
                    type="email"
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={emailError}
                    hint={emailError ? "Vui lòng nhập email hợp lệ" : ""}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>Số điện thoại <span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    defaultValue={sdt}
                    onChange={(e) => setSdt(e.target.value)}
                    error={sdtError}
                    hint={sdtError ? "Số điện thoại phải có từ 10-15 ký tự" : ""}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Địa chỉ thường trú <span className="text-error-500">*</span></Label>
                  <TextArea
                    rows={4}
                    value={diaChi}
                    onChange={(value: string) => setDiaChi(value)}
                    error={diaChiError}
                    hint={diaChiError ? "Vui lòng nhập địa chỉ thường trú" : ""}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button size="sm" variant="outline" onClick={handleCloseModal}>
              Close
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal >
    </div >
  );
}
