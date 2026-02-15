"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { ENV } from "@/config/env";
import { getAndClearRedirectUrl } from "@/utils/auth";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Validation states
  const [tenDangNhapError, setTenDangNhapError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Decode JWT token to get role
  const decodeToken = (token: string | null): { vaiTro?: string } | null => {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decodedStr = atob(payload);
      return JSON.parse(decodedStr);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const validateTenDangNhap = (value: string) => {
    const isValid = value.trim().length > 0;
    setTenDangNhapError(!isValid);
    return isValid;
  };

  const validatePassword = (value: string) => {
    const isValid = value.trim().length > 0;
    setPasswordError(! isValid);
    return isValid;
  };

  const handleTenDangNhapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTenDangNhap(value);
    validateTenDangNhap(value);
    // Ẩn error alert khi user bắt đầu nhập
    if (showError) {
      setShowError(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target. value;
    setPassword(value);
    validatePassword(value);
    // Ẩn error alert khi user bắt đầu nhập
    if (showError) {
      setShowError(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const isTenDangNhapValid = validateTenDangNhap(tenDangNhap);
    const isPasswordValid = validatePassword(password);
    
    if (!isTenDangNhapValid || !isPasswordValid) {
      return; // Không hiển thị error alert, chỉ dùng validation của Input
    }

    setIsLoading(true);
    setShowError(false); // Ẩn error cũ nếu có

    try {
      const response = await fetch(`${ENV.BACKEND_URL}/auth/login`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenDangNhap:  tenDangNhap,
          password: password,
        }),
      });

      if (response.status === 201) {
        const data = await response.json();
        
        // Lưu JWT vào cookies
        if (data.access_token) {
          document.cookie = `access_token=${data.access_token}; path=/; max-age=604800; SameSite=Strict`;
          
          // Decode token để lấy vaiTro
          const decoded = decodeToken(data.access_token);
          const vaiTro = decoded?.vaiTro;

          // Nếu vaiTro là SINH_VIEN, hiển thị error và không redirect
          if (vaiTro === "SINH_VIEN") {
            // Xóa access_token từ cookies
            document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            setErrorMessage("Bạn không đủ quyền để truy cập vào hệ thống");
            setShowError(true);
            return;
          }
        }
        
        // Chuyển hướng về URL đã lưu hoặc trang chủ
        const redirectUrl = getAndClearRedirectUrl("/");
        window.location.href = redirectUrl;
        
      } else if (response.status === 401) {
        setErrorMessage("Tên đăng nhập hoặc mật khẩu không chính xác");
        setShowError(true);
      } else {
        setErrorMessage("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại");
        setShowError(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Không thể kết nối đến máy chủ.  Vui lòng kiểm tra kết nối mạng");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md text-center">
              Đăng Nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Nhập tên đăng nhập và mật khẩu để đăng nhập!  
            </p>
          </div>
          <div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Đăng nhập vào hệ thống
                </span>
              </div>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Tên đăng nhập <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="Nhập tên đăng nhập" 
                    type="text"
                    defaultValue={tenDangNhap}
                    onChange={handleTenDangNhapChange}
                    disabled={isLoading}
                    error={tenDangNhapError}
                    hint={tenDangNhapError ?  "Vui lòng nhập tên đăng nhập" : ""}
                  />
                </div>
                <div>
                  <Label>
                    Mật khẩu <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" :  "password"}
                      placeholder="Nhập mật khẩu"
                      defaultValue={password}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      error={passwordError}
                      hint={passwordError ? "Vui lòng nhập mật khẩu" : ""}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 cursor-pointer right-4 top-3.5"
                    >
                      {showPassword ?  (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark: fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    disabled={isLoading}
                  >
                    {isLoading ?  "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Error Alert - hiển thị ở dưới form */}
            {showError && (
              <div className="mt-6">
                <Alert
                  variant="error"
                  title="Lỗi đăng nhập"
                  message={errorMessage}
                  autoDismiss={true}
                  duration={5000}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}