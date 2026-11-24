import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'en' | 'ar';

const arabicTranslations: Record<string, string> = {
  'Toggle navigation': 'تبديل القائمة',
  Breadcrumb: 'مسار التنقل',
  'Switch to English': 'التبديل إلى الإنجليزية',
  'Switch to Arabic': 'التبديل إلى العربية',
  'Browse Shop': 'تصفح المتجر',
  Favorites: 'المفضلة',
  Cart: 'السلة',
  Manager: 'المدير',
  Dashboard: 'لوحة التحكم',
  'Log out': 'تسجيل الخروج',
  'Phone order and delivery service': 'الطلب والتوصيل عبر الهاتف',
  'Orders & Delivery via Phone Call': 'الطلبات والتوصيل عبر الاتصال الهاتفي',
  'Shop Project': 'مشروع المتجر',
  'Fast Delivery & Phone Call Confirmation': 'توصيل سريع وتأكيد الطلب هاتفيًا',
  'Discover Quality Products': 'اكتشف منتجات مميزة',
  'Browse our top-rated collections. Add your favorite items to cart and check out easily. We will call you directly to confirm and arrange immediate delivery!': 'تصفح مجموعاتنا المميزة، وأضف منتجاتك المفضلة إلى السلة. سنتصل بك لتأكيد الطلب وترتيب التوصيل.',
  'Search products by name or keywords...': 'ابحث عن المنتجات بالاسم أو الكلمات المفتاحية...',
  'Explore Categories': 'تصفح الفئات',
  'Filter our catalog by category to find exactly what you need': 'اختر فئة للعثور على ما تبحث عنه',
  'Showing': 'عرض',
  products: 'منتجات',
  'All Categories': 'كل الفئات',
  'Loading...': 'جارٍ التحميل...',
  'Loading items...': 'جارٍ تحميل المنتجات...',
  'No Products Found': 'لم يتم العثور على منتجات',
  'Try choosing another category or clearing your search filter.': 'جرّب اختيار فئة أخرى أو امسح البحث.',
  'Reset Filters': 'إعادة ضبط الفلاتر',
  'Remove from favorites': 'إزالة من المفضلة',
  'Add to favorites': 'إضافة إلى المفضلة',
  'View Details': 'عرض التفاصيل',
  Add: 'أضف',
  'Back to Shop': 'العودة إلى المتجر',
  'Loading product...': 'جارٍ تحميل المنتج...',
  'Product Not Found': 'المنتج غير موجود',
  'The requested product could not be found or has been removed.': 'تعذر العثور على المنتج المطلوب أو ربما تمت إزالته.',
  'Browse All Products': 'تصفح كل المنتجات',
  'Easy Ordering:': 'طلب سهل:',
  'Place order via cart. We will contact you by': 'أكمل الطلب من السلة، وسنتصل بك',
  'phone call': 'هاتفيًا',
  'to verify and arrange fast delivery!': 'لتأكيد طلبك وترتيب التوصيل السريع.',
  'Product Description': 'وصف المنتج',
  Quantity: 'الكمية',
  'Add to Cart': 'أضف إلى السلة',
  'Shopping Cart': 'سلة التسوق',
  'Review items in your cart before checkout (saved in LocalStorage)': 'راجع المنتجات قبل إتمام الطلب. تُحفظ السلة على جهازك.',
  'Clear Cart': 'إفراغ السلة',
  'Your Cart is Currently Empty': 'سلة التسوق فارغة حاليًا',
  'Explore our catalog and find the products you love!': 'تصفح المنتجات واختر ما يناسبك.',
  'Start Shopping': 'ابدأ التسوق',
  Product: 'المنتج',
  Price: 'السعر',
  Subtotal: 'الإجمالي الفرعي',
  Action: 'الإجراء',
  'Remove Item': 'إزالة المنتج',
  'Order Summary': 'ملخص الطلب',
  'Total Items': 'إجمالي المنتجات',
  'Delivery Cost': 'تكلفة التوصيل',
  'Calculated upon phone call': 'تُحدد عبر الاتصال الهاتفي',
  'Estimated Total': 'الإجمالي التقديري',
  'Notice:': 'تنبيه:',
  'All orders are confirmed and delivered directly through': 'يتم تأكيد جميع الطلبات وتوصيلها عبر',
  'phone calls': 'المكالمات الهاتفية',
  'Proceed to Buy': 'متابعة الشراء',
  'Continue Shopping': 'متابعة التسوق',
  'My Favorites': 'منتجاتي المفضلة',
  'Items you saved for later (saved in LocalStorage)': 'المنتجات التي حفظتها لوقت لاحق',
  Saved: 'محفوظ',
  'Your Wishlist is Empty': 'قائمة المفضلة فارغة',
  "You haven't saved any items to your favorites yet.": 'لم تضف أي منتجات إلى المفضلة بعد.',
  'Manager Access Only': 'دخول المدير فقط',
  'Manager Portal': 'بوابة المدير',
  'Sprint 01 Management Dashboard': 'لوحة إدارة المتجر',
  'Manager Email': 'بريد المدير الإلكتروني',
  'Email Address': 'البريد الإلكتروني',
  'you@example.com': 'name@example.com',
  'We will email your order confirmation.': 'سنرسل تأكيد الطلب إلى بريدك الإلكتروني.',
  'Order confirmation email sent to': 'تم إرسال تأكيد الطلب إلى',
  Password: 'كلمة المرور',
  Authenticating: 'جارٍ التحقق...',
  'Log In to Dashboard': 'تسجيل الدخول إلى لوحة التحكم',
  'Default Manager:': 'بيانات المدير الافتراضية:',
  'Fill Demo': 'استخدم البيانات التجريبية',
  Email: 'البريد الإلكتروني',
  'Return to Public Store': 'العودة إلى المتجر',
  'Please provide both email and password': 'أدخل البريد الإلكتروني وكلمة المرور.',
  'Invalid manager credentials': 'بيانات دخول المدير غير صحيحة.',
  'Order Received!': 'تم استلام طلبك!',
  'Thank you,': 'شكرًا لك،',
  'Your order has been successfully placed with status:': 'تم تسجيل طلبك بنجاح وحالته:',
  'Phone Call Confirmation & Delivery': 'تأكيد الطلب والتوصيل هاتفيًا',
  'Our sales team will contact you shortly on': 'سيتواصل معك فريق المبيعات قريبًا على الرقم',
  'to confirm your order details and schedule immediate delivery to:': 'لتأكيد تفاصيل الطلب وترتيب توصيله إلى:',
  'Order Reference ID:': 'رقم الطلب:',
  'Items Count:': 'عدد المنتجات:',
  'Total Payable:': 'المبلغ المستحق:',
  'Customer Notes:': 'ملاحظات العميل:',
  'No Items in Cart to Buy': 'لا توجد منتجات في السلة',
  'Please add products to your cart before proceeding to the checkout page.': 'أضف منتجات إلى السلة قبل الانتقال لإتمام الطلب.',
  'Back to Cart': 'العودة إلى السلة',
  'Buy & Delivery Checkout': 'إتمام الشراء والتوصيل',
  'Complete your details. We finalize delivery and confirmation via phone call.': 'أكمل بياناتك. سنؤكد الطلب والتوصيل عبر الهاتف.',
  'Important:': 'مهم:',
  'Buy and delivery are finalized via': 'يتم تأكيد الشراء والتوصيل عبر',
  'direct phone call': 'اتصال هاتفي مباشر',
  'Please provide a valid active phone number.': 'يرجى إدخال رقم هاتف صحيح ومتاح.',
  'Full Name': 'الاسم بالكامل',
  'e.g. John Doe': 'مثال: أحمد محمد',
  'Phone Number (For Call & Delivery)': 'رقم الهاتف (للتأكيد والتوصيل)',
  'e.g. +1 555-0199 or 01012345678': 'مثال: 01012345678',
  'Our agent will call this number to verify the order.': 'سنتصل بهذا الرقم لتأكيد الطلب.',
  'Delivery Address': 'عنوان التوصيل',
  'Street name, building, apartment/floor, city, state': 'الشارع، المبنى، الشقة أو الطابق، المدينة',
  'Order Notes': 'ملاحظات الطلب',
  '(Optional)': '(اختياري)',
  'Special instructions for delivery, preferred call time, etc.': 'تعليمات التوصيل أو الوقت المناسب للاتصال...',
  'Placing Order...': 'جارٍ إرسال الطلب...',
  'Confirm & Place Order': 'تأكيد وإرسال الطلب',
  'Items in This Order': 'منتجات هذا الطلب',
  'Qty:': 'الكمية:',
  'Order Initial Status': 'حالة الطلب الأولية',
  Opened: 'مفتوح',
  'Total Amount': 'إجمالي المبلغ',
  'Please complete all required fields (Name, Phone, and Address).': 'أكمل الحقول المطلوبة: الاسم والهاتف والعنوان.',
  'Please complete all required fields (Name, Email, Phone, and Address).': 'أكمل الحقول المطلوبة: الاسم والبريد الإلكتروني والهاتف والعنوان.',
  'Please provide a valid email address': 'أدخل عنوان بريد إلكتروني صحيحًا.',
  'Customer name, email, phone number, and delivery address are required': 'الاسم والبريد الإلكتروني ورقم الهاتف وعنوان التوصيل مطلوبة.',
  'Your cart is empty.': 'سلة التسوق فارغة.',
  'Store Operations Dashboard': 'لوحة إدارة المتجر',
  'Sprint 01 • Manage Categories, Items Inventory & Orders': 'إدارة الفئات والمنتجات والمخزون والطلبات',
  'View Storefront': 'عرض المتجر',
  Categories: 'الفئات',
  'Opened Orders': 'الطلبات المفتوحة',
  'Closed Orders': 'الطلبات المغلقة',
  opened: 'مفتوح',
  closed: 'مغلق',
  Orders: 'الطلبات',
  'Items & Inventory': 'المنتجات والمخزون',
  'All Orders': 'كل الطلبات',
  'Opened Only': 'المفتوحة فقط',
  'Closed Only': 'المغلقة فقط',
  'Refresh Orders': 'تحديث الطلبات',
  'No Orders Found': 'لا توجد طلبات',
  'Orders placed by customers will appear here for phone confirmation and status tracking.': 'ستظهر هنا طلبات العملاء لمتابعة التأكيد الهاتفي وحالة التوصيل.',
  item: 'منتج',
  items: 'منتجات',
  'View details': 'عرض التفاصيل',
  'Close Order': 'إغلاق الطلب',
  'Reopen Order': 'إعادة فتح الطلب',
  'Product Inventory': 'مخزون المنتجات',
  'Item Quantity': 'كمية المنتج',
  'is only visible and editable in this Manager interface.': 'تظهر وتُعدّل في لوحة المدير فقط.',
  'Add New Item': 'إضافة منتج جديد',
  'Add New Product': 'إضافة منتج جديد',
  Actions: 'الإجراءات',
  'Edit Product': 'تعديل المنتج',
  'Product Name': 'اسم المنتج',
  'English Name': 'الاسم بالإنجليزية',
  'Arabic Name': 'الاسم بالعربية',
  'English Description': 'الوصف بالإنجليزية',
  'Arabic Description': 'الوصف بالعربية',
  Category: 'الفئة',
  'Select Category': 'اختر الفئة',
  'Stock Quantity': 'كمية المخزون',
  'Manager View': 'عرض المدير',
  'Decrease quantity': 'تقليل الكمية',
  'Increase quantity': 'زيادة الكمية',
  'Item Photo (Choose from Device)': 'صورة المنتج (اختر من الجهاز)',
  'Choose Photo from Device': 'اختيار صورة من الجهاز',
  'Item Preview': 'معاينة المنتج',
  'Photo Ready': 'الصورة جاهزة',
  'Photo selected from device': 'صورة مختارة من الجهاز',
  'Remove Photo': 'إزالة الصورة',
  'Select any PNG, JPG, or WebP photo from your device.': 'اختر صورة PNG أو JPG أو WebP من جهازك.',
  Description: 'الوصف',
  Cancel: 'إلغاء',
  'Update Item': 'تحديث المنتج',
  'Create Item': 'إنشاء المنتج',
  Item: 'المنتج',
  'in stock': 'في المخزون',
  Edit: 'تعديل',
  'Item Categories': 'فئات المنتجات',
  'Manage product categories displayed on the public storefront.': 'إدارة الفئات الظاهرة في المتجر.',
  'Add Category': 'إضافة فئة',
  'Edit Category': 'تعديل الفئة',
  'Add New Category': 'إضافة فئة جديدة',
  'Category Name': 'اسم الفئة',
  'Update Category': 'تحديث الفئة',
  'Create Category': 'إنشاء الفئة',
  'Created Date': 'تاريخ الإنشاء',
  'No description provided': 'لا يوجد وصف',
  'Manager Control Panel': 'لوحة تحكم المدير',
  'Order details': 'تفاصيل الطلب',
  'Back to orders': 'العودة إلى الطلبات',
  Placed: 'تاريخ الطلب',
  Items: 'المنتجات',
  Qty: 'الكمية',
  'Order total': 'إجمالي الطلب',
  'Customer note': 'ملاحظة العميل',
  'Manager notes': 'ملاحظات المدير',
  notes: 'ملاحظات',
  'Previous note': 'ملاحظة سابقة',
  'No manager notes yet.': 'لا توجد ملاحظات للمدير بعد.',
  'Write a call update or delivery note': 'اكتب تحديثًا عن الاتصال أو التوصيل...',
  'Add manager note': 'إضافة ملاحظة للمدير',
  'Add note': 'إضافة ملاحظة',
  Customer: 'العميل',
  Name: 'الاسم',
  Phone: 'الهاتف',
  'Loading order...': 'جارٍ تحميل الطلب...',
  'Order not found.': 'الطلب غير موجود.',
  'Could not load this order.': 'تعذر تحميل الطلب.',
  'Note added.': 'تمت إضافة الملاحظة.',
  'Could not add the note.': 'تعذرت إضافة الملاحظة.',
  'Manager notes updated successfully': 'تم تحديث ملاحظات المدير بنجاح.',
  'Failed to save notes': 'تعذر حفظ الملاحظات.',
  'Error loading orders': 'حدث خطأ أثناء تحميل الطلبات.',
  'Error loading items': 'حدث خطأ أثناء تحميل المنتجات.',
  'Error loading categories': 'حدث خطأ أثناء تحميل الفئات.',
  'Failed to update order status': 'تعذر تحديث حالة الطلب.',
  'Failed to save item': 'تعذر حفظ المنتج.',
  'Failed to delete item': 'تعذر حذف المنتج.',
  'Failed to save category': 'تعذر حفظ الفئة.',
  'Failed to delete category': 'تعذر حذف الفئة.',
  'Failed to update item': 'تعذر تحديث المنتج.',
  'Failed to create item': 'تعذر إنشاء المنتج.',
  'Failed to place order. Please try again.': 'تعذر إرسال الطلب. حاول مرة أخرى.',
  'Please provide a product name': 'أدخل اسم المنتج.',
  'Please provide both Arabic and English product names': 'أدخل اسم المنتج بالعربية والإنجليزية.',
  'Please provide both Arabic and English product descriptions': 'أدخل وصف المنتج بالعربية والإنجليزية.',
  'Please provide Arabic and English item names and descriptions': 'أدخل أسماء وأوصاف المنتج بالعربية والإنجليزية.',
  'Arabic and English category names are required': 'اسم الفئة بالعربية والإنجليزية مطلوب.',
  'Arabic and English category names and descriptions are required': 'اسم ووصف الفئة بالعربية والإنجليزية مطلوبة.',
  'A category with this name already exists': 'توجد فئة بهذا الاسم الإنجليزي بالفعل.',
  'Another category with this name already exists': 'توجد فئة أخرى بهذا الاسم الإنجليزي بالفعل.',
  'Please select a product category': 'اختر فئة المنتج.',
  'Please enter a valid price (0 or greater)': 'أدخل سعرًا صحيحًا (صفر أو أكثر).',
  'Please enter a valid stock quantity (0 or greater)': 'أدخل كمية مخزون صحيحة (صفر أو أكثر).',
  'Please select an image file (PNG, JPG, WebP, etc.)': 'اختر ملف صورة (PNG أو JPG أو WebP).',
  'Selected photo is too large. Please select a photo under 10MB.': 'حجم الصورة كبير. اختر صورة أصغر من 10 ميجابايت.',
  'Are you sure you want to delete this item?': 'هل تريد بالتأكيد حذف هذا المنتج؟',
  'Are you sure you want to delete this category?': 'هل تريد بالتأكيد حذف هذه الفئة؟',
  'Category name is required': 'اسم الفئة مطلوب.',
  'Cannot delete category with associated items': 'لا يمكن حذف فئة تحتوي على منتجات.',
  'Item created successfully': 'تمت إضافة المنتج بنجاح.',
  'Item updated successfully': 'تم تحديث المنتج بنجاح.',
  'Item deleted successfully': 'تم حذف المنتج بنجاح.',
  'Category created successfully': 'تمت إضافة الفئة بنجاح.',
  'Category updated successfully': 'تم تحديث الفئة بنجاح.',
  'Category deleted successfully': 'تم حذف الفئة بنجاح.',
  'Order marked as opened': 'تم فتح الطلب.',
  'Order marked as closed': 'تم إغلاق الطلب.',
  'Added': 'تمت إضافة',
  'to cart!': 'إلى السلة!',
  'Are you sure you want to empty your cart?': 'هل تريد بالتأكيد إفراغ سلة التسوق؟',
  'Item deleted': 'تم حذف المنتج',
  'Category deleted': 'تم حذف الفئة',
  'Current photo saved': 'الصورة الحالية محفوظة',
  'The item has been added to your cart.': 'تمت إضافة المنتج إلى السلة.',
  'English': 'English',
  'العربية': 'العربية'
};

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly storageKey = 'modern-shop-language';
  readonly language = signal<AppLanguage>(this.readSavedLanguage());

  constructor() {
    this.applyLanguage(this.language());
  }

  get isArabic(): boolean {
    return this.language() === 'ar';
  }

  toggleLanguage(): void {
    this.setLanguage(this.isArabic ? 'en' : 'ar');
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    localStorage.setItem(this.storageKey, language);
    this.applyLanguage(language);
  }

  translate(value: string | null | undefined): string {
    if (!value || this.language() === 'en') return value || '';

    const addedItem = value.match(/^"(.+)" added to cart!$/);
    if (addedItem) return `تمت إضافة «${addedItem[1]}» إلى السلة.`;

    const addedQuantity = value.match(/^Added (\d+) × "(.+)" to cart!$/);
    if (addedQuantity) return `تمت إضافة ${addedQuantity[1]} من «${addedQuantity[2]}» إلى السلة.`;

    const favoriteChange = value.match(/^(Added|Removed) "(.+)" (to|from) favorites$/);
    if (favoriteChange) {
      return favoriteChange[1] === 'Added'
        ? `تمت إضافة «${favoriteChange[2]}» إلى المفضلة.`
        : `تمت إزالة «${favoriteChange[2]}» من المفضلة.`;
    }

    if (value === 'Added to favorites') return 'تمت الإضافة إلى المفضلة.';
    if (value === 'Removed from favorites') return 'تمت الإزالة من المفضلة.';

    return arabicTranslations[value] || value;
  }

  localized(entity: object | null | undefined, field: string): string {
    if (!entity) return '';
    const values = entity as Record<string, unknown>;
    const english = String(values[`${field}En`] || values[field] || '');
    const arabic = String(values[`${field}Ar`] || english);
    return this.isArabic ? arabic : english;
  }

  private readSavedLanguage(): AppLanguage {
    return localStorage.getItem(this.storageKey) === 'ar' ? 'ar' : 'en';
  }

  private applyLanguage(language: AppLanguage): void {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';

    const bootstrapStylesheet = document.getElementById('bootstrap-theme') as HTMLLinkElement | null;
    if (bootstrapStylesheet) {
      bootstrapStylesheet.href = language === 'ar'
        ? 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css'
        : 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    }
  }
}