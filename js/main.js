/* ===================================================
   CRYSTAL FASHION - Main JavaScript
   =================================================== */

let allProducts = [];
let allBlogPosts = [];
let mobileProductsExpanded = false;
let mobileBlogExpanded = false;

/* ---------- Built-in fallback data ----------
   Ensures the site works even when opened directly
   as a file (double-click) where fetch() is blocked. */

const FALLBACK_BLOG = [
  { id: 1, title: "The Art of Handcrafted Fashion", author: "Crystal Fashion Team", date: "2024-05-20", image: "https://sspark.genspark.ai/i/v0UCtUoskbbrCIbO?width=1200", excerpt: "Discover the meticulous process behind every handcrafted piece and why handmade fashion matters.", content: "In a world of mass production, handcrafted fashion stands as a testament to artistry and dedication. Every piece created by our artisans involves hours of careful work, from selecting the finest materials to the final stitch.\n\nWhen you purchase from Crystal Fashion, you're not just buying a product—you're supporting a living tradition and the livelihoods of skilled craftspeople.", category: "Craftsmanship" },
  { id: 2, title: "Sustainable Fashion: Our Commitment", author: "Crystal Fashion Team", date: "2024-05-15", image: "https://sspark.genspark.ai/i/qp9JrcYgGCXPbRVQ?width=1200", excerpt: "Learn how we're committed to sustainable practices and eco-friendly materials in all our products.", content: "Sustainability is at the heart of everything we do at Crystal Fashion. Our hemp and organic cotton collections are perfect examples of this commitment.", category: "Sustainability" },
  { id: 3, title: "Meet Our Master Artisans", author: "Crystal Fashion Team", date: "2024-05-10", image: "https://sspark.genspark.ai/i/aUyjwtACZUpDrw8F?width=1200", excerpt: "Get to know the talented artisans behind our beautiful creations and their incredible stories.", content: "Behind every Crystal Fashion product is a master artisan with years of experience and a passion for their craft.", category: "Community" },
  { id: 4, title: "Caring for Your Handcrafted Pieces", author: "Crystal Fashion Team", date: "2024-05-05", image: "https://sspark.genspark.ai/i/HlJXgnficctOi5BS?width=1200", excerpt: "Practical tips on how to care for and maintain your handcrafted fashion items.", content: "Investing in handcrafted fashion means investing in quality that lasts. With proper care, your Crystal Fashion pieces can remain beautiful and functional for years to come.", category: "Care Tips" },
  { id: 5, title: "The Future of Nepali Fashion", author: "Crystal Fashion Team", date: "2024-04-30", image: "https://sspark.genspark.ai/i/PNfn7I3Z3SGtZSWr?width=1200", excerpt: "Exploring the evolution of Nepali fashion and its place in the global market.", content: "Nepali fashion has a rich history rooted in centuries of textile tradition and craftsmanship.", category: "Fashion & Culture" },
  { id: 6, title: "Seasonal Collection Preview", author: "Crystal Fashion Team", date: "2024-04-25", image: "https://sspark.genspark.ai/i/eY3Qv4teTs8lCfKC?width=1200", excerpt: "Get an early look at our upcoming seasonal collection and the inspiration behind it.", content: "As we move into the new season, we're thrilled to share a glimpse of what's coming from Crystal Fashion.", category: "Collections" }
];

/* Resolve an image reference: admin-uploaded photos are stored
   as data-URLs / full URLs; catalog photos live in a folder. */
function photoCount(p) {
    let n = 0;
    if (Array.isArray(p.images) && p.images.length) n = p.images.filter(Boolean).length;
    else n = [p.image, p.image2].filter(Boolean).length;
    return n;
}
function imgSrc(image, folder) {
    if (!image) return '';
    if (/^(data:|https?:|blob:)/i.test(image)) return image;
    return 'images/' + folder + '/' + image;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadBlogPosts();
    setupMobileMenu();
    setupHeader();
    setupContactForm();
    setupCounters();
    setupScrollAnimations();
    setCurrentYear();
    setupNavActiveLink();
    setupProductSearch();
    setupFileUpload();
    setupScrollProgress();
    setupCardTilt();
});

// ---- Products ----
async function loadProducts() {
    const grid = document.getElementById('productsGrid');

    // 1) Products saved from the Admin Panel take priority
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem('cf_products') || 'null'); } catch { stored = null; }
    if (Array.isArray(stored) && stored.length) {
        allProducts = stored;
        renderProducts(allProducts);
        return;
    }

    // 2) Try the JSON file, 3) fall back to built-in data
    try {
        const r = await fetch('data/products.json');
        if (!r.ok) throw new Error('Failed to load');
        const data = await r.json();
        allProducts = Array.isArray(data.products) && data.products.length ? data.products : CF_PRODUCTS_FALLBACK;
    } catch {
        allProducts = CF_PRODUCTS_FALLBACK;
    }
    renderProducts(allProducts);
}

function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    if (!list.length) { grid.innerHTML = '<div class="no-results">No products found.</div>'; return; }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const showAll = !isMobile || mobileProductsExpanded || list.length <= 4;
    const visibleList = showAll ? list : list.slice(0, 4);

    grid.innerHTML = visibleList.map((p, i) => {
        const src = imgSrc(p.image, 'products');
        return `
        <div class="product-card fade-in" style="animation-delay:${i * 0.07}s" onclick="window.location.href='product.html?id=${p.id}'">
            <div class="product-image">
                ${src
                    ? `<img src="${escHtml(src)}" alt="${escHtml(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'product-placeholder\\'>${escHtml(p.name)}</div>'">`
                    : `<div class="product-placeholder">${escHtml(p.name)}</div>`
                }
                <span class="product-category-tag">${escHtml(p.category)}</span>
                <span class="badge-wholesale">Wholesale</span>
                ${photoCount(p) > 1 ? `<span class="badge-photos">📷 ${photoCount(p)}</span>` : ""}
            </div>
            <div class="product-body">
                <div class="product-name">${escHtml(p.name)}</div>
                <div class="product-desc">${escHtml(p.description || '')}</div>
                <div class="product-moq">Wholesale only · MOQ 50 pcs</div>
                <div class="product-footer">
                    <span class="product-price">NPR ${Number(p.price).toLocaleString()} <span class="per-pc">/ pc</span></span>
                    <span class="product-btn">View Product →</span>
                </div>
            </div>
        </div>`;
    }).join('');

    if (isMobile && list.length > 4) {
        const buttonLabel = mobileProductsExpanded ? 'Show less' : 'Explore more';
        grid.insertAdjacentHTML('beforeend', `
            <div class="mobile-expand-row">
                <button type="button" class="mobile-expand-btn" data-target="products">${buttonLabel}</button>
            </div>
        `);
        grid.querySelector('.mobile-expand-btn').addEventListener('click', () => {
            mobileProductsExpanded = !mobileProductsExpanded;
            renderProducts(list);
        });
    }

    triggerFadeIn();
}

function filterByCategory(cat) {
    document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.trim() === cat || (cat === 'All' && b.textContent.trim() === 'All'));
    });
    const list = cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat);
    renderProducts(list);
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (window.location.pathname === '/' || window.location.pathname === '/home' || window.location.pathname === '/collection') {
            try { history.replaceState(null, '', 'index.html#products'); } catch (e) {}
        }
    }
}

function setupProductSearch() {
    const s = document.getElementById('productSearch');
    if (!s) return;
    s.addEventListener('input', () => {
        const q = s.value.toLowerCase().trim();
        const list = q ? allProducts.filter(p =>
            String(p.name).toLowerCase().includes(q) ||
            String(p.description || '').toLowerCase().includes(q) ||
            String(p.category || '').toLowerCase().includes(q)
        ) : allProducts;
        renderProducts(list);
    });
}

function openProductModal(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;
    const body = document.getElementById('modalBody');
    if (!body) return;
    const src = imgSrc(p.image, 'products');
    body.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:start;">
            <div style="background:var(--bg-soft);border-radius:12px;overflow:hidden;aspect-ratio:1;">
                ${src
                    ? `<img src="${escHtml(src)}" alt="${escHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">`
                    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">🛍️</div>`
                }
            </div>
            <div>
                <span style="background:var(--lavender);color:var(--primary);padding:.2rem .8rem;border-radius:12px;font-size:.75rem;font-weight:700;">${escHtml(p.category)}</span>
                <h2 style="margin:1rem 0 .5rem;font-size:1.5rem;">${escHtml(p.name)}</h2>
                <p style="color:var(--text-light);line-height:1.7;margin-bottom:1.5rem;">${escHtml(p.description || '')}</p>
                <div style="font-size:2rem;font-weight:700;color:var(--primary);margin-bottom:1.5rem;">NPR ${Number(p.price).toLocaleString()}</div>
                <a href="https://wa.me/9779704828728?text=Hi! I'm interested in the ${encodeURIComponent(p.name)} (NPR ${p.price})" target="_blank"
                   style="display:inline-flex;align-items:center;gap:.5rem;background:#25d366;color:#fff;padding:.75rem 1.5rem;border-radius:30px;font-weight:600;">
                    💬 Enquire on WhatsApp
                </a>
            </div>
        </div>`;
    document.getElementById('productModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ---- Blog ----
function getStoredBlogPosts() {
    try {
        const stored = JSON.parse(localStorage.getItem('cf_blog_posts') || 'null');
        if (Array.isArray(stored) && stored.length) return stored;
    } catch (e) {}
    return [];
}

async function loadBlogPosts() {
    try {
        const stored = getStoredBlogPosts();
        if (stored.length) {
            allBlogPosts = stored;
        } else {
            const r = await fetch('data/blog.json');
            if (!r.ok) throw new Error('Failed to load');
            const data = await r.json();
            allBlogPosts = Array.isArray(data.posts) && data.posts.length ? data.posts : FALLBACK_BLOG;
        }
    } catch {
        allBlogPosts = FALLBACK_BLOG;
    }
    renderBlog(allBlogPosts);
}

function renderBlog(posts) {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const showAll = !isMobile || mobileBlogExpanded || posts.length <= 4;
    const visiblePosts = showAll ? posts : posts.slice(0, 4);

    grid.innerHTML = visiblePosts.map((p, i) => {
        const src = imgSrc(p.image, 'backgrounds');
        return `
        <article class="blog-card fade-in" style="animation-delay:${i * 0.08}s" onclick="openBlogModal(${p.id})">
            <div class="blog-image">
                ${src ? `<img src="${escHtml(src)}" alt="${escHtml(p.title)}" loading="lazy" onerror="this.parentElement.innerHTML='📝'">` : '📝'}
            </div>
            <div class="blog-body">
                <span class="blog-category-tag">${escHtml(p.category)}</span>
                <div class="blog-title">${escHtml(p.title)}</div>
                <div class="blog-excerpt">${escHtml(p.excerpt || '')}</div>
                <div class="blog-meta">
                    <span>✍️ ${escHtml(p.author)}</span>
                    <span class="blog-read-more">Read More</span>
                </div>
            </div>
        </article>`;
    }).join('');

    if (isMobile && posts.length > 4) {
        const buttonLabel = mobileBlogExpanded ? 'Show less' : 'Explore more';
        grid.insertAdjacentHTML('beforeend', `
            <div class="mobile-expand-row">
                <button type="button" class="mobile-expand-btn" data-target="blog">${buttonLabel}</button>
            </div>
        `);
        grid.querySelector('.mobile-expand-btn').addEventListener('click', () => {
            mobileBlogExpanded = !mobileBlogExpanded;
            renderBlog(posts);
        });
    }

    triggerFadeIn();
}

function openBlogModal(id) {
    const p = allBlogPosts.find(x => x.id === id);
    if (!p) return;
    const src = imgSrc(p.image, 'backgrounds');
    document.getElementById('blogModalBody').innerHTML = `
        <span style="background:var(--lavender);color:var(--primary);padding:.2rem .8rem;border-radius:12px;font-size:.75rem;font-weight:700;">${escHtml(p.category)}</span>
        <h2 style="margin:1rem 0 .5rem;font-size:1.8rem;">${escHtml(p.title)}</h2>
        <p style="color:var(--text-light);font-size:.85rem;margin-bottom:1.5rem;">By ${escHtml(p.author)} · ${escHtml(p.date || '')}</p>
        ${src ? `<img src="${escHtml(src)}" style="width:100%;border-radius:12px;margin-bottom:1.5rem;" loading="lazy">` : ''}
        <div style="color:var(--text);line-height:1.8;">${escHtml(p.content || '')}</div>`;
    document.getElementById('blogModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeBlogModal() {
    document.getElementById('blogModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ---- Contact Form ----
function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const btn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoading = document.getElementById('btnLoading');
        const formMessage = document.getElementById('formMessage');

        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        btn.disabled = true;

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(form)
            });

            if (res.ok) {
                form.style.display = 'none';
                document.getElementById('formSuccess').style.display = 'block';
            } else {
                throw new Error('Server error');
            }
        } catch {
            formMessage.textContent = 'Something went wrong. Please try WhatsApp instead.';
            formMessage.className = 'form-message error';
        } finally {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    });
}

function validateForm() {
    let ok = true;
    ['nameError','emailError','messageError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });

    const name = document.getElementById('name')?.value.trim();
    if (!name || name.length < 2) { showErr('nameError', 'Please enter your name'); ok = false; }

    const email = document.getElementById('email')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('emailError', 'Please enter a valid email'); ok = false; }

    const msg = document.getElementById('message')?.value.trim();
    if (!msg || msg.length < 10) { showErr('messageError', 'Message must be at least 10 characters'); ok = false; }

    const fileInput = document.getElementById('attachment');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const f = fileInput.files[0];
        if (!/^image\//.test(f.type)) { showErr('fileError', 'Only image files are allowed.'); ok = false; }
        else if (f.size > MAX_FILE_BYTES) { showErr('fileError', 'File exceeds the 10 MB limit.'); ok = false; }
    }

    return ok;
}

function showErr(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function resetForm() {
    document.getElementById('contactForm').reset();
    if (window.__cfClearFile) window.__cfClearFile();
    document.getElementById('contactForm').style.display = 'block';
    document.getElementById('formSuccess').style.display = 'none';
}

// ---- Counter Animation ----
function setupCounters() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target || el.textContent);
            if (isNaN(target)) return;
            animateCount(el, target);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(el => obs.observe(el));
}

function animateCount(el, target) {
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target + '+';
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current) + '+';
        }
    }, 16);
}

// ---- Scroll Animations ----
function setupScrollAnimations() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.fade-in, .feature-card, .category-card, .stat-card, .sg-card').forEach(el => obs.observe(el));
    document.querySelectorAll('.section-header, .about-text, .about-stats, .contact-info, .form-wrapper, .location-info, .location-map, .connect-cta-strip').forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = ((i % 4) * 0.08) + 's';
        obs.observe(el);
    });
}

function triggerFadeIn() {
    requestAnimationFrame(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
    });
}

// ---- Mobile Menu ----
function setupMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('navMenu');
    if (!btn || !menu) return;

    const setMenuState = (isOpen) => {
        menu.classList.toggle('active', isOpen);
        btn.classList.toggle('open', isOpen);
        document.body.classList.toggle('menu-open', isOpen && window.innerWidth <= 768);
    };

    btn.addEventListener('click', () => {
        const willOpen = !menu.classList.contains('active');
        setMenuState(willOpen);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.header')) {
            setMenuState(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            setMenuState(false);
        }
    });
}

// ---- Sticky Header ----
function setupHeader() {
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
}

// ---- Active Nav Link ----
function setupNavActiveLink() {
    const sections = [...document.querySelectorAll('section[id]')];
    const links = [...document.querySelectorAll('.nav-link')];

    const routeById = {
        home: '#home',
        about: '#about',
        products: '#products',
        blog: '#blog',
        connect: '#connect',
        contact: '#contact'
    };

    const normalizeHash = (href) => {
        if (!href) return '';
        const hashIndex = href.indexOf('#');
        return hashIndex >= 0 ? href.slice(hashIndex) : '';
    };

    const setActiveLink = (id) => {
        if (!id) return;
        const targetHash = routeById[id] || '#home';
        links.forEach(l => {
            const href = normalizeHash(l.getAttribute('href') || '');
            const match = href === targetHash;
            l.classList.toggle('active', match);
        });

        const currentHash = window.location.hash || '#home';
        if (currentHash !== targetHash) {
            try { history.replaceState(null, '', `${window.location.pathname}${targetHash}`); } catch (e) {}
        }
    };

    const getCurrentSectionId = () => {
        let bestId = 'home';
        let bestDistance = Number.POSITIVE_INFINITY;
        const center = window.innerHeight * 0.45;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top - center);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestId = section.id;
            }
        });

        return bestId;
    };

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
            setActiveLink(visible[0].target.id);
            return;
        }

        setActiveLink(getCurrentSectionId());
    }, { threshold: [0.2, 0.45, 0.7], rootMargin: '0px 0px -12% 0px' });

    sections.forEach(section => observer.observe(section));

    links.forEach(link => {
        link.addEventListener('click', (event) => {
            const rawHref = link.getAttribute('href') || '';
            const hrefHash = normalizeHash(rawHref);
            if (!hrefHash) return;

            const matched = Object.entries(routeById).find(([, value]) => value === hrefHash);
            if (matched) {
                event.preventDefault();
                const id = matched[0];
                const target = document.getElementById(id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                setActiveLink(id);
                try { history.pushState(null, '', `${window.location.pathname}${hrefHash}`); } catch (e) {}
            }
        });
    });

    const initialRoute = location.pathname;
    const matchedInitial = Object.entries(routeById).find(([, value]) => value === initialRoute);
    if (matchedInitial) {
        const target = document.getElementById(matchedInitial[0]);
        if (target) {
            requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
            });
        }
    }
}

// ---- Helpers ----
function setCurrentYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Close modals on backdrop click
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) {
        closeProductModal();
        closeBlogModal();
    }
});

// Close on Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProductModal(); closeBlogModal(); }
});

/* ===================================================
   PREMIUM EXTRAS + CUSTOM-ORDER UPLOAD (v4)
   =================================================== */

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB hard limit

// ---- Scroll progress bar ----
function setupScrollProgress() {
    let bar = document.getElementById('scrollProgress');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'scrollProgress';
        document.body.prepend(bar);
    }
    const update = () => {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? h.scrollTop / max : 0) + ')';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
}

// ---- Subtle 3D tilt on gallery cards ----
function setupCardTilt() {
    if (window.matchMedia('(hover: none)').matches) return;
    const SELECTOR = '.product-card, .blog-card, .sg-card';
    document.addEventListener('mousemove', e => {
        const card = e.target.closest ? e.target.closest(SELECTOR) : null;
        if (!card) return;
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
    });
    document.addEventListener('mouseout', e => {
        const card = e.target.closest ? e.target.closest(SELECTOR) : null;
        if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
    });
}

// ---- Custom-order image upload (images only, <= 10 MB) ----
function setupFileUpload() {
    const input = document.getElementById('attachment');
    if (!input) return;
    const drop = document.getElementById('fileDrop');
    const preview = document.getElementById('filePreview');
    const previewImg = document.getElementById('filePreviewImg');
    const nameEl = document.getElementById('fileName');
    const sizeEl = document.getElementById('fileSize');
    const errEl = document.getElementById('fileError');
    const removeBtn = document.getElementById('fileRemove');

    const fmt = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

    function clearFile(msg) {
        input.value = '';
        preview.style.display = 'none';
        drop.style.display = '';
        errEl.textContent = msg || '';
        drop.classList.toggle('file-invalid', !!msg);
    }
    window.__cfClearFile = () => clearFile('');

    function handle(file) {
        errEl.textContent = '';
        drop.classList.remove('file-invalid');
        if (!file) return;
        if (!/^image\//.test(file.type)) {
            clearFile('Only image files are allowed (PNG, JPG, WEBP).');
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            clearFile('"' + file.name + '" is ' + fmt(file.size) + ' \u2014 the maximum allowed is 10 MB.');
            return;
        }
        nameEl.textContent = file.name;
        sizeEl.textContent = fmt(file.size);
        const reader = new FileReader();
        reader.onload = ev => {
            previewImg.src = ev.target.result;
            preview.style.display = 'flex';
            drop.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    input.addEventListener('change', () => handle(input.files[0]));
    removeBtn.addEventListener('click', e => { e.preventDefault(); clearFile(''); });

    ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('dragging'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('dragging'); }));
    drop.addEventListener('drop', e => {
        const f = e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f) return;
        try {
            const dt = new DataTransfer();
            dt.items.add(f);
            input.files = dt.files;
        } catch {}
        handle(f);
    });
}
