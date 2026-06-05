<?php
/**
 * Plugin uninstall handler.
 *
 * Runs when the plugin is deleted via Plugins > Delete in the WordPress admin.
 * Only removes database options when the user has explicitly opted in via the
 * "Remove Data on Uninstall" setting.
 *
 * @package Warder_Cookie_Consent
 */

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

$options = get_option( 'warder_options', array() );

if ( ! empty( $options['remove_data_on_uninstall'] ) ) {
	delete_option( 'warder_options' );
	delete_option( 'warder_options_last_updated' );
}
