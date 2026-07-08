/* ============================================================
   STATE
   ============================================================ */
let menuItems = JSON.parse(localStorage.getItem('kshf_menu')) || [];
let currentOrder = {};
let currentCategory = 'All';

/* ============================================================
   UI TOGGLES (sidebar, dark mode)
   ============================================================ */
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('app-container').classList.toggle('sidebar-collapsed');
}

function toggleDarkMode() {
    const isDark = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('dark_mode', isDark);
    updateDarkModeButton(isDark);
}

function updateDarkModeButton(isDark) {
    const btn = document.getElementById('dark-mode-toggle');
    btn.setAttribute('aria-pressed', isDark);
    btn.title = isDark ? 'Light Mode' : 'Dark Mode';
    btn.querySelector('.btn-text').textContent = isDark ? 'Light Mode' : 'Dark Mode';
}

/* ============================================================
   MENU GRID & CATEGORY TABS
   ============================================================ */
function initSystem(category = 'All') {
    currentCategory = category;
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = '';
    const filtered = category === 'All' ? menuItems : menuItems.filter(i => i.category === category);

    if (!filtered.length) {
        grid.innerHTML = '<div class="empty-state">No items available in this category yet.</div>';
    } else {
        filtered.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'menu-btn';
            btn.onclick = () => addToOrder(item.id);
            btn.innerHTML = `<span>${item.name}</span><span class="price">RM ${item.price.toFixed(2)}</span>`;
            grid.appendChild(btn);
        });
    }

    renderTabs();
}

function renderTabs() {
    const tabContainer = document.getElementById('category-tabs');
    const categories = ['All', ...new Set(menuItems.map(i => i.category))];
    tabContainer.innerHTML = categories.map(cat =>
        `<button class="${cat === currentCategory ? 'active' : ''}" onclick="initSystem('${cat}')">${cat}</button>`
    ).join('');
}

/* ============================================================
   ADD MENU ITEM (admin sidebar)
   ============================================================ */
function isSidebarCollapsed() {
    return document.getElementById('sidebar').classList.contains('collapsed');
}

function handleAddMenuItem() {
    if (isSidebarCollapsed()) {
        openAddItemModal();
    } else {
        addNewMenuItem();
    }
}

function addNewMenuItemFromValues(name, cat, price) {
    if (!name || isNaN(price)) return false;

    menuItems.push({ id: 'item_' + Date.now(), name, category: cat, price });
    saveMenuItems();
    initSystem(currentCategory);
    return true;
}

function addNewMenuItem() {
    const name = document.getElementById('new-item-name').value.trim();
    const cat = document.getElementById('new-item-cat').value.trim() || 'General';
    const price = parseFloat(document.getElementById('new-item-price').value);
    if (!addNewMenuItemFromValues(name, cat, price)) return;

    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-cat').value = '';
    document.getElementById('new-item-price').value = '';
}

function openAddItemModal() {
    document.getElementById('add-item-modal').style.display = 'flex';
    document.getElementById('modal-item-name').focus();
}

function closeAddItemModal() {
    document.getElementById('add-item-modal').style.display = 'none';
    document.getElementById('modal-item-name').value = '';
    document.getElementById('modal-item-cat').value = '';
    document.getElementById('modal-item-price').value = '';
}

function closeAddItemOnBackdrop(event) {
    if (event.target.id === 'add-item-modal') closeAddItemModal();
}

function saveNewItemFromModal(event) {
    event.preventDefault();
    const name = document.getElementById('modal-item-name').value.trim();
    const cat = document.getElementById('modal-item-cat').value.trim() || 'General';
    const price = parseFloat(document.getElementById('modal-item-price').value);
    if (!addNewMenuItemFromValues(name, cat, price)) return;

    closeAddItemModal();
}

function saveMenuItems() {
    localStorage.setItem('kshf_menu', JSON.stringify(menuItems));
}

/* ============================================================
   EDIT MENU (modal)
   ============================================================ */
function openEditMenu() {
    document.getElementById('edit-menu-modal').style.display = 'flex';
    renderEditMenuList();
}

function closeEditMenu() {
    document.getElementById('edit-menu-modal').style.display = 'none';
}

function closeEditMenuOnBackdrop(event) {
    if (event.target.id === 'edit-menu-modal') closeEditMenu();
}

function renderEditMenuList() {
    const list = document.getElementById('edit-menu-list');

    if (!menuItems.length) {
        list.innerHTML = '<p class="edit-empty">No menu items yet. Add one from the sidebar.</p>';
        return;
    }

    list.innerHTML = menuItems.map(item => `
        <div class="edit-menu-row" data-id="${item.id}">
            <input type="text" class="edit-name" value="${item.name.replace(/"/g, '&quot;')}" placeholder="Item Name">
            <input type="text" class="edit-cat" value="${item.category.replace(/"/g, '&quot;')}" placeholder="Category">
            <input type="number" class="edit-price" value="${item.price}" placeholder="Price" step="0.01" min="0">
            <div class="edit-actions">
                <button type="button" class="btn-save-item" onclick="saveEditItem('${item.id}')">Save</button>
                <button type="button" class="btn-delete-item" onclick="deleteMenuItem('${item.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function saveEditItem(id) {
    const row = document.querySelector(`.edit-menu-row[data-id="${id}"]`);
    const name = row.querySelector('.edit-name').value.trim();
    const category = row.querySelector('.edit-cat').value.trim() || 'General';
    const price = parseFloat(row.querySelector('.edit-price').value);
    if (!name || isNaN(price)) return;

    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    item.name = name;
    item.category = category;
    item.price = price;
    saveMenuItems();

    if (currentOrder[id]) {
        currentOrder[id] = { ...currentOrder[id], name, category, price };
        updateReceipt();
    }

    initSystem(currentCategory);
    renderEditMenuList();
}

function deleteMenuItem(id) {
    if (!confirm('Delete this menu item?')) return;

    menuItems = menuItems.filter(i => i.id !== id);
    delete currentOrder[id];
    saveMenuItems();
    initSystem(currentCategory);
    updateReceipt();
    renderEditMenuList();
}

/* ============================================================
   ORDER / RECEIPT
   ============================================================ */
function addToOrder(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    currentOrder[id] = currentOrder[id] ? { ...currentOrder[id], qty: currentOrder[id].qty + 1 } : { ...item, qty: 1 };
    updateReceipt();
}

function updateReceipt() {
    const list = document.getElementById('receipt-items-list');
    let total = 0;

    if (!Object.keys(currentOrder).length) {
        list.innerHTML = '<div class="receipt-item empty">No items added yet.</div>';
    } else {
        list.innerHTML = Object.values(currentOrder).map(i => {
            total += i.price * i.qty;
            return `<div class="receipt-item"><span>${i.name} ×${i.qty}</span><span>RM ${(i.price * i.qty).toFixed(2)}</span></div>`;
        }).join('');
    }

    document.getElementById('grand-total').innerText = `RM ${total.toFixed(2)}`;
}

function clearOrder() {
    currentOrder = {};
    updateReceipt();
}

/* ============================================================
   STARTUP
   ============================================================ */
window.onload = () => {
    const isDark = localStorage.getItem('dark_mode') === 'true';
    document.body.classList.toggle('dark', isDark);
    updateDarkModeButton(isDark);
    initSystem();
    updateReceipt();
};
