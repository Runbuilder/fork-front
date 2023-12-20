const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} = require("@google/generative-ai");
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' }); // 이미지 저장 위치 설정
// const port = 3000;
const MODEL_NAME = "gemini-pro-vision";
const API_KEY = process.env.API_KEY; // 실제 API 키로 대체

app.post('/generate', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "No image file provided." });
    }
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.5,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
        };
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ];
       const parts = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: Buffer.from(fs.readFileSync(req.file.path)).toString("base64")
                }
            },
            { text: " If there is no dish in the photo, please send us a message saying 'Please upload a photo of the dish'. else Give us the recipe for the dish in the photo in Korean." } // 또는 클라이언트로부터 받은 텍스트 사용
        ];
        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });
         // 필요한 부분만 추출하여 응답
         const generatedText = result.response.candidates.map(candidate => candidate.content.parts.map(part => part.text).join(' ')).join('\n');
         res.send({ message: "Content generated successfully!", generatedText });
     } catch (error) {
        console.error("Error during content generation:", error);
        res.status(500).send({ message: "An error occurred during content generation." });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
 
// const express = require('express')
// const app = express()
// app.get('/', function (req, res) {
//   res.json({'name':'Hello World'})
// })
// app.get('/sound/:name', function (req, res) {
//     const {name} = req.params;
//     var result = '';
//     if(name=='dog'){
//         console.log('멍멍');
//         result = '멍멍';
//     }else if(name=='cat'){
//         console.log('야옹야옹')
//         result = '야옹야옹';
//     }else if(name=='pig'){
//         console.log('꿀꿀꿀')
//         result = '꿀꿀꿀';
//     }else{
//         console.log('알수없음')
//         result = '알수없음';
//     }
//     console.log(name)
//   res.json({sound:result});
// })
// app.listen(3000)
