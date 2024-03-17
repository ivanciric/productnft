<?php
/**
 * Plugin Name: WooNFT
 * Plugin URI: https://woonft-store.yoshi.tech
 * Description: Bridging the gap between digital and physical commerce through the power of blockchain. Store owners can now offer their products as unique NFT (Non-Fungible Token) variants on the NEAR protocol via Mintbase.
 * Version: 1.0.0
 * Author: Ivan Ciric
 * Author URI: https://yoshi.tech/
 */

if (!defined('ABSPATH')) {
    exit;
}

register_activation_hook(__FILE__, function () {
    add_option('woonft_api_key', '13de9481-5c57-4393-9ac0-498c4fc95088');
});

add_action('admin_init', function () {
    register_setting('woonft-settings-group', 'woonft_api_key');
});

add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $settings_link = '<a href="admin.php?page=woonft-settings">' . __('Settings') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
});

add_action('wp_enqueue_scripts', 'woonft_enqueue_assets');
add_action('admin_enqueue_scripts', 'woonft_admin_enqueue_assets');

function woonft_enqueue_assets() {
    woonft_enqueue_scripts();
    woonft_enqueue_styles();
}

function woonft_admin_enqueue_assets() {
    wp_enqueue_script('woonft-imgcheckbox-script', plugin_dir_url(__FILE__) . 'js/jquery.imgcheckbox.js', ['jquery'], null, true);
    wp_enqueue_script('woonft-admin-script', plugin_dir_url(__FILE__) . 'js/woonft-admin.js', ['jquery'], null, true);
    wp_enqueue_style('woonft-admin-styles', plugin_dir_url(__FILE__) . 'css/woonft-admin-styles.css');
}

function woonft_enqueue_scripts() {
    wp_enqueue_script('woonft-bootstrap', 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.bundle.min.js', ['jquery'], null, true);
}

function woonft_enqueue_styles() {
    wp_enqueue_style('woonft-bootstrap-style', 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css', [], '4.5.2');
    wp_enqueue_style('woonft-styles', plugin_dir_url(__FILE__) . 'css/woonft-product-styles.css');
}

function woonft_localize_script($handle, $data =false) {
    wp_localize_script($handle, 'woonft_params', $data);
}

add_action('admin_menu', function () {
    add_menu_page('WooNFT', 'WooNFT', 'manage_options', 'woonft-settings', 'woonft_settings_page', 'dashicons-cart', 6);
});

function woonft_settings_page() {
    ?>
    <div class="wrap">
        <h1>WooNFT Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('woonft-settings-group'); ?>
            <?php do_settings_sections('woonft-settings-group'); ?>
            <table class="form-table">
                <tr valign="top">
                <th scope="row">License Key</th>
                    <td>
                        <span class="woonft-tooltip" data-tooltip="Your plugin activation key">
                                <input type="text" name="woonft_api_key" value="<?php echo get_option('woonft_api_key'); ?>">
                        </span>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

add_action('woocommerce_thankyou', 'custom_woocommerce_thankyou_order_details', 10, 1);
function custom_woocommerce_thankyou_order_details($order_id) {
    if (!$order_id)
        return;

    wp_enqueue_script('woonft-custom-script', plugin_dir_url(__FILE__) . 'js/woonft-button.js', ['jquery'], null, true);
    
    $order = wc_get_order($order_id);
    if (!$order)
        return;

    $products = [];
    foreach ($order->get_items() as $item_id => $item) {
        $product = $item->get_product();

        $short_description = $product->get_short_description();
        $words = explode(' ', $short_description);
        if (count($words) > 15) {
            $short_description = implode(' ', array_slice($words, 0, 15));
        }

        $products[] = 
        [
            'name' => $product->get_name(),
            'description' => $short_description,
        ];
    }
    
    $data = [
        'products' => $products,
        'api_key' => get_option('woonft_api_key'),
        'api_url' => 'https://woonft-api.yoshi.tech/api/',
    ];

    add_action('wp_footer', function() use ($data) {
        woonft_localize_script('woonft-custom-script', $data);
    });
}

add_action('wp_body_open', 'woonft_modals');
function woonft_modals() {
    include plugin_dir_path(__FILE__) . 'templates/modals.php';
}
