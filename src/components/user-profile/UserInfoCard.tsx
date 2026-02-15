"use client";
import { ENV } from "@/config/env";
import React, { useState, useEffect } from "react";
import { saveRedirectUrl } from "@/utils/auth";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import Alert from "../ui/alert/Alert";
import TextArea from "../form/input/TextArea";
import { EyeCloseIcon, EyeIcon } from "@/icons"; import DatePicker from "../form/date-picker";
import SearchableSelect from "../form/SelectCustom";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { FaPen, FaRegCircle } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";

interface GiangVienProfile {
  maGiangVien: string;
  hoTen: string;
  ngaySinh: string;
  email: string;
  sdt: string;
  gioiTinh: "NAM" | "NU" | "KHONG_XAC_DINH";
  diaChi: string;
}

// ==================== PASSWORD STRENGTH METER ====================
interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score, label: "Yếu", color: "bg-red-500" };
    if (score <= 4) return { score, label: "Trung bình", color: "bg-yellow-500" };
    return { score, label: "Mạnh", color: "bg-green-500" };
  };

  const strength = calculateStrength(password);
  const percentage = (strength.score / 6) * 100;

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">Độ mạnh mật khẩu</span>
        <span className={`text-xs font-medium ${strength.label === "Yếu" ? "text-red-500" :
          strength.label === "Trung bình" ? "text-yellow-500" : "text-green-500"
          }`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <li className={password.length >= 8 ? "text-green-500" : ""}>
          {password.length >= 8 ? (
            <FaCheckCircle className="inline-block mr-1" />
          ) : (
            <FaRegCircle className="inline-block mr-1" />
          )}
          Ít nhất 8 ký tự
        </li>

        <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-green-500" : ""}>
          {/[a-z]/.test(password) && /[A-Z]/.test(password) ? (
            <FaCheckCircle className="inline-block mr-1" />
          ) : (
            <FaRegCircle className="inline-block mr-1" />
          )}
          Chữ hoa và chữ thường
        </li>

        <li className={/[0-9]/.test(password) ? "text-green-500" : ""}>
          {/[0-9]/.test(password) ? (
            <FaCheckCircle className="inline-block mr-1" />
          ) : (
            <FaRegCircle className="inline-block mr-1" />
          )}
          Ít nhất 1 số
        </li>

        <li className={/[^a-zA-Z0-9]/.test(password) ? "text-green-500" : ""}>
          {/[^a-zA-Z0-9]/.test(password) ? (
            <FaCheckCircle className="inline-block mr-1" />
          ) : (
            <FaRegCircle className="inline-block mr-1" />
          )}
          Ít nhất 1 ký tự đặc biệt
        </li>
      </ul>
    </div>
  );
};

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

  // Error states (message string, empty = no error)
  const [hoTenError, setHoTenError] = useState("");
  const [ngaySinhError, setNgaySinhError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sdtError, setSdtError] = useState("");
  const [diaChiError, setDiaChiError] = useState("");

  // State cho modal đổi mật khẩu
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // State cho toggle hiển thị mật khẩu
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error states cho đổi mật khẩu
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Alert trong modal đổi mật khẩu
  const [changePasswordAlert, setChangePasswordAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    show: boolean;
  }>({ type: "success", message: "", show: false });

  // State cho modal OTP
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpAlert, setOtpAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    show: boolean;
  }>({ type: "success", message: "", show: false });

  // State cho modal thành công
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);

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

        const response = await fetch(`${ENV.BACKEND_URL}/danh-muc/giang-vien/me/my-profile`, {
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

  // Countdown effect cho modal thành công
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccessModalOpen && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSuccessModalOpen && countdown === 0) {
      handleLogout();
    }
    return () => clearTimeout(timer);
  }, [isSuccessModalOpen, countdown]);

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
      setHoTenError("");
      setNgaySinhError("");
      setEmailError("");
      setSdtError("");
      setDiaChiError("");

      // Reset modal alert
      setModalAlert({ type: "success", message: "", show: false });
    }
    openModal();
  };

  const handleSelectChange = (value: string) => {
    setGioiTinh(value);
  };

  // Validation functions – set error message (string), return true if valid
  const validateHoTen = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setHoTenError("Họ tên không được để trống");
      return false;
    }
    setHoTenError("");
    return true;
  };

  const validateNgaySinh = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setNgaySinhError("Ngày sinh không được để trống");
      return false;
    }
    const d = new Date(trimmed);
    if (isNaN(d.getTime())) {
      setNgaySinhError("Ngày sinh không hợp lệ");
      return false;
    }
    setNgaySinhError("");
    return true;
  };

  /** Email: bắt buộc và đúng định dạng (có @ và domain). */
  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError("Email không được để trống");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Email không đúng định dạng (VD: email@domain.com)");
      return false;
    }
    setEmailError("");
    return true;
  };

  /** Số điện thoại: bắt buộc và đúng dạng số ĐT (VN: 0xxxxxxxxx hoặc +84..., 10–11 chữ số). */
  const validateSdt = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSdtError("Số điện thoại không được để trống");
      return false;
    }
    const cleaned = trimmed.replace(/[\s\-.]/g, "");
    const vnPhoneRegex = /^(\+84|84|0)?[3-9]\d{8}$/;
    if (!vnPhoneRegex.test(cleaned)) {
      setSdtError("Số điện thoại không đúng định dạng (VD: 0123456789 hoặc +84912345678)");
      return false;
    }
    setSdtError("");
    return true;
  };

  const validateDiaChi = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setDiaChiError("Địa chỉ không được để trống");
      return false;
    }
    setDiaChiError("");
    return true;
  };

  const handleSave = async () => {
    // Reset all errors first
    setHoTenError("");
    setNgaySinhError("");
    setEmailError("");
    setSdtError("");
    setDiaChiError("");
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

      const response = await fetch(`${ENV.BACKEND_URL}/danh-muc/giang-vien/me/my-profile`, {
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

  // ==================== CHANGE PASSWORD HANDLERS ====================

  const resetChangePasswordForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setChangePasswordAlert({ type: "success", message: "", show: false });
    // Reset toggle hiển thị mật khẩu
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Mở modal đổi mật khẩu
  const handleOpenChangePasswordModal = () => {
    resetChangePasswordForm();
    setIsChangePasswordModalOpen(true);
  };

  // Đóng modal đổi mật khẩu
  const handleCloseChangePasswordModal = () => {
    if (!isChangingPassword) {
      resetChangePasswordForm();
      setIsChangePasswordModalOpen(false);
    }
  };

  // Validate mật khẩu mới
  const validateNewPassword = (pwd: string): boolean => {
    if (pwd.length < 8) {
      setNewPasswordError("Mật khẩu phải có ít nhất 8 ký tự");
      return false;
    }
    if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd)) {
      setNewPasswordError("Mật khẩu phải có cả chữ hoa và chữ thường");
      return false;
    }
    if (!/[0-9]/.test(pwd)) {
      setNewPasswordError("Mật khẩu phải có ít nhất 1 số");
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(pwd)) {
      setNewPasswordError("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
      return false;
    }
    setNewPasswordError("");
    return true;
  };

  // Xử lý gửi yêu cầu đổi mật khẩu
  const handleChangePassword = async () => {
    // Reset errors
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setChangePasswordAlert({ type: "success", message: "", show: false });

    let hasError = false;

    // Validate mật khẩu cũ
    if (!oldPassword.trim()) {
      setOldPasswordError("Vui lòng nhập mật khẩu cũ");
      hasError = true;
    }

    // Validate mật khẩu mới
    if (!newPassword.trim()) {
      setNewPasswordError("Vui lòng nhập mật khẩu mới");
      hasError = true;
    } else if (!validateNewPassword(newPassword)) {
      hasError = true;
    } else if (newPassword === oldPassword) {
      setNewPasswordError("Mật khẩu mới phải khác mật khẩu cũ");
      hasError = true;
    }

    // Validate nhập lại mật khẩu
    if (!confirmNewPassword.trim()) {
      setConfirmPasswordError("Vui lòng nhập lại mật khẩu mới");
      hasError = true;
    } else if (confirmNewPassword !== newPassword) {
      setConfirmPasswordError("Mật khẩu nhập lại không khớp");
      hasError = true;
    }

    if (hasError) return;

    setIsChangingPassword(true);

    try {
      const token = getAccessToken();
      if (!token) {
        setChangePasswordAlert({
          type: "error",
          message: "Không tìm thấy access token.",
          show: true,
        });
        setIsChangingPassword(false);
        return;
      }

      const response = await fetch(`${ENV.BACKEND_URL}/auth/change-password/me`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        // Thành công - mở modal OTP
        setIsChangePasswordModalOpen(false);
        resetChangePasswordForm();
        setOtpCode("");
        setOtpError("");
        setOtpAlert({ type: "success", message: "", show: false });
        setIsOtpModalOpen(true);
      } else {
        const errorData = await response.json();
        setChangePasswordAlert({
          type: "error",
          message: errorData?.message || "Đổi mật khẩu thất bại.  Vui lòng kiểm tra lại mật khẩu cũ.",
          show: true,
        });
      }
    } catch (error) {
      setChangePasswordAlert({
        type: "error",
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
        show: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ==================== OTP HANDLERS ====================

  // Đóng modal OTP
  const handleCloseOtpModal = () => {
    if (!isVerifyingOtp) {
      setOtpCode("");
      setOtpError("");
      setOtpAlert({ type: "success", message: "", show: false });
      setIsOtpModalOpen(false);
    }
  };

  // Xử lý xác thực OTP
  const handleVerifyOtp = async () => {
    setOtpError("");
    setOtpAlert({ type: "success", message: "", show: false });

    if (!otpCode.trim()) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    if (otpCode.length !== 6) {
      setOtpError("Mã OTP phải có 6 ký tự");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const token = getAccessToken();
      if (!token) {
        setOtpAlert({
          type: "error",
          message: "Không tìm thấy access token.",
          show: true,
        });
        setIsVerifyingOtp(false);
        return;
      }

      const response = await fetch(`${ENV.BACKEND_URL}/auth/change-password/verify-otp`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otpCode,
        }),
      });

      if (response.ok) {
        // Thành công - mở modal thông báo và bắt đầu countdown
        setIsOtpModalOpen(false);
        setCountdown(5);
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        setOtpAlert({
          type: "error",
          message: errorData?.message || "Mã OTP không hợp lệ.  Vui lòng thử lại.",
          show: true,
        });
      }
    } catch (error) {
      setOtpAlert({
        type: "error",
        message: "Không thể kết nối đến máy chủ.  Vui lòng thử lại sau.",
        show: true,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Xử lý logout
  const handleLogout = () => {
    // Xóa cookie
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Không lưu redirect URL khi logout thủ công
    window.location.href = "/signin";
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
    <div>
      <PageBreadcrumb pageTitle="Thông tin cá nhân" />

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

          <div className="flex flex-col gap-3 lg:flex-row">
            <button
              onClick={handleOpenModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover: bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark: hover:bg-white/[0.03] dark:hover: text-gray-200 lg:inline-flex lg:w-auto"
            >
              <FaPen />
              Edit
            </button>
            <button
              onClick={handleOpenChangePasswordModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-500 bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:border-brand-500 dark:bg-brand-500 dark:hover:bg-brand-600 lg:inline-flex lg:w-auto"
            >
              Đổi mật khẩu
            </button>
          </div>
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
                      value={hoTen}
                      onChange={(e) => setHoTen(e.target.value)}
                      error={!!hoTenError}
                      hint={hoTenError}
                      placeholder="Nhập họ tên"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Giới tính <span className="text-error-500">*</span></Label>
                    <SearchableSelect
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
                        } else {
                          setNgaySinh(null);
                        }
                      }}
                      placeholder="Chọn ngày sinh"
                    />
                    {ngaySinhError && (
                      <p className="mt-1.5 text-xs text-error-500">{ngaySinhError}</p>
                    )}
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email <span className="text-error-500">*</span></Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={!!emailError}
                      hint={emailError}
                      placeholder="VD: email@domain.com"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Số điện thoại <span className="text-error-500">*</span></Label>
                    <Input
                      type="tel"
                      value={sdt}
                      onChange={(e) => setSdt(e.target.value)}
                      error={!!sdtError}
                      hint={sdtError}
                      placeholder="VD: 0123456789 hoặc +84912345678"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Địa chỉ thường trú <span className="text-error-500">*</span></Label>
                    <TextArea
                      rows={4}
                      value={diaChi}
                      onChange={(value: string) => setDiaChi(value)}
                      error={!!diaChiError}
                      hint={diaChiError}
                      placeholder="Nhập địa chỉ thường trú"
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
        {/* Modal Đổi mật khẩu */}
        <Modal isOpen={isChangePasswordModalOpen} onClose={handleCloseChangePasswordModal} className="max-w-[500px] m-4">
          <div className="relative w-full max-w-[500px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <div className="mb-6">
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                Đổi mật khẩu
              </h4>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Nhập mật khẩu cũ và mật khẩu mới để thay đổi.
              </p>
            </div>

            {/* Alert trong modal */}
            {changePasswordAlert.show && (
              <div className="mb-4">
                <Alert
                  variant={changePasswordAlert.type}
                  title={changePasswordAlert.type === "error" ? "Lỗi" : "Thông báo"}
                  message={changePasswordAlert.message}
                  showLink={false}
                  autoDismiss={false}
                  onClose={() => setChangePasswordAlert(a => ({ ...a, show: false }))}
                />
              </div>
            )}

            <div className="space-y-5">
              {/* Mật khẩu cũ */}
              <div>
                <Label>Mật khẩu cũ <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    defaultValue={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      setOldPasswordError("");
                    }}
                    error={!!oldPasswordError}
                    hint={oldPasswordError}
                    placeholder="Nhập mật khẩu cũ"
                  />
                  <span
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute z-30 cursor-pointer right-4 top-3.5"
                  >
                    {showOldPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark" />
                    )}
                  </span>
                </div>
              </div>

              {/* Mật khẩu mới */}
              <div>
                <Label>Mật khẩu mới <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    defaultValue={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setNewPasswordError("");
                    }}
                    error={!!newPasswordError}
                    hint={newPasswordError}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute z-30 cursor-pointer right-4 top-3.5"
                  >
                    {showNewPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark" />
                    )}
                  </span>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>

              {/* Nhập lại mật khẩu mới */}
              <div>
                <Label>Nhập lại mật khẩu mới <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    defaultValue={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setConfirmPasswordError("");
                    }}
                    error={!!confirmPasswordError}
                    hint={confirmPasswordError}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute z-30 cursor-pointer right-4 top-3.5"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark" />
                    )}
                  </span>
                </div>
                {confirmNewPassword && confirmNewPassword === newPassword && (
                  <p className="mt-1 text-sm text-green-500">✓ Mật khẩu khớp</p>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6 justify-end">
                <Button size="sm" variant="outline" onClick={handleCloseChangePasswordModal} disabled={isChangingPassword}>
                  Hủy
                </Button>
                <Button size="sm" onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Modal Xác thực OTP */}
        <Modal isOpen={isOtpModalOpen} onClose={handleCloseOtpModal} className="max-w-[400px] m-4">
          <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Xác thực OTP
              </h4>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Mã OTP đã được gửi đến email của bạn.  Vui lòng kiểm tra và nhập mã xác thực.
              </p>
            </div>

            {/* Alert trong modal OTP */}
            {otpAlert.show && (
              <div className="mb-4">
                <Alert
                  variant={otpAlert.type}
                  title={otpAlert.type === "error" ? "Lỗi" : "Thông báo"}
                  message={otpAlert.message}
                  showLink={false}
                  autoDismiss={false}
                  onClose={() => setOtpAlert(a => ({ ...a, show: false }))}
                />
              </div>
            )}

            <div className="space-y-5">
              <div>
                <Label>Mã OTP <span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  defaultValue={otpCode}
                  onChange={(e) => {
                    // Chỉ cho phép nhập số
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpCode(value);
                    setOtpError("");
                  }}
                  error={!!otpError}
                  hint={otpError}
                  placeholder="Nhập mã 6 số"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 justify-end">
              <Button size="sm" variant="outline" onClick={handleCloseOtpModal} disabled={isVerifyingOtp}>
                Hủy
              </Button>
              <Button size="sm" onClick={handleVerifyOtp} disabled={isVerifyingOtp || otpCode.length !== 6}>
                {isVerifyingOtp ? "Đang xác thực..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal Thành công */}
        <Modal isOpen={isSuccessModalOpen} onClose={() => { }} className="max-w-[400px] m-4">
          <div className="relative w-full max-w-[400px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-2">
                Đổi mật khẩu thành công!
              </h4>
              <p className="text-sm text-gray-500 dark: text-gray-400 mb-4">
                Mật khẩu của bạn đã được thay đổi thành công.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Bạn sẽ được đăng xuất sau
              </p>
              <div className="mt-4 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-brand-100 dark: bg-brand-900/30 flex items-center justify-center">
                  <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {countdown}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">giây</p>
            </div>
          </div>
        </Modal>
      </div >
    </div>
  );
}
