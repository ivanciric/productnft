import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: woonft_params.ai_key,
    dangerouslyAllowBrowser: true
});

window.imgResponse = async function(imgDescription) {
    return await openai.images.generate({ 
        prompt: imgDescription, 
        size: '1024x1024',
        model: 'dall-e-3',
        style: 'vivid'
     });
};
