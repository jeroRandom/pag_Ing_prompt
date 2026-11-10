// FoodControl - Menú y Productos

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

    loadProducts();
});

// Cargar productos aplicando búsqueda y filtros
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    const searchTerm = document.getElementById('searchProduct').value.trim().toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || String(product.available) === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p class="empty-state" style="grid-column: 1/-1;">No se encontraron productos con esos filtros.</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        const imagePath = product.image ? '../' + product.image : '../assets/images/placeholder.svg';

        card.innerHTML = `
            <div class="product-image">
                <img src="${escapeHtml(imagePath)}" alt="${escapeHtml(product.name)}"
                     onerror="this.onerror=null;this.src='../assets/images/placeholder.svg';">
            </div>
            <div class="product-info">
                <div class="product-category">${escapeHtml(product.category)}</div>
                <div class="product-name">${escapeHtml(product.name)}</div>
                <div class="product-desc">${escapeHtml(product.description)}</div>
                <div class="product-price">${formatMoney(product.price)}</div>
                <div class="product-footer">
                    <span class="product-status ${product.available ? 'status-active' : 'status-inactive'}">
                        ${product.available ? 'Disponible' : 'No disponible'}
                    </span>
                    <div class="product-actions">
                        <button class="action-btn" onclick="toggleProductAvailability(${product.id})">
                            ${product.available ? 'Desactivar' : 'Activar'}
                        </button>
                        <button class="action-btn edit" onclick="editProduct(${product.id})">Editar</button>
                        <button class="action-btn delete" onclick="deleteProduct(${product.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterProducts() {
    loadProducts();
}

function openProductModal() {
    document.getElementById('modalTitle').textContent = 'Agregar producto';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productAvailable').checked = true;
    document.querySelectorAll('#productModal .error-message').forEach(el => el.style.display = 'none');
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Editar producto';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productAvailable').checked = product.available;

    document.querySelectorAll('#productModal .error-message').forEach(el => el.style.display = 'none');
    document.getElementById('productModal').classList.add('active');
}

// Guardar producto (crear o editar)
function saveProduct() {
    document.querySelectorAll('#productModal .error-message').forEach(el => el.style.display = 'none');

    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const image = document.getElementById('productImage').value.trim();
    const available = document.getElementById('productAvailable').checked;

    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    let isValid = true;

    if (name === '') {
        showFieldError('productNameError', 'El nombre es requerido');
        isValid = false;
    } else if (name.length < 3) {
        showFieldError('productNameError', 'El nombre debe tener al menos 3 caracteres');
        isValid = false;
    } else {
        const duplicate = products.find(p =>
            p.name.toLowerCase() === name.toLowerCase() && String(p.id) !== String(id)
        );
        if (duplicate) {
            showFieldError('productNameError', 'Ya existe un producto con este nombre');
            isValid = false;
        }
    }

    if (description === '') {
        showFieldError('productDescriptionError', 'La descripción es requerida');
        isValid = false;
    }

    if (category === '') {
        showFieldError('productCategoryError', 'La categoría es requerida');
        isValid = false;
    }

    if (isNaN(price) || price <= 0) {
        showFieldError('productPriceError', 'El precio debe ser un número mayor a 0');
        isValid = false;
    }

    if (!isValid) return;

    const config = JSON.parse(localStorage.getItem('foodcontrol_config')) || { lastProductId: 12 };

    if (id === '') {
        const newProduct = {
            id: config.lastProductId + 1,
            name: name,
            description: description,
            category: category,
            price: price,
            image: image || 'assets/images/placeholder.svg',
            available: available
        };
        products.push(newProduct);
        config.lastProductId = newProduct.id;
        localStorage.setItem('foodcontrol_config', JSON.stringify(config));
    } else {
        const index = products.findIndex(p => String(p.id) === String(id));
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name: name,
                description: description,
                category: category,
                price: price,
                image: image || 'assets/images/placeholder.svg',
                available: available
            };
        }
    }

    localStorage.setItem('foodcontrol_products', JSON.stringify(products));
    closeProductModal();
    loadProducts();
}

function showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.style.display = 'block';
}

// Activar o desactivar un producto sin abrir el formulario
function toggleProductAvailability(id) {
    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return;

    products[index].available = !products[index].available;
    localStorage.setItem('foodcontrol_products', JSON.stringify(products));
    loadProducts();
}

function deleteProduct(id) {
    const products = JSON.parse(localStorage.getItem('foodcontrol_products')) || [];
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (!confirm(`¿Eliminar el producto "${product.name}"? Esta acción no se puede deshacer.`)) {
        return;
    }

    localStorage.setItem('foodcontrol_products', JSON.stringify(products.filter(p => p.id !== id)));
    loadProducts();
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
