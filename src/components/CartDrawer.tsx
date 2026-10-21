import React, { useRef } from 'react';
import { useStore } from '../store/useStore';
import { CONFIG, toArabicDigits } from '../utils/format';

export const CartDrawer: React.FC = () => {
  const { cart, customer, isCartOpen, setCartOpen, updateCartQty, removeFromCart, setCustomer, lookupItem, showToast } = useStore();
  const phoneRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLTextAreaElement>(null);

  const resolvedItems = cart.map((c) => { const info = lookupItem(c.k); return info ? { ...c, ...info } : null; }).filter((x): x is NonNullable<typeof x> => x !== null);
  const totalAmount = resolvedItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  const sendOrder = () => {
    if (!resolvedItems.length) return;
    const name = customer.name.trim(), phone = customer.phone.trim(), addr = customer.addr.trim(), notes = customer.notes.trim();
    if (!phone || !addr) {
      showToast('من فضلك اكتب رقم التليفون والعنوان بالتفصيل');
      if (!phone) phoneRef.current?.focus(); else addrRef.current?.focus();
      return;
    }
    const lines = resolvedItems.map((item, idx) => `${toArabicDigits(idx + 1)}. ${item.name} × ${toArabicDigits(item.qty)} = ${toArabicDigits(item.price * item.qty)} ${CONFIG.currency}`);
    const msg = [
      '🍗 *طلب جديد - CHUNKY تشانكي كفر الدوار*',
      '────────────────',
      ...(name ? [`👤 الاسم: ${name}`] : []),
      `📞 الهاتف: ${toArabicDigits(phone)}`,
      `📍 العنوان: ${addr}`,
      ...(notes ? [`📝 ملاحظات: ${notes}`] : []),
      '',
      '🧾 *تفاصيل الطلب:*',
      ...lines,
      '────────────────',
      `💰 *الإجمالي: ${toArabicDigits(totalAmount)} ${CONFIG.currency}*`
    ].join('\n');
    const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    if (!window.open(url, '_blank')) window.location.href = url;
  };

  return (
    <>
      <div onClick={() => setCartOpen(false)} className={`fixed inset-0 bg-black/70 z-30 transition-opacity duration-250 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} />
      <aside aria-label="سلة الطلبات" className={`fixed top-0 right-0 bottom-0 w-[min(430px,100%)] bg-[#181818] text-white z-40 flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 border-l border-neutral-800 ${isCartOpen ? 'translate-x-0' : 'translate-x-[105%]'}`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-800">
          <h2 className="m-0 text-[#ffd000] text-xl font-black">🛒 سلة طلبات تشانكي</h2>
          <button onClick={() => setCartOpen(false)} className="bg-transparent border-0 text-white text-3xl cursor-pointer leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {resolvedItems.length === 0 ? (
            <p className="text-neutral-400 text-center mt-12">السلة فاضية.. اختار وجبتك المقرمشة دلوقتي! 🍗</p>
          ) : (
            resolvedItems.map((item) => (
              <div key={item.k} className="grid grid-cols-[52px_1fr] gap-3 py-3 border-b border-neutral-800">
                {item.img ? <img src={item.img} alt="" className="w-[52px] h-[52px] rounded-xl object-cover" /> : <div className="text-2xl bg-neutral-900 rounded-xl flex items-center justify-center h-[52px]">{item.emoji}</div>}
                <div>
                  <h4 className="m-0 font-bold text-sm">{item.name}</h4>
                  <small className="text-neutral-400">{toArabicDigits(item.price)} {CONFIG.currency}</small>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <button onClick={() => updateCartQty(item.k, -1)} className="w-7 h-7 rounded-lg border border-neutral-700 bg-neutral-900 text-white cursor-pointer">&minus;</button>
                    <b className="min-w-[20px] text-center">{toArabicDigits(item.qty)}</b>
                    <button onClick={() => updateCartQty(item.k, 1)} className="w-7 h-7 rounded-lg border border-neutral-700 bg-neutral-900 text-white cursor-pointer">+</button>
                    <b className="text-[#ffd000] ms-auto">{toArabicDigits(item.price * item.qty)} {CONFIG.currency}</b>
                    <button onClick={() => removeFromCart(item.k)} className="h-7 px-2.5 rounded-lg border border-red-500/60 text-red-400 text-xs cursor-pointer bg-transparent">حذف</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-5 pt-3 border-t border-neutral-800 space-y-2">
          <input value={customer.name} onChange={(e) => setCustomer({ name: e.target.value })} placeholder="الاسم (اختياري)" className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm" />
          <input ref={phoneRef} type="tel" value={customer.phone} onChange={(e) => setCustomer({ phone: e.target.value })} placeholder="رقم التليفون *" className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm" />
          <textarea ref={addrRef} rows={2} value={customer.addr} onChange={(e) => setCustomer({ addr: e.target.value })} placeholder="العنوان بالتفصيل في كفر الدوار *" className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm" />
          <input value={customer.notes} onChange={(e) => setCustomer({ notes: e.target.value })} placeholder="ملاحظات (سبايسي / عادي / نوع الصوص)" className="w-full p-2.5 rounded-xl border border-neutral-700 bg-neutral-900 text-white text-sm" />
        </div>
        <div className="px-5 py-4 border-t border-neutral-800 mt-2">
          <div className="flex justify-between text-lg font-black mb-3 text-[#ffd000]">
            <span>الإجمالي</span>
            <span>{toArabicDigits(totalAmount)} {CONFIG.currency}</span>
          </div>
          <button onClick={sendOrder} disabled={resolvedItems.length === 0} className="w-full bg-[#25d366] text-[#052e16] font-black border-0 rounded-xl p-3.5 cursor-pointer disabled:opacity-40">إرسال الطلب عبر واتساب 💬</button>
        </div>
      </aside>
    </>
  );
};
