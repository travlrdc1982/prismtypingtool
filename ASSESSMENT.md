# PRISM Typing Tool - Assessment & Recommendations

## Overview

The **PRISM Typing Tool** is a Decipher (Forsta) survey instrument designed to classify respondents into one of 16 political audience segments (8 Democratic, 8 Republican) using a combination of screening questions, MaxDiff preference testing, attitudinal scales, and algorithmic classification via z-score-based centroid distance models. The survey feeds data into the **prism-dashboard-v4** React application, which visualizes segment maps, ROI metrics, message heatmaps, and audience profiles.

---

## Repository Structure

| File | Purpose |
|------|---------|
| `nativedecipher.xml` | Primary Decipher survey XML (~146KB) containing all questions, routing, exec blocks, and classification logic |
| `nativedecipher1.xml` | Alternate/backup version of the survey XML |
| `DECIPHER_RULE.md` | Comprehensive rules document cataloguing errors and corrections across 5 Claude Code dev sessions (~77KB) |
| `bugs.md` | 8 documented bugs (4 critical, 2 significant, 2 minor) |
| `Master Question Map.xlsx` | Question mapping spreadsheet |
| `PRISM Master Specs for Dev Team.xlsx` | Development specifications (~7MB) |
| `NewMediaSurvey.xls` | New media section survey source |
| `*.png` (4 files) | Survey skin mockups |

---

## Current State Assessment

### Strengths

1. **Sophisticated classification model.** The centroid-distance segmentation algorithm using z-score normalization across multiple attitudinal dimensions is methodologically sound. Separate DEM and GOP classification pathways with distinct normalization parameters (`DEM_U`/`DEM_S`, `GOP_U`/`GOP_S`) demonstrate rigorous quantitative design.

2. **Comprehensive documentation.** The `DECIPHER_RULE.md` file is exceptionally thorough, capturing 40+ rules across XML structure, namespaces, character encoding, CDATA handling, CSS/JS inclusion, exec blocks, and more. This is a valuable knowledge base for ongoing development.

3. **Detailed bug tracking.** The `bugs.md` file identifies issues precisely, with root cause analysis and proposed fixes for each bug.

4. **MaxDiff methodology.** The Best-Worst Scaling implementation for message testing across both DEM and GOP modules (10 and 12 tasks respectively) is a strong methodological choice for Share of Preference measurement.

5. **Dashboard integration.** The companion `prism-dashboard-v4` provides a polished, interactive visualization layer with segment mapping, ROI analysis, message heatmaps, and detailed profiles.

### Critical Issues (Must Fix Before Fielding)

These are documented in `bugs.md` but remain unresolved in the XML:

| # | Issue | Impact |
|---|-------|--------|
| **Bug 1** | `p.maxdiff1` not reset before GOP MaxDiff loop | BOTH-module respondents get completely wrong segment assignments; GOP B-W scores computed against DEM task data |
| **Bug 2** | `VECTOR_JUSTICE` and `VECTOR_INDUSTRY` have `cond="1==2"` (never display) | Every DEM respondent gets identical vector z-scores (4.0 fallback), ignoring their actual QMD4 answers |
| **Bug 3** | `QMD4` choice labels skip `c2` (values are 1,3,4,5,6,7,8 instead of 1-7) | z-score normalization is miscalibrated; ~0.66 sigma shift at the c2 breakpoint |
| **Bug 4** | `TYPING_MODULE` routing uses `QS5B` (independents only) for partisan QVOTE24.r3 voters | Self-identified partisans who voted third-party get routed to the wrong module |

**Combined impact:** Bugs 1-4 together can corrupt segment assignment for a substantial portion of respondents. Any data collected with these bugs active is unreliable for classification purposes.

### Significant Issues

| # | Issue | Impact |
|---|-------|--------|
| **Bug 5** | Escaped XML renders as visible text in `HHIX101`/`HHIX104` "None of these" rows | Respondents see raw XML tags in the survey UI |
| **Bug 6** | 25 of 31 rows in `HHIX104` are placeholder ("Andy Slavitt") | Influencer tile question is incomplete |

### Minor Issues

- `HHIX103` row r2 is a `>>` placeholder
- Duplicate `import math` and function definitions (`centroidDistance`, `centroidAllSegments`) across DEM and GOP exec blocks
- `UNION` question skips row `r2` (r1, r3 only)

---

## Recommendations

### Priority 1: Fix Critical Bugs (Immediate)

1. **Reset `p.maxdiff1`** at the top of block `b12` before the GOP MaxDiff loop:
   ```python
   p.maxdiff1 = []
   ```

2. **Replace vector variable references** in `XDEM_SEG` exec with direct `QMD4` reads:
   ```python
   justice_raw = float(QMD4.r1.val) if QMD4.r1.val else 4.0
   industry_raw = float(QMD4.r2.val) if QMD4.r2.val else 4.0
   ```
   Then remove the orphaned `VECTOR_JUSTICE` and `VECTOR_INDUSTRY` question definitions.

3. **Relabel `QMD4` choices** sequentially: `c1` through `c7` with no gaps.

4. **Fix `TYPING_MODULE` routing** to use the already-computed `party` variable instead of `QS5B` for partisan respondents:
   ```python
   elif QVOTE24.r3:
       if party <= 3:
           TYPING_MODULE.val = TYPING_MODULE.r1.index
       elif party >= 5:
           TYPING_MODULE.val = TYPING_MODULE.r2.index
       else:
           TYPING_MODULE.val = TYPING_MODULE.r3.index
   ```

### Priority 2: Complete Incomplete Content

5. **Populate `HHIX104` influencer tiles** - Replace the 25 "Andy Slavitt" placeholders with actual influencer names and images.

6. **Fix escaped XML in `HHIX101`/`HHIX104`** - Strip the `&lt;row...&gt;` artifacts from the "None of these" exclusive rows.

7. **Resolve `HHIX103` row r2** placeholder - Either implement the intended open-end write-in or remove the row.

### Priority 3: Code Quality & Maintainability

8. **Consolidate shared functions.** Move `centroidDistance` and `centroidAllSegments` to the `when="init"` exec block so they're defined once and available to both DEM and GOP classification logic. This reduces maintenance risk from divergent copies.

9. **Add validation exec blocks.** After segment assignment, add sanity-check logic that verifies:
   - MaxDiff B-W scores sum to expected values
   - z-scores fall within expected ranges
   - Segment codes are valid
   This catches data corruption early in testing.

10. **Version the XML files meaningfully.** The two XML files (`nativedecipher.xml` and `nativedecipher1.xml`) have no clear versioning. Adopt a naming convention (e.g., `prism_typing_tool_v2.3.xml`) or use git tags to mark release-ready versions. Remove the duplicate if it's truly a backup.

### Priority 4: Repository & Process Improvements

11. **Add a README.** The repository has no README explaining what the project is, how to set up the Decipher environment, or how the survey connects to the dashboard. A brief README would help onboarding.

12. **Move binary assets out of the repo.** The `.xlsx` and `.xls` files (total ~7.5MB) and `.png` mockups don't benefit from git version control. Consider storing them in a shared drive or artifact storage and linking from the README.

13. **Add a pre-fielding checklist.** Create a `PREFLIGHT.md` that lists all validation steps before launching (bug fixes confirmed, placeholder content replaced, quota settings verified, skip logic tested, etc.).

14. **Establish branch strategy.** The commit history shows development across 4+ branches with generic "Add files via upload" messages. Adopt a convention: `feature/`, `fix/`, `release/` prefixes with descriptive names and meaningful commit messages.

### Priority 5: Dashboard Integration

15. **Automate data pipeline.** Currently, survey results are manually transformed into the `studyData.js` format consumed by `prism-dashboard-v4`. Consider building an export script that converts Decipher data exports directly into the dashboard's data format, reducing manual transcription errors.

16. **Add segment assignment validation in the dashboard.** The dashboard could flag anomalies (e.g., segments with unexpectedly low/high population shares vs. expected distributions) as an early warning for survey logic bugs.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Corrupted segment assignments from Bugs 1-4 | **High** (affects all BOTH-module and many third-party voters) | **Critical** (invalidates classification) | Fix all 4 critical bugs before any data collection |
| Incomplete influencer content fielded | **Medium** (easy to spot in QA) | **High** (survey credibility) | Complete HHIX104 content and QA all question text |
| Normalization parameter drift | **Low** (parameters are hardcoded) | **Medium** (classification accuracy degrades) | Recalibrate `DEM_U`/`DEM_S`/`GOP_U`/`GOP_S` periodically against updated panel norms |
| XML divergence between copies | **Medium** (two XML files, no clear primary) | **Medium** (changes applied to wrong file) | Designate one canonical XML, archive or delete the other |

---

## Conclusion

The PRISM Typing Tool is an ambitious and methodologically sophisticated survey instrument. The classification model, MaxDiff implementation, and companion dashboard are well-designed. However, **the 4 critical bugs in the survey logic will produce incorrect segment assignments for a significant portion of respondents** and must be resolved before any data collection. The remaining issues (incomplete content, code duplication, repository hygiene) are important but lower priority. With the critical fixes applied and a structured pre-fielding QA pass, the tool should be ready for production use.
