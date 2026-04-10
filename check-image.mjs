import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function analyzeImage() {
  const imagePath = '/home/z/my-project/upload/pasted_image_1774093683551.png';
  const base64Image = fs.readFileSync(imagePath).toString('base64');
  
  const zai = await ZAI.create();
  
  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'This is a GitHub repository screenshot. Describe EXACTLY what error or failure message you see. Is there a red banner? Yellow warning? What text is displayed? Be very specific about the error message.' 
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
