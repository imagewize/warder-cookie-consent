# WordPress Options API Usage & Improvements

This document reviews the current implementation of the WordPress Options API in the Warder Cookie Consent plugin and identifies opportunities for improvement.

## Current Implementation

### Options Storage

The plugin stores all settings under a single option key: `warder_options`.

An additional timestamp option `warder_options_last_updated` is used for cache busting when settings change.

### API Functions Used

| Function | Location | Purpose |
|----------|----------|---------|
| `get_option()` | `inc/defaults.php`, `inc/settings.php` | Retrieves `warder_options` from database |
| `add_option()` | `inc/settings.php` | Adds default options on first activation |
| `update_option()` | `inc/settings.php`, `inc/ajax.php` | Saves updated settings |
| `register_setting()` | `inc/settings.php` | Registers settings with sanitization callback |
| `delete_option()` | `uninstall.php` | Removes options on uninstall when user has opted in |

### Settings Registration Flow

1. **`warder_register_settings()`** (hooked to `admin_init`):
   - Registers the `warder_options` setting with `register_setting()`
   - Sanitization callback: `warder_validate_options()`
   - Adds default options via `add_option()` if option doesn't exist

2. **`warder_plugin_activate()`** (hooked to `register_activation_hook`):
   - Merges existing options with defaults using `wp_parse_args()`
   - Updates the merged options via `update_option()`

3. **`warder_get_merged_options()`** (in `inc/defaults.php`):
   - Retrieves current options via `get_option()`
   - Deep-merges with defaults using `wp_parse_args()`
   - Ensures a complete options structure is always returned

## What's Working Well

### ✅ Proper Use of Options API

- **Single option key**: All settings are stored under `warder_options`, avoiding database bloat from multiple option rows
- **Default merging**: `warder_get_merged_options()` ensures defaults are always available, preventing undefined index notices
- **Sanitization**: Both `warder_sanitize_options_input()` (recursive text sanitization) and `warder_validate_options()` (structural validation and whitelisting) provide robust input cleaning
- **Type safety**: The validation callback explicitly handles boolean flags, whitelisted values, and sanitized text

### ✅ Activation Handling

- The activation hook merges existing options with new defaults, which is useful for:
  - Preserving user customizations when defaults change in new versions
  - Adding new default cookie categories or settings

### ✅ Settings Registration

- Using `register_setting()` with a sanitization callback follows WordPress best practices
- The `'type' => 'array'` parameter correctly declares the option structure

## Identified Improvements

### 1. Uninstall Cleanup ✅

**Implemented in 2.2.0** via `uninstall.php` (Option B — the WordPress Plugin Handbook recommended approach). WordPress executes this file directly when the plugin is deleted, without loading the plugin first, making it more reliable than `register_uninstall_hook()`.

Cleanup is **opt-in**: the user must enable "Remove Data on Uninstall" in the Danger Zone section of the settings page before the options are deleted. This matches the convention used by Yoast SEO, WooCommerce, and other major plugins — data is preserved by default.

```php
<?php
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

$options = get_option( 'warder_options', array() );

if ( ! empty( $options['remove_data_on_uninstall'] ) ) {
    delete_option( 'warder_options' );
    delete_option( 'warder_options_last_updated' );
}
```

### 2. Activation Hook Redundancy

**Issue**: There's a subtle redundancy between `warder_register_settings()` and `warder_plugin_activate()`:

- `warder_register_settings()` (on `admin_init`): Adds default options if they don't exist
- `warder_plugin_activate()` (on activation): Merges and updates options with defaults

On **first activation**:
1. Plugin is activated → `warder_plugin_activate()` runs → merges empty array with defaults → saves defaults
2. User visits admin → `warder_register_settings()` runs → sees options exist → skips `add_option()`

On **subsequent visits**: Both functions check and potentially update, but the activation hook only runs once.

**Impact**: Minimal - the redundancy ensures defaults are set, but it's not optimal.

**Recommended Solution**: 

The current implementation is actually **intentional and useful** because:
- `warder_plugin_activate()` merges existing options with NEW defaults when plugin is activated (e.g., after an update with new default categories)
- This ensures users get new default settings without losing their customizations

The `add_option()` in `warder_register_settings()` serves as a fallback for the first admin visit if activation somehow didn't run.

**Verdict**: Keep both. The redundancy is minimal overhead and provides safety.

### 3. Option Autoloading

**Current State**: No explicit autoload setting is specified when adding options.

**Impact**: WordPress defaults to autoloading all options, which is fine for this plugin since:
- Only two options are stored (`warder_options`, `warder_options_last_updated`)
- The options are needed on both admin and frontend
- The `warder_options` array is not excessively large

**Recommendation**: No change needed. For larger plugins with many options, consider setting `'autoload' => false` for options not needed on every page load, but this plugin's footprint is small enough that autoloading is acceptable.

## Implementation Checklist

- [x] Add uninstall cleanup via `uninstall.php` (implemented in 2.2.0)
- [x] Opt-in "Remove Data on Uninstall" setting so data is preserved by default
- [ ] Test uninstall to verify options are removed when opt-in is enabled
- [ ] Test that options are preserved when opt-in is disabled

## Best Practices Reference

### WordPress Options API Best Practices

1. **Use a single option for related settings** - ✅ Implemented (`warder_options`)
2. **Always sanitize and validate** - ✅ Implemented (`warder_validate_options`)
3. **Provide defaults** - ✅ Implemented (`warder_get_default_options`, `warder_get_merged_options`)
4. **Clean up on uninstall** - ✅ Implemented (`uninstall.php`, opt-in via settings)
5. **Use `register_setting()` for admin settings** - ✅ Implemented
6. **Prefix everything** - ✅ Implemented (`warder_` prefix)

### Data Merge Strategy

The plugin uses `wp_parse_args()` for merging, which is appropriate for:
- Flat arrays (top-level settings)
- Shallow merging needs

For deeply nested structures like `cookie_categories`, the current approach works because:
- `wp_parse_args()` handles the top-level merge
- The validation function explicitly processes nested arrays
- Defaults are comprehensive and rarely change structure

## Code Examples

### Current Pattern (Good)

```php
// Retrieving with defaults
function warder_get_merged_options() {
    $options         = get_option( 'warder_options', array() );
    $default_options = warder_get_default_options();
    return wp_parse_args( $options, $default_options );
}
```

### Implemented Pattern (uninstall.php)

```php
// uninstall.php — executed by WordPress on plugin deletion
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

$options = get_option( 'warder_options', array() );

if ( ! empty( $options['remove_data_on_uninstall'] ) ) {
    delete_option( 'warder_options' );
    delete_option( 'warder_options_last_updated' );
}
```

## Testing Considerations

When implementing the uninstall hook:

1. **Test fresh install**: Verify options are created correctly
2. **Test update**: Verify existing options are preserved
3. **Test uninstall**: Verify options are removed from database
4. **Test reinstall**: Verify plugin works correctly after uninstall/reinstall

## Related Files

- `inc/defaults.php` - Default options and merging logic
- `inc/settings.php` - Settings registration, validation, activation
- `warder-cookie-consent.php` - Main plugin file (where uninstall hook should be added)
