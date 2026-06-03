# WordPress Plugin Review — June 1st, 2026

**Status:** Not yet approved — manual review found issues that must be addressed.

This document captures the feedback received from WordPress plugin reviewers on June 1st, 2026, including the exact issues cited, references to the relevant guidelines, and notes on current compliance status.

---

## 📋 Summary

| Issue | Severity | File(s) | Status |
|-------|----------|---------|--------|
| [Source code not publicly documented](#1-no-publicly-documented-resource-for-your-generatedcompressed-content) | Guideline violation | `dist/cookieconsent.bundle.js` | ⚠️ Already documented in readme.txt, but reviewer missed it |
| [Missing nonce checks](#2-nonces-and-user-permissions-needed-for-security) | Security | `inc/ajax.php:37-98` | 🔴 **Action required** |
| [Unescaped output](#3-variables-and-options-must-be-escaped-when-echod) | Security | `inc/frontend.php:47` | 🔴 **Action required** |

---

## 1. No publicly documented resource for your generated/compressed content

### 📌 Issue
> In reviewing your plugin, we cannot find a non-compiled version of your javascript and/or css related source code.
> 
> We require you to include the source code and/or a link to the source code... If you include a link, this may be in your source code, however we require you to also have it in your readme.

**Cited file:** `dist/cookieconsent.bundle.js:1`

**Guideline:** [§4: Code must be mostly human-readable](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/#4-code-must-be-mostly-human-readable)

### ✅ Current State

The plugin **already complies** with this requirement:

- **Source included in plugin:** `src/index.js` and `webpack.config.js` are shipped in the plugin directory
- **Source link in readme.txt:** The `== Source Code ==` section explicitly states:
  > This plugin ships no obfuscated or minified-only code. The only compiled asset is `dist/cookieconsent.bundle.js`, bundled from human-readable source with webpack. The uncompressed source (`src/index.js` and `webpack.config.js`) is included in the plugin download, and the full development repository is public:
  > 
  > https://github.com/imagewize/warder-cookie-consent
- **Build instructions:** The readme documents how to build from source (`npm install`, then `npx webpack`)
- **`.distignore`:** Explicitly includes `src/` in the WordPress.org build

### 🎯 Action Items

- **None required** for functionality — the documentation is already present.
- **Consider:** Adding a more prominent "Source Code" section header in readme.txt (currently under `== Source Code ==`), or moving it higher in the document to ensure reviewers see it.
- **Consider:** Adding a comment header at the top of `dist/cookieconsent.bundle.js` pointing to the source location.

---

## 2. Nonces and User Permissions Needed for Security

### 📌 Issue
> Please add a nonce check to your input calls (`$_POST`, `$_GET`, `$_REQUEST`) to prevent unauthorized access.
> 
> If you use `wp_ajax_` to trigger submission checks, remember they also need a nonce check.
> 
> 👮 Checking permissions: Keep in mind, a nonce check alone is not bulletproof security. Do not rely on nonces for authorization purposes. When needed, use it together with `current_user_can()`...
> 
> Also make sure that the nonce logic is correct by making sure it cannot be bypassed...
> 
> Keep performance in mind. Don't check for post submission outside of functions.

**Cited file:** `inc/ajax.php:37` — `warder_handle_admin_actions()` [function] — No nonce check found validating input origin on lines 37-98

**Specific line called out:** Line 82: `$category_id = isset( $_GET['category'] ) ? sanitize_key( wp_unslash( $_GET['category'] ) ) : '';`

**Guidelines:**
- [Nonces](https://developer.wordpress.org/plugins/security/nonces/)
- [AJAX nonces](https://developer.wordpress.org/plugins/javascript/ajax/#nonce)
- [Settings API](https://developer.wordpress.org/plugins/settings/settings-api/)

### 🔴 Current State

The `warder_handle_admin_actions()` function handles several sensitive actions via `$_GET`:

| Action | Line | Current Check |
|--------|------|---------------|
| Delete category | ~45 | No nonce |
| Delete cookie | ~55 | No nonce |
| Add category | ~70 | No nonce |
| Add cookie | ~80 | No nonce |

The function **does** use `current_user_can( 'manage_options' )` (line 40), but this is insufficient without a nonce.

### 🎯 Action Items

1. **Add nonce generation:** Output a nonce in the admin UI for each action (delete category, delete cookie, add category, add cookie)
   - Use `wp_nonce_field()` for forms, or `wp_nonce_url()` for links
   - For AJAX actions, use `wp_create_nonce()` and pass via `data`

2. **Add nonce verification:** In `warder_handle_admin_actions()`, verify the nonce before processing:
   ```php
   // For GET requests (delete actions via URL)
   if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_wpnonce'] ) ), 'warder_delete_category' ) ) {
       wp_die( esc_html__( 'Security check failed.', 'warder-cookie-consent' ) );
   }
   
   // For POST requests (add actions via form submission)
   if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( wp_unslash( $_POST['_wpnonce'] ) ), 'warder_add_category' ) ) {
       wp_die( esc_html__( 'Security check failed.', 'warder-cookie-consent' ) );
   }
   ```

3. **Use unique nonce actions** for each operation:
   - `warder_delete_category`
   - `warder_delete_cookie`
   - `warder_add_category`
   - `warder_add_cookie`

4. **Keep `current_user_can( 'manage_options' )`** — this is correct for authorization

5. **Performance note:** The current check `if ( ! current_user_can( 'manage_options' ) ) { return; }` at line 40 is fine — it runs only when the function is called, not on every page load.

### 📁 Files to Modify

- `inc/ajax.php` — Add nonce verification to `warder_handle_admin_actions()`
- `inc/admin.php` — Add nonce fields to forms and nonce URLs to delete links

---

## 3. Variables and options must be escaped when echo'd

### 📌 Issue
> All variables that are echoed need to be escaped when they're echoed, so it can't hijack users or (worse) admin screens.
> 
> We call this 'escaping late.' ... escaping when you output it at the end.
> 
> This remains true of options you've saved to the database. Even if you've properly sanitized when you saved, the tools for sanitizing and escaping aren't interchangeable.

**Cited file:** `inc/frontend.php:47`
```php
wp_add_inline_style( 'warder-preferences-toggle', warder_get_preferences_toggle_css() );
```
> -----> `warder_get_preferences_toggle_css()`

**Guideline:** [Escaping](https://developer.wordpress.org/apis/security/escaping/)

### 🔴 Current State

The `warder_get_preferences_toggle_css()` function returns raw CSS that is then passed directly to `wp_add_inline_style()`. While `wp_add_inline_style()` does escape its content, it's best practice to escape at the point of generation.

The function builds CSS dynamically based on user settings (position), which means the output could potentially be manipulated.

### 🎯 Action Items

1. **Escape the CSS output** in `warder_get_preferences_toggle_css()`:
   - Use `wp_strip_all_tags()` to remove any HTML tags (already partially done in v2.0.2 per changelog)
   - Or better: validate that the position values are from the allowed set before using them in CSS

2. **Review all echo/print statements** in the codebase for proper escaping:
   - HTML context: `esc_html()` or `esc_html_e()`
   - Attribute context: `esc_attr()` or `esc_attr_e()`
   - URL context: `esc_url()` or `esc_url_raw()`
   - JavaScript context: `esc_js()`

3. **Specifically check:**
   - All `echo` statements in `inc/admin.php` (settings page output)
   - All `echo` statements in `inc/frontend.php` (banner output)
   - Any variables passed to `wp_localize_script()` (should be escaped in the PHP, not JS)

### 📁 Files to Modify

- `inc/frontend.php` — Review `warder_get_preferences_toggle_css()` escaping
- `inc/admin.php` — Audit all output for proper escaping
- `inc/settings.php` — Review any echoed output

---

## 🛠️ Recommended Fixes Checklist

- [ ] Add nonce verification to `warder_handle_admin_actions()` in `inc/ajax.php`
- [ ] Add nonce fields/URLs to admin UI in `inc/admin.php`
- [ ] Escape CSS output in `warder_get_preferences_toggle_css()` in `inc/frontend.php`
- [ ] Audit all echo/print statements for proper escaping context
- [ ] Test all admin actions (add/delete category, add/delete cookie) to ensure nonces work
- [ ] Verify the readme.txt source code section is prominent and clear
- [ ] Run Plugin Check to verify all escaping and nonce issues are resolved

---

## 📚 References

- [WordPress Plugin Guidelines — §4 Code must be mostly human-readable](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/#4-code-must-be-mostly-human-readable)
- [WordPress Nonces](https://developer.wordpress.org/plugins/security/nonces/)
- [AJAX Nonces](https://developer.wordpress.org/plugins/javascript/ajax/#nonce)
- [Escaping in WordPress](https://developer.wordpress.org/apis/security/escaping/)
- [Settings API](https://developer.wordpress.org/plugins/settings/settings-api/)

---

## 🎯 Next Steps

After implementing the fixes above:

1. Test thoroughly on a staging site
2. Update version numbers (see project `CLAUDE.md` for versioning rules — update 4 files)
3. Commit changes with descriptive messages
4. Upload the corrected version to WordPress.org for re-review
