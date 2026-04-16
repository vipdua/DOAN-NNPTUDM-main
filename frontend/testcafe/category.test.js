import { Selector } from 'testcafe';

fixture('CATEGORY MANAGEMENT')
    .page('http://localhost:5173/login');

// ===== SELECTOR =====
const usernameInput = Selector('input').nth(0);
const passwordInput = Selector('input').nth(1);
const loginBtn = Selector('button').withText('Đăng Nhập');

const addBtn = Selector('button').withText('Thêm Danh mục');
const nameInput = Selector('input').nth(0);
const imageInput = Selector('input').nth(1);
const submitBtn = Selector('button').withText('Tạo danh mục');
const firstCard = Selector('.card').nth(0);
const editBtn = firstCard.find('button').nth(0);
const deleteBtn = Selector('button').find('svg').nth(1);

// ===== HELPER LOGIN =====
async function loginAdmin(t) {
    await t
        .typeText(usernameInput, 'admin')
        .typeText(passwordInput, 'Long123@')
        .click(loginBtn);

    await t.expect(Selector('body').innerText).notContains('Đăng nhập thất bại');

    await t.expect(Selector('h1').exists).ok();

    const token = await t.eval(() => localStorage.getItem('token'));
    await t.expect(token).ok();
}

// ==============================
// TEST CASES
// ==============================

// TC01 - Login & vào trang category
test('TC01 - Admin truy cập trang category', async t => {
    await loginAdmin(t);

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .expect(Selector('h1').innerText).contains('Danh mục');
});

// TC02 - Xem danh sách category
test('TC02 - Hiển thị danh sách category', async t => {
    await loginAdmin(t);

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .expect(Selector('.card').exists).ok();
});

// TC03 - Thêm category thành công
test('TC03 - Thêm category', async t => {
    await loginAdmin(t);

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .setNativeDialogHandler(() => true)
        .click(addBtn)
        .typeText(nameInput, 'Test Category')
        .typeText(imageInput, 'https://placehold.co/400x400')
        .click(submitBtn)
        .expect(Selector('body').innerText).contains('Test Category');
});

// TC04 - Thêm category thiếu name
test('TC04 - Thêm category thiếu name', async t => {
    await loginAdmin(t);

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .click(addBtn)
        .typeText(imageInput, 'https://placehold.co/400x400')
        .click(submitBtn);

    await t.expect(nameInput.value).eql('');
});

// TC05 - Sửa category
test('TC05 - Sửa category', async t => {
    await loginAdmin(t);

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .expect(Selector('h1').innerText).contains('Danh mục');

    const firstCard = Selector('.card').nth(0);
    const editBtn = firstCard.find('button').nth(0);
    const modal = Selector('form');

    await t
        .click(editBtn)
        .expect(modal.exists).ok();

    const nameInput = modal.find('input').nth(0);
    const submitBtn = modal.find('button').withText('Lưu thay đổi');

    await t
        .setNativeDialogHandler(() => true)
        .selectText(nameInput).pressKey('delete')
        .typeText(nameInput, 'Updated Category')
        .click(submitBtn)
        .expect(Selector('body').innerText).contains('Updated Category');
});

// TC06 - Xóa category
test('TC06 - Tạo rồi xóa category', async t => {
    await loginAdmin(t);

    const uniqueName = 'Test Delete ' + Date.now();

    const modal = Selector('form');
    const nameInput = modal.find('input').nth(0);
    const imageInput = modal.find('input').nth(1);
    const submitBtn = modal.find('button').withText('Tạo danh mục');

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .click(addBtn)
        .expect(modal.exists).ok()
        .setNativeDialogHandler(() => true)
        .typeText(nameInput, uniqueName)
        .typeText(imageInput, 'https://placehold.co/400x400')
        .click(submitBtn);

    // tìm đúng card vừa tạo
    const targetCard = Selector('.card').withText(uniqueName);
    const deleteBtn = targetCard.find('button').nth(1);

    await t
        .setNativeDialogHandler(() => true)
        .click(deleteBtn)
        .expect(Selector('body').innerText).notContains(uniqueName);
});

// TC07 - Không login → không vào được
test('TC07 - Không login không vào được admin', async t => {
    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .expect(Selector('body').innerText).contains('Đăng nhập');
});

// TC08 - Slug tự động tạo
test('TC08 - Kiểm tra slug', async t => {
    await loginAdmin(t);

    const modal = Selector('form');
    const nameInput = modal.find('input').nth(0);
    const imageInput = modal.find('input').nth(1);
    const submitBtn = modal.find('button').withText('Tạo danh mục');

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .click(addBtn)
        .expect(modal.exists).ok()
        .setNativeDialogHandler(() => true)
        .typeText(nameInput, 'Iphone 15 Pro Max')
        .typeText(imageInput, 'https://placehold.co/400x400')
        .click(submitBtn)
        .expect(Selector('body').innerText).contains('iphone-15-pro-max');
});

test('TC09 - Name quá dài', async t => {
    await loginAdmin(t);

    const longName = 'A'.repeat(300);

    const modal = Selector('form');
    const nameInput = modal.find('input').nth(0);

    await t
        .navigateTo('http://localhost:5173/admin/categories')
        .click(addBtn)
        .typeText(nameInput, longName)
        .click(Selector('button').withText('Tạo danh mục'))
        .setNativeDialogHandler(() => true);
});

test('TC10 - User không phải admin không được thêm category', async t => {
    // login user thường (nếu có)
    await t.navigateTo('/login');

    await t
        .typeText(usernameInput, 'user')
        .typeText(passwordInput, '123456')
        .click(loginBtn);

    await t
        .navigateTo('/admin/categories')
        .expect(Selector('body').innerText).contains('Đăng nhập');
});