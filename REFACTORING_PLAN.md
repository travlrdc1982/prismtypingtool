# REFACTORING PLAN — PRISM Typing Tool Survey

> Comprehensive rename map, dead code audit, fragile code inventory, and missing-element spec.
> Generated 2026-03-21 from cross-reference of `nativedecipher.xml` against `Master Question Map.xlsx`.
> **Status: REVIEW ONLY — no changes applied except where noted.**
>
> **COMPLETED (Change 1):** Converted QMD4 and MAHA3 from `<select uses="sliderpoints.4">` to `<radio type="rating" values="order">`. Removed 4 dead slider CSS/JS blocks.
>
> **COMPLETED (Change 2):** CSS-only visual merge of all 10 `*x99` PNTA fieldsets into parent question tiles. `*x99` questions retained as separate `<checkbox>` elements with `keepWith`.
>
> **CORRECTED:** `noanswer="1"` as a question attribute was rejected by Decipher. Per official Forsta docs, the correct syntax is a `<noanswer label="r99">` **child element** inside the question. Re-implemented using this pattern. All 9 `*x99` `<checkbox>` questions replaced with `<noanswer>` child elements. Dead `setInterval` JS and CSS merge hack removed.

---

## Table of Contents

1. [Variable Rename Map](#1-variable-rename-map)
2. [Dead Code Inventory](#2-dead-code-inventory)
3. [Fragile Code Inventory](#3-fragile-code-inventory)
4. [Escaped XML / Rendering Bugs](#4-escaped-xml--rendering-bugs)
5. [Placeholder / Test Content](#5-placeholder--test-content)
6. [Unused Slider CSS (Global)](#6-unused-slider-css-global)
7. [Missing Questions per Master Spec](#7-missing-questions-per-master-spec)
8. [Missing Hidden Variables / Recodes](#8-missing-hidden-variables--recodes)
9. [Rename Cascade Impact](#9-rename-cascade-impact)
10. [Recommended Execution Order](#10-recommended-execution-order)

---

## 1. Variable Rename Map

Each rename requires updating: the `label=` attribute, all `cond=` references, `keepWith=` pairs, `with=` in `<style>` blocks, CSS `#question_text_*` / `#question_*` selectors, JS `findQ()` calls, and `<exec>` block references.

### Screener / Page 1 Questions

| Current XML Label | Master Spec Variable | Type | Notes |
|---|---|---|---|
| `Start_Info` | `intro_1` | `<html>` | Rename label only |
| `QMD1_intro2` | `intro_typing` | `<html>` | Referenced in CSS `with=`, JS button text |
| `cm1` | `intro_inf360` | `<html>` | Referenced in CSS `with=` |
| `QS1` | `qvote` | `<radio>` | Referenced in custom JS (card-qs1 handler) |
| `QZIP` | `qzip` | `<text>` | Referenced in custom JS (card-qzip handler) |
| `QAGE` | `qage` | `<text>` | Referenced in custom JS (card-qage handler) |
| `QGENDER` | `qgender` | `<radio>` | Referenced in custom JS (card-qgender handler) |
| `QVOTE24` | `q2024vote` | `<radio>` | Referenced in JS, routing logic, `<exec>` blocks |
| `QS5` | `qparty1` | `<radio>` | Referenced in JS (party-btn handler) |
| `QS5A` | `qparty2` | `<radio>` | Referenced in JS, cond= |
| `QS5B` | `qparty3` | `<radio>` | Referenced in JS, cond= |

### Typing Tool / MaxDiff

| Current XML Label | Master Spec Variable | Type | Notes |
|---|---|---|---|
| `QMD4` | `qvector4` | `<radio>` (just converted) | Referenced in CSS `with=`, keepWith, exec |
| `QMD4x99` | `qvector4_pnta` | `<checkbox>` | keepWith pair |
| `VECTOR_JUSTICE` | `vector_justice` | `<radio>` hidden | Referenced in `<exec>` XDEM_SEG block |
| `VECTOR_INDUSTRY` | `vector_industry` | `<radio>` hidden | Referenced in `<exec>` XDEM_SEG block |

### Influence360

| Current XML Label | Master Spec Variable | Type | Notes |
|---|---|---|---|
| `QMD6` | `qinf360` | `<checkbox>` | |
| `QMD7` | `qinf360_orglat` | `<checkbox>` | |
| `QMD88` | `qlowinf` | `<checkbox>` | |
| `QMD89` | `qtot_followers` | `<radio>` | CSS `with=` block |
| `QMD90` | `qsocialinfluence` | `<radio>` | CSS `with=`, JS auto-advance |

### MAHA Section

| Current XML Label | Master Spec Variable | Type | Notes |
|---|---|---|---|
| `MAHA1` | `qmaha_aware` | `<radio>` | cond= refs, keepWith, JS with= |
| `MAHA1x99` | `qmaha_aware_pnta` | `<checkbox>` | keepWith pair |
| `MAHA2` | `qmaha_percep` | `<radio>` | CSS/JS with= blocks |
| `MAHA3` | `qmaha_impression` | `<radio>` (just converted) | cond= refs |
| `MAHA4` | `qmaha_id` | `<radio>` | cond= refs, keepWith, JS with= |
| `MAHA4x99` | `qmaha_id_pnta` | `<checkbox>` | keepWith pair |

### Demographics

| Current XML Label | Master Spec Variable | Type | Notes |
|---|---|---|---|
| `ETHNIC` | `d2` | `<radio>` | CSS/JS with= blocks, hardcoded ans IDs |
| `ETHNICx99` | `d2_pnta` | `<checkbox>` | keepWith pair |
| `RACE` | `d3` | `<radio>` | |
| `VET` | `vet` | `<radio>` | OK — lowercase match. CSS/JS with= blocks |
| `VETx99` | `vet_pnta` | `<checkbox>` | keepWith pair |
| `UNION` | `union` | `<radio>` | OK — lowercase match. CSS/JS with= blocks |
| `UNIONx99` | `union_pnta` | `<checkbox>` | keepWith pair |
| `EDUCATION` | `edu` | `<radio>` | CSS with= block |
| `EDUCATIONx99` | `edu_pnta` | `<checkbox>` | keepWith pair |
| `REL` | `rel` | `<select>` | OK — matches. keepWith |
| `RELx99` | `rel_pnta` | `<checkbox>` | keepWith pair |
| `REL2` | `evangel` | `<radio>` | cond= references REL |
| `HHI` | `income` | `<select>` | keepWith, JS with= |
| `HHIX99` | `income_pnta` | `<checkbox>` | keepWith pair |

### New Media / Close

| Current XML Label | Master Spec Variable | Type | Notes |
|---|---|---|---|
| `cm2` | (keep or rename to `intro_demo`) | `<html>` | Transition text |
| `cm3` | (keep or rename to `intro_newmedia`) | `<html>` | Transition text |
| `HHIX100` | `qmedia_platforms` | `<checkbox>` | |
| `HHIX101` | `qmedia_topics` | `<checkbox>` | |
| `HHIX102` | `qmedia_recency` | `<radio>` cardrating | JS auto-advance |
| `HHIX103` | `qmedia_suggest` | `<radio>` cardrating | keepWith, JS |
| `HHIX103x99` | `qmedia_suggest_pnta` | `<checkbox>` | keepWith pair |
| `HHIX104` | `qmedia_influencers` | `<checkbox>` | Placeholder content! |
| `HHIX105` | `qmedia_trust` | (need to verify) | |
| `HHIXEMAIL` | `optin_email` | `<text>` | verify=email |

---

## 2. Dead Code Inventory

| Line(s) | Label | Type | Reason Dead | Action |
|---|---|---|---|---|
| ~45 | `Start_Info` | `<html>` | `cond="1==2"` — never displayed | **Review**: Is this intentionally hidden? Replaced by custom JS intro? If so, keep. |
| ~2013–2028 | `VECTOR_JUSTICE` | `<radio>` | `cond="1==2"` — hidden from respondents | **Keep**: Used as hidden storage. `<exec>` in XDEM_SEG writes computed values here. |
| ~2030–2045 | `VECTOR_INDUSTRY` | `<radio>` | `cond="1==2"` — hidden from respondents | **Keep**: Same as above — hidden storage for computed vector. |
| ~3815 | row `r1` in `HHIX103x99` | `<row>` | `cond="1==2"` — hidden row | **Review**: Why does this exist? Looks like a dead placeholder row labeled "None". |

---

## 3. Fragile Code Inventory

### 3A. Hardcoded `ans{id}` References (HIGH RISK)

These references use Decipher's auto-generated numeric IDs which change if questions are reordered, duplicated, or the survey is re-uploaded. Every single one is a breakage risk.

| Line | Selector | Question | What It Targets | Impact if Broken |
|---|---|---|---|---|
| ~3100 | `ans18927.0.9` | MAHA2 | Row r10 ("Not Sure") radio | NoneOfThese styling fails |
| ~3189 | `ans19025.0.0` | ETHNIC | Row r1 ("✓") label | CSS styling lost |
| ~3199 | `ans19025.0.1` | ETHNIC | Row r2 ("✕") label | CSS styling lost |
| ~3268 | `ans19043.0.0` | VET | Row r1 (Active Duty icon) | CSS + appended text lost |
| ~3279 | `ans19043.0.1` | VET | Row r2 ("✓") label | CSS styling lost |
| ~3288 | `ans19043.0.2` | VET | Row r3 ("✕") label | CSS styling lost |
| ~3322–3324 | `ans19043.0.{0,1,2}` | VET | JS appending "YES-ACTIVE DUTY", "YES-VETERAN", "NO" | Labels disappear |
| ~3371 | `ans19057.0.0` | UNION | Row r1 icon | CSS styling lost |
| ~3382 | `ans19057.0.1` | UNION | Row r3 ("✕") label | CSS styling lost |
| ~3411–3412 | `ans19057.0.{0,1}` | UNION | JS appending "YES", "NO" | Labels disappear |
| ~3524 | `ans19133.0.0` | REL2 | Row r1 label | CSS styling lost |
| ~3534 | `ans19133.0.1` | REL2 | Row r2 label | CSS styling lost |
| ~3824 | `ans19320.0.30` | HHIX104 | Row r31 (exclusive) | CSS styling lost |

**Recommended fix**: Replace all `ans{id}` selectors with row-index-based or `nth-child` CSS selectors, or use Decipher's `data-label` attribute selectors (e.g., `[data-label="r1"]`).

### 3B. `setInterval` Polling (MEDIUM RISK — performance)

| Line(s) | `with=` | Interval | Purpose | Issue |
|---|---|---|---|---|
| ~365 | `MAHA1,MAHA4,ETHNIC,EDUCATION` | 100ms | Disable radios when checkbox checked | Fires on ALL 4 questions simultaneously; globally scoped `input[type="radio"]` selector |
| ~392 | `QMD90,HHIX102` | 100ms | Auto-click continue when cardrating at end | Polling DOM attribute |
| ~3327 | `VET` | 100ms | Disable radios when checkbox checked | Duplicate of line 365 pattern |
| ~3415 | `UNION` | 100ms | Disable radios when checkbox checked | Duplicate of line 365 pattern |
| ~3768 | `HHIX103,HHIX103x99` | 100ms | Auto-click continue + checkbox disable | Combined polling |

**Recommended fix**: Replace `setInterval` with event-driven `jQuery.on('change')` handlers. The `setInterval` pattern was a workaround for timing issues but creates 5 concurrent 100ms pollers.

### 3C. Global Radio/Checkbox Selectors (MEDIUM RISK — scope)

The JS at lines ~365 and ~3327/3415 uses `jQuery('input[type="radio"]')` without scoping to the specific question container. On pages with multiple questions (via `keepWith`), this disables radios in the **wrong** question.

---

## 4. Escaped XML / Rendering Bugs

| Line | Question | Issue | What Respondent Sees |
|---|---|---|---|
| ~3708 | `HHIX101` row `rr99` | Row text contains literal escaped XML: `&lt;row label="r99"...&gt;...&lt;/row&gt;` | Respondent sees raw XML tags around "None of these" |
| ~3808 | `HHIX103` row `r2` | Row text is `&gt;&gt;` | Respondent sees ">>" as the answer option |
| ~3899 | `HHIX104` row `r31` | Same escaped-XML pattern as HHIX101 rr99 | Respondent sees raw XML tags around "None of these" |

**Recommended fix**: For HHIX101 and HHIX104, change the row text to just `<span class="NoneOfThese">None of these</span>` and fix the label to `r99`. For HHIX103 row r2, replace with actual content or remove if placeholder.

---

## 5. Placeholder / Test Content

| Line(s) | Question | Issue | Severity |
|---|---|---|---|
| ~2080–2089 | `QMD1` (hidden scoring matrix) | Rows labeled "Item-1" through "Item-10" | LOW — hidden `where="execute"` question, respondents never see |
| ~3869–3898 | `HHIX104` | 25 of 31 rows are "Andy Slavitt" placeholder text | **CRITICAL** — respondents see 25 identical "Andy Slavitt" options |
| ~3808 | `HHIX103` row `r2` | Text is ">>" — placeholder | HIGH — respondent sees ">>" as an answer |

---

## 6. Unused Slider CSS (Global)

The main style block (lines 50–341) still contains slider CSS rules that are now orphaned after the QMD4/MAHA3 conversion:

| Line(s) | Selector | Status |
|---|---|---|
| ~70–78 | `.sq-sliderpoints .fa-icon-circle` | **Dead** — no active sliderpoints questions remain |
| ~81–83 | `.sq-sliderpoints .ui-slider .ui-slider-handle` | **Dead** — same reason |

**Recommended fix**: Remove these 2 CSS rules from the global style block.

---

## 7. Missing Questions per Master Spec

These questions exist in the Master Question Map but are **not implemented** in the XML:

| Master Variable | Question Text | Type | Display Condition | Priority |
|---|---|---|---|---|
| `qinf360_eliteup` | "Which of these have you done?" (Elite sub-battery) | `<checkbox>` | `qinf360.r1` checked | HIGH — feeds BCS L3 scoring |
| `qinf360_recruitup` | "Which of these have you done?" (Recruit sub-battery) | `<checkbox>` | `qinf360.r2` checked | HIGH — feeds BCS L3 scoring |
| `qinf360_medialat` | "Which of these have you done?" (Media sub-battery) | `<checkbox>` | `qinf360.r4` checked | HIGH — feeds BCS L3 scoring |
| `qinf360_down` | "Which of these have you done?" (Mobilize sub-battery) | `<checkbox>` | `qinf360.r5` checked | HIGH — feeds BCS L2+L3 scoring |
| `optin` | "Would you be willing to be contacted...?" | `<radio>` | Always shown | MEDIUM |
| `optin_phone` | "Please provide your mobile phone..." | `<text>` | `optin=r1 or r2` | MEDIUM |
| `optin_consent` | "I agree to be contacted..." | `<checkbox>` | `optin=r1 or r2` | MEDIUM |

**Note**: `QMD7` (currently `qinf360_orglat`) partially covers what should be spread across `qinf360_eliteup` + `qinf360_orglat`. The master spec shows 5 separate sub-batteries conditional on which INF360 items were checked, but only `qinf360_orglat` is implemented.

---

## 8. Missing Hidden Variables / Recodes

These computed/recode variables are specified in the master map but not present in the XML:

| Variable | Formula / Logic | Source Questions | Purpose |
|---|---|---|---|
| `agecat` | 1=18-29, 2=30-44, 3=45-54, 4=55-64, 5=65+ | `qage` | Demographic quota balancing |
| `qparty` | 7-point scale: 1=Strong R → 7=Strong D | `qparty1`, `qparty2`, `qparty3` | Composite party ID for analysis |
| `RACEETHNIC` | 1=White NH, 2=Black NH, 3=Asian/Other NH, 4=Hispanic | `d2` + `d3` | Demographic recode |
| `EDUCAT` | 1=HS grad, 2=Some college, 3=Bachelor's, 4=Graduate+ | `edu` | Demographic recode |
| `RELCAT` | 7-level religion composite | `rel` + `evangel` + `d3` | White Evangelical identification |
| `HHI_recode` | 1=<$20K, 2=$20-50K, 3=$50-100K, 4=$100-150K, 5=>$150K | `income` | Income collapse |
| BCS scores (L0–L3) | Weighted sum from influence360 items | `qinf360_*` sub-batteries | Behavioral Communication Score |
| `OverclaimFlag` | `qsocialinfluence.r4` attention check | `qsocialinfluence` | Data quality flag |

**Implementation**: Each should be a `<exec>` block or hidden `<number>` question with `where="execute"`.

---

## 9. Rename Cascade Impact

Renaming a question label in Decipher touches many locations. Here is the cascade for each rename category:

### Direct Attributes
- `label="OLDNAME"` → `label="NEWNAME"` on the question element
- `keepWith="OLDNAME"` on paired questions
- `cond="OLDNAME.r1 or ..."` on conditional questions
- `with="OLDNAME"` on `<style>` blocks (CSS and JS)

### CSS Selectors
- `h1#question_text_OLDNAME` → `h1#question_text_NEWNAME`
- `#question_OLDNAME` → `#question_NEWNAME`
- Any selector containing the question label

### JavaScript References
- `findQ('OLDNAME')` calls
- `jQuery('#question_OLDNAME ...')` selectors
- `allQuestions['OLDNAME']` in `<exec>` blocks

### Exec Block References
- Python code referencing `OLDNAME.r1.val`, `OLDNAME.rows`, etc.
- E.g., `VECTOR_JUSTICE.r1.val` in the Z-scoring exec

### Estimated Scope per Rename

| Question | Estimated Touch Points |
|---|---|
| `QS1` → `qvote` | ~8 (label, JS findQ, setRadio, card handler) |
| `QVOTE24` → `q2024vote` | ~12 (label, JS, exec routing logic, cond=) |
| `QMD4` → `qvector4` | ~6 (label, keepWith, with= CSS, with= JS) |
| `MAHA1` → `qmaha_aware` | ~10 (label, keepWith, cond= on MAHA2/3/4, with= JS) |
| `EDUCATION` → `edu` | ~5 (label, keepWith, with= CSS/JS) |
| `HHI` → `income` | ~5 (label, keepWith, with= JS) |

**Total estimated touch points for all renames: ~150–200 edits.**

---

## 10. Recommended Execution Order

1. **Fix rendering bugs first** (Section 4) — respondent-facing issues
   - HHIX101 `rr99` escaped XML
   - HHIX103 `r2` ">>" placeholder
   - HHIX104 `r31` escaped XML

2. **Fix placeholder content** (Section 5) — requires real content from stakeholder
   - HHIX104 "Andy Slavitt" × 25 rows
   - HHIX103 ">>" row

3. **Remove dead global slider CSS** (Section 6) — safe cleanup

4. **Replace hardcoded `ans{id}` selectors** (Section 3A) — prevent future breakage

5. **Refactor `setInterval` to event-driven** (Section 3B) — performance + correctness

6. **Execute variable renames** (Section 1) — broad impact, do in one batch

7. **Add missing questions** (Section 7) — new functionality

8. **Add missing recode variables** (Section 8) — new exec blocks

---

*This document is for review only. No changes have been applied to `nativedecipher.xml` beyond the approved Changes 1 and 2.*
