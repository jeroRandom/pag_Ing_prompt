// FoodControl - Inicio de sesión y datos iniciales
// Versión académica: las credenciales y los datos viven en localStorage.

document.addEventListener('DOMContentLoaded', function () {
    // Si ya hay una sesión activa, ir directamente al panel
    const currentUser = localStorage.getItem('foodcontrol_currentUser');
    if (currentUser) {
        window.location.href = 'pages/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        document.getElementById('usernameError').style.display = 'none';
        document.getElementById('passwordError').style.display = 'none';
        document.getElementById('loginError').style.display = 'none';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        let isValid = true;

        if (username === '') {
            document.getElementById('usernameError').textContent = 'El usuario es requerido';
            document.getElementById('usernameError').style.display = 'block';
            isValid = false;
        }

        if (password === '') {
            document.getElementById('passwordError').textContent = 'La contraseña es requerida';
            document.getElementById('passwordError').style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        // Credenciales ficticias de demostración
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('foodcontrol_currentUser', JSON.stringify({
                username: username,
                name: 'Administrador',
                role: 'Administrador',
                loginTime: new Date().toISOString()
            }));

            initializeData();
            window.location.href = 'pages/dashboard.html';
        } else {
            document.getElementById('loginError').textContent = 'Usuario o contraseña incorrectos';
            document.getElementById('loginError').style.display = 'block';
        }
    });
});

// Crea los datos de demostración la primera vez que se abre el sistema.
function initializeData() {
    if (!localStorage.getItem('foodcontrol_products')) {
        localStorage.setItem('foodcontrol_products', JSON.stringify(getDemoProducts()));
    }

    if (!localStorage.getItem('foodcontrol_tables')) {
        localStorage.setItem('foodcontrol_tables', JSON.stringify(getDemoTables()));
    }

    if (!localStorage.getItem('foodcontrol_orders')) {
        localStorage.setItem('foodcontrol_orders', JSON.stringify(getDemoOrders()));
    }

    if (!localStorage.getItem('foodcontrol_sales')) {
        localStorage.setItem('foodcontrol_sales', JSON.stringify(getDemoSales()));
    }

    if (!localStorage.getItem('foodcontrol_config')) {
        localStorage.setItem('foodcontrol_config', JSON.stringify({
            lastProductId: 12,
            lastOrderId: 6,
            lastSaleId: 3
        }));
    }
}

function dateOffset(days, hour, minute) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, minute, 0, 0);
    return date;
}

function formatDemoDate(date) {
    return date.toLocaleDateString('es-CO');
}

function formatDemoTime(date) {
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function getDemoProducts() {
    return [
        {
            id: 1,
            name: 'Hamburguesa Clásica',
            description: 'Carne de res, lechuga, tomate, cebolla y salsa especial',
            category: 'Hamburguesas',
            price: 25000,
            image: 'assets/images/burger1.svg',
            available: true
        },
        {
            id: 2,
            name: 'Hamburguesa Doble',
            description: 'Doble carne, queso cheddar, bacon, lechuga y tomate',
            category: 'Hamburguesas',
            price: 35000,
            image: 'assets/images/burger2.svg',
            available: true
        },
        {
            id: 3,
            name: 'Pizza Margarita',
            description: 'Salsa de tomate, mozzarella y albahaca fresca',
            category: 'Pizzas',
            price: 32000,
            image: 'assets/images/pizza1.svg',
            available: true
        },
        {
            id: 4,
            name: 'Pizza Pepperoni',
            description: 'Salsa de tomate, mozzarella y pepperoni',
            category: 'Pizzas',
            price: 36000,
            image: 'assets/images/pizza2.svg',
            available: true
        },
        {
            id: 5,
            name: 'Perro Caliente',
            description: 'Salchicha, pan, cebolla, mayonesa y mostaza',
            category: 'Comidas rápidas',
            price: 15000,
            image: 'assets/images/hotdog.svg',
            available: true
        },
        {
            id: 6,
            name: 'Papas Fritas',
            description: 'Papas fritas crujientes con sal',
            category: 'Comidas rápidas',
            price: 8000,
            image: 'assets/images/fries.svg',
            available: true
        },
        {
            id: 7,
            name: 'Coca Cola',
            description: 'Bebida gaseosa 400 ml',
            category: 'Bebidas',
            price: 5000,
            image: 'assets/images/coke.svg',
            available: true
        },
        {
            id: 8,
            name: 'Jugo Natural',
            description: 'Jugo natural de naranja 500 ml',
            category: 'Bebidas',
            price: 7000,
            image: 'assets/images/juice.svg',
            available: true
        },
        {
            id: 9,
            name: 'Té Helado',
            description: 'Té helado con limón 500 ml',
            category: 'Bebidas',
            price: 6000,
            image: 'assets/images/icedtea.svg',
            available: true
        },
        {
            id: 10,
            name: 'Helado',
            description: 'Copa de helado con tres sabores',
            category: 'Postres',
            price: 10000,
            image: 'assets/images/icecream.svg',
            available: true
        },
        {
            id: 11,
            name: 'Torta de Chocolate',
            description: 'Porción de torta de chocolate con crema',
            category: 'Postres',
            price: 12000,
            image: 'assets/images/cake.svg',
            available: true
        },
        {
            id: 12,
            name: 'Nuggets de Pollo',
            description: '6 unidades de nuggets con papas fritas',
            category: 'Comidas rápidas',
            price: 18000,
            image: 'assets/images/nuggets.svg',
            available: true
        }
    ];
}

function getDemoTables() {
    return [
        { id: 1, number: 1, capacity: 2, status: 'Disponible', orderId: null },
        { id: 2, number: 2, capacity: 4, status: 'Disponible', orderId: null },
        { id: 3, number: 3, capacity: 4, status: 'Reservada', orderId: null },
        { id: 4, number: 4, capacity: 6, status: 'Disponible', orderId: null },
        { id: 5, number: 5, capacity: 2, status: 'Disponible', orderId: null },
        { id: 6, number: 6, capacity: 4, status: 'Ocupada', orderId: 5 },
        { id: 7, number: 7, capacity: 6, status: 'Disponible', orderId: null },
        { id: 8, number: 8, capacity: 8, status: 'Disponible', orderId: null }
    ];
}

function getDemoOrders() {
    const order3Date = dateOffset(0, 11, 20);
    const order4Date = dateOffset(0, 12, 5);
    const order5Date = dateOffset(0, 12, 40);
    const order6Date = dateOffset(0, 13, 10);
    const order1Date = dateOffset(-2, 19, 15);
    const order2Date = dateOffset(-1, 13, 30);

    return [
        {
            id: 1,
            code: 'PED-0001',
            date: formatDemoDate(order1Date),
            time: formatDemoTime(order1Date),
            type: 'En mesa',
            tableNumber: 2,
            items: [
                { productId: 1, productName: 'Hamburguesa Clásica', price: 25000, quantity: 2, subtotal: 50000 },
                { productId: 7, productName: 'Coca Cola', price: 5000, quantity: 2, subtotal: 10000 }
            ],
            total: 60000,
            observations: 'Sin cebolla en una hamburguesa.',
            status: 'Entregado',
            paid: true,
            paymentMethod: 'Tarjeta',
            saleId: 1,
            createdAt: order1Date.toISOString()
        },
        {
            id: 2,
            code: 'PED-0002',
            date: formatDemoDate(order2Date),
            time: formatDemoTime(order2Date),
            type: 'Para llevar',
            tableNumber: null,
            items: [
                { productId: 3, productName: 'Pizza Margarita', price: 32000, quantity: 1, subtotal: 32000 },
                { productId: 8, productName: 'Jugo Natural', price: 7000, quantity: 1, subtotal: 7000 }
            ],
            total: 39000,
            observations: '',
            status: 'Entregado',
            paid: true,
            paymentMethod: 'Efectivo',
            saleId: 2,
            createdAt: order2Date.toISOString()
        },
        {
            id: 3,
            code: 'PED-0003',
            date: formatDemoDate(order3Date),
            time: formatDemoTime(order3Date),
            type: 'Para llevar',
            tableNumber: null,
            items: [
                { productId: 2, productName: 'Hamburguesa Doble', price: 35000, quantity: 1, subtotal: 35000 },
                { productId: 6, productName: 'Papas Fritas', price: 8000, quantity: 2, subtotal: 16000 },
                { productId: 7, productName: 'Coca Cola', price: 5000, quantity: 2, subtotal: 10000 }
            ],
            total: 61000,
            observations: 'Empacar para llevar.',
            status: 'Entregado',
            paid: true,
            paymentMethod: 'Transferencia',
            saleId: 3,
            createdAt: order3Date.toISOString()
        },
        {
            id: 4,
            code: 'PED-0004',
            date: formatDemoDate(order4Date),
            time: formatDemoTime(order4Date),
            type: 'Para llevar',
            tableNumber: null,
            items: [
                { productId: 12, productName: 'Nuggets de Pollo', price: 18000, quantity: 1, subtotal: 18000 },
                { productId: 9, productName: 'Té Helado', price: 6000, quantity: 1, subtotal: 6000 }
            ],
            total: 24000,
            observations: '',
            status: 'En preparación',
            paid: false,
            createdAt: order4Date.toISOString()
        },
        {
            id: 5,
            code: 'PED-0005',
            date: formatDemoDate(order5Date),
            time: formatDemoTime(order5Date),
            type: 'En mesa',
            tableNumber: 6,
            items: [
                { productId: 4, productName: 'Pizza Pepperoni', price: 36000, quantity: 1, subtotal: 36000 },
                { productId: 11, productName: 'Torta de Chocolate', price: 12000, quantity: 1, subtotal: 12000 }
            ],
            total: 48000,
            observations: 'Sin servilletas adicionales.',
            status: 'Pendiente',
            paid: false,
            createdAt: order5Date.toISOString()
        },
        {
            id: 6,
            code: 'PED-0006',
            date: formatDemoDate(order6Date),
            time: formatDemoTime(order6Date),
            type: 'Para llevar',
            tableNumber: null,
            items: [
                { productId: 5, productName: 'Perro Caliente', price: 15000, quantity: 1, subtotal: 15000 },
                { productId: 10, productName: 'Helado', price: 10000, quantity: 1, subtotal: 10000 }
            ],
            total: 25000,
            observations: 'Sin mostaza.',
            status: 'Listo para entregar',
            paid: false,
            createdAt: order6Date.toISOString()
        }
    ];
}

function getDemoSales() {
    const sale1Date = dateOffset(-2, 20, 5);
    const sale2Date = dateOffset(-1, 14, 10);
    const sale3Date = dateOffset(0, 11, 55);

    return [
        {
            id: 1,
            code: 'VTA-0001',
            orderId: 1,
            orderCode: 'PED-0001',
            date: sale1Date.toISOString(),
            dateFormatted: formatDemoDate(sale1Date),
            time: formatDemoTime(sale1Date),
            total: 60000,
            paymentMethod: 'Tarjeta',
            amountReceived: 60000,
            change: 0,
            items: [
                { productId: 1, productName: 'Hamburguesa Clásica', price: 25000, quantity: 2, subtotal: 50000 },
                { productId: 7, productName: 'Coca Cola', price: 5000, quantity: 2, subtotal: 10000 }
            ],
            tableNumber: 2,
            type: 'En mesa'
        },
        {
            id: 2,
            code: 'VTA-0002',
            orderId: 2,
            orderCode: 'PED-0002',
            date: sale2Date.toISOString(),
            dateFormatted: formatDemoDate(sale2Date),
            time: formatDemoTime(sale2Date),
            total: 39000,
            paymentMethod: 'Efectivo',
            amountReceived: 50000,
            change: 11000,
            items: [
                { productId: 3, productName: 'Pizza Margarita', price: 32000, quantity: 1, subtotal: 32000 },
                { productId: 8, productName: 'Jugo Natural', price: 7000, quantity: 1, subtotal: 7000 }
            ],
            tableNumber: null,
            type: 'Para llevar'
        },
        {
            id: 3,
            code: 'VTA-0003',
            orderId: 3,
            orderCode: 'PED-0003',
            date: sale3Date.toISOString(),
            dateFormatted: formatDemoDate(sale3Date),
            time: formatDemoTime(sale3Date),
            total: 61000,
            paymentMethod: 'Transferencia',
            amountReceived: 61000,
            change: 0,
            items: [
                { productId: 2, productName: 'Hamburguesa Doble', price: 35000, quantity: 1, subtotal: 35000 },
                { productId: 6, productName: 'Papas Fritas', price: 8000, quantity: 2, subtotal: 16000 },
                { productId: 7, productName: 'Coca Cola', price: 5000, quantity: 2, subtotal: 10000 }
            ],
            tableNumber: null,
            type: 'Para llevar'
        }
    ];
}
