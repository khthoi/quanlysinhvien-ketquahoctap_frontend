"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faEllipsis,
  faMagnifyingGlass,
  faXmark,
  faArrowRight,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

// Danh sách tất cả route của website kèm nhãn tiếng Việt để tìm kiếm
const SEARCH_ROUTES: { label: string; path: string; category?: string }[] = [
  { label: "Tổng quan hệ thống", path: "/", category: "Trang chủ" },
  { label: "Dashboard", path: "/", category: "Trang chủ" },
  //{ label: "Calendar", path: "/calendar", category: "Trang chủ" },
  { label: "User Profile", path: "/profile", category: "Trang chủ" },
  { label: "Tài khoản", path: "/quan-ly-tai-khoan", category: "Quản lý người dùng" },
  { label: "Quản lý tài khoản", path: "/quan-ly-tai-khoan", category: "Quản lý người dùng" },
  { label: "Khoa", path: "/quan-ly-khoa", category: "Cơ cấu đào tạo" },
  { label: "Quản lý khoa", path: "/quan-ly-khoa", category: "Cơ cấu đào tạo" },
  { label: "Ngành", path: "/quan-ly-nganh", category: "Cơ cấu đào tạo" },
  { label: "Quản lý ngành", path: "/quan-ly-nganh", category: "Cơ cấu đào tạo" },
  { label: "Niên khoá", path: "/quan-ly-nien-khoa", category: "Cơ cấu đào tạo" },
  { label: "Quản lý niên khoá", path: "/quan-ly-nien-khoa", category: "Cơ cấu đào tạo" },
  { label: "Lớp niên chế", path: "/quan-ly-lop-nien-che", category: "Cơ cấu đào tạo" },
  { label: "Quản lý lớp niên chế", path: "/quan-ly-lop-nien-che", category: "Cơ cấu đào tạo" },
  { label: "Môn học", path: "/quan-ly-mon-hoc", category: "Cơ cấu đào tạo" },
  { label: "Quản lý môn học", path: "/quan-ly-mon-hoc", category: "Cơ cấu đào tạo" },
  { label: "Giảng viên", path: "/quan-ly-giang-vien", category: "Cơ cấu đào tạo" },
  { label: "Quản lý giảng viên", path: "/quan-ly-giang-vien", category: "Cơ cấu đào tạo" },
  { label: "Năm học & Học kỳ", path: "/quan-ly-namhoc-hocky", category: "Cơ cấu đào tạo" },
  { label: "Quản lý năm học học kỳ", path: "/quan-ly-namhoc-hocky", category: "Cơ cấu đào tạo" },
  { label: "Chương trình đào tạo", path: "/quan-ly-ctdt", category: "Quản lý CTDT" },
  { label: "Quản lý CTDT", path: "/quan-ly-ctdt", category: "Quản lý CTDT" },
  { label: "Quản lý sinh viên", path: "/quan-ly-sinh-vien", category: "Quản lý sinh viên" },
  { label: "Quản lý LHP", path: "/quan-ly-lop-hoc-phan", category: "Quản lý lớp học phần" },
  {
    label: "Quản lý lớp học phần",
    path: "/quan-ly-lop-hoc-phan",
    category: "Quản lý lớp học phần",
  },
  {
    label: "Quản lý sinh viên theo lớp học phần",
    path: "/quan-ly-lop-hoc-phan",
    category: "Quản lý lớp học phần",
  },
  {
    label: "Quản lý SV LHP",
    path: "/quan-ly-lop-hoc-phan",
    category: "Quản lý lớp học phần",
  },
  {
    label: "Lớp học phần theo giảng viên",
    path: "/quan-ly-lop-hoc-phan-theo-giang-vien",
    category: "Quản lý lớp học phần",
  },
  {
    label: "Quản lý lớp học phần theo giảng viên",
    path: "/quan-ly-lop-hoc-phan-theo-giang-vien",
    category: "Quản lý lớp học phần",
  },
  {
    label: "Thêm lớp học phần",
    path: "/them-lop-hoc-phan",
    category: "Quản lý lớp học phần",
  },
  {
    label: "Thêm sinh viên học lại",
    path: "/them-sinh-vien-hoc-lai",
    category: "Quản lý sinh viên",
  },
  {
    label: "Thêm CTDT mới",
    path: "/them-ctdt-moi",
    category: "Quản lý CTDT",
  },
  //{ label: "Form Elements", path: "/form-elements", category: "Khác" },
  //{ label: "Basic Tables", path: "/basic-tables", category: "Khác" },
  //{ label: "Dropdown Table", path: "/second-table", category: "Khác" },
  //{ label: "Blank Page", path: "/blank", category: "Khác" },
  //{ label: "Line Chart", path: "/line-chart", category: "Khác" },
  //{ label: "Bar Chart", path: "/bar-chart", category: "Khác" },
  //{ label: "Alerts", path: "/alerts", category: "Khác" },
  //{ label: "Avatar", path: "/avatars", category: "Khác" },
  //{ label: "Badge", path: "/badge", category: "Khác" },
  //{ label: "Buttons", path: "/buttons", category: "Khác" },
  //{ label: "Images", path: "/images", category: "Khác" },
  //{ label: "Videos", path: "/videos", category: "Khác" },
  { label: "Đăng nhập", path: "/signin", category: "Khác" },
  //{ label: "Sign Up", path: "/signup", category: "Khác" },
];

// Loại bỏ dấu tiếng Việt để tìm kiếm không dấu vẫn match
function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function normalizeForSearch(s: string): string {
  return removeVietnameseTones(s).trim();
}

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const router = useRouter();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Lọc route theo từ khoá (nhãn + path không dấu), mỗi path chỉ hiển thị 1 lần (ưu tiên label khớp nhất)
  const filteredRoutes = useMemo(() => {
    const q = normalizeForSearch(searchQuery);
    const normalized = SEARCH_ROUTES.map((r) => ({
      ...r,
      labelNorm: normalizeForSearch(r.label),
      pathNorm: normalizeForSearch(r.path.replace(/\//g, " ")),
    }));
    if (!q) {
      const seen = new Set<string>();
      return normalized.filter((r) => {
        if (seen.has(r.path)) return false;
        seen.add(r.path);
        return true;
      }).slice(0, 10);
    }
    const matched = normalized.filter(
      (r) => r.labelNorm.includes(q) || r.pathNorm.includes(q)
    );
    const seen = new Set<string>();
    const unique: typeof normalized = [];
    for (const r of matched) {
      if (seen.has(r.path)) continue;
      seen.add(r.path);
      unique.push(r);
    }
    return unique.slice(0, 12);
  }, [searchQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, filteredRoutes.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen || filteredRoutes.length === 0) {
      if (e.key === "Escape") setIsSearchOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % filteredRoutes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + filteredRoutes.length) % filteredRoutes.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = filteredRoutes[highlightedIndex];
      if (r) {
        router.push(r.path);
        setSearchQuery("");
        setIsSearchOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectRoute = (path: string) => {
    router.push(path);
    setSearchQuery("");
    setIsSearchOpen(false);
    inputRef.current?.blur();
  };

  const showDropdown = isSearchOpen && (searchQuery.length >= 0);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon
              icon={isMobileOpen ? faXmark : faBars}
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>

          <Link href="/" className="lg:hidden">
            <Image
              width={154}
              height={32}
              className="dark:hidden"
              src="./images/logo/logo.svg"
              alt="Logo"
            />
            <Image
              width={154}
              height={32}
              className="hidden dark:block"
              src="./images/logo/logo-dark.svg"
              alt="Logo"
            />
          </Link>

          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <FontAwesomeIcon icon={faEllipsis} className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block relative" ref={dropdownRef}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="relative flex"
            >
              <div className="flex items-stretch rounded-lg border border-gray-200 bg-transparent shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:focus-within:border-brand-800 xl:min-w-[430px]">
                <button
                  type="button"
                  aria-label="Tìm kiếm"
                  onClick={() => inputRef.current?.focus()}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-l-[7px] text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm kiếm trang hoặc nhập từ khoá..."
                  className="h-11 flex-1 min-w-0 rounded-r-lg border-0 bg-transparent py-2.5 pr-4 pl-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-white/90 dark:placeholder:text-white/30 xl:w-[380px]"
                  aria-label="Tìm kiếm trang"
                  aria-autocomplete="list"
                  aria-expanded={showDropdown}
                  aria-controls="search-suggestions"
                  role="combobox"
                />
              </div>
            </form>

            {/* Dropdown gợi ý */}
            {showDropdown && (
              <div
                id="search-suggestions"
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 xl:min-w-[430px] max-h-[min(70vh,400px)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 z-[100] py-2"
              >
                {filteredRoutes.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                    Không tìm thấy trang nào phù hợp. Thử từ khoá khác.
                  </div>
                ) : (
                  <>
                    <ul className="space-y-0.5">
                      {filteredRoutes.map((route, index) => (
                        <li key={`${route.path}-${index}`} role="option" aria-selected={index === highlightedIndex}>
                          <Link
                            href={route.path}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSelectRoute(route.path);
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            className={`flex items-center gap-3 px-4 py-3 mx-1 rounded-lg transition-colors ${
                              index === highlightedIndex
                                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                                : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                          >
                            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                              <FontAwesomeIcon
                                icon={faFolder}
                                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                              />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{route.label}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {route.path === "/" ? "Trang chủ" : route.path}
                              </p>
                            </div>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className="h-3.5 w-3.5 text-gray-400 shrink-0"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 mt-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px]">↑↓</kbd> Chọn · <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px]">Enter</kbd> Mở · <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px]">Esc</kbd> Đóng
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          className={`${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <ThemeToggleButton />
          </div>
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
