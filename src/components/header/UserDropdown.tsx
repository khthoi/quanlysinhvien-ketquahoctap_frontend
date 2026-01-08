"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faRightFromBracket,
  faUserCircle,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface UserProfile {
  id: number;
  maGiangVien: string;
  hoTen: string;
  ngaySinh: string;
  email: string;
  sdt: string;
  gioiTinh: string;
  diaChi: string;
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Map gioiTinh to appropriate image
  const getProfileImage = (): string => {
    if (!profile) return "/images/user/owner.jpg";
    
    switch (profile.gioiTinh) {
      case "NAM":
        return "/images/user/owner.jpg"; // Male
      case "NU":
        return "/images/user/female.jpg"; // Female
      case "KHONG_XAC_DINH":
      default:
        return "/images/user/owner.jpg"; // Default
    }
  };

  // Get access token from cookies
  const getAccessToken = (): string | null => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'access_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

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

  // Map vaiTro to Vietnamese role name
  const getRoleName = (vaiTro: string): string => {
    switch (vaiTro) {
      case "CAN_BO_PHONG_DAO_TAO":
        return "Cán bộ Phòng Đào Tạo";
      case "GIANG_VIEN":
        return "Giảng Viên";
      case "ADMIN":
        return "Quản Trị Viên";
      case "SINH_VIEN":
        return "Sinh Viên";
      default:
        return vaiTro;
    }
  };

  // Get role badge color based on role
  const getRoleBadgeClass = (vaiTro: string): string => {
    switch (vaiTro) {
      case "GIANG_VIEN":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CAN_BO_PHONG_DAO_TAO":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getAccessToken();
        
        // Decode token to get role
        const decoded = decodeToken(token);
        const vaiTro = decoded?.vaiTro;

        // If role is SINH_VIEN, delete token and redirect to signin
        if (vaiTro === "SINH_VIEN") {
          document.cookie =
            "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          router.push("/signin");
          return;
        }

        setRole(vaiTro || null);

        const response = await fetch(
          "http://localhost:3000/danh-muc/giang-vien/me/my-profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            credentials: "include", // Include cookies for authentication
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Delete access_token from cookies
        document.cookie =
          "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        // Redirect to login
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleSignOut() {
    // Delete access_token from cookies
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // Redirect to signin
    router.push("/signin");
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src={getProfileImage()}
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {loading ? "Loading..." : profile?.hoTen || "User"}
        </span>

        <FontAwesomeIcon
          icon={faChevronDown}
          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {profile?.hoTen || "User"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {profile?.email || "email@example.com"}
          </span>
          {role && (
            <span className={`mt-2 inline-block px-2.5 py-1 rounded-full text-theme-xs font-medium ${getRoleBadgeClass(role)}`}>
              {getRoleName(role)}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon
                icon={faUserCircle}
                className="h-6 w-6 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                aria-hidden="true"
              />
              Edit profile
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <FontAwesomeIcon
                icon={faGear}
                className="h-6 w-6 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                aria-hidden="true"
              />
              Account settings
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={() => {
            handleSignOut();
            closeDropdown();
          }}
          className="flex items-center gap-3 px-3 py-2 mt-3 w-full font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 border-none bg-transparent cursor-pointer"
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="h-6 w-6 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
            aria-hidden="true"
          />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
