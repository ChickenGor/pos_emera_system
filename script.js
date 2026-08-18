/* ============================================================
   STATE
   ============================================================ */
let menuItems = JSON.parse(localStorage.getItem('menu')) || [];
let currentOrder = {};
let currentCategory = 'All';

/* ============================================================
   UI TOGGLES (sidebar, dark mode)
   ============================================================ */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const container = document.getElementById('app-container');
    const isMobile = window.innerWidth <= 980;

    if (isMobile) {
        // Toggle the mobile app drawer slide-in state and dark backdrop overlay
        sidebar.classList.toggle('mobile-open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    } else {
        // Standard desktop/wide screen sidebar collapse toggle
        sidebar.classList.toggle('collapsed');
        container.classList.toggle('sidebar-collapsed');
    }
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
   ADD MENU ITEM MODAL HANDLING
   ============================================================ */
function handleAddMenuItem() {
    openAddItemModal();
}

function openAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (modal) {
        modal.style.display = 'flex';
        const nameInput = document.getElementById('modal-item-name');
        if (nameInput) nameInput.focus();
    }
}

function closeAddItemModal() {
    const modal = document.getElementById('add-item-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('modal-item-name').value = '';
        document.getElementById('modal-item-cat').value = '';
        document.getElementById('modal-item-price').value = '';
    }
}

function closeAddItemOnBackdrop(event) {
    if (event.target.id === 'add-item-modal') {
        closeAddItemModal();
    }
}

function addNewMenuItemFromValues(name, cat, price) {
    if (!name || isNaN(price)) return false;

    menuItems.push({ id: 'item_' + Date.now(), name, category: cat, price });
    saveMenuItems();
    initSystem(currentCategory);
    return true;
}

function saveNewItemFromModal(event) {
    event.preventDefault();
    const name = document.getElementById('modal-item-name').value.trim();
    const cat = document.getElementById('modal-item-cat').value.trim() || 'General';
    const price = parseFloat(document.getElementById('modal-item-price').value);

    if (!addNewMenuItemFromValues(name, cat, price)) return;

    closeAddItemModal();
}

/* ============================================================
   SAVE MENU ITEMS TO LOCAL STORAGE
   ============================================================ */
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

    // Save to localStorage for persistence
    localStorage.setItem('current_order', JSON.stringify(currentOrder));

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
    localStorage.removeItem('current_order');
    updateReceipt();
}

/*  =============================================================
    Export menu items as JSON
    =============================================================*/
function exportMenuJSON() {
    // Prompt the user for a filename (defaulting to 'menu_backup')
    let fileName = prompt("Enter file name for your menu backup:", "menu_backup");

    // If user cancelled or left it blank, abort or use default
    if (fileName === null) return;
    fileName = fileName.trim() || "menu_backup";

    // Ensure it ends with .json
    if (!fileName.toLowerCase().endsWith('.json')) {
        fileName += '.json';
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(menuItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

/*  =============================================================
    Import menu items from JSON
    =============================================================*/

function importMenuJSON(event) {
    const fileReader = new FileReader();
    if (event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = (e) => {
            try {
                const importedItems = JSON.parse(e.target.result);
                if (Array.isArray(importedItems)) {
                    menuItems = importedItems;
                    saveMenuItems();
                    initSystem(currentCategory);
                    alert('Menu successfully imported!');
                } else {
                    alert('Invalid menu file format.');
                }
            } catch (error) {
                alert('Error parsing JSON file.');
            }
        };
    }
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
}
