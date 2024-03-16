jQuery(document).ready(function($) {
    const woonftApiUrl = 'https://woonft-api.yoshi.tech/api/';
    //const woonftApiUrl = 'http://localhost:3000/api/';
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

    async function checkUrlParams() {
        if(params.has('network')) {
            network = params.get('network');
        }

        if (params.has('transactionHashes') && params.has('woonft-data-index') && params.has('reference')) {
            txComplete = true;
       
            $('#woonftFullscreenLoader').show();
            setTimeout(() => {
                $('#woonftFullscreenLoader').remove();
                getNftUrl(params.get('reference'));
            }, 3500);

                
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
            const tokenId = uuidv4();
            const button = $('<button/>', {
                text: 'Claim a free NFT!',
                class: 'get-nft-button holo-button button alt wp-element-button',
                'data-index': index, 
                'data-token-id': tokenId,
                click: function(e) {
                    e.preventDefault();
                    getNft(index, tokenId); // Pass the product ID to the getNft function
                }
            });

            // Assuming you want to add the button to the first cell in each row
            $(this).find('td').first().append('<br/>');
            $(this).find('td').first().append(button);
        });
    }


    async function getNftUrl(reference) {
        try {
            const response = await $.ajax({
                url: `${woonftApiUrl}get-token-link`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ reference: reference }),
                headers: {
                    'x-license-key': woonft_params.api_key
                }
            });

            const resp = JSON.parse(response);
            const link = resp.url;
           console.log("link:", link);
            $('.woonft-mintbase-link-popup').attr('href', link);
            const indices = params.getAll('woonft-data-index');
            const latestIndex = indices[indices.length - 1];
            localStorage.setItem('woonft-index-' + latestIndex, link);

            console.log("indices:", indices);
            indices.forEach(index => {
                const nftLink = localStorage.getItem('woonft-index-' + index);
                $('.get-nft-button[data-index="' + index + '"]').after(`<a href="${nftLink}" class="woonft-mintbase-link-popup" target="_blank">See your NFT on Mintbase!</a>`);
                $('.get-nft-button[data-index="' + index + '"]').remove();
            });

            $('#congratsModal').modal('show');
        } catch (error) {
            console.error('Error retrieving NFT URL:', error.message);
            window.location.reload();
            // Handle error, for example, by showing an error message to the user
        }
    }

    async function getNft(index, tokenId) {
        const product = woonft_params.products[index];
        const productName = product.name.split(" - ")[0];
        const descriptionText = `${productName}. Make it digital art. Emphasize digital futuristic look and make it abstract.`;

        $('#nftModal').modal('show');
        toggleLoader(true);

   
            const response = await $.ajax({
                url: `${woonftApiUrl}get-image`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ description: descriptionText }),
                headers: {
                    'x-license-key': woonft_params.api_key
                },
                success: function(response) {
                    const imageDataURI = `data:image/png;base64,${response.image}`;
                    const imageUrl = response.imageUrl;
                    displayImage(imageDataURI, imageUrl, index, tokenId);
                },
                error: function(jqXHR) {
                    $('#nftModal').modal('hide');
                    toggleLoader(false);
                    if (jqXHR.status === 403) {
                        alert('Service not active.\nCheck your license key.');
                    } else {
                        alert('Connection to AI model failed due to high demand.\nPlease try again.');
                    }
                }
            });
        
            // const imageDataURI = `data:image/png;base64,`;
            // const imageUrl = 'http://url';
            // displayImage(imageDataURI, imageUrl, index, tokenId);
    }

    function displayImage(imageDataUri, imageUrl, index, tokenId) {
        $('#nftImage').data('index', index);
        $('#nftImage').data('url', imageUrl);
        $('#nftImage').attr('src', imageDataUri).show();
        toggleLoader(false);
        console.log("tokenId:", tokenId);
        $('#claimNftButton').get(0).setAttribute('data-token-id', tokenId);
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
        url.searchParams.set('woonft-token-id', tokenId);

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
            headers: {
                'x-license-key': woonft_params.api_key
            },
            success: (data) => {
                $('#nftButtonRow').remove();
                window.location.href = data.signUrl;
            },
            error: function(jqXHR) {
                if (jqXHR.status === 403) {
                    $('#mintModal').modal('hide');
                    $('#nftModal').modal('show');
                    alert('Service not active.\nCheck your license key.');
                } else {
                    $('#mintModal').modal('hide');
                    $('#nftModal').modal('show');
                    alert('Connection to minter failed due to high demand.\nPlease try again.');
                }
            }
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
