jQuery(document).ready(function($) {
    const woonftApiUrl = 'https://woonft-api.yoshi.tech/api/';
    const currentUrl = window.location.href;
    const params = new URLSearchParams(new URL(currentUrl).search);

    insertGetNftButton();
    checkUrlParams();

    $('#claimNftButton').on('click', function() {
        handleNftClaim();
    });

    function checkUrlParams() {
        if (params.has('transactionHashes')) {
            console.log("txhash:", params.get('transactionHashes'));
            $('#congratsModal').modal('show');
            $('.get-nft-button').remove();
        } else {
            console.log("URL does not contain 'transactionHashes' parameter.");
        }
    }

    async function getNft() {
        const descriptionText = `${woonft_params.productName} ${woonft_params.productDescription}. Make it like NFT art, artistic and futuristic, not realistic. Emphasize digital futuristic look and make it abstract. No letters or fonts.`;

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

    function insertGetNftButton() {
        if ($('.get-nft-button').length === 0 && $('button.single_add_to_cart_button').length) {
            $('<button/>', {
                text: 'Get free NFT!',
                class: 'get-nft-button holo-button button alt wp-element-button',
                click: (e) => {
                    e.preventDefault();
                    getNft();
                }
            }).insertAfter('button.single_add_to_cart_button');
        }
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
                name: woonft_params.productName,
                description: woonft_params.productName,
                redirectUrl: currentUrl
            }),
            success: (data) => {
                $('.get-nft-button').remove();
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
});
