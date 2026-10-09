<?php
/**
 * Plugin uninstall handler.
 *
 * Runs when the plugin is deleted via Plugins > Delete in the WordPress admin.
 * Only removes database options when the user has explicitly opted in via the
 * "Remove Data on Uninstall" setting. On multisite each site's own opt-in is
 * respected, since every subsite stores its own `warder_options`.
 *
 * @package Warder_Cookie_Consent
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

/**
 * Deletes the current site's plugin data if that site opted in.
 */
function warder_uninstall_site() {
	$options = get_option( 'warder_options', array() );

	if ( ! empty( $options['remove_data_on_uninstall'] ) ) {
		delete_option( 'warder_options' );
		delete_option( 'warder_options_last_updated' );
		delete_transient( 'warder_options_cache' );
	}
}

if ( is_multisite() ) {
	$warder_site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	foreach ( $warder_site_ids as $warder_site_id ) {
		switch_to_blog( $warder_site_id );
		warder_uninstall_site();
		restore_current_blog();
	}
} else {
	warder_uninstall_site();
}
