# Museum Immersive UI/UX Redesign Design

## Summary

Redesign the current Chinese history timeline frontend into a museum-immersive, curator-style experience. The project keeps its two existing core modes, "朝代长卷" and "纪年史记", but upgrades the visual system, layout rhythm, and interaction polish so the app feels like a premium digital exhibition rather than a parchment card list.

The selected direction is:

- Visual direction: 博物馆沉浸
- UX approach: 策展式长卷
- Scope: 视觉 + UX 重构
- Search: remove the current search feature entirely

## Goals

- Make the interface feel高级,好看,有沉浸感 while preserving historical readability.
- Rework the current light parchment style into a dark museum exhibition atmosphere with restrained light, bronze-gold accents, and dynasty color transitions.
- Improve desktop, tablet, and mobile layout hierarchy.
- Keep existing data sources and main interactions intact: dynasty scrolling, view switching, annual year selection, range slider, century anchors, and previous/next year controls.
- Remove the global search UI and related JavaScript behavior so there are no dead controls.

## Non-Goals

- Do not redesign the data model.
- Do not add new historical datasets.
- Do not introduce a large frontend framework.
- Do not add heavy 3D scenes or complex canvas effects.
- Do not create a marketing landing page before the app experience.

## Information Architecture

The app keeps two primary modes.

### 朝代长卷

This remains the primary exhibition hall. The current left-side dynasty elevator becomes a refined "朝代展线". The right-side card stream becomes a sequence of exhibition display cases.

The user experience should feel like moving along a curated museum route:

- The active dynasty node updates as the user scrolls.
- The global accent theme follows the active dynasty.
- Cards enter the viewport with subtle reveal motion.
- Major information stays scannable: dynasty name, years, capital, founder, type, description, and milestones or concurrent states.

### 纪年史记

This becomes the precision archive mode. The existing annual controls remain but are restyled as a compact research console.

The right-side annual card becomes an "年度档案" area:

- The selected year is visually prominent.
- Current regime metadata is clearly visible.
- Event categories remain labeled.
- Major events are highlighted with a premium mark instead of a decorative star badge.
- Empty years still show the existing graceful fallback content.

## Header And Navigation

The header should become a "展厅铭牌" rather than a utility bar.

Desktop layout:

- Left: seal and app title.
- Center: segmented view switch for "朝代长卷" and "纪年史记".
- Right: lightweight contextual status, such as active dynasty or selected year.

Mobile layout:

- Split into stacked rows to avoid crowding.
- Row 1: brand.
- Row 2: view switch.
- Row 3: contextual status or annual controls when needed.

The current search input and search icon are removed from markup and behavior.

## Visual System

Use a dark, premium museum palette:

- Background: deep ink black and warm charcoal.
- Surface: translucent dark display-case panels.
- Accent: dynasty-specific color plus bronze-gold secondary accents.
- Text: warm ivory for primary content, muted parchment gray for metadata.
- Borders: low-opacity warm light lines.
- Shadows: soft depth and restrained glow.

Avoid a one-note single-hue theme. The interface should not become only purple, only brown, only blue, or only beige. Dynasty colors can remain as local accents, but the global system should balance ink, ivory, bronze, muted red, and occasional cool slate.

## Components

### Dynasty Exhibition Line

The dynasty navigation should feel like an exhibit route:

- Slim vertical line on desktop.
- Clear active state with dynasty accent and gentle glow.
- Legible node labels.
- Sticky behavior retained.
- On mobile, convert to a horizontal scrollable exhibition strip.

### Dynasty Display Cards

The current dynasty cards become display-case cards:

- Dark translucent background.
- Fine border and dynasty-colored side or top accent.
- Strong title hierarchy.
- Metadata grouped clearly under the title.
- Badge for "大一统" and "并立期" retained but restyled.
- Milestone axes and concurrency grids restyled to match the museum surface system.

### Annual Control Console

The annual selector panel becomes a compact control console:

- Year input remains easy to edit.
- Previous and next year buttons remain obvious.
- Slider remains usable and readable.
- Century anchors remain dense but polished.
- Focus states are visible and accessible.

### Annual Event Rows

Event rows become archive entries:

- Clear title, category, and description.
- Major events have a refined leading marker or border treatment.
- Category tags preserve distinct colors without becoming loud.
- Text wrapping and spacing must work on mobile.

## Motion

Motion should support immersion without distracting from reading.

- Active dynasty theme transitions smoothly.
- Cards reveal with slight translate and opacity changes.
- View switching uses a subtle fade or lift.
- Annual event list changes with a brief transition.
- Hover states use small shifts, border brightening, or light glow.
- Respect `prefers-reduced-motion` by removing nonessential motion.

## Responsiveness

Desktop:

- Header remains sticky.
- Dynasty view uses left exhibition line plus right content stream.
- Annual view uses left control console plus right archive panel.

Tablet:

- Reduce side gaps and card padding.
- Keep the navigation readable without dominating width.

Mobile:

- Header stacks cleanly.
- Dynasty exhibition line becomes horizontal.
- Cards become single-column with stable spacing.
- Annual control console becomes full-width before the archive list.
- Buttons, tags, and long Chinese text must not overflow or overlap.

## Accessibility And Usability

- Maintain keyboard focus visibility on buttons and inputs.
- Preserve semantic buttons for view switching, year stepping, and anchors.
- Keep contrast high enough for primary text and controls.
- Do not rely on color alone for selected or major states.
- Use stable dimensions for buttons, tags, and controls to avoid layout shifts.

## Implementation Notes

- Keep the app as Vite plus vanilla JavaScript.
- Update `index.html` to remove the search container and add any needed contextual status element.
- Update `src/js/main.js` to remove search setup and related DOM references.
- Preserve existing rendering logic where possible, but add class hooks or small markup changes for the redesigned components.
- Rebuild `src/css/style.css` around the new design tokens and responsive rules.
- Do not alter `public/data/*` unless a rendering bug requires a defensive fix.

## Verification

Run:

- `npm run build`

Manual browser checks:

- Desktop first screen for visual hierarchy and no overlap.
- Mobile first screen for stacked header and readable controls.
- 朝代长卷 scrolling updates active dynasty and theme.
- 纪年史记 view switch works.
- Year input, slider, previous/next year buttons, and century anchors still update the annual events.
- Search UI is absent and no search-related JavaScript errors remain.

