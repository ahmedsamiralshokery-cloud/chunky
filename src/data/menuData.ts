export interface Category {
  id: string;
  ar: string;
  en: string;
  emoji: string;
}

export interface MenuItem {
  id: string;
  cat: string;
  ar: string;
  desc: string;
  p1: number;
  p2?: number | null;
  p1Label?: string;
  p2Label?: string;
  img: string;
  badge?: string;
}

export interface MenuData {
  categories: Category[];
  items: MenuItem[];
}

export const DEFAULT_MENU: MenuData = {
  categories: [
    { id: 'offers', ar: 'عروض تشانكي والبوكسات', en: 'Offers & Boxes', emoji: '🔥' },
    { id: 'broast', ar: 'وجبات البروست', en: 'Broast Meals', emoji: '🍗' },
    { id: 'strips', ar: 'وجبات الاستريبس', en: 'Strips Meals', emoji: '🍖' },
    { id: 'chicken-burger', ar: 'برجر دجاج وتويستر', en: 'Chicken Burger & Twister', emoji: '🍔' },
    { id: 'beef-burger', ar: 'برجر لحم', en: 'Beef Burger', emoji: '🥩' },
    { id: 'pasta-fatta', ar: 'مكرونة وفتة وريزو', en: 'Pasta, Fatta & Rizo', emoji: '🍝' },
    { id: 'fries-appetizers', ar: 'بطاطس ولزوم النقنقة', en: 'Fries & Appetizers', emoji: '🍟' },
    { id: 'kids', ar: 'وجبات الأطفال', en: 'Kids Meals', emoji: '🧸' },
    { id: 'extras', ar: 'زود قرمشة وإضافات', en: 'Extras & Sauces', emoji: '🧀' },
    { id: 'drinks', ar: 'المشروبات', en: 'Drinks', emoji: '🥤' }
  ],
  items: [
    // 1. Offers & Boxes
    { id: 'off-1', cat: 'offers', ar: 'عرض تشانكي #1', desc: '4 قطع بروست + 4 قطع ستريبس + 2 صوص + فرايز + كلوسلو + 6 عيش', p1: 330, img: 'images/offer-1.jpg', badge: 'الأكثر مبيعاً 🔥' },
    { id: 'off-2', cat: 'offers', ar: 'عرض تشانكي #2', desc: '6 قطع بروست + 6 قطع ستريبس + 2 صوص + فرايز + كلوسلو + 6 عيش', p1: 450, img: 'images/offer-2.jpg', badge: 'عرض العيلة' },
    { id: 'off-3', cat: 'offers', ar: 'عرض تشانكي #3', desc: '10 قطع بروست + 2 صوص + فرايز + كلوسلو + 6 عيش', p1: 450, img: 'images/offer-3.jpg', badge: 'توفير' },
    { id: 'off-4', cat: 'offers', ar: 'ميكس بوكس', desc: '4 قطع ستريبس مع أونيون رينج و فرايز أوريجينال و 3 قطع موتزاريلا ستيك وكرينكل فرايز و 2 صوص و 2 ميني بان وكولسلو', p1: 285, img: '' },
    { id: 'off-5', cat: 'offers', ar: 'تشانكي بوكس', desc: '5 تشيكن وينجز مع 4 تشيكن استريبس و فرايز كرينكل و وافل فرايز و كلوسلو و 2 صوص و 2 ميني بان', p1: 285, img: '' },

    // 2. Broast Meals
    { id: 'br-2', cat: 'broast', ar: 'وجبة 2 قطعة بروست', desc: '2 قطعة بروست + 1 صوص + بطاطس + 2 عيش', p1: 134, img: '' },
    { id: 'br-4', cat: 'broast', ar: 'وجبة 4 قطع بروست', desc: '4 قطع بروست + 2 صوص + كلوسلو + بطاطس + 4 عيش', p1: 234, img: '' },
    { id: 'br-6', cat: 'broast', ar: 'وجبة 6 قطع بروست', desc: '6 قطع بروست + 2 صوص + كلوسلو + بطاطس + 6 عيش', p1: 309, img: '' },
    { id: 'br-8', cat: 'broast', ar: 'وجبة 8 قطع بروست', desc: '8 قطع بروست + 2 صوص + كلوسلو + بطاطس + 6 عيش', p1: 399, img: '' },
    { id: 'br-12', cat: 'broast', ar: 'وجبة 12 قطعة بروست', desc: '12 قطعة بروست + 2 صوص + كلوسلو + بطاطس + 6 عيش', p1: 569, img: '' },

    // 3. Strips Meals
    { id: 'st-3', cat: 'strips', ar: 'وجبة 3 قطع ستريبس', desc: '3 قطع ستريبس + 1 صوص + بطاطس + 2 عيش', p1: 134, img: '' },
    { id: 'st-6', cat: 'strips', ar: 'وجبة 6 قطع ستريبس', desc: '6 قطع ستريبس + 2 صوص + كلوسلو + بطاطس + 4 عيش', p1: 234, img: '' },
    { id: 'st-9', cat: 'strips', ar: 'وجبة 9 قطع ستريبس', desc: '9 قطع ستريبس + 2 صوص + كلوسلو + بطاطس + 6 عيش', p1: 309, img: '' },
    { id: 'st-15', cat: 'strips', ar: 'وجبة 15 قطعة ستريبس', desc: '15 قطعة ستريبس + 4 صوص + كلوسلو + بطاطس + 8 عيش', p1: 475, img: '' },

    // 4. Chicken Burger & Twister
    { id: 'cb-1', cat: 'chicken-burger', ar: 'كلاسيك تشيكن', desc: 'صدور الدجاج المقرمشة مع ميلت تشيز ومايونيز وصوص تشانكي والبصل والخس والخيار المخلل', p1: 114, img: '' },
    { id: 'cb-2', cat: 'chicken-burger', ar: 'أنيمال تشيكن', desc: 'صدور الدجاج المقرمشة مع أنيمال صوص وميلت تشيز والبصل والخيار المخلل', p1: 119, img: '' },
    { id: 'cb-3', cat: 'chicken-burger', ar: 'تشيكن ناتشوز', desc: 'صدور الدجاج المقرمشة مع دوريتوس وميلت تشيز وسويت شيلي صوص والطماطم والخس والبصل والخيار المخلل', p1: 119, img: '' },
    { id: 'cb-4', cat: 'chicken-burger', ar: 'تشيكن رانش', desc: 'صدور الدجاج المقرمشة مع ميلت تشيز ورانش صوص والبصل والخيار المخلل', p1: 124, img: '' },
    { id: 'cb-5', cat: 'chicken-burger', ar: 'تشانكي تشيكن', desc: 'صدور الدجاج المقرمشة مع باربكيو صوص وميلت تشيز وأونيون رينج ومايونيز والطماطم والخس والخيار المخلل والبصل', p1: 149, img: '' },
    { id: 'cb-6', cat: 'chicken-burger', ar: 'فاير تشيكن', desc: 'صدور الدجاج المقرمشة مع فاير صوص وفلفل هالابينو وميلت تشيز والخيار المخلل', p1: 114, img: '' },
    { id: 'cb-7', cat: 'chicken-burger', ar: 'كرسبي تويستر', desc: 'قطع دجاج مقرمشة وميلت تشيز مع الطماطم وخس وخيار مخلل وبصل ومايونيز', p1: 109, img: '' },
    { id: 'cb-8', cat: 'chicken-burger', ar: 'جريل تويستر', desc: 'قطع دجاج مشوية مع فلفل ألوان ومشروم وموزاريلا وبصل', p1: 109, img: '' },

    // 5. Beef Burger
    { id: 'bb-1', cat: 'beef-burger', ar: 'أولد سكول', desc: 'شرائح البرجر مع ميلت تشيز وتشانكي صوص والخس والطماطم والبصل والخيار المخلل', p1: 114, img: '' },
    { id: 'bb-2', cat: 'beef-burger', ar: 'فاير أتاك', desc: 'شرائح البرجر مع ميلت تشيز وفلفل هالابينو وفاير صوص والخيار المخلل', p1: 119, img: '' },
    { id: 'bb-3', cat: 'beef-burger', ar: 'كرملايز برجر', desc: 'شرائح البرجر مع ميلت تشيز والبصل المكرمل وباربكيو صوص والخيار المخلل', p1: 119, img: '' },
    { id: 'bb-4', cat: 'beef-burger', ar: 'تشيزي مشروم', desc: 'شرائح البرجر مع قطع المشروم الفريش وبصل مكرمل وميلت تشيز وصوص الرانش والخيار المخلل', p1: 129, img: '' },
    { id: 'bb-5', cat: 'beef-burger', ar: 'بلاك جاك', desc: 'شرائح البرجر مع ميلت تشيز وبيف بيكون وأونيون رينج وتشانكي صوص وباربيكيو صوص والطماطم والخس والبصل والخيار المخلل', p1: 139, img: '' },
    { id: 'bb-6', cat: 'beef-burger', ar: 'هولي ميكس', desc: 'شرائح البرجر مع ميلت تشيز وبيف بيكون مع موتزاريلا ستيك وتشانكي صوص والطماطم والخس والخيار المخلل والبصل', p1: 149, img: '' },
    { id: 'bb-7', cat: 'beef-burger', ar: 'بيف أند تشيكن', desc: 'صدر دجاج مقرمش مع قطعة من البيف وصوص المايونيز وميلت تشيز وخيار وبصل وخس وطماطم', p1: 169, img: '' },

    // 6. Pasta, Fatta & Rizo
    { id: 'pf-1', cat: 'pasta-fatta', ar: 'تشيكن باستا', desc: 'قطع دجاج المقرمشة مع مكرونة وايت صوص وجبنة سايحة وفلفل هالبينو', p1: 119, img: '' },
    { id: 'pf-2', cat: 'pasta-fatta', ar: 'فتة زنجر', desc: 'قطع دجاج مقرمشة مع أرز بسمتيومحمرة مع ثومية أو صوص من اختيارك', p1: 109, img: '' },
    { id: 'pf-3', cat: 'pasta-fatta', ar: 'تشك تشيكن', desc: 'قطع دجاج تشيلي مع بطاطس وفلفل ألوان وجبنة سايحة', p1: 109, img: '' },
    { id: 'pf-4', cat: 'pasta-fatta', ar: 'ماك اند تشيز', desc: 'مكرونة مع الجبنة السايحة', p1: 59, img: '' },
    { id: 'pf-5', cat: 'pasta-fatta', ar: 'ريزو كرسبي', desc: 'أرز ريزو مع قطع الدجاج الكرسبي والصوص', p1: 95, img: '' },
    { id: 'pf-6', cat: 'pasta-fatta', ar: 'أرز بسمتي', desc: 'صغير (29 ج) / كبير (45 ج)', p1: 29, p2: 45, p1Label: 'صغير', p2Label: 'كبير', img: '' },
    { id: 'pf-7', cat: 'pasta-fatta', ar: 'أرز سادة', desc: 'طبق أرز سادة', p1: 25, img: '' },

    // 7. Fries & Appetizers
    { id: 'fa-1', cat: 'fries-appetizers', ar: 'كومبو بطاطس وحاجة ساقعة', desc: 'باكيت بطاطس مقرمشة + مشروب غازي', p1: 49, img: '' },
    { id: 'fa-2', cat: 'fries-appetizers', ar: 'فرنش فرايز / كرنكل فرايز', desc: 'بطاطس مقلية مقرمشة', p1: 39, img: '' },
    { id: 'fa-3', cat: 'fries-appetizers', ar: 'وافل فرايز', desc: 'بطاطس وافل مقرمشة', p1: 60, img: '' },
    { id: 'fa-4', cat: 'fries-appetizers', ar: 'تشيز فرايز', desc: 'فرايز أوريجينال غرقانة جبنة سايحة', p1: 70, img: '' },
    { id: 'fa-5', cat: 'fries-appetizers', ar: 'تشيز ستريبس', desc: 'قطع ستريبس غرقانة جبنة سايحة أو بافلو صوص', p1: 110, img: '' },
    { id: 'fa-6', cat: 'fries-appetizers', ar: 'جار جبنة سايحة', desc: 'برطمان جبنة شيدر سايحة', p1: 89, img: '' },
    { id: 'fa-7', cat: 'fries-appetizers', ar: 'بافلو وينجز (أجنحة دجاج)', desc: 'مع صوص من اختيارك: هني باربكيو أو فاير أو هني ماستر (6 قطع / 12 قطعة)', p1: 99, p2: 189, p1Label: '6 قطع', p2Label: '12 قطعة', img: '' },
    { id: 'fa-8', cat: 'fries-appetizers', ar: '5 أونيون رينجز', desc: 'حلقات بصل مقرمشة', p1: 45, img: '' },
    { id: 'fa-9', cat: 'fries-appetizers', ar: '5 موزاريلا ستيكس', desc: 'أصابع جبنة موزاريلا مقرمشة', p1: 75, img: '' },

    // 8. Kids Meals
    { id: 'kd-1', cat: 'kids', ar: 'ناجتس ميل (وجبة أطفال)', desc: '5 قطع ناجتس مقرمشة مع الفرايز والعصير معلب', p1: 79, img: '' },
    { id: 'kd-2', cat: 'kids', ar: 'نيني ميل (وجبة أطفال)', desc: 'قطعة بروست مع 1 خبز والفرايز والعصير معلب', p1: 89, img: '' },

    // 9. Extras & Sauces
    { id: 'ex-1', cat: 'extras', ar: 'قطعة بروست إضافية', desc: 'زود قرمشة', p1: 59, img: '' },
    { id: 'ex-2', cat: 'extras', ar: 'قطعة ستريبس إضافية', desc: 'زود قرمشة', p1: 42, img: '' },
    { id: 'ex-3', cat: 'extras', ar: 'قطعة دجاج صدر', desc: 'زود قرمشة', p1: 69, img: '' },
    { id: 'ex-4', cat: 'extras', ar: 'قطعة بيف برجر', desc: 'إضافة برجر لحم', p1: 55, img: '' },
    { id: 'ex-5', cat: 'extras', ar: 'مشروم / بيف بيكون / رومي مدخن / هالبينو', desc: 'إضافة بسعر موحد', p1: 20, img: '' },
    { id: 'ex-6', cat: 'extras', ar: 'ميلت تشيز / موزاريلا مبشورة / كلوسلو', desc: 'إضافة بسعر موحد', p1: 15, img: '' },
    { id: 'ex-7', cat: 'extras', ar: 'ميني بن (خبز)', desc: 'قطعة عيش إضافية', p1: 5, img: '' },
    { id: 'ex-8', cat: 'extras', ar: 'اكسترا صوص', desc: 'بافلو - بيج تيستي - سويت شيلي - باربيكيو - فاير - هاني ماسترد - ثومية', p1: 10, img: '' },

    // 10. Drinks
    { id: 'dr-1', cat: 'drinks', ar: 'حاجة ساقعة / في كولا كانز', desc: 'مشروب غازي', p1: 20, img: '' },
    { id: 'dr-2', cat: 'drinks', ar: 'لتر حاجة ساقعة', desc: 'حجم عائلي 1 لتر', p1: 33, img: '' },
    { id: 'dr-3', cat: 'drinks', ar: 'سبيرو سباتس', desc: 'مشروب غازي', p1: 13, img: '' },
    { id: 'dr-4', cat: 'drinks', ar: 'ماكسي كولا / عصير', desc: 'مشروب بارد', p1: 12, img: '' },
    { id: 'dr-5', cat: 'drinks', ar: 'مياه معدنية', desc: 'زجاجة مياه', p1: 7, img: '' }
  ]
};
