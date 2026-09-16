# Repository Guidelines

Full architecture, data flow and versioning rules live in `CLAUDE.md` — read that first for
anything not covered here.

## Project Structure & Module Organization
- Root plugin entry: `warder-cookie-consent.php` — ~26-line bootstrap defining
  `WARDER_VERSION` / `WARDER_PLUGIN_FILE` and `require_once`-ing the `inc/` modules.
- `inc/defaults.php` — default options and the DB-merged options helper.
- `inc/settings.php` — settings registration, sanitize/validate, activation hook.
- `inc/ajax.php` — AJAX save and add/delete category/cookie handlers.
- `inc/admin.php` — admin menu, admin script enqueue, settings page rendering.
- `inc/frontend.php` — frontend script enqueue/localize and the floating preferences toggle.
- `src/index.js` — JS entry point; maps `window.warderSettings` to vanilla-cookieconsent config.
- `dist/cookieconsent.bundle.js` — compiled output (do not edit directly; run `npx webpack`).
- `assets/js/admin.js` — admin page JS (AJAX save, UI interactions).

## Build, Test, and Development Commands
```bash
npm install          # Install JS dependencies
npx webpack          # Build dist/cookieconsent.bundle.js from src/index.js
npx webpack --watch  # Rebuild on file change
composer install     # Install PHP dev tooling (phpcs, WPCS)
vendor/bin/phpcs      # Run WordPress Coding Standards against inc/ and the bootstrap file
php -l <file>.php    # Lint a single PHP file
```
There is no automated test suite (no PHPUnit). PHP requires 8.0+.

## Coding Style & Naming Conventions
- All PHP functions and hooks use the `warder_` prefix; options are stored as a single array
  under `warder_options` in `wp_options`.
- Settings are always read via `warder_get_merged_options()` (deep-merges DB values with
  `warder_get_default_options()`) — never read `get_option( 'warder_options' )` raw.
- JS is bundled via webpack; edit `src/index.js`, never `dist/cookieconsent.bundle.js` directly.
- Follow WordPress PHP coding standards (enforced by `vendor/bin/phpcs`, config in `phpcs.xml`).

## Testing Guidelines
- No unit test runner is configured; validate changes manually against a local WordPress
  install (frontend banner + wp-admin settings screen).
- Run `vendor/bin/phpcs` before opening a PR if PHP changed.
- For JS changes, run `npx webpack` and confirm the bundle builds without errors/warnings.

### Local WordPress environment (Trellis + Bedrock)
Manual/visual testing happens against a local **Trellis** (Roots) VM running **Bedrock**, in the
sibling `~/code/imagewize.com` checkout — see CLAUDE.md "Local Testing" for the full detail. This
is the maintainer's own setup, not a project requirement.
- Trellis root: `~/code/imagewize.com/trellis` (Lima-based VM; `trellis vm shell`).
- Test site: `imagewize.com` (host `imagewize.test`, Bedrock root `~/code/imagewize.com/site`) —
  the plugin is a pinned Composer dependency there, not a symlink.
- **Sync, don't release**, via `wp-ops`'s `rsync-package-to-site`:
  ```bash
  SITE_ROOT=~/code/imagewize.com/site/web/app \
    wp-ops rsync-package-to-site plugin warder-cookie-consent ~/code/warder-cookie-consent
  ```
  Always pass the explicit source dir and never run this from inside the site — an omitted
  source defaults to `$PWD`, and the sync's `--delete --delete-excluded` would wipe the target.
  Run `npx webpack` first so the synced `dist/` reflects your latest `src/index.js`.

## Commit & Pull Request Guidelines
- Branch off `main` before committing; never commit directly to `main`.
- Do not mention "Claude", "Claude Code", or any AI tool in commit messages.
- Atomic commits: stage files individually or in logical groups with specific messages.
- Follow conventional commit style (`feat:`, `fix:`, `docs:`, `refactor:`, etc.) where it fits.
- **Version bump (see CLAUDE.md "Versioning" for the full four-file list):** any release-worthy
  change updates `warder-cookie-consent.php`, `readme.txt`, `CHANGELOG.md` and `package.json`
  together, then `npx webpack` is run and the rebuilt `dist/cookieconsent.bundle.js` is
  committed before tagging.

## Security & Dependency Hygiene
- Dependabot tracks the JS toolchain (`package-lock.json`) and PHP dev tooling
  (`composer.lock`). These are build-time/dev dependencies, not runtime code shipped to
  sites, but alerts should still be cleared: `npm audit fix` (verify with `npx webpack` that
  the bundle still builds and stays byte-identical when only dev deps moved) or
  `composer update` for `require-dev` packages.
- The plugin makes no external HTTP requests at runtime — keep it that way; any new feature
  that would call out to a third-party service needs explicit sign-off first.
