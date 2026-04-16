describe('AUTH - LOGIN TEST (USERNAME)', () => {

    const username = 'admin';
    const password = 'Admin123@';

    beforeEach(() => {
        cy.visit('/login');
    });

    // ==============================
    // 1. EQUIVALENCE PARTITIONING
    // ==============================

    it('TC01 - Login thành công', () => {
        cy.get('input').eq(0).type(username);
        cy.get('input').eq(1).type(password);

        cy.get('button[type="submit"]').click();

        cy.url().should('include', '/admin/dashboard');
    });

    it('TC02 - Sai username', () => {
        cy.get('input').eq(0).type('saiuser');
        cy.get('input').eq(1).type('Admin123@');

        cy.get('button').click();

        cy.contains('Ten dang nhap hoac mat khau sai');
    });

    it('TC03 - Sai password', () => {
        cy.get('input').eq(0).type(username);
        cy.get('input').eq(1).type('sai123');

        cy.get('button').click();

        cy.contains('Ten dang nhap hoac mat khau sai');
    });

    it('TC04 - Bỏ trống form', () => {
        cy.get('button').click();

        cy.get('input:invalid').should('have.length', 2);
    });

    // ==============================
    // 2. BOUNDARY VALUE
    // ==============================

    it('TC05 - Password cực ngắn', () => {
        cy.get('input').eq(0).type(username);
        cy.get('input').eq(1).type('1');

        cy.get('button').click();

        cy.contains('Ten dang nhap hoac mat khau sai');
    });

    it('TC06 - Username chỉ chứa khoảng trắng', () => {
        cy.get('input').eq(0).type('   ');
        cy.get('input').eq(1).type(password);

        cy.get('button').click();
    });

    // ==============================
    // 3. DECISION TABLE
    // ==============================

    it('TC07 - Username đúng, password sai', () => {
        cy.get('input').eq(0).type(username);
        cy.get('input').eq(1).type('wrongpass');

        cy.get('button').click();

        cy.contains('Ten dang nhap hoac mat khau sai');
    });

    it('TC08 - Sai cả username và password', () => {
        cy.get('input').eq(0).type('abc');
        cy.get('input').eq(1).type('123');

        cy.get('button').click();

        cy.contains('Ten dang nhap hoac mat khau sai');
    });

    // ==============================
    // 4. STATE TRANSITION
    // ==============================

    it('TC09 - Sai nhiều lần vẫn không đăng nhập được', () => {
        for (let i = 0; i < 3; i++) {
            cy.get('input').eq(0).clear().type(username);
            cy.get('input').eq(1).clear().type('sai123');

            cy.get('button').click();

            cy.contains('Ten dang nhap hoac mat khau sai');
        }
    });

    it('TC10 - Login lưu token', () => {
        cy.get('input').eq(0).type('admin');
        cy.get('input').eq(1).type('Admin123@');

        cy.get('button').click();

        // Đợi chuyển trang
        cy.url().should('include', '/admin/dashboard');

        // Kiểm tra localStorage sau khi đã login xong
        cy.window().then((win) => {
            const token = win.localStorage.getItem('token');
            expect(token).to.not.be.null;
        });
    });

});