        // ---------- مساعدات عامة ----------
        function esc(v) {
            return String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
        }
        const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
        let _lineSeq = 0;
        function nextLineId() { return Date.now() * 1000 + (++_lineSeq % 1000); }
        function freshDeliveryCustomer() {
            return { name: '', phone: '', address: '', zoneId: DELIVERY_ZONES[0]?.id || 'z1', fee: 0.00, zoneName: 'سعر يدوي' };
        }
        // مصدر واحد للحسابات (بدل قراءة الإجمالي من نص الشاشة)
        function calculateTotals() {
            const subtotal = round2(cart.reduce((a, c) => a + (c.price * c.qty), 0));
            const vat = currentOnlineOrderId ? 0 : round2(subtotal * (SETTINGS.taxRate / 100));
            const fee = (orderType === 'delivery' || customDeliveryFeeApplied) ? (Number(deliveryCustomer.fee) || 0) : 0;
            const delivery = cart.length > 0 ? round2(fee) : 0;
            const disc = round2(discount || 0);
            const total = round2(Math.max(0, subtotal + vat + delivery - disc));
            return { subtotal, vat, delivery, discount: disc, total };
        }
        function computeNextTicketId() {
            const ids = [
                ...ORDERS_HISTORY.map(o => Number(o.id)),
                ...heldOrders.map(h => Number(h.id)),
                ...KDS_ORDERS.map(k => Number(k.ticketId))
            ].filter(n => Number.isFinite(n));
            return ids.length ? ids.reduce((a, b) => Math.max(a, b), 0) + 1 : 1084;
        }
        function orderKind(o) {
            if (o.orderType) return o.orderType;
            const t = o.type || '';
            if (t.includes('سفري')) return 'takeaway';
            if (t.includes('دليفري')) return 'delivery';
            return 'dine-in';
        }
        function quickAddById(id) {
            const p = MENU_ITEMS.find(i => String(i.id) === String(id));
            if (p) addToCart(p);
        }
        function sendOrderWhatsAppById(id) {
            const o = ORDERS_HISTORY.find(x => String(x.id) === String(id));
            if (o) sendOrderWhatsApp(o);
        }

        const DEFAULT_MENU_ITEMS = [
            { id: 101, name: "برجر ترافل مشروم دوبل", category: "burger", price: 185.00, popular: true, available: true, emoji: "🍔", desc: "لحم أنجوس فاخر مع صوص الترافل وجبنة سويسرية" },
            { id: 102, name: "سموك هاوس باربكيو بيف", category: "burger", price: 165.00, popular: false, available: true, emoji: "🥩", desc: "شرائح بيكن مقرمشة وبصل مكرمل وصوص التدخين" },
            { id: 103, name: "دجاج كرانشي سبايسي", category: "burger", price: 135.00, popular: true, available: true, emoji: "🍗", desc: "صدر دجاج مقرمش مع هالبينو وجبنة شيدر ذائبة" },
            { id: 104, name: "ميني سلايدرز ميكس (3 قطع)", category: "burger", price: 170.00, popular: false, available: true, emoji: "🍔", desc: "ثلاث نكهات برجر مختلفة مع بطاطس وافل" },
            
            { id: 201, name: "بيتزا مارغريتا دي نابولي", category: "pizza", price: 140.00, popular: false, available: true, emoji: "🍕", desc: "عجينة إيطالية مخمرة، صوص سان مارزانو وموزاريلا طازجة" },
            { id: 202, name: "بيتزا بيبروني سوبريم", category: "pizza", price: 175.00, popular: true, available: true, emoji: "🍕", desc: "شرائح بيبروني بقري فاخر، فلفل وزيتون كالاماتا" },
            { id: 203, name: "بيتزا باربكيو تشيكن كرانش", category: "pizza", price: 180.00, popular: false, available: true, emoji: "🍕", desc: "قطع دجاج مشوي، بصل أحمر وصوص الباربكيو المدخن" },
            { id: 204, name: "بيتزا فور تشيز بالريحان", category: "pizza", price: 195.00, popular: false, available: true, emoji: "🧀", desc: "موزاريلا، جودا، جبن أزرق وبارميزان" },

            { id: 301, name: "صاروخ شاورما لحم عربي", category: "shawarma", price: 110.00, popular: true, available: true, emoji: "🌯", desc: "شاورما لحم بلدي مع صوص الطحينة والبقدونس والبيواز" },
            { id: 302, name: "فتة شاورما ميكس عائلي", category: "shawarma", price: 155.00, popular: true, available: true, emoji: "🍲", desc: "رز بسمتي ذهبي، دجاج ولحم وخبز محمص مع الثومية" },
            { id: 303, name: "ساندوتش فاهيتا دجاج مكسيكي", category: "shawarma", price: 125.00, popular: false, available: true, emoji: "🥖", desc: "فلفل ملون، جبن شيدر وخلطة التوابل المكسيكية الحارة" },
            
            { id: 401, name: "وجبة شيف بوكس ميكس غريل", category: "meals", price: 290.00, popular: true, available: true, emoji: "🍱", desc: "كفتة، شيش طاووق، ريش ضاني، بطاطس ومقبلات" },
            { id: 402, name: "باكيت ستربس الدجاج (12 قطعة)", category: "meals", price: 220.00, popular: false, available: true, emoji: "🍗", desc: "مع 3 صوصات من اختيارك وعبوة بطاطس عائلية" },

            { id: 501, name: "بطاطس محمرة مع صوص الشيدر", category: "sides", price: 55.00, popular: true, available: true, emoji: "🍟", desc: "بطاطس ذهبية مغطاة بجبنة الشيدر الساخنة" },
            { id: 502, name: "أصابع موزاريلا مقرمشة (5 ق)", category: "sides", price: 65.00, popular: false, available: true, emoji: "🧀", desc: "مع صوص المارينارا الخاص" },
            { id: 503, name: "بيبسي ماكس بارد (علبة)", category: "sides", price: 25.00, popular: false, available: true, emoji: "🥤", desc: "مشروب غازي مثلج" },
            { id: 504, name: "عصير برتقال طازج طبيعي", category: "sides", price: 40.00, popular: false, available: true, emoji: "🍹", desc: "معصور طازج بدون سكر مضاف" },

            { id: 601, name: "تشيز كيك بالتوت البري", category: "dessert", price: 85.00, popular: true, available: true, emoji: "🍰", desc: "طبقة غنية من الجبن الكريمي مع صوص التوت البري" },
            { id: 602, name: "براونيز الشوكولاتة والآيس كريم", category: "dessert", price: 90.00, popular: false, available: true, emoji: "🍫", desc: "كيك براوني دافئ مع بولة آيس كريم فانيليا" }
        ];

        const DEFAULT_CATEGORIES = [
            { key: "burger", name: "برجر", icon: "🍔" },
            { key: "pizza", name: "بيتزا", icon: "🍕" },
            { key: "shawarma", name: "شاورما", icon: "🌯" },
            { key: "meals", name: "وجبات عائلية", icon: "🍗" },
            { key: "sides", name: "مقبلات ومشروبات", icon: "🍟" },
            { key: "dessert", name: "حلويات", icon: "🍰" }
        ];

        const DEFAULT_TABLES = [
            { id: "T-01", label: "طاولة 01 (داخلية)", capacity: 4 },
            { id: "T-02", label: "طاولة 02 (داخلية)", capacity: 4 },
            { id: "T-03", label: "طاولة 03 (عائلات)", capacity: 6 },
            { id: "T-04", label: "طاولة 04 (تراس)", capacity: 2 },
            { id: "VIP-1", label: "جناح VIP", capacity: 8 }
        ];

        const DEFAULT_CASHIERS = [
            { id: 1, name: "أحمد حسام", phone: "01011122334", pin: "1111", active: true },
            { id: 2, name: "محمود عادل", phone: "01022233445", pin: "2222", active: true },
            { id: 3, name: "سارة إبراهيم", phone: "01033344556", pin: "3333", active: true }
        ];

        const DEFAULT_DRIVERS = [
            { id: 101, name: "محمد سعيد", phone: "01099887766" },
            { id: 102, name: "إسلام عماد", phone: "01055443322" },
            { id: 103, name: "كريم أحمد", phone: "01011223344" }
        ];

        const DEFAULT_ZONES = [
            { id: "z1", name: "المنطقة الأولى - وسط البلد", fee: 20.00 },
            { id: "z2", name: "المنطقة الثانية - الأحياء القريبة", fee: 35.00 },
            { id: "z3", name: "المنطقة الثالثة - أطراف المدينة", fee: 50.00 }
        ];

        const GLOBAL_EXTRAS = [
            { id: "ex1", name: "إضافة جبنة شيدر", price: 20.00 },
            { id: "ex2", name: "كومبو (بطاطس + مشروب)", price: 45.00 },
            { id: "ex3", name: "صوص رانش / ترافل", price: 15.00 },
            { id: "ex4", name: "قطعة لحم / دجاج إضافية", price: 55.00 }
        ];

        const DEFAULT_CUSTOMERS = [
            { phone: "01012345678", name: "أحمد عبد الرحمن", zoneId: "z1", address: "شارع الجمهورية، عمارة 14، الدور الثالث" },
            { phone: "01122334455", name: "منى محمود", zoneId: "z2", address: "تقسيم 2، بجوار صيدلية الشفاء، برج النور" }
        ];

        const DEFAULT_SETTINGS = {
            resName: "شيف برغر & جريل",
            resPhone: "01012345678",
            resAddress: "القاهرة - المعادي - شارع 9",
            resTaxNumber: "س.ت: 489201 | ضريبي: 981-223-112",
            resFooter: "شكراً لزيارتكم! نتشرف بخدمتكم دائماً.",
            taxRate: 14,
            deliveryFee: 25.00,
            currency: "ج.م",
            adminPin: "1234"
        };

        // تحميل البيانات من LocalStorage
        let MENU_ITEMS = JSON.parse(localStorage.getItem('restaurant_pos_menu')) || DEFAULT_MENU_ITEMS;
        let CATEGORIES = JSON.parse(localStorage.getItem('pos_categories')) || DEFAULT_CATEGORIES;
        let TABLES = JSON.parse(localStorage.getItem('pos_tables')) || DEFAULT_TABLES;
        let CASHIERS = JSON.parse(localStorage.getItem('pos_cashiers')) || DEFAULT_CASHIERS;
        let DELIVERY_DRIVERS = JSON.parse(localStorage.getItem('pos_drivers')) || DEFAULT_DRIVERS;
        let DELIVERY_ZONES = JSON.parse(localStorage.getItem('pos_delivery_zones')) || DEFAULT_ZONES;
        let CUSTOMERS_CRM = JSON.parse(localStorage.getItem('pos_customers_crm')) || DEFAULT_CUSTOMERS;
        let SETTINGS = JSON.parse(localStorage.getItem('pos_settings')) || DEFAULT_SETTINGS;
        let ORDERS_HISTORY = JSON.parse(localStorage.getItem('pos_orders_history')) || [];
        let SHIFTS_HISTORY = JSON.parse(localStorage.getItem('pos_shifts_history')) || [];
        let KDS_ORDERS = JSON.parse(localStorage.getItem('pos_kds_orders')) || [];
        let RESERVED_TABLES = JSON.parse(localStorage.getItem('pos_reserved_tables')) || [];
        let activeWorkspace = 'pos';

        // =========================================================================
        // المرحلة الثالثة: محرك قاعدة البيانات الداخلية (IndexedDB) + ملف الهارد + PWA
        // =========================================================================
        const IDB_NAME = 'SmartPOS_Enterprise_DB';
        const IDB_VERSION = 1;
        const IDB_STORE = 'pos_state_store';
        let idbInstance = null;
        let localDiskFileHandle = null;
        let deferredPwaPrompt = null;

        function openPosIndexedDB() {
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    resolve(null);
                    return;
                }
                const request = indexedDB.open(IDB_NAME, IDB_VERSION);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE, { keyPath: 'key' });
                    }
                };
                request.onsuccess = (e) => {
                    idbInstance = e.target.result;
                    resolve(idbInstance);
                };
                request.onerror = () => resolve(null);
            });
        }

        function idbSetItem(key, value) {
            return new Promise((resolve) => {
                if (!idbInstance) return resolve(false);
                try {
                    const tx = idbInstance.transaction(IDB_STORE, 'readwrite');
                    const store = tx.objectStore(IDB_STORE);
                    store.put({ key, value, updatedAt: Date.now() });
                    tx.oncomplete = () => resolve(true);
                    tx.onerror = () => resolve(false);
                } catch (err) {
                    resolve(false);
                }
            });
        }

        function idbGetAllState() {
            return new Promise((resolve) => {
                if (!idbInstance) return resolve({});
                try {
                    const tx = idbInstance.transaction(IDB_STORE, 'readonly');
                    const store = tx.objectStore(IDB_STORE);
                    const req = store.getAll();
                    req.onsuccess = () => {
                        const map = {};
                        (req.result || []).forEach(row => {
                            map[row.key] = row.value;
                        });
                        resolve(map);
                    };
                    req.onerror = () => resolve({});
                } catch (err) {
                    resolve({});
                }
            });
        }

        function buildFullDatabaseSnapshot() {
            return {
                version: "3.0-Enterprise",
                exportedAt: new Date().toISOString(),
                restaurant_pos_menu: MENU_ITEMS,
                pos_categories: CATEGORIES,
                pos_tables: TABLES,
                pos_cashiers: CASHIERS,
                pos_drivers: DELIVERY_DRIVERS,
                pos_delivery_zones: DELIVERY_ZONES,
                pos_customers_crm: CUSTOMERS_CRM,
                pos_settings: SETTINGS,
                pos_orders_history: ORDERS_HISTORY,
                pos_shifts_history: SHIFTS_HISTORY,
                pos_kds_orders: KDS_ORDERS,
                pos_reserved_tables: RESERVED_TABLES,
                pos_current_shift: currentShift,
                pos_held_orders: heldOrders
            };
        }

        async function syncAllStateToIndexedDBAndDisk() {
            const snapshot = buildFullDatabaseSnapshot();
            const keys = Object.keys(snapshot);
            for (const k of keys) {
                if (k !== 'version' && k !== 'exportedAt') {
                    await idbSetItem(k, snapshot[k]);
                }
            }
            updateDbStatsUI();

            // إذا كان هناك ملف مربوط على الهارد ديسك، نحفظ فيه تلقائياً
            if (localDiskFileHandle) {
                try {
                    const writable = await localDiskFileHandle.createWritable();
                    await writable.write(JSON.stringify(snapshot, null, 2));
                    await writable.close();
                } catch (err) {
                    console.warn('Auto-save to disk file skipped:', err);
                }
            }
        }

        // اعتراض ذكي لـ localStorage.setItem ليحفظ تلقائياً في IndexedDB وملف الهارد ديسك في نفس اللحظة
        const _nativeSetItem = Storage.prototype.setItem;
        const _originalSetItem = (k, v) => _nativeSetItem.call(localStorage, k, v);
        let _diskSyncTimer = null;
        let _quotaWarned = false;
        Storage.prototype.setItem = function(key, value) {
            if (this !== localStorage) return _nativeSetItem.call(this, key, value);
            try {
                _nativeSetItem.call(this, key, value);
            } catch (err) {
                console.warn('localStorage write failed (quota?)', err);
                if (!_quotaWarned) {
                    _quotaWarned = true;
                    setTimeout(() => showToast('تحذير: مساحة التخزين المحلية ممتلئة — صدّر نسخة احتياطية الآن', true), 0);
                }
            }
            if (idbInstance) {
                try {
                    const parsed = JSON.parse(value);
                    idbSetItem(key, parsed).then(() => updateDbStatsUI());
                } catch (e) {
                    idbSetItem(key, value);
                }
            }
            if (localDiskFileHandle) {
                clearTimeout(_diskSyncTimer);
                _diskSyncTimer = setTimeout(syncAllStateToIndexedDBAndDisk, 400);
            }
        };
        // تنظيف مفتاح "setItem" الوهمي الذي كان يتركه الاعتراض القديم
        try { if (localStorage.getItem('setItem') !== null) localStorage.removeItem('setItem'); } catch (e) {}

        async function hydrateStateFromIndexedDB() {
            await openPosIndexedDB();
            if (!idbInstance) return;

            const savedMap = await idbGetAllState();
            const hasIdbData = Object.keys(savedMap).length > 0;

            if (hasIdbData) {
                if (savedMap.restaurant_pos_menu) MENU_ITEMS = savedMap.restaurant_pos_menu;
                if (savedMap.pos_categories) CATEGORIES = savedMap.pos_categories;
                if (savedMap.pos_tables) TABLES = savedMap.pos_tables;
                if (savedMap.pos_cashiers) CASHIERS = savedMap.pos_cashiers;
                if (savedMap.pos_drivers) DELIVERY_DRIVERS = savedMap.pos_drivers;
                if (savedMap.pos_delivery_zones) DELIVERY_ZONES = savedMap.pos_delivery_zones;
                if (savedMap.pos_customers_crm) CUSTOMERS_CRM = savedMap.pos_customers_crm;
                if (savedMap.pos_settings) SETTINGS = savedMap.pos_settings;
                if (savedMap.pos_orders_history) ORDERS_HISTORY = savedMap.pos_orders_history;
                if (savedMap.pos_shifts_history) SHIFTS_HISTORY = savedMap.pos_shifts_history;
                if (savedMap.pos_kds_orders) KDS_ORDERS = savedMap.pos_kds_orders;
                if (savedMap.pos_reserved_tables) RESERVED_TABLES = savedMap.pos_reserved_tables;
                if (savedMap.pos_current_shift) currentShift = savedMap.pos_current_shift;
                if (savedMap.pos_held_orders) heldOrders = savedMap.pos_held_orders;

                currentTicketId = computeNextTicketId();
                document.getElementById('ticket-id').innerText = currentTicketId;

                applyBrandSettings();
                updateCashierDisplay();
                renderCategoriesBar();
                renderTablesSelect();
                renderDeliveryZonesSelect();
                selectCategory(currentCategory);
                updateCartUI();
                updateHeldBadge();
                updateKdsBadge();
            } else {
                // أول مرة: نقل كل البيانات الحالية إلى IndexedDB
                await syncAllStateToIndexedDBAndDisk();
            }
            updateDbStatsUI();
        }

        function updateDbStatsUI() {
            const statusText = document.getElementById('db-status-text');
            const recordsEl = document.getElementById('idb-modal-records');
            const sizeEl = document.getElementById('idb-modal-size');
            const diskStatusEl = document.getElementById('disk-file-status');

            if (statusText) {
                statusText.textContent = localDiskFileHandle
                    ? `الهارد + IndexedDB (${ORDERS_HISTORY.length})`
                    : `IndexedDB (${ORDERS_HISTORY.length} فاتورة)`;
            }
            if (recordsEl) {
                recordsEl.textContent = `${ORDERS_HISTORY.length} فاتورة / ${MENU_ITEMS.length} صنف / ${CUSTOMERS_CRM.length} عميل`;
            }
            if (sizeEl) {
                const approxBytes = new Blob([JSON.stringify(buildFullDatabaseSnapshot())]).size;
                const kb = (approxBytes / 1024).toFixed(1);
                sizeEl.textContent = `حجم قاعدة البيانات النشطة: ${kb} KB`;
            }
            if (diskStatusEl) {
                if (localDiskFileHandle) {
                    diskStatusEl.textContent = `مربوط تلقائياً: ${localDiskFileHandle.name}`;
                    diskStatusEl.className = "text-sm font-black text-emerald-500 truncate";
                } else {
                    diskStatusEl.textContent = "يحفظ تلقائياً في IndexedDB";
                    diskStatusEl.className = "text-sm font-black text-slate-700 dark:text-slate-300 truncate";
                }
            }
        }

        function openDesktopDbModal() {
            if (!requireManager()) return;
            updateDbStatsUI();
            openModal('desktop-db-modal');
        }

        // ربط النظام بملف JSON مباشر على الهارد ديسك (File System Access API)
        async function connectLocalDiskDatabaseFile() {
            if (!window.showSaveFilePicker) {
                showToast("متصفحك لا يدعم الربط المباشر، جاري تحميل ملف النسخة الاحتياطية بدلاً من ذلك", true);
                exportFullDatabaseJson();
                return;
            }
            try {
                localDiskFileHandle = await window.showSaveFilePicker({
                    suggestedName: 'smart_pos_database.json',
                    types: [{
                        description: 'ملف قاعدة بيانات الكاشير (JSON)',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                await syncAllStateToIndexedDBAndDisk();
                updateDbStatsUI();
                playPosSound('checkout');
                showToast(`تم ربط الذاكرة بملف الهارد (${localDiskFileHandle.name}) للحفظ التلقائي!`);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showToast("تعذر الوصول للملف المباشر داخل نافذة المعاينة، استخدم زر حفظ نسخة", true);
                }
            }
        }

        async function openFromLocalDiskDatabaseFile() {
            if (!window.showOpenFilePicker) {
                showToast("استخدم زر «استرجاع» لاختيار ملف قاعدة البيانات من جهازك", true);
                return;
            }
            try {
                const [handle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'ملف قاعدة بيانات الكاشير (JSON)',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                localDiskFileHandle = handle;
                const file = await handle.getFile();
                const text = await file.text();
                applyImportedDatabaseSnapshot(JSON.parse(text));
                showToast(`تم فتح ومزامنة قاعدة البيانات من: ${handle.name}`);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showToast("استخدم زر «استرجاع» لرفع ملف قاعدة البيانات", true);
                }
            }
        }

        function exportFullDatabaseJson() {
            const snapshot = buildFullDatabaseSnapshot();
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SmartPOS_Backup_${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            playPosSound('beep');
            showToast("تم تحميل نسخة قاعدة البيانات الكاملة على جهازك");
        }

        function importFullDatabaseJson(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const looksValid = data && typeof data === 'object' &&
                        (Array.isArray(data.restaurant_pos_menu) || Array.isArray(data.pos_orders_history) || data.pos_settings);
                    if (!looksValid) throw new Error('not a POS backup');
                    showConfirmModal("استرجاع نسخة احتياطية", "سيتم استبدال جميع البيانات الحالية بمحتوى الملف. هل تريد المتابعة؟", () => {
                        applyImportedDatabaseSnapshot(data);
                        showToast("تم استرجاع قاعدة البيانات بالكامل وتحديث الذاكرة!");
                    });
                } catch (err) {
                    showToast("ملف النسخة الاحتياطية غير صالح!", true);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        function applyImportedDatabaseSnapshot(data) {
            if (!data || typeof data !== 'object') return;
            if (Array.isArray(data.restaurant_pos_menu)) MENU_ITEMS = data.restaurant_pos_menu;
            if (Array.isArray(data.pos_categories)) CATEGORIES = data.pos_categories;
            if (Array.isArray(data.pos_tables)) TABLES = data.pos_tables;
            if (Array.isArray(data.pos_cashiers)) CASHIERS = data.pos_cashiers;
            if (Array.isArray(data.pos_drivers)) DELIVERY_DRIVERS = data.pos_drivers;
            if (Array.isArray(data.pos_delivery_zones)) DELIVERY_ZONES = data.pos_delivery_zones;
            if (Array.isArray(data.pos_customers_crm)) CUSTOMERS_CRM = data.pos_customers_crm;
            if (data.pos_settings && typeof data.pos_settings === 'object') SETTINGS = { ...DEFAULT_SETTINGS, ...data.pos_settings };
            if (Array.isArray(data.pos_orders_history)) ORDERS_HISTORY = data.pos_orders_history;
            if (Array.isArray(data.pos_shifts_history)) SHIFTS_HISTORY = data.pos_shifts_history;
            if (Array.isArray(data.pos_kds_orders)) KDS_ORDERS = data.pos_kds_orders;
            if (Array.isArray(data.pos_reserved_tables)) RESERVED_TABLES = data.pos_reserved_tables;
            if (data.pos_current_shift) currentShift = data.pos_current_shift;
            if (Array.isArray(data.pos_held_orders)) heldOrders = data.pos_held_orders;

            _originalSetItem('restaurant_pos_menu', JSON.stringify(MENU_ITEMS));
            _originalSetItem('pos_categories', JSON.stringify(CATEGORIES));
            _originalSetItem('pos_tables', JSON.stringify(TABLES));
            _originalSetItem('pos_cashiers', JSON.stringify(CASHIERS));
            _originalSetItem('pos_drivers', JSON.stringify(DELIVERY_DRIVERS));
            ensureRoles();
            _originalSetItem('pos_delivery_zones', JSON.stringify(DELIVERY_ZONES));
            _originalSetItem('pos_customers_crm', JSON.stringify(CUSTOMERS_CRM));
            _originalSetItem('pos_settings', JSON.stringify(SETTINGS));
            _originalSetItem('pos_orders_history', JSON.stringify(ORDERS_HISTORY));
            _originalSetItem('pos_shifts_history', JSON.stringify(SHIFTS_HISTORY));
            _originalSetItem('pos_kds_orders', JSON.stringify(KDS_ORDERS));
            _originalSetItem('pos_reserved_tables', JSON.stringify(RESERVED_TABLES));
            _originalSetItem('pos_current_shift', JSON.stringify(currentShift));
            _originalSetItem('pos_held_orders', JSON.stringify(heldOrders));

            syncAllStateToIndexedDBAndDisk();
            currentTicketId = computeNextTicketId();
            document.getElementById('ticket-id').innerText = currentTicketId;

            applyBrandSettings();
            updateCashierDisplay();
            renderCategoriesBar();
            renderTablesSelect();
            renderDeliveryZonesSelect();
            selectCategory('all');
            updateCartUI();
            updateHeldBadge();
            updateKdsBadge();
            playPosSound('checkout');
        }

        // تصدير سجل الفواتير والمبيعات إلى ملف Excel CSV يدعم اللغة العربية
        function exportOrdersToExcelCsv() {
            if (ORDERS_HISTORY.length === 0) {
                showToast("لا توجد فواتير مسجلة لتصديرها حتى الآن!", true);
                return;
            }
            const headers = ["رقم الفاتورة", "التاريخ والوقت", "الكاشير", "نوع الطلب", "طريقة الدفع", "عدد الأصناف", "المجموع الفرعي", "الضريبة", "التوصيل", "الخصم", "الإجمالي الصافي"];
            const rows = ORDERS_HISTORY.map(o => [
                o.id,
                `"${o.date}"`,
                `"${o.cashier || ''}"`,
                `"${o.type || ''}"`,
                o.method === 'cash' ? 'نقدي' : (o.method === 'card' ? 'شبكة/فيزا' : 'مختلط'),
                o.itemsCount || 0,
                (o.subtotal || 0).toFixed(2),
                (o.tax || 0).toFixed(2),
                (o.deliveryFee || 0).toFixed(2),
                (o.discount || 0).toFixed(2),
                (o.total || 0).toFixed(2)
            ]);

            const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `تقرير_مبيعات_المطعم_${new Date().toISOString().slice(0,10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("تم تصدير جدول المبيعات لملف Excel CSV بنجاح");
        }

        // تهيئة تطبيق سطح المكتب التقدمي (PWA Manifest + Offline Service Worker)
        function setupDesktopPWA() {
            try {
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    deferredPwaPrompt = e;
                    const installBtn = document.getElementById('pwa-install-btn');
                    if (installBtn) installBtn.classList.add('animate-bounce');
                });
                if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                    navigator.serviceWorker.register('sw.js').catch(() => {});
                }
            } catch (e) {}
        }

        async function triggerPwaInstall() {
            if (deferredPwaPrompt) {
                deferredPwaPrompt.prompt();
                const { outcome } = await deferredPwaPrompt.userChoice;
                if (outcome === 'accepted') {
                    showToast("تم تثبيت برنامج الكاشير على سطح المكتب بنجاح! 🎉");
                }
                deferredPwaPrompt = null;
            } else {
                if (await downloadStandalonePosApp()) showToast("تم تنزيل ملف البرنامج المستقل على جهازك لتثبيته وتشغيله مباشرة!");
            }
        }

        async function downloadStandalonePosApp() {
            // النسخة المستقلة جاهزة كملف واحد بجانب الصفحة: restaurant_pos.html
            if (!document.querySelector('script[src="js/app.js"]')) {
                showToast('أنت بالفعل على النسخة المستقلة، احتفظ بهذا الملف واستخدمه مباشرة');
                return false;
            }
            const name = 'restaurant_pos.html';
            try {
                if (location.protocol.indexOf('http') === 0) {
                    const r = await fetch(name, { method: 'HEAD', cache: 'no-store' });
                    if (!r.ok) throw new Error('missing');
                }
                const a = document.createElement('a');
                a.href = name;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                playPosSound('checkout');
                return true;
            } catch (e) {
                showToast('ملف النسخة المستقلة (restaurant_pos.html) غير موجود بجانب الصفحة', true);
                return false;
            }
        }

        function copyAppModeCommand() {
            const input = document.getElementById('app-shortcut-cmd');
            input.select();
            document.execCommand('copy');
            showToast("تم نسخ أمر تشغيل البرنامج المستقل إلى الحافظة!");
        }

        // إعدادات الصوت
        let soundMuted = localStorage.getItem('pos_sound_muted') === 'true';

        // بيانات الشفت الحالي
        let currentShift = JSON.parse(localStorage.getItem('pos_current_shift')) || {
            cashierId: CASHIERS[0] ? CASHIERS[0].id : 1,
            cashierName: CASHIERS[0] ? CASHIERS[0].name : "أحمد حسام",
            startTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            openingFloat: 500.00,
            totalSales: 0.00,
            cashSales: 0.00,
            cardSales: 0.00,
            splitSales: 0.00,
            totalTax: 0.00,
            orderCount: 0
        };

        let enteredPin = "";
        let cart = [];
        let orderType = 'dine-in';
        let selectedTable = TABLES[0] ? TABLES[0].id : 'T-01';
        let discount = 0;
        let customDeliveryFeeApplied = false;
        let heldOrders = JSON.parse(localStorage.getItem('pos_held_orders')) || [];
        let deliveryCustomer = { name: '', phone: '', address: '', zoneId: DELIVERY_ZONES[0]?.id || 'z1', fee: 0.00, zoneName: 'سعر يدوي' };
        let activePaymentMethod = 'cash';
        let currentTicketId = computeNextTicketId();
        let currentCategory = 'all';
        let lastPreviewedOrder = null;

        // حالة نافذة تخصيص الوجبة (Modifiers Modal State)
        let modCurrentItem = null;
        let modSelectedSize = null;
        let modSelectedExtras = [];
        let modQty = 1;

        // ========================================================
        // المؤثرات الصوتية التفاعلية (Web Audio API Synthesizer)
        // ========================================================
        function playPosSound(type = 'beep') {
            if (soundMuted) return;
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                if (type === 'beep') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(820, ctx.currentTime);
                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.07);
                } else if (type === 'checkout') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.35);
                }
            } catch (e) {}
        }

        function toggleSoundMute() {
            soundMuted = !soundMuted;
            localStorage.setItem('pos_sound_muted', soundMuted);
            updateSoundIcon();
            showToast(soundMuted ? "تم كتم المؤثرات الصوتية" : "تم تفعيل المؤثرات الصوتية");
            if (!soundMuted) playPosSound('beep');
        }

        function updateSoundIcon() {
            const icon = document.getElementById('sound-icon');
            const btn = document.getElementById('sound-toggle-btn');
            if (!icon || !btn) return;
            if (soundMuted) {
                icon.className = "fa-solid fa-volume-xmark text-slate-400";
            } else {
                icon.className = "fa-solid fa-volume-high text-emerald-600 dark:text-emerald-400";
            }
        }

        function toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
                document.getElementById('fullscreen-icon').className = "fa-solid fa-compress";
            } else {
                document.exitFullscreen().catch(() => {});
                document.getElementById('fullscreen-icon').className = "fa-solid fa-expand";
            }
        }

        // نظام التأكيد المخصص (بديل confirm)
        function showConfirmModal(title, message, onConfirmCallback) {
            document.getElementById('confirm-modal-title').textContent = title;
            document.getElementById('confirm-modal-msg').textContent = message;
            const yesBtn = document.getElementById('confirm-modal-yes-btn');
            yesBtn.onclick = () => {
                closeModal('custom-confirm-modal');
                onConfirmCallback();
            };
            openModal('custom-confirm-modal');
        }

        function initTheme() {
            const savedTheme = localStorage.getItem('pos_theme') || 'dark';
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.getElementById('theme-icon').className = 'fa-solid fa-sun text-amber-400';
            } else {
                document.documentElement.classList.remove('dark');
                document.getElementById('theme-icon').className = 'fa-solid fa-moon text-slate-600';
            }
        }

        function toggleDarkMode() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('pos_theme', isDark ? 'dark' : 'light');
            document.getElementById('theme-icon').className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
            showToast(isDark ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع النهاري");
        }


        // ================= المستخدمون والصلاحيات (مدير / كاشير) =================
        let currentUser = null;
        let loginPick = null, loginPin = '', loginFails = 0, loginLockUntil = 0;
        const isManager = () => !!currentUser && currentUser.role === 'manager';
        function requireManager() {
            if (isManager()) return true;
            showToast('هذه الصلاحية للمدير فقط', true);
            return false;
        }
        function ensureRoles() {
            let changed = false;
            CASHIERS.forEach(c => { if (!c.role) { c.role = 'cashier'; changed = true; } });
            if (!CASHIERS.some(c => c.role === 'manager' && c.active !== false)) {
                const pin = /^\d{4}$/.test(String(SETTINGS.adminPin || '')) ? String(SETTINGS.adminPin) : '1234';
                CASHIERS.push({ id: Date.now(), name: 'المدير', phone: '', pin, role: 'manager', active: true });
                changed = true;
            }
            if (changed) localStorage.setItem('pos_cashiers', JSON.stringify(CASHIERS));
        }
        function initAuthSession() {
            ensureRoles();
            let u = null;
            try {
                const id = sessionStorage.getItem('pos_session_user');
                if (id) u = CASHIERS.find(c => String(c.id) === id && c.active !== false);
            } catch (e) {}
            if (u) currentUser = { id: u.id, name: u.name, role: u.role };
            applyRoleUI();
            if (!u) showLogin();
            startOnlineOrders();
        }
        function applyRoleUI() {
            const m = isManager();
            ['btn-admin-panel', 'btn-data-center'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = m ? '' : 'none';
            });
            const n = document.getElementById('session-user-name');
            if (n) n.textContent = currentUser ? currentUser.name : '';
        }
        function switchSessionTo(user) {
            currentUser = { id: user.id, name: user.name, role: user.role || 'cashier' };
            try { sessionStorage.setItem('pos_session_user', String(user.id)); } catch (e) {}
            applyRoleUI();
        }
        function lockSession() {
            currentUser = null;
            try { sessionStorage.removeItem('pos_session_user'); } catch (e) {}
            applyRoleUI();
            closeAllModals();
            showLogin();
        }
        function setLoginHint(t) { const el = document.getElementById('login-hint'); if (el) el.textContent = t || ''; }
        function showLogin() {
            loginPick = null; loginPin = '';
            renderLogin();
            setLoginHint('اختار اسمك');
            document.getElementById('login-overlay').classList.remove('hidden');
        }
        function renderLogin() {
            const users = CASHIERS.filter(c => c.active !== false);
            document.getElementById('login-users').innerHTML = users.map(u => {
                const on = loginPick === u.id;
                const cls = on ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                               : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-400';
                return `<button onclick="loginPickUser(${Number(u.id)})" class="p-3 rounded-xl border text-xs font-bold transition ${cls}"><i class="fa-solid ${u.role === 'manager' ? 'fa-user-shield' : 'fa-user-tie'} block text-base mb-1"></i>${esc(u.name)}<span class="block text-[10px] font-normal opacity-70">${u.role === 'manager' ? 'مدير' : 'كاشير'}</span></button>`;
            }).join('');
            const k = 'h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-lg font-bold text-slate-900 dark:text-white transition active:scale-95';
            const keys = ['1','2','3','4','5','6','7','8','9'].map(d => `<button onclick="loginKey('${d}')" class="${k}">${d}</button>`).join('');
            document.getElementById('login-pad').innerHTML = keys +
                `<button onclick="loginPin='';renderLoginDots()" class="${k} !text-rose-500 !text-xs">مسح</button><button onclick="loginKey('0')" class="${k}">0</button><button onclick="loginBack()" class="${k}"><i class="fa-solid fa-delete-left"></i></button>`;
            renderLoginDots();
        }
        function renderLoginDots() {
            document.getElementById('login-dots').innerHTML = [0, 1, 2, 3].map(i =>
                `<span class="w-3.5 h-3.5 rounded-full border-2 ${i < loginPin.length ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400 dark:border-slate-600'} transition-all"></span>`).join('');
        }
        function loginPickUser(id) { loginPick = id; loginPin = ''; renderLogin(); setLoginHint('اكتب الرمز السري'); }
        function loginBack() { loginPin = loginPin.slice(0, -1); renderLoginDots(); }
        function loginKey(d) {
            if (loginPick === null) { setLoginHint('اختار اسمك الأول'); return; }
            if (Date.now() < loginLockUntil) { setLoginHint('محاولات كتير، استنى شوية'); return; }
            if (loginPin.length < 4) loginPin += d;
            renderLoginDots();
            if (loginPin.length === 4) setTimeout(checkLogin, 120);
        }
        function checkLogin() {
            const u = CASHIERS.find(c => c.id === loginPick);
            if (u && String(u.pin) === loginPin) { loginFails = 0; completeLogin(u); return; }
            loginFails++;
            if (loginFails >= 5) { loginLockUntil = Date.now() + 30000; loginFails = 0; setLoginHint('محاولات كتير، استنى 30 ثانية'); }
            else setLoginHint('الرمز السري غير صحيح');
            loginPin = ''; renderLoginDots(); playPosSound('beep');
        }
        function completeLogin(u) {
            switchSessionTo(u);
            document.getElementById('login-overlay').classList.add('hidden');
            if (u.role !== 'manager' && currentShift.cashierId !== u.id) {
                if (currentShift.orderCount === 0) {
                    currentShift.cashierId = u.id; currentShift.cashierName = u.name;
                    localStorage.setItem('pos_current_shift', JSON.stringify(currentShift));
                    updateCashierDisplay();
                } else {
                    showToast(`الوردية الحالية باسم ${currentShift.cashierName}، استخدم "تسليم شفت" لاستلامها`, true);
                }
            }
            playPosSound('checkout');
            showToast(`أهلاً ${u.name}`);
        }
        document.addEventListener('keydown', e => {
            const ov = document.getElementById('login-overlay');
            if (!ov || ov.classList.contains('hidden')) return;
            if (/^\d$/.test(e.key)) loginKey(e.key); else if (e.key === 'Backspace') loginBack();
        });

        // ================= طلبات الأونلاين (Firebase Firestore) =================
        let ONLINE_CFG = (() => { try { return JSON.parse(localStorage.getItem('pos_online_cfg')) || {}; } catch (e) { return {}; } })();
        const ONLINE_DEFAULT_CONFIG = { apiKey: 'AIzaSyBHNroK0Q4VUkCpdL3TmWLde4Mcd7zFQog', authDomain: 'casher-system-44995.firebaseapp.com', projectId: 'casher-system-44995', storageBucket: 'casher-system-44995.firebasestorage.app', messagingSenderId: '793412140592', appId: '1:793412140592:web:bd1ecebee358573685f7f5' };
        ONLINE_CFG = { enabled: false, config: ONLINE_DEFAULT_CONFIG, collection: 'orders', email: '', password: '', ...ONLINE_CFG };
        let onlineOrders = [], onlineUnsub = null, onlineFB = null, onlineDb = null, onlineFirstSnap = true, onlineStatus = 'off', currentOnlineOrderId = null;
        async function onlineLoadFB() {
            if (onlineFB) return onlineFB;
            const V = 'https://www.gstatic.com/firebasejs/10.12.2/';
            const [app, auth, fs] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]);
            onlineFB = { app, auth, fs };
            return onlineFB;
        }
        function setOnlineStatus(st, detail = '') {
            onlineStatus = st;
            const map = { off: ['غير مفعّل', 'text-slate-400'], connecting: ['جاري الاتصال…', 'text-amber-500'], on: ['متصل', 'text-emerald-500'], offline: ['لا يوجد إنترنت', 'text-rose-500'], error: ['تعذر الاتصال', 'text-rose-500'] };
            const el = document.getElementById('online-status');
            if (el) { el.textContent = map[st][0] + (detail ? ` (${detail})` : ''); el.className = 'text-[11px] font-bold ' + map[st][1]; }
        }
        function stopOnlineOrders() { if (onlineUnsub) { try { onlineUnsub(); } catch (e) {} onlineUnsub = null; } }
        async function startOnlineOrders() {
            stopOnlineOrders();
            const c = ONLINE_CFG;
            if (!c.enabled || !c.config || !c.config.apiKey || !c.config.projectId || !c.email || !c.password) { setOnlineStatus('off'); return; }
            if (!navigator.onLine) { setOnlineStatus('offline'); return; }
            setOnlineStatus('connecting');
            try {
                const { app, auth, fs } = await onlineLoadFB();
                onlineFB = { app, auth, fs };
                const a = app.getApps().find(x => x.name === 'pos-online') || app.initializeApp(c.config, 'pos-online');
                await auth.signInWithEmailAndPassword(auth.getAuth(a), c.email, c.password);
                onlineDb = fs.getFirestore(a);
                onlineFirstSnap = true;
                onlineUnsub = fs.onSnapshot(fs.query(fs.collection(onlineDb, ONLINE_CFG.collection || 'orders'), fs.where('status', '==', 'new')), snap => {
                    const fresh = [];
                    snap.docChanges().forEach(ch => { if (ch.type === 'added' && !onlineFirstSnap) fresh.push(ch.doc.id); });
                    onlineOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                        .sort((x, y) => ((x.createdAt && x.createdAt.seconds) || 0) - ((y.createdAt && y.createdAt.seconds) || 0));
                    const wasFirst = onlineFirstSnap;
                    onlineFirstSnap = false;
                    updateOnlineBadge();
                    if (!document.getElementById('online-orders-modal').classList.contains('hidden')) renderOnlineOrders();
                    if (fresh.length) { playPosSound('checkout'); showToast(`🌐 وصل ${fresh.length} طلب أونلاين جديد`); }
                    else if (wasFirst && onlineOrders.length) showToast(`🌐 عندك ${onlineOrders.length} طلب أونلاين في الانتظار`);
                }, err => setOnlineStatus('error', err && err.code));
                setOnlineStatus('on');
            } catch (e) { setOnlineStatus('error', e && (e.code || e.message)); }
        }
        window.addEventListener('online', () => startOnlineOrders());
        window.addEventListener('offline', () => setOnlineStatus('offline'));
        function onlineSetStatus(id, status) {
            if (!onlineFB || !onlineDb) return Promise.reject(new Error('not connected'));
            const fs = onlineFB.fs;
            return fs.updateDoc(fs.doc(onlineDb, ONLINE_CFG.collection || 'orders', id), { status });
        }
        function updateOnlineBadge() {
            const b = document.getElementById('online-count-badge');
            if (!b) return;
            b.textContent = onlineOrders.length;
            b.classList.toggle('animate-pulse', onlineOrders.length > 0);
        }
        function openOnlineOrdersModal() {
            const box = document.getElementById('online-settings');
            box.classList.toggle('hidden', !isManager());
            if (isManager()) {
                const cfg = ONLINE_CFG.config || {};
                document.getElementById('online-cfg-json').value = cfg.apiKey ? JSON.stringify(cfg, null, 2) : '';
                document.getElementById('online-cfg-col').value = ONLINE_CFG.collection || 'orders';
                document.getElementById('online-cfg-email').value = ONLINE_CFG.email || '';
                document.getElementById('online-cfg-pass').value = ONLINE_CFG.password || '';
                document.getElementById('online-cfg-enabled').checked = !!ONLINE_CFG.enabled;
            }
            setOnlineStatus(onlineStatus);
            renderOnlineOrders();
            openModal('online-orders-modal');
        }
        function parseFirebaseConfig(txt) {
            const cfg = {};
            for (const m of String(txt).matchAll(/["']?(apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId|measurementId)["']?\s*:\s*["']([^"']+)["']/g)) cfg[m[1]] = m[2];
            return cfg;
        }
        function saveOnlineSettings() {
            if (!requireManager()) return;
            const cfg = parseFirebaseConfig(document.getElementById('online-cfg-json').value);
            const email = document.getElementById('online-cfg-email').value.trim();
            const password = document.getElementById('online-cfg-pass').value;
            const enabled = document.getElementById('online-cfg-enabled').checked;
            const collection = document.getElementById('online-cfg-col').value.trim() || 'orders';
            if (!/^[A-Za-z0-9_-]+$/.test(collection)) { showToast('اسم المجموعة لازم يكون حروف إنجليزي وأرقام فقط', true); return; }
            if (enabled && (!cfg.apiKey || !cfg.projectId || !email || !password)) { showToast('اكمل إعدادات الربط (الـ config والإيميل والباسورد)', true); return; }
            ONLINE_CFG = { enabled, config: cfg, collection, email, password };
            localStorage.setItem('pos_online_cfg', JSON.stringify(ONLINE_CFG));
            onlineOrders = []; updateOnlineBadge(); renderOnlineOrders();
            startOnlineOrders();
            showToast('تم حفظ إعدادات الأونلاين');
        }
        function renderOnlineOrders() {
            const box = document.getElementById('online-orders-list');
            if (!onlineOrders.length) {
                box.innerHTML = `<div class="text-center text-slate-400 py-10 text-sm"><i class="fa-solid fa-inbox text-3xl block mb-2"></i>${onlineStatus === 'on' ? 'لا توجد طلبات أونلاين جديدة' : 'الربط مع الموقع غير متصل حالياً'}</div>`;
                return;
            }
            box.innerHTML = onlineOrders.map(o => {
                const cu = o.customer || {};
                const t = o.createdAt && o.createdAt.toMillis ? new Date(o.createdAt.toMillis()).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '';
                const items = (o.items || []).map(i => `<li>${esc(i.qty)} × ${esc(i.name)} <span class="text-slate-400">— ${esc((Number(i.qty) || 0) * (Number(i.price) || 0))}</span></li>`).join('');
                const fee = o.deliveryFee == null ? 'يُتفق عليه' : `${esc(o.deliveryFee)} ${SETTINGS.currency}`;
                return `<div class="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50/50 dark:bg-sky-500/5 p-3 space-y-2 text-xs">
                    <div class="flex items-center justify-between"><b class="text-slate-900 dark:text-white text-sm">${esc(cu.name || 'عميل')} • <span dir="ltr">${esc(cu.phone || '')}</span></b><span class="text-slate-400">${esc(t)}</span></div>
                    <div class="text-slate-600 dark:text-slate-300"><i class="fa-solid fa-location-dot text-rose-500"></i> ${esc(cu.area || '')} — ${esc(cu.address || '')}</div>
                    <ul class="list-disc pr-5 text-slate-700 dark:text-slate-200">${items}</ul>
                    ${o.note ? `<div class="text-amber-600 dark:text-amber-400">ملاحظة: ${esc(o.note)}</div>` : ''}
                    <div class="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                        <span class="text-slate-500">التوصيل: ${fee} • الإجمالي: <b class="text-emerald-600 dark:text-emerald-400 text-sm">${esc(o.total)} ${SETTINGS.currency}</b></span>
                        <span class="space-x-1 space-x-reverse">
                            <button onclick="acceptOnlineOrder('${esc(o.id)}')" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black">قبول وفتح الفاتورة</button>
                            <button onclick="rejectOnlineOrder('${esc(o.id)}')" class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold">رفض</button>
                        </span>
                    </div></div>`;
            }).join('');
        }
        async function acceptOnlineOrder(id) {
            const o = onlineOrders.find(x => x.id === id);
            if (!o) return;
            try { await onlineSetStatus(id, 'preparing'); }
            catch (e) { showToast('تعذر قبول الطلب، تأكد من اتصال الإنترنت', true); return; }
            if (cart.length > 0) holdCurrentOrder();
            const items = (o.items || []).map((it, k) => ({ id: 'web-' + Date.now() + '-' + k, name: String(it.name || 'صنف'), price: Number(it.price) || 0, qty: Math.max(1, Number(it.qty) || 1), notes: '', lineId: nextLineId() }));
            if (o.note && items[0]) items[0].notes = 'ملاحظة العميل: ' + o.note;
            cart = items; discount = 0;
            const cu = o.customer || {};
            deliveryCustomer = { ...freshDeliveryCustomer(), name: cu.name || '', phone: cu.phone || '', address: cu.address || '', zoneName: cu.area || 'سعر يدوي', fee: Number(o.deliveryFee) || 0 };
            const z = DELIVERY_ZONES.find(zz => zz.name === cu.area);
            if (z) deliveryCustomer.zoneId = z.id;
            customDeliveryFeeApplied = true;
            currentOnlineOrderId = id;
            orderType = 'delivery';
            setOrderType('delivery');
            updateCartCustomerCardUI();
            closeModal('online-orders-modal');
            sendCurrentOrderToKDS();
            if (o.deliveryFee == null) showToast('رسوم التوصيل "هنتفق عليها"، حددها من بيانات العميل', true);
        }
        function rejectOnlineOrder(id) {
            showConfirmModal('رفض الطلب', 'هل تريد رفض هذا الطلب الأونلاين؟', async () => {
                try { await onlineSetStatus(id, 'rejected'); showToast('تم رفض الطلب'); }
                catch (e) { showToast('تعذر تنفيذ العملية، تأكد من الاتصال', true); }
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            initTheme();
            updateSoundIcon();
            applyBrandSettings();
            updateCashierDisplay();
            renderCategoriesBar();
            renderTablesSelect();
            renderDeliveryZonesSelect();
            renderProducts(MENU_ITEMS);
            updateCartUI();
            updateHeldBadge();
            updateKdsBadge();
            startLiveClock();
            setupDesktopPWA();
            hydrateStateFromIndexedDB().catch(() => {}).finally(() => initAuthSession());
            // تحديث عدادات شاشة المطبخ وخريطة الصالة كل ثانية
            setInterval(() => {
                if (activeWorkspace === 'kds') renderKdsWorkspace();
                if (activeWorkspace === 'floor') renderFloorWorkspace();
            }, 1000);
            document.getElementById('ticket-id').innerText = currentTicketId;

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeAllModals();
                } else if (e.key === 'Enter' && !isAnyModalOpen()) {
                    if (cart.length > 0) openPaymentModal();
                } else if (e.key === '/') {
                    const searchBox = document.getElementById('search-input');
                    if (document.activeElement !== searchBox && !isAnyModalOpen()) {
                        e.preventDefault();
                        searchBox.focus();
                    }
                }
            });
        });

        // ==============================================================
        // التبديل بين الشاشات: الكاشير (POS) / خريطة الصالة / المطبخ (KDS)
        // ==============================================================
        function switchMainWorkspace(ws) {
            activeWorkspace = ws;
            const posEl = document.getElementById('workspace-pos');
            const floorEl = document.getElementById('workspace-floor');
            const kdsEl = document.getElementById('workspace-kds');

            const btnPos = document.getElementById('ws-btn-pos');
            const btnFloor = document.getElementById('ws-btn-floor');
            const btnKds = document.getElementById('ws-btn-kds');

            [posEl, floorEl, kdsEl].forEach(el => el.classList.add('hidden'));
            [btnPos, btnFloor, btnKds].forEach(b => {
                b.className = "relative px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5";
            });

            if (ws === 'pos') {
                posEl.classList.remove('hidden');
                btnPos.className = "px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm transition flex items-center gap-1.5";
            } else if (ws === 'floor') {
                floorEl.classList.remove('hidden');
                btnFloor.className = "px-3 py-1.5 rounded-lg bg-teal-600 text-white shadow-sm transition flex items-center gap-1.5";
                renderFloorWorkspace();
            } else if (ws === 'kds') {
                kdsEl.classList.remove('hidden');
                btnKds.className = "relative px-3 py-1.5 rounded-lg bg-orange-600 text-white shadow-sm transition flex items-center gap-1.5";
                renderKdsWorkspace();
            }
        }

        // ==============================================================
        // نظام شاشة المطبخ اللحظية (Interactive KDS)
        // ==============================================================
        function createKdsTicketFromOrder(id, typeLabel, itemsList) {
            // تجنب تكرار نفس التذكرة إذا كانت مرسلة مسبقاً للمطبخ
            const existing = KDS_ORDERS.find(k => k.ticketId === id && k.status !== 'completed');
            if (existing) {
                const pool = existing.items.slice();
                existing.items = itemsList.map(it => {
                    const notes = it.notes || '';
                    const hit = pool.findIndex(p => p.done && p.name === it.name && p.qty === it.qty && p.notes === notes);
                    if (hit >= 0) pool.splice(hit, 1);
                    return { name: it.name, qty: it.qty, notes, done: hit >= 0 };
                });
                if (existing.status === 'ready' && existing.items.some(x => !x.done)) existing.status = 'preparing';
                localStorage.setItem('pos_kds_orders', JSON.stringify(KDS_ORDERS));
                updateKdsBadge();
                return;
            }
            const newKds = {
                kdsId: Date.now() + Math.floor(Math.random() * 1000),
                ticketId: id,
                typeLabel: typeLabel,
                createdAt: Date.now(),
                status: 'preparing', // preparing | ready | completed
                items: itemsList.map(it => ({
                    name: it.name,
                    qty: it.qty,
                    notes: it.notes || '',
                    done: false
                }))
            };
            KDS_ORDERS.push(newKds);
            localStorage.setItem('pos_kds_orders', JSON.stringify(KDS_ORDERS));
            updateKdsBadge();
        }

        function sendCurrentOrderToKDS() {
            if (cart.length === 0) {
                showToast("السلة فارغة! أضف أصنافاً لإرسالها للمطبخ", true);
                return;
            }
            let typeLabel = `صالة (${selectedTable})`;
            if (orderType === 'takeaway') typeLabel = "سفري (تيك أواي)";
            if (orderType === 'delivery') typeLabel = `دليفري (${deliveryCustomer.name || 'عميل'})`;

            createKdsTicketFromOrder(currentTicketId, typeLabel, cart);
            playPosSound('checkout');
            showToast(`تم إرسال الطلب #${currentTicketId} إلى شاشة المطبخ KDS بنجاح 🔥`);
        }

        function updateKdsBadge() {
            const activeCount = KDS_ORDERS.filter(k => k.status !== 'completed').length;
            const badge = document.getElementById('kds-active-badge');
            if (badge) badge.textContent = activeCount;
        }

        function formatElapsedMinSec(createdAt) {
            const diffSec = Math.max(0, Math.floor((Date.now() - createdAt) / 1000));
            const mins = Math.floor(diffSec / 60);
            const secs = diffSec % 60;
            return {
                text: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
                mins: mins
            };
        }

        function renderKdsWorkspace() {
            const grid = document.getElementById('kds-tickets-grid');
            if (!grid) return;
            const activeTickets = KDS_ORDERS.filter(k => k.status !== 'completed');

            if (activeTickets.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full h-80 flex flex-col items-center justify-center text-slate-500">
                        <i class="fa-solid fa-kitchen-set text-5xl mb-3 text-slate-700"></i>
                        <p class="text-base font-bold text-slate-400">لا توجد طلبات قيد التحضير في المطبخ حالياً</p>
                        <p class="text-xs text-slate-600 mt-1">عند إرسال طلب من الكاشير أو إتمام الدفع سيظهر هنا فوراً</p>
                    </div>
                `;
                return;
            }

            grid.innerHTML = '';
            activeTickets.forEach(ticket => {
                const elapsed = formatElapsedMinSec(ticket.createdAt);
                let headerBg = "bg-emerald-600";
                let borderCol = "border-emerald-500/40";
                if (ticket.status === 'ready') {
                    headerBg = "bg-teal-600";
                    borderCol = "border-teal-400";
                } else if (elapsed.mins >= 10) {
                    headerBg = "bg-rose-600 animate-pulse";
                    borderCol = "border-rose-500";
                } else if (elapsed.mins >= 5) {
                    headerBg = "bg-amber-600";
                    borderCol = "border-amber-500/50";
                }

                const itemsHtml = ticket.items.map((it, idx) => `
                    <div onclick="toggleKdsItemDone(${ticket.kdsId}, ${idx})" class="p-2 rounded-xl border ${it.done ? 'bg-slate-900/40 border-slate-800 opacity-50 line-through' : 'bg-slate-900 border-slate-800 hover:border-slate-600'} cursor-pointer transition flex items-start justify-between gap-2">
                        <div>
                            <span class="font-bold text-xs text-white">${it.qty}x ${esc(it.name)}</span>
                            ${it.notes ? `<span class="block text-[11px] text-amber-400 font-semibold mt-0.5"><i class="fa-solid fa-triangle-exclamation ml-1"></i>${esc(it.notes)}</span>` : ''}
                        </div>
                        <span class="w-5 h-5 rounded-md flex items-center justify-center text-xs ${it.done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'}">
                            <i class="fa-solid fa-check"></i>
                        </span>
                    </div>
                `).join('');

                const card = document.createElement('div');
                card.className = `bg-slate-950 rounded-2xl border-2 ${borderCol} overflow-hidden flex flex-col justify-between shadow-xl`;
                card.innerHTML = `
                    <div>
                        <div class="${headerBg} px-4 py-2.5 text-white flex items-center justify-between">
                            <div>
                                <span class="font-black text-sm block">طلب #${ticket.ticketId}</span>
                                <span class="text-[11px] opacity-90 font-bold">${esc(ticket.typeLabel)}</span>
                            </div>
                            <div class="text-left font-mono">
                                <span class="text-sm font-black bg-black/30 px-2.5 py-1 rounded-lg block">${elapsed.text}</span>
                            </div>
                        </div>
                        <div class="p-3 space-y-2 max-h-64 overflow-y-auto">
                            ${itemsHtml}
                        </div>
                    </div>
                    <div class="p-3 bg-slate-900/90 border-t border-slate-800 flex gap-2">
                        ${ticket.status === 'preparing' ? `
                            <button onclick="updateKdsStatus(${ticket.kdsId}, 'ready')" class="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-bell"></i> جاهز للتسليم
                            </button>
                        ` : `
                            <button onclick="updateKdsStatus(${ticket.kdsId}, 'completed')" class="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-check-double"></i> تم التسليم (إغلاق)
                            </button>
                        `}
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        function toggleKdsItemDone(kdsId, itemIdx) {
            const t = KDS_ORDERS.find(k => k.kdsId === kdsId);
            if (!t || !t.items[itemIdx]) return;
            t.items[itemIdx].done = !t.items[itemIdx].done;
            localStorage.setItem('pos_kds_orders', JSON.stringify(KDS_ORDERS));
            playPosSound('beep');
            renderKdsWorkspace();
        }

        function updateKdsStatus(kdsId, newStatus) {
            const t = KDS_ORDERS.find(k => k.kdsId === kdsId);
            if (!t) return;
            t.status = newStatus;
            localStorage.setItem('pos_kds_orders', JSON.stringify(KDS_ORDERS));
            playPosSound('checkout');
            updateKdsBadge();
            renderKdsWorkspace();
            if (newStatus === 'ready') showToast(`الطلب #${t.ticketId} جاهز للتسليم الآن 🔔`);
            if (newStatus === 'completed') showToast(`تم تسليم وأرشفة الطلب #${t.ticketId}`);
        }

        function clearCompletedKdsTickets() {
            KDS_ORDERS = KDS_ORDERS.filter(k => k.status === 'preparing');
            localStorage.setItem('pos_kds_orders', JSON.stringify(KDS_ORDERS));
            updateKdsBadge();
            renderKdsWorkspace();
            showToast("تم تنظيف الشاشة من الطلبات الجاهزة");
        }

        // ==============================================================
        // خريطة الصالة والطاولات التفاعلية (Interactive Visual Floor Map)
        // ==============================================================
        function renderFloorWorkspace() {
            const grid = document.getElementById('floor-map-grid');
            if (!grid) return;

            let freeCount = 0;
            let occCount = 0;
            let resCount = 0;

            grid.innerHTML = '';

            TABLES.forEach(tbl => {
                // فحص ما إذا كانت الطاولة عليها طلب معلق أو هي الطاولة النشطة وفيها سلة
                const heldOrder = heldOrders.find(h => h.type === 'dine-in' && h.table === tbl.id);
                const isCurrentActiveWithCart = (orderType === 'dine-in' && selectedTable === tbl.id && cart.length > 0);
                const isReserved = RESERVED_TABLES.includes(tbl.id);

                let status = 'free';
                let statusBadge = 'متاحة الآن';
                let borderStyle = 'border-emerald-500/40 hover:border-emerald-500 bg-white dark:bg-slate-900';
                let iconColor = 'text-emerald-500 bg-emerald-500/10';
                let billAmount = '0.00';
                let timeInfo = 'جاهزة لاستقبال ضيوف';

                if (heldOrder || isCurrentActiveWithCart) {
                    status = 'occupied';
                    occCount++;
                    statusBadge = 'مشغولة • فاتورة نشطة';
                    borderStyle = 'border-rose-500 bg-rose-500/5 dark:bg-rose-950/20 shadow-lg shadow-rose-500/10';
                    iconColor = 'text-rose-500 bg-rose-500/20';
                    billAmount = heldOrder ? heldOrder.total : document.getElementById('summary-grand-total').textContent;
                    timeInfo = heldOrder ? `منذ ${heldOrder.time}` : 'قيد الطلب بالكاشير الآن';
                } else if (isReserved) {
                    status = 'reserved';
                    resCount++;
                    statusBadge = 'محجوزة مسبقاً';
                    borderStyle = 'border-amber-500/60 bg-amber-500/5 dark:bg-amber-950/20';
                    iconColor = 'text-amber-500 bg-amber-500/20';
                    timeInfo = 'حجز مؤكد للعملاء';
                } else {
                    freeCount++;
                }

                // رسم الكراسي البصري حول الطاولة
                let chairsDots = '';
                for (let c = 0; c < Math.min(tbl.capacity, 8); c++) {
                    chairsDots += `<span class="w-2.5 h-2.5 rounded-full ${status === 'occupied' ? 'bg-rose-500' : (status === 'reserved' ? 'bg-amber-500' : 'bg-emerald-500/50')}"></span>`;
                }

                const card = document.createElement('div');
                card.className = `rounded-2xl border-2 ${borderStyle} p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1`;
                card.innerHTML = `
                    <div>
                        <div class="flex items-start justify-between gap-2 mb-3">
                            <div class="flex items-center gap-2.5">
                                <div class="w-12 h-12 rounded-2xl ${iconColor} flex items-center justify-center text-lg font-black">
                                    ${tbl.id}
                                </div>
                                <div>
                                    <h4 class="font-black text-sm text-slate-900 dark:text-white">${esc(tbl.label)}</h4>
                                    <span class="text-[11px] text-slate-400 flex items-center gap-1">
                                        <i class="fa-solid fa-users text-[10px]"></i> سعة ${tbl.capacity} كراسي
                                    </span>
                                </div>
                            </div>
                            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full ${status === 'occupied' ? 'bg-rose-500 text-white' : (status === 'reserved' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500/10 text-emerald-500')}">
                                ${statusBadge}
                            </span>
                        </div>

                        <!-- تمثيل الكراسي البصري -->
                        <div class="my-3 py-2.5 px-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/70 flex items-center justify-between">
                            <div class="flex items-center gap-1.5">${chairsDots}</div>
                            <span class="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">${timeInfo}</span>
                        </div>
                    </div>

                    <div class="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                        ${status === 'occupied' ? `
                            <div>
                                <span class="text-[10px] text-slate-400 block">الحساب الجاري</span>
                                <span class="text-sm font-black font-mono text-rose-500">${billAmount} ${SETTINGS.currency}</span>
                            </div>
                            <button onclick="selectTableFromFloorMap('${tbl.id}')" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition shadow">
                                فتح الفاتورة / الدفع
                            </button>
                        ` : `
                            <button onclick="toggleTableReservation('${tbl.id}')" class="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-500/10 text-[11px] font-bold transition">
                                <i class="fa-regular fa-bookmark ml-1 text-amber-500"></i> ${isReserved ? 'إلغاء الحجز' : 'حجز'}
                            </button>
                            <button onclick="selectTableFromFloorMap('${tbl.id}')" class="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition shadow">
                                <i class="fa-solid fa-plus ml-1"></i> فتح طلب جديد
                            </button>
                        `}
                    </div>
                `;
                grid.appendChild(card);
            });

            document.getElementById('floor-stat-free').textContent = freeCount;
            document.getElementById('floor-stat-occupied').textContent = occCount;
            document.getElementById('floor-stat-reserved').textContent = resCount;
        }

        function toggleTableReservation(tableId) {
            if (RESERVED_TABLES.includes(tableId)) {
                RESERVED_TABLES = RESERVED_TABLES.filter(id => id !== tableId);
                showToast(`تم إلغاء حجز الطاولة ${tableId}`);
            } else {
                RESERVED_TABLES.push(tableId);
                showToast(`تم تعليم الطاولة ${tableId} كمحجوزة`);
            }
            localStorage.setItem('pos_reserved_tables', JSON.stringify(RESERVED_TABLES));
            renderFloorWorkspace();
        }

        function selectTableFromFloorMap(tableId) {
            // إذا كانت الطاولة عليها فاتورة معلقة، نسترجعها فوراً للكاشير
            const heldIdx = heldOrders.findIndex(h => h.type === 'dine-in' && h.table === tableId);
            if (heldIdx >= 0) {
                const order = heldOrders.splice(heldIdx, 1)[0];
                localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
                cart = order.items;
                updateHeldBadge();
            }

            selectedTable = tableId;
            document.getElementById('table-select').value = tableId;
            setOrderType('dine-in');
            RESERVED_TABLES = RESERVED_TABLES.filter(id => id !== tableId);
            localStorage.setItem('pos_reserved_tables', JSON.stringify(RESERVED_TABLES));
            switchMainWorkspace('pos');
            updateCartUI();
            showToast(`تم اختيار الطاولة ${tableId} في شاشة الكاشير`);
        }

        function applyBrandSettings() {
            document.getElementById('header-restaurant-name').textContent = SETTINGS.resName;
            document.getElementById('tax-label-text').textContent = `ضريبة القيمة المضافة (${SETTINGS.taxRate}%):`;
        }

        function updateCashierDisplay() {
            document.getElementById('current-cashier-display').textContent = currentShift.cashierName;
        }

        function startLiveClock() {
            const clockEl = document.getElementById('live-clock');
            const dateEl = document.getElementById('live-date');
            
            const updateTime = () => {
                const now = new Date();
                clockEl.textContent = now.toLocaleTimeString('ar-EG', { hour12: true });
                dateEl.textContent = now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
            };
            updateTime();
            setInterval(updateTime, 1000);
        }

        // ========================================================
        // محرك الطباعة الحرارية الموحد (80mm Thermal Print Engine)
        // ========================================================

        function showThermalPreviewModal(title, htmlContent, orderObj = null) {
            lastPreviewedOrder = orderObj;
            const waBtn = document.getElementById('whatsapp-receipt-btn');
            if (waBtn) {
                waBtn.style.display = orderObj ? 'flex' : 'none';
            }
            document.getElementById('preview-modal-title').innerHTML = `<i class="fa-solid fa-print text-emerald-600"></i> <span>${title}</span>`;
            document.getElementById('receipt-printable').innerHTML = htmlContent;
            document.getElementById('print-area').innerHTML = htmlContent;
            openModal('receipt-modal');
        }

        function sendCurrentReceiptWhatsApp() {
            if (!lastPreviewedOrder) {
                showToast("هذه الميزة متاحة لفواتير الطلبات!", true);
                return;
            }
            sendOrderWhatsApp(lastPreviewedOrder);
        }

        function sendOrderWhatsApp(orderObj) {
            let lines = [];
            lines.push(`*${SETTINGS.resName}* 🍔`);
            lines.push(`🧾 *فاتورة رقم:* #${orderObj.id}`);
            lines.push(`📅 *التاريخ:* ${orderObj.date}`);
            lines.push(`🛵 *نوع الطلب:* ${orderObj.type}`);
            if (orderObj.customerAddress) {
                lines.push(`📍 *العنوان:* ${orderObj.customerAddress}`);
            }
            lines.push(`────────────────`);
            orderObj.items.forEach(it => {
                lines.push(`▪ ${it.qty}x *${it.name}* — ${(it.price * it.qty).toFixed(2)} ${SETTINGS.currency}`);
                if (it.notes) lines.push(`   _(${it.notes})_`);
            });
            lines.push(`────────────────`);
            lines.push(`المجموع الفرعي: ${orderObj.subtotal.toFixed(2)} ${SETTINGS.currency}`);
            lines.push(`الضريبة (${SETTINGS.taxRate}%): ${orderObj.tax.toFixed(2)} ${SETTINGS.currency}`);
            if (orderObj.deliveryFee > 0) {
                lines.push(`خدمة التوصيل: ${orderObj.deliveryFee.toFixed(2)} ${SETTINGS.currency}`);
            }
            if (orderObj.discount > 0) {
                lines.push(`الخصم: -${orderObj.discount.toFixed(2)} ${SETTINGS.currency}`);
            }
            lines.push(`💰 *الإجمالي المستحق: ${orderObj.total.toFixed(2)} ${SETTINGS.currency}*`);
            lines.push(`\n${SETTINGS.resFooter}`);

            const text = encodeURIComponent(lines.join('\n'));
            let phone = (orderObj.customerPhone || '').replace(/\D/g, '');
            if (phone.startsWith('01')) phone = '2' + phone;
            const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
            window.open(url, '_blank');
        }

        function executeThermalPrint() {
            const content = document.getElementById('receipt-printable').innerHTML;
            const printArea = document.getElementById('print-area');
            printArea.innerHTML = content;

            // استدعاء الطباعة المباشرة للصفحة عبر @media print
            window.print();
            showToast("تم إرسال الإيصال إلى الطابعة الحرارية");
        }

        function downloadThermalSlipAsHtml() {
            const content = document.getElementById('receipt-printable').innerHTML;
            const closeScriptTag = '<' + '/script>';
            const fullHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>إيصال طباعة حراري 80mm</title><link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com">${closeScriptTag}<style>body{font-family:'Cairo',monospace;width:80mm;margin:10px auto;padding:10px;border:1px dashed #ccc;background:#fff;color:#000;}</style></head><body onload="window.print()">${content}</body></html>`;
            const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `thermal-receipt-${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("تم تحميل ملف الإيصال بنجاح");
        }

        // توليد قالب إيصال العميل الحراري (80mm)
        function generateOrderReceiptHTML(orderObj) {
            let itemsRows = '';
            orderObj.items.forEach(item => {
                itemsRows += `
                    <div class="grid grid-cols-6 text-[11px] py-0.5 border-b border-dotted border-gray-200">
                        <div class="col-span-3 pr-1">
                            <span class="font-bold block">${esc(item.name)}</span>
                            ${item.notes ? `<span class="text-[9px] text-gray-600 block">* ${esc(item.notes)}</span>` : ''}
                        </div>
                        <span class="text-center font-bold">${item.qty}</span>
                        <span class="text-center">${Number(item.price).toFixed(0)}</span>
                        <span class="text-left font-bold col-span-1">${(item.price * item.qty).toFixed(0)}</span>
                    </div>
                `;
            });

            const methodLabel = orderObj.method === 'cash' ? 'نقدي (كاش)' : (orderObj.method === 'card' ? 'فيزا / شبكة' : 'دفع مختلط');

            return `
                <div class="text-center pb-3 border-b-2 border-dashed border-gray-800">
                    <h2 class="font-black text-base tracking-tight">${esc(SETTINGS.resName)}</h2>
                    <p class="text-[11px] text-gray-700">${esc(SETTINGS.resAddress)}</p>
                    <p class="text-[10px] text-gray-600">${esc(SETTINGS.resTaxNumber)}</p>
                    <p class="text-[11px] text-gray-700 font-bold">هاتف: ${esc(SETTINGS.resPhone)}</p>
                </div>

                <div class="py-2.5 border-b border-dashed border-gray-800 space-y-1 text-[11px]">
                    <div class="flex justify-between">
                        <span>رقم الفاتورة:</span>
                        <span class="font-black text-sm">#${orderObj.id}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>التاريخ والوقت:</span>
                        <span>${esc(orderObj.date)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>نوع الطلب:</span>
                        <span class="font-bold">${esc(orderObj.type)}</span>
                    </div>
                    ${orderObj.customerName || orderObj.customerPhone ? `
                    <div class="flex justify-between">
                        <span>بيانات العميل:</span>
                        <span class="font-bold">${esc(orderObj.customerName || '')} ${orderObj.customerPhone ? '(' + orderObj.customerPhone + ')' : ''}</span>
                    </div>` : ''}
                    ${orderObj.customerAddress ? `
                    <div class="flex justify-between">
                        <span>عنوان التوصيل:</span>
                        <span class="font-bold text-left max-w-[170px]">${esc(orderObj.customerAddress)}</span>
                    </div>` : ''}
                    <div class="flex justify-between">
                        <span>طريقة الدفع:</span>
                        <span class="font-bold">${methodLabel}</span>
                    </div>
                    <div class="flex justify-between font-bold">
                        <span>الكاشير المسؤول:</span>
                        <span>${esc(orderObj.cashier)}</span>
                    </div>
                </div>

                <div class="py-2 border-b border-dashed border-gray-800">
                    <div class="grid grid-cols-6 font-black pb-1 text-[10px] border-b border-gray-400">
                        <span class="col-span-3">الصنف</span>
                        <span class="text-center">الكمية</span>
                        <span class="text-center">السعر</span>
                        <span class="text-left col-span-1">الإجمالي</span>
                    </div>
                    <div class="divide-y divide-dotted divide-gray-300 pt-1">
                        ${itemsRows}
                    </div>
                </div>

                <div class="py-2.5 border-b-2 border-dashed border-gray-800 space-y-1 text-[11px]">
                    <div class="flex justify-between">
                        <span>المجموع الفرعي:</span>
                        <span class="font-bold">${orderObj.subtotal.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>ضريبة القيمة المضافة (${SETTINGS.taxRate}%):</span>
                        <span class="font-bold">${orderObj.tax.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    ${orderObj.deliveryFee > 0 ? `
                    <div class="flex justify-between">
                        <span>خدمة التوصيل:</span>
                        <span class="font-bold">${orderObj.deliveryFee.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>` : ''}
                    ${orderObj.discount > 0 ? `
                    <div class="flex justify-between">
                        <span>الخصم المطبق:</span>
                        <span class="font-bold">- ${orderObj.discount.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>` : ''}
                    <div class="flex justify-between font-black text-sm pt-1.5 border-t border-gray-800">
                        <span>الإجمالي النهائي:</span>
                        <span>${orderObj.total.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                </div>

                <div class="text-center pt-3 space-y-1.5">
                    <div class="py-1 flex justify-center">
                        <div class="border border-black p-1.5 rounded inline-block">
                            <span class="font-mono text-[10px] font-bold tracking-widest block">INV-${orderObj.id}-${new Date().getFullYear()}</span>
                        </div>
                    </div>
                    <p class="text-[10px] font-bold">${esc(SETTINGS.resFooter)}</p>
                </div>
            `;
        }

        // توليد قالب تقرير الشفت والوردية الحراري (Z-Report / Shift Handover 80mm)
        function generateShiftReportHTML(shiftData) {
            const diff = shiftData.actualCash - shiftData.expectedCash;
            let diffLabel = "0.00 (مطابق تماماً)";
            if (diff > 0) diffLabel = `+ ${diff.toFixed(2)} ${SETTINGS.currency} (فائض)`;
            if (diff < 0) diffLabel = `- ${Math.abs(diff).toFixed(2)} ${SETTINGS.currency} (عجز)`;

            return `
                <div class="text-center pb-3 border-b-2 border-dashed border-gray-800">
                    <h2 class="font-black text-base">${esc(SETTINGS.resName)}</h2>
                    <p class="text-xs font-extrabold mt-0.5 bg-gray-100 py-1 rounded border border-gray-400">
                        ${esc(shiftData.reportTitle || 'تقرير مبيعات وتقفيل الوردية (Z-Report)')}
                    </p>
                    <p class="text-[10px] text-gray-600 mt-1">تاريخ الطباعة: ${esc(shiftData.printTime)}</p>
                </div>

                <div class="py-2.5 border-b border-dashed border-gray-800 space-y-1 text-[11px]">
                    <div class="flex justify-between">
                        <span>الكاشير المسؤول:</span>
                        <span class="font-black">${esc(shiftData.cashierName)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>بداية الوردية:</span>
                        <span class="font-bold">${esc(shiftData.startTime)}</span>
                    </div>
                    ${shiftData.nextCashier ? `
                    <div class="flex justify-between">
                        <span>الكاشير المستلم:</span>
                        <span class="font-black">${esc(shiftData.nextCashier)}</span>
                    </div>` : ''}
                    <div class="flex justify-between">
                        <span>إجمالي عدد الفواتير:</span>
                        <span class="font-black">${shiftData.orderCount} فاتورة</span>
                    </div>
                </div>

                <div class="py-2.5 border-b border-dashed border-gray-800 space-y-1.5 text-[11px]">
                    <p class="font-black text-[10px] underline mb-1">تفاصيل المبيعات والتحصيل:</p>
                    <div class="flex justify-between">
                        <span>عهدة بداية الدرج (Opening):</span>
                        <span class="font-bold">${shiftData.openingFloat.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>مبيعات نقدي (كاش):</span>
                        <span class="font-bold">${shiftData.cashSales.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>مبيعات فيزا / شبكة:</span>
                        <span class="font-bold">${shiftData.cardSales.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>إجمالي الضرائب المحصلة:</span>
                        <span class="font-bold">${shiftData.totalTax.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between font-black text-xs pt-1 border-t border-gray-400">
                        <span>إجمالي مبيعات الوردية:</span>
                        <span>${shiftData.totalSales.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                </div>

                <div class="py-2.5 border-b-2 border-dashed border-gray-800 space-y-1 text-[11px]">
                    <p class="font-black text-[10px] underline mb-1">مطابقة الصندوق النقدي (الدرج):</p>
                    <div class="flex justify-between font-bold">
                        <span>المفروض تواجده بالدرج:</span>
                        <span>${shiftData.expectedCash.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between font-bold">
                        <span>الجرد الفعلي المعدود:</span>
                        <span>${shiftData.actualCash.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between font-black pt-1 border-t border-gray-400">
                        <span>الفارق (عجز / زيادة):</span>
                        <span>${diffLabel}</span>
                    </div>
                </div>

                <div class="pt-4 space-y-4 text-[10px]">
                    <div class="flex justify-between items-center">
                        <span>توقيع الكاشير المسلم:</span>
                        <span>.........................</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span>توقيع المدير / المستلم:</span>
                        <span>.........................</span>
                    </div>
                    <p class="text-center text-[9px] text-gray-500 pt-2">تم استخراج التقرير آلياً من نظام Smart POS</p>
                </div>
            `;
        }

        // فتح معاينة وطباعة تقرير الشفت (سواء من نافذة التقرير أو نافذة التسليم)
        function openShiftPrintPreview(mode) {
            const expectedCash = currentShift.openingFloat + currentShift.cashSales;
            let actualCash = expectedCash;
            let nextName = null;
            let reportTitle = "تقرير مبيعات الوردية (Z-Report)";

            if (mode === 'handover') {
                actualCash = parseFloat(document.getElementById('actual-cash-input').value);
                if (isNaN(actualCash)) actualCash = expectedCash;
                const nextSelect = document.getElementById('next-cashier-select');
                if (nextSelect && nextSelect.options[nextSelect.selectedIndex]) {
                    nextName = nextSelect.options[nextSelect.selectedIndex].getAttribute('data-name') || nextSelect.options[nextSelect.selectedIndex].text;
                }
                reportTitle = "بوليصة تسليم واستلام الوردية";
            }

            const shiftPayload = {
                reportTitle: reportTitle,
                printTime: new Date().toLocaleString('ar-EG'),
                cashierName: currentShift.cashierName,
                startTime: currentShift.startTime,
                nextCashier: nextName,
                orderCount: currentShift.orderCount,
                openingFloat: currentShift.openingFloat,
                cashSales: currentShift.cashSales,
                cardSales: currentShift.cardSales,
                totalTax: currentShift.totalTax,
                totalSales: currentShift.totalSales,
                expectedCash: expectedCash,
                actualCash: actualCash
            };

            const html = generateShiftReportHTML(shiftPayload);
            showThermalPreviewModal(reportTitle, html);
        }

        // ============================================
        // إدارة الشفتات وتغيير الكاشير (Shift Handover)
        // ============================================

        function openEndShiftModal() {
            document.getElementById('shift-modal-cashier-name').textContent = currentShift.cashierName;
            document.getElementById('shift-modal-start-time').textContent = currentShift.startTime;
            document.getElementById('shift-modal-opening-float').textContent = `${currentShift.openingFloat.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-modal-cash-sales').textContent = `${currentShift.cashSales.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-modal-card-sales').textContent = `${currentShift.cardSales.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-modal-split-sales').textContent = `${(currentShift.splitSales || 0).toFixed(2)} ${SETTINGS.currency}`;

            const expectedCash = currentShift.openingFloat + currentShift.cashSales;
            document.getElementById('shift-modal-expected-cash').textContent = `${expectedCash.toFixed(2)} ${SETTINGS.currency}`;

            document.getElementById('actual-cash-input').value = expectedCash.toFixed(2);
            calculateShiftDifference();

            // ملء قائمة الكاشيرية للاختيار التالي
            const nextSelect = document.getElementById('next-cashier-select');
            nextSelect.innerHTML = '';
            CASHIERS.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.setAttribute('data-name', c.name);
                opt.textContent = c.name + (c.name === currentShift.cashierName ? " (تجديد وردية)" : "");
                if (c.name !== currentShift.cashierName && ! nextSelect.value) {
                    opt.selected = true;
                }
                nextSelect.appendChild(opt);
            });
            document.getElementById('next-opening-float').value = 500;
            fillDefaultCashierPinHint();

            openModal('end-shift-modal');
        }

        function fillDefaultCashierPinHint() {
            const nextId = parseInt(document.getElementById('next-cashier-select').value);
            const c = CASHIERS.find(x => x.id === nextId);
            // لا نعرض الرمز السري ولا نملأه تلقائياً: الكاشير المستلم يكتبه بنفسه
            document.getElementById('pin-hint-text').textContent = '';
            document.getElementById('next-cashier-pin-input').value = '';
        }

        function calculateShiftDifference() {
            const expectedCash = currentShift.openingFloat + currentShift.cashSales;
            const actualCash = parseFloat(document.getElementById('actual-cash-input').value) || 0;
            const diff = actualCash - expectedCash;

            const diffEl = document.getElementById('shift-diff-amount');
            const diffBox = document.getElementById('shift-diff-box');

            if (Math.abs(diff) < 0.01) {
                diffEl.textContent = `0.00 ${SETTINGS.currency} (العهدة متطابقة تماماً)`;
                diffEl.className = "font-mono font-black text-sm text-emerald-600 dark:text-emerald-400";
                diffBox.className = "p-3 rounded-xl border border-dashed flex justify-between items-center font-bold bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800";
            } else if (diff > 0) {
                diffEl.textContent = `+ ${diff.toFixed(2)} ${SETTINGS.currency} (فائض في الدرج)`;
                diffEl.className = "font-mono font-black text-sm text-blue-600 dark:text-blue-400";
                diffBox.className = "p-3 rounded-xl border border-dashed flex justify-between items-center font-bold bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800";
            } else {
                diffEl.textContent = `- ${Math.abs(diff).toFixed(2)} ${SETTINGS.currency} (عجز في العهدة!)`;
                diffEl.className = "font-mono font-black text-sm text-rose-600 dark:text-rose-400";
                diffBox.className = "p-3 rounded-xl border border-dashed flex justify-between items-center font-bold bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800";
            }
        }

        function confirmShiftHandover() {
            const nextCashierId = parseInt(document.getElementById('next-cashier-select').value);
            const nextCashier = CASHIERS.find(c => c.id === nextCashierId);
            const nextOpeningRaw = parseFloat(document.getElementById('next-opening-float').value);
            const nextOpening = isNaN(nextOpeningRaw) ? 500 : Math.max(0, nextOpeningRaw);
            const enteredNextPin = document.getElementById('next-cashier-pin-input').value.trim();

            if (!nextCashier) {
                showToast("يرجى اختيار الكاشير المستلم!", true);
                return;
            }

            if (enteredNextPin !== nextCashier.pin) {
                showToast(`الرمز السري للكاشير (${nextCashier.name}) غير صحيح!`, true);
                return;
            }

            const expectedCash = currentShift.openingFloat + currentShift.cashSales;
            const actualRaw = parseFloat(document.getElementById('actual-cash-input').value);
            const actualCash = isNaN(actualRaw) ? expectedCash : actualRaw;

            // حفظ الوردية المغلقة في الأرشيف
            const closedShiftRecord = {
                id: Date.now(),
                reportTitle: "بوليصة إغلاق وتسليم وردية",
                printTime: new Date().toLocaleString('ar-EG'),
                cashierName: currentShift.cashierName,
                nextCashier: nextCashier.name,
                startTime: currentShift.startTime,
                endTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                orderCount: currentShift.orderCount,
                openingFloat: currentShift.openingFloat,
                cashSales: currentShift.cashSales,
                cardSales: currentShift.cardSales,
                totalTax: currentShift.totalTax,
                totalSales: currentShift.totalSales,
                expectedCash: expectedCash,
                actualCash: actualCash
            };

            SHIFTS_HISTORY.push(closedShiftRecord);
            localStorage.setItem('pos_shifts_history', JSON.stringify(SHIFTS_HISTORY));

            // إعداد الشفت الجديد
            currentShift = {
                cashierId: nextCashier.id,
                cashierName: nextCashier.name,
                startTime: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                openingFloat: nextOpening,
                totalSales: 0.00,
                cashSales: 0.00,
                cardSales: 0.00,
                splitSales: 0.00,
                totalTax: 0.00,
                orderCount: 0
            };

            localStorage.setItem('pos_current_shift', JSON.stringify(currentShift));
            updateCashierDisplay();
            switchSessionTo(nextCashier);
            closeModal('end-shift-modal');

            // فتح معاينة البوليصة للطباعة تلقائياً بعد التسليم
            const html = generateShiftReportHTML(closedShiftRecord);
            showThermalPreviewModal("بوليصة تسليم الوردية المعتمدة", html);
            showToast(`تم تسليم الشفت بنجاح إلى الكاشير: ${nextCashier.name}`);
        }

        function openShiftReportModal() {
            const expectedCash = currentShift.openingFloat + currentShift.cashSales;
            document.getElementById('zreport-cashier-subtitle').textContent = `الكاشير الحالي: ${currentShift.cashierName} | بدأ منذ: ${currentShift.startTime}`;
            document.getElementById('shift-total-sales').textContent = `${currentShift.totalSales.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-total-orders').textContent = currentShift.orderCount;
            document.getElementById('shift-cash-sales').textContent = `${currentShift.cashSales.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-card-sales').textContent = `${currentShift.cardSales.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-opening-float-box').textContent = `${currentShift.openingFloat.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-tax-sales').textContent = `${currentShift.totalTax.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('shift-expected-drawer').textContent = `${expectedCash.toFixed(2)} ${SETTINGS.currency}`;
            openModal('shift-modal');
        }

        function recordOrderToShift(grandTotal, vat, method, cashPart = 0, cardPart = 0) {
            currentShift.totalSales += grandTotal;
            currentShift.orderCount += 1;
            currentShift.totalTax += vat;
            if (method === 'card') {
                currentShift.cardSales += grandTotal;
            } else if (method === 'split') {
                currentShift.cashSales += cashPart;
                currentShift.cardSales += cardPart;
                currentShift.splitSales = (currentShift.splitSales || 0) + grandTotal;
            } else {
                currentShift.cashSales += grandTotal;
            }
            localStorage.setItem('pos_current_shift', JSON.stringify(currentShift));
        }

        // ==========================
        // وظائف الواجهة والمنيو
        // ==========================

        function renderCategoriesBar() {
            const container = document.getElementById('categories-container');
            container.innerHTML = `
                <button onclick="selectCategory('all')" class="cat-pill ${currentCategory === 'all' ? 'active bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'} px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition" data-cat="all">
                    <i class="fa-solid fa-border-all ml-1.5"></i> الكل (<span id="count-all">${MENU_ITEMS.length}</span>)
                </button>
            `;

            CATEGORIES.forEach(cat => {
                const btn = document.createElement('button');
                const isActive = currentCategory === cat.key;
                btn.className = `cat-pill ${isActive ? 'active bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm'} px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition`;
                btn.dataset.cat = cat.key;
                btn.onclick = () => selectCategory(cat.key);
                btn.innerHTML = `${esc(cat.icon || '🏷️')} ${esc(cat.name)}`;
                container.appendChild(btn);
            });
        }

        function renderTablesSelect() {
            const select = document.getElementById('table-select');
            select.innerHTML = '';
            TABLES.forEach(tbl => {
                const opt = document.createElement('option');
                opt.value = tbl.id;
                opt.textContent = `${tbl.label} (${tbl.capacity} أفراد)`;
                opt.className = "bg-white dark:bg-slate-900 text-slate-900 dark:text-white";
                select.appendChild(opt);
            });
            if (TABLES.length > 0) {
                if (!TABLES.some(t => t.id === selectedTable)) selectedTable = TABLES[0].id;
                select.value = selectedTable;
                if (orderType === 'dine-in') {
                    document.getElementById('badge-order-type').innerText = `صالة - ${selectedTable}`;
                }
            }
        }

        function renderProducts(items) {
            const grid = document.getElementById('products-grid');
            const noResults = document.getElementById('no-results');
            const countAll = document.getElementById('count-all');
            if (countAll) countAll.innerText = MENU_ITEMS.length;

            grid.innerHTML = '';
            if (items.length === 0) {
                noResults.classList.remove('hidden');
                return;
            }
            noResults.classList.add('hidden');

            items.forEach(item => {
                const isAvail = item.available !== false;
                const card = document.createElement('div');
                card.className = `group relative bg-white dark:bg-slate-900 border ${isAvail ? 'border-slate-200 dark:border-slate-800/90 hover:border-emerald-500 cursor-pointer hover:-translate-y-1' : 'border-rose-200 dark:border-rose-900/40 opacity-60 cursor-not-allowed'} rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg shadow-sm`;
                
                if (isAvail) {
                    card.onclick = (e) => {
                        if (e.target.closest('.quick-add-btn')) return;
                        openItemModifierModal(item);
                    };
                }

                card.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-3xl p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 group-hover:scale-110 transition duration-200">${esc(item.emoji || '🍽️')}</span>
                            <div class="flex flex-col items-end gap-1">
                                ${item.popular ? '<span class="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">الأكثر طلباً 🔥</span>' : ''}
                                <span class="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">خيارات وأحجام</span>
                                ${!isAvail ? '<span class="bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-500/20">غير متوفر بالمطبخ</span>' : ''}
                            </div>
                        </div>
                        <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors line-clamp-1">${esc(item.name)}</h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">${esc(item.desc || '')}</p>
                    </div>

                    <div class="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
                        <div>
                            <span class="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">${Number(item.price).toFixed(2)}</span>
                            <span class="text-[10px] text-slate-400">${SETTINGS.currency}</span>
                        </div>
                        <button onclick="quickAddById(${Number(item.id)})" ${isAvail ? '' : 'disabled'} title="إضافة سريعة مباشرة" class="quick-add-btn w-8 h-8 rounded-xl ${isAvail ? 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 text-slate-700 dark:text-slate-300 hover:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'} flex items-center justify-center transition active:scale-90 font-bold shadow-sm">
                            <i class="fa-solid fa-plus text-xs"></i>
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // =========================================================
        // نافذة تخصيص الوجبة (الأحجام والإضافات المدفوعة)
        // =========================================================
        function getSizesForCategory(cat, basePrice) {
            if (cat === 'burger' || cat === 'shawarma') {
                return [
                    { name: 'سنجل / عادي', delta: 0 },
                    { name: 'دبل (+45 ج)', delta: 45 },
                    { name: 'تريبل (+85 ج)', delta: 85 }
                ];
            } else if (cat === 'pizza') {
                return [
                    { name: 'وسط (Medium)', delta: 0 },
                    { name: 'كبير (+40 ج)', delta: 40 },
                    { name: 'عائلي (+75 ج)', delta: 75 }
                ];
            } else {
                return [
                    { name: 'حجم عادي', delta: 0 },
                    { name: 'حجم كبير (+30 ج)', delta: 30 }
                ];
            }
        }

        function openItemModifierModal(item) {
            modCurrentItem = item;
            modQty = 1;
            modSelectedExtras = [];
            const sizes = getSizesForCategory(item.category, item.price);
            modSelectedSize = sizes[0];

            document.getElementById('mod-item-emoji').textContent = item.emoji || '🍔';
            document.getElementById('mod-item-title').textContent = item.name;
            document.getElementById('mod-item-base-price').textContent = `السعر الأساسي: ${item.price.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('mod-custom-note').value = '';
            document.getElementById('mod-qty-val').textContent = '1';

            // بناء أزرار الأحجام
            const sizesGrid = document.getElementById('mod-sizes-grid');
            sizesGrid.innerHTML = '';
            sizes.forEach((sz, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `mod-size-btn p-2.5 rounded-xl border text-center font-bold transition ${idx === 0 ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'}`;
                btn.innerHTML = `<span class="block text-[11px]">${esc(sz.name)}</span>`;
                btn.onclick = () => {
                    modSelectedSize = sz;
                    document.querySelectorAll('.mod-size-btn').forEach(b => {
                        b.className = 'mod-size-btn p-2.5 rounded-xl border text-center font-bold transition border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300';
                    });
                    btn.className = 'mod-size-btn p-2.5 rounded-xl border text-center font-bold transition border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                    updateModFinalPrice();
                };
                sizesGrid.appendChild(btn);
            });

            // بناء أزرار الإضافات المدفوعة
            const extrasGrid = document.getElementById('mod-extras-grid');
            extrasGrid.innerHTML = '';
            GLOBAL_EXTRAS.forEach(ex => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = ' p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex items-center justify-between font-semibold transition';
                btn.innerHTML = `
                    <span class="truncate text-[11px]">${esc(ex.name)}</span>
                    <span class="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">+${ex.price}</span>
                `;
                btn.onclick = () => {
                    const exists = modSelectedExtras.find(e => e.id === ex.id);
                    if (exists) {
                        modSelectedExtras = modSelectedExtras.filter(e => e.id !== ex.id);
                        btn.className = 'p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex items-center justify-between font-semibold transition';
                    } else {
                        modSelectedExtras.push(ex);
                        btn.className = 'p-2.5 rounded-xl border border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center justify-between font-bold transition';
                    }
                    updateModFinalPrice();
                };
                extrasGrid.appendChild(btn);
            });

            updateModFinalPrice();
            openModal('modifier-modal');
        }

        function appendModNote(txt) {
            const inp = document.getElementById('mod-custom-note');
            inp.value = inp.value.trim() ? `${inp.value.trim()}، ${txt}` : txt;
        }

        function changeModQty(delta) {
            modQty = Math.max(1, modQty + delta);
            document.getElementById('mod-qty-val').textContent = modQty;
            updateModFinalPrice();
        }

        function updateModFinalPrice() {
            if (!modCurrentItem) return;
            const sizeDelta = modSelectedSize ? modSelectedSize.delta : 0;
            const extrasSum = modSelectedExtras.reduce((a, b) => a + b.price, 0);
            const unitPrice = modCurrentItem.price + sizeDelta + extrasSum;
            const total = unitPrice * modQty;
            document.getElementById('mod-final-price').textContent = `${total.toFixed(2)} ${SETTINGS.currency}`;
        }

        function confirmAddCustomizedItem() {
            if (!modCurrentItem) return;
            const sizeDelta = modSelectedSize ? modSelectedSize.delta : 0;
            const extrasSum = modSelectedExtras.reduce((a, b) => a + b.price, 0);
            const unitPrice = modCurrentItem.price + sizeDelta + extrasSum;

            let displayName = modCurrentItem.name;
            if (modSelectedSize && modSelectedSize.delta > 0) {
                displayName += ` (${modSelectedSize.name.split(' (')[0]})`;
            }

            let notesArr = [];
            if (modSelectedExtras.length > 0) {
                notesArr.push(modSelectedExtras.map(e => e.name).join(' + '));
            }
            const customNote = document.getElementById('mod-custom-note').value.trim();
            if (customNote) notesArr.push(customNote);
            const combinedNotes = notesArr.join(' | ');

            cart.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: displayName,
                price: unitPrice,
                qty: modQty,
                notes: combinedNotes
            });

            playPosSound('beep');
            closeModal('modifier-modal');
            updateCartUI();
            showToast(`أُضيف: ${displayName}`);
        }

        function selectCategory(catKey) {
            currentCategory = catKey;
            document.querySelectorAll('.cat-pill').forEach(btn => {
                if (btn.dataset.cat === catKey) {
                    btn.className = "cat-pill active px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20";
                } else {
                    btn.className = "cat-pill px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm";
                }
            });

            if (catKey === 'all') {
                renderProducts(MENU_ITEMS);
            } else {
                const filtered = MENU_ITEMS.filter(it => it.category === catKey);
                renderProducts(filtered);
            }
        }

        function filterItems() {
            const query = document.getElementById('search-input').value.trim().toLowerCase();
            const clearBtn = document.getElementById('clear-search-btn');
            
            if (query.length > 0) {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }

            const results = MENU_ITEMS.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.desc.toLowerCase().includes(query) ||
                item.id.toString().includes(query)
            );
            renderProducts(results);
        }

        function clearSearch() {
            const input = document.getElementById('search-input');
            input.value = '';
            filterItems();
            input.focus();
        }

        function addToCart(product) {
            if (product.available === false) {
                showToast('هذا الصنف غير متوفر حالياً', true);
                return;
            }
            const existing = cart.find(i => i.id === product.id && !i.notes);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    qty: 1,
                    notes: ''
                });
            }
            playPosSound('beep');
            showToast(`أُضيف: ${product.name}`);
            updateCartUI();
        }

        function updateQty(lineId, delta) {
            const item = cart.find(i => i.lineId === lineId);
            if (!item) return;
            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.lineId !== lineId);
            }
            updateCartUI();
        }

        function removeItem(lineId) {
            cart = cart.filter(i => i.lineId !== lineId);
            updateCartUI();
        }

        function promptNotes(lineId) {
            const item = cart.find(i => i.lineId === lineId);
            if (!item) return;
            document.getElementById('note-modal-item-id').value = lineId;
            document.getElementById('note-modal-item-name').textContent = `ملاحظات: ${item.name}`;
            document.getElementById('note-modal-input').value = item.notes || '';
            openModal('item-note-modal');
            setTimeout(() => document.getElementById('note-modal-input').focus(), 100);
        }

        function addQuickNoteTag(tagText) {
            const input = document.getElementById('note-modal-input');
            if (input.value.trim()) {
                input.value = input.value.trim() + '، ' + tagText;
            } else {
                input.value = tagText;
            }
        }

        function saveItemNoteModal() {
            const lineId = Number(document.getElementById('note-modal-item-id').value);
            const item = cart.find(i => i.lineId === lineId);
            if (item) {
                item.notes = document.getElementById('note-modal-input').value.trim();
                updateCartUI();
                showToast("تم حفظ ملاحظة الوجبة");
            }
            closeModal('item-note-modal');
        }

        function updateCartUI() {
            cart.forEach(i => { if (!i.lineId) i.lineId = nextLineId(); });
            const emptyState = document.getElementById('empty-cart-state');
            const itemsContainer = document.getElementById('cart-items');
            
            if (cart.length === 0) {
                emptyState.classList.remove('hidden');
                itemsContainer.innerHTML = '';
            } else {
                emptyState.classList.add('hidden');
                itemsContainer.innerHTML = '';

                cart.forEach(item => {
                    const row = document.createElement('div');
                    row.className = "bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-300 dark:hover:border-slate-700 transition";
                    
                    row.innerHTML = `
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">${esc(item.name)}</h5>
                                <button onclick="removeItem(${item.lineId})" class="text-slate-400 hover:text-rose-500 p-1 text-xs transition">
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">${(item.price * item.qty).toFixed(2)} ${SETTINGS.currency}</span>
                                <span class="text-[10px] text-slate-400 font-mono">(${item.price.toFixed(2)})</span>
                                ${item.notes ? `<span class="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800/50 truncate max-w-[120px]"><i class="fa-solid fa-pencil text-[9px] mr-1"></i>${esc(item.notes)}</span>` : ''}
                            </div>
                        </div>

                        <div class="flex items-center gap-1.5 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg">
                            <button onclick="promptNotes(${item.lineId})" title="ملاحظة" class="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-amber-500 text-xs">
                                <i class="fa-regular fa-comment-dots"></i>
                            </button>
                            <button onclick="updateQty(${item.lineId}, -1)" class="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold transition">
                                -
                            </button>
                            <span class="w-6 text-center text-xs font-mono font-bold text-slate-800 dark:text-white">${item.qty}</span>
                            <button onclick="updateQty(${item.lineId}, 1)" class="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold transition">
                                +
                            </button>
                        </div>
                    `;
                    itemsContainer.appendChild(row);
                });
            }

            const { subtotal, vat, delivery: currentDelivery, total: grandTotal } = calculateTotals();

            document.getElementById('summary-subtotal').textContent = `${subtotal.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('summary-tax').textContent = `${vat.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('summary-discount').textContent = `- ${discount.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('summary-grand-total').textContent = grandTotal.toFixed(2);

            const zoneLabelEl = document.getElementById('summary-delivery-zone-label');
            if (zoneLabelEl) {
                zoneLabelEl.textContent = currentDelivery > 0
                    ? `رسوم الدليفري (${deliveryCustomer.zoneName || 'مخصص'}):`
                    : `رسوم الدليفري (اضغط للتحديد):`;
            }
            const summaryDelivEl = document.getElementById('summary-delivery');
            if (summaryDelivEl) {
                summaryDelivEl.textContent = `${currentDelivery.toFixed(2)} ${SETTINGS.currency}`;
            }
        }

        // التحكم في أيقونة وإدخال سعر الدليفري اليدوي في السلة وفي شاشة تقفيل الشيك
        function toggleCartDeliveryInput() {
            const box = document.getElementById('cart-delivery-box');
            box.classList.toggle('hidden');
            if (!box.classList.contains('hidden')) {
                const inp = document.getElementById('cart-delivery-input');
                inp.value = deliveryCustomer.fee > 0 ? deliveryCustomer.fee : '';
                setTimeout(() => inp.focus(), 80);
            }
        }

        function applyCustomDeliveryFeeFromCart() {
            const val = parseFloat(document.getElementById('cart-delivery-input').value);
            setCustomDeliveryFee(isNaN(val) ? 0 : val);
            document.getElementById('cart-delivery-box').classList.add('hidden');
        }

        function setCustomDeliveryFee(amount) {
            const feeVal = Math.max(0, parseFloat(amount) || 0);
            deliveryCustomer.fee = feeVal;
            deliveryCustomer.zoneName = 'سعر يدوي';
            customDeliveryFeeApplied = feeVal > 0;

            if (feeVal > 0 && orderType !== 'delivery') {
                orderType = 'delivery';
                updateOrderTypeButtonsStyle('delivery');
            }

            const cartInp = document.getElementById('cart-delivery-input');
            if (cartInp) cartInp.value = feeVal > 0 ? feeVal : '';

            const checkoutInp = document.getElementById('checkout-delivery-fee-input');
            if (checkoutInp && document.activeElement !== checkoutInp) {
                checkoutInp.value = feeVal > 0 ? feeVal : '';
            }

            updateCartUI();
            refreshPaymentModalTotals();
            playPosSound('beep');
        }

        function toggleCheckoutDeliveryBox() {
            const box = document.getElementById('checkout-delivery-box');
            box.classList.toggle('hidden');
            if (!box.classList.contains('hidden')) {
                const inp = document.getElementById('checkout-delivery-fee-input');
                inp.value = deliveryCustomer.fee > 0 ? deliveryCustomer.fee : '';
                setTimeout(() => {
                    inp.focus();
                    inp.select();
                }, 80);
            }
        }

        function onCheckoutDeliveryFeeInput(val) {
            const feeVal = Math.max(0, parseFloat(val) || 0);
            deliveryCustomer.fee = feeVal;
            deliveryCustomer.zoneName = 'سعر يدوي';
            customDeliveryFeeApplied = feeVal > 0;

            if (feeVal > 0 && orderType !== 'delivery') {
                orderType = 'delivery';
                updateOrderTypeButtonsStyle('delivery');
            }
            updateCartUI();
            refreshPaymentModalTotals();
        }

        function refreshPaymentModalTotals() {
            const payModal = document.getElementById('payment-modal');
            if (!payModal || payModal.classList.contains('hidden')) return;

            const totalStr = document.getElementById('summary-grand-total').textContent;
            const numericTotal = parseFloat(totalStr) || 0;
            document.getElementById('modal-pay-amount').textContent = `${totalStr} ${SETTINGS.currency}`;

            const badge = document.getElementById('checkout-delivery-badge');
            const btnLabel = document.getElementById('checkout-delivery-btn-label');
            const currentFee = (orderType === 'delivery' || customDeliveryFeeApplied) ? (Number(deliveryCustomer.fee) || 0) : 0;

            if (currentFee > 0) {
                badge.textContent = `شامل خدمة دليفري: ${currentFee.toFixed(2)} ${SETTINGS.currency}`;
                badge.className = "text-[11px] text-amber-500 font-bold";
                btnLabel.textContent = `دليفري: ${currentFee} ج`;
            } else {
                badge.textContent = orderType === 'delivery' ? 'طلب دليفري (حدد سعر التوصيل 🛵)' : 'بدون رسوم توصيل';
                badge.className = "text-[11px] text-slate-400 font-semibold";
                btnLabel.textContent = 'سعر الدليفري';
            }

            // تحديث فئات النقدية السريعة والمبلغ المستلم
            const quickChips = document.getElementById('quick-cash-chips');
            if (quickChips) {
                quickChips.innerHTML = '';
                const denoms = [numericTotal, Math.ceil(numericTotal / 50) * 50, Math.ceil(numericTotal / 100) * 100, Math.ceil(numericTotal / 200) * 200];
                const uniqueDenoms = [...new Set(denoms)].filter(d => d >= numericTotal);
                uniqueDenoms.forEach(d => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = "flex-1 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-mono font-bold transition border border-slate-200 dark:border-slate-700";
                    chip.textContent = `${d} ج`;
                    chip.onclick = () => {
                        document.getElementById('received-amount-input').value = d;
                        calculateChange();
                    };
                    quickChips.appendChild(chip);
                });
            }

            document.getElementById('received-amount-input').value = numericTotal.toFixed(2);
            if (activePaymentMethod === 'split') {
                const half = (numericTotal / 2).toFixed(2);
                document.getElementById('split-cash-input').value = half;
                document.getElementById('split-card-input').value = (numericTotal - parseFloat(half)).toFixed(2);
            }
            calculateChange();
        }

        function updateOrderTypeButtonsStyle(type) {
            const tablePicker = document.getElementById('table-picker-container');
            const badgeOrderType = document.getElementById('badge-order-type');
            const custCard = document.getElementById('cart-customer-card');

            document.querySelectorAll('.order-type-btn').forEach(b => {
                b.className = "order-type-btn px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white";
            });

            if (type === 'dine-in') {
                document.getElementById('btn-dine-in').className = "order-type-btn px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 bg-emerald-600 text-white shadow-sm";
                tablePicker.style.display = 'flex';
                if (custCard) custCard.classList.add('hidden');
                badgeOrderType.innerText = `صالة - ${selectedTable}`;
                badgeOrderType.className = "text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30";
            } else if (type === 'takeaway') {
                document.getElementById('btn-takeaway').className = "order-type-btn px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 bg-emerald-600 text-white shadow-sm";
                tablePicker.style.display = 'none';
                if (custCard) custCard.classList.add('hidden');
                badgeOrderType.innerText = `سفري (تيك أواي)`;
                badgeOrderType.className = "text-xs bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/30";
            } else if (type === 'delivery') {
                document.getElementById('btn-delivery').className = "order-type-btn px-4 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-2 bg-emerald-600 text-white shadow-sm";
                tablePicker.style.display = 'none';
                if (custCard) custCard.classList.remove('hidden');
                updateCartCustomerCardUI();
                const feeDisplay = deliveryCustomer.fee ? `${deliveryCustomer.fee} ${SETTINGS.currency}` : 'سعر عند التقفيل';
                badgeOrderType.innerText = `دليفري (${deliveryCustomer.name || 'عميل'} - ${feeDisplay})`;
                badgeOrderType.className = "text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30";
            }
        }

        function updateCartCustomerCardUI() {
            const nameEl = document.getElementById('cart-cust-name');
            const phoneEl = document.getElementById('cart-cust-phone');
            const addrEl = document.getElementById('cart-cust-address');
            if (!nameEl) return;

            if (deliveryCustomer.name || deliveryCustomer.phone) {
                nameEl.textContent = deliveryCustomer.name || 'عميل دليفري';
                phoneEl.textContent = deliveryCustomer.phone ? `(${deliveryCustomer.phone})` : '';
                addrEl.textContent = deliveryCustomer.address || 'بدون عنوان مسجل';
            } else {
                nameEl.textContent = 'لم يتم تحديد العميل بعد';
                phoneEl.textContent = '';
                addrEl.textContent = 'اضغط على «بيانات العميل» للبحث برقم الهاتف أو الاسم...';
            }
        }

        function setOrderType(type) {
            orderType = type;
            if (type !== 'delivery') {
                customDeliveryFeeApplied = false;
                deliveryCustomer.fee = 0;
            } else if (!deliveryCustomer.fee) {
                deliveryCustomer.fee = 0;
            }
            updateOrderTypeButtonsStyle(type);
            if (type === 'delivery') {
                document.getElementById('cart-delivery-box').classList.remove('hidden');
                // فتح نافذة بيانات العميل تلقائياً إذا لم يكن هناك عميل مختار بعد
                if (!deliveryCustomer.phone && !deliveryCustomer.name) {
                    openDeliveryModal();
                }
            } else {
                document.getElementById('cart-delivery-box').classList.add('hidden');
            }
            updateCartUI();
        }

        function renderDeliveryZonesSelect() {
            const sel = document.getElementById('deliv-zone-select');
            if (!sel) return;
            sel.innerHTML = '';
            DELIVERY_ZONES.forEach(z => {
                const opt = document.createElement('option');
                opt.value = z.id;
                opt.textContent = `${z.name} (${z.fee} ${SETTINGS.currency})`;
                sel.appendChild(opt);
            });
        }

        function openDeliveryModal() {
            renderDeliveryZonesSelect();
            document.getElementById('deliv-phone').value = deliveryCustomer.phone || '';
            document.getElementById('deliv-name').value = deliveryCustomer.name || '';
            document.getElementById('deliv-address').value = deliveryCustomer.address || '';
            if (deliveryCustomer.zoneId) {
                document.getElementById('deliv-zone-select').value = deliveryCustomer.zoneId;
            }
            const customFeeInp = document.getElementById('deliv-custom-fee');
            if (customFeeInp) {
                customFeeInp.value = deliveryCustomer.fee !== undefined ? deliveryCustomer.fee : 0;
            }
            document.getElementById('crm-lookup-badge').classList.add('hidden');
            renderCrmSuggestionsList(CUSTOMERS_CRM.slice(0, 5));
            openModal('delivery-modal');
            setTimeout(() => document.getElementById('deliv-phone').focus(), 80);
        }

        function onDeliveryModalZoneChange(zoneId) {
            const z = DELIVERY_ZONES.find(x => x.id === zoneId);
            if (z) {
                document.getElementById('deliv-custom-fee').value = z.fee;
            }
        }

        // البحث التلقائي الذكي عن العميل سواء برقم الهاتف أو بالاسم
        function lookupCustomerSmart(queryVal, fieldType, sourceContext = 'modal') {
            const clean = queryVal.trim();

            if (sourceContext === 'checkout') {
                syncCheckoutCustomerEdits();
            }

            if (!clean) {
                if (sourceContext === 'modal') {
                    document.getElementById('crm-lookup-badge').classList.add('hidden');
                    renderCrmSuggestionsList(CUSTOMERS_CRM.slice(0, 4));
                } else {
                    document.getElementById('checkout-crm-badge').classList.add('hidden');
                }
                return;
            }

            // 1. مطابقة تامة برقم الهاتف أو الاسم لإكمال الحقول الأخرى فوراً
            const exactMatch = CUSTOMERS_CRM.find(c =>
                (fieldType === 'phone' && c.phone === clean) ||
                (fieldType === 'name' && c.name.trim().toLowerCase() === clean.toLowerCase())
            );

            if (exactMatch) {
                applyMatchedCustomerFields(exactMatch, fieldType, sourceContext);
            } else {
                if (sourceContext === 'modal') {
                    document.getElementById('crm-lookup-badge').classList.add('hidden');
                } else {
                    document.getElementById('checkout-crm-badge').classList.add('hidden');
                }
            }

            // 2. إظهار قائمة الاقتراحات الذكية أثناء الكتابة في نافذة الدليفري
            if (sourceContext === 'modal') {
                const matches = CUSTOMERS_CRM.filter(c =>
                    c.phone.includes(clean) ||
                    c.name.toLowerCase().includes(clean.toLowerCase()) ||
                    (c.address && c.address.toLowerCase().includes(clean.toLowerCase()))
                );
                renderCrmSuggestionsList(matches);
            }
        }

        function renderCrmSuggestionsList(list) {
            const box = document.getElementById('crm-suggestions-box');
            const container = document.getElementById('crm-suggestions-list');
            if (!box || !container) return;

            if (!list || list.length === 0) {
                box.classList.add('hidden');
                return;
            }

            box.classList.remove('hidden');
            container.innerHTML = list.map(c => `
                <button type="button" onclick="selectSuggestedCustomer('${esc(c.phone.replace(/'/g, "\\'"))}')" class="w-full text-right p-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-emerald-500/15 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 transition">
                    <div class="min-w-0">
                        <span class="font-bold text-slate-900 dark:text-white block truncate">${esc(c.name)}</span>
                        <span class="text-[10px] text-slate-500 dark:text-slate-400 block truncate">${esc(c.address || '')}</span>
                    </div>
                    <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px] shrink-0">${esc(c.phone)}</span>
                </button>
            `).join('');
        }

        function selectSuggestedCustomer(phone) {
            const found = CUSTOMERS_CRM.find(c => c.phone === phone);
            if (!found) return;
            applyMatchedCustomerFields(found, 'both', 'modal');
        }

        function applyMatchedCustomerFields(found, triggeredByField, sourceContext) {
            if (sourceContext === 'modal') {
                if (triggeredByField !== 'phone') document.getElementById('deliv-phone').value = found.phone;
                if (triggeredByField !== 'name') document.getElementById('deliv-name').value = found.name;
                document.getElementById('deliv-address').value = found.address || '';
                if (found.zoneId && DELIVERY_ZONES.some(z => z.id === found.zoneId)) {
                    document.getElementById('deliv-zone-select').value = found.zoneId;
                }
                document.getElementById('crm-lookup-badge').classList.remove('hidden');
            } else if (sourceContext === 'checkout') {
                if (triggeredByField !== 'phone') document.getElementById('checkout-cust-phone').value = found.phone;
                if (triggeredByField !== 'name') document.getElementById('checkout-cust-name').value = found.name;
                document.getElementById('checkout-cust-address').value = found.address || '';
                document.getElementById('checkout-crm-badge').classList.remove('hidden');
                syncCheckoutCustomerEdits();
            }
            playPosSound('beep');
            showToast(`تم استرجاع بيانات العميل: ${found.name} ✨`);
        }

        function syncCheckoutCustomerEdits() {
            const ph = document.getElementById('checkout-cust-phone')?.value.trim() || '';
            const nm = document.getElementById('checkout-cust-name')?.value.trim() || '';
            const ad = document.getElementById('checkout-cust-address')?.value.trim() || '';
            deliveryCustomer.phone = ph;
            deliveryCustomer.name = nm;
            deliveryCustomer.address = ad;
            updateCartCustomerCardUI();
            if (orderType === 'delivery') {
                const feeDisplay = deliveryCustomer.fee ? `${deliveryCustomer.fee} ${SETTINGS.currency}` : 'سعر عند التقفيل';
                document.getElementById('badge-order-type').innerText = `دليفري (${deliveryCustomer.name || 'عميل'} - ${feeDisplay})`;
            }
        }

        function lookupCustomerByPhone(phoneVal) {
            lookupCustomerSmart(phoneVal, 'phone', 'modal');
        }

        function updateTable(val) {
            selectedTable = val;
            if (orderType === 'dine-in') {
                document.getElementById('badge-order-type').innerText = `صالة - ${selectedTable}`;
            }
        }

        function saveDeliveryInfo() {
            const name = document.getElementById('deliv-name').value.trim() || 'عميل دليفري';
            const phone = document.getElementById('deliv-phone').value.trim() || '';
            const address = document.getElementById('deliv-address').value.trim() || 'العنوان غير محدد';
            const zoneId = document.getElementById('deliv-zone-select').value;
            const zoneObj = DELIVERY_ZONES.find(z => z.id === zoneId) || DELIVERY_ZONES[0] || { id: 'z1', name: 'توصيل', fee: 0 };
            const manualFeeVal = parseFloat(document.getElementById('deliv-custom-fee').value);
            const finalFee = !isNaN(manualFeeVal) ? manualFeeVal : 0;

            deliveryCustomer = {
                name,
                phone,
                address,
                zoneId: zoneObj.id,
                zoneName: zoneObj.name,
                fee: finalFee
            };
            customDeliveryFeeApplied = finalFee > 0;
            orderType = 'delivery';

            // حفظ العميل في دليل العملاء تلقائياً (CRM) بالرقم أو الاسم
            if (phone.length >= 6 || (name && name !== 'عميل دليفري')) {
                const existingIdx = CUSTOMERS_CRM.findIndex(c => (phone && c.phone === phone) || c.name === name);
                if (existingIdx >= 0) {
                    CUSTOMERS_CRM[existingIdx] = { phone, name, zoneId: zoneObj.id, address };
                } else {
                    CUSTOMERS_CRM.push({ phone, name, zoneId: zoneObj.id, address });
                }
                localStorage.setItem('pos_customers_crm', JSON.stringify(CUSTOMERS_CRM));
            }

            // مزامنة الحقول مع شاشة تقفيل الشيك إن كانت مفتوحة
            const chkPhone = document.getElementById('checkout-cust-phone');
            const chkName = document.getElementById('checkout-cust-name');
            const chkAddr = document.getElementById('checkout-cust-address');
            if (chkPhone) chkPhone.value = phone;
            if (chkName) chkName.value = name;
            if (chkAddr) chkAddr.value = address;

            updateOrderTypeButtonsStyle('delivery');
            updateCartCustomerCardUI();
            closeModal('delivery-modal');
            updateCartUI();
            refreshPaymentModalTotals();
            showToast(`تم حفظ بيانات العميل: ${name}`);
        }

        function toggleDiscountInput() {
            document.getElementById('discount-box').classList.toggle('hidden');
        }

        function applyDiscount() {
            const raw = parseFloat(document.getElementById('discount-input').value);
            const val = isNaN(raw) ? 0 : raw;
            if (val < 0) {
                showToast('لا يمكن إدخال خصم بقيمة سالبة!', true);
                return;
            }
            const maxDiscount = calculateTotals().subtotal;
            discount = round2(Math.min(val, maxDiscount));
            updateCartUI();
            toggleDiscountInput();
            showToast(val > maxDiscount
                ? `تم تقليل الخصم إلى ${discount.toFixed(2)} ${SETTINGS.currency} (أقصى قيمة ممكنة)`
                : `تم تطبيق خصم بقيمة ${discount.toFixed(2)} ${SETTINGS.currency}`);
        }

        function clearCurrentOrderConfirm() {
            if (cart.length === 0) return;
            showConfirmModal("تفريغ السلة", currentOnlineOrderId ? "هذه الفاتورة طلب أونلاين، مسحها سيلغي الطلب. هل تريد المتابعة؟" : "سيتم حذف جميع الأصناف من الفاتورة الحالية. هل تريد المتابعة؟", () => {
                if (currentOnlineOrderId) { onlineSetStatus(currentOnlineOrderId, 'cancelled').catch(() => {}); currentOnlineOrderId = null; }
                cart = [];
                discount = 0;
                customDeliveryFeeApplied = false;
                if (orderType !== 'delivery') deliveryCustomer.fee = 0;
                updateCartUI();
                showToast("تم مسح عناصر الفاتورة");
            });
        }

        function holdCurrentOrder() {
            if (cart.length === 0) {
                showToast("لا توجد وجبات في الفاتورة لتعليقها!", true);
                return;
            }

            const heldTicket = {
                id: currentTicketId,
                table: selectedTable,
                type: orderType,
                onlineId: currentOnlineOrderId || null,
                items: cart.map(i => ({ ...i })),
                discount: discount,
                customDeliveryFeeApplied: customDeliveryFeeApplied,
                deliveryCustomer: { ...deliveryCustomer },
                time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                total: document.getElementById('summary-grand-total').textContent
            };

            heldOrders.push(heldTicket);
            localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
            currentTicketId++;
            document.getElementById('ticket-id').innerText = currentTicketId;
            currentOnlineOrderId = null;
            cart = [];
            discount = 0;
            customDeliveryFeeApplied = false;
            deliveryCustomer = freshDeliveryCustomer();
            updateCartCustomerCardUI();
            updateCartUI();
            updateHeldBadge();
            showToast("تم تعليق الطلب في الانتظار");
        }

        function updateHeldBadge() {
            document.getElementById('held-count-badge').innerText = heldOrders.length;
        }

        function openHeldOrdersModal() {
            const container = document.getElementById('held-orders-list');
            container.innerHTML = '';

            if (heldOrders.length === 0) {
                container.innerHTML = '<p class="text-center text-slate-400 text-xs py-8 font-semibold">لا توجد طلبات معلقة حالياً</p>';
            } else {
                heldOrders.forEach((h, index) => {
                    const el = document.createElement('div');
                    el.className = "bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between";
                    el.innerHTML = `
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-xs text-slate-800 dark:text-white">طلب #${h.id}</span>
                                <span class="text-[11px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">${esc(h.type === 'dine-in' ? h.table : h.type)}</span>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5">${h.items.length} أصناف • ${esc(h.time)} • الإجمالي: ${esc(h.total)} ${SETTINGS.currency}</p>
                        </div>
                        <div class="flex gap-1.5">
                            <button onclick="restoreHeldOrder(${index})" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                                استرجاع
                            </button>
                            <button onclick="deleteHeldOrder(${index})" class="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold px-2.5 py-1.5 rounded-lg transition">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `;
                    container.appendChild(el);
                });
            }
            openModal('held-modal');
        }

        function restoreHeldOrder(index) {
            const doRestore = () => {
                const order = heldOrders.splice(index, 1)[0];
                localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
                cart = order.items;
                currentOnlineOrderId = order.onlineId || null;
                discount = Number(order.discount) || 0;
                if (order.table && TABLES.some(t => t.id === order.table)) {
                    selectedTable = order.table;
                    const tsel = document.getElementById('table-select');
                    if (tsel) tsel.value = selectedTable;
                }
                if (order.deliveryCustomer) deliveryCustomer = { ...freshDeliveryCustomer(), ...order.deliveryCustomer };
                orderType = order.type;
                setOrderType(orderType);
                customDeliveryFeeApplied = orderType === 'delivery' && !!order.customDeliveryFeeApplied;
                updateCartUI();
                updateHeldBadge();
                closeModal('held-modal');
                showToast(`تم استرجاع الطلب #${order.id}`);
            };

            if (cart.length > 0) {
                showConfirmModal("استبدال السلة الحالية", "سيتم استبدال الأصناف الموجودة حالياً في السلة بالطلب المعلق. هل تريد المتابعة؟", doRestore);
            } else {
                doRestore();
            }
        }

        function deleteHeldOrder(index) {
            showConfirmModal("حذف الطلب المعلق", "هل أنت متأكد من حذف هذا الطلب المعلق نهائياً؟", () => {
                const gone = heldOrders[index];
                if (gone && gone.onlineId) onlineSetStatus(gone.onlineId, 'cancelled').catch(() => {});
                heldOrders.splice(index, 1);
                localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders));
                updateHeldBadge();
                openHeldOrdersModal();
                showToast("تم حذف الطلب المعلق");
            });
        }

        function openPaymentModal() {
            if (cart.length === 0) {
                showToast("يرجى إضافة وجبات إلى الفاتورة أولاً!", true);
                return;
            }

            openModal('payment-modal');

            // تعبئة بيانات العميل في شاشة تقفيل الشيك
            const chkPhone = document.getElementById('checkout-cust-phone');
            const chkName = document.getElementById('checkout-cust-name');
            const chkAddr = document.getElementById('checkout-cust-address');
            if (chkPhone) chkPhone.value = deliveryCustomer.phone || '';
            if (chkName) chkName.value = deliveryCustomer.name || '';
            if (chkAddr) chkAddr.value = deliveryCustomer.address || '';

            // إذا كان الطلب دليفري، نفتح خانة سعر الدليفري وبيانات العميل تلقائياً
            const checkoutDelivBox = document.getElementById('checkout-delivery-box');
            const checkoutDelivInp = document.getElementById('checkout-delivery-fee-input');
            const driverSelect = document.getElementById('checkout-driver-select');
            
            if (driverSelect) {
                driverSelect.innerHTML = '<option value="">اختر الطيار...</option>';
                DELIVERY_DRIVERS.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.name;
                    opt.textContent = d.name;
                    driverSelect.appendChild(opt);
                });
            }

            if (orderType === 'delivery' || customDeliveryFeeApplied) {
                checkoutDelivBox.classList.remove('hidden');
                checkoutDelivInp.value = deliveryCustomer.fee > 0 ? deliveryCustomer.fee : '';
            } else {
                checkoutDelivBox.classList.add('hidden');
                checkoutDelivInp.value = '';
            }

            setPaymentMethod('cash');
            refreshPaymentModalTotals();
        }

        function setPaymentMethod(method) {
            activePaymentMethod = method;
            const cashSection = document.getElementById('cash-calc-section');
            const splitSection = document.getElementById('split-calc-section');
            const total = calculateTotals().total;

            document.querySelectorAll('.payment-method-btn').forEach(b => {
                b.className = "payment-method-btn p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 font-bold text-xs flex flex-col items-center gap-1.5 transition";
            });

            if (method === 'cash') {
                document.getElementById('pay-cash-btn').className = "payment-method-btn p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-1.5 transition";
                cashSection.style.display = 'block';
                splitSection.classList.add('hidden');
            } else if (method === 'card') {
                document.getElementById('pay-card-btn').className = "payment-method-btn p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-1.5 transition";
                cashSection.style.display = 'none';
                splitSection.classList.add('hidden');
            } else {
                document.getElementById('pay-split-btn').className = "payment-method-btn p-3 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col items-center gap-1.5 transition";
                cashSection.style.display = 'none';
                splitSection.classList.remove('hidden');
                const half = (total / 2).toFixed(2);
                document.getElementById('split-cash-input').value = half;
                document.getElementById('split-card-input').value = (total - parseFloat(half)).toFixed(2);
            }
        }

        function calculateSplitPayment(changedField) {
            const total = calculateTotals().total;
            const cashInput = document.getElementById('split-cash-input');
            const cardInput = document.getElementById('split-card-input');

            if (changedField === 'cash') {
                const cashVal = Math.min(total, Math.max(0, parseFloat(cashInput.value) || 0));
                cardInput.value = (total - cashVal).toFixed(2);
            } else {
                const cardVal = Math.min(total, Math.max(0, parseFloat(cardInput.value) || 0));
                cashInput.value = (total - cardVal).toFixed(2);
            }
        }

        function calculateChange() {
            const total = calculateTotals().total;
            const received = parseFloat(document.getElementById('received-amount-input').value) || 0;
            const change = received - total;

            const changeEl = document.getElementById('change-due');
            if (change >= 0) {
                changeEl.textContent = `${change.toFixed(2)} ${SETTINGS.currency}`;
                changeEl.className = "text-lg font-black font-mono text-emerald-600 dark:text-emerald-400";
            } else {
                changeEl.textContent = `متبقي ${(Math.abs(change)).toFixed(2)} ${SETTINGS.currency}`;
                changeEl.className = "text-lg font-black font-mono text-rose-500";
            }
        }

        function openReceiptModal() {
            if (cart.length === 0) {
                showToast("لا توجد عناصر في الفاتورة للمعاينة!", true);
                return;
            }
            const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
            const vat = subtotal * (SETTINGS.taxRate / 100);
            const activeFee = (orderType === 'delivery' || customDeliveryFeeApplied)
                ? (deliveryCustomer.fee !== undefined ? Number(deliveryCustomer.fee) : 0)
                : 0.00;
            const deliveryFee = activeFee;
            const total = Math.max(0, subtotal + vat + deliveryFee - discount);

            let typeLabel = "صالة (" + selectedTable + ")";
            if (orderType === 'takeaway') typeLabel = "سفري (تيك أواي)";
            if (orderType === 'delivery') typeLabel = `دليفري (${deliveryCustomer.name || 'عميل'})`;

            const draftOrder = {
                id: currentTicketId + " (معاينة)",
                cashier: currentShift.cashierName,
                date: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
                type: typeLabel,
                customerPhone: orderType === 'delivery' ? deliveryCustomer.phone : '',
                customerAddress: orderType === 'delivery' ? deliveryCustomer.address : '',
                items: cart,
                subtotal: subtotal,
                tax: vat,
                deliveryFee: deliveryFee,
                discount: discount,
                total: total,
                method: activePaymentMethod
            };

            const html = generateOrderReceiptHTML(draftOrder);
            showThermalPreviewModal("معاينة فاتورة قيد الطلب (80mm)", html, draftOrder);
        }

        // دالة إعادة آخر طلب مسجل في السجل (Repeat Last Order)
        function repeatLastOrder() {
            if (!ORDERS_HISTORY || ORDERS_HISTORY.length === 0) {
                showToast("لا توجد فواتير سابقة مسجلة لإعادة طلبها!", true);
                return;
            }
            const lastOrder = ORDERS_HISTORY[ORDERS_HISTORY.length - 1];
            if (!lastOrder || !lastOrder.items || lastOrder.items.length === 0) {
                showToast("آخر طلب مسجل لا يحتوي على أصناف!", true);
                return;
            }

            const doRepeat = () => {
                cart = JSON.parse(JSON.stringify(lastOrder.items));
                if (lastOrder.type.includes('سفري')) {
                    setOrderType('takeaway');
                } else if (lastOrder.type.includes('دليفري')) {
                    setOrderType('delivery');
                    if (lastOrder.customerName) {
                        deliveryCustomer.name = lastOrder.customerName;
                        deliveryCustomer.phone = lastOrder.customerPhone || '';
                        deliveryCustomer.address = lastOrder.customerAddress || '';
                        updateCartCustomerCardUI();
                    }
                } else {
                    setOrderType('dine-in');
                }
                updateCartUI();
                playPosSound('beep');
                showToast(`تم استرجاع أصناف الطلب السابق #${lastOrder.id} إلى السلة بنجاح!`);
            };

            if (cart.length > 0) {
                showConfirmModal("إعادة آخر طلب", "السلة الحالية تحتوي على أصناف. هل تريد استبدالها بأصناف آخر طلب مسجل؟", doRepeat);
            } else {
                doRepeat();
            }
        }

        // ============================================
        // لوحة التحكم الشاملة (Admin Tabs and Operations)
        // ============================================

        function openAdminPinModal() {
            // الدخول للوحة الإدارة للمدير فقط (تم التحقق من هويته برمز الدخول)
            if (!requireManager()) return;
            openAdminPanel();
        }

        function appendPin(digit) {
            if (enteredPin.length < 4) {
                enteredPin += digit;
                updatePinDots();
                playPosSound('beep');
                if (enteredPin.length === 4) {
                    setTimeout(verifyAdminPin, 120);
                }
            }
        }

        function backspacePin() {
            if (enteredPin.length > 0) {
                enteredPin = enteredPin.slice(0, -1);
                updatePinDots();
            }
        }

        function clearPin() {
            enteredPin = "";
            updatePinDots();
        }

        function updatePinDots() {
            const dots = document.getElementById('pin-dots').children;
            for (let i = 0; i < dots.length; i++) {
                if (i < enteredPin.length) {
                    dots[i].className = "w-3.5 h-3.5 rounded-full border-2 border-emerald-500 bg-emerald-500 transition-all";
                } else {
                    dots[i].className = "w-3.5 h-3.5 rounded-full border-2 border-slate-400 dark:border-slate-600 bg-transparent transition-all";
                }
            }
        }

        function verifyAdminPin() {
            const correctPin = SETTINGS.adminPin || "1234";
            if (enteredPin === correctPin) {
                closeModal('admin-pin-modal');
                openAdminPanel();
                playPosSound('checkout');
                showToast("تم فتح لوحة الإدارة بنجاح");
            } else {
                playPosSound('beep');
                showToast("الرمز السري غير صحيح!", true);
                clearPin();
            }
        }

        function openAdminPanel() {
            if (!requireManager()) return;
            switchAdminTab('items');
            openModal('admin-panel-modal');
        }

        function switchAdminTab(tabName) {
            const tabs = ['items', 'categories', 'zones', 'tables', 'cashiers', 'drivers', 'orders', 'analytics', 'settings'];
            tabs.forEach(t => {
                const tabEl = document.getElementById(`admin-tab-${t}`);
                const btnEl = document.getElementById(`tab-btn-${t}`);
                if (tabEl && btnEl) {
                    if (t === tabName) {
                        tabEl.classList.remove('hidden');
                        btnEl.className = "admin-tab-btn py-3 px-4 border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition";
                    } else {
                        tabEl.classList.add('hidden');
                        btnEl.className = "admin-tab-btn py-3 px-4 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition";
                    }
                }
            });

            if (tabName === 'items') renderAdminItemsTable();
            if (tabName === 'categories') renderAdminCategoriesTable();
            if (tabName === 'zones') renderAdminZonesAndCrm();
            if (tabName === 'tables') renderAdminTablesCards();
            if (tabName === 'cashiers') renderAdminCashiersAndShifts();
            if (tabName === 'drivers') renderAdminDriversAnalytics();
            if (tabName === 'orders') renderAdminOrdersTable();
            if (tabName === 'analytics') renderBiAnalyticsDashboard();
            if (tabName === 'settings') loadSettingsIntoForm();
        }

        // دالة تصفية الطلبات بالتاريخ
        function filterOrdersByDate(orders, fromId, toId) {
            const fromVal = document.getElementById(fromId)?.value;
            const toVal = document.getElementById(toId)?.value;
            if (!fromVal && !toVal) return orders;

            const fromDate = fromVal ? new Date(fromVal + 'T00:00:00').getTime() : 0;
            const toDate = toVal ? new Date(toVal + 'T23:59:59.999').getTime() : Date.now();

            return orders.filter(o => {
                const ts = o.timestamp || 0;
                if (!ts) return true; // للاحتفاظ بالفواتير القديمة غير المؤرخة بالـ timestamp
                return ts >= fromDate && ts <= toDate;
            });
        }

        // إدارة إحصائيات وأرباح طياري التوصيل (Drivers Analytics)
        function renderAdminDriversAnalytics() {
            // حساب الإحصائيات لكل طيار من سجل الطلبات
            const driverStats = {};
            DELIVERY_DRIVERS.forEach(d => {
                driverStats[d.name] = { count: 0, revenue: 0, phone: d.phone };
            });

            const filteredOrders = filterOrdersByDate(ORDERS_HISTORY, 'drivers-date-from', 'drivers-date-to');

            filteredOrders.forEach(o => {
                if (o.type && orderKind(o) === 'delivery' && o.driverName) {
                    if (!driverStats[o.driverName]) {
                        driverStats[o.driverName] = { count: 0, revenue: 0, phone: '-' };
                    }
                    driverStats[o.driverName].count += 1;
                    driverStats[o.driverName].revenue += (o.deliveryFee || 0);
                }
            });

            const cardsContainer = document.getElementById('drivers-analytics-cards');
            cardsContainer.innerHTML = '';
            DELIVERY_DRIVERS.forEach(d => {
                const stat = driverStats[d.name] || { count: 0, revenue: 0 };
                const card = document.createElement('div');
                card.className = "p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm";
                card.innerHTML = `
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-base">
                                <i class="fa-solid fa-motorcycle"></i>
                            </div>
                            <div>
                                <h5 class="font-bold text-slate-900 dark:text-white text-sm">${esc(d.name)}</h5>
                                <span class="text-[11px] font-mono text-slate-400">${esc(d.phone || 'بدون هاتف')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-xs">
                        <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span class="text-[10px] text-slate-400 block font-cairo">عدد الأوردرات</span>
                            <span class="text-base font-black text-amber-600 dark:text-amber-400">${stat.count} أوردر</span>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span class="text-[10px] text-slate-400 block font-cairo">أرباح التوصيل</span>
                            <span class="text-base font-black text-emerald-600 dark:text-emerald-400">${stat.revenue.toFixed(2)} ${SETTINGS.currency}</span>
                        </div>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });

            const tbody = document.getElementById('admin-drivers-table');
            tbody.innerHTML = '';
            DELIVERY_DRIVERS.forEach(d => {
                const stat = driverStats[d.name] || { count: 0, revenue: 0 };
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i class="fa-solid fa-motorcycle text-amber-500"></i>
                        <span>${esc(d.name)}</span>
                    </td>
                    <td class="p-3 font-mono">${esc(d.phone || '-')}</td>
                    <td class="p-3 font-bold text-amber-600 dark:text-amber-400 font-mono">${stat.count} أوردر</td>
                    <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">${stat.revenue.toFixed(2)} ${SETTINGS.currency}</td>
                    <td class="p-3 text-center space-x-1 space-x-reverse">
                        <button onclick="openDriverFormModal(${d.id})" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold transition">تعديل</button>
                        <button onclick="deleteDriver(${d.id})" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition">حذف</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openDriverFormModal(driverId = null) {
            if (driverId) {
                const d = DELIVERY_DRIVERS.find(x => x.id === driverId);
                if (!d) return;
                document.getElementById('driver-form-title').textContent = "تعديل بيانات الطيار";
                document.getElementById('form-driver-id').value = d.id;
                document.getElementById('form-driver-name').value = d.name;
                document.getElementById('form-driver-phone').value = d.phone || '';
            } else {
                document.getElementById('driver-form-title').textContent = "إضافة طيار جديد";
                document.getElementById('form-driver-id').value = '';
                document.getElementById('form-driver-name').value = '';
                document.getElementById('form-driver-phone').value = '';
            }
            openModal('driver-form-modal');
        }

        function saveDriverForm() {
            const idVal = document.getElementById('form-driver-id').value;
            const name = document.getElementById('form-driver-name').value.trim();
            const phone = document.getElementById('form-driver-phone').value.trim();

            if (!name) {
                showToast("يرجى إدخال اسم الطيار!", true);
                return;
            }

            if (idVal) {
                const d = DELIVERY_DRIVERS.find(x => x.id == idVal);
                if (d) {
                    d.name = name;
                    d.phone = phone;
                }
                showToast("تم تحديث بيانات الطيار بنجاح");
            } else {
                DELIVERY_DRIVERS.push({
                    id: Date.now(),
                    name,
                    phone
                });
                showToast("تم إضافة الطيار الجديد بنجاح");
            }

            localStorage.setItem('pos_drivers', JSON.stringify(DELIVERY_DRIVERS));
            closeModal('driver-form-modal');
            renderAdminDriversAnalytics();
        }

        function deleteDriver(id) {
            showConfirmModal("حذف الطيار", "هل أنت متأكد من حذف هذا الطيار؟", () => {
                DELIVERY_DRIVERS = DELIVERY_DRIVERS.filter(d => d.id !== id);
                localStorage.setItem('pos_drivers', JSON.stringify(DELIVERY_DRIVERS));
                renderAdminDriversAnalytics();
                showToast("تم الحذف بنجاح");
            });
        }

        function printDriversReport() {
            const fromVal = document.getElementById('drivers-date-from').value || 'البداية';
            const toVal = document.getElementById('drivers-date-to').value || 'اليوم';
            
            const driverStats = {};
            DELIVERY_DRIVERS.forEach(d => {
                driverStats[d.name] = { count: 0, revenue: 0 };
            });
            const filteredOrders = filterOrdersByDate(ORDERS_HISTORY, 'drivers-date-from', 'drivers-date-to');
            filteredOrders.forEach(o => {
                if (o.type && orderKind(o) === 'delivery' && o.driverName && driverStats[o.driverName]) {
                    driverStats[o.driverName].count += 1;
                    driverStats[o.driverName].revenue += (o.deliveryFee || 0);
                }
            });

            let rows = '';
            let totalOrders = 0;
            let totalRev = 0;
            Object.keys(driverStats).forEach(name => {
                const st = driverStats[name];
                rows += `
                    <div class="flex justify-between py-1 border-b border-gray-200 border-dotted">
                        <span>${esc(name)}</span>
                        <span>${st.count}</span>
                        <span>${st.revenue.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                `;
                totalOrders += st.count;
                totalRev += st.revenue;
            });

            const html = `
                <div class="text-center pb-3 border-b-2 border-dashed border-gray-800">
                    <h2 class="font-black text-base">${esc(SETTINGS.resName)}</h2>
                    <p class="text-xs font-extrabold mt-0.5 bg-gray-100 py-1 rounded border border-gray-400">
                        تقرير حسابات طياري التوصيل
                    </p>
                    <p class="text-[10px] mt-1">من: ${fromVal} | إلى: ${toVal}</p>
                </div>
                <div class="py-2 font-bold text-[10px] flex justify-between border-b border-gray-400">
                    <span>الطيار</span>
                    <span>الأوردرات</span>
                    <span>المستحقات</span>
                </div>
                <div class="py-1 text-[11px]">
                    ${rows}
                </div>
                <div class="pt-2 border-t-2 border-dashed border-gray-800 flex justify-between font-black text-xs">
                    <span>الإجمالي:</span>
                    <span>${totalOrders} طلب | ${totalRev.toFixed(2)} ${SETTINGS.currency}</span>
                </div>
            `;
            showThermalPreviewModal("طباعة تقرير الطيارين", html);
        }

        function completePaymentAndPrint() {
            if (cart.length === 0) return;
            const { subtotal, vat, delivery: deliveryFee, total } = calculateTotals();

            if (activePaymentMethod === 'cash') {
                const receivedRaw = document.getElementById('received-amount-input').value;
                if (receivedRaw !== '' && (parseFloat(receivedRaw) || 0) + 0.005 < total) {
                    showToast('المبلغ المستلم أقل من إجمالي الفاتورة!', true);
                    return;
                }
            }

            // حفظ بيانات العميل في دليل العملاء CRM إذا تم إدخالها في شاشة تقفيل الشيك مباشرة
            if ((orderType === 'delivery' || deliveryFee > 0) && (deliveryCustomer.phone || deliveryCustomer.name)) {
                const ph = deliveryCustomer.phone || '';
                const nm = deliveryCustomer.name || 'عميل دليفري';
                const ad = deliveryCustomer.address || '';
                const existingIdx = CUSTOMERS_CRM.findIndex(c => (ph && c.phone === ph) || (nm !== 'عميل دليفري' && c.name === nm));
                if (existingIdx >= 0) {
                    const prev = CUSTOMERS_CRM[existingIdx];
                    CUSTOMERS_CRM[existingIdx] = { ...prev, phone: ph || prev.phone || '', name: nm, address: ad };
                } else {
                    CUSTOMERS_CRM.push({ phone: ph, name: nm, zoneId: deliveryCustomer.zoneId || 'z1', address: ad });
                }
                localStorage.setItem('pos_customers_crm', JSON.stringify(CUSTOMERS_CRM));
            }

            let assignedDriverName = '';
            if (orderType === 'delivery' || deliveryFee > 0) {
                const driverSelectEl = document.getElementById('checkout-driver-select');
                if (driverSelectEl && driverSelectEl.value) {
                    assignedDriverName = driverSelectEl.value;
                } else if (DELIVERY_DRIVERS.length > 0) {
                    assignedDriverName = DELIVERY_DRIVERS[0].name;
                }
            }

            let typeLabel = "صالة (" + selectedTable + ")";
            if (orderType === 'takeaway') typeLabel = "سفري (تيك أواي)";
            if (orderType === 'delivery' || deliveryFee > 0) {
                typeLabel = `دليفري (${deliveryCustomer.name || 'توصيل'}${assignedDriverName ? ' - طيار: ' + assignedDriverName : ''})`;
            }

            let cashPart = total;
            let cardPart = 0;
            if (activePaymentMethod === 'card') {
                cashPart = 0;
                cardPart = total;
            } else if (activePaymentMethod === 'split') {
                cashPart = parseFloat(document.getElementById('split-cash-input').value) || 0;
                cardPart = parseFloat(document.getElementById('split-card-input').value) || 0;
            }

            const orderRecord = {
                id: currentTicketId,
                cashier: currentShift.cashierName,
                date: new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }),
                timestamp: Date.now(),
                orderType: (orderType === 'delivery' || deliveryFee > 0) ? 'delivery' : orderType,
                type: typeLabel,
                driverName: assignedDriverName,
                customerName: (orderType === 'delivery' || deliveryFee > 0) ? deliveryCustomer.name : '',
                customerPhone: (orderType === 'delivery' || deliveryFee > 0) ? deliveryCustomer.phone : '',
                customerAddress: (orderType === 'delivery' || deliveryFee > 0) ? deliveryCustomer.address : '',
                itemsCount: cart.reduce((a, c) => a + c.qty, 0),
                items: JSON.parse(JSON.stringify(cart)),
                subtotal: subtotal,
                tax: vat,
                deliveryFee: deliveryFee,
                discount: discount,
                total: total,
                method: activePaymentMethod,
                onlineId: currentOnlineOrderId || null
            };

            ORDERS_HISTORY.push(orderRecord);
            if (currentOnlineOrderId) { onlineSetStatus(currentOnlineOrderId, 'done').catch(() => {}); currentOnlineOrderId = null; }
            localStorage.setItem('pos_orders_history', JSON.stringify(ORDERS_HISTORY));

            // إرسال تلقائي لشاشة المطبخ KDS عند إتمام الدفع
            createKdsTicketFromOrder(orderRecord.id, typeLabel, cart);

            recordOrderToShift(total, vat, activePaymentMethod, cashPart, cardPart);
            playPosSound('checkout');

            closeModal('payment-modal');
            const html = generateOrderReceiptHTML(orderRecord);
            showThermalPreviewModal(`فاتورة مبيعات #${orderRecord.id}`, html, orderRecord);
            
            setTimeout(() => {
                showToast(`تم سداد الطلب #${currentTicketId} وإرساله للمطبخ!`);
                currentTicketId++;
                document.getElementById('ticket-id').innerText = currentTicketId;
                cart = [];
                discount = 0;
                customDeliveryFeeApplied = false;
                deliveryCustomer = { name: '', phone: '', address: '', zoneId: DELIVERY_ZONES[0]?.id || 'z1', fee: 0.00, zoneName: 'سعر يدوي' };
                updateCartCustomerCardUI();
                updateCartUI();
            }, 250);
        }

        // إدارة الطاولات في الإدارة
        function renderAdminTablesCards() {
            const container = document.getElementById('admin-tables-cards');
            container.innerHTML = '';
            TABLES.forEach(tbl => {
                const card = document.createElement('div');
                card.className = "p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between";
                card.innerHTML = `
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center">${tbl.id}</span>
                            <h5 class="font-bold text-xs text-slate-900 dark:text-white">${esc(tbl.label)}</h5>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">السعة: ${tbl.capacity} أفراد</p>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="openTableFormModal('${tbl.id}')" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition">تعديل</button>
                        <button onclick="deleteTable('${tbl.id}')" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition">حذف</button>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function openTableFormModal(tableId = null) {
            if (tableId) {
                const tbl = TABLES.find(x => x.id === tableId);
                if (!tbl) return;
                document.getElementById('table-form-title').textContent = "تعديل الطاولة";
                document.getElementById('form-table-id').value = tbl.id;
                document.getElementById('form-table-code').value = tbl.id;
                document.getElementById('form-table-code').disabled = true;
                document.getElementById('form-table-label').value = tbl.label;
                document.getElementById('form-table-capacity').value = tbl.capacity;
            } else {
                document.getElementById('table-form-title').textContent = "إضافة طاولة جديدة";
                document.getElementById('form-table-id').value = '';
                document.getElementById('form-table-code').value = '';
                document.getElementById('form-table-code').disabled = false;
                document.getElementById('form-table-label').value = '';
                document.getElementById('form-table-capacity').value = 4;
            }
            openModal('table-form-modal');
        }

        function saveTableForm() {
            const isEdit = document.getElementById('form-table-id').value !== '';
            const code = document.getElementById('form-table-code').value.trim();
            const label = document.getElementById('form-table-label').value.trim() || code;
            const capacity = parseInt(document.getElementById('form-table-capacity').value) || 4;

            if (!code) {
                showToast("كود الطاولة مطلوب!", true);
                return;
            }

            if (isEdit) {
                const t = TABLES.find(x => x.id === code);
                if (t) {
                    t.label = label;
                    t.capacity = capacity;
                }
                showToast("تم تحديث الطاولة بنجاح");
            } else {
                if (TABLES.some(t => t.id === code)) {
                    showToast("رقم الطاولة موجود مسبقاً!", true);
                    return;
                }
                TABLES.push({ id: code, label, capacity });
                showToast("تم إضافة الطاولة بنجاح");
            }

            localStorage.setItem('pos_tables', JSON.stringify(TABLES));
            closeModal('table-form-modal');
            renderTablesSelect();
            renderAdminTablesCards();
        }

        function deleteTable(id) {
            showConfirmModal("حذف الطاولة", "هل أنت متأكد من حذف هذه الطاولة؟", () => {
                TABLES = TABLES.filter(t => t.id !== id);
                localStorage.setItem('pos_tables', JSON.stringify(TABLES));
                renderTablesSelect();
                renderAdminTablesCards();
                showToast("تم الحذف بنجاح");
            });
        }

        // إدارة الكاشيرية والشفتات في الإدارة
        function renderAdminCashiersAndShifts() {
            const tbody = document.getElementById('admin-cashiers-table');
            tbody.innerHTML = '';
            CASHIERS.forEach(c => {
                const isCurrent = c.name === currentShift.cashierName;
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i class="fa-solid ${c.role === 'manager' ? 'fa-user-shield text-amber-500' : 'fa-user-tie text-emerald-500'}"></i>
                        <span>${esc(c.name)}</span>
                        <span class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold">${c.role === 'manager' ? 'مدير' : 'كاشير'}</span>
                    </td>
                    <td class="p-3 font-mono">${esc(c.phone || '-')}</td>
                    <td class="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">••••</td>
                    <td class="p-3">
                        ${isCurrent ? '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">الشفت النشط حالياً</span>' : '<span class="text-slate-400">مسجل</span>'}
                    </td>
                    <td class="p-3 text-center space-x-1 space-x-reverse">
                        <button onclick="openCashierFormModal(${c.id})" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition">تعديل</button>
                        ${CASHIERS.length > 1 ? `<button onclick="deleteCashier(${c.id})" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition">حذف</button>` : ''}
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // سجل الشفتات المغلقة السابقة
            const shiftHistTbody = document.getElementById('admin-shifts-history-table');
            if (shiftHistTbody) {
                shiftHistTbody.innerHTML = '';
                if (SHIFTS_HISTORY.length === 0) {
                    shiftHistTbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400">لا توجد شفتات مسجلة مغلقة حتى الآن</td></tr>';
                } else {
                    SHIFTS_HISTORY.slice().reverse().forEach((sh, sIdx) => {
                        const tr = document.createElement('tr');
                        tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                        const diff = sh.actualCash - sh.expectedCash;
                        let diffBadge = `<span class="text-emerald-500 font-bold">متطابق</span>`;
                        if (diff > 0) diffBadge = `<span class="text-blue-500 font-bold">+${diff.toFixed(2)} فائض</span>`;
                        if (diff < 0) diffBadge = `<span class="text-rose-500 font-bold">${diff.toFixed(2)} عجز</span>`;

                        tr.innerHTML = `
                            <td class="p-3 font-bold text-slate-900 dark:text-white">${esc(sh.cashierName)}</td>
                            <td class="p-3 font-bold text-slate-700 dark:text-slate-300">${esc(sh.nextCashier || 'إغلاق عام')}</td>
                            <td class="p-3 font-mono text-slate-500">${esc(sh.printTime)}</td>
                            <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">${sh.totalSales.toFixed(2)} ${SETTINGS.currency}</td>
                            <td class="p-3">${diffBadge}</td>
                            <td class="p-3 text-center">
                                <button onclick="printClosedShiftHistory(${SHIFTS_HISTORY.length - 1 - sIdx})" class="px-3 py-1 rounded bg-teal-500/10 hover:bg-teal-500 text-teal-600 dark:text-teal-400 hover:text-white text-xs font-bold transition flex items-center gap-1 mx-auto">
                                    <i class="fa-solid fa-print"></i> طباعة
                                </button>
                            </td>
                        `;
                        shiftHistTbody.appendChild(tr);
                    });
                }
            }
        }

        function printClosedShiftHistory(idx) {
            const record = SHIFTS_HISTORY[idx];
            if (!record) return;
            const html = generateShiftReportHTML(record);
            showThermalPreviewModal("سجل بوليصة الوردية المعتمدة", html);
        }

        function openCashierFormModal(cashierId = null) {
            if (cashierId) {
                const c = CASHIERS.find(x => x.id === cashierId);
                if (!c) return;
                document.getElementById('cashier-form-title').textContent = "تعديل بيانات الكاشير";
                document.getElementById('form-cashier-id').value = c.id;
                document.getElementById('form-cashier-name').value = c.name;
                document.getElementById('form-cashier-phone').value = c.phone || '';
                document.getElementById('form-cashier-pin').value = c.pin;
                document.getElementById('form-cashier-role').value = c.role === 'manager' ? 'manager' : 'cashier';
            } else {
                document.getElementById('cashier-form-title').textContent = "إضافة كاشير جديد";
                document.getElementById('form-cashier-id').value = '';
                document.getElementById('form-cashier-name').value = '';
                document.getElementById('form-cashier-phone').value = '';
                document.getElementById('form-cashier-pin').value = '';
                document.getElementById('form-cashier-role').value = 'cashier';
            }
            openModal('cashier-form-modal');
        }

        function saveCashierForm() {
            const idVal = document.getElementById('form-cashier-id').value;
            const name = document.getElementById('form-cashier-name').value.trim();
            const phone = document.getElementById('form-cashier-phone').value.trim();
            const pin = document.getElementById('form-cashier-pin').value.trim();
            const role = document.getElementById('form-cashier-role').value === 'manager' ? 'manager' : 'cashier';

            if (!name || pin.length !== 4) {
                showToast("يرجى إدخال اسم الكاشير ورمز PIN مكون من 4 أرقام!", true);
                return;
            }

            if (idVal) {
                const cur = CASHIERS.find(x => x.id == idVal);
                if (cur && cur.role === 'manager' && role !== 'manager' && CASHIERS.filter(x => x.role === 'manager').length <= 1) {
                    showToast("لا يمكن تحويل المدير الوحيد إلى كاشير!", true);
                    return;
                }
                const c = CASHIERS.find(x => x.id == idVal);
                if (c) {
                    c.role = role;
                    c.name = name;
                    c.phone = phone;
                    c.pin = pin;
                }
                showToast("تم تحديث الكاشير بنجاح");
            } else {
                const newC = {
                    id: Date.now(),
                    name,
                    phone,
                    pin,
                    role,
                    active: true
                };
                CASHIERS.push(newC);
                showToast("تم إضافة الكاشير الجديد بنجاح");
            }

            localStorage.setItem('pos_cashiers', JSON.stringify(CASHIERS));
            closeModal('cashier-form-modal');
            renderAdminCashiersAndShifts();
        }

        function deleteCashier(id) {
            const target = CASHIERS.find(c => c.id === id);
            if (target && target.role === 'manager' && CASHIERS.filter(c => c.role === 'manager').length <= 1) {
                showToast("لا يمكن حذف المدير الوحيد في النظام!", true);
                return;
            }
            if (currentUser && target && target.id === currentUser.id) {
                showToast("لا يمكنك حذف المستخدم المسجل دخوله حالياً!", true);
                return;
            }
            if (CASHIERS.length <= 1) {
                showToast("يجب أن يبقى كاشير واحد على الأقل في النظام!", true);
                return;
            }
            showConfirmModal("حذف الكاشير", "هل أنت متأكد من حذف هذا الكاشير من النظام؟", () => {
                CASHIERS = CASHIERS.filter(c => c.id !== id);
                localStorage.setItem('pos_cashiers', JSON.stringify(CASHIERS));
                renderAdminCashiersAndShifts();
                showToast("تم الحذف بنجاح");
            });
        }

        // سجل الفواتير والمبيعات في الإدارة
        function renderAdminOrdersTable() {
            const tbody = document.getElementById('admin-orders-table');
            tbody.innerHTML = '';
            if (ORDERS_HISTORY.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400 font-semibold">لا توجد فواتير مسجلة اليوم</td></tr>';
                return;
            }

            ORDERS_HISTORY.slice().reverse().forEach(o => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                const methodLabel = o.method === 'cash' ? 'نقدي' : (o.method === 'card' ? 'فيزا' : 'مختلط');

                tr.innerHTML = `
                    <td class="p-3 font-bold text-slate-900 dark:text-white font-mono">#${o.id}</td>
                    <td class="p-3 text-slate-700 dark:text-slate-300 font-bold">${esc(o.cashier || 'أحمد حسام')}</td>
                    <td class="p-3 text-slate-500 font-mono">${esc(o.date)}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">${esc(o.type)}</span></td>
                    <td class="p-3 font-semibold">${methodLabel}</td>
                    <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">${(o.total || 0).toFixed(2)} ${SETTINGS.currency}</td>
                    <td class="p-3 text-center space-x-1 space-x-reverse">
                        <button onclick="reprintOrder(${o.id})" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-teal-500 hover:text-white text-xs font-semibold transition" title="إعادة طباعة">
                            <i class="fa-solid fa-print"></i>
                        </button>
                        <button onclick="sendOrderWhatsAppById(${Number(o.id)})" class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition" title="واتساب">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function reprintOrder(orderId) {
            const found = ORDERS_HISTORY.find(x => x.id == orderId);
            if (!found) return;
            const html = generateOrderReceiptHTML(found);
            showThermalPreviewModal(`إيصال فاتورة مبيعات #${found.id}`, html, found);
        }

        function clearOrdersHistory() {
            showConfirmModal("مسح سجل الفواتير", "هل أنت متأكد من مسح كافة سجلات الفواتير؟", () => {
                ORDERS_HISTORY = [];
                localStorage.setItem('pos_orders_history', JSON.stringify(ORDERS_HISTORY));
                renderAdminOrdersTable();
                showToast("تم مسح السجل بنجاح");
            });
        }

        // الإعدادات العامة في الإدارة
        function loadSettingsIntoForm() {
            document.getElementById('setting-res-name').value = SETTINGS.resName;
            document.getElementById('setting-res-phone').value = SETTINGS.resPhone;
            document.getElementById('setting-res-address').value = SETTINGS.resAddress;
            document.getElementById('setting-res-tax').value = SETTINGS.resTaxNumber;
            document.getElementById('setting-res-footer').value = SETTINGS.resFooter;
            document.getElementById('setting-tax-rate').value = SETTINGS.taxRate;
            document.getElementById('setting-delivery-fee').value = SETTINGS.deliveryFee;
            document.getElementById('setting-currency-symbol').value = SETTINGS.currency;
            document.getElementById('setting-admin-pin').value = SETTINGS.adminPin || "1234";
        }

        function saveGeneralSettings() {
            const pinRaw = document.getElementById('setting-admin-pin').value.trim();
            if (pinRaw && !/^\d{4}$/.test(pinRaw)) {
                showToast("الرمز السري للإدارة يجب أن يتكون من 4 أرقام فقط!", true);
                return;
            }
            SETTINGS.resName = document.getElementById('setting-res-name').value.trim() || SETTINGS.resName;
            SETTINGS.resPhone = document.getElementById('setting-res-phone').value.trim() || SETTINGS.resPhone;
            SETTINGS.resAddress = document.getElementById('setting-res-address').value.trim() || SETTINGS.resAddress;
            SETTINGS.resTaxNumber = document.getElementById('setting-res-tax').value.trim() || SETTINGS.resTaxNumber;
            SETTINGS.resFooter = document.getElementById('setting-res-footer').value.trim() || SETTINGS.resFooter;
            const taxIn = parseFloat(document.getElementById('setting-tax-rate').value);
            if (!isNaN(taxIn) && taxIn >= 0) SETTINGS.taxRate = taxIn;
            const delIn = parseFloat(document.getElementById('setting-delivery-fee').value);
            if (!isNaN(delIn) && delIn >= 0) SETTINGS.deliveryFee = delIn;
            SETTINGS.currency = document.getElementById('setting-currency-symbol').value.trim() || "ج.م";
            SETTINGS.adminPin = pinRaw || SETTINGS.adminPin || "1234";

            localStorage.setItem('pos_settings', JSON.stringify(SETTINGS));
            applyBrandSettings();
            updateCartUI();
            closeModal('admin-panel-modal');
            showToast("تم حفظ الإعدادات العامة بنجاح");
        }

        // وظائف عامة للنوافذ المنبثقة والاشعارات
        function openModal(modalId) {
            document.getElementById(modalId).classList.remove('hidden');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }

        function closeAllModals() {
            ['online-orders-modal', 'desktop-db-modal', 'delivery-modal', 'admin-pin-modal', 'admin-panel-modal', 'receipt-modal', 'modifier-modal', 'payment-modal', 'shift-modal', 'end-shift-modal', 'held-modal', 'zone-form-modal', 'cashier-form-modal', 'item-form-modal', 'category-form-modal', 'table-form-modal', 'item-note-modal', 'custom-confirm-modal'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
        }

        function isAnyModalOpen() {
            const modals = ['login-overlay', 'online-orders-modal', 'desktop-db-modal', 'delivery-modal', 'admin-pin-modal', 'admin-panel-modal', 'receipt-modal', 'modifier-modal', 'payment-modal', 'shift-modal', 'end-shift-modal', 'held-modal', 'zone-form-modal', 'cashier-form-modal', 'item-form-modal', 'category-form-modal', 'table-form-modal', 'item-note-modal', 'custom-confirm-modal'];
            return modals.some(id => !document.getElementById(id).classList.contains('hidden'));
        }

        function showToast(msg, isError = false) {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toast-icon');
            const msgEl = document.getElementById('toast-msg');

            msgEl.textContent = msg;
            if (isError) {
                icon.className = "fa-solid fa-triangle-exclamation text-rose-500 text-base";
            } else {
                icon.className = "fa-solid fa-circle-check text-emerald-500 text-base";
            }

            toast.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
            }, 3200);
        }

        // ==============================================================
        // دوال رسم وتعديل بيانات لوحة الإدارة الشاملة
        // ==============================================================
        
        function renderAdminItemsTable() {
            const tbody = document.getElementById('admin-items-table');
            if(!tbody) return;
            tbody.innerHTML = '';
            MENU_ITEMS.forEach(item => {
                const cat = CATEGORIES.find(c => c.key === item.category) || { name: item.category };
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span class="text-lg">${esc(item.emoji || '🍽️')}</span>
                        <span>${esc(item.name)}</span>
                    </td>
                    <td class="p-3">${esc(cat.name)}</td>
                    <td class="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">${Number(item.price).toFixed(2)} ${SETTINGS.currency}</td>
                    <td class="p-3">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${item.available !== false ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}">
                            ${item.available !== false ? 'متوفر' : 'غير متوفر'}
                        </span>
                    </td>
                    <td class="p-3">
                        ${item.popular ? '<i class="fa-solid fa-fire text-amber-500"></i>' : '-'}
                    </td>
                    <td class="p-3 text-center space-x-1 space-x-reverse">
                        <button onclick="openItemFormModal(${item.id})" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition">تعديل</button>
                        <button onclick="deleteMenuItem(${item.id})" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition">حذف</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openItemFormModal(itemId = null) {
            const catSelect = document.getElementById('form-item-category');
            catSelect.innerHTML = '';
            CATEGORIES.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.key;
                opt.textContent = c.name;
                catSelect.appendChild(opt);
            });

            if (itemId) {
                const item = MENU_ITEMS.find(i => i.id === itemId);
                if (item) {
                    document.getElementById('item-form-title').textContent = "تعديل بيانات الصنف";
                    document.getElementById('form-item-id').value = item.id;
                    document.getElementById('form-item-name').value = item.name;
                    document.getElementById('form-item-category').value = item.category;
                    document.getElementById('form-item-price').value = item.price;
                    document.getElementById('form-item-emoji').value = item.emoji || '';
                    document.getElementById('form-item-desc').value = item.desc || '';
                    document.getElementById('form-item-available').checked = item.available !== false;
                    document.getElementById('form-item-popular').checked = !!item.popular;
                }
            } else {
                document.getElementById('item-form-title').textContent = "إضافة صنف جديد للمنيو";
                document.getElementById('form-item-id').value = '';
                document.getElementById('form-item-name').value = '';
                document.getElementById('form-item-price').value = '';
                document.getElementById('form-item-emoji').value = '';
                document.getElementById('form-item-desc').value = '';
                document.getElementById('form-item-available').checked = true;
                document.getElementById('form-item-popular').checked = false;
            }
            openModal('item-form-modal');
        }

        function saveMenuItemForm() {
            const idVal = document.getElementById('form-item-id').value;
            const name = document.getElementById('form-item-name').value.trim();
            const category = document.getElementById('form-item-category').value;
            const price = parseFloat(document.getElementById('form-item-price').value);
            const emoji = document.getElementById('form-item-emoji').value.trim() || '🍽️';
            const desc = document.getElementById('form-item-desc').value.trim();
            const available = document.getElementById('form-item-available').checked;
            const popular = document.getElementById('form-item-popular').checked;

            if (!name || isNaN(price)) {
                showToast("الاسم والسعر مطلوبان!", true);
                return;
            }

            if (idVal) {
                const item = MENU_ITEMS.find(i => i.id == idVal);
                if (item) {
                    item.name = name;
                    item.category = category;
                    item.price = price;
                    item.emoji = emoji;
                    item.desc = desc;
                    item.available = available;
                    item.popular = popular;
                }
                showToast("تم تحديث الصنف بنجاح");
            } else {
                MENU_ITEMS.push({
                    id: Date.now(),
                    name,
                    category,
                    price,
                    emoji,
                    desc,
                    available,
                    popular
                });
                showToast("تمت إضافة الصنف بنجاح");
            }
            localStorage.setItem('restaurant_pos_menu', JSON.stringify(MENU_ITEMS));
            closeModal('item-form-modal');
            renderAdminItemsTable();
            renderProducts(MENU_ITEMS);
            selectCategory('all');
        }

        function deleteMenuItem(id) {
            showConfirmModal("حذف الصنف", "هل أنت متأكد من حذف هذا الصنف من المنيو؟", () => {
                MENU_ITEMS = MENU_ITEMS.filter(i => i.id !== id);
                localStorage.setItem('restaurant_pos_menu', JSON.stringify(MENU_ITEMS));
                renderAdminItemsTable();
                renderProducts(MENU_ITEMS);
                showToast("تم حذف الصنف بنجاح");
            });
        }

        function resetToDefaultMenu() {
            showConfirmModal("استعادة القائمة الافتراضية", "سيتم مسح قائمة الطعام الحالية واستعادة الوجبات الافتراضية للمطعم، هل أنت متأكد؟", () => {
                MENU_ITEMS = JSON.parse(JSON.stringify(DEFAULT_MENU_ITEMS));
                CATEGORIES = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
                localStorage.setItem('restaurant_pos_menu', JSON.stringify(MENU_ITEMS));
                localStorage.setItem('pos_categories', JSON.stringify(CATEGORIES));
                renderAdminItemsTable();
                renderCategoriesBar();
                renderProducts(MENU_ITEMS);
                showToast("تمت استعادة المنيو الافتراضي بنجاح");
            });
        }

        function renderAdminCategoriesTable() {
            const tbody = document.getElementById('admin-categories-table');
            if(!tbody) return;
            tbody.innerHTML = '';
            CATEGORIES.forEach(cat => {
                const count = MENU_ITEMS.filter(i => i.category === cat.key).length;
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                tr.innerHTML = `
                    <td class="p-3 text-lg">${esc(cat.icon || '🏷️')}</td>
                    <td class="p-3 font-bold text-slate-900 dark:text-white">${esc(cat.name)}</td>
                    <td class="p-3 font-mono text-slate-500">${cat.key}</td>
                    <td class="p-3 font-bold">${count} أصناف</td>
                    <td class="p-3 text-center space-x-1 space-x-reverse">
                        <button onclick="openCategoryFormModal('${cat.key}')" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition">تعديل</button>
                        <button onclick="deleteCategory('${cat.key}')" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition">حذف</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function openCategoryFormModal(catKey = null) {
            if (catKey) {
                const cat = CATEGORIES.find(c => c.key === catKey);
                if (cat) {
                    document.getElementById('cat-form-title').textContent = "تعديل القسم";
                    document.getElementById('form-cat-id').value = cat.key;
                    document.getElementById('form-cat-name').value = cat.name;
                    document.getElementById('form-cat-icon').value = cat.icon || '';
                    document.getElementById('form-cat-key').value = cat.key;
                    document.getElementById('form-cat-key').disabled = true;
                }
            } else {
                document.getElementById('cat-form-title').textContent = "إضافة قسم جديد";
                document.getElementById('form-cat-id').value = '';
                document.getElementById('form-cat-name').value = '';
                document.getElementById('form-cat-icon').value = '';
                document.getElementById('form-cat-key').value = '';
                document.getElementById('form-cat-key').disabled = false;
            }
            openModal('category-form-modal');
        }

        function saveCategoryForm() {
            const idVal = document.getElementById('form-cat-id').value;
            const name = document.getElementById('form-cat-name').value.trim();
            const icon = document.getElementById('form-cat-icon').value.trim() || '🏷️';
            const key = document.getElementById('form-cat-key').value.trim();

            if (!name || !key) {
                showToast("اسم القسم والمعرف الكودي مطلوبان!", true);
                return;
            }

            if (idVal) {
                const cat = CATEGORIES.find(c => c.key === idVal);
                if (cat) {
                    cat.name = name;
                    cat.icon = icon;
                }
                showToast("تم تحديث القسم بنجاح");
            } else {
                if (CATEGORIES.some(c => c.key === key)) {
                    showToast("المعرف الكودي موجود مسبقاً!", true);
                    return;
                }
                CATEGORIES.push({ key, name, icon });
                showToast("تم إضافة القسم بنجاح");
            }
            localStorage.setItem('pos_categories', JSON.stringify(CATEGORIES));
            closeModal('category-form-modal');
            renderAdminCategoriesTable();
            renderCategoriesBar();
        }

        function deleteCategory(key) {
            if (MENU_ITEMS.some(i => i.category === key)) {
                showToast("لا يمكن حذف قسم يحتوي على أصناف. احذف الأصناف أو انقلها أولاً.", true);
                return;
            }
            showConfirmModal("حذف القسم", "هل أنت متأكد من حذف هذا القسم؟", () => {
                CATEGORIES = CATEGORIES.filter(c => c.key !== key);
                localStorage.setItem('pos_categories', JSON.stringify(CATEGORIES));
                renderAdminCategoriesTable();
                renderCategoriesBar();
                showToast("تم حذف القسم بنجاح");
            });
        }

        function renderAdminZonesAndCrm() {
            const zonesGrid = document.getElementById('admin-zones-grid');
            if(zonesGrid) {
                zonesGrid.innerHTML = '';
                DELIVERY_ZONES.forEach(z => {
                    const card = document.createElement('div');
                    card.className = "p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between";
                    card.innerHTML = `
                        <div>
                            <h5 class="font-bold text-slate-900 dark:text-white text-sm">${esc(z.name)}</h5>
                            <span class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">${Number(z.fee).toFixed(2)} ${SETTINGS.currency}</span>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="openZoneFormModal('${z.id}')" class="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteZone('${z.id}')" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                    zonesGrid.appendChild(card);
                });
            }

            const crmTbody = document.getElementById('admin-customers-table');
            if(crmTbody) {
                crmTbody.innerHTML = '';
                CUSTOMERS_CRM.forEach(c => {
                    const zoneName = DELIVERY_ZONES.find(z => z.id === c.zoneId)?.name || c.zoneId || '-';
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-100 dark:hover:bg-slate-800/40 transition";
                    tr.innerHTML = `
                        <td class="p-3 font-bold text-slate-900 dark:text-white">${esc(c.name)}</td>
                        <td class="p-3 font-mono">${esc(c.phone)}</td>
                        <td class="p-3">${esc(zoneName)}</td>
                        <td class="p-3 truncate max-w-[200px]" title="${esc(c.address)}">${esc(c.address || '-')}</td>
                        <td class="p-3 text-center">
                            <button onclick="deleteCrmCustomer('${esc(c.phone.replace(/'/g, "\\'"))}')" class="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-xs font-semibold transition">حذف</button>
                        </td>
                    `;
                    crmTbody.appendChild(tr);
                });
            }
        }

        function openZoneFormModal(zoneId = null) {
            if (zoneId) {
                const z = DELIVERY_ZONES.find(x => x.id === zoneId);
                if (z) {
                    document.getElementById('zone-form-title').textContent = "تعديل منطقة التوصيل";
                    document.getElementById('form-zone-idx').value = z.id;
                    document.getElementById('form-zone-name').value = z.name;
                    document.getElementById('form-zone-fee').value = z.fee;
                }
            } else {
                document.getElementById('zone-form-title').textContent = "إضافة منطقة توصيل جديدة";
                document.getElementById('form-zone-idx').value = '';
                document.getElementById('form-zone-name').value = '';
                document.getElementById('form-zone-fee').value = '';
            }
            openModal('zone-form-modal');
        }

        function saveZoneForm() {
            const idVal = document.getElementById('form-zone-idx').value;
            const name = document.getElementById('form-zone-name').value.trim();
            const fee = parseFloat(document.getElementById('form-zone-fee').value);

            if (!name || isNaN(fee)) {
                showToast("الاسم وقيمة الرسوم مطلوبان!", true);
                return;
            }

            if (idVal) {
                const z = DELIVERY_ZONES.find(x => x.id === idVal);
                if (z) {
                    z.name = name;
                    z.fee = fee;
                }
                showToast("تم تحديث المنطقة بنجاح");
            } else {
                DELIVERY_ZONES.push({
                    id: 'z' + Date.now(),
                    name,
                    fee
                });
                showToast("تم إضافة المنطقة بنجاح");
            }
            localStorage.setItem('pos_delivery_zones', JSON.stringify(DELIVERY_ZONES));
            closeModal('zone-form-modal');
            renderAdminZonesAndCrm();
        }

        function deleteZone(zoneId) {
            showConfirmModal("حذف المنطقة", "هل أنت متأكد من حذف هذه المنطقة من التوصيل؟", () => {
                DELIVERY_ZONES = DELIVERY_ZONES.filter(z => z.id !== zoneId);
                localStorage.setItem('pos_delivery_zones', JSON.stringify(DELIVERY_ZONES));
                renderAdminZonesAndCrm();
                showToast("تم حذف المنطقة بنجاح");
            });
        }

        function deleteCrmCustomer(phone) {
            showConfirmModal("حذف العميل", "هل أنت متأكد من حذف بيانات هذا العميل من السجل؟", () => {
                CUSTOMERS_CRM = CUSTOMERS_CRM.filter(c => c.phone !== phone);
                localStorage.setItem('pos_customers_crm', JSON.stringify(CUSTOMERS_CRM));
                renderAdminZonesAndCrm();
                showToast("تم حذف العميل بنجاح");
            });
        }

        function renderBiAnalyticsDashboard() {
            const filteredOrders = filterOrdersByDate(ORDERS_HISTORY, 'bi-date-from', 'bi-date-to');

            const totalRev = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const totalOrds = filteredOrders.length;
            const itemsSold = filteredOrders.reduce((sum, o) => sum + (o.itemsCount || 0), 0);
            const avgOrd = totalOrds > 0 ? (totalRev / totalOrds) : 0;

            const cashCount = filteredOrders.filter(o => o.method === 'cash').length;
            const cardCount = filteredOrders.filter(o => o.method === 'card').length;
            const cashPct = totalOrds > 0 ? Math.round((cashCount / totalOrds) * 100) : 0;
            const taxCollected = filteredOrders.reduce((sum, o) => sum + (o.tax || 0), 0);
            document.getElementById('bi-total-revenue').textContent = `${totalRev.toFixed(2)} ${SETTINGS.currency}`;
            document.getElementById('bi-total-orders').textContent = totalOrds;
            document.getElementById('bi-items-sold-sub').textContent = `إجمالي ${itemsSold} وجبة مباعة`;
            document.getElementById('bi-avg-order').textContent = `${avgOrd.toFixed(2)} ${SETTINGS.currency}`;
            const splitCount = filteredOrders.filter(o => o.method === 'split').length;
            document.getElementById('bi-payment-split').textContent = `${cashPct}% كاش` + (splitCount ? ` • ${Math.round((splitCount / totalOrds) * 100)}% مختلط` : '');
            document.getElementById('bi-tax-collected-sub').textContent = `الضرائب: ${taxCollected.toFixed(2)} ${SETTINGS.currency}`;

            // تحليل أعلى 5 أصناف
            let itemStats = {};
            filteredOrders.forEach(o => {
                if(o.items) {
                    o.items.forEach(it => {
                        if(!itemStats[it.name]) itemStats[it.name] = { qty: 0, rev: 0 };
                        itemStats[it.name].qty += it.qty;
                        itemStats[it.name].rev += (it.price * it.qty);
                    });
                }
            });
            const topItems = Object.keys(itemStats).map(k => ({ name: k, ...itemStats[k] })).sort((a,b) => b.qty - a.qty).slice(0, 5);
            
            const topItemsChart = document.getElementById('bi-top-items-chart');
            topItemsChart.innerHTML = '';
            const maxQty = topItems.length > 0 ? topItems[0].qty : 1;
            
            topItems.forEach((it, idx) => {
                const width = Math.max(5, (it.qty / maxQty) * 100);
                topItemsChart.innerHTML += `
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="font-bold text-slate-700 dark:text-slate-300 truncate">${idx+1}. ${esc(it.name)}</span>
                            <span class="text-emerald-600 dark:text-emerald-400 font-mono font-bold">${it.qty}</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                            <div class="bg-gradient-to-l from-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-1000" style="width: ${width}%"></div>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-0.5 text-left">${it.rev.toFixed(2)} ${SETTINGS.currency}</p>
                    </div>
                `;
            });

            // تحليل أنواع الطلبات
            const dineIn = filteredOrders.filter(o => orderKind(o) === 'dine-in').length;
            const takeaway = filteredOrders.filter(o => orderKind(o) === 'takeaway').length;
            const delivery = filteredOrders.filter(o => orderKind(o) === 'delivery').length;
            
            const typesChart = document.getElementById('bi-order-types-chart');
            const totalTypes = dineIn + takeaway + delivery || 1;
            
            typesChart.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-16 h-16 shrink-0 rounded-full conic-gradient-chart" 
                         style="background: conic-gradient(
                            #10b981 0% ${(dineIn/totalTypes)*100}%, 
                            #f59e0b ${(dineIn/totalTypes)*100}% ${((dineIn+takeaway)/totalTypes)*100}%, 
                            #3b82f6 ${((dineIn+takeaway)/totalTypes)*100}% 100%
                         );">
                    </div>
                    <div class="flex-1 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> صالة</span>
                            <span class="font-bold">${Math.round((dineIn/totalTypes)*100)}% (${dineIn})</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500"></span> سفري</span>
                            <span class="font-bold">${Math.round((takeaway/totalTypes)*100)}% (${takeaway})</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-500"></span> دليفري</span>
                            <span class="font-bold">${Math.round((delivery/totalTypes)*100)}% (${delivery})</span>
                        </div>
                    </div>
                </div>
            `;
        }

        function printBiReport() {
            const fromVal = document.getElementById('bi-date-from').value || 'البداية';
            const toVal = document.getElementById('bi-date-to').value || 'اليوم';
            
            const filteredOrders = filterOrdersByDate(ORDERS_HISTORY, 'bi-date-from', 'bi-date-to');
            const totalRev = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const totalOrds = filteredOrders.length;
            const itemsSold = filteredOrders.reduce((sum, o) => sum + (o.itemsCount || 0), 0);
            
            const dineIn = filteredOrders.filter(o => orderKind(o) === 'dine-in').length;
            const takeaway = filteredOrders.filter(o => orderKind(o) === 'takeaway').length;
            const delivery = filteredOrders.filter(o => orderKind(o) === 'delivery').length;

            const html = `
                <div class="text-center pb-3 border-b-2 border-dashed border-gray-800">
                    <h2 class="font-black text-base">${esc(SETTINGS.resName)}</h2>
                    <p class="text-xs font-extrabold mt-0.5 bg-gray-100 py-1 rounded border border-gray-400">
                        تقرير الإحصائيات (BI)
                    </p>
                    <p class="text-[10px] mt-1">من: ${fromVal} | إلى: ${toVal}</p>
                </div>
                <div class="py-2.5 border-b border-dashed border-gray-800 space-y-1.5 text-[11px]">
                    <div class="flex justify-between">
                        <span>إجمالي الإيرادات:</span>
                        <span class="font-bold">${totalRev.toFixed(2)} ${SETTINGS.currency}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>إجمالي الفواتير:</span>
                        <span class="font-bold">${totalOrds}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>الوجبات المباعة:</span>
                        <span class="font-bold">${itemsSold}</span>
                    </div>
                </div>
                <div class="py-2.5 space-y-1.5 text-[11px]">
                    <p class="font-black underline mb-1">تفصيل الطلبات:</p>
                    <div class="flex justify-between">
                        <span>صالة:</span>
                        <span class="font-bold">${dineIn}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>سفري (تيك أواي):</span>
                        <span class="font-bold">${takeaway}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>دليفري:</span>
                        <span class="font-bold">${delivery}</span>
                    </div>
                </div>
            `;
            showThermalPreviewModal("طباعة تقرير الإحصائيات", html);
        }

