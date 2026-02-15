"use client";
import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type ModalSize =
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl"
  | "9xl"
  | "10xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean; // Controls the visibility of the close button
  isFullscreen?: boolean; // Defaults to false for backward compatibility
  size?: ModalSize; // Modal size preset (md → 10xl)
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true, // Defaults to true for backward compatibility
  isFullscreen = false,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Modal size presets (mỗi bậc tăng dần, không bị trùng kích thước)
  const sizeClasses: Record<ModalSize, string> = {
    md: "max-w-3xl",
    lg: "max-w-4xl",
    xl: "max-w-5xl",
    "2xl": "max-w-6xl",
    "3xl": "max-w-7xl",
    "4xl": "max-w-8xl",
    "5xl": "max-w-9xl",
    "6xl": "max-w-10xl",
    "7xl": "max-w-11xl",
    "8xl": "max-w-12xl",
    "9xl": "max-w-13xl",
    "10xl": "max-w-14xl",
  };

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : `relative w-full ${sizeClasses[size]} rounded-3xl bg-white dark:bg-gray-900`;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-99999">
      {!isFullscreen && (
        <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" />
      )}
      <div ref={modalRef} className={`${contentClasses} ${className || ""}`}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
          >
            <FontAwesomeIcon icon={faXmark} className="w-6 h-6" />
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};
