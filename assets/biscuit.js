/* ============================================================
   BISCUIT PET CO. — Shopify Theme JavaScript
   Cart (AJAX), UI chrome, scroll effects, hero picker
   ============================================================ */
(function () {
  'use strict';

  /* ---- Icon set ---- */
  const ICONS = {
    clump:   '<path d="M5 19c0-4 3-5 3-9a4 4 0 0 1 8 0c0 4 3 5 3 9"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/>',
    dust:    '<path d="M12 3C9 8 6 10 6 14a6 6 0 0 0 12 0c0-4-3-6-6-11Z"/><path d="M12 16a2.5 2.5 0 0 0 2.5-2.5"/>',
    absorb:  '<path d="M12 3s6 6 6 11a6 6 0 1 1-12 0c0-5 6-11 6-11Z"/>',
    odor:    '<path d="M4 18c4 0 4-3 8-3s4 3 8 3"/><path d="M6 13c0-3 2-5 6-5s6 2 6 5"/><path d="M9 8c.5-2 1.5-3 3-3s2.5 1 3 3"/>',
    mineral: '<path d="M12 3 4 8v8l8 5 8-5V8l-8-5Z"/><path d="M12 3v18M4 8l8 5 8-5"/>',
    leaf:    '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z"/><path d="M5 19c3-5 6-8 11-10"/>',
    shield:  '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
    sparkle: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6" opacity=".5"/><path d="M12 7c.6 2.6 2.4 4.4 5 5-2.6.6-4.4 2.4-5 5-.6-2.6-2.4-4.4-5-5 2.6-.6 4.4-2.4 5-5Z"/>',
    cart:    '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M2.5 3.5H5l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.1a1.5 1.5 0 0 0 1.5-1.2L21 7H6"/>',
    search:  '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user:    '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-5 8-5s6.5 1 8 5"/>',
    close:   '<path d="M5 5l14 14M19 5 5 19"/>',
    menu:    '<path d="M4 7h16M4 12h16M4 17h16"/>',
    check:   '<path d="m4 12 5 5L20 6"/>',
    star:    '<path d="M12 3l2.6 5.7 6.1.7-4.5 4.2 1.2 6L12 17.8 6.6 19.6l1.2-6L3.3 9.4l6.1-.7L12 3Z" fill="currentColor" stroke="none"/>',
    plus:    '<path d="M12 5v14M5 12h14"/>',
    minus:   '<path d="M5 12h14"/>',
    arrow:   '<path d="M4 12h15m-6-6 6 6-6 6"/>'
  };

  function icon(name, cls) {
    if (!ICONS[name]) return '';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' +
      (cls ? ' class="' + cls + '"' : '') + '>' + ICONS[name] + '</svg>';
  }
  window.BPC_ICON = icon;

  function stars(rating) {
    let html = '';
    for (let i = 0; i < 5; i++) html += icon('star');
    return '<span class="stars" style="--r:' + rating + '">' + html + '</span>';
  }
  window.BPC_STARS = stars;

  /* ---- Price (Shopify cart prices are in cents) ---- */
  function fmtPrice(cents) {
    const v = cents / 100;
    return '$' + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2));
  }

  /* ---- Cart state ---- */
  const bpc = window.bpcData || {};
  let cart = bpc.cart || { items: [], item_count: 0, total_price: 0 };
  const routes = bpc.routes || {};
  const A = bpc.assets || {};

  function updateBadge() {
    const c = cart.item_count || 0;
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = c;
      el.classList.toggle('show', c > 0);
    });
  }

  async function fetchCart() {
    const r = await fetch(routes.cart || '/cart.js');
    cart = await r.json();
    updateBadge();
    renderDrawer();
  }

  async function addToCart(variantId, qty) {
    qty = qty || 1;
    try {
      const r = await fetch(routes.cart_add || '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: +variantId, quantity: qty })
      });
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.description || 'Could not add item');
      }
      const item = await r.json();
      await fetchCart();
      toast((item.product_title || 'Item') + ' added');
      openCart();
    } catch (e) {
      toast('Error: ' + e.message);
    }
  }

  async function changeQty(key, qty) {
    try {
      await fetch(routes.cart_change || '/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      });
      await fetchCart();
    } catch (e) { /* silent */ }
  }
  window.BPC_ADD_VARIANT = addToCart;

  /* ---- Cart drawer ---- */
  function buildDrawer() {
    if (document.getElementById('bpc-scrim')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="scrim" id="bpc-scrim"></div>' +
      '<aside class="drawer" id="bpc-drawer" aria-label="Cart">' +
        '<div class="drawer-head"><h3>Your Cart</h3>' +
          '<button class="close" id="bpc-close" aria-label="Close">' + icon('close') + '</button>' +
        '</div>' +
        '<div class="drawer-body" id="bpc-body"></div>' +
        '<div class="drawer-foot" id="bpc-foot"></div>' +
      '</aside>';
    document.body.appendChild(wrap);
    document.getElementById('bpc-scrim').addEventListener('click', closeCart);
    document.getElementById('bpc-close').addEventListener('click', closeCart);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  }

  function openCart() {
    buildDrawer();
    renderDrawer();
    document.getElementById('bpc-scrim').classList.add('open');
    document.getElementById('bpc-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    const s = document.getElementById('bpc-scrim');
    if (!s) return;
    s.classList.remove('open');
    document.getElementById('bpc-drawer').classList.remove('open');
    document.body.style.overflow = '';
  }
  window.BPC_OPEN_CART = openCart;

  function renderDrawer() {
    buildDrawer();
    const body = document.getElementById('bpc-body');
    const foot = document.getElementById('bpc-foot');

    if (!cart.items || !cart.items.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
          (A.mascotNavy ? '<img class="em-cat" src="' + A.mascotNavy + '" alt="">' : '') +
          '<p style="font-family:var(--display);font-size:22px;color:var(--navy);margin-bottom:6px">Your cart is empty</p>' +
          '<p style="font-size:14px">Treat your companion to something premium.</p>' +
          '<a href="/collections/all" class="btn btn--gold" style="margin-top:22px">Shop the Collection</a>' +
        '</div>';
      foot.style.display = 'none';
      return;
    }

    foot.style.display = 'block';
    const sub = cart.total_price;

    body.innerHTML = cart.items.map(item => {
      const img = item.image ? '<img src="' + item.image + '" alt="' + (item.product_title || '') + '">' : '';
      return (
        '<div class="citem">' +
          '<div class="citem-img">' + img + '</div>' +
          '<div class="citem-info">' +
            '<div class="citem-name">' + (item.product_title || item.title) + '</div>' +
            (item.variant_title && item.variant_title !== 'Default Title'
              ? '<div class="citem-var">' + item.variant_title + '</div>' : '') +
            '<div class="qty">' +
              '<button class="bpc-q" data-key="' + item.key + '" data-qty="' + (item.quantity - 1) + '" aria-label="Decrease">' + icon('minus') + '</button>' +
              '<span>' + item.quantity + '</span>' +
              '<button class="bpc-q" data-key="' + item.key + '" data-qty="' + (item.quantity + 1) + '" aria-label="Increase">' + icon('plus') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="citem-right">' +
            '<div class="citem-price">' + fmtPrice(item.final_line_price) + '</div>' +
            '<button class="citem-rm bpc-q" data-key="' + item.key + '" data-qty="0">Remove</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    foot.innerHTML =
      '<div class="row"><span class="subtotal">Subtotal</span>' +
        '<span class="subtotal"><b>' + fmtPrice(sub) + '</b></span></div>' +
      '<div class="note">Shipping &amp; taxes calculated at checkout</div>' +
      '<a href="/checkout" class="btn btn--block btn--lg">Checkout · ' + fmtPrice(sub) + '</a>';

    body.querySelectorAll('.bpc-q').forEach(btn =>
      btn.addEventListener('click', () => changeQty(btn.dataset.key, +btn.dataset.qty))
    );
  }

  /* ---- Toast ---- */
  let toastTimer;
  function toast(msg) {
    const t = document.getElementById('bpc-toast');
    if (!t) return;
    t.innerHTML = icon('check') + '<span>' + msg + '</span>';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  window.BPC_TOAST = toast;

  /* ---- Global delegation ---- */
  document.addEventListener('click', e => {
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); return; }
    const addBtn = e.target.closest('[data-variant-id]');
    if (addBtn && addBtn.dataset.variantId && !addBtn.classList.contains('size-pill')) {
      e.preventDefault();
      addToCart(addBtn.dataset.variantId);
    }
  });

  /* ---- IntersectionObserver (lifted to module scope for re-use) ---- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  /* ---- Init ---- */
  function init() {
    buildDrawer();
    updateBadge();

    /* Header scroll */
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Reveal-on-scroll */
    document.querySelectorAll('[data-reveal]').forEach(el => revealIO.observe(el));

    /* Mobile nav */
    const burger = document.querySelector('.burger');
    const mnav = document.getElementById('mobile-nav');
    if (burger && mnav) {
      let navScrim = document.getElementById('nav-scrim');
      if (!navScrim) {
        navScrim = document.createElement('div');
        navScrim.id = 'nav-scrim';
        navScrim.style.cssText = 'position:fixed;inset:0;z-index:79;background:rgba(0,0,40,.45);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);opacity:0;visibility:hidden;transition:opacity .36s,visibility .36s;cursor:pointer';
        document.body.appendChild(navScrim);
      }
      const openNav  = () => { mnav.classList.add('open'); navScrim.style.opacity='1'; navScrim.style.visibility='visible'; document.body.style.overflow='hidden'; };
      const closeNav = () => { mnav.classList.remove('open'); navScrim.style.opacity='0'; navScrim.style.visibility='hidden'; document.body.style.overflow=''; };
      burger.addEventListener('click', () => mnav.classList.contains('open') ? closeNav() : openNav());
      navScrim.addEventListener('click', closeNav);
      mnav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

      /* Mobile accordion for nested "Products" style menus */
      mnav.querySelectorAll('.mnav-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          const item = btn.closest('[data-mnav-item]');
          const isOpen = item.classList.contains('open');
          item.classList.toggle('open', !isOpen);
          btn.setAttribute('aria-expanded', String(!isOpen));
        });
      });
    }

    /* Desktop mega-menu dropdowns */
    document.querySelectorAll('[data-nav-item]').forEach(item => {
      const trigger = item.querySelector('.nav-trigger');
      const dropdown = item.querySelector('.nav-dropdown');
      if (!trigger || !dropdown) return;
      let closeTimer = null;

      const open = () => {
        clearTimeout(closeTimer);
        document.querySelectorAll('[data-nav-item].open').forEach(other => {
          if (other !== item) closeDropdown(other);
        });
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      };
      const close = () => {
        item.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      };
      const closeDropdown = el => {
        el.classList.remove('open');
        const t = el.querySelector('.nav-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      };
      const scheduleClose = () => { closeTimer = setTimeout(close, 150); };

      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', scheduleClose);
      trigger.addEventListener('click', () => item.classList.contains('open') ? close() : open());
      trigger.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); trigger.blur(); } });
      dropdown.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); trigger.focus(); } });
    });
    document.addEventListener('click', e => {
      document.querySelectorAll('[data-nav-item].open').forEach(item => {
        if (!item.contains(e.target)) {
          item.classList.remove('open');
          const t = item.querySelector('.nav-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    });

    /* Header icon injection */
    [['ic-search','search'],['ic-user','user'],['ic-cart','cart'],['ic-menu','menu']].forEach(([id, name]) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = icon(name);
    });

    /* Hero injected content (decorative icons only — copy is rendered server-side in Liquid) */
    const heroMap = {
      'a-arw':  () => icon('arrow'),
      'a-stars':() => stars(4.9),
      'c-stars':() => stars(4.9)
    };
    Object.entries(heroMap).forEach(([id, fn]) => { const el = document.getElementById(id); if (el) el.innerHTML = fn(); });
    ['cat-arw1','cat-arw2','cat-arw3','bs-arw'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = icon('arrow'); });

    /* Size pill → variant switcher */
    document.querySelectorAll('.size-pills').forEach(pills => {
      pills.querySelectorAll('.size-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          pills.querySelectorAll('.size-pill').forEach(x => x.classList.remove('on'));
          btn.classList.add('on');
          /* Update nearest add-to-cart button */
          const section = btn.closest('section, .section');
          if (section && btn.dataset.variantId) {
            const addBtn = section.querySelector('.bpc-atc');
            if (addBtn) {
              addBtn.dataset.variantId = btn.dataset.variantId;
              const price = btn.dataset.price;
              if (price) addBtn.textContent = 'Add to Cart · ' + fmtPrice(+price);
            }
          }
        });
      });
    });

    /* Newsletter */
    document.querySelectorAll('.newsletter').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        toast('Welcome to the household — check your inbox.');
        form.reset();
      });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

})();
