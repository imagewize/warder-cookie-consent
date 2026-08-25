=== Warder Cookie Consent - GDPR Cookie Banner ===
Contributors: rhand, gbogdan
Donate link: https://imagewize.com
Tags: cookie banner, cookie consent, gdpr, consent management, privacy
Requires at least: 5.0
Tested up to: 7.1
Stable tag: 2.1.7
Requires PHP: 8.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Self-hosted GDPR cookie consent banner. Blocks analytics scripts until visitors opt in. No account, no external service, no paid tier.

== Description ==

Warder Cookie Consent puts a consent banner on your WordPress site and holds your analytics scripts until a visitor opts in. Everything runs from your own server: there is no account to create, no external service to call, and no paid tier.

It is built on the open-source [CookieConsent v3](https://github.com/orestbida/cookieconsent) library, and adds a WordPress settings screen, cookie defaults for WordPress and WooCommerce, and automatic blocking for scripts that would otherwise set cookies before consent.

= Why you might pick this one =

* **Nothing leaves your server.** The plugin makes no external HTTP requests — no CDN, no consent API, no phone-home. The script is served from your own domain.
* **No account, no upsell, no expiry.** Every feature is in the free plugin. There is no pro tier, no per-domain limit and no trial.
* **Small.** One deferred script of about 18KB gzipped, plus a little inline CSS for the floating button.
* **Opt in, not opt out.** Non-necessary categories are unticked until the visitor chooses. That is what GDPR expects, and the plugin will not silently drift to something weaker.
* **Scripts are actually blocked.** Known cookie-setting scripts are rewritten to `type="text/plain"` before the browser can run them, rather than being cleaned up afterwards.

= What it does =

* A consent banner, and a preferences modal with a toggle per category
* Cookie categories you can add, rename and describe from the settings screen
* A cookie list per category, matched by exact name or by regular expression
* Automatic cookie clearing when a visitor withdraws consent for a category
* A floating cookie button, in any of four corners, so visitors can change their mind later
* Blocking for WooCommerce order attribution and SourceBuster out of the box
* Blocking for any script you mark with `data-category`, or register through a filter
* Editable banner title, description, button labels and privacy-policy link
* Compatibility with page caching — the settings version is part of the script URL

= What ships pre-configured =

**Strictly Necessary**, always on: `cc_cookie`, `wordpress_logged_in_*`, `wordpress_sec_*`, `wordpress_test_cookie`, `wp-settings-*`, `wp_woocommerce_session_*`, `woocommerce_cart_hash`, `woocommerce_items_in_cart`, `woocommerce_recently_viewed`, `PHPSESSID`.

**Performance and Analytics**, off until accepted: Google Analytics (`_ga*`, `_gid`, `_gat`), Matomo (`_pk_*`, `mtm_*`) and SourceBuster (`sbjs_*`).

= What it does not do =

Stated plainly, so you can rule it out in thirty seconds rather than after installing:

* **No consent log.** The visitor's choice is stored in their own browser, in `cc_cookie`. Nothing is written to your database, so there is no proof-of-consent export.
* **No Google Consent Mode v2 signals.**
* **No automatic cookie scanner.** You list the cookies you want managed.
* **No CCPA "Do Not Sell" flow.**
* **The built-in interface text is English.** Everything you are likely to want to change — title, description, both button labels — is editable, so the banner itself can read in any language.

= A note on compliance =

This plugin gives you the mechanism: blocking before consent, granular categories, a choice the visitor controls, and a way to revisit it. Whether your site is compliant depends on how you configure it and what your site actually loads. It is a tool, not legal advice.

= For developers =

Hold any script until a category is accepted:

`<script type="text/plain" data-category="analytics" src="..."></script>`

Or block a script that another plugin registered, by handle:

`add_filter( 'warder_blocked_scripts', function ( $scripts ) {
	$scripts['my-analytics-handle'] = 'analytics';
	return $scripts;
} );`

== Installation ==

1. In WordPress go to **Plugins > Add New**, search for "Warder Cookie Consent", then Install and Activate. Or upload the plugin folder to `/wp-content/plugins/` and activate it there.
2. Open **Settings > Warder Consent**.
3. Set your **Privacy Policy URL**. It ships as a placeholder, so this is the one setting you should not skip.
4. Review the **Performance and Analytics** category and add any cookies your site sets that are not already listed.
5. Mark any third-party scripts you embed yourself with `data-category="analytics"`.

The banner appears straight away for visitors who have not yet made a choice. Nothing else is required.

== Frequently Asked Questions ==

= Does this make my site GDPR compliant? =

No plugin can promise that. This one gives you the parts a consent flow needs — scripts held until consent, categories the visitor chooses individually, and a way to change that choice later. Compliance still depends on configuring it for what your site actually loads, and on the rest of your privacy practices.

= Does it block Google Analytics before consent? =

It clears Google Analytics cookies, and it will hold the GA script if that script carries `data-category="analytics"` or if you register its handle through the `warder_blocked_scripts` filter. If you load GA through another plugin, add that plugin's script handle to the filter — see the developer section above. Only WooCommerce order attribution and SourceBuster are blocked automatically.

= Does it work with Google Tag Manager? =

You can hold the GTM container itself the same way, with `data-category` on the snippet. The plugin does not emit Google Consent Mode v2 signals, so if your setup depends on those, this is not the right plugin for you.

= Does the plugin send any data anywhere? =

No. It makes no external HTTP requests at all. The consent script is served from your own domain, and the visitor's choice is stored in their browser in the `cc_cookie` cookie. Nothing is transmitted to us or to anyone else.

= Does it keep a record of who consented? =

Not on the server. The record lives in the visitor's own browser. If you need an auditable, exportable consent log stored in your database, use a plugin built for that.

= Will it slow my site down? =

The frontend is a single script, loaded deferred, about 18KB gzipped, plus a small inline stylesheet for the floating button. There are no external requests and no jQuery dependency.

= Can I use it in a language other than English? =

The banner text is yours to write: title, description and both button labels are all editable, so the banner can read in any language. The library's own built-in strings — the preferences modal's close label, for example — are English.

= Is it compatible with caching plugins? =

Yes. Settings are versioned with a timestamp that becomes part of the script URL, so a cached page always pulls the matching configuration.

= How do I add custom cookie categories? =

**Settings > Warder Consent**, then "Add New Category" at the bottom of the page. Each category gets its own title, description and cookie list, and appears as a toggle in the preferences modal.

= Which cookies are managed by default? =

WordPress and WooCommerce session cookies are marked strictly necessary, and Google Analytics, Matomo and SourceBuster cookies sit in an analytics category that is off until accepted. The full list is in the description above, and all of it is editable.

= Can visitors change their mind after accepting? =

Yes. The floating cookie button reopens the preferences modal at any time, and you can put it in any of the four corners or turn it off.

== Screenshots ==

1. Admin settings page
2. Cookie consent banner frontend view
3. Cookie category management interface
4. Performance and analytics category, off by default for GDPR compliance
5. Regex cookie matching and adding custom categories

== Changelog ==

= 2.1.7 =
*2026-08-25*

* Listing: rewrote the plugin description around what the plugin does and who it suits, rather than which library it wraps. Adds sections on the pre-configured WordPress/WooCommerce and analytics cookie defaults, a developer section covering `data-category` and the `warder_blocked_scripts` filter, and an explicit "What it does not do" list — no consent log, no Consent Mode v2, no cookie scanner, no CCPA flow — so the plugin can be ruled in or out before installing.
* Listing: plugin title is now "Warder Cookie Consent - GDPR Cookie Banner", the short description leads with what it does instead of naming the bundled library, and the tags moved from single words to the phrases people search (`cookie banner`, `cookie consent`, `consent management`).
* Listing: expanded the FAQ from four questions to eleven, covering the ones that actually decide the install — whether it blocks Google Analytics and GTM, whether it sends data anywhere, whether it keeps a consent record, page weight, and language.
* Docs: corrected the multi-language claim. Only English interface strings ship; the banner text is editable, so the banner can read in any language, but the plugin has never carried French, German, Spanish, Italian or Dutch translations of the library's own strings.
* Docs: `== Source Code ==` moved below the changelog. The directory concatenates unrecognised sections into the Details tab in file order, so keeping it directly under the feature list put build instructions ahead of the description for every visitor.

= 2.1.6 =
*2026-08-13*

* Confirmed compatibility with WordPress 7.1 and updated `Tested up to`.
* Build: updated webpack, css-loader, and PHP_CodeSniffer/WPCS tooling to their latest in-range versions; no functional changes.

= 2.1.5 =
*2026-06-26*

* Fixed: added `padding: 0` to `.warder-preferences-toggle` to prevent Astra Pro theme button styles (padding: 15px 30px) from distorting the floating toggle button and hiding its icon.
* Props: gbogdan for reporting and fixing the Astra Pro CSS incompatibility.

= 2.1.4 =
*2026-06-04*

* Listing: added screenshots and captions for the admin settings page, frontend consent modal, cookie category management, the opt-in analytics defaults, and regex cookie matching. No functional changes.

= 2.1.3 =
*2026-06-03*

* Build: the compiled `dist/cookieconsent.bundle.js` now begins with a comment banner (via webpack `BannerPlugin`) pointing to the uncompressed source and the public repository, so the source location is visible from within the compiled file itself. Comment extraction to a separate `.LICENSE.txt` is disabled so the banner stays inline.
* Docs: moved the `== Source Code ==` section higher in readme.txt (directly after the feature list) so the human-readable source reference is easy to find. No functional changes.

= 2.1.2 =
*2026-05-30*

* Docs: added `CONTRIBUTING.md` at the repository root with build-from-source, development setup, dependencies, and contribution guidelines.
* Docs: moved the developer-facing build/development/dependencies sections out of the README into `CONTRIBUTING.md`, leaving a short "Contributing" pointer; renumbered the Composer install method.

= 2.1.1 =
*2026-05-30*

* Changed: removed `wp_slimstat` from the default `warder_blocked_scripts` list — Slimstat is not bundled with WordPress or WooCommerce, so blocking it by default was dead code for most sites. Add it back via the `warder_blocked_scripts` filter if needed.
* Docs: updated README to document the necessary-category cookie defaults (WordPress core + WooCommerce) and analytics defaults (including `sbjs_*`); added common `warder_blocked_scripts` examples for Slimstat and MonsterInsights.

= 2.1.0 =
*2026-05-30*

* Added: `warder_block_script_until_consent()` — rewrites known analytics/marketing script tags to `type="text/plain" data-category="<category>"` so they are held by vanilla-cookieconsent until the user accepts the matching category. Covers `sourcebuster-js` (SourceBuster.js), `wc-order-attribution` (WooCommerce order attribution), and `wp_slimstat` (Slimstat Analytics) out of the box. Extend or replace the list with the `warder_blocked_scripts` filter.
* Added: expanded `necessary` category cookie defaults to cover the full WordPress and WooCommerce session surface: `cc_cookie`, `wordpress_logged_in_*`, `wordpress_sec_*`, `wordpress_test_cookie`, `wp-settings-*`, `wp_woocommerce_session_*`, `woocommerce_cart_hash`, `woocommerce_items_in_cart`, `woocommerce_recently_viewed`, `PHPSESSID`. Existing installs are unaffected (defaults only apply to new installs or when the necessary category has no cookies configured).
* Changed: `sbjs_*` (SourceBuster.js attribution cookies) moved from the `necessary` category to `analytics` in the default configuration — they are set by an optional tracking script, not by WordPress core.

= 2.0.2 =
*2026-05-30*

* Security: settings save handler now sanitizes the full `$_POST['warder_options']` array through a dedicated recursive sanitizer (`warder_sanitize_options_input`) before validation, instead of relying on a `phpcs:ignore` suppression. Description fields keep safe post HTML (`wp_kses_post`); all other fields are treated as plain text.
* Security: category and cookie delete handlers now verify the nonce before any request data is used to change state, and call `wp_die()` on a failed check.
* Hardening: `warder_validate_options()` now guards every field with `isset()` (no PHP warnings on partial submissions under `WP_DEBUG`) and constrains `current_lang` to the supported language whitelist.
* Fixed: removed the inappropriate `wp_strip_all_tags()` wrapper around the static preferences-toggle CSS (it is an HTML helper, not a CSS escaper).
* Refactored: the supported languages and preferences-toggle positions now come from two shared helpers (`warder_allowed_languages()`, `warder_allowed_toggle_positions()`) used by both validation and the admin dropdowns, instead of being hand-copied across three files. No change to available options or behaviour.
* Refactored: removed an unused internal function (`warder_render_category_title_field()`) that was dead code.
* Docs: clarified the "Source Code" section to state that uncompressed source ships in the plugin (`src/index.js`, `webpack.config.js`) and in the public GitHub repository.
* Tooling: `phpcs.xml` now lints the `inc/` directory (previously only the main file was scanned).

= 2.0.1 =
*2026-05-28*

* Fixed: necessary category enabled/readonly values were silently overwritten as false on every admin settings save because the disabled checkboxes were not submitted by form.serialize(). The necessary category is now always forced to enabled=true and readonly=true in validation, regardless of form input.
* Fixed: is_regex was always saved as true for every cookie. The hidden input used value="" for false, so PHP's isset() returned true for the empty string, silently marking non-regex cookies (_gid, _gat) as regex patterns and corrupting the autoClear cookie list. The hidden input now outputs '0' for false; validation uses !empty() with an explicit '0' check so only the string '1' is treated as true.
* Fixed: non-necessary categories (e.g. Analytics) appeared as locked and pre-selected in the frontend preferences modal. Validation now always saves enabled=false, readonly=false for non-necessary categories; src/index.js derives enabled/readOnly from the category id rather than DB values; admin UI replaces confusing enabled/readonly checkboxes with descriptive lock/unlock icons.
* Fixed: AJAX save no longer returns a misleading "No changes detected" message when a setting is toggled back to its current DB value — the response is always "Settings saved successfully."

= 2.0.0 =
*2026-05-28*

* Changed: plugin logic split from one monolithic file into five focused files under `inc/` — `defaults.php`, `settings.php`, `ajax.php`, `admin.php`, `frontend.php`. Main plugin file is now 26 lines (header, constants, requires). No behaviour changes.
* Fixed: admin page title renamed to "Warder Cookie Consent"; Settings sidebar label renamed to "Warder Consent"

= 1.5.2 =
*2026-05-28*

* Added: AJAX save for the Cookie Consent settings page — Save All Settings no longer reloads the page or scrolls back to the top; the success notice appears next to the form and the page scrolls it into view
* Fixed: setup welcome notice now self-suppresses once the plugin has been configured, instead of appearing on every admin page
* Fixed: Add Cookie forms are now rendered after the main settings form rather than nested inside it, so submitting an Add Cookie form no longer accidentally triggers the main settings save and no longer loses the regex checkbox state
* Fixed: success notice after adding/deleting categories or cookies (`?warder_notice=saved` after the redirect)
* Changed: removed leftover `:not([form])` selectors and JS DOM repositioning that were workarounds for the old nested-form layout

= 1.5.1 =
*2026-05-28*

* Fixed: Add Cookie form now appears directly below the "Add Cookie to this Category" button instead of at the bottom of the page (below Save All Settings and Add New Category)
* Fixed: Add Cookie submissions were silently dropped because the relocated form ended up nested inside the main settings form, which browsers reject. The actual form element now lives outside the main settings form and the visible inputs reference it via the HTML5 `form` attribute

= 1.5.0 =
*2026-05-28*

* Added: Matomo cookie patterns (`/^_pk_/` and `/^mtm_/`) to the default analytics category, so new installs manage Matomo cookies out of the box alongside Google Analytics. Existing sites can add the same patterns under Settings > Cookie Consent

= 1.4.2 =
*2026-05-28*

* Fixed: `register_setting()` updated to array format with explicit `sanitize_callback` key as required by WordPress.org guidelines
* Fixed: `privacy_policy_url` now sanitized with `esc_url_raw()` instead of `sanitize_text_field()` for proper URL sanitization
* Changed: `.distignore` updated to include `src/`, `webpack.config.js`, and `package.json` in the WordPress.org build so the human-readable source is available to reviewers (guideline §4)

= 1.4.1 =
*2026-05-27*

* Changed: Replaced the 10up/wpcs-action workflow with a local PHPCS workflow using phpcs.xml, adding enforcement of WordPress.WP.I18n (text domain: warder-cookie-consent) and WordPress.Security.EscapeOutput on pull requests

= 1.4.0 =
*2026-05-27*

* Fixed: the "Add New Category", "Add Cookie", and "Remove" cookie controls rendered but had no backend handler after an earlier refactor — they now work again
* Added: restored category/cookie management handlers (add category, add cookie, delete cookie, delete category) consolidated in `warder_handle_admin_actions()`, each with nonce verification and input sanitization
* Added: "Delete Category" link in each non-necessary category header
* Added: `Requires at least` and `Requires PHP` headers to the main plugin file
* Changed: wrapped all hardcoded admin settings-page strings in translation/escaping functions (`esc_html_e`, `esc_attr_e`, `esc_html__`, `esc_js`) so admin UI text is translatable and escaped on output

= 1.3.2 =
*2026-05-27*

* Fixed: moved inline admin `<script>` to `wp_add_inline_script()` via `admin_enqueue_scripts` hook
* Fixed: sanitize CSS output with `wp_strip_all_tags()` before passing to `wp_add_inline_style()`
* Added: `== Source Code & Build Process ==` section to readme.txt documenting webpack build and GitHub source link
* Changed: Contributors field updated to WordPress.org username `rhand`

= 1.3.1 =
*2026-05-26*

* Fixed .gitattributes so composer.json ships in Composer/Packagist dist archives (still excluded from WordPress.org builds via .distignore)

= 1.3.0 =
*2026-05-26*

* Added languages/ directory for translation files (WordPress 4.6+ auto-loads translations via the Text Domain header)
* Fixed Plugin Check workflow directory name to match text domain header (resolves textdomain_mismatch warnings)
* Renamed plugin to Warder Cookie Consent (Wheel of Time inspired, consistent with Elayne theme and Waygate pattern builder)
* Renamed main plugin file to warder-cookie-consent.php
* Updated text domain to warder-cookie-consent
* Updated all function prefixes from scc_ to warder_
* Updated Composer package name to imagewize/warder-cookie-consent
* GitHub repository renamed to imagewize/warder-cookie-consent

= 1.2.1 =
*2026-05-26*

* Fixed composer.json license field (MIT → GPL-2.0-or-later) to match plugin header
* Fixed composer.json support URLs pointing to wrong repository
* Added .gitattributes to exclude dev files from Composer installs and git archives

= 1.2.0 =
*2026-05-26*

* Added floating preferences toggle button — a cookie icon button rendered in the page footer that opens the preferences modal, letting users change their consent choices at any time
* Added "Preferences Toggle Button" setting in General Settings with a position dropdown (bottom-right, bottom-left, top-right, top-left)
* Toggle button can be enabled/disabled independently of the main banner

= 1.1.0 =
*2026-05-26*

* Added "Enable Plugin" toggle to General Settings (disable the banner without deactivating the plugin)
* Added plugin header fields required by WordPress.org (Author URI, Text Domain, License, License URI)
* Added direct file access protection (ABSPATH check)
* Removed debug error_log and console.log statements
* Fixed output escaping throughout admin UI (esc_url, esc_attr, esc_html)
* Fixed Plugin Check workflow directory name (resolved textdomain_mismatch and trademarked_term warnings)
* Added strict comparison to in_array calls
* Full WordPress Coding Standards compliance (PHPCS 0 errors)
* Added PHPDoc blocks to all functions
* Updated license from MIT to GPLv2 or later
* Added readme.txt, phpcs.xml, .distignore, and GitHub Actions workflows (WPCS, Plugin Check, release zip)

= 1.0.0 =
*2025-05-26*

* Initial release

== Source Code ==

This plugin ships no obfuscated or minified-only code. The only compiled asset is `dist/cookieconsent.bundle.js`, bundled from human-readable source with webpack. Its first lines are a comment banner pointing back to the source. The uncompressed source (`src/index.js` and `webpack.config.js`) is included in the plugin download, and the full development repository is public:

https://github.com/imagewize/warder-cookie-consent

`src/index.js` imports the [vanilla-cookieconsent v3](https://github.com/orestbida/cookieconsent) library. To build from source: run `npm install`, then `npx webpack` (or `npx webpack --watch` during development).

== Upgrade Notice ==

= 2.1.7 =
Listing and documentation only, no code changes. Rewritten description, expanded FAQ, and a corrected multi-language claim: the banner text is editable so it can read in any language, but only English interface strings ship.

= 2.1.6 =
Confirms compatibility with WordPress 7.1. No functional changes.

= 2.1.5 =
Fixes a visual regression when Astra Pro is active: the floating preferences toggle button was inheriting button padding from the theme, distorting its shape and hiding the icon.

= 2.1.4 =
Documentation only: adds listing screenshots and captions. No functional changes.

= 2.1.3 =
Build and documentation only: the compiled bundle now carries a source-link banner and the readme's Source Code section is more prominent. No functional changes.

= 2.1.2 =
Documentation-only release: adds a `CONTRIBUTING.md` and slims the README to user-facing docs. No functional changes.

= 2.1.1 =
Removes Slimstat from the default automatic script-blocking list (use the `warder_blocked_scripts` filter to add it back if needed). README updated to document WooCommerce cookie defaults and script-blocking examples.

= 2.1.0 =
Adds automatic script blocking for SourceBuster.js, WooCommerce order attribution, and Slimstat before consent is given. Necessary cookie defaults now include the full WordPress and WooCommerce session cookie set. The `sbjs_*` pattern moves to analytics — if you manually placed it under necessary, you can remove the duplicate.

= 2.0.2 =
Security and code-quality hardening: stronger input sanitization on settings save, nonce verification before delete actions, isset-guarded validation, and clearer source-code documentation. Recommended for all users.

= 2.0.1 =
Fixes three data-corruption bugs: (1) Strictly Necessary category losing its locked state after every save; (2) all cookies being silently saved as regex patterns due to a hidden-input value bug; (3) non-necessary categories appearing locked and pre-selected in the frontend consent modal.

= 2.0.0 =
Internal refactor only — plugin logic split into `inc/` files for maintainability. Admin page title and Settings sidebar label updated to "Warder Cookie Consent" / "Warder Consent". No settings migration required, no behaviour changes.

= 1.5.2 =
Save All Settings now uses AJAX, so the page no longer jumps back to the top after saving. Add Cookie forms are no longer nested inside the main settings form, so the regex checkbox and the rest of the cookie inputs submit reliably.

= 1.5.1 =
Fixes Add Cookie form positioning so it appears directly below the category button, and fixes a regression where submitting that form silently failed (nested form was being discarded by the browser).

= 1.5.0 =
Adds Matomo cookie patterns to the default analytics category so new installs manage Matomo cookies out of the box.

= 1.4.2 =
WordPress.org compliance fixes: register_setting() uses array format with sanitize_callback, privacy_policy_url uses esc_url_raw(), and src/ ships in the build for human-readable source access.

= 1.4.1 =
Replaces the 10up/wpcs-action CI workflow with local PHPCS, adding strict i18n (text domain) and output escaping checks on pull requests.

= 1.4.0 =
Restores the category/cookie management buttons (add/remove category and cookie) that were not working, with nonce-protected handlers. Adds minimum WordPress/PHP version headers.

= 1.3.2 =
WordPress.org compliance fixes: inline script moved to wp_add_inline_script, CSS output sanitized, source code documentation added to readme.

= 1.3.0 =
Plugin renamed to Warder Cookie Consent; added languages/ directory for translations; updated text domain, function prefixes, and Composer package name.

= 1.2.1 =
Fixes composer.json license and support URLs; adds .gitattributes for Composer installs.

= 1.2.0 =
Adds a floating preferences toggle button so visitors can revisit their cookie choices at any time.

= 1.1.0 =
Adds "Enable Plugin" toggle; WordPress.org compliance (PHPCS, Plugin Check, readme.txt, workflows).

= 1.0.0 =
Initial release.
