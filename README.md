# EMERA POS
A lightweight, modern, and tablet-optimized Point of Sale (POS) web application built with vanilla JavaScript, HTML, and CSS. Designed specifically for small businesses and food stalls with touch-first ergonomics, an app-like sliding sidebar drawer, dark mode support, and local data persistence.

# Features
Tablet-First UI / UX: Optimized for touch screens with a clean icon rail sidebar, touch-friendly grid buttons, and smooth landscape-to-portrait responsiveness.

App Drawer Navigation: Features a native mobile app-style slide-in sidebar menu with a dimming backdrop overlay in portrait/vertical mode.

Order & Receipt Management: Instantly calculate grand totals, add items with a single tap, and clear active orders.

Dynamic Menu Administration:

Add new menu items via a clean popup modal.

Edit item names, categories, and prices on the fly.

Delete outdated items.

Backup & Restore (JSON Export/Import): Easily back up your menu items to a custom-named JSON file or restore them instantly when switching or updating tablets.

Dark & Light Mode: Toggle seamlessly between dark and light themes for different lighting conditions.

Local Storage Persistence: Keeps your menu data saved safely in the browser's local storage.

# Tech Stack
HTML5 (Structure & Layout)

CSS3 (Grid, Flexbox, Custom Variables, Responsive Media Queries)

JavaScript (ES6+) (State Management, DOM Manipulation, LocalStorage, File API)

Typography: Manrope (Google Fonts)

#Project Structure
pos_emera_system/
├── index.html       # Main application markup & modals

├── styles.css       # Styling, layout grids, dark mode, and mobile drawer styles

└── script.js        # State logic, order handling, local storage, and file import/export
