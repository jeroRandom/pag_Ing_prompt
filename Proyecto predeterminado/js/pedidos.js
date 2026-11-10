// FoodControl - Pedidos

let cart = [];
let currentOrderId = null;

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

    loadOrders();
    loadMenuProducts();
    loadAvailableTables();
});

// Cargar pedidos con búsqueda y filtro por estado
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const searchTerm = document.getElementById('searchOrder').value.trim().toLowerCase();
    const statusFilter = document.getElementById('filterOrderStatus').value;

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.code.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';

    if (filteredOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No se encontraron pedidos.</td></tr>';
        return;
    }

    filteredOrders.forEach(order => {
        const tr = document.createElement('tr');
        const productsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const canPrepare = order.status === 'Pendiente';

        tr.innerHTML = `
            <td><strong>${order.code}</strong>${order.paid ? ' <span class="badge badge-entregado" style="font-size:0.65rem;">Pagado</span>' : ''}</td>
            <td>${order.date}<br><small style="color: var(--text-secondary);">${order.time}</small></td>
            <td>${order.tableNumber ? 'Mesa ' + order.tableNumber : order.type}</td>
            <td>${productsCount} producto(s)</td>
            <td>${formatMoney(order.total)}</td>
            <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
            <td>
                <button class="action-btn" onclick="viewOrderDetails(${order.id})">Ver detalle</button>
                ${canPrepare ? `<button class="action-btn edit" onclick="changeOrderStatusQuick(${order.id}, 'En preparación')">Preparar</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterOrders() {
    loadOrders();
}

// Lista de productos disponibles para agregar al carrito
function loadMenuProducts() {
    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    const availableProducts = products.filter(p => p.available);

    const searchTerm = document.getElementById('searchMenuProduct').value.trim().toLowerCase();
    const categoryFilter = document.getElementById('filterMenuCategory').value;

    const filteredProducts = availableProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const container = document.getElementById('menuProductsList');
    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay productos disponibles con esos filtros.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'menu-product-item';
        item.onclick = () => addToCart(product);

        item.innerHTML = `
            <div style="flex: 1; min-width: 0;">
                <div class="menu-product-name">${escapeHtml(product.name)}</div>
                <div class="menu-product-price">${formatMoney(product.price)}</div>
            </div>
            <span class="menu-product-add" data-icon="plus"></span>
        `;
        container.appendChild(item);
    });

    if (typeof renderFoodControlIcons === 'function') renderFoodControlIcons();
}

function filterMenuProducts() {
    loadMenuProducts();
}

function addToCart(product) {
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1
        });
    }

    updateCartDisplay();
}

function updateCartDisplay() {
    const container = document.getElementById('cartItems');
    const totalSpan = document.getElementById('cartTotal');
    const countSpan = document.getElementById('cartCount');

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-state">El carrito está vacío</p>';
        totalSpan.textContent = '$0';
        countSpan.textContent = '0 artículos';
        return;
    }

    let total = 0;
    let units = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        units += item.quantity;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.productName)}</div>
                <div class="cart-item-meta">${formatMoney(item.price)} x ${item.quantity} = ${formatMoney(item.price * item.quantity)}</div>
            </div>
            <div class="cart-controls">
                <button class="qty-btn" aria-label="Disminuir cantidad" onclick="decreaseQuantity(${index})">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" aria-label="Aumentar cantidad" onclick="increaseQuantity(${index})">+</button>
                <button class="qty-btn" aria-label="Eliminar producto" onclick="removeFromCart(${index})">&times;</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    totalSpan.textContent = formatMoney(total);
    countSpan.textContent = units + (units === 1 ? ' artículo' : ' artículos');
}

function increaseQuantity(index) {
    cart[index].quantity += 1;
    updateCartDisplay();
}

function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// Solo mostrar mesas disponibles al crear un pedido
function loadAvailableTables() {
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const select = document.getElementById('orderTable');
    select.innerHTML = '<option value="">Seleccione una mesa disponible</option>';

    const availableTables = tables.filter(t => t.status === 'Disponible');

    if (availableTables.length === 0) {
        select.innerHTML = '<option value="">No hay mesas disponibles</option>';
        return;
    }

    availableTables.forEach(table => {
        const option = document.createElement('option');
        option.value = table.number;
        option.textContent = `Mesa ${table.number} · ${table.capacity} personas`;
        select.appendChild(option);
    });
}

function toggleTableSelection() {
    const orderType = document.getElementById('orderType').value;
    const tableGroup = document.getElementById('tableSelectionGroup');

    if (orderType === 'En mesa') {
        tableGroup.style.display = 'block';
        loadAvailableTables();
    } else {
        tableGroup.style.display = 'none';
        document.getElementById('orderTable').value = '';
    }
}

function openNewOrderModal() {
    cart = [];
    updateCartDisplay();
    document.getElementById('newOrderModal').classList.add('active');
    document.getElementById('orderType').value = 'Para llevar';
    document.getElementById('orderObservations').value = '';
    document.getElementById('tableSelectionGroup').style.display = 'none';
    document.getElementById('searchMenuProduct').value = '';
    document.getElementById('filterMenuCategory').value = 'all';
    loadMenuProducts();
}

function closeNewOrderModal() {
    document.getElementById('newOrderModal').classList.remove('active');
}

// Crear pedido y sincronizar la mesa seleccionada
function createOrder() {
    if (cart.length === 0) {
        alert('Debe agregar al menos un producto al carrito.');
        return;
    }

    const orderType = document.getElementById('orderType').value;
    const tableNumber = document.getElementById('orderTable').value;
    const observations = document.getElementById('orderObservations').value.trim();

    if (orderType === 'En mesa' && !tableNumber) {
        alert('Debe seleccionar una mesa disponible.');
        return;
    }

    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];

    // Verificar de nuevo que la mesa siga disponible
    if (orderType === 'En mesa') {
        const selectedTable = tables.find(t => t.number === parseInt(tableNumber));
        if (!selectedTable || selectedTable.status !== 'Disponible') {
            alert('La mesa seleccionada ya no está disponible. Elija otra.');
            loadAvailableTables();
            return;
        }
    }

    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const config = JSON.parse(localStorage.getItem('foodcontrol_config')) || { lastOrderId: 0 };

    const now = new Date();
    const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = config.lastOrderId + 1;

    const newOrder = {
        id: orderId,
        code: 'PED-' + String(orderId).padStart(4, '0'),
        date: now.toLocaleDateString('es-CO'),
        time: now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        type: orderType,
        tableNumber: orderType === 'En mesa' ? parseInt(tableNumber) : null,
        items: cart.map(item => ({
            productId: item.productId,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        total: orderTotal,
        observations: observations,
        status: 'Pendiente',
        paid: false,
        createdAt: now.toISOString()
    };

    orders.push(newOrder);
    config.lastOrderId = newOrder.id;

    if (orderType === 'En mesa') {
        const tableIndex = tables.findIndex(t => t.number === parseInt(tableNumber));
        if (tableIndex !== -1) {
            tables[tableIndex].status = 'Ocupada';
            tables[tableIndex].orderId = newOrder.id;
            localStorage.setItem('foodcontrol_tables', JSON.stringify(tables));
        }
    }

    localStorage.setItem('foodcontrol_orders', JSON.stringify(orders));
    localStorage.setItem('foodcontrol_config', JSON.stringify(config));

    alert('Pedido creado correctamente: ' + newOrder.code);
    closeNewOrderModal();
    cart = [];
    updateCartDisplay();
    loadOrders();
    loadAvailableTables();
}

// Ver el detalle completo del pedido
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    currentOrderId = orderId;

    const itemsHtml = order.items.map(item => `
        <div class="receipt-line">
            <span>${escapeHtml(item.productName)} × ${item.quantity}</span>
            <span>${formatMoney(item.subtotal)}</span>
        </div>
    `).join('');

    document.getElementById('orderDetailsContent').innerHTML = `
        <div class="receipt-info">
            <p><strong>Código:</strong> ${order.code}</p>
            <p><strong>Fecha y hora:</strong> ${order.date} ${order.time}</p>
            <p><strong>Modalidad:</strong> ${order.type}${order.tableNumber ? ' · Mesa ' + order.tableNumber : ''}</p>
            <p><strong>Estado:</strong> <span class="badge ${getStatusClass(order.status)}">${order.status}</span></p>
            ${order.observations ? `<p><strong>Observaciones:</strong> ${escapeHtml(order.observations)}</p>` : ''}
        </div>
        <h4 style="font-size: 0.85rem; margin-bottom: 0.4rem;">Productos</h4>
        <div style="border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 0.5rem 0;">
            ${itemsHtml}
            <div class="receipt-total" style="margin-top: 0.4rem; border-top: none; padding-top: 0.4rem;">
                <span>Total:</span>
                <span>${formatMoney(order.total)}</span>
            </div>
        </div>
    `;

    const statusGroup = document.getElementById('statusChangeGroup');
    const paidNote = document.getElementById('paidNote');
    const updateBtn = document.getElementById('updateStatusBtn');
    const locked = order.paid || order.status === 'Cancelado';

    document.getElementById('orderStatusChange').value = order.status;
    document.getElementById('orderStatusChange').disabled = locked;
    statusGroup.style.display = locked ? 'none' : 'block';
    updateBtn.style.display = locked ? 'none' : 'inline-flex';

    if (order.paid) {
        paidNote.style.display = 'flex';
        paidNote.querySelector('span:last-child').textContent = 'Este pedido ya fue pagado. Para proteger la venta registrada, su estado no puede modificarse desde aquí.';
    } else if (order.status === 'Cancelado') {
        paidNote.style.display = 'flex';
        paidNote.querySelector('span:last-child').textContent = 'Este pedido está cancelado. Los pedidos cancelados no se contabilizan como ventas.';
    } else {
        paidNote.style.display = 'none';
    }

    if (typeof renderFoodControlIcons === 'function') renderFoodControlIcons();
    document.getElementById('orderDetailsModal').classList.add('active');
}

function closeOrderDetailsModal() {
    document.getElementById('orderDetailsModal').classList.remove('active');
}

// Cambiar estado y liberar la mesa cuando el pedido termina o se cancela
function updateOrderStatus() {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const tables = JSON.parse(localStorage.getItem('foodcontrol_tables')) || [];
    const orderIndex = orders.findIndex(o => o.id === currentOrderId);
    if (orderIndex === -1) return;

    const order = orders[orderIndex];
    if (order.paid) {
        alert('No se puede modificar un pedido que ya fue pagado.');
        return;
    }

    const newStatus = document.getElementById('orderStatusChange').value;
    const oldStatus = order.status;

    if (newStatus === oldStatus) {
        closeOrderDetailsModal();
        return;
    }

    orders[orderIndex].status = newStatus;

    const finished = newStatus === 'Entregado' || newStatus === 'Cancelado';
    if (finished && order.tableNumber) {
        const tableIndex = tables.findIndex(t => t.number === order.tableNumber);
        if (tableIndex !== -1 && tables[tableIndex].orderId === order.id) {
            tables[tableIndex].status = 'Disponible';
            tables[tableIndex].orderId = null;
            localStorage.setItem('foodcontrol_tables', JSON.stringify(tables));
        }
    }

    localStorage.setItem('foodcontrol_orders', JSON.stringify(orders));
    closeOrderDetailsModal();
    loadOrders();
    alert('Estado actualizado correctamente.');
}

// Acción rápida: pasar de Pendiente a En preparación
function changeOrderStatusQuick(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('foodcontrol_orders')) || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1 || orders[index].paid) return;

    orders[index].status = status;
    localStorage.setItem('foodcontrol_orders', JSON.stringify(orders));
    loadOrders();
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
