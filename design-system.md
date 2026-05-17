# SantaTech Admin Design System

Derived from the Product Management admin screen in the provided reference image.

## Design Principles

- **Operational first:** prioritize scanning, filtering, and repeated data-management actions over decorative composition.
- **Quiet surfaces:** use light gray work areas, white content panels, and restrained borders.
- **Single clear accent:** use SantaTech orange for primary actions, selected navigation, and brand emphasis.
- **Dense but readable:** table rows, filters, and navigation should fit many records while preserving comfortable hit areas.

## Color Tokens

| Token | Value | Usage |
| --- | --- | --- |
| `--color-brand` | `#ff7a1a` | Primary buttons, active nav indicator, selected icons |
| `--color-brand-hover` | `#ef6f12` | Primary button hover |
| `--color-brand-soft` | `#fff3ea` | Subtle selected nav background when needed |
| `--color-page` | `#f2f2f2` | Main application canvas |
| `--color-surface` | `#ffffff` | Header, sidebar, cards, table rows |
| `--color-surface-muted` | `#f7f7f7` | Table header and low-emphasis strips |
| `--color-border` | `#dfe3e8` | Input, card, and table borders |
| `--color-border-strong` | `#b8bec7` | App header divider |
| `--color-text` | `#050505` | Page titles and primary table text |
| `--color-text-muted` | `#667085` | Secondary copy, labels, inactive nav |
| `--color-text-subtle` | `#8a8f98` | Placeholders and helper text |
| `--color-chip` | `#e4e5e7` | Category and subcategory pills |
| `--color-success` | `#21c56b` | Status dot and active state |
| `--color-success-bg` | `#eafaf1` | Active status badge background |

## Typography

Use a clean sans-serif stack. The screenshot reads closest to `Arial`, `Helvetica Neue`, or a comparable system sans.

| Role | Size | Weight | Line Height | Usage |
| --- | ---: | ---: | ---: | --- |
| Page title | `40px` | `700` | `1.15` | Main page heading, e.g. `สินค้าและบริการ` |
| Section title | `24px` | `700` | `1.25` | Filter card title |
| Result heading | `24px` | `700` | `1.3` | Search result count |
| Nav label | `14px` | `600` | `1.4` | Sidebar item labels |
| Control text | `14px` | `400-600` | `1.4` | Inputs, chips, buttons |
| Table body | `13px` | `400-700` | `1.35` | Product table |
| Meta text | `12px` | `400` | `1.35` | Table headers, descriptions, version |

Text color rules:

- Primary headings use `--color-text`.
- Sidebar and metadata use `--color-text-muted`.
- Placeholders use `--color-text-subtle`.
- Active navigation text uses `--color-brand`.

## Layout

### App Shell

- Overall viewport background outside the app preview: dark charcoal when presenting mockups.
- Application frame: white top bar, white left sidebar, light gray main workspace.
- Top bar height: `62px`.
- Sidebar width: `212px`.
- Main content left padding: `62px`.
- Main content top padding: `32px`.
- Content max width is not constrained in the admin area; data tables should stretch horizontally.

### Sidebar

- Width: `212px`.
- Background: `--color-surface`.
- Right border: `1px solid #edf0f3`.
- Active item:
  - Left border: `4px solid --color-brand`.
  - Text and icon: `--color-brand`.
  - Background: white or very soft orange.
- Item height: `46px`.
- Horizontal padding: `20px`.
- Icon size: `20px`.
- Label gap from icon: `12px`.
- Version label sits at the bottom with uppercase letter spacing.

### Main Content

- Header row contains page title on the left and primary create button on the right.
- Search controls sit below the page title with a compact horizontal layout.
- Result count appears below search and above filters.
- Filter panel aligns to the table width and has a rounded top card feel.

## Spacing Tokens

| Token | Value | Usage |
| --- | ---: | --- |
| `--space-1` | `4px` | Icon/text micro gaps |
| `--space-2` | `8px` | Chip internal spacing, tight groups |
| `--space-3` | `12px` | Form label gaps, table cell padding |
| `--space-4` | `16px` | Button padding, sidebar item groups |
| `--space-5` | `20px` | Card internal padding |
| `--space-6` | `24px` | Section spacing |
| `--space-8` | `32px` | Page header spacing |
| `--space-12` | `48px` | Large vertical separation |

## Radius

| Token | Value | Usage |
| --- | ---: | --- |
| `--radius-sm` | `4px` | Chips, checkboxes |
| `--radius-md` | `6px` | Table image placeholders, compact controls |
| `--radius-lg` | `8px` | Buttons and inputs |
| `--radius-xl` | `14px` | Filter panel |
| `--radius-pill` | `999px` | Search button and range handle |

## Elevation And Borders

- Prefer borders over shadows.
- Filter panel: `1px solid --color-border`, no heavy shadow.
- Table rows: bottom border `1px solid #edf0f3`.
- Inputs: `1px solid #cfd8e3`; focus border should use `--color-brand`.
- Header divider: `1px solid --color-border-strong`.

## Components

### Logo

- Place in the top-left header area.
- Approximate rendered size: `104px` wide by `42px` high.
- Keep clear space around the mark; do not crowd it against sidebar nav.

### Icon Button

- Size: `32px`.
- Icon size: `18-20px`.
- Color: black for utility actions in the table toolbar.
- No visible background by default.
- Hover background: `#f2f4f7`.

### Primary Button

Used for creating new products or services.

```css
.button-primary {
  height: 46px;
  padding: 0 24px;
  border-radius: 4px;
  background: #ff7a1a;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
}
```

Guidelines:

- Include a plus icon before create actions.
- Keep labels direct and action-oriented.
- Minimum width in this screen: `210px`.

### Search Input

```css
.search-input {
  height: 40px;
  width: 266px;
  border: 1px solid #cfd8e3;
  border-radius: 20px;
  padding: 0 16px;
  color: #050505;
}
```

Placeholder:

- Color: `#a2adbd`.
- Text example: `ค้นหาสินค้าและบริการ`.

### Search Button

- Height: `40px`.
- Border radius: pill.
- Background: `--color-brand`.
- Text: white, `14px`, `600`.
- Horizontal padding: `18px`.

### Filter Panel

- Background: `--color-surface`.
- Border: `1px solid --color-border`.
- Border radius: `14px`.
- Padding: `26px 30px 28px`.
- Title includes a funnel icon and `ตัวกรอง`.
- Form layout uses four columns:
  - Category
  - Subcategory
  - Brand
  - Price range
- Column gap: `28px`.

### Filter Field

- Label: `14px`, `600`, black.
- Input height: `32px`.
- Border radius: `6px`.
- Selected values appear as inline chips.
- Chip close icon is subtle gray.

### Range Slider

- Track height: `4px`.
- Active track: black.
- Inactive track: `#ececec`.
- Thumb: white fill, black border, `14px`.
- Value label below: muted gray, `16px`.

### Data Table

Table columns in the product management screen:

| Column | Width Guidance | Alignment |
| --- | --- | --- |
| Select | `48px` | Center |
| Product/service | `320px` | Left |
| SKU | `116px` | Left |
| Category | `150px` | Left |
| Subcategory | `170px` | Left |
| Brand | `100px` | Left |
| Price | `126px` | Left |
| Status | `92px` | Left |

Table header:

- Height: `56px`.
- Background: `--color-surface`.
- Text: `12px`, `400`, `#7a7f87`.
- Border bottom: `1px solid #dfe3e8`.

Table row:

- Height: `122px`.
- Background: `--color-surface`.
- Border bottom: `1px solid #edf0f3`.
- Product image placeholder: `62px` square, `6px` radius, `#d7d7d7`.

Product name:

- `13px`, `700`, black.
- Use two lines when needed.

Product description:

- `12px`, `400`, `#8a8f98`.
- Truncate after one line in dense tables.

### Checkbox

- Size: `14px`.
- Border: `1px solid #cbd5e1`.
- Radius: `2px`.
- Selected state uses brand fill and white check.

### Category Chip

- Background: `--color-chip`.
- Border radius: `6px`.
- Padding: `7px 10px`.
- Text: `12px`, black.
- Allow two lines for Thai category names.

### Status Badge

```css
.status-active {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  background: #eafaf1;
  color: #149653;
  font-size: 12px;
  font-weight: 700;
}
```

- Dot size: `6px`.
- Dot color: `--color-success`.
- Text example: `ACTIVE`.

## Iconography

Use simple outline icons with `2px` stroke. The screenshot uses practical admin icons:

- Product/service: cube/package
- Category: hierarchy or shapes
- Brand: circled letter or badge
- Inventory: warehouse/shelf
- Orders: cart
- Quotations: document
- News: newspaper
- Articles: document list
- Settings: gear
- Filter: funnel
- Import/export: upload and download arrows
- Profile: user outline

Default icon color is `--color-text-muted`; active icon color is `--color-brand`.

## Motion

Keep interactions fast and functional.

- Hover/focus transitions: `120ms ease`.
- Avoid large animation on table rows.
- Buttons may shift only through color, not size.

## Responsive Behavior

- Preserve the sidebar on desktop widths above `1024px`.
- Below `1024px`, collapse sidebar to icon-only or move it behind a navigation drawer.
- Filters should wrap from four columns to two columns, then one column on mobile.
- Product table should keep fixed data columns and scroll horizontally instead of compressing text until unreadable.
- Primary create button moves below the title on narrow screens.

## Example CSS Variables

```css
:root {
  --color-brand: #ff7a1a;
  --color-brand-hover: #ef6f12;
  --color-brand-soft: #fff3ea;
  --color-page: #f2f2f2;
  --color-surface: #ffffff;
  --color-surface-muted: #f7f7f7;
  --color-border: #dfe3e8;
  --color-border-strong: #b8bec7;
  --color-text: #050505;
  --color-text-muted: #667085;
  --color-text-subtle: #8a8f98;
  --color-chip: #e4e5e7;
  --color-success: #21c56b;
  --color-success-bg: #eafaf1;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 14px;
  --radius-pill: 999px;
}
```
