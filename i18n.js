/* ============================================================
   MULTI-LANGUAGE SUPPORT (EN, BM, ZH) - i18n.js
   ============================================================ */
const translations = {
    en: {
        adminTools: "Admin Tools",
        addItem: "Add Item",
        editMenu: "Edit Menu",
        clearOrder: "Clear Order",
        dailyReport: "Daily Report",
        exportMenu: "Export Menu",
        importMenu: "Import Menu",
        darkMode: "Dark Mode",
        lightMode: "Light Mode",
        menuTitle: "Menu",
        menuSubtitle: "Tap an item to add it to the current order.",
        currentOrder: "Current Order",
        total: "Total",
        checkout: "Checkout",
        backToPos: "Back to POS",
        
        // Report Page
        reportTitle: "Daily Sales & Cash Reconciliation",
        dateLabel: "Date:",
        clearRecords: "Clear Day's Records",
        totalTransactions: "Total Transactions",
        cashSales: "Cash Sales",
        tngSales: "TNG QR Sales",
        totalRevenue: "Total Revenue",
        startingFloat: "Starting Cash Float (Drawer Hold):",
        floatDesc: "Initial cash left in register before business starts.",
        expectedDrawer: "Expected Cash in Drawer:",
        floatNote: "(Starting Float + Cash Sales)",
        itemsSummary: "Items Sold Summary",
        txHistory: "Transaction History",
        noItems: "No items sold on this date.",
        noTx: "No transactions recorded for this date.",
        downloadCsv: "Download CSV",
        whatsapp: "WhatsApp",
        clear: "Clear"
    },
    ms: {
        adminTools: "Alat Admin",
        addItem: "Tambah Item",
        editMenu: "Sunting Menu",
        clearOrder: "Kosongkan Pesanan",
        dailyReport: "Laporan Harian",
        exportMenu: "Eksport Menu",
        importMenu: "Import Menu",
        darkMode: "Mod Gelap",
        lightMode: "Mod Cerah",
        menuTitle: "Menu",
        menuSubtitle: "Tekan item untuk menambah ke pesanan semasa.",
        currentOrder: "Pesanan Semasa",
        total: "Jumlah",
        checkout: "Bayar",
        backToPos: "Kembali ke POS",
        
        // Report Page
        reportTitle: "Jualan Harian & Penyelarasan Tunai",
        dateLabel: "Tarikh:",
        clearRecords: "Kosongkan Rekod Hari Ini",
        totalTransactions: "Jumlah Transaksi",
        cashSales: "Jualan Tunai",
        tngSales: "Jualan TNG QR",
        totalRevenue: "Jumlah Pendapatan",
        startingFloat: "Baki Tunai Permulaan (Drawer Hold):",
        floatDesc: "Tunai awal dalam laci sebelum perniagaan bermula.",
        expectedDrawer: "Jangkaan Tunai dalam Laci:",
        floatNote: "(Baki Permulaan + Jualan Tunai)",
        itemsSummary: "Ringkasan Item Terjual",
        txHistory: "Sejarah Transaksi",
        noItems: "Tiada item terjual pada tarikh ini.",
        noTx: "Tiada transaksi direkodkan pada tarikh ini.",
        downloadCsv: "Muat Turun CSV",
        whatsapp: "WhatsApp",
        clear: "Kosongkan"
    },
    zh: {
        adminTools: "管理工具",
        addItem: "添加商品",
        editMenu: "编辑菜单",
        clearOrder: "清空订单",
        dailyReport: "每日报表",
        exportMenu: "导出菜单",
        importMenu: "导入菜单",
        darkMode: "夜间模式",
        lightMode: "白天模式",
        menuTitle: "菜单",
        menuSubtitle: "点击商品将其加入当前订单。",
        currentOrder: "当前订单",
        total: "总计",
        checkout: "结账",
        backToPos: "返回收银台",
        
        // Report Page
        reportTitle: "每日销售与现金对账",
        dateLabel: "日期：",
        clearRecords: "清除当日记录",
        totalTransactions: "总交易笔数",
        cashSales: "现金销售",
        tngSales: "TNG扫码销售",
        totalRevenue: "总收入",
        startingFloat: "初始备用金 (钱箱留存):",
        floatDesc: "营业开始前留在收银机中的初始现金。",
        expectedDrawer: "钱箱应有现金:",
        floatNote: "(初始备用金 + 现金销售)",
        itemsSummary: "售出商品汇总",
        txHistory: "交易历史记录",
        noItems: "此日期没有售出商品。",
        noTx: "此日期没有记录交易。",
        downloadCsv: "下载 CSV",
        whatsapp: "WhatsApp",
        clear: "清除"
    }
};

function changeLanguage(lang) {
    localStorage.setItem('kshf_lang', lang);
    applyTranslations(lang);
}

function applyTranslations(lang) {
    const t = translations[lang] || translations.en;

    // 1. Sidebar Buttons
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        const title = btn.getAttribute('title');
        const textSpan = btn.querySelector('.btn-text');
        if (!textSpan) return;

        if (title === 'Add Item') textSpan.textContent = t.addItem;
        if (title === 'Edit Menu') textSpan.textContent = t.editMenu;
        if (title === 'Clear Order') textSpan.textContent = t.clearOrder;
        if (title === 'Daily Report') textSpan.textContent = t.dailyReport;
        if (title === 'Export Menu') textSpan.textContent = t.exportMenu;
        if (title === 'Import Menu') textSpan.textContent = t.importMenu;
        if (title === 'Back to POS') textSpan.textContent = t.backToPos;
        if (title === 'Dark Mode' || title === 'Light Mode') {
            const isDark = document.body.classList.contains('dark');
            textSpan.textContent = isDark ? t.lightMode : t.darkMode;
        }
    });

    // 2. Sidebar Header
    const sidebarHeader = document.querySelector('.sidebar-header h3');
    if (sidebarHeader) sidebarHeader.textContent = t.adminTools;

    // 3. Main POS Page Elements
    const menuHeader = document.querySelector('.menu-section h2');
    if (menuHeader) menuHeader.textContent = t.menuTitle;

    const menuSub = document.querySelector('.menu-section p');
    if (menuSub) menuSub.textContent = t.menuSubtitle;

    const orderHeader = document.querySelector('.receipt-card h2');
    if (orderHeader) orderHeader.textContent = t.currentOrder;

    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) checkoutBtn.textContent = t.checkout;

    // 4. Report Page Elements
    const reportHeader = document.querySelector('.report-nav h2');
    if (reportHeader) reportHeader.textContent = t.reportTitle;

    const dateLabel = document.querySelector('label[for="report-date-picker"]');
    if (dateLabel) dateLabel.textContent = t.dateLabel;

    // Metric Cards labels
    const metricCards = document.querySelectorAll('.metric-card span');
    if (metricCards.length >= 4) {
        metricCards[0].textContent = t.totalTransactions;
        metricCards[1].textContent = t.cashSales;
        metricCards[2].textContent = t.tngSales;
        metricCards[3].textContent = t.totalRevenue;
    }

    // Cash Float Section
    const floatLabel = document.querySelector('label[for="starting-float-input"] strong');
    if (floatLabel) floatLabel.textContent = t.startingFloat;

    const floatDesc = document.querySelector('.float-box span[style*="color: var(--muted)"]');
    if (floatDesc && !floatDesc.textContent.includes('Starting Float')) {
        floatDesc.textContent = t.floatDesc;
    }

    const tallyLabel = document.querySelector('.tally-box span strong');
    if (tallyLabel) tallyLabel.textContent = t.expectedDrawer;

    const tallyNote = document.querySelector('.tally-box span[style*="font-size: 0.85rem"]');
    if (tallyNote) tallyNote.textContent = t.floatNote;

    // Report Section Titles
    const reportHeaders = document.querySelectorAll('.report-column h3');
    if (reportHeaders.length >= 2) {
        reportHeaders[0].textContent = t.itemsSummary;
        reportHeaders[1].textContent = t.txHistory;
    }

    // Report Action Buttons
    const csvBtn = document.querySelector('button[onclick="downloadDailyReportCSV()"]');
    if (csvBtn) {
        const textNode = csvBtn.lastChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) textNode.textContent = ` ${t.downloadCsv}`;
    }

    const waBtn = document.querySelector('button[onclick="sendReportViaWhatsApp()"]');
    if (waBtn) {
        const textNode = waBtn.lastChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) textNode.textContent = ` ${t.whatsapp}`;
    }

    const clearBtn = document.querySelector('button[onclick="clearTransactionsForSelectedDate()"]');
    if (clearBtn) clearBtn.textContent = t.clearRecords;
}