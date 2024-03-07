jQuery(document).ready(function($) {
    const woonftApiUrl = 'https://woonft-api.yoshi.tech/api/';
    const currentUrl = window.location.href;
    const params = new URLSearchParams(new URL(currentUrl).search);

    insertGetNftButtons();
    checkUrlParams();

    $(document).on('click', '#claimNftButton', function() {
        handleNftClaim();
    });

    function checkUrlParams() {
        if (params.has('transactionHashes')) {
            console.log("txhash:", params.get('transactionHashes'));
            $('#congratsModal').modal('show');
        } else {
            console.log("URL does not contain 'transactionHashes' parameter.");
        }

        if(params.has('woonft-data-index')) {
            const indices = params.getAll('woonft-data-index');
            indices.forEach(index => {
                $('.get-nft-button[data-index="' + index + '"]').remove();
            });
        }

    }

    function insertGetNftButtons() {
        // Assuming there's a way to identify each product row in the table, e.g., each has a 'product-row' class
        $('tr.order_item').each(function(index) {
            const product = woonft_params.products[index];
            const button = $('<button/>', {
                text: 'Get free NFT!',
                class: 'get-nft-button holo-button button alt wp-element-button',
                'data-index': index, // Assuming each product has a unique 'id'
                click: function(e) {
                    e.preventDefault();
                    getNft(index); // Pass the product ID to the getNft function
                }
            });

            // Assuming you want to add the button to the first cell in each row
            $(this).find('td').first().append('<br/>');
            $(this).find('td').first().append(button);
        });
    }

    async function getNft(index) {
        const product = woonft_params.products[index];
        const productName = product.name.split(" - ")[0];
        const descriptionText = `${productName}. Make it like NFT art. Emphasize digital futuristic look and make it abstract.`;

        $('#nftModal').modal('show');
        toggleLoader(true);

        try {
            const response = await $.ajax({
                url: `${woonftApiUrl}get-image`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ description: descriptionText })
            });
            displayImage(response.imageUrl, index);
        } catch (error) {
            console.error("Error fetching NFT:", error);
            toggleLoader(false);
        }
    }

    function displayImage(imageUrl, index) {
        $('#nftImage').data('index', index);
        $('#nftImage').attr('src', imageUrl).show();
        toggleLoader(false);
        $('#claimNftButton').show();
    }

    function handleNftClaim() {
        const imageUrl = $('#nftImage').attr('src');
        const index = $('#nftImage').data('index');
        if (!imageUrl) {
            alert('No NFT image to load.');
            return;
        }

        $('#nftModal').modal('hide');
        $('#mintModal').modal('show');
        toggleMintLoader(true);

        const url = new URL(currentUrl);
        url.searchParams.set('woonft-data-index', index);

        $.ajax({
            url: `${woonftApiUrl}mint`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                imageUrl,
                name: "Woo NFT Art",
                description: woonft_params.products[index].name,
                redirectUrl: url
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
});
