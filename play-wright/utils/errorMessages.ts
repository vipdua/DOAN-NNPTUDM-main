/**
 * REGISTER_ERROR_MESSAGES
 *
 * Nội dung lấy từ API response thực tế:
 *  - Success : { message: "Dang ky thanh cong", user: { _id, username, email, role } }
 *  - Duplicate: { message: "E11000 duplicate key error collection: SangT4.users
 *                 index: username_1 dup key: { username: \"hoangkutehbcd\" }" }
 */
export const REGISTER_ERROR_MESSAGES = {

    // ── FE validation ──────────────────────────────────────────────
    USERNAME_REQUIRED:  "username khong duoc rong",
    EMAIL_REQUIRED:     "email khong duoc rong",
    PASSWORD_REQUIRED:  "password khong duoc rong",

    USERNAME_TOO_SHORT: "username phai co it nhat 3 ky tu",
    USERNAME_TOO_LONG:  "username khong duoc vuot qua 30 ky tu",
    EMAIL_INVALID:      "email sai dinh dang",
    PASSWORD_WEAK:      "Mật khẩu phải có chữ hoa, chữ thường và số",

    // ── BE response ────────────────────────────────────────────────
    /** Trùng username hoặc email → MongoDB E11000 */
    DUPLICATE_KEY:      "E11000 duplicate key error",

    /** Đăng ký thành công */
    REGISTER_SUCCESS:   "Dang ky thanh cong",
};
