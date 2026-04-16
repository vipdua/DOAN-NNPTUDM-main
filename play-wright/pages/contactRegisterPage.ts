import { Page, expect, Locator } from "@playwright/test";
import { contactRegisterItem } from "../utils/contactHelper";

/**
 * ContactRegisterPage
 *
 * Page Object Model cho trang /register.
 *
 * Selectors dựa trên FE thực tế (data_fe_lastes.ts):
 *   - Nhập tên đăng nhập của bạn → username
 *   - Nhập email của bạn         → email
 *   - ••••••••                   → password
 *   - Button "Đăng Ký"           → submit
 */
export class ContactRegisterPage {
    readonly page: Page;

    readonly usernameInput: Locator;
    readonly emailInput:    Locator;
    readonly passwordInput: Locator;
    readonly registerButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.usernameInput  = page.getByRole('textbox', { name: 'Nhập tên đăng nhập của bạn' });
        this.emailInput     = page.getByRole('textbox', { name: 'Nhập email của bạn' });
        this.passwordInput  = page.getByRole('textbox', { name: '••••••••' });
        this.registerButton = page.getByRole('button',  { name: 'Đăng Ký' });
    }

    // ── Navigation ─────────────────────────────────────────────────

    async goToRegister() {
        await this.page.goto('http://localhost:5173/register');
    }

    // ── Assertions ─────────────────────────────────────────────────

    async verifyFieldsAreVisible() {
        await expect(this.usernameInput,  "Username input visible").toBeVisible();
        await expect(this.emailInput,     "Email input visible").toBeVisible();
        await expect(this.passwordInput,  "Password input visible").toBeVisible();
        await expect(this.registerButton, "Register button visible").toBeVisible();
    }

    // ── Actions ────────────────────────────────────────────────────

    async fillForm(data: contactRegisterItem) {
        await this.usernameInput.fill(data.username);
        await this.emailInput.fill(data.email);
        await this.passwordInput.fill(data.password);
    }

    async clickRegister() {
        await this.registerButton.click();
    }

    /**
     * Điền form và click submit, rồi trả về API response.
     * Chỉ dùng khi cần kiểm tra phản hồi BE.
     */
    async fillAndSubmit(data: contactRegisterItem) {
        const responsePromise = this.page.waitForResponse(
            res => res.url().includes('/register') && res.request().method() === 'POST'
        );
        await this.fillForm(data);
        await this.clickRegister();
        return await responsePromise;
    }
}
