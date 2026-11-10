// FoodControl - Ventas y Pagos

let currentPaymentOrder = null;
let currentReceiptSale = null;

document.addEventListener('DOMContentLoaded', function () {
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

    loadSalesStats();
    loadPendingPayments();
    loadSalesHistory();
});

function loadSalesStats() {
    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];
    const today = new Date().toDateString();

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const todaySales = sales
        .filter(s => new Date(s.date).toDateString() === today)
        .reduce((sum, s) => sum + s.total, 0);

    document.getElementById('totalSales').textContent = formatMoney(totalSales);
    document.getElementById('todaySales').textContent = formatMoney(todaySales);
    document.getElementById('totalTransactions').textContent = sales.length;
}

// Pedidos elegibles para cobro: listos o entregados y todavía sin pagar
function loadPendingPayments() {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const container = document.getElementById('pendingPaymentList');
    container.innerHTML = '';

    const eligibleOrders = orders.filter(o =>
        (o.status === 'Listo para entregar' || o.status === 'Entregado') && !o.paid
    );

    if (eligibleOrders.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay pedidos pendientes de cobro. Los pedidos aparecen aquí cuando están listos para entregar o entregados.</p>';
        return;
    }

    eligibleOrders.forEach(order => {
        const item = document.createElement('div');
        item.className = 'payment-item';

        item.innerHTML = `
            <div class="payment-item-head">
                <div>
                    <div class="payment-code">${order.code}</div>
                    <div class="payment-meta">${order.date} ${order.time} · ${order.tableNumber ? 'Mesa ' + order.tableNumber : order.type}</div>
                    <div class="payment-meta">${order.items.reduce((sum, i) => sum + i.quantity, 0)} producto(s)</div>
                </div>
                <span class="badge ${getStatusClass(order.status)}">${order.status}</span>
            </div>
            <div class="payment-item-foot">
                <div class="payment-total">${formatMoney(order.total)}</div>
                <button class="btn" style="width: auto; padding: 0.45rem 0.9rem; font-size: 0.8rem;" onclick="openPaymentModal(${order.id})">Cobrar</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function openPaymentModal(orderId) {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order || order.paid) return;

    currentPaymentOrder = order;

    document.getElementById('paymentOrderInfo').innerHTML = `
        <p><strong>Código:</strong> ${order.code}</p>
        <p><strong>Modalidad:</strong> ${order.tableNumber ? 'Mesa ' + order.tableNumber : order.type}</p>
        <p><strong>Productos:</strong> ${order.items.reduce((sum, i) => sum + i.quantity, 0)} unidad(es)</p>
        <div class="payment-total-row">
            <span>Total a pagar:</span>
            <span style="color: var(--success);">${formatMoney(order.total)}</span>
        </div>
    `;

    document.getElementById('paymentMethod').value = 'Efectivo';
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentAmountError').style.display = 'none';
    document.getElementById('paymentAmountGroup').style.display = 'block';
    document.getElementById('changeGroup').style.display = 'none';
    document.getElementById('changeAmount').textContent = '$0';

    document.getElementById('paymentModal').classList.add('active');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
    currentPaymentOrder = null;
}

function handlePaymentMethodChange() {
    const method = document.getElementById('paymentMethod').value;
    const amountGroup = document.getElementById('paymentAmountGroup');
    const changeGroup = document.getElementById('changeGroup');

    if (method === 'Efectivo') {
        amountGroup.style.display = 'block';
    } else {
        amountGroup.style.display = 'none';
        changeGroup.style.display = 'none';
        document.getElementById('paymentAmountError').style.display = 'none';
    }
}

function updateChangePreview() {
    if (!currentPaymentOrder) return;

    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const changeGroup = document.getElementById('changeGroup');
    const changeAmount = document.getElementById('changeAmount');

    if (isNaN(amount)) {
        changeGroup.style.display = 'none';
        return;
    }

    const change = amount - currentPaymentOrder.total;
    changeGroup.style.display = 'block';
    changeAmount.textContent = formatMoney(change);
    changeAmount.style.color = change < 0 ? 'var(--danger)' : 'var(--success)';
}

// Registrar la venta, marcar el pedido como pagado y liberar la mesa
function processPayment() {
    if (!currentPaymentOrder) return;

    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const config = JSON.parse(localStorage.getItem('foodcontrol_config')) || { lastSaleId: 0 };

    const orderIndex = orders.findIndex(o => o.id === currentPaymentOrder.id);
    if (orderIndex === -1) return;

    if (orders[orderIndex].paid) {
        alert('Este pedido ya fue pagado.');
        closePaymentModal();
        return;
    }

    const method = document.getElementById('paymentMethod').value;
    const amountInput = document.getElementById('paymentAmount');
    const amount = parseFloat(amountInput.value);
    document.getElementById('paymentAmountError').style.display = 'none';

    if (method === 'Efectivo') {
        if (isNaN(amount) || amount <= 0) {
            document.getElementById('paymentAmountError').textContent = 'Ingrese un monto válido.';
            document.getElementById('paymentAmountError').style.display = 'block';
            return;
        }

        if (amount < currentPaymentOrder.total) {
            document.getElementById('paymentAmountError').textContent =
                `El monto debe ser al menos ${formatMoney(currentPaymentOrder.total)}.`;
            document.getElementById('paymentAmountError').style.display = 'block';
            return;
        }
    }

    const now = new Date();
    const change = method === 'Efectivo' ? amount - currentPaymentOrder.total : 0;
    const saleId = config.lastSaleId + 1;

    const newSale = {
        id: saleId,
        code: 'VTA-' + String(saleId).padStart(4, '0'),
        orderId: currentPaymentOrder.id,
        orderCode: currentPaymentOrder.code,
        date: now.toISOString(),
        dateFormatted: now.toLocaleDateString('es-CO'),
        time: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        total: currentPaymentOrder.total,
        paymentMethod: method,
        amountReceived: method === 'Efectivo' ? amount : currentPaymentOrder.total,
        change: change,
        items: currentPaymentOrder.items,
        tableNumber: currentPaymentOrder.tableNumber,
        type: currentPaymentOrder.type
    };

    sales.push(newSale);

    orders[orderIndex].paid = true;
    orders[orderIndex].status = 'Entregado';
    orders[orderIndex].paymentMethod = method;
    orders[orderIndex].saleId = newSale.id;

    if (currentPaymentOrder.tableNumber) {
        const tableIndex = tables.findIndex(t => t.number === currentPaymentOrder.tableNumber);
        if (tableIndex !== -1 && tables[tableIndex].orderId === currentPaymentOrder.id) {
            tables[tableIndex].status = 'Disponible';
            tables[tableIndex].orderId = null;
        }
    }

    config.lastSaleId = newSale.id;

    localStorage.setItem('foodcontrol_sales', JSON.stringify(sales));
    localStorage.setItem('foodcontrol_orders', JSON.stringify(orders));
    localStorage.setItem('foodcontrol_tables', JSON.stringify(tables));
    localStorage.setItem('foodcontrol_config', JSON.stringify(config));

    closePaymentModal();
    loadSalesStats();
    loadPendingPayments();
    loadSalesHistory();
    showReceipt(newSale);
}

function showReceipt(sale) {
    currentReceiptSale = sale;
    const content = document.getElementById('receiptContent');

    const itemsHtml = sale.items.map(item => `
        <tr>
            <td>${escapeHtml(item.productName)} × ${item.quantity}</td>
            <td>${formatMoney(item.subtotal)}</td>
        </tr>
    `).join('');

    content.innerHTML = `
        <div class="receipt-title">
            <h2>FoodControl</h2>
            <p>Restaurante académico · Comprobante simulado</p>
        </div>

        <div class="receipt-info">
            <p><strong>Comprobante:</strong> ${sale.code}</p>
            <p><strong>Pedido:</strong> ${sale.orderCode}</p>
            <p><strong>Fecha:</strong> ${sale.dateFormatted} ${sale.time}</p>
            <p><strong>Modalidad:</strong> ${sale.tableNumber ? 'Mesa ' + sale.tableNumber : sale.type}</p>
        </div>

        <table class="receipt-table">
            <thead>
                <tr><th>Producto</th><th>Subtotal</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>

        <div class="receipt-total">
            <span>Total:</span>
            <span>${formatMoney(sale.total)}</span>
        </div>

        <div class="receipt-info" style="margin-bottom: 0;">
            <p><strong>Método de pago:</strong> ${sale.paymentMethod}</p>
            ${sale.paymentMethod === 'Efectivo' ? `
                <p><strong>Recibido:</strong> ${formatMoney(sale.amountReceived)}</p>
                <p><strong>Cambio:</strong> ${formatMoney(sale.change)}</p>
            ` : ''}
        </div>

        <div class="receipt-footer">
            <p>¡Gracias por su visita!</p>
            <p>Documento sin validez fiscal.</p>
        </div>
    `;

    document.getElementById('receiptModal').classList.add('active');
}

function closeReceiptModal() {
    document.getElementById('receiptModal').classList.remove('active');
}

function printReceipt() {
    if (!currentReceiptSale) return;

    const content = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Comprobante ${currentReceiptSale.code} - FoodControl</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; max-width: 380px; margin: 0 auto; color: #222; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; }
                th, td { padding: 5px 0; text-align: left; }
                th:last-child, td:last-child { text-align: right; }
                h2 { color: #e85d2a; margin: 0; }
                .receipt-title { text-align: center; margin-bottom: 14px; }
                .receipt-title p, .receipt-footer { color: #666; font-size: 11px; text-align: center; }
                .receipt-info { font-size: 12px; }
                .receipt-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 6px; margin: 8px 0; }
                .receipt-footer { border-top: 1px dashed #999; margin-top: 14px; padding-top: 8px; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function loadSalesHistory() {
    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];
    const searchTerm = document.getElementById('searchSale').value.trim().toLowerCase();

    const filteredSales = sales.filter(sale =>
        sale.code.toLowerCase().includes(searchTerm) ||
        sale.orderCode.toLowerCase().includes(searchTerm)
    );

    filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';

    if (filteredSales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay ventas registradas.</td></tr>';
        return;
    }

    filteredSales.forEach(sale => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${sale.code}</strong><br><small style="color: var(--text-secondary);">${sale.orderCode}</small></td>
            <td>${sale.dateFormatted}<br><small style="color: var(--text-secondary);">${sale.time}</small></td>
            <td>${formatMoney(sale.total)}</td>
            <td>${sale.paymentMethod}</td>
            <td><button class="action-btn" onclick="viewReceipt(${sale.id})">Ver</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function viewReceipt(saleId) {
    const sales = JSON.parse(localStorage.getItem('foodcontrol_sales')) || [];
    const sale = sales.find(s => s.id === saleId);
    if (sale) showReceipt(sale);
}

function filterSales() {
    loadSalesHistory();
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
