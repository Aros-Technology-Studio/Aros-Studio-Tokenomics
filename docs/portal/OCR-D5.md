# D5 — OCR for image-only scans

**Status:** Implemented (optional engine) · residual commercial OCR engines  
**Law:** Assist only — human confirms figures; AST does not appraise.

---

## Problem

Text/PDF extract (`pdf_rough` / `plain_text`) fails on **scanned image-only** packages.  
Operators need a path that still produces **assist hints** without inventing valuations.

---

## Behavior

`POST /v1/documents/extract` (and shared `extractFromBuffer`):

| Input | Mode | Behavior |
|-------|------|----------|
| Text PDF / plain text | `pdf_rough` / `plain_text` | Unchanged |
| PNG / JPEG / WebP / TIFF (by magic + extension) | `image_ocr` or `image_no_ocr` | OCR if engine available |
| PDF with almost no extractable text | `scan_suspect` | Note: likely scan; try OCR on raster export later / manual entry |

### OCR engines (fail-closed to manual)

| Env | Meaning |
|-----|---------|
| `AST_OCR_CMD` | Full command template; `{input}` replaced by temp image path. Stdout = text. |
| Default | If `tesseract` is on `PATH`, run `tesseract {input} stdout -l eng` |
| `AST_OCR_LANG` | Tesseract langs (default `eng`) |
| `AST_OCR_DISABLED=1` | Never invoke OCR |

If no engine: `mode: image_no_ocr`, notes tell operator to enter fields from the visual document after e-sign.

---

## Acceptance

| Check | Evidence |
|-------|----------|
| Image buffer detected | unit tests (magic bytes) |
| OCR path when mock/`tesseract` available | unit test with stub cmd |
| No OCR still returns useful notes | unit test |
| Human confirm required | UI assist disclaimer unchanged |
| Spec | this file |

## Residual

- OCR inside multi-page image-only PDF containers  
- Commercial cloud OCR  
- Handwriting / non-Latin default packs beyond `AST_OCR_LANG`
