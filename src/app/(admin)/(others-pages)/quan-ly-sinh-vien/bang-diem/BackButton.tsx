"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Button from "@/components/ui/button/Button";

interface BackButtonProps {
  label?: string;
  className?: string;
}

/**
 * Nút quay lại tái sử dụng cho App Router.
 * - Tự động đọc `returnUrl` từ query string.
 * - Nếu `returnUrl` tồn tại -> decode và `router.push(returnUrl)`.
 * - Nếu không -> fallback về `router.back()`.
 */
const BackButton: React.FC<BackButtonProps> = ({ label = "Quay lại", className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    const returnUrl = searchParams.get("returnUrl");

    if (returnUrl) {
      try {
        const decoded = decodeURIComponent(returnUrl);
        if (decoded && typeof decoded === "string") {
          router.push(decoded);
          return;
        }
      } catch {
        // ignore decode error and fallback
      }
    }

    router.back();
  };

  return (
    <Button
      variant="outline"
      onClick={handleBack}
      startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
      className={className}
    >
      {label}
    </Button>
  );
};

export default BackButton;

