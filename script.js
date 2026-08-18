
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
    localStorage.setItem('emera_menu', JSON.stringify(menuItems));
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
   CHECKOUT & PAYMENT MODAL LOGIC
   ============================================================ */
let selectedPaymentType = 'Cash';
let cashTenderedInput = '';

function openCheckoutModal() {
    if (!Object.keys(currentOrder).length) {
        alert('Cannot checkout an empty order.');
        return;
    }

    document.getElementById('checkout-modal').style.display = 'flex';
    renderCheckoutSummary();
    selectPaymentMethod('Cash');
    clearCashTendered();
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function closeCheckoutOnBackdrop(event) {
    if (event.target.id === 'checkout-modal') {
        closeCheckoutModal();
    }
}

function selectPaymentMethod(method) {
    selectedPaymentType = method;
    document.querySelectorAll('.pay-tab').forEach(tab => {
        tab.classList.toggle('active', tab.textContent.includes(method === 'Cash' ? 'Cash' : 'Touch'));
    });

    document.getElementById('cash-payment-section').style.display = method === 'Cash' ? 'block' : 'none';
    document.getElementById('tng-payment-section').style.display = method === 'TNG' ? 'block' : 'none';
    document.getElementById('change-row').style.display = method === 'Cash' ? 'flex' : 'none';

    // Update payment method text on receipt summary view
    document.getElementById('summary-payment-method').innerText = method === 'Cash' ? 'Cash' : "Touch 'n Go QR";
}

function renderCheckoutSummary() {
    const list = document.getElementById('checkout-receipt-list');
    let total = 0;

    list.innerHTML = Object.values(currentOrder).map(i => {
        total += i.price * i.qty;
        return `<div class="checkout-item-row"><span>${i.name} ×${i.qty}</span><span>RM ${(i.price * i.qty).toFixed(2)}</span></div>`;
    }).join('');

    document.getElementById('checkout-grand-total').innerText = `RM ${total.toFixed(2)}`;
}

function getOrderTotal() {
    return Object.values(currentOrder).reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function updateChangeDisplay() {
    const total = getOrderTotal();
    const tendered = parseFloat(cashTenderedInput) || 0;
    const change = tendered - total;

    document.getElementById('cash-tendered-display').innerText = `RM ${tendered.toFixed(2)}`;
    document.getElementById('change-due-display').innerText = change >= 0 ? `RM ${change.toFixed(2)}` : 'Insufficient';
}

function addCashTendered(amount) {
    const current = parseFloat(cashTenderedInput) || 0;
    cashTenderedInput = (current + amount).toString();
    updateChangeDisplay();
}

function setExactCash() {
    cashTenderedInput = getOrderTotal().toFixed(2);
    updateChangeDisplay();
}

function clearCashTendered() {
    cashTenderedInput = '';
    updateChangeDisplay();
}

function pressNumpad(val) {
    if (val === 'back') {
        cashTenderedInput = cashTenderedInput.slice(0, -1);
    } else if (val === '.') {
        if (!cashTenderedInput.includes('.')) {
            cashTenderedInput += '.';
        }
    } else {
        cashTenderedInput += val;
    }
    updateChangeDisplay();
}

/* ============================================================
   TRANSACTION LOGGING & DAILY REPORTS
   ============================================================ */
let transactions = JSON.parse(localStorage.getItem('emera_transactions')) || [];

function recordTransaction(orderItems, paymentType, totalAmount, tendered, change) {
    const now = new Date();

    // Format date (YYYY-MM-DD)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${day}-${month}-${year}`;

    // Format time in 12-hour AM/PM format
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');

    const timeStr = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    const timestamp = `${dateStr} ${timeStr}`;

    const transaction = {
        id: 'tx_' + Date.now(),
        date: dateStr,
        timestamp: timestamp,
        items: orderItems,
        paymentMethod: paymentType,
        total: totalAmount,
        tendered: tendered,
        change: change
    };

    transactions.push(transaction);
    localStorage.setItem('emera_transactions', JSON.stringify(transactions));
}

// Update your completeCheckout function to call this:
function completeCheckout() {
    const total = getOrderTotal();
    const tendered = parseFloat(cashTenderedInput) || 0;

    if (selectedPaymentType === 'Cash' && tendered < total) {
        alert('Customer cash tendered is less than the total amount.');
        return;
    }

    const change = selectedPaymentType === 'Cash' ? tendered - total : 0;

    // Record transaction with sysdate and time
    recordTransaction(Object.values(currentOrder), selectedPaymentType, total, tendered, change);

    const payLabel = selectedPaymentType === 'Cash' ? 'Cash' : "Touch 'n Go QR";
    alert(`Payment successful via ${payLabel}!\nTransaction recorded.`);

    clearOrder();
    closeCheckoutModal();
}


function getDailyReport(targetDate = null) {
    // Default to today if no date specified (YYYY-MM-DD)
    if (!targetDate) {
        const now = new Date();
        targetDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Filter transactions for the target date and sort by timestamp descending (newest first)
    const dayTransactions = transactions
        .filter(tx => tx.date === targetDate)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    const totalSales = dayTransactions.reduce((sum, tx) => sum + tx.total, 0);

    return {
        date: targetDate,
        count: dayTransactions.length,
        totalSales: totalSales,
        transactions: dayTransactions
    };
}

function openReportModal() {
    document.getElementById('report-modal').style.display = 'flex';

    // Set date picker to today's date by default
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    document.getElementById('report-date-picker').value = todayStr;

    renderDailyReportView();
}

function closeReportModal() {
    document.getElementById('report-modal').style.display = 'none';
}

function closeReportOnBackdrop(event) {
    if (event.target.id === 'report-modal') closeReportModal();
}

function renderDailyReportView() {
    const selectedDate = document.getElementById('report-date-picker').value;
    const report = getDailyReport(selectedDate);

    document.getElementById('report-tx-count').innerText = report.count;
    document.getElementById('report-total-sales').innerText = `RM ${report.totalSales.toFixed(2)}`;

    const cashTransactions = report.transactions.filter(tx => tx.paymentMethod === 'Cash');
    const tngTransactions = report.transactions.filter(tx => tx.paymentMethod === 'TNG');

    const cashTotal = cashTransactions.reduce((sum, tx) => sum + tx.total, 0);
    const tngTotal = tngTransactions.reduce((sum, tx) => sum + tx.total, 0);

    document.getElementById('report-cash-sales').innerText = `RM ${cashTotal.toFixed(2)}`;
    document.getElementById('report-cash-count').innerText = cashTransactions.length;

    document.getElementById('report-tng-sales').innerText = `RM ${tngTotal.toFixed(2)}`;
    document.getElementById('report-tng-count').innerText = tngTransactions.length;

    // Calculate Expected Drawer Cash (Starting Float + Cash Sales)
    const savedFloats = JSON.parse(localStorage.getItem('emera_cash_floats')) || {};
    const startingFloat = parseFloat(savedFloats[selectedDate]) || 0;
    const expectedDrawerCash = startingFloat + cashTotal;

    const expectedEl = document.getElementById('expected-drawer-cash');
    if (expectedEl) {
        expectedEl.innerText = `RM ${expectedDrawerCash.toFixed(2)}`;
    }

    // Aggregate items sold summary
    const itemCounts = {};
    report.transactions.forEach(tx => {
        tx.items.forEach(item => {
            if (!itemCounts[item.name]) itemCounts[item.name] = 0;
            itemCounts[item.name] += item.qty;
        });
    });

    const itemSummaryEl = document.getElementById('report-item-summary-list');
    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);

    if (!sortedItems.length) {
        itemSummaryEl.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">No items sold on this date.</div>';
    } else {
        itemSummaryEl.innerHTML = sortedItems.map(([name, qty]) => `
            <div class="checkout-item-row" style="padding: 8px 0; border-bottom: 1px solid var(--border);">
                <span>${name}</span>
                <strong>×${qty}</strong>
            </div>
        `).join('');
    }

    // Render detailed transaction list with delete option
    const listEl = document.getElementById('report-tx-list');
    if (!report.transactions.length) {
        listEl.innerHTML = '<div style="text-align: center; color: var(--muted); padding: 20px;">No transactions recorded for this date.</div>';
        return;
    }

    listEl.innerHTML = report.transactions.map(tx => `
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.95rem;">
                <span>🕒 ${tx.timestamp} &nbsp; <span style="padding: 2px 6px; background: ${tx.paymentMethod === 'Cash' ? 'rgba(37,99,235,0.1); color: var(--primary)' : 'rgba(139,92,246,0.1); color: #8b5cf6'}; border-radius: 4px; font-size: 0.8rem;">${tx.paymentMethod}</span></span>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="color: var(--accent);">RM ${tx.total.toFixed(2)}</span>
                    <button type="button" onclick="deleteTransaction('${tx.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem;" title="Delete Transaction">🗑️</button>
                </div>
            </div>
            <div style="font-size: 0.85rem; color: var(--muted); margin-top: 4px;">
                ${tx.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
            </div>
            ${tx.paymentMethod === 'Cash' ? `<div style="font-size: 0.78rem; color: var(--muted); margin-top: 2px;">Paid: RM ${tx.tendered.toFixed(2)} | Change: RM ${tx.change.toFixed(2)}</div>` : ''}
        </div>
    `).join('');
}

function clearTransactionsForSelectedDate() {
    const selectedDate = document.getElementById('report-date-picker').value;
    if (confirm(`Are you sure you want to delete ALL transactions for ${selectedDate}?`)) {
        transactions = transactions.filter(tx => tx.date !== selectedDate);
        localStorage.setItem('emera_transactions', JSON.stringify(transactions));
        renderDailyReportView();
    }
}

function deleteTransaction(txId) {
    if (confirm('Are you sure you want to delete this specific transaction?')) {
        transactions = transactions.filter(tx => tx.id !== txId);
        localStorage.setItem('emera_transactions', JSON.stringify(transactions));
        renderDailyReportView();
    }
}

function downloadDailyReportCSV() {
    const selectedDate = document.getElementById('report-date-picker').value;
    const report = getDailyReport(selectedDate);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Daily Sales Report - ${report.date}\n`;
    csvContent += `Total Transactions,${report.count}\n`;
    csvContent += `Total Revenue,RM ${report.totalSales.toFixed(2)}\n\n`;
    csvContent += `Timestamp,Payment Method,Total (RM),Items\n`;

    report.transactions.forEach(tx => {
        const itemsStr = tx.items.map(i => `${i.name} x${i.qty}`).join(' | ');
        csvContent += `"${tx.timestamp}","${tx.paymentMethod}",${tx.total.toFixed(2), "${itemsStr}"}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function sendReportViaWhatsApp() {
    const selectedDate = document.getElementById('report-date-picker').value;
    const report = getDailyReport(selectedDate);

    const cashTx = report.transactions.filter(tx => tx.paymentMethod === 'Cash');
    const tngTx = report.transactions.filter(tx => tx.paymentMethod === 'TNG');
    const cashTotal = cashTx.reduce((sum, tx) => sum + tx.total, 0);
    const tngTotal = tngTx.reduce((sum, tx) => sum + tx.total, 0);

    // Format text message
    let message = `*EMERA POS - Daily Sales Report* 📊\n`;
    message += `Date: ${selectedDate}\n\n`;
    message += `Total Orders: ${report.count}\n`;
    message += `Cash Sales (${cashTx.length} orders): RM ${cashTotal.toFixed(2)}\n`;
    message += `TNG Sales (${tngTx.length} orders): RM ${tngTotal.toFixed(2)}\n`;
    message += `*Total Revenue: RM ${report.totalSales.toFixed(2)}*`;

    // Encode for URL and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}

/* ============================================================
   GOOGLE SIGN-IN AUTHENTICATION
   ============================================================ */
function handleCredentialResponse(response) {
    // Decode the JWT credential token from Google
    const responsePayload = parseJwt(response.credential);

    const email = responsePayload.email;
    const name = responsePayload.name;

    // Optional: Restrict access to specific allowed emails
    // const allowedEmails = ["your-email@gmail.com", "manager@emerapos.com"];
    // if (!allowedEmails.includes(email)) {
    //     alert("Unauthorized email account.");
    //     return;
    // }

    // Save session
    localStorage.setItem('kshf_google_user', JSON.stringify({ email, name }));
    updateUserUI();
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function signOutGoogle() {
    localStorage.removeItem('kshf_google_user');
    updateUserUI();
    window.location.reload();
}

function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('kshf_google_user'));
    const signinDiv = document.querySelector('.g_id_signin');
    const profileDiv = document.getElementById('user-profile-display');
    const emailText = document.getElementById('user-email-text');

    if (user) {
        if (signinDiv) signinDiv.style.display = 'none';
        if (profileDiv) profileDiv.style.display = 'block';
        if (emailText) emailText.textContent = `👤 ${user.email}`;
    } else {
        if (signinDiv) signinDiv.style.display = 'block';
        if (profileDiv) profileDiv.style.display = 'none';
    }
}

// Call updateUserUI on page load inside window.onload

/* ============================================================
   STARTUP
   ============================================================ */
window.onload = () => {
    const isDark = localStorage.getItem('dark_mode') === 'true';
    document.body.classList.toggle('dark', isDark);
    updateDarkModeButton(isDark);

    // Initialize Language safely on startup
    const savedLang = localStorage.getItem('emera_lang') || 'en';
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = savedLang;
    applyTranslations(savedLang);

    initSystem();
    updateReceipt();
};

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

