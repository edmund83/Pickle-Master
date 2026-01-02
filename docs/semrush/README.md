# SEMrush exports (source-of-truth inputs)
Store raw SEMrush exports here so keyword/page decisions are reproducible.

## Recommended exports
- `keyword-gap_us_YYYY-MM-DD.csv` (Missing + Weak vs competitors)
- `top-pages_sortly_us_YYYY-MM-DD.csv`
- `top-pages_boxhero_us_YYYY-MM-DD.csv`
- `top-pages_fishbowlinventory_us_YYYY-MM-DD.csv`
- `top-pages_inflowinventory_us_YYYY-MM-DD.csv`
- `backlink-gap_YYYY-MM-DD.csv`

## How to use
1. Summarize page decisions back into `docs/WebsiteGuideline.md`:
   - One primary keyword cluster per URL
   - Correct page type (feature/solution/compare/integration/guide/template/tool)
   - Variants assigned to H2/FAQ/body to avoid cannibalization
2. Track execution in `docs/MarketingTodo.md` page register (MCP template path required).

