import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
const productsRouter = require('../../routes/products');

// Dùng require() thay vì import để đồng bộ với CJS cache của src code, tránh lỗi biên dịch Schema Mongoose 2 lần
const productModel = require('../../schemas/products');
const inventoryModel = require('../../schemas/inventories');
const userController = require('../../controllers/users');
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// 1. Mock DB Methods directly using vi.spyOn to avoid Vite CJS Module Resolution Bugs
vi.spyOn(productModel, 'find');
vi.spyOn(productModel, 'findOne');
vi.spyOn(productModel, 'findByIdAndUpdate');
vi.spyOn(inventoryModel, 'findOne');

// Đối với prototype save, phải ghi đè prototype gốc vì products.js gọi "new productModel().save()"
productModel.prototype.save = vi.fn().mockResolvedValue(true);
productModel.prototype.populate = vi.fn().mockResolvedValue(true);
inventoryModel.prototype.save = vi.fn().mockResolvedValue(true);

// 2. Mock JWT & User Controller để Pass qua thực tế hàm CheckLogin, CheckRole
vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'user123', exp: 9999999999 });
vi.spyOn(userController, 'GetAnUserById').mockResolvedValue({ _id: 'user123', role: { name: 'ADMIN' } });

// Setup Express App
const app = express();
app.use(express.json());
app.use(cookieParser()); // Cookie parser cần cho CheckLogin
app.use('/api/v1/products', productsRouter);

const authHeader = 'Bearer fake-super-token'; // Token giả

describe('Products Router Tests (White-box Coverage)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        // Restore prototype mocks
        productModel.prototype.save = vi.fn().mockResolvedValue(true);
        productModel.prototype.populate = vi.fn().mockResolvedValue(true);
    });

    // ==========================================
    // GET /api/v1/products
    // ==========================================
    describe('GET /', () => {
        it('1. Nên trả về san pham voi default queries (Branch/Path Coverage: Không title, không categoryId)', async () => {
            const mockData = [{ title: 'Product 1' }];
            const mockPopulate = vi.fn().mockResolvedValue(mockData);
            productModel.find.mockReturnValue({ populate: mockPopulate });

            const res = await request(app).get('/api/v1/products');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockData);
            
            // Check Data Flow: filter object default
            expect(productModel.find).toHaveBeenCalledWith({
                isDeleted: false,
                price: { $gte: 0, $lte: Number.MAX_SAFE_INTEGER }
            });
            expect(mockPopulate).toHaveBeenCalledWith({ path: 'category', select: 'name slug' });
        });

        it('2. Nên ap dung query filter khi co title, minprice, maxprice, category (Data Flow / Path Coverage)', async () => {
            const mockPopulate = vi.fn().mockResolvedValue([]);
            productModel.find.mockReturnValue({ populate: mockPopulate });

            const res = await request(app).get('/api/v1/products?title=Ao&minprice=100&maxprice=500&category=cat123');

            expect(res.status).toBe(200);
            
            // Theo dõi luồng dữ liệu truyền vào filter
            const findArg = productModel.find.mock.calls[0][0];
            expect(findArg.isDeleted).toBe(false);
            expect(findArg.price).toEqual({ $gte: 100, $lte: 500 });
            expect(findArg.title).toBeInstanceOf(RegExp);
            expect(findArg.category).toBe('cat123');
        });

        it('3. Nên vao catch block neu co loi DB (Branch Coverage: Exception)', async () => {
            productModel.find.mockImplementation(() => { throw new Error('DB Error'); });

            const res = await request(app).get('/api/v1/products');

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'DB Error' });
        });
    });

    // ==========================================
    // GET /api/v1/products/:id
    // ==========================================
    describe('GET /:id', () => {
        it('4. Nên tra ve product va inventory (Branch Coverage: if(result) is True)', async () => {
            const mockProduct = { _id: 'prod123', title: 'Product' };
            const mockPopulate = vi.fn().mockResolvedValue(mockProduct);
            productModel.findOne.mockReturnValue({ populate: mockPopulate });
            
            inventoryModel.findOne.mockResolvedValue({ stock: 10 });

            const res = await request(app).get('/api/v1/products/prod123');

            expect(res.status).toBe(200);
            expect(res.body.product).toEqual(mockProduct);
            expect(res.body.inventory.stock).toBe(10);
        });

        it('5. Nên tra ve 404 khi khong tim thay san pham (Branch Coverage: if(result) is False)', async () => {
            const mockPopulate = vi.fn().mockResolvedValue(null);
            productModel.findOne.mockReturnValue({ populate: mockPopulate });

            const res = await request(app).get('/api/v1/products/prod123');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Khong tim thay san pham');
        });

        it('6. Nên vao catch block neu DB văng loi (ID khong hop le)', async () => {
            productModel.findOne.mockImplementation(() => { throw new Error('Invalid ID'); });

            const res = await request(app).get('/api/v1/products/invalidId');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('ID khong hop le');
        });
    });

    // ==========================================
    // POST /api/v1/products
    // ==========================================
    describe('POST /', () => {
        it('7. Nên tao moi product va inventory (Data Flow Coverage: gán dữ liệu req.body vào Model)', async () => {
            const body = {
                title: 'Áo Thun Nam',
                price: 150000,
                images: ['img1.jpg'],
                description: 'Đẹp',
                category: 'cat1',
                stock: 50
            };

            const res = await request(app).post('/api/v1/products')
                .set('Authorization', authHeader)
                .send(body);

            expect(res.status).toBe(201);
            expect(res.body.product.title).toBe('Áo Thun Nam');
            expect(res.body.product.slug).toBe('ao-thun-nam'); // Data flow: slugify generated
            expect(res.body.inventory.stock).toBe(50);
        });

        it('8. Nên tao inventory voi stock = 0 neu khong truyen (Branch: req.body.stock || 0)', async () => {
            const body = { title: 'Sản phẩm mới', price: 100 };

            const res = await request(app).post('/api/v1/products')
                .set('Authorization', authHeader)
                .send(body);

            expect(res.status).toBe(201);
            expect(res.body.inventory.stock).toBe(0); // Nhánh fallback
        });

        it('9. Nên vao catch block neu co loi khi luu (Branch: Exception)', async () => {
            // Thay đổi hành vi prototype của save thành bung lỗi Error
            productModel.prototype.save = vi.fn().mockRejectedValue(new Error('Save Error'));
            
            const res = await request(app).post('/api/v1/products')
                .set('Authorization', authHeader)
                .send({ title: 'Loi' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Save Error');
        });
    });

    // ==========================================
    // PUT /api/v1/products/:id
    // ==========================================
    describe('PUT /:id', () => {
        it('10. Nên update slug moi neu thay doi title (Branch: if(req.body.title) is True & Path Coverage)', async () => {
            const mockUpdateResult = { _id: 'prod1', title: 'Áo Mới', slug: 'ao-moi' };
            const mockPopulate = vi.fn().mockResolvedValue(mockUpdateResult);
            productModel.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate });

            const res = await request(app).put('/api/v1/products/prod1')
                .set('Authorization', authHeader)
                .send({ title: 'Áo Mới' });

            expect(res.status).toBe(200);
            
            // Data Flow
            const updatePayload = productModel.findByIdAndUpdate.mock.calls[0][1];
            expect(updatePayload.title).toBe('Áo Mới');
            expect(updatePayload.slug).toBe('ao-moi');
        });

        it('11. Không cap nhat slug neu KHONG truyen title (Branch: if(req.body.title) is False)', async () => {
            const mockUpdateResult = { _id: 'prod1', price: 200 };
            const mockPopulate = vi.fn().mockResolvedValue(mockUpdateResult);
            productModel.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate });

            const res = await request(app).put('/api/v1/products/prod1')
                .set('Authorization', authHeader)
                .send({ price: 200 });

            expect(res.status).toBe(200);
            
            const updatePayload = productModel.findByIdAndUpdate.mock.calls[0][1];
            expect(updatePayload.slug).toBeUndefined();
        });

        it('12. Nên tra ve 404 khi khong tim thay san pham de update (Branch: if(!result) is True)', async () => {
            const mockPopulate = vi.fn().mockResolvedValue(null);
            productModel.findByIdAndUpdate.mockReturnValue({ populate: mockPopulate });

            const res = await request(app).put('/api/v1/products/prod1')
                .set('Authorization', authHeader)
                .send({ price: 200 });

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Khong tim thay san pham');
        });

        it('13. Nên vao catch block neu co loi (Exception Path)', async () => {
            productModel.findByIdAndUpdate.mockImplementation(() => { throw new Error('Update Error'); });

            const res = await request(app).put('/api/v1/products/prod1')
                .set('Authorization', authHeader)
                .send({ price: 200 });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Update Error');
        });
    });

    // ==========================================
    // DELETE /api/v1/products/:id
    // ==========================================
    describe('DELETE /:id', () => {
        it('14. Nên thuc hien soft-delete (Branch: if(!result) is False)', async () => {
            const mockDeletedProduct = { _id: 'prod1', isDeleted: true };
            productModel.findByIdAndUpdate.mockResolvedValue(mockDeletedProduct);

            const res = await request(app).delete('/api/v1/products/prod1')
                .set('Authorization', authHeader);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Xoa san pham thanh cong');
        });

        it('15. Nên tra ve 404 neu khong tim thay ID (Branch: if(!result) is True)', async () => {
            productModel.findByIdAndUpdate.mockResolvedValue(null);

            const res = await request(app).delete('/api/v1/products/prod999')
                .set('Authorization', authHeader);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Khong tim thay san pham');
        });

        it('16. Nên vao catch block neu co loi bat thuong (Exception Path)', async () => {
            productModel.findByIdAndUpdate.mockRejectedValue(new Error('Delete Error'));

            const res = await request(app).delete('/api/v1/products/prod1')
                .set('Authorization', authHeader);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Delete Error');
        });
    });
});
