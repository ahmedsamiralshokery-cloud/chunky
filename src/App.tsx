import React, { useRef, useState } from 'react';
import { useStore } from './store/useStore';
import { CartDrawer } from './components/CartDrawer';
import { CONFIG, flyToCart } from './utils/format';

export default function App() {
  const { menu, cart, bumpCount, toastMsg, addToCart, setCartOpen, lookupItem } = useStore();
  const [activeCatId, setActiveCatId] = useState<string>(menu.categories[0]?.id || 'offers');
  const cartBtnRef = useRef<HTMLButtonElement>(null);

  const currentCat = menu.categories.find((c) => c.id === activeCatId) || menu.categories[0];
  const categoryItems = menu.items.filter((i) => i.cat === currentCat.id);
  const totalCount = cart.filter((c) => lookupItem(c.k) !== null).reduce((sum, c) => sum + c.qty, 0);

  const handlePriceClick = (key: string, e: React.MouseEvent<HTMLButtonElement>) => {
    addToCart(key);
    flyToCart(e.currentTarget, cartBtnRef.current);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white leading-relaxed pb-16">
      {/* Hero Header */}
      <header className="bg-linear-to-b from-[#ffd000] via-[#ffb700] to-[#111111] text-center pt-9 pb-8 px-4 text-[#111111]">
        <div className="inline-block bg-[#e11d24] text-white font-black text-xs px-4 py-1 rounded-full mb-3 shadow-md">
          🎉 6 سنين قرمشة في كفر الدوار
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-[#111111] drop-shadow-xs">
          CHUNKY
        </h1>
        <p className="font-bold text-sm sm:text-base mt-1 text-neutral-900">
          FRIED CHICKEN & BURGER · ⭐ 4.2 (273+ مراجعة)
        </p>
        <div className="flex justify-center flex-wrap gap-2.5 mt-4">
          <a href={`tel:${CONFIG.deliveryPhone1}`} className="bg-[#111111] text-[#ffd000] font-black no-underline py-2.5 px-5 rounded-full text-sm shadow-lg">
            📞 {CONFIG.deliveryPhone1}
          </a>
          <a href={`tel:${CONFIG.deliveryPhone2}`} className="bg-[#e11d24] text-white font-black no-underline py-2.5 px-5 rounded-full text-sm shadow-lg">
            🛵 بنوصل القرمشة: {CONFIG.deliveryPhone2}
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto py-4 sticky top-0 bg-[#111111]/95 backdrop-blur-xs z-10 border-b border-neutral-800">
          {menu.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap cursor-pointer transition ${
                cat.id === currentCat.id
                  ? 'bg-[#ffd000] text-[#111111] shadow-md scale-105'
                  : 'bg-[#1f1f1f] text-neutral-300 border border-neutral-800 hover:border-[#ffd000]/50'
              }`}
            >
              {cat.emoji} {cat.ar}
            </button>
          ))}
        </div>

        <p className="text-neutral-400 text-xs mt-3 mb-3">
          اضغط على السعر لإضافة الوجبة أو الصنف مباشرة إلى سلة الطلبات 🛒
        </p>

        {/* Menu Items Grid */}
        <div className="space-y-3">
          {categoryItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#1b1b1b] border border-neutral-800 hover:border-[#ffd000]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
            >
              <div className="flex items-start gap-3">
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.ar}
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-700"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-base sm:text-lg text-[#ffd000] m-0">{item.ar}</h3>
                    {item.badge && (
                      <span className="bg-[#e11d24] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.desc && <p className="text-neutral-300 text-xs sm:text-sm mt-1 mb-0">{item.desc}</p>}
                </div>
              </div>

              <div className="flex gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={(e) => handlePriceClick(`${item.id}|s`, e)}
                  className="bg-[#ffd000] hover:bg-[#ffe033] text-[#111111] font-black rounded-xl px-4 py-2 text-sm cursor-pointer active:scale-95 transition flex flex-col items-center min-w-[78px]"
                >
                  {item.p1Label && <span className="text-[10px] font-bold opacity-80">{item.p1Label}</span>}
                  <span>{item.p1} ج +</span>
                </button>
                {item.p2 != null && (
                  <button
                    onClick={(e) => handlePriceClick(`${item.id}|d`, e)}
                    className="bg-[#e11d24] hover:bg-red-600 text-white font-black rounded-xl px-4 py-2 text-sm cursor-pointer active:scale-95 transition flex flex-col items-center min-w-[78px]"
                  >
                    {item.p2Label && <span className="text-[10px] font-bold opacity-90">{item.p2Label}</span>}
                    <span>{item.p2} ج +</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Visit Us Section */}
        <section className="mt-10 bg-[#1b1b1b] border border-neutral-800 rounded-2xl p-5 space-y-2 text-sm">
          <h2 className="text-[#ffd000] text-xl font-black mt-0 mb-2">📍 فروعنا ومواعيد العمل</h2>
          <p>📍 <b>العنوان:</b> أبراج الحلواني، شارع الحدائق، قسم كفر الدوار، محافظة البحيرة</p>
          <p>🕚 <b>مواعيد العمل:</b> مفتوح يومياً حتى الساعة 2:00 صباحاً · الجلوس داخل المكان · طعام سفري · توصيل بدون تلامس</p>
          <div className="pt-2 flex flex-wrap gap-2">
            <a
              href="https://www.google.com/maps/search/?api=1&query=44VF%2B9H+Kafr+El-Dawar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#ffd000] text-[#111111] font-black no-underline py-2.5 px-5 rounded-full text-xs"
            >
              🗺️ افتح الموقع على خرائط جوجل (44VF+9H)
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center text-neutral-500 py-8 px-4 text-xs mt-8 border-t border-neutral-900">
        © CHUNKY Fried Chicken & Burger - كفر الدوار (6 سنين قرمشة)
      </footer>

      {/* Floating Cart Button */}
      <button
        ref={cartBtnRef}
        onClick={() => setCartOpen(true)}
        aria-label="سلة التسوق"
        className="fixed top-[calc(14px+env(safe-area-inset-top,0px))] right-4 z-20 w-14 h-14 rounded-full border-2 border-[#111111] bg-[#ffd000] text-[#111111] cursor-pointer shadow-2xl flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-7 h-7">
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 7H6" />
        </svg>
        <span className={`absolute -top-1 -left-1 min-w-[24px] h-[24px] rounded-full bg-[#e11d24] text-white text-xs font-black flex items-center justify-center transition-transform ${bumpCount ? 'scale-125' : 'scale-100'}`}>
          {totalCount}
        </span>
      </button>

      <CartDrawer />

      {/* Toast Notification */}
      <div className={`fixed left-1/2 bottom-6 bg-[#ffd000] text-[#111111] font-black py-3 px-6 rounded-full z-[60] shadow-xl transition-transform duration-300 ${toastMsg ? '-translate-x-1/2 translate-y-0' : '-translate-x-1/2 translate-y-[120px]'}`}>
        {toastMsg}
      </div>
    </div>
  );
}
