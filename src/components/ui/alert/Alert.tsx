"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info"; // Alert type
  title: string; // Title of the alert
  message: string; // Message of the alert
  showLink?: boolean; // Whether to show the "Learn More" link
  linkHref?: string; // Link URL
  linkText?: string; // Link text
  autoDismiss?: boolean; // Tự động ẩn alert
  duration?: number; // Thời gian hiển thị (ms), mặc định 5000ms
  onClose?: () => void; // Callback khi alert đóng
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  autoDismiss = false,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, 300); // Thời gian animation fade-out
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, onClose]);

  if (!isVisible) return null;

  // Tailwind classes for each variant
  const variantClasses = {
    success: {
      container:
        "border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15",
      icon: "text-success-500",
    },
    error: {
      container:
        "border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15",
      icon: "text-error-500",
    },
    warning: {
      container:
        "border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15",
      icon: "text-warning-500",
    },
    info: {
      container:
        "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15",
      icon: "text-blue-light-500",
    },
  };

  // Icon for each variant
  const icons = {
    success: <FaCheckCircle className="w-6 h-6" />,
    error: <FaTimesCircle className="w-6 h-6" />,
    warning: <FaExclamationCircle className="w-6 h-6" />,
    info: <FaInfoCircle className="w-6 h-6" />,
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${
        isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } ${variantClasses[variant].container}`}
    >
      <div className="flex items-start gap-3">
        <div className={`-mt-0.5 ${variantClasses[variant].icon}`}>
          {icons[variant]}
        </div>

        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>

          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">{message}</p>

          {showLink && (
            <Link
              href={linkHref}
              className="inline-block mt-3 text-sm font-medium text-gray-500 underline dark:text-gray-400"
            >
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
