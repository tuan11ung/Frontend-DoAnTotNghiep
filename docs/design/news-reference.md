# Tin tuc MedConnect

Reference: https://www.vinmec.com/vie/tin-tuc/ (inspected 22/11/2026).

The reference screenshot shows a large lead image on the left, two smaller article cards alongside it, then a latest-news grid. Image, title, excerpt and read-more action form each card. Extracted branding reports Inter, blue #0767AD / #1667C0 and a light background.

Implementation adapts the editorial hierarchy while retaining MedConnect's Manrope font, existing blue palette, header and footer. Proposed widths and 16:10 image ratio are implementation choices, not measured reference dimensions. The captured desktop screenshot does not establish Vinmec's mobile behavior; MedConnect uses one column on phones, two on tablets and three/four on desktop.

Images come from API thumbnailUrl, including signed object-storage URLs. The existing local /images/home/active-living.svg is explicitly labelled as an illustration when a thumbnail is absent or fails. No reference photographs are copied. Current API data has no thumbnails; upload in Super Admin > Health Articles > Edit to replace the fallback. Preserve query-string search, pagination and article-detail API behavior.
