/**
 * ============================================================
 *  contactRegisterForm.spec.ts
 * ============================================================
 *
 *  Kỹ thuật áp dụng:
 *  ┌─────────────────────────────────────┬──────────────────────────────────────────────┐
 *  │ Kỹ thuật                            │ Áp dụng tại describe                         │
 *  ├─────────────────────────────────────┼──────────────────────────────────────────────┤
 *  │ [EP]  Phân lớp tương đương          │ "EP - Username Partition"                     │
 *  │                                     │ "EP - Email Partition"                        │
 *  │                                     │ "EP - Password Partition"                     │
 *  ├─────────────────────────────────────┼──────────────────────────────────────────────┤
 *  │ [BVA] Phân tích giá trị biên        │ "BVA - Username Length Boundary"              │
 *  │                                     │ "BVA - Password Length Boundary"              │
 *  ├─────────────────────────────────────┼──────────────────────────────────────────────┤
 *  │ [DT]  Bảng điều kiện                │ "Decision Table - Register Conditions"        │
 *  ├─────────────────────────────────────┼──────────────────────────────────────────────┤
 *  │ [ST]  Chuyển trạng thái             │ "State Transition - Register Flow"            │
 *  ├─────────────────────────────────────┼──────────────────────────────────────────────┤
 *  │ [UC]  Use Case Testing              │ "Use Case - UC01 Register Success"            │
 *  │                                     │ "Use Case - UC02 Duplicate Username"          │
 *  │                                     │ "Use Case - UC03 Retry After Failure"         │
 *  └─────────────────────────────────────┴──────────────────────────────────────────────┘
 *
 *  ⚠️  LƯU Ý QUAN TRỌNG — Browser Native HTML5 Validation:
 *  ─────────────────────────────────────────────────────────
 *  Tất cả input trên form Register đều có thuộc tính `required` và `type`.
 *  Khi giá trị rỗng hoặc sai định dạng, TRÌNH DUYỆT tự block submit
 *  và hiện tooltip native ("Please fill out this field." / "Please enter
 *  a part following '@'...") — React KHÔNG render bất kỳ error text nào.
 *
 *  → Các test case liên quan đến field rỗng / email sai định dạng PHẢI
 *    dùng el.validity.valid / el.validationMessage thay vì getByText().
 *
 *  Chỉ dùng getByText() cho lỗi do BE trả về (duplicate, password yếu...)
 *  vì lúc đó form đã submit được và React mới render error message.
 *
 *  API Response thực tế:
 *   - 200 Success : { message: "Dang ky thanh cong",
 *                     user: { _id, username, email, role } }
 *   - Duplicate   : { message: "E11000 duplicate key error collection:
 *                     SangT4.users index: username_1 dup key: { username: ... }" }
 */

import { test, expect } from '@playwright/test';
import { ContactRegisterPage } from '../pages/contactRegisterPage';
import { ContactRegisterData } from '../fixtures/contactRegisterData';
import { REGISTER_ERROR_MESSAGES } from '../utils/errorMessages';

/** Helper: lấy validationMessage của một input — dùng cho native browser validation */
async function getNativeValidationMsg(locator: ReturnType<typeof locator>) {
    return await locator.evaluate((el: HTMLInputElement) => el.validationMessage);
}

/** Helper: kiểm tra input có bị browser đánh dấu invalid không */
async function isInputInvalid(locator: ReturnType<typeof locator>) {
    return await locator.evaluate((el: HTMLInputElement) => !el.validity.valid);
}

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
});


// ════════════════════════════════════════════════════════════════════════
//  [EP] Phân lớp tương đương — Username partition
//
//  Lớp hợp lệ      : 3–30 ký tự, không rỗng
//  Lớp không hợp lệ: rỗng → browser native "Please fill out this field."
// ════════════════════════════════════════════════════════════════════════
test.describe("[EP] Phân lớp tương đương - Username", () => {

    test("[EP-USERNAME-VALID] Username hợp lệ → không báo lỗi native", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.validData());

        // Input hợp lệ → validity.valid = true
        const invalid = await registerPage.usernameInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(invalid).toBe(false);
    });

    test("[EP-USERNAME-EMPTY] Username rỗng → browser báo 'Please fill out this field.'", async ({ page }) => {
        // ⚠️ required attribute → browser native validation, KHÔNG gọi API
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emptyUsername());
        await registerPage.clickRegister();

        // Browser đánh dấu input invalid, giữ nguyên trang
        const isInvalid = await registerPage.usernameInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid).toBe(true);
        await expect(page).toHaveURL(/register/);
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [EP] Phân lớp tương đương — Email partition
//
//  Lớp hợp lệ        : a@b.com
//  Lớp không hợp lệ 1: rỗng        → browser "Please fill out this field."
//  Lớp không hợp lệ 2: sai định dạng → browser "Please enter a part following '@'..."
// ════════════════════════════════════════════════════════════════════════
test.describe("[EP] Phân lớp tương đương - Email", () => {

    test("[EP-EMAIL-VALID] Email hợp lệ → validity.valid = true", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.validData());

        const isValid = await registerPage.emailInput.evaluate(
            (el: HTMLInputElement) => el.validity.valid
        );
        expect(isValid).toBe(true);
    });

    test("[EP-EMAIL-EMPTY] Email rỗng → browser 'Please fill out this field.'", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emptyEmail());
        await registerPage.clickRegister();

        const isInvalid = await registerPage.emailInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid).toBe(true);
        await expect(page).toHaveURL(/register/);
    });

    test("[EP-EMAIL-INVALID-1] Email thiếu @ (invalidemail.com) → browser native block submit", async ({ page }) => {
        // ⚠️ type="email" → browser hiện "Please include an '@' in the email address."
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emailMissingAt());
        await registerPage.clickRegister();

        const isEmailValid = await registerPage.emailInput.evaluate(
            (el: HTMLInputElement) => el.validity.valid
        );
        expect(isEmailValid).toBe(false);
        await expect(page).toHaveURL(/register/);
    });

    test("[EP-EMAIL-INVALID-2] Email thiếu domain (hh@) → browser native 'Please enter a part following @'", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emailMissingDomain());
        await registerPage.clickRegister();

        const validationMessage = await registerPage.emailInput.evaluate(
            (el: HTMLInputElement) => el.validationMessage
        );
        // Browser tự sinh message, chỉ cần xác nhận có lỗi
        expect(validationMessage.length).toBeGreaterThan(0);
        await expect(page).toHaveURL(/register/);
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [EP] Phân lớp tương đương — Password partition
//
//  Quy tắc BE: phải có HOA + thường + số + ≥ 8 ký tự
//
//  Lớp hợp lệ       : đủ HOA + thường + số + ≥ 8 ký tự
//  Lớp không hợp lệ :
//    P1 — thiếu HOA    → BE trả lỗi (form đã qua native validation vì có đủ ký tự)
//    P2 — thiếu thường → BE trả lỗi
//    P3 — thiếu số     → BE trả lỗi
//  Lớp không hợp lệ rỗng:
//    P0 — rỗng → browser native "Please fill out this field."
// ════════════════════════════════════════════════════════════════════════
test.describe("[EP] Phân lớp tương đương - Password", () => {

    test("[EP-PWD-EMPTY] Password rỗng → browser 'Please fill out this field.'", async ({ page }) => {
        // ⚠️ required attribute → browser native, không gọi API
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emptyPassword());
        await registerPage.clickRegister();

        const isInvalid = await registerPage.passwordInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid).toBe(true);
        await expect(page).toHaveURL(/register/);
    });

    const partitions = [
        { label: "P1 - thiếu chữ hoa", data: ContactRegisterData.passwordMissingUppercase() },
        { label: "P2 - thiếu chữ thường", data: ContactRegisterData.passwordMissingLowercase() },
        { label: "P3 - thiếu số", data: ContactRegisterData.passwordMissingNumber() },
    ];

    // Các trường hợp này có đủ ký tự → qua native validation → form submit → BE báo lỗi
    partitions.forEach(({ label, data }) => {
        test(`[EP-PWD] ${label} → form submit được, BE/FE báo password yếu`, async ({ page }) => {
            const registerPage = new ContactRegisterPage(page);

            const responsePromise = page.waitForResponse(
                res => res.url().includes('/register') && res.request().method() === 'POST'
            );
            await registerPage.fillForm(data);
            await registerPage.clickRegister();
            const response = await responsePromise;

            const body = await response.json();
            expect(body.success).toBe(false);
            await expect(page.getByText(REGISTER_ERROR_MESSAGES.PASSWORD_WEAK)).toBeVisible();
        });
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [BVA] Phân tích giá trị biên — Độ dài username
//
//   2 ký tự  → min - 1 → invalid  ← điểm biên quan trọng
//   3 ký tự  → đúng biên min → valid ✅
//  30 ký tự  → đúng biên max → valid ✅
//  31 ký tự  → max + 1 → invalid  ← điểm biên quan trọng
// ════════════════════════════════════════════════════════════════════════
test.describe("[BVA] Phân tích giá trị biên - Độ dài Username", () => {

    test("[BVA-USERNAME-1] 2 ký tự — biên min-1 → FE/BE báo lỗi quá ngắn", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.username2Chars()); // "ab"
        await registerPage.clickRegister();

        await expect(page.getByText(REGISTER_ERROR_MESSAGES.USERNAME_TOO_SHORT)).toBeVisible();
    });

    test("[BVA-USERNAME-2] 3 ký tự — đúng biên min → valid, không lỗi username length", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.username3Chars()); // "abc" + unique email
        await registerPage.clickRegister();
        const response = await responsePromise;

        const body = await response.json();
        // Username đủ dài → không có lỗi về length
        expect(body.errors?.username).toBeUndefined();
    });

    test("[BVA-USERNAME-3] 30 ký tự — đúng biên max → valid, không lỗi username length", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.username30Chars());
        await registerPage.clickRegister();
        const response = await responsePromise;

        const body = await response.json();
        expect(body.errors?.username).toBeUndefined();
    });

    test("[BVA-USERNAME-4] 31 ký tự — max+1 → FE/BE báo lỗi quá dài", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.username31Chars());
        await registerPage.clickRegister();

        await expect(page.getByText(REGISTER_ERROR_MESSAGES.USERNAME_TOO_LONG)).toBeVisible();
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [BVA] Phân tích giá trị biên — Độ dài password
//
//   7 ký tự  → min - 1 → invalid ← điểm biên quan trọng
//   8 ký tự  → đúng biên min → valid ✅
// ════════════════════════════════════════════════════════════════════════
test.describe("[BVA] Phân tích giá trị biên - Độ dài Password", () => {

    test("[BVA-PWD-1] 7 ký tự — biên min-1 → form submit được, BE báo lỗi", async ({ page }) => {
        // ⚠️ "Abc1234" có đủ ký tự → qua native validation → submit → BE/FE báo lỗi
        const registerPage = new ContactRegisterPage(page);

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.password7Chars()); // "Abc1234" = 7 ký tự
        await registerPage.clickRegister();
        const response = await responsePromise;

        const body = await response.json();
        expect(body.errors?.password).toBeDefined();
    });

    test("[BVA-PWD-2] 8 ký tự — đúng biên min → valid format, không lỗi password", async ({ page }) => {
        // ✅ "Abc12345" = 8 ký tự đúng biên — phải được chấp nhận
        const registerPage = new ContactRegisterPage(page);

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.password8Chars());
        await registerPage.clickRegister();
        const response = await responsePromise;

        const body = await response.json();
        expect(body.errors?.password).toBeUndefined();
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [DT] Bảng điều kiện — Register Conditions
//
//  ┌──────────┬─────────┬────────────┬─────────────────────────────────────┐
//  │ Username │  Email  │  Password  │  Kết quả                            │
//  ├──────────┼─────────┼────────────┼─────────────────────────────────────┤
//  │ ✅       │ ✅      │ ✅         │ 200 → "Dang ky thanh cong"          │ R1
//  │ ✅       │ ✅      │ ❌ yếu     │ BE 400 → lỗi password yếu           │ R2
//  │ ✅       │ ❌ sai  │ ✅         │ Browser native block (invalid email) │ R3
//  │ ❌ rỗng  │ ✅      │ ✅         │ Browser native "fill out this field" │ R4
//  │ ❌ rỗng  │ ❌ rỗng │ ❌ rỗng   │ Browser native block field đầu tiên │ R5
//  └──────────┴─────────┴────────────┴─────────────────────────────────────┘
// ════════════════════════════════════════════════════════════════════════
test.describe("[DT] Bảng điều kiện - Register Conditions", () => {

    test("[DT-R1] Username ✅ | Email ✅ | Password ✅ → 200, message 'Dang ky thanh cong'", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        const data = ContactRegisterData.validData();

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(data);
        await registerPage.clickRegister();
        const response = await responsePromise;

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.message).toBe(REGISTER_ERROR_MESSAGES.REGISTER_SUCCESS);
        expect(body.user).toBeDefined();
        expect(body.user._id).toBeTruthy();
        expect(body.user.username).toBe(data.username);
        expect(body.user.email).toBe(data.email);
        expect(body.user.role).toBeTruthy();
    });

    test("[DT-R2] Username ✅ | Email ✅ | Password ❌ yếu → BE báo lỗi password", async ({ page }) => {
        // Password "abc12345" đủ ký tự → qua native → submit → BE từ chối
        const registerPage = new ContactRegisterPage(page);

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.passwordMissingUppercase());
        await registerPage.clickRegister();
        const response = await responsePromise;

        const body = await response.json();
        expect(body.success).toBe(false);
        await expect(page.getByText(REGISTER_ERROR_MESSAGES.PASSWORD_WEAK)).toBeVisible();
    });

    test("[DT-R3] Username ✅ | Email ❌ sai định dạng | Password ✅ → browser native block", async ({ page }) => {
        // ⚠️ type="email" → browser hiện tooltip native, form không submit
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emailMissingAt());
        await registerPage.clickRegister();

        const isEmailValid = await registerPage.emailInput.evaluate(
            (el: HTMLInputElement) => el.validity.valid
        );
        expect(isEmailValid).toBe(false);
        await expect(page).toHaveURL(/register/);
    });

    test("[DT-R4] Username ❌ rỗng | Email ✅ | Password ✅ → browser 'Please fill out this field.'", async ({ page }) => {
        // ⚠️ required attribute → browser block native, không gọi API
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.emptyUsername());
        await registerPage.clickRegister();

        const isInvalid = await registerPage.usernameInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid).toBe(true);
        await expect(page).toHaveURL(/register/);
    });

    test("[DT-R5] Tất cả trường rỗng → browser block field đầu tiên gặp", async ({ page }) => {
        // ⚠️ Browser hiện native tooltip trên field đầu tiên invalid (thường là username)
        // Không gọi API, không navigate
        const registerPage = new ContactRegisterPage(page);
        await registerPage.fillForm(ContactRegisterData.allEmpty());
        await registerPage.clickRegister();

        // Ít nhất username phải invalid (field đầu tiên)
        const isUsernameInvalid = await registerPage.usernameInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isUsernameInvalid).toBe(true);

        // Toàn bộ form không submit
        await expect(page).toHaveURL(/register/);
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [ST] Chuyển trạng thái — Register Flow
//
//  [S1: /register] ── input đúng → Đăng Ký ──► [S2: /login]
//  [S1: /register] ── input sai  → Đăng Ký ──► [S1: /register] (browser block)
// ════════════════════════════════════════════════════════════════════════
test.describe("[ST] Chuyển trạng thái - Register Flow", () => {

    test("[ST-T1] S1(/register) → input đúng → S2(/login) — chuyển trạng thái thành công", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        await expect(page).toHaveURL(/register/);   // S1

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.validData());
        await registerPage.clickRegister();
        const response = await responsePromise;

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.message).toBe(REGISTER_ERROR_MESSAGES.REGISTER_SUCCESS);

        // S2: chuyển sang /login sau đăng ký thành công
        await expect(page).toHaveURL(/login/);
    });

    test("[ST-T2] S1(/register) → username rỗng → browser block → giữ S1", async ({ page }) => {
        // ⚠️ required → browser native block, không navigate
        const registerPage = new ContactRegisterPage(page);
        await expect(page).toHaveURL(/register/);   // S1

        await registerPage.fillForm(ContactRegisterData.emptyUsername());
        await registerPage.clickRegister();

        // Vẫn S1, input bị đánh dấu invalid
        await expect(page).toHaveURL(/register/);
        const isInvalid = await registerPage.usernameInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid).toBe(true);
    });

});


// ════════════════════════════════════════════════════════════════════════
//  [UC] Use Case Testing
//
//  UC01: Đăng ký thành công → user object có _id, username, email, role
//  UC02: Username đã tồn tại → BE trả E11000 duplicate key error
//  UC03: Nhập sai lần đầu (để rỗng) → browser block → nhập đúng lần 2 → thành công
// ════════════════════════════════════════════════════════════════════════
test.describe("[UC] Use Case Testing - Register", () => {

    test("[UC01] Đăng ký thành công → API trả đủ _id, username, email, role", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);
        const data = ContactRegisterData.validData();

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(data);
        await registerPage.clickRegister();
        const response = await responsePromise;

        expect(response.status()).toBe(201);
        const body = await response.json();

        expect(body.message).toBe(REGISTER_ERROR_MESSAGES.REGISTER_SUCCESS);
        expect(body.user._id).toMatch(/^[0-9a-f]{24}$/);   // MongoDB ObjectId
        expect(body.user.username).toBe(data.username);
        expect(body.user.email).toBe(data.email);
        expect(body.user.role).toBeTruthy();
    });

    test("[UC02] Username đã tồn tại → BE trả E11000 duplicate key error", async ({ page }) => {
        // "hoangkutehbcd" đã có trong DB → BE từ chối
        const registerPage = new ContactRegisterPage(page);

        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.duplicateUsername());
        await registerPage.clickRegister();
        const response = await responsePromise;

        const body = await response.json();
        expect(body.message).toContain(REGISTER_ERROR_MESSAGES.DUPLICATE_KEY);

        // FE hiển thị thông báo lỗi E11000 từ BE
        await expect(page.getByText(REGISTER_ERROR_MESSAGES.DUPLICATE_KEY)).toBeVisible();
    });

    test("[UC03] Lần 1: để trống → browser block → Lần 2: nhập đúng → thành công", async ({ page }) => {
        const registerPage = new ContactRegisterPage(page);

        // ── Lần 1: để trống → browser native block ────────────────
        await registerPage.fillForm(ContactRegisterData.retryFirstWrong()); // all empty
        await registerPage.clickRegister();

        // Browser block, vẫn ở /register
        await expect(page).toHaveURL(/register/);
        const isInvalid = await registerPage.usernameInput.evaluate(
            (el: HTMLInputElement) => !el.validity.valid
        );
        expect(isInvalid).toBe(true);

        // ── Lần 2: nhập đúng → đăng ký thành công ────────────────
        const responsePromise = page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await registerPage.fillForm(ContactRegisterData.retrySecondCorrect());
        await registerPage.clickRegister();
        const response = await responsePromise;

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.message).toBe(REGISTER_ERROR_MESSAGES.REGISTER_SUCCESS);

        // Chuyển hướng sang /login
        await expect(page).toHaveURL(/login/);
    });

});
