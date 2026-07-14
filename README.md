# Biscuit Pet Co. — Shopify Theme

A complete Shopify Online Store 2.0 theme built from the Biscuit Pet Co. design system.
Navy · Cream · Gold · Playfair Display + Montserrat.

---


## Quick-start (for your client demo)

### Step 1 — Create a Shopify development store

1. Go to **partners.shopify.com** → Log in (or create a free Partner account)
2. Click **Stores** → **Add store** → **Development store**
3. Give it a name like `biscuit-demo` and click **Save**
4. Open the store admin (e.g. `biscuit-demo.myshopify.com/admin`)

---

### Step 2 — Upload the theme

**Option A — Shopify CLI (recommended)**

```bash
# Install Shopify CLI if you don't have it
npm install -g @shopify/cli @shopify/theme

# From the root of this repo
shopify theme push --store=YOUR-STORE.myshopify.com
```

This uploads the entire theme and opens the theme editor automatically.

**Option B — Zip upload (no CLI needed)**

1. Zip the theme folders (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) → `biscuit-theme.zip`
2. In your store admin go to **Online Store → Themes**
3. Click **Add theme → Upload zip file** and select your zip
4. Click **Customize** or **Publish**

---

### Step 3 — Add dummy products (for the demo)

To show real prices, variant pickers, and working "Add to Cart", add a few products:

Go to **Products → Add product** and create these (copy-paste the details):

| Title | Price | Compare-at | Variants | Type | Tags |
|---|---|---|---|---|---|
| Vanilla Bean Cat Litter | $34 | $39 | 5 kg, 10 kg | Cat Litter | bestseller |
| Lavender Calm Cat Litter | $34 | — | 5 kg, 10 kg | Cat Litter | new |
| Wild Salmon Cat Cuisine | $28 | — | 1.5 kg, 4 kg | Cat Food | new |
| Cloud Bouclé Pet Bed | $128 | — | Medium, Large | Accessory | new |

For the **product image**, use `litter-vanilla-cutout.png` (included in `/assets`).

> **Tip for the demo:** You only need Vanilla Bean Litter to show the full homepage.
> The "Bestsellers" section will show placeholder cards until a collection is connected.

---

### Step 4 — Create collections

Go to **Products → Collections → Create collection**:

| Title | Handle | What to add |
|---|---|---|
| All Products | `all` | All products |
| Cat Litter | `cat-litter` | Litter products |
| Food & Treats | `food-treats` | Food products |
| Dog | `dog` | Dog products |
| Accessories | `accessories` | Bowls, beds |
| Bestsellers | `bestsellers` | Your top 4 products |

---

### Step 5 — Wire up the theme in the editor

Open **Online Store → Themes → Customize** and configure each section:

#### Hero (top of page)
- Upload your product cutout PNG as the **Packshot** image
- Set **Primary CTA URL** → your main product page (e.g. `/products/vanilla-bean-cat-litter`)
- Set **Secondary CTA URL** → `/collections/all`
- The **A/B/C picker** at the bottom lets you (and your client) switch between 3 hero layouts live

#### Featured Product
- Click **Select product** → choose *Vanilla Bean Cat Litter*
- Price, variants, and Add to Cart will all pull live from Shopify

#### Bestsellers
- Click **Select collection** → choose *Bestsellers*
- Products appear automatically

#### Shop by Companion tiles
- Set **Tile 1 URL** → `/collections/cat-litter`
- Set **Tile 2 URL** → `/collections/dog`
- Set **Tile 3 URL** → `/collections/accessories`

#### Header
- Create a **main-menu** navigation in **Online Store → Navigation**
- Add links: Shop All, Cat Litter, Food & Treats, Dog, Home

#### Footer
- Update copyright year and brand blurb as needed
- The newsletter form shows a confirmation toast (no email integration by default — see below)

---

## For the client demo: what to show

Walk through these in order:

1. **Hero A/B/C picker** — click A, B, C at the bottom to show 3 visual directions
2. **Add to Cart** on the Featured Product → mini-cart drawer opens with free-shipping progress bar
3. **Mobile view** — resize browser to 390px wide — fully responsive
4. **Theme editor** — show the client they can change hero text, images, CTAs without code

---

## File structure

```
├── assets/
│   ├── biscuit.css          ← Full design system (colours, type, layout, components)
│   ├── biscuit.js           ← Cart AJAX, mini-drawer, icons, hero picker, animations
│   ├── mascot-gold.png      ← Gold outline cat mascot
│   ├── mascot-navy.png      ← Navy cat mascot
│   ├── monogram-gold.png    ← B monogram (gold)
│   ├── monogram-navy.png    ← B monogram (navy)
│   ├── seal.png             ← "Biscuit Approved" spinning seal badge
│   ├── wordmark-cream.png   ← Cream wordmark (for dark backgrounds)
│   ├── wordmark-navy.png    ← Navy wordmark (for light backgrounds)
│   └── litter-vanilla-cutout.png  ← Demo product image
├── config/
│   ├── settings_schema.json ← Theme settings definition (colours, fonts, cart)
│   └── settings_data.json   ← Default values
├── layout/
│   └── theme.liquid         ← Master layout (head, header, footer, cart drawer)
├── locales/
│   └── en.default.json      ← English strings
├── sections/
│   ├── announcement-bar.liquid   ← Top navy bar with shipping message
│   ├── header.liquid             ← Sticky header + mobile nav drawer
│   ├── hero.liquid               ← 3-variant hero (A/B/C picker)
│   ├── trust-strip.liquid        ← 5-feature navy trust band
│   ├── featured-product.liquid   ← Bestseller spotlight with size picker
│   ├── shop-by-companion.liquid  ← 3 category tiles (Cats / Dogs / Home)
│   ├── bestsellers.liquid        ← 4-up product grid from a collection
│   ├── brand-story.liquid        ← Navy brand story with mascot
│   ├── biscuit-difference.liquid ← 4-step "why it works" section
│   ├── reviews.liquid            ← Review cards with star ratings
│   ├── footer.liquid             ← Full footer with newsletter + nav columns
│   ├── main-collection.liquid    ← Collection page grid
│   └── main-product.liquid       ← Product page with variant picker
├── snippets/
│   └── product-card.liquid       ← Reusable product card component
└── templates/
    ├── index.json            ← Homepage (section order + default settings)
    ├── collection.json       ← Collection page
    └── product.json          ← Product page
```

---

## Connecting a real newsletter service

The newsletter form currently shows a toast confirmation. To connect to Klaviyo, Mailchimp, or Shopify Email:

**Klaviyo (most common for Shopify):**
1. Install the Klaviyo app from the Shopify App Store
2. Replace the `<form class="newsletter">` in `sections/footer.liquid` with the Klaviyo embed code
3. Or use Klaviyo's Shopify integration which auto-captures all newsletter submissions

**Mailchimp:**
Replace the form action in `footer.liquid`:
```html
<form action="https://YOUR-LIST.us1.list-manage.com/subscribe/post?u=XXX&id=YYY" method="post">
```

---

## Connecting a reviews app

The reviews section currently shows 3 static demo reviews. For real reviews:

1. Install **Judge.me** or **Loox** from the Shopify App Store (both have free plans)
2. In `sections/reviews.liquid`, replace the `<div id="reviews-grid">` with the app's embed code
3. The section heading and rating score can stay — just swap the grid content

---

## Going live

When your client is ready to launch:

1. **Add a custom domain** — Shopify admin → Settings → Domains
2. **Set up payments** — Settings → Payments (Shopify Payments or Stripe)
3. **Enable Shopify Email or Klaviyo** for the newsletter
4. **Add a reviews app** (Judge.me recommended — has a free plan)
5. **Upload real product photos** — transparent PNGs work best for the floating packshot effect
6. **Remove the hero picker** — in `biscuit.js` find the "Hero picker" comment block and delete it (it's a design tool, not for production)

---

## Brand colours (for reference)

| Name | Hex |
|---|---|
| Navy | `#000040` |
| Cream | `#F2EAD3` |
| Gold | `#D4AF37` |
| Gold deep | `#B68F28` |
| Gold light | `#E7CE83` |
| Page bg | `#FBF7EC` |
| Page 2 | `#F4ECDA` |

Fonts: **Playfair Display** (headings) + **Montserrat** (body) — loaded from Google Fonts.
