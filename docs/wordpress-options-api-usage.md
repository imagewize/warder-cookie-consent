# WordPress Options API Usage

How Warder Cookie Consent stores, reads and cleans up its settings with the WordPress Options API, as of 2.3.0, plus notes on what works well and what could be improved.

## Stored Data

| Key | Type | Purpose |
|-----|------|---------|
| `warder_options` | option (array) | All plugin settings (see "Settings Structure" in `CLAUDE.md`) |
| `warder_options_last_updated` | option (int timestamp) | Cache-busting version for the frontend script URL; bumped whenever `warder_options` changes |
| `warder_options_cache` | transient | Legacy key: deleted after every save and on uninstall, but **never set** anywhere in the current code |

On multisite every subsite has its own copies of these, in its own `wp_{id}_options` table. Nothing is stored network-wide.

## API Functions Used

| Function | Location | Purpose |
|----------|----------|---------|
| `register_setting()` | `inc/settings.php` | Registers `warder_options` with `warder_validate_options()` as the sanitize callback |
| `get_option()` | `inc/defaults.php`, `inc/settings.php`, `inc/admin.php`, `inc/frontend.php`, `uninstall.php` | Reads `warder_options` / `warder_options_last_updated` |
| `add_option()` | `inc/settings.php` | Creates default options on the first admin load if none exist |
| `update_option()` | `inc/settings.php`, `inc/ajax.php` | Saves settings (activation merge, AJAX save, add/delete category and cookie actions) and the timestamp |
| `delete_option()` | `uninstall.php` | Removes both options on uninstall, only when the site opted in |
| `delete_transient()` | `inc/ajax.php`, `inc/admin.php`, `uninstall.php` | Clears `warder_options_cache` |

## Lifecycle

1. **Activation**: `warder_plugin_activate()` (`register_activation_hook`) merges the stored options with the defaults via `wp_parse_args()` and saves the result. On a fresh install this writes the defaults. On reactivation, new top-level defaults are added while the user's values are kept.
2. **First admin load**: `warder_register_settings()` (`admin_init`) registers the setting and calls `add_option()` with the defaults if `warder_options` doesn't exist yet.
3. **Reading**: `warder_get_merged_options()` (`inc/defaults.php`) returns the stored options merged over the defaults with `wp_parse_args()`, so callers always get every top-level key.
4. **Saving**: the settings form is submitted over AJAX to `warder_ajax_save_settings()`, which runs `warder_sanitize_options_input()` and `warder_validate_options()` before `update_option()`. The `update_option_warder_options` hook then sets `warder_options_last_updated` to `time()`.
5. **Uninstall**: `uninstall.php` runs when the plugin is deleted via Plugins > Delete (or `wp plugin uninstall`). For each site (every subsite on multisite, via `switch_to_blog()`), it deletes `warder_options`, `warder_options_last_updated` and the `warder_options_cache` transient, **only if that site's `remove_data_on_uninstall` is true**.

## What's Working Well

- **Single option key**: all settings live in one `warder_options` row instead of many separate rows.
- **Defaults are always available**: `warder_get_merged_options()` prevents undefined-index notices when new top-level settings are added.
- **Two-step input cleaning**: `warder_sanitize_options_input()` recursively sanitizes text, and `warder_validate_options()` whitelists the structure, casts booleans and checks enum values (language, toggle position, button roles).
- **`register_setting()` with a sanitize callback**: follows WordPress best practice; `'type' => 'array'` declares the shape.
- **Uninstall cleanup is opt-in**: data is kept unless the admin ticks "Remove Data on Uninstall" in the Danger Zone, matching the convention of Yoast SEO and WooCommerce. `uninstall.php` is used rather than `register_uninstall_hook()`, as the Plugin Handbook recommends: WordPress runs it directly, without loading the plugin.

### Implemented uninstall handler

```php
// uninstall.php: executed by WordPress on plugin deletion.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

function warder_uninstall_site() {
	$options = get_option( 'warder_options', array() );

	if ( ! empty( $options['remove_data_on_uninstall'] ) ) {
		delete_option( 'warder_options' );
		delete_option( 'warder_options_last_updated' );
		delete_transient( 'warder_options_cache' );
	}
}

if ( is_multisite() ) {
	// Each subsite has its own options and its own opt-in.
	foreach ( get_sites( array( 'fields' => 'ids', 'number' => 0 ) ) as $warder_site_id ) {
		switch_to_blog( $warder_site_id );
		warder_uninstall_site();
		restore_current_blog();
	}
} else {
	warder_uninstall_site();
}
```

## Notes and Possible Improvements

### Merging is shallow

`wp_parse_args()` only merges the **top level**. If `cookie_categories` is stored, it fully replaces the default `cookie_categories`, so a new default category or a new per-category key added in a future version will **not** appear for existing installs, even after reactivation. For new top-level settings (like `remove_data_on_uninstall`) the shallow merge is enough. A recursive merge would only be worth adding if defaults inside `cookie_categories` ever need to reach existing sites.

### Activation hook vs. `admin_init` fallback

`warder_plugin_activate()` and the `add_option()` in `warder_register_settings()` overlap, but both are needed:

- The activation hook does the merge on (re)activation.
- The `admin_init` fallback covers sites where the activation hook never ran. The main case is **multisite network activation**: `register_activation_hook` callbacks run only in the context of the site where the plugin was activated, so the other subsites get their defaults on their first admin load instead. Until then the frontend still works, because `warder_get_merged_options()` falls back to the defaults.

Keep both.

### Reactivation after an opted-in uninstall

After an opted-in uninstall, reinstalling and activating writes fresh defaults (including the placeholder privacy policy URL). This is expected, but worth knowing when restoring a site from a backup: use `update_option` (or `wp option update`), not `add_option`, since activation has already recreated the row.

### Duplicate merge in the settings page

`warder_render_options_page()` in `inc/admin.php` repeats `get_option()` + `wp_parse_args()` instead of calling `warder_get_merged_options()`. The result is the same; switching to the helper would remove the duplication.

### Unused transient

`warder_options_cache` is deleted after saves and on uninstall but never written. It's harmless; it could either be removed everywhere or put to use as an actual cache. Until then, clearing it on uninstall is just defensive cleanup.

### Autoloading

No `autoload` argument is passed to `add_option()` / `update_option()`. Since WordPress 6.6 the default is `auto`: options are autoloaded unless they exceed a size threshold (150 KB by default). Both options are small and needed on every frontend request, so autoloading is correct and no change is needed.

## Testing

Verified for 2.3.0 with WP-CLI on a single site (`imagewize.test`) and a 10-subsite subdirectory multisite (`demo.imagewize.test`):

- [x] Saving the settings form with "Remove Data on Uninstall" ticked or unticked persists the value, and no other setting changes
- [x] Uninstall with the box off keeps `warder_options`, `warder_options_last_updated` and the transient
- [x] Uninstall with the box on removes all three
- [x] Multisite: only the opted-in subsites are cleaned; subsites that opted out, or have no flag (upgraded from 2.2.x), keep their data

To run the uninstall procedure without deleting the plugin files:

```bash
wp plugin deactivate warder-cookie-consent   # use --network, or --url=<site> per subsite, as activated
wp plugin uninstall warder-cookie-consent --skip-delete
```

## Related Files

- `uninstall.php`: opt-in uninstall cleanup (multisite aware)
- `inc/defaults.php`: default options and `warder_get_merged_options()`
- `inc/settings.php`: `register_setting()`, sanitize/validate, timestamp hook, activation hook
- `inc/ajax.php`: AJAX save and add/delete category and cookie actions
- `inc/admin.php`: settings page, including the Danger Zone checkbox
- `inc/frontend.php`: reads options and the timestamp for the frontend script
