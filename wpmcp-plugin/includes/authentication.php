<?php
/**
 * Basic Authentication Handler for WordPress REST API
 * Used for development and debugging purposes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WPMCP_Authentication {

	public function __construct() {
		add_filter( 'determine_current_user', array( $this, 'json_basic_auth_handler' ), 20 );
		add_filter( 'rest_authentication_errors', array( $this, 'json_basic_auth_error' ) );
	}

	/**
	 * Handles Basic Authentication for REST API
	 *
	 * @param mixed $user Current user object or null
	 * @return int|mixed User ID if authenticated, original $user otherwise
	 */
	public function json_basic_auth_handler( $user ) {
		$this->wp_json_basic_auth_error = null;

		// Don't authenticate twice
		if ( ! empty( $user ) ) {
			return $user;
		}

		// Check that we're trying to authenticate
		if ( ! isset( $_SERVER['PHP_AUTH_USER'] ) ) {
			return $user;
		}

		$username = $_SERVER['PHP_AUTH_USER'];
		$password = $_SERVER['PHP_AUTH_PW'];

		/**
		 * In multi-site, wp_authenticate_spam_check filter is run on authentication. This filter calls
		 * get_currentuserinfo which in turn calls the determine_current_user filter. This leads to infinite
		 * recursion and a stack overflow unless the current function is removed from the determine_current_user
		 * filter during authentication.
		 */
		remove_filter( 'determine_current_user', array( $this, 'json_basic_auth_handler' ), 20 );

		$user = wp_authenticate( $username, $password );

		add_filter( 'determine_current_user', array( $this, 'json_basic_auth_handler' ), 20 );

		if ( is_wp_error( $user ) ) {
			$this->wp_json_basic_auth_error = $user;
			return null;
		}

		$this->wp_json_basic_auth_error = true;

		return $user->ID;
	}

	/**
	 * Returns any authentication errors
	 *
	 * @param mixed $error Current error or null
	 * @return mixed Authentication error if exists
	 */
	public function json_basic_auth_error( $error ) {
		// Passthrough other errors
		if ( ! empty( $error ) ) {
			return $error;
		}

		return $this->wp_json_basic_auth_error;
	}
}

// Initialize authentication module
new WPMCP_Authentication();
