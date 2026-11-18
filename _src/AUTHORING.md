# The Leonida Herald: authoring guide

Read this before adding or changing content. The site is an independent, spoiler-conscious fan guide to Grand Theft Auto VI (released November 19, 2026 on PS5 and Xbox Series X|S), live at https://leonidaherald.com.

## How the site is built
- All content lives in `_src/content.json`. Never hand-edit the generated `.html` files.
- Build and publish from the repo root: `bash _src/daily.sh` (sets the edition date to today, Pacific time, rebuilds every page with `_src/build.js` and copies the output to the repo root). Then commit and push to `main`; GitHub Pages republishes automatically.
- A GitHub Actions workflow (`.github/workflows/daily-edition.yml`) updates the date every morning. Always `git pull --rebase` before pushing.

## Article format (`articles` array)
Each article is an object with:
- `slug`: lowercase-hyphenated, unique; becomes `<slug>.html`. Use search-friendly slugs, e.g. `gta-6-mission-<name>` or `gta-6-<topic>-guide`.
- `section`: `whos-who` (characters), `crime-beat` (story missions), `around-town` (regions, side quests, activities), `advice` (guides and strategies).
- `kind`: `character`, `region`, `mission`, `side-quest`, `activity` or `guide`. Only `region` items appear in the Around Town region list; any other kind in `around-town` appears under "Side quests and activities".
- `order` (missions only): story order, 1, 2, 3... The Crime Beat lists missions by this number.
- `date`: date first published (YYYY-MM-DD). `updated` (optional): date of the latest substantive change.
- `title`, `dek` (one or two sentences shown under the headline and in listings).
- `facts`: list of `[label, value]` pairs for the "At a glance" box (e.g. Giver, Unlocks, Reward, Location).
- `body`: one paragraph per line. `## ` starts a subheading, `- ` a bullet, and `!! ` a story-spoiler line hidden behind "tap to reveal" (consecutive `!! ` lines are grouped into one reveal).
- `sources`: list of `{name, url}` for every source used. At least one, and two or more independent sources for anything factual.
- `unconfirmed` (optional): `true` adds a note that some details aren't confirmed yet. In the body, mark each such detail in words ("reportedly", "not yet confirmed").
- `checklist` (optional): list of strings rendered as a saved checklist.

Shops go in `shops` (`name`, `where`, `status`, `note`) with `shopSources`.

## Rules
- Write everything in our own words. Never copy sentences, lists, tables or structure from another site, and never quote more than a short phrase. No images from other sites; characters stay as initial blocks.
- Every factual claim needs a source in `sources`. Prefer Rockstar's own pages, the PlayStation/Xbox stores and established outlets. If sources disagree or a detail rests on one report, mark it unconfirmed or leave it out.
- Story spoilers (plot twists, deaths, betrayals, who a character really is, endings) always go on `!! ` lines. Character and region pages stay spoiler-free above the fold.
- Don't use "GTA" in the site's name or branding. Using it in article titles to describe the game is fine.
- Keep the voice of a local newspaper: plain, direct, useful; short paragraphs; no hype.
- Don't remove existing pages. Update them in place, and set `updated` when you change something substantive.
- The footer disclaimer (unofficial fan site, not affiliated with Rockstar or Take-Two) is added to every page by the build; don't remove it.

## Priorities after launch
1. Story mission walkthroughs in order (how it unlocks, objectives, tips, choices, rewards, what it unlocks next).
2. Side quests and activities, by region.
3. Shop stock and prices for the Classifieds page.
4. Strategy guides (money, weapons, vehicles, heists, beginner tips).
5. Keep existing pages accurate (character pages, launch and editions guides).
