import { contactRegisterItem } from "../utils/contactHelper";

/**
 * ContactRegisterData
 *
 * Data factory dùng cho các kỹ thuật:
 *  - [EP]  Phân lớp tương đương
 *  - [BVA] Phân tích giá trị biên
 *  - [DT]  Bảng điều kiện (Decision Table)
 *  - [ST]  Chuyển trạng thái (State Transition)
 *  - [UC]  Use Case Testing
 *
 * API Response thực tế:
 *  - Thành công : { message: "Dang ky thanh cong", user: { _id, username, email, role } }
 *  - Trùng key  : { message: "E11000 duplicate key error collection: SangT4.users
 */
export const ContactRegisterData = {

    // ─────────────────────────────────────────────────────────────────
    // [EP] Lớp hợp lệ — tất cả trường đều đúng
    // ─────────────────────────────────────────────────────────────────

    /** [EP-VALID] Username + Email + Password đều hợp lệ → BE trả "Dang ky thanh cong" */
    validData: (): contactRegisterItem => ({
        username: `user_${Date.now()}`,
        email: `user_${Date.now()}@gmail.com`,
        password: "Abc12345"
    }),

    // ─────────────────────────────────────────────────────────────────
    // [EP] Lớp không hợp lệ — trường rỗng → FE validation (không gọi API)
    // ─────────────────────────────────────────────────────────────────

    /** [EP-EMPTY-USERNAME] Username rỗng → FE báo lỗi */
    emptyUsername: (): contactRegisterItem => ({
        username: "",
        email: "test@gmail.com",
        password: "Abc12345"
    }),

    /** [EP-EMPTY-EMAIL] Email rỗng → FE báo lỗi */
    emptyEmail: (): contactRegisterItem => ({
        username: "testuser",
        email: "",
        password: "Abc12345"
    }),

    /** [EP-EMPTY-PASSWORD] Password rỗng → FE báo lỗi */
    emptyPassword: (): contactRegisterItem => ({
        username: "testuser",
        email: "test@gmail.com",
        password: ""
    }),

    /** [DT-R5] Tất cả trường rỗng → FE hiện lỗi cả 3 trường */
    allEmpty: (): contactRegisterItem => ({
        username: "",
        email: "",
        password: ""
    }),

    // ─────────────────────────────────────────────────────────────────
    // [EP] Lớp email — phân lớp tương đương
    // ─────────────────────────────────────────────────────────────────

    /** [EP-EMAIL-INVALID-1] Thiếu @ → lớp không hợp lệ */
    emailMissingAt: (): contactRegisterItem => ({
        username: "testuser",
        email: "invalidemail.com",
        password: "Abc12345"
    }),

    /** [EP-EMAIL-INVALID-2] Thiếu domain extension → lớp không hợp lệ */
    emailMissingDomain: (): contactRegisterItem => ({
        username: "testuser",
        email: "invalid@",
        password: "Abc12345"
    }),

    // ─────────────────────────────────────────────────────────────────
    // [EP] Lớp password — thiếu thành phần bắt buộc (HOA + thường + số)
    // ─────────────────────────────────────────────────────────────────

    /** [EP-PWD-P1] Thiếu chữ hoa → lớp không hợp lệ */
    passwordMissingUppercase: (): contactRegisterItem => ({
        username: "testuser",
        email: "test@gmail.com",
        password: "abc12345"
    }),

    /** [EP-PWD-P2] Thiếu chữ thường → lớp không hợp lệ */
    passwordMissingLowercase: (): contactRegisterItem => ({
        username: "testuser",
        email: "test@gmail.com",
        password: "ABC12345"
    }),

    /** [EP-PWD-P3] Thiếu số → lớp không hợp lệ */
    passwordMissingNumber: (): contactRegisterItem => ({
        username: "testuser",
        email: "test@gmail.com",
        password: "Abcdefgh"
    }),

    // ─────────────────────────────────────────────────────────────────
    // [BVA] Phân tích giá trị biên — Độ dài username
    //   Min hợp lệ = 3 ký tự | Max hợp lệ = 30 ký tự
    //   2 ký tự  → min - 1 → invalid ← điểm biên quan trọng
    //   3 ký tự  → đúng biên min → valid ✅
    //  30 ký tự  → đúng biên max → valid ✅
    //  31 ký tự  → max + 1 → invalid ← điểm biên quan trọng
    // ─────────────────────────────────────────────────────────────────

    /** [BVA-USERNAME-1] 2 ký tự — biên min - 1 → invalid */
    username2Chars: (): contactRegisterItem => ({
        username: "ab",                                // 2 ký tự ❌
        email: "test@gmail.com",
        password: "Abc12345"
    }),

    /** [BVA-USERNAME-2] 3 ký tự — đúng biên min → valid */
    username3Chars: (): contactRegisterItem => ({
        username: "abc",                               // 3 ký tự ✅
        email: `bva3_${Date.now()}@gmail.com`,
        password: "Abc12345"
    }),

    /** [BVA-USERNAME-3] 30 ký tự — đúng biên max → valid */
    username30Chars: (): contactRegisterItem => ({
        username: "a".repeat(30),                      // 30 ký tự ✅
        email: `bva30_${Date.now()}@gmail.com`,
        password: "Abc12345"
    }),

    /** [BVA-USERNAME-4] 31 ký tự — max + 1 → invalid */
    username31Chars: (): contactRegisterItem => ({
        username: "a".repeat(31),                      // 31 ký tự ❌
        email: "test@gmail.com",
        password: "Abc12345"
    }),

    // ─────────────────────────────────────────────────────────────────
    // [BVA] Phân tích giá trị biên — Độ dài password
    //   Min hợp lệ = 8 ký tự
    //   7 ký tự  → min - 1 → invalid ← điểm biên quan trọng
    //   8 ký tự  → đúng biên min → valid ✅
    // ─────────────────────────────────────────────────────────────────

    /** [BVA-PWD-1] 7 ký tự — biên min - 1 → invalid */
    password7Chars: (): contactRegisterItem => ({
        username: "testuser",
        email: "test@gmail.com",
        password: "Abc1234"           // 7 ký tự ❌
    }),

    /** [BVA-PWD-2] 8 ký tự — đúng biên min → valid format */
    password8Chars: (): contactRegisterItem => ({
        username: `bvapwd_${Date.now()}`,
        email: `bvapwd_${Date.now()}@gmail.com`,
        password: "Abc12345"          // 8 ký tự ✅
    }),

    // ─────────────────────────────────────────────────────────────────
    // [UC] Use Case — email / username đã tồn tại → E11000
    // ─────────────────────────────────────────────────────────────────

    /** [UC-DUPLICATE] Username đã tồn tại trong DB → BE trả E11000 */
    duplicateUsername: (): contactRegisterItem => ({
        username: "admin",                    // username đã tồn tại
        email: `new_${Date.now()}@gmail.com`,
        password: "Abc12345"
    }),

    // ─────────────────────────────────────────────────────────────────
    // [UC] Use Case — retry: lần đầu sai → lần 2 đúng
    // ─────────────────────────────────────────────────────────────────

    /** [UC-RETRY-WRONG] Lần đầu: tất cả để rỗng → FE báo lỗi */
    retryFirstWrong: (): contactRegisterItem => ({
        username: "",
        email: "",
        password: ""
    }),

    /** [UC-RETRY-CORRECT] Lần 2: nhập đúng → đăng ký thành công */
    retrySecondCorrect: (): contactRegisterItem => ({
        username: `retry_${Date.now()}`,
        email: `retry_${Date.now()}@gmail.com`,
        password: "Abc12345"
    }),
};
