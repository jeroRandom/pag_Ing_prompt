// FoodControl - Dashboard

document.addEventListener('DOMContentLoaded', function () {
    // Verificar autenticación
    const currentUser = JSON.parse(localStorage.getItem('foodcontrol_currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;
    document.getElementById('headerUserName').textContent = currentUser.name;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-CO', options);

    loadDashboardStats();
    loadTopProducts();
    loadRecentOrders();
    createSalesChart();
});

// Cargar las tarjetas de estadísticas
function loadDashboardStats() {
    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];

    const today = new Date().toDateString();

    const salesToday = sales
        .filter(s => new Date(s.date).toDateString() === today)
        .reduce((sum, s) => sum + s.total, 0);
    document.getElementById('salesToday').textContent = formatMoney(salesToday);

    const ordersToday = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today).length;
    document.getElementById('ordersCount').textContent = ordersToday;

    const pendingOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'En preparación').length;
    document.getElementById('pendingOrders').textContent = pendingOrders;

    const occupiedTables = tables.filter(t => t.status === 'Ocupada').length;
    document.getElementById('occupiedTables').textContent = occupiedTables + ' / ' + tables.length;

    const availableProducts = products.filter(p => p.available).length;
    document.getElementById('availableProducts').textContent = availableProducts;
}

// Productos más vendidos según las ventas registradas
function loadTopProducts() {
    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];
    const productSales = {};

    sales.forEach(sale => {
        (sale.items || []).forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = { quantity: 0, name: item.productName };
            }
            productSales[item.productId].quantity += item.quantity;
        });
    });

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    const tbody = document.getElementById('topProductsTable');
    tbody.innerHTML = '';

    if (topProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="empty-state">No hay ventas registradas</td></tr>';
        return;
    }

    topProducts.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(product.name)}</td>
            <td><strong>${product.quantity}</strong></td>
        `;
        tbody.appendChild(tr);
    });
}

// Pedidos recientes
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const recentOrders = orders
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);

    const tbody = document.getElementById('recentOrdersTable');
    tbody.innerHTML = '';

    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay pedidos registrados</td></tr>';
        return;
    }

    recentOrders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${order.code}</strong></td>
            <td>${order.date} ${order.time}</td>
            <td>${order.tableNumber ? 'Mesa ' + order.tableNumber : order.type}</td>
            <td>${formatMoney(order.total)}</td>
            <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusClass(status) {
    const classes = {
        'Pendiente': 'badge-pendiente',
        'En preparación': 'badge-preparacion',
        'Listo para entregar': 'badge-listo',
        'Entregado': 'badge-entregado',
        'Cancelado': 'badge-cancelado'
    };
    return classes[status] || '';
}

// Gráfica de ventas de los últimos 7 días
function createSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        canvas.outerHTML = '<p class="empty-state">No se pudo cargar la librería de gráficas (Chart.js). Verifica la carpeta vendor.</p>';
        return;
    }

    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
            date: date.toDateString(),
            label: date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
            total: 0
        });
    }

    sales.forEach(sale => {
        const saleDate = new Date(sale.date).toDateString();
        const day = days.find(d => d.date === saleDate);
        if (day) day.total += sale.total;
    });

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days.map(d => d.label),
            datasets: [{
                label: 'Ventas (COP)',
                data: days.map(d => d.total),
                backgroundColor: 'rgba(255, 107, 53, 0.72)',
                borderColor: '#ff6b35',
                borderWidth: 1,
                borderRadius: 5,
                maxBarThickness: 44
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return formatMoney(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b0b0b0',
                        callback: function (value) {
                            return '$' + Number(value).toLocaleString('es-CO');
                        }
                    },
                    grid: { color: '#333333' }
                },
                x: {
                    ticks: { color: '#b0b0b0' },
                    grid: { display: false }
                }
            }
        }
    });
}

function formatMoney(value) {
    return '$' + Number(value || 0).toLocaleString('es-CO');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function logout() {
    localStorage.removeItem('foodcontrol_currentUser');
    window.location.href = '../index.html';
}
