jQuery(document).ready(function($) {
    const woonftApiUrl = 'https://woonft-api.yoshi.tech/api/';
    const currentUrl = window.location.href;
    const params = new URLSearchParams(new URL(currentUrl).search);
    var network = 'testnet';
    var txComplete = false;
    var woonftButtonIndex = 0;

    
    insertGetNftButtons();
    checkUrlParams();
    

    $(document).on('click', '#claimNftButton', function() {
        handleNftClaim();
    });

    function checkUrlParams() {
        if(params.has('network')) {
            network = params.get('network');
        }

        if(params.has('woonft-data-index')) {
            var link = "https://testnet.wallet.mintbase.xyz/login?success_url=https%3A%2F%2Ftestnet.mintbase.xyz%2Fcontract%2Fwoonft.mintspace2.testnet%2Fnfts%2Fall%2F0%3FonlyOwned%3Dtrue&failure_url=https%3A%2F%2Ftestnet.mintbase.xyz%2Fcontract%2Fwoonft.mintspace2.testnet%2Fnfts%2Fall%2F0%3FonlyOwned%3Dtrue";
            if (network === 'mainnet') {
                link = "https://wallet.mintbase.xyz/login?success_url=https%3A%2F%2Fmintbase.xyz%2Fcontract%2Fyoshi.mintbase1.near%2Fnfts%2Fall%2F0%3FonlyOwned%3Dtrue&failure_url=https%3A%2F%2Fmintbase.xyz%2Fcontract%2Fyoshi.mintbase1.near%2Fnfts%2Fall%2F0%3FonlyOwned%3Dtrue";
            }
            $('.woonft-mintbase-link-popup').attr('href', link);

            const indices = params.getAll('woonft-data-index');
            console.log("indices:", indices);
            indices.forEach(index => {
                $('.get-nft-button[data-index="' + index + '"]').after(`<a href="${link}" class="woonft-mintbase-link-popup" target="_blank">See your NFT on Mintbase!</a>`);
                $('.get-nft-button[data-index="' + index + '"]').remove();
            });
        }

        if (params.has('transactionHashes')) {
            console.log("txhash:", params.get('transactionHashes'));
            txComplete = true;
            $('#congratsModal').modal('show');
        } else {
            console.log("URL does not contain 'transactionHashes' parameter.");
        }

        
    }

    $('.woonft-mintbase-link-popup').on('click', function(e) {
        e.preventDefault();
        var url = $(this).attr('href');
        window.open(url, '_blank');
        $('#congratsModal').modal('hide');
    });
    
    function insertGetNftButtons() {
        // Assuming there's a way to identify each product row in the table, e.g., each has a 'product-row' class
        $('tr.order_item').each(function(index) {
            const product = woonft_params.products[index];
            const button = $('<button/>', {
                text: 'Claim a free NFT!',
                class: 'get-nft-button holo-button button alt wp-element-button',
                'data-index': index, 
                'data-token-id': uuidv4(),
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
        const descriptionText = `${productName}. Make it digital art. Emphasize digital futuristic look and make it abstract.`;

        $('#nftModal').modal('show');
        toggleLoader(true);

        try {
            const response = await $.ajax({
                url: `${woonftApiUrl}get-image`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ description: descriptionText })
            });
            const imageDataURI = `data:image/png;base64,${response.image}`;
            const imageUrl = response.imageUrl;
            displayImage(imageDataURI, imageUrl, index);
        } catch (error) {
            $('#nftModal').modal('hide');
            alert('Connection to AI model failed due to high demand.\nPlease try again.')
            console.error("Error fetching NFT:", error);
            toggleLoader(false);
        }
    }

    function displayImage(imageDataUri, imageUrl, index) {
        $('#nftImage').data('index', index);
        $('#nftImage').data('url', imageUrl);
        $('#nftImage').attr('src', imageDataUri).show();
        toggleLoader(false);
        $('#claimNftButton').show();
    }

    function handleNftClaim() {
        const image = $('#nftImage').attr('src');
        const index = $('#nftImage').data('index');
        const imageUrl = $('#nftImage').data('url');
        const tokenId = $('#nftImage').data('token-id');
        if (!image) {
            alert('No NFT image to load.');
            return;
        }

        $('#nftModal').modal('hide');
        $('#mintModal').modal('show');
        toggleMintLoader(true);

        const url = new URL(currentUrl);
        url.searchParams.append('woonft-data-index', index);

        $.ajax({
            url: `${woonftApiUrl}mint`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                imageUrl: imageUrl,
                name: "WooNFT Art",
                description: woonft_params.products[index].name,
                redirectUrl: url,
                tokenId: tokenId
            }),
            success: (data) => {
                $('#nftButtonRow').remove();
                window.location.href = data.signUrl;
            },
            error: (error) => console.error('Error:', error)
        });
    }

    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
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
