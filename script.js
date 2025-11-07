/* Central site script for Learn & Shop Cart
   - Handles rendering of courses/products
   - LocalStorage-based auth, cart, enrollments
   - Chatbot simulation with localStorage chat history
   - Theme (dark/light), toasts, and filters
*/

const state = { courses: [], products: [], currentUser: null };

// --- Sample courses ---
state.courses = [
  { id: 'c1', title: 'HTML & CSS', category: 'Web', rating: 4.7, price: 0, desc: 'Intro to web building', duration: '6 weeks' },
  { id: 'c2', title: 'JavaScript Basics', category: 'Web', rating: 4.8, price: 19, desc: 'Core JS for web', duration: '8 weeks' },
  { id: 'c3', title: 'Python for Data', category: 'Data', rating: 4.9, price: 29, desc: 'Intro to Python & data', duration: '10 weeks' },
  { id: 'c4', title: 'Advanced JavaScript', category: 'Web', rating: 4.8, price: 39, desc: 'Closures, prototypes, async patterns', duration: '8 weeks' },
  { id: 'c5', title: 'React from Scratch', category: 'Web', rating: 4.9, price: 49, desc: 'Build real UIs with React', duration: '10 weeks' },
  { id: 'c6', title: 'Node.js & APIs', category: 'Web', rating: 4.6, price: 29, desc: 'Backend fundamentals and REST', duration: '8 weeks' },
  { id: 'c7', title: 'Data Structures & Algorithms', category: 'CS', rating: 4.9, price: 59, desc: 'Essential DSA for interviews', duration: '12 weeks' },
  { id: 'c8', title: 'Machine Learning Intro', category: 'Data', rating: 4.7, price: 79, desc: 'Basic ML concepts and pipelines', duration: '10 weeks' },
  { id: 'c9', title: 'DevOps Fundamentals', category: 'DevOps', rating: 4.5, price: 34, desc: 'CI/CD, containers and infra', duration: '6 weeks' },
  { id: 'c10', title: 'UX Design Basics', category: 'Design', rating: 4.4, price: 19, desc: 'User-centered design process', duration: '6 weeks' },
  { id: 'c11', title: 'SQL for Data', category: 'Data', rating: 4.6, price: 24, desc: 'Querying and aggregations', duration: '6 weeks' },
  { id: 'c12', title: 'TypeScript Practical', category: 'Web', rating: 4.8, price: 29, desc: 'Types, generics and patterns', duration: '8 weeks' }
];

// --- 12 sample products ---
state.products = [
  { id: 'p1', title: 'Noise-Cancelling Headphones', category: 'Gadgets', price: 129.99, desc: 'Comfortable ANC headphones', img: 'https://picsum.photos/seed/h1/600/400' },
  { id: 'p2', title: 'Ergonomic Laptop Stand', category: 'Accessories', price: 39.99, desc: 'Adjustable aluminum stand', img: 'https://picsum.photos/seed/ls1/600/400' },
  { id: 'p3', title: 'Mechanical Keyboard', category: 'Gadgets', price: 89.99, desc: 'Tactile switches, RGB', img: 'https://picsum.photos/seed/kb1/600/400' },
  { id: 'p4', title: 'Smartwatch', category: 'Gadgets', price: 149.99, desc: 'Health & notifications', img: 'https://picsum.photos/seed/sw1/600/400' },
  { id: 'p5', title: 'Clean Code (Book)', category: 'Books', price: 24.50, desc: 'A Handbook of Agile Software Craftsmanship', img: 'https://picsum.photos/seed/b1/600/400' },
  { id: 'p6', title: 'You Don’t Know JS (Box)', category: 'Books', price: 34.00, desc: 'Deep dive into JS', img: 'https://picsum.photos/seed/b2/600/400' },
  { id: 'p7', title: 'USB-C Hub', category: 'Accessories', price: 29.99, desc: 'Multiple ports for laptops', img: 'https://picsum.photos/seed/hub1/600/400' },
  { id: 'p8', title: 'Wireless Mouse', category: 'Accessories', price: 19.99, desc: 'Ergonomic wireless mouse', img: 'https://picsum.photos/seed/m1/600/400' },
  { id: 'p9', title: 'Algorithms in JavaScript (Book)', category: 'Books', price: 27.99, desc: 'Practical algorithms', img: 'https://picsum.photos/seed/b3/600/400' },
  { id: 'p10', title: 'Portable SSD 1TB', category: 'Gadgets', price: 99.99, desc: 'Fast external storage', img: 'https://picsum.photos/seed/ssd1/600/400' },
  { id: 'p11', title: 'Blue Light Glasses', category: 'Accessories', price: 15.99, desc: 'Protect your eyes', img: 'https://picsum.photos/seed/gl1/600/400' },
  { id: 'p12', title: 'Programming Interview Tips', category: 'Books', price: 18.50, desc: 'Interview prep & patterns', img: 'https://picsum.photos/seed/b4/600/400' }
];

// filter state
let currentCategoryFilter = 'all';
let currentSearchFilter = '';

// --- Utilities ---
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => Array.from(document.querySelectorAll(sel));

function saveUsers(users) { localStorage.setItem('users', JSON.stringify(users || [])); }
function loadUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }

function getCart() { 
  return JSON.parse(localStorage.getItem('cart') || '[]'); 
}

function saveCart(cart) { 
  localStorage.setItem('cart', JSON.stringify(cart)); 
  updateCartCount(); 
  updateCartUI(); 
}

function updateCartCount() { 
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0); 
  const el = $('#cartCount'); 
  if (el) el.textContent = count;
}

function updateCartUI() {
  const cart = getCart();
  const cartContainer = $('#cartItems');
  const cartTotal = $('#cartTotal');
  
  if (!cartContainer || !cartTotal) return;
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
    cartTotal.textContent = '$0.00';
    return;
  }

  let total = 0;
  cartContainer.innerHTML = cart.map(item => {
    const product = state.products.find(p => p.id === item.id) || 
                   state.courses.find(c => c.id === item.id);
    if (!product) return '';
    
    total += product.price * item.qty;
    
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <h4>${product.title}</h4>
          <p>$${product.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn minus" data-id="${item.id}">-</button>
          <span class="cart-qty">${item.qty}</span>
          <button class="cart-qty-btn plus" data-id="${item.id}">+</button>
          <button class="cart-remove-btn" data-id="${item.id}">×</button>
        </div>
      </div>
    `;
  }).join('');

  cartTotal.textContent = '$' + total.toFixed(2);
}

function addToCart(id) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }
  
  saveCart(cart);
  showToast('Item added to cart');
}

function removeFromCart(id) {
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== id);
  saveCart(newCart);
  showToast('Item removed from cart');
}

function updateCartItemQty(id, delta) {
  const cart = getCart();
  const item = cart.find(item => item.id === id);
  
  if (!item) return;
  
  item.qty += delta;
  
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  
  saveCart(cart);
}

// --- Toasts ---
function showToast(text, type = 'success', timeout = 2200) {
  const container = document.getElementById('toastContainer'); if (!container) return;
  const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = text; container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, timeout);
}

// --- Cart Event Handlers ---
document.addEventListener('click', e => {
  // Cart quantity buttons
  if (e.target.matches('.cart-qty-btn')) {
    const id = e.target.dataset.id;
    const delta = e.target.classList.contains('plus') ? 1 : -1;
    updateCartItemQty(id, delta);
  }
  
  // Cart remove button
  if (e.target.matches('.cart-remove-btn')) {
    const id = e.target.dataset.id;
    removeFromCart(id);
  }

  // Add to cart buttons
  if (e.target.matches('.add-to-cart')) {
    const id = e.target.dataset.id;
    addToCart(id);
  }
});

// --- Rendering ---
function renderCourses(filter = '') {
  const grid = $('#coursesGrid'); grid.innerHTML = '';
  state.courses.forEach(c => {
    if (filter && !c.title.toLowerCase().includes(filter) && filter !== '') return;
    const div = document.createElement('div'); div.className = 'card course-card';
    div.innerHTML = `<h3>${c.title}</h3><p>${c.desc}</p><div class="meta">${c.category} · ${c.duration} · ${c.price === 0 ? 'Free' : '₹' + c.price}</div><div class="card-actions"><button data-id="${c.id}" class="enroll">${c.price === 0 ? 'Enroll' : 'Enroll (₹' + c.price + ')'}</button><button data-id="${c.id}" class="details">Details</button></div>`;
    grid.appendChild(div);
  });
}

function renderProductFilters() {
  const container = $('#productFilters'); if (!container) return;
  const cats = Array.from(new Set(state.products.map(p => p.category)));
  container.innerHTML = '';
  const allBtn = document.createElement('button'); allBtn.className = 'btn filter-btn active'; allBtn.textContent = 'All'; allBtn.dataset.cat = 'all'; container.appendChild(allBtn);
  cats.forEach(cat => { const b = document.createElement('button'); b.className = 'btn filter-btn'; b.textContent = cat; b.dataset.cat = cat; container.appendChild(b); });
}

function renderProducts(search = '') {
  const grid = $('#productsGrid'); grid.innerHTML = '';
  state.products.forEach(p => {
    if (currentCategoryFilter !== 'all' && p.category !== currentCategoryFilter) return;
    if (search && !p.title.toLowerCase().includes(search)) return;
    const div = document.createElement('div'); div.className = 'card product-card';
    div.innerHTML = `<img src="${p.img}" alt="${p.title}"/><h3>${p.title}</h3><p>${p.desc}</p><div class="meta">${p.category} · $${p.price}</div><div class="card-actions"><button data-id="${p.id}" class="add-to-cart">Add to Cart</button></div>`;
    grid.appendChild(div);
  });
}

function applyFiltersAndSearch() { renderProducts(currentSearchFilter); }

// --- Auth ---
function signup(name, email, password) { const users = loadUsers(); if (users.find(u => u.email === email)) return { ok: false, msg: 'Email exists' }; users.push({ name, email, password, enrolled: [], orders: [] }); saveUsers(users); return { ok: true }; }
function login(email, password) { const users = loadUsers(); const u = users.find(x => x.email === email && x.password === password); if (u) { localStorage.setItem('currentUser', JSON.stringify(u)); state.currentUser = u; return true; } return false; }
function logout() { localStorage.removeItem('currentUser'); state.currentUser = null; renderAuth(); }
function loadCurrentUser() { const u = JSON.parse(localStorage.getItem('currentUser') || 'null'); state.currentUser = u; renderAuth(); }

function renderAuth() { const authBtn = $('#authBtn'); if (!authBtn) return; if (state.currentUser) { authBtn.textContent = state.currentUser.name.split(' ')[0]; authBtn.href = 'dashboard.html'; } else { authBtn.innerHTML = '<i class="fa fa-user"></i>'; authBtn.href = 'login.html'; } }

// --- Cart actions ---
function addToCart(item) { const cart = getCart(); const found = cart.find(i => i.id === item.id && i.type === item.type); if (found) { found.qty += 1; } else { cart.push({ ...item, qty: 1 }); } saveCart(cart); }
function addToCartWithNotify(item) { addToCart(item); updateCartCount(); showToast('Item added successfully!', 'success', 1600); }

function enrollCourse(courseId) {
  if (!state.currentUser) { alert('Please login to enroll'); location.href = 'login.html'; return; }
  const users = loadUsers(); const u = users.find(x => x.email === state.currentUser.email);
  if (!u.enrolled) u.enrolled = [];
  if (!u.enrolled.includes(courseId)) u.enrolled.push(courseId);
  saveUsers(users); localStorage.setItem('currentUser', JSON.stringify(u)); state.currentUser = u; alert('Enrolled!');
}

// --- Chatbot ---
const CHAT_KEY = 'chat_history';
function addChatMessage(role, text) { const h = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); h.push({ role, text, ts: Date.now() }); while (h.length > 20) h.shift(); localStorage.setItem(CHAT_KEY, JSON.stringify(h)); renderChatLog(); }

function renderChatLog() { const log = $('#chatLog'); if (!log) return; const items = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); log.innerHTML = ''; items.slice(-10).forEach(it => { const el = document.createElement('div'); el.className = 'chat-msg ' + (it.role === 'user' ? 'user' : 'bot'); el.textContent = it.text; log.appendChild(el); }); log.scrollTop = log.scrollHeight; }

// smarter bot that can perform simple actions (add to cart, show courses, enroll suggestions)
function findProductByName(name) { if (!name) return null; name = name.toLowerCase(); return state.products.find(p => p.title.toLowerCase().includes(name) || p.desc.toLowerCase().includes(name)); }
function findCourseByName(name) { if (!name) return null; name = name.toLowerCase(); return state.courses.find(c => c.title.toLowerCase().includes(name) || c.category.toLowerCase().includes(name)); }

function handleBotCommand(raw) {
  const input = raw.trim().toLowerCase(); // show courses by topic
  const showMatch = input.match(/show (?:me )?(.+?) courses?/i);
  if (showMatch) { const topic = showMatch[1].toLowerCase(); const matches = state.courses.filter(c => c.title.toLowerCase().includes(topic) || c.category.toLowerCase().includes(topic)); if (matches.length === 0) return `I couldn't find courses for "${topic}".`; return 'Here are some courses I found:\n' + matches.slice(0, 6).map(m => `• ${m.title} (${m.price === 0 ? 'Free' : '₹' + m.price})`).join('\n'); }

  // add [X] to cart
  const addMatch = input.match(/add (?:the )?(.+?) to (?:my )?cart/i) || input.match(/add (.+?) to cart/i);
  if (addMatch) { const name = addMatch[1].trim(); const p = findProductByName(name); if (p) { addToCartWithNotify({ ...p, type: 'product' }); return `Added "${p.title}" to your cart.`; } else { return `I couldn't find a product named "${name}". Try a shorter name like "Python book".`; } }

  // enroll in [course]
  const enrollMatch = input.match(/enroll (?:me )?(?:in )?(.+)/i) || input.match(/enroll in (.+)/i);
  if (enrollMatch) {
    const name = enrollMatch[1].trim(); const c = findCourseByName(name); if (!c) return `I couldn't find the course "${name}".`; if (c.price === 0) { // free
      if (!state.currentUser) return 'You need to log in to enroll. Please sign in first.'; // require login
      // enroll directly
      const users = loadUsers(); const u = users.find(x => x.email === state.currentUser.email); if (u) { if (!u.enrolled) u.enrolled = []; if (!u.enrolled.includes(c.id)) { u.enrolled.push(c.id); saveUsers(users); localStorage.setItem('currentUser', JSON.stringify(u)); state.currentUser = u; return `You're enrolled in "${c.title}" — good luck!`; } else return `You're already enrolled in "${c.title}".`; }
    } else { // paid course -> add to cart
      addToCartWithNotify({ id: c.id, title: c.title, price: c.price, type: 'course' }); return `"${c.title}" is a paid course — I've added it to your cart.`;
    }
  }

  // quick search: 'how do i enroll' or 'how to enroll'
  if (/how (?:do i|to) enroll/i.test(input)) return 'To enroll: open the Courses section, click Enroll on the course card. Free courses enroll immediately; paid courses are added to cart.';

  // view cart
  if (/(show|view).*cart|what.*in my cart|cart please/i.test(input)) {
    const cart = getCart(); if (cart.length === 0) return 'Your cart is empty.'; return 'Cart contains:\n' + cart.map(i => `• ${i.title || i.id} x${i.qty} — $${(i.price || 0) * i.qty}`).join('\n');
  }

  // fallback small-talk and hints
  if (input.includes('java') || input.includes('javascript')) return 'Try our JavaScript Basics or Advanced JavaScript courses — check the Courses section to enroll.';
  if (input.includes('python')) return 'Python for Data and Machine Learning Intro are good choices; I can add the Python book to your cart if you like.';
  return 'Hi — I can help find courses or add shop items. Try: "Show me JavaScript courses", "Add Python book to cart", or "Enroll in React".';
}

function botRespond(input) { try { return handleBotCommand(input); } catch (e) { console.error(e); return "Sorry, I couldn't process that request."; } }

// --- Theme (dark/light) ---
function applyTheme(theme) { if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); else document.documentElement.removeAttribute('data-theme'); localStorage.setItem('theme', theme); const icon = document.getElementById('themeIcon'); if (icon) { if (theme === 'dark') { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); } else { icon.classList.remove('fa-sun'); icon.classList.add('fa-moon'); } } }

function initTheme() { const t = localStorage.getItem('theme') || 'light'; applyTheme(t); const btn = document.getElementById('themeToggle'); if (btn) { btn.addEventListener('click', () => { const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; const next = cur === 'dark' ? 'light' : 'dark'; applyTheme(next); }); } }

// initialize theme early so visual flash is minimized
initTheme();

// --- Events & boot ---
document.addEventListener('DOMContentLoaded', () => {
  renderCourses(); renderProductFilters(); renderProducts(); updateCartCount(); loadCurrentUser(); renderChatLog();

  // Search
  const gs = $('#globalSearch'); if (gs) gs.addEventListener('input', (e) => { const q = e.target.value.trim().toLowerCase(); currentSearchFilter = q; renderCourses(q); applyFiltersAndSearch(); });

  // Course actions (delegate)
  document.body.addEventListener('click', e => {
    if (e.target.matches('.add-to-cart')) { const id = e.target.dataset.id; const p = state.products.find(x => x.id === id); addToCartWithNotify({ ...p, type: 'product' }); }
    if (e.target.matches('.enroll')) { const id = e.target.dataset.id; const c = state.courses.find(x => x.id === id); if (c.price > 0) { addToCart({ id: c.id, title: c.title, price: c.price, type: 'course' }); showToast('Course added to cart', 'success'); } else { enrollCourse(id); } }
    if (e.target.matches('.filter-btn')) { const cat = e.target.dataset.cat; currentCategoryFilter = cat; $all('.filter-btn').forEach(b => b.classList.remove('active')); e.target.classList.add('active'); applyFiltersAndSearch(); }
    if (e.target.matches('#showAll')) { currentCategoryFilter = 'all'; $all('.filter-btn').forEach(b => b.classList.remove('active')); $all('.filter-btn').find && $all('.filter-btn').find(b => b.dataset.cat === 'all')?.classList.add('active'); applyFiltersAndSearch(); }
  });

  // mobile nav toggle
  const navToggle = document.getElementById('navToggle'); const mobileNav = document.getElementById('mobileNav'); const mobileClose = document.getElementById('mobileNavClose'); const mobileSearch = document.getElementById('mobileSearch');
  function openMobileNav() { if (!mobileNav) return; mobileNav.setAttribute('aria-hidden', 'false'); navToggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function closeMobileNav() { if (!mobileNav) return; mobileNav.setAttribute('aria-hidden', 'true'); navToggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  if (navToggle) { navToggle.addEventListener('click', () => { const open = mobileNav && mobileNav.getAttribute('aria-hidden') === 'false'; if (open) closeMobileNav(); else openMobileNav(); }); }
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  // close when clicking overlay background
  if (mobileNav) { mobileNav.addEventListener('click', (ev) => { if (ev.target === mobileNav) closeMobileNav(); }); }
  // wire mobile search to global search behavior
  if (mobileSearch) { mobileSearch.addEventListener('input', (e) => { const q = e.target.value.trim().toLowerCase(); currentSearchFilter = q; renderCourses(q); applyFiltersAndSearch(); closeMobileNav(); }); }

  // contact form with client-side validation
  const contactForm = $('#contactForm');
  if (contactForm) {
    const nameEl = $('#contactName'); const emailEl = $('#contactEmail'); const msgEl = $('#contactMessage');
    const getErrorEl = (id) => document.querySelector(`.field-error[data-for="${id}"]`);
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // clear previous errors
      getErrorEl('contactName').textContent = '';
      getErrorEl('contactEmail').textContent = '';
      getErrorEl('contactMessage').textContent = '';

      let valid = true; let firstInvalid = null;
      if (!nameEl.value.trim()) { getErrorEl('contactName').textContent = 'Please enter your name'; valid = false; firstInvalid = firstInvalid || nameEl; }
      const emailVal = (emailEl.value || '').trim();
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!emailVal) { getErrorEl('contactEmail').textContent = 'Please enter your email'; valid = false; firstInvalid = firstInvalid || emailEl; }
      else if (!emailOk) { getErrorEl('contactEmail').textContent = 'Please enter a valid email address'; valid = false; firstInvalid = firstInvalid || emailEl; }
      if (!msgEl.value.trim()) { getErrorEl('contactMessage').textContent = 'Please write a message'; valid = false; firstInvalid = firstInvalid || msgEl; }

      if (!valid) { if (firstInvalid) firstInvalid.focus(); return; }

      // simulated send
      showToast('Thanks — message sent (simulated).', 'success');
      contactForm.reset();
    });

    // clear errors on reset
    contactForm.addEventListener('reset', () => { getErrorEl('contactName').textContent = ''; getErrorEl('contactEmail').textContent = ''; getErrorEl('contactMessage').textContent = ''; });
  }

  // chat widget
  const chatToggle = $('#chatToggle'); const chatWindow = $('#chatWindow'); const chatClose = $('#chatClose'); const chatForm = $('#chatForm');
  if (chatToggle) { chatToggle.addEventListener('click', () => { chatWindow.classList.toggle('hidden'); $('#chatWidget').setAttribute('aria-hidden', chatWindow.classList.contains('hidden')); }); }
  if (chatClose) { chatClose.addEventListener('click', () => { chatWindow.classList.add('hidden'); }); }
  if (chatForm) {
    chatForm.addEventListener('submit', (ev) => {
      ev.preventDefault(); const input = $('#chatInput'); const v = input.value.trim(); if (!v) return; addChatMessage('user', v); input.value = '';
      setTimeout(() => { addChatMessage('bot', '...'); renderChatLog(); }, 150);
      setTimeout(() => { const reply = botRespond(v); const h = JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); if (h.length && h[h.length - 1].text === '...') h[h.length - 1].text = reply; else h.push({ role: 'bot', text: reply }); localStorage.setItem(CHAT_KEY, JSON.stringify(h)); renderChatLog(); }, 750);
    });
  }

  // product filter buttons - delegate handled above

});

// expose some functions for other pages
window.__LSApp = { addToCart: addToCartWithNotify, getCart, saveCart, enrollCourse, login, signup, logout, loadCurrentUser, renderAuth, state };

