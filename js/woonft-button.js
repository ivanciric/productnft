jQuery(document).ready(function($) {

    async function getNft() {
        $('#nftModal').modal('show');
        $('#nftImage').hide();
        $('#claimNftButton').hide();
        $('#loader').show();
        $('#loadingText').show();

  

        let description = woonft_params.productName + ' ' + woonft_params.productDescription + '. Make it NFT art, polished and high quality.';
        try {
            
            // const response = await window.imgResponse(description);
            // const imageUrl = response.data[0].url;
            const imageUrl = "https://www.cnet.com/a/img/resize/7589227193923c006f9a7fd904b77bc898e105ff/hub/2021/11/29/f566750f-79b6-4be9-9c32-8402f58ba0ef/richerd.png?auto=webp&width=768";

            $('#nftImage').attr('src', imageUrl).show();
            $('#claimNftButton').show();
            $$('#loader').hide();
            $('#loadingText').hide();
            
  
        } catch (error) {
            console.error("Error fetching NFT:", error);
            $('#loader').hide();
            $('#loadingText').hide();
            
     
        }
    }

    $('#claimNftButton').click(function() {
        alert("NFT claim functionality to be implemented.");
    });


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


