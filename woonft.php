<?php
/**
 * Plugin Name: WooNFT
 * Plugin URI: https://woonft.yoshi.tech/
 * Description: Bridging the gap between digital and physical commerce through the power of blockchain. Store owners can now offer their products as unique NFT (Non-Fungible Token) variants on the NEAR protocol via Mintbase.
 * Version: 1.0.0
 * Author: Ivan Ciric
 * Author URI: https://yoshi.tech/
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Include helper class.
//require_once plugin_dir_path(__FILE__) . 'includes/class-woonft-helper.php';

register_activation_hook(__FILE__, 'woonft_activate');
function woonft_activate() {
    add_option('woonft_network', 'testnet');
    add_option('ai_key', 'XXX');
}

function register_woonft_settings() {
    register_setting('woonft-settings-group', 'woonft_network');
    register_setting('woonft-settings-group', 'ai_key');
}

function woonft_add_settings_link($links) {
    $settings_link = '<a href="options-general.php?page=woonft-settings">' . __('Settings') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}

add_filter('plugin_action_links_woonft/woonft.php', 'woonft_add_settings_link');

// Enqueue JavaScript for front-end blockchain interactions.
function woonft_enqueue_scripts() {
    wp_enqueue_script('woonft-bootstrap', 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js', array('jquery'), null, true);
    wp_enqueue_script('woonft-script', plugins_url('/dist/woonft.bundle.js', __FILE__), array(), '1.0.0', true);
    wp_enqueue_script('woonft-custom-script', plugin_dir_url(__FILE__) . 'js/woonft-button.js', array('jquery'), null, true);

    $productName = null;
    if (is_product()) {
        global $post;
        $product = wc_get_product($post->ID);
        $productName = $product->get_name();
        $productDescription = $product->get_description();
    }

    wp_localize_script('woonft-custom-script', 'woonft_params', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'productName' => $productName,
        'productDescription' => $productDescription,
    ));

    wp_localize_script('woonft-script', 'woonft_params', array(
        'network' => get_option('woonft_network', 'testnet'),
        'ai_key' => get_option('ai_key', 'XXX'),
    ));
}

function woonft_enqueue_styles() {
    wp_enqueue_style('woonft-bootstrap-style', 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css', array(), '4.5.2');
    wp_enqueue_style('woonft-styles', plugin_dir_url(__FILE__) . 'css/woonft-product-styles.css');}

function woonft_admin_enqueue_scripts() {
    wp_enqueue_script('woonft-imgcheckbox-script', plugin_dir_url(__FILE__) . 'js/jquery.imgcheckbox.js', array('jquery'), null, true);
    wp_enqueue_script('woonft-admin-script', plugin_dir_url(__FILE__) . 'js/woonft-admin.js', array('jquery'), null, true);
}
function woonft_enqueue_admin_styles() {
    wp_enqueue_style('woonft-styles', plugin_dir_url(__FILE__) . 'css/woonft-styles.css');
    wp_enqueue_style('woonft-admin-styles', plugin_dir_url(__FILE__) . 'css/woonft-admin-styles.css');
}

add_action('wp_enqueue_scripts', 'woonft_enqueue_styles');
add_action('wp_enqueue_scripts', 'woonft_enqueue_scripts');
add_action('admin_enqueue_scripts', 'woonft_admin_enqueue_scripts');
add_action('admin_enqueue_scripts', 'woonft_enqueue_admin_styles');
add_action('woocommerce_checkout_create_order_line_item', 'woonft_detect_nft_variant', 10, 4);

add_action('admin_menu', 'woonft_create_menu');


function woonft_create_menu() {
    add_menu_page(
        'WooNFT', // Page title
        'WooNFT', // Menu title
        'manage_options', // Capability
        'woonft-settings', // Menu slug (pointing directly to the settings page)
        'woonft_settings_page', // Function to display the settings page
        'dashicons-cart', // Icon URL (optional)
        6 // Position (optional)
    );

    add_action('admin_init', 'register_woonft_settings');
}



function woonft_settings_page() {
    ?>
    <div class="wrap">
        <h1>WooNFT Settings</h1>

        <form method="post" action="options.php">
            <?php settings_fields('woonft-settings-group'); ?>
            <?php do_settings_sections('woonft-settings-group'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Network</th>
                    <td>
                        <span class="woonft-tooltip" data-tooltip="NEAR network">
                            <select name="woonft_network">
                                <option value="testnet" <?php selected(get_option('woonft_network'), 'testnet'); ?>>testnet</option>    
                                <option value="mainnet" <?php selected(get_option('woonft_network'), 'mainnet'); ?>>mainnet</option>
                            </select>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">AI Key</th>
                    <td>
                        <span class="woonft-tooltip" data-tooltip="AI image generator api key">
                                <input type="text" name="ai_key" value="<?php echo get_option('ai_key'); ?>">
                        </span>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}


add_action('wp_body_open', 'woonft_modal');
function woonft_modal() {
    ?>
        <div class="modal fade" style="z-index:999999;" id="nftModal" tabindex="-1" role="dialog" aria-labelledby="nftModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="nftModalLabel">NFT Art</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="loader" class="spinner"></div>
                    <p id="loadingText">Your unique, one-of-a-kind work of art is generating...</p>

                        <img id="nftImage" src="" style="display:none; width: 100%;" class="flicker"/>
                
                </div>
                <input type="text" id="nftEmail" value="" placeholder="your e-mail">
                <button id="claimNftButton" style="margin-top: 20px; display: block !important;" class="btn btn-primary holo-button">Claim this NFT</button>
                </div>
            </div>
        </div>
    <?php
}