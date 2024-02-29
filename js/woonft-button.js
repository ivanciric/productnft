jQuery(document).ready(function($) {
    const urlParams = new URLSearchParams(window.location.search);
    const txHash = urlParams.get('transactionHashes');
    let product_data = null;
    

    async function getNft() {

    }

    function insertGetNftButton() {
        const addToCartButton = $('button.single_add_to_cart_button');

        if (true) { // check blockchain services
            if ($('.get-nft-button').length === 0) {
                const getNftButton = $('<button/>', {
                    text: 'Get free NFT!',
                    class: 'get-nft-button holo-button button alt wp-element-button' ,
                    style: '',
                    click: function(e) {
                        e.preventDefault();
                        getNft();
                    }
                });

                addToCartButton.after(getNftButton);
            }
        } else {
            $('.get-nft-button').remove();        
        }
    }

    insertGetNftButton();
});


