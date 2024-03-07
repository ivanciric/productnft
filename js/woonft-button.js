jQuery(document).ready(function($) {
    const woonftApiUrl = 'https://woonft-api.yoshi.tech/api/';
    const currentUrl = window.location.href;
    const params = new URLSearchParams(new URL(currentUrl).search);

    // Assuming each product listing has a distinct class or ID for targeting
    insertGetNftButtons();
    checkUrlParams();

    $(document).on('click', '#claimNftButton', function() {
        const productId = $(this).data('productId');
        handleNftClaim(productId);
    });

    function checkUrlParams() {
        if (params.has('transactionHashes')) {
            console.log("txhash:", params.get('transactionHashes'));
            $('#congratsModal').modal('show');
            $('.get-nft-button').remove();
            $('#nftButtonRow').remove();
        } else {
            console.log("URL does not contain 'transactionHashes' parameter.");
        }
    }

    function insertGetNftButtons() {
        if (woonft_params.products && woonft_params.products.length > 0) {

            var $firstTable = $('table').first();
            var $tfoot = $firstTable.find('tfoot');
            if ($tfoot.length === 0) {
                $tfoot = $('<tfoot></tfoot>').appendTo($firstTable);
            }
            var $newTr = $('<tr id="nftButtonRow"><td colspan="100%" id="nftButtonPlaceholder"></td></tr>');
            $tfoot.append($newTr);

            $('<button/>', {
                text: 'Get free NFT of your items!',
                class: 'get-nft-button holo-button button alt wp-element-button',
                click: (e) => {
                    e.preventDefault();
                    // Assuming getNft function is adapted to handle product info
                    getNft();
                }
            }).prependTo('#nftButtonPlaceholder');

            
        }
    }
    

    async function getNft() {
        const products = woonft_params.products;

        var allProductNames = woonft_params.products.map(function(product) {
            return product.name.split(" - ")[0];
        });
        var productNamesString = allProductNames.join(", ");
        console.log(productNamesString);

        const descriptionText = `${productNamesString}. Make it like NFT art. Emphasize digital futuristic look and make it abstract.`;

        $('#nftModal').modal('show');
        toggleLoader(true);

        try {
            $.ajax({
                url: `${woonftApiUrl}get-image`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ description: descriptionText }),
                success: (data) => displayImage(data.imageUrl),
                error: (error) => console.error('Error:', error)
            });
        } catch (error) {
            console.error("Error fetching NFT:", error);
            toggleLoader(false);
        }
    }

    function displayImage(imageUrl) {
        $('#nftImage').attr('src', imageUrl).show();
        toggleLoader(false);
        $('#claimNftButton').show();
    }

    function handleNftClaim() {
        const imageUrl = $('#nftImage').attr('src');
        if (!imageUrl) {
            alert('No NFT image to load.');
            return;
        }

        $('#nftModal').modal('hide');
        $('#mintModal').modal('show');
        toggleMintLoader(true);

        $.ajax({
            url: `${woonftApiUrl}mint`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                imageUrl,
                name: "Woo NFT cArt",
                description: "Shopping cart items as NFT art",
                redirectUrl: currentUrl
            }),
            success: (data) => {
                $('#nftButtonRow').remove();
                window.location.href = data.signUrl;
            },
            error: (error) => console.error('Error:', error)
        });
    }

    function toggleLoader(show) {
        $('#loader, #loadingText').toggle(show);
        $('#nftImage, #claimNftButton').toggle(!show);
    }

    function toggleMintLoader(show) {
        $('#loader-mint, #loadingTextMint').toggle(show);
    }

    console.log(woonft_params.products);
});
