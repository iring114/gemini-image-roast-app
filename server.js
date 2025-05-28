const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Modality } = require("@google/generative-ai");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;

// --- Configuration ---
dotenv.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// TODO: Add your Text-to-Image API Key here in .env and uncomment
// const TEXT_TO_IMAGE_API_KEY = process.env.TEXT_TO_IMAGE_API_KEY; 

if (!GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set in .env file.");
    process.exit(1);
}

// --- Multer Setup for Image Uploads ---
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File upload only supports JPEG, JPG, PNG format!'));
        }
    }
});

// --- Google Generative AI Setup ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", 
});

// Remove the separate imageGenerationModel, we'll use the main genAI instance with specific model for image generation
// const imageGenerationModel = genAI.getGenerativeModel({
//     model: "gemini-pro-vision", 
// });

const generationConfig = {
    temperature: 0.8,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    // responseMimeType: "text/plain", // Removed as it causes an error
};

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// --- Helper Functions ---
function fileToGenerativePart(filePath, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
            mimeType
        },
    };
}



// --- Express Routes ---
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname))); // Serve static files from root (for index.html)
app.use('/uploads', express.static(UPLOADS_DIR)); // Serve uploaded images (if needed for direct access)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const imagePath = req.file.path;
    const mimeType = req.file.mimetype;
    const stylePrompt = req.body.stylePrompt || "請用溫和幽默的方式評論這張圖片，保持友善但有趣的語調";
    const language = req.body.language || 'zh';
    
    console.log(`[Upload] Image received: ${imagePath}, MIME type: ${mimeType}`);
    console.log(`[Upload] Style: ${req.body.style}, Language: ${language}`);

    try {
        const imagePart = fileToGenerativePart(imagePath, mimeType);
        
        // Use the style prompt from frontend with language-specific base prompt
        const basePrompts = {
            'zh': '你是一位幽默風趣的圖像評論家，擅長用機智、詼諧的語氣評論使用者上傳的圖片。',
            'en': 'You are a witty and humorous image critic who excels at commenting on user-uploaded images with clever and playful tone.',
            'ja': 'あなたはユーモアに富んだ画像評論家で、ユーザーがアップロードした画像を機知に富んだ楽しい口調でコメントするのが得意です。'
        };
        
        const endPrompts = {
            'zh': '請用不超過 100 字的評論，語氣幽默風趣但保持友善，重點是要機智有趣。請評論這張圖片的外觀、風格、構圖、拍攝內容，用輕鬆詼諧的方式表達。',
            'en': 'Please provide a comment of no more than 100 words, with a humorous and witty tone while staying friendly. Focus on being clever and entertaining. Comment on the appearance, style, composition, and content of this image in a lighthearted and playful way.',
            'ja': '100文字以内でコメントしてください。ユーモラスで機知に富んだ口調で、親しみやすさを保ちながら、賢くて面白いことに重点を置いてください。この画像の外観、スタイル、構図、撮影内容について、軽快で楽しい方法でコメントしてください。'
        };
        
        const basePrompt = basePrompts[language] || basePrompts['zh'];
        const endPrompt = endPrompts[language] || endPrompts['zh'];
        const prompt = `${basePrompt} ${stylePrompt} ${endPrompt}`;

        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            history: [],
        });

        const result = await chatSession.sendMessage([prompt, imagePart]);
        const aiComment = result.response.text();
        console.log("[AI Comment] Generated: ", aiComment);

        // Image generation based on AI comment is removed.

        // Optional: Delete the uploaded file after processing
        // fs.unlink(imagePath, (err) => {
        //     if (err) console.error("[Upload] Error deleting temp file:", err);
        //     else console.log("[Upload] Temp file deleted:", imagePath);
        // });

        res.json({ 
            message: 'Image processed successfully!', 
            aiComment: aiComment,
            uploadedImageUrl: `/uploads/${path.basename(imagePath)}` // If you want to show the uploaded image too
        });

    } catch (error) {
        console.error("[Upload] Error processing image with Gemini API:", error);
        // Attempt to delete the file even if an error occurs during API processing
        // fs.unlink(imagePath, (err) => {
        //     if (err) console.error("[Upload] Error deleting temp file after API error:", err);
        //     else console.log("[Upload] Temp file deleted after API error:", imagePath);
        // });
        res.status(500).json({ error: 'Failed to process image with AI. ' + error.message });
    }
});

// --- Server Start ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app; // For testing or other integrations