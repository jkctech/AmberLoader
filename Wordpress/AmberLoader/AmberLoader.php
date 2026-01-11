<?php
/**
 * Plugin Name: AmberLoader for Wordpress
 * Description: Wordpress plugin for AmberLoader: an Automatic client-side Amber Alert notifier
 * Version: 1.0
 * Author: JKCTech
 * Plugin URI: https://github.com/jkctech/AmberLoader
 */

defined('ABSPATH') or die();

// Enqueue CSS
function AL_enqueue() {
	$options = get_option('AL_options');
	if (empty($options['enabled'])) return;

	wp_enqueue_style(
		'AmberLoader-style',
		'https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.min.css'
	);
}
add_action('wp_enqueue_scripts', 'AL_enqueue');

// Output script with data attributes
function AL_output_custom_script_tag() {
	$options = get_option('AL_options');
	if (empty($options['enabled'])) return;

	$attrs = [
		'polldelay'  => $options['polldelay'] ?? 300,
		'testmode'   => !empty($options['testmode']) ? 'true' : 'false',
		'hidetest'   => !empty($options['hidetest']) ? 'true' : 'false',
		'nofooter'   => !empty($options['nofooter']) ? 'true' : 'false',
		'autoclose'  => !empty($options['autoclose']) ? 'true' : 'false',
		'nohref'     => !empty($options['nohref']) ? 'true' : 'false',
		'loglevel'   => $options['loglevel'] ?? 'warn',
		'bannertext' => $options['bannertext'] ?? 'Amber Alert actief! (Klik om te openen)',
	];

	echo '<script src="https://cdn.jsdelivr.net/gh/jkctech/AmberLoader@main/dist/AmberLoader.min.js"';
	foreach ($attrs as $key => $value) {
		echo ' data-' . esc_attr($key) . '="' . esc_attr($value) . '"';
	}
	echo '></script>';
}
add_action('wp_footer', 'AL_output_custom_script_tag', 99);

// Settings page
function AL_settings_menu() {
	add_options_page(
		'AmberLoader for Wordpress Settings',
		'AmberLoader',
		'manage_options',
		'AmberLoader',
		'AL_settings_page'
	);
}
add_action('admin_menu', 'AL_settings_menu');

// Settings link in plugin list
function AL_plugin_action_links($links) {
	$settings_link = '<a href="options-general.php?page=AmberLoader">' . __('Settings') . '</a>';
	array_unshift($links, $settings_link);
	return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'AL_plugin_action_links');

// Render settings page
function AL_settings_page() {
	?>
	<style>
		/* Indent each settings field row */
		.al-settings-table .form-table tr {
			padding-left: 20px;
			display: flex;
			align-items: flex-start;
		}

		/* Keep labels and fields aligned side-by-side */
		.al-settings-table .form-table th {
			min-width: 200px;
			padding-right: 10px;
		}

		.al-settings-table .form-table td {
			flex: 1;
		}
	</style>
	<div class="wrap">
		<h1><?php echo esc_html(get_admin_page_title()); ?></h1>

		<p>
			AmberLoader adds a dynamic client-side Amber Alert notifier to your site. Configure settings below to control appearance and behavior.
		</p>

		<p>
			<a href="https://github.com/jkctech/AmberLoader" class="button button-secondary" target="_blank">View on GitHub</a>
		</p>

		<hr>

		<form method="post" action="options.php">
			<div class="al-settings-table">
				<?php
					settings_fields('AL_options_group');
					do_settings_sections('AmberLoader');
					submit_button();
				?>
			</div>
	</form>
		
	</div>
	<?php
}

// Register settings and fields
function AL_settings_init() {
	$options = get_option('AL_options');
	if ($options === false) {
		add_option('AL_options', ['enabled' => 1]);
	}

	register_setting('AL_options_group', 'AL_options');

	add_settings_section('AL_main', 'Enable', null, 'AmberLoader');
	add_settings_section('AL_section_test', 'Test Mode Settings', null, 'AmberLoader');
	add_settings_section('AL_section_style', 'Styling Settings', null, 'AmberLoader');
	add_settings_section('AL_section_behavior', 'Behavior Settings', null, 'AmberLoader');
	add_settings_section('AL_section_debug', 'Debug Settings', null, 'AmberLoader');

	add_settings_field(
		'enabled',
		'Enable Plugin',
		'AL_render_boolean_field',
		'AmberLoader',
		'AL_main',
		[
			'name'        => 'enabled',
			'description' => 'Enable AmberLoader features on the front-end.'
		]
	);

	add_settings_field(
		'testmode',
		'Test Mode',
		'AL_render_boolean_field',
		'AmberLoader',
		'AL_section_test',
		[
			'name'        => 'testmode',
			'description' => 'Enable display of test alerts.'
		]
	);

	add_settings_field(
		'hidetest',
		'Hide Test Banners',
		'AL_render_boolean_field',
		'AmberLoader',
		'AL_section_test',
		[
			'name'        => 'hidetest',
			'description' => 'Prevent test alerts from displaying when enabled.'
		]
	);

	add_settings_field(
		'nofooter',
		'No Footer Banner',
		'AL_render_boolean_field',
		'AmberLoader',
		'AL_section_style',
		[
			'name'        => 'nofooter',
			'description' => 'Disables banner injection into the footer.'
		]
	);

	add_settings_field(
		'bannertext',
		'Banner Text',
		'AL_render_string_field',
		'AmberLoader',
		'AL_section_style',
		[
			'name'        => 'bannertext',
			'default'     => '',
			'description' => 'Custom message shown in the alert banner.'
		]
	);

	add_settings_field(
		'autoclose',
		'Auto Close Banner',
		'AL_render_boolean_field',
		'AmberLoader',
		'AL_section_behavior',
		[
			'name'        => 'autoclose',
			'description' => 'Automatically close the banner after a few seconds.'
		]
	);

	add_settings_field(
		'nohref',
		'No Clickable Link',
		'AL_render_boolean_field',
		'AmberLoader',
		'AL_section_behavior',
		[
			'name'        => 'nohref',
			'description' => 'Disable the link behavior of the banner.'
		]
	);

	add_settings_field(
		'polldelay',
		'Poll Delay (seconds)',
		'AL_render_number_field',
		'AmberLoader',
		'AL_section_behavior',
		[
			'name'        => 'polldelay',
			'default'     => 300,
			'description' => 'Time interval (in seconds) for checking new alerts.'
		]
	);

	add_settings_field(
		'loglevel',
		'Log Level',
		'AL_render_select_field',
		'AmberLoader',
		'AL_section_debug',
		[
			'name'        => 'loglevel',
			'default'     => 'warn',
			'choices'     => [
				'silent' => 'Silent',
				'error'  => 'Error',
				'warn'   => 'Warn',
				'info'   => 'Info',
				'debug'  => 'Debug'
			],
			'description' => 'Controls verbosity of the browser console logs.'
		]
	);
}
add_action('admin_init', 'AL_settings_init');

// Field rendering helpers
function AL_render_string_field($args) {
	$options = get_option('AL_options');
	$name = $args['name'];
	$default = $args['default'] ?? '';
	?>
	<input type="text" name="AL_options[<?php echo esc_attr($name); ?>]" value="<?php echo esc_attr($options[$name] ?? $default); ?>">
	<p class="description"><?php echo esc_html($args['description'] ?? ''); ?></p>
	<?php
}

function AL_render_number_field($args) {
	$options = get_option('AL_options');
	$name = $args['name'];
	$default = $args['default'] ?? 0;
	?>
	<input type="number" name="AL_options[<?php echo esc_attr($name); ?>]" value="<?php echo esc_attr($options[$name] ?? $default); ?>">
	<p class="description"><?php echo esc_html($args['description'] ?? ''); ?></p>
	<?php
}

function AL_render_boolean_field($args) {
	$options = get_option('AL_options');
	$name = $args['name'];
	$checked = isset($options[$name]) ? $options[$name] : 0;
	?>
	<input type="checkbox" name="AL_options[<?php echo esc_attr($name); ?>]" value="1" <?php checked(1, $checked); ?>>
	<p class="description"><?php echo esc_html($args['description'] ?? ''); ?></p>
	<?php
}

function AL_render_select_field($args) {
	$options     = get_option('AL_options');
	$name        = $args['name'];
	$choices     = $args['choices'] ?? [];
	$default     = $args['default'] ?? '';
	$selected    = $options[$name] ?? $default;
	$description = $args['description'] ?? '';
	?>
	<select name="AL_options[<?php echo esc_attr($name); ?>]">
		<?php foreach ($choices as $value => $label): ?>
			<option value="<?php echo esc_attr($value); ?>" <?php selected($selected, $value); ?>>
				<?php echo esc_html($label); ?>
			</option>
		<?php endforeach; ?>
	</select>
	<p class="description"><?php echo esc_html($description); ?></p>
	<?php
}
