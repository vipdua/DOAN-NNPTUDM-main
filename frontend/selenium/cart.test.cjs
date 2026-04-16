const { Builder, By, until } = require('selenium-webdriver');

// =========================
// HELPER LOGIN
// =========================
async function login(driver) {
    await driver.get('http://localhost:5173/login');

    let inputs = await driver.findElements(By.css('input'));

    await inputs[0].sendKeys('admin');
    await inputs[1].sendKeys('Admin123@');

    await driver.findElement(By.xpath("//button[contains(text(),'Đăng Nhập')]")).click();

    await driver.wait(until.urlContains('/'), 5000);

    // đợi token
    await driver.wait(async () => {
        let token = await driver.executeScript("return localStorage.getItem('token')");
        return token !== null;
    }, 5000);

    console.log("✅ Login OK");
}

// =========================
// HELPER ADD PRODUCT
// =========================
async function addToCart(driver) {
    await driver.get('http://localhost:5173/products');

    await driver.wait(until.elementLocated(By.css('.btn-add-quick')), 10000);

    let addBtn = await driver.findElement(By.css('.btn-add-quick'));
    await addBtn.click();

    // handle alert
    try {
        await driver.wait(until.alertIsPresent(), 3000);
        let alert = await driver.switchTo().alert();
        console.log("Alert:", await alert.getText());
        await alert.accept();
    } catch (e) { }

    console.log("✅ Add to cart");
}

// =========================
// TC01 - Login
// =========================
async function TC01_Login() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
    } finally {
        await driver.quit();
    }
}

// =========================
// TC02 - Add to cart
// =========================
async function TC02_AddCart() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await addToCart(driver);
    } finally {
        await driver.quit();
    }
}

// =========================
// TC03 - View cart
// =========================
async function TC03_ViewCart() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await driver.get('http://localhost:5173/cart');

        await driver.wait(until.elementLocated(By.css('.card')), 5000);

        console.log("✅ View cart OK");
    } finally {
        await driver.quit();
    }
}

// =========================
// TC04 - Increase quantity
// =========================
async function TC04_Increase() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await addToCart(driver);

        await driver.get('http://localhost:5173/cart');

        // 🔥 đợi cart load
        await driver.wait(until.elementLocated(By.css('.card')), 5000);

        let card = await driver.findElement(By.css('.card'));
        let buttons = await card.findElements(By.css('button'));

        if (buttons.length >= 2) {
            await buttons[1].click(); // ➕
        } else {
            throw new Error("❌ Không tìm thấy nút tăng");
        }

        console.log("✅ Increase OK");
    } finally {
        await driver.quit();
    }
}

// =========================
// TC05 - Decrease quantity
// =========================
async function TC05_Decrease() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await addToCart(driver);

        await driver.get('http://localhost:5173/cart');

        await driver.wait(until.elementLocated(By.css('.card')), 5000);

        let card = await driver.findElement(By.css('.card'));
        let buttons = await card.findElements(By.css('button'));

        if (buttons.length >= 1) {
            await buttons[0].click(); // ➖
        } else {
            throw new Error("❌ Không tìm thấy nút giảm");
        }

        console.log("✅ Decrease OK");
    } finally {
        await driver.quit();
    }
}

// =========================
// TC06 - Delete product
// =========================
async function TC06_Delete() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await addToCart(driver);

        await driver.get('http://localhost:5173/cart');

        await driver.wait(until.elementLocated(By.css('.card')), 5000);

        let card = await driver.findElement(By.css('.card'));
        let buttons = await card.findElements(By.css('button'));

        if (buttons.length >= 3) {
            await buttons[2].click(); // ❌ Xóa
        } else {
            throw new Error("❌ Không tìm thấy nút xóa");
        }

        console.log("✅ Delete OK");
    } finally {
        await driver.quit();
    }
}

// =========================
// TC07 - Không login
// =========================
async function TC07_NoLogin() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('http://localhost:5173/products');

        await driver.wait(until.elementLocated(By.css('.btn-add-quick')), 10000);

        let addBtn = await driver.findElement(By.css('.btn-add-quick'));
        await addBtn.click();

        let alert = await driver.switchTo().alert();
        console.log("TC07 Alert:", await alert.getText());
        await alert.accept();

        console.log("✅ TC07 PASS");
    } finally {
        await driver.quit();
    }
}

// =========================
// TC08 - Add nhiều lần
// =========================
async function TC08_AddMultiple() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);

        await driver.get('http://localhost:5173/products');
        await driver.wait(until.elementLocated(By.css('.btn-add-quick')), 10000);

        let addBtn = await driver.findElement(By.css('.btn-add-quick'));

        // click lần 1
        await addBtn.click();

        await driver.wait(until.alertIsPresent(), 5000);
        let alert1 = await driver.switchTo().alert();
        console.log("TC08 Alert 1:", await alert1.getText());
        await alert1.accept();

        // click lần 2
        await addBtn.click();

        await driver.wait(until.alertIsPresent(), 5000);
        let alert2 = await driver.switchTo().alert();
        console.log("TC08 Alert 2:", await alert2.getText());
        await alert2.accept();

        console.log("✅ TC08 Add multiple OK");

    } finally {
        await driver.quit();
    }
}

// =========================
// TC09 - Decrease về 0
// =========================
async function TC09_DecreaseToZero() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);
        await addToCart(driver);

        await driver.get('http://localhost:5173/cart');

        await driver.wait(until.elementLocated(By.css('.card')), 5000);

        let card = await driver.findElement(By.css('.card'));
        let buttons = await card.findElements(By.css('button'));

        await buttons[0].click(); // giảm

        console.log("✅ TC09 Decrease to zero OK");
    } finally {
        await driver.quit();
    }
}

// =========================
// TC10 - Vượt tồn kho
// =========================
async function TC10_StockLimit() {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await login(driver);

        await driver.get('http://localhost:5173/products');
        await driver.wait(until.elementLocated(By.css('.btn-add-quick')), 10000);

        let addBtn = await driver.findElement(By.css('.btn-add-quick'));

        for (let i = 0; i < 10; i++) {
            await addBtn.click();

            try {
                await driver.wait(until.alertIsPresent(), 2000);
                let alert = await driver.switchTo().alert();
                console.log("TC10 Alert:", await alert.getText());
                await alert.accept();
            } catch (e) { }
        }

        try {
            let alert = await driver.switchTo().alert();
            console.log("TC10 Alert:", await alert.getText());
            await alert.accept();
        } catch (e) { }

        console.log("✅ TC10 Stock test OK");
    } finally {
        await driver.quit();
    }
}

// =========================
// RUN ALL TEST
// =========================
async function runTests() {
    await TC01_Login();
    await TC02_AddCart();
    await TC03_ViewCart();
    await TC04_Increase();
    await TC05_Decrease();
    await TC06_Delete();
    await TC07_NoLogin();
    await TC08_AddMultiple();
    await TC09_DecreaseToZero();
    await TC10_StockLimit();
}

runTests();