/**
 * Utility functions for authentication and redirect handling
 */

/**
 * Lưu URL hiện tại vào sessionStorage trước khi redirect về login
 * @param currentPath - Đường dẫn hiện tại (thường là window.location.pathname)
 */
export const saveRedirectUrl = (currentPath: string): void => {
  // Chỉ lưu nếu không phải là trang login/signin
  if (currentPath && !currentPath.includes('/signin') && !currentPath.includes('/login')) {
    try {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    } catch (error) {
      console.error('Error saving redirect URL:', error);
    }
  }
};

/**
 * Lấy URL đã lưu và xóa nó khỏi sessionStorage
 * @param defaultPath - Đường dẫn mặc định nếu không có URL đã lưu
 * @returns URL để redirect hoặc defaultPath
 */
export const getAndClearRedirectUrl = (defaultPath: string = '/'): string => {
  try {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterLogin');
      return redirectUrl;
    }
  } catch (error) {
    console.error('Error getting redirect URL:', error);
  }
  return defaultPath;
};

/**
 * Xóa redirect URL khỏi sessionStorage (nếu cần)
 */
export const clearRedirectUrl = (): void => {
  try {
    sessionStorage.removeItem('redirectAfterLogin');
  } catch (error) {
    console.error('Error clearing redirect URL:', error);
  }
};
