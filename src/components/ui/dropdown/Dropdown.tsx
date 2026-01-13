"use client";
import type React from "react";
import { useEffect, useRef, useState, useLayoutEffect } from "react";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React. FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event:  MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current. contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.dropdown-toggle')
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Reset state khi đóng dropdown
  useEffect(() => {
    if (! isOpen) {
      setPosition(null);
      setIsPositioned(false);
    }
  }, [isOpen]);

  // Sử dụng useLayoutEffect để tính toán vị trí TRƯỚC khi render
  useLayoutEffect(() => {
    if (isOpen && dropdownRef.current) {
      const toggleButton = dropdownRef.current.parentElement?. querySelector('.dropdown-toggle');
      if (toggleButton) {
        const rect = toggleButton.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current.offsetHeight || 200;
        const dropdownWidth = dropdownRef.current.offsetWidth || 200;
        
        // Kiểm tra xem dropdown có bị tràn ra ngoài viewport không
        const spaceBelow = window.innerHeight - rect.bottom;
        
        let top = rect.bottom + 8; // 8px margin
        let left = rect.right - dropdownWidth;
        
        // Nếu không đủ chỗ bên dưới, hiển thị phía trên
        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
          top = rect.top - dropdownHeight - 8;
        }
        
        // Đảm bảo không tràn ra ngoài bên trái
        if (left < 8) {
          left = 8;
        }
        
        setPosition({ top, left });
        setIsPositioned(true);
      }
    }
  }, [isOpen]);

  // Đóng dropdown khi scroll
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => {
        onClose();
      };
      
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, onClose]);

  // Không render gì nếu chưa mở hoặc chưa tính toán xong vị trí
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position ?  `${position.top}px` : '-9999px',
        left: position ? `${position.left}px` : '-9999px',
        visibility: isPositioned ? 'visible' : 'hidden',
        opacity: isPositioned ? 1 : 0,
      }}
      className={`z-[9999] px-2 py-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark transition-opacity duration-75 ${className}`}
    >
      {children}
    </div>
  );
};