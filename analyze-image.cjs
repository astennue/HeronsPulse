const fs = require('fs');
const ZAI = require('z-ai-web-dev-sdk').default;

async function analyzeImage() {
  const imagePath = '/home/z/my-project/upload/pasted_image_1774093549007.png';
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  
  const zai = await ZAI.create();
  
  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'What does this GitHub screenshot show? Is there any error or failure message? Describe exactly what you see, including any red error messages, warnings, or issues.' 
          },
          { 
            type: 'image_url', 
            image_url: { 
              url: `data:image/png;base64,${base64Image}` 
            } 
          }
        ]
      }
    ],
    thinking: { type: 'disabled' }
  });
  
  console.log(response.choices[0]?.message?.content);
}

analyzeImage().catch(console.error);
