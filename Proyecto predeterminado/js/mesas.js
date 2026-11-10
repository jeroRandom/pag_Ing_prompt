// FoodControl - Mesas

let currentTableId = null;

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

    loadTables();
});

function loadTables() {
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const grid = document.getElementById('tablesGrid');
    grid.innerHTML = '';

    tables.forEach(table => {
        const card = document.createElement('div');
        card.className = 'table-card';
        card.dataset.status = table.status;
        card.onclick = () => viewTableDetails(table.id);

        card.innerHTML = `
            <div class="table-number">Mesa ${table.number}</div>
            <div class="table-capacity">${table.capacity} personas</div>
            <span class="table-status ${getTableStatusClass(table.status)}">${table.status}</span>
            ${table.orderId ? '<div class="table-order-hint">Pedido asociado</div>' : ''}
        `;
        grid.appendChild(card);
    });
}

function viewTableDetails(tableId) {
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    currentTableId = tableId;

    document.getElementById('tableModalTitle').textContent = `Mesa ${table.number}`;
    document.getElementById('tableInfo').innerHTML = `
        <div class="receipt-info">
            <p><strong>Número:</strong> ${table.number}</p>
            <p><strong>Capacidad:</strong> ${table.capacity} personas</p>
            <p><strong>Estado actual:</strong> <span class="table-status ${getTableStatusClass(table.status)}">${table.status}</span></p>
        </div>
    `;

    document.getElementById('tableStatusChange').value = table.status;

    const orderInfoDiv = document.getElementById('tableOrderInfo');
    const orderContent = document.getElementById('tableOrderContent');
    const order = table.orderId ? orders.find(o => o.id === table.orderId) : null;

    if (order) {
        orderContent.innerHTML = `
            <p><strong>Código:</strong> ${order.code}</p>
            <p><strong>Estado:</strong> <span class="badge ${getOrderStatusClass(order.status)}">${order.status}</span></p>
            <p><strong>Total:</strong> ${formatMoney(order.total)}</p>
            <p><strong>Productos:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)} unidad(es)</p>
        `;
        orderInfoDiv.style.display = 'block';
    } else {
        orderContent.innerHTML = '';
        orderInfoDiv.style.display = 'none';
    }

    document.getElementById('tableModal').classList.add('active');
}

function closeTableModal() {
    document.getElementById('tableModal').classList.remove('active');
}

// Actualizar estado respetando la relación con los pedidos
function updateTableStatus() {
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const tableIndex = tables.findIndex(t => t.id === currentTableId);
    if (tableIndex === -1) return;

    const newStatus = document.getElementById('tableStatusChange').value;
    const table = tables[tableIndex];
    const order = table.orderId ? orders.find(o => o.id === table.orderId) : null;
    const hasActiveOrder = order && order.status !== 'Entregado' && order.status !== 'Cancelado';

    if (hasActiveOrder && newStatus !== 'Ocupada') {
        alert('Esta mesa tiene un pedido activo. Primero debe entregarse o cancelarse el pedido.');
        document.getElementById('tableStatusChange').value = table.status;
        return;
    }

    if (newStatus === 'Disponible' && order && (order.status === 'Entregado' || order.status === 'Cancelado')) {
        table.orderId = null;
    }

    tables[tableIndex].status = newStatus;
    localStorage.setItem('foodcontrol_tables', JSON.stringify(tables));

    closeTableModal();
    loadTables();
}

function getTableStatusClass(status) {
    if (status === 'Disponible') return 'badge-disponible';
    if (status === 'Ocupada') return 'badge-ocupada';
    if (status === 'Reservada') return 'badge-reservada';
    return '';
}

function getOrderStatusClass(status) {
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

function logout() {
    localStorage.removeItem('foodcontrol_currentUser');
    window.location.href = '../index.html';
}
