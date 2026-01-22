"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes
} from "react-icons/fa";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
  autoDismiss?: boolean;
  duration?: number;
  onClose?: () => void;
  dismissible?: boolean;
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
  dismissible = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose?.();   // 🔥 Parent unmount component
    }, 300);
  };

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration]);

  const variantClasses = {
    success: {
      container:
        "border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15",
      icon: "text-success-500",
      closeButton:
        "text-success-600 hover:text-success-700 dark:text-success-400 dark:hover:text-success-300",
    },
    error: {
      container:
        "border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15",
      icon: "text-error-500",
      closeButton:
        "text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300",
    },
    warning: {
      container:
        "border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15",
      icon: "text-warning-500",
      closeButton:
        "text-warning-600 hover:text-warning-700 dark:text-warning-400 dark:hover:text-warning-300",
    },
    info: {
      container:
        "border-blue-light-500 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/15",
      icon: "text-blue-light-500",
      closeButton:
        "text-blue-light-600 hover:text-blue-light-700 dark:text-blue-light-400 dark:hover:text-blue-light-300",
    },
  };

  const icons = {
    success: <FaCheckCircle className="w-6 h-6" />,
    error: <FaTimesCircle className="w-6 h-6" />,
    warning: <FaExclamationCircle className="w-6 h-6" />,
    info: <FaInfoCircle className="w-6 h-6" />,
  };

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      } ${variantClasses[variant].container}`}
    >
      {dismissible && (
        <button
          onClick={handleClose}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 ${variantClasses[variant].closeButton}`}
          aria-label="Close alert"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      )}

      <div className={`flex items-start gap-3 ${dismissible ? "pr-8" : ""}`}>
        <div className={`-mt-0.5 flex-shrink-0 ${variantClasses[variant].icon}`}>
          {icons[variant]}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
            {message}
          </p>

          {showLink && (
            <Link
              href={linkHref}
              className="inline-block mt-3 text-sm font-medium text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
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
