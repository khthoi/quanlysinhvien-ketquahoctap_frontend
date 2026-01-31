"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  GroupIcon
} from "../icons/index";
import SidebarWidget from "./SidebarWidget";

type VAI_TRO = "ADMIN" | "GIANG_VIEN" | "SINH_VIEN" | "CAN_BO_PHONG_DAO_TAO";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?:  string;
  subItems?: { name: string; path:  string; pro?: boolean; new?: boolean }[];
};

// Hàm lấy cookie
const getCookie = (name:  string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  console.log("Cookie not found:", name);
  return null;
};

// Hàm xóa cookie
const deleteCookie = (name: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

// Hàm decode JWT token
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c. charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Định nghĩa tất cả các nav items
const allNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <CalenderIcon />,
    name:  "Calendar",
    path: "/calendar",
  },
  {
    icon:  <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Quản lý người dùng",
    icon:  <UserCircleIcon />,
    subItems: [{ name: "Tài khoản", path: "/quan-ly-tai-khoan", pro:  true }],
  },
  {
    name: "Cơ cấu Đào tạo",
    icon: <ListIcon />,
    subItems:  [
      { name: "Khoa", path: "/quan-ly-khoa", pro: false },
      { name: "Ngành", path: "/quan-ly-nganh", pro:  false },
      { name: "Niên Khoá", path: "/quan-ly-nien-khoa", pro: false },
      { name: "Lớp niên chế", path: "/quan-ly-lop-nien-che", pro: false },
      { name: "Môn học", path: "/quan-ly-mon-hoc", pro: false },
      { name:  "Giảng viên", path: "/quan-ly-giang-vien", pro: false },
      { name: "Năm học & Học kỳ", path: "/quan-ly-namhoc-hocky", pro: false },
    ],
  },
  {
    name: "Quản lý CTDT",
    icon: <CalenderIcon />,
    subItems: [{ name: "Chương trình đào tạo", path: "/quan-ly-ctdt", pro: false }],
  },
  {
    name: "Quản lý Sinh viên",
    icon:  <GroupIcon />,
    subItems:  [{ name: "Quản lý Sinh viên", path: "/quan-ly-sinh-vien", pro: false }],
  },
  {
    name: " Quản lý Lớp học phần",
    icon: <UserCircleIcon />,
    subItems: [
      { name: "Quản lý LHP", path: "/quan-ly-lop-hoc-phan", pro: false },
      { name: "Lớp học phần", path:  "/quan-ly-lop-hoc-phan-theo-giang-vien", new: true },
    ],
  },
  {
    name:  "Forms",
    icon: <ListIcon />,
    subItems:  [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [
      { name: "Basic Tables", path: "/basic-tables", pro: false },
      { name: "Dropdown Table", path: "/second-table", pro: false },
    ],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const allOthersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name:  "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro:  false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro:  false },
      { name: "Images", path: "/images", pro:  false },
      { name: "Videos", path: "/videos", pro:  false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/signin", pro: false },
      { name: "Sign Up", path:  "/signup", pro: false },
    ],
  },
];

// Định nghĩa các đường dẫn được phép theo vai trò
const ALLOWED_PATHS:  Record<VAI_TRO, string[]> = {
  ADMIN: ["/quan-ly-tai-khoan"],
  CAN_BO_PHONG_DAO_TAO: [
    "/",
    "/profile",
    "/quan-ly-khoa",
    "/quan-ly-nganh",
    "/quan-ly-nien-khoa",
    "/quan-ly-lop-nien-che",
    "/quan-ly-mon-hoc",
    "/quan-ly-giang-vien",
    "/quan-ly-namhoc-hocky",
    "/quan-ly-ctdt",
    "/quan-ly-sinh-vien",
    "/quan-ly-lop-hoc-phan",
    "/quan-ly-lop-hoc-phan-theo-giang-vien",
  ],
  GIANG_VIEN: ["/quan-ly-lop-hoc-phan-theo-giang-vien", "/profile"],
  SINH_VIEN: [], // Sinh viên không được phép truy cập
};

// Hàm lọc nav items theo vai trò
const filterNavItemsByRole = (items: NavItem[], allowedPaths: string[]): NavItem[] => {
  return items
    .map((item) => {
      // Nếu item có path trực tiếp
      if (item.path) {
        if (allowedPaths.includes(item.path)) {
          return item;
        }
        return null;
      }

      // Nếu item có subItems
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter((subItem) =>
          allowedPaths.includes(subItem.path)
        );

        if (filteredSubItems. length > 0) {
          return {
            ...item,
            subItems: filteredSubItems,
          };
        }
        return null;
      }

      return null;
    })
    .filter((item): item is NavItem => item !== null);
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [userRole, setUserRole] = useState<VAI_TRO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra và xử lý vai trò người dùng
  useEffect(() => {
    const accessToken = getCookie("access_token");

    if (!accessToken) {
      router.push("/signin");
      return;
    }

    const decoded = decodeJWT(accessToken);

    if (!decoded || !decoded.vaiTro) {
      //deleteCookie("access_token");
      //router.push("/signin");
      return;
    }

    const vaiTro = decoded.vaiTro as VAI_TRO;

    setUserRole(vaiTro);
    setIsLoading(false);
  }, [router]);

  // Lọc nav items theo vai trò
  const navItems = useMemo(() => {
    if (!userRole) return [];
    const allowedPaths = ALLOWED_PATHS[userRole];
    return filterNavItemsByRole(allNavItems, allowedPaths);
  }, [userRole]);

  // Others items - có thể để trống hoặc lọc theo role nếu cần
  const othersItems = useMemo(() => {
    // Nếu muốn ẩn others items cho tất cả các role, return []
    // Hoặc có thể lọc theo role tương tự như navItems
    if (!userRole) return [];
    
    // Ở đây tạm thời ẩn others items cho tất cả các role
    // Nếu muốn hiển thị, có thể thêm logic lọc tương tự
    return [];
  }, [userRole]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type:  menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, navItems, othersItems]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]:  subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                openSubmenu?. type === menuType && openSubmenu?.index === index
                  ?  "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                ! isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav. path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav. path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: 
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem. path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem. new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            FOR GV
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ?  "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            ADMIN
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  // Hiển thị loading hoặc không render gì khi đang kiểm tra role
  if (isLoading) {
    return (
      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
          ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="py-8 flex justify-center items-center h-full">
          <span className="text-gray-500">Đang tải...</span>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            :  "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ?  "lg:justify-center" :  "justify-start"
        }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            {navItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && ! isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Menu"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(navItems, "main")}
              </div>
            )}

            {othersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;