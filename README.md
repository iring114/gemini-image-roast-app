# Gemini 圖片毒舌評論網站

這是一個使用 Google Gemini Vision API 的娛樂性網站，可以讓使用者上傳圖片，然後由 AI 以毒舌、尖酸、搞笑的語氣評論圖片內容。

## ✨ 功能特色

*   **圖片上傳**：使用者可以上傳 JPG, JPEG, PNG 格式的圖片。
*   **AI 毒舌評論**：使用 Google Gemini Vision API 對上傳的圖片進行幽默、毒舌的文字評論。
*   **AI 評論圖像化 (新功能！)**：根據 AI 生成的文字評論，調用文字轉圖片服務生成一張對應的圖像。
*   **即時預覽**：上傳圖片後可立即預覽。
*   **評論與圖像顯示**：清晰展示 AI 的文字評論和生成的圖像。
*   **可愛 UI/UX**：清新、活潑且響應式的介面設計。
*   **圖片本機儲存**：上傳的圖片會儲存在伺服器的 `uploads` 資料夾中。

## 🛠️ 技術棧

*   **後端**：Node.js, Express.js
*   **前端**：HTML, CSS, JavaScript (Vanilla JS)
*   **圖片處理**：Multer (用於上傳)
*   **AI 模型**：Google Gemini API (gemini-2.0-flash 或更新模型用於視覺理解與文字生成)
*   **文字轉圖片**：(可選，需自行集成) 任何支援 API 調用的文字轉圖片服務，例如 DALL-E, Stability AI, Google Imagen 等。
*   **環境變數管理**：dotenv
*   **套件管理**：npm

## 🚀 安裝與啟動

1.  **複製專案**：
    ```bash
    git clone <your-repository-url>
    cd <project-directory>
    ```

2.  **安裝依賴**：
    ```bash
    npm install
    ```

3.  **設定環境變數**：
    *   複製 `.env.example` 並重新命名為 `.env`。
        ```bash
        # Windows
        copy .env.example .env
        # macOS / Linux
        cp .env.example .env
        ```
    *   在 `.env` 檔案中填入您的 Google Gemini API Key：
        ```env
        GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
        ```
    *   **(新功能)** 如果您想啟用「AI 評論圖像化」功能，您還需要填入您選擇的文字轉圖片服務的 API Key。請注意，您需要在 `server.js` 中取消註解並實現 `generateImageFromText` 函數中的相關 API 調用邏輯。
        ```env
        # TEXT_TO_IMAGE_API_KEY="YOUR_TEXT_TO_IMAGE_API_KEY_HERE"
        ```

4.  **啟動伺服器**：
    ```bash
    npm start
    ```

5.  在瀏覽器中開啟 `http://localhost:3000` (或您設定的 PORT)。

## 🤖 AI Prompt 參考 (Gemini Vision)

```text
請用非常毒舌、誇張、幽默但不要太過分的方式評論這張圖片。盡量搞笑，可以帶點諷刺。
```

## 🖼️ AI 評論圖像化 Prompt 參考 (文字轉圖片服務)

傳遞給文字轉圖片服務的 Prompt 直接就是由 Gemini API 生成的毒舌評論文字。

## 📝 注意事項

*   請確保您的 Google Gemini API Key 和文字轉圖片服務的 API Key (如果使用) 是有效的，並且有足夠的配額。
*   **文字轉圖片服務集成**：目前 `server.js` 中的 `generateImageFromText` 函數是一個框架/佔位符。您需要根據您選擇的文字轉圖片服務的 API 文件來實現實際的 API 調用邏輯，並在 `.env` 文件中配置相應的 API Key。
*   本專案僅為娛樂和學習目的，請勿用於生成或傳播任何不當、冒犯性或侵犯版權的內容。
*   AI 生成的內容可能充滿創意，但也可能出乎意料，請以娛樂心態看待。
*   上傳的圖片會儲存在伺服器的 `uploads` 資料夾。您可以根據需求修改 `server.js` 中的邏輯來決定是否在處理後刪除這些圖片。

## 💡 未來可擴展方向

*   支援更多圖片格式。
*   允許使用者自訂 AI 評論的「毒舌程度」或風格。
*   整合不同的文字轉圖片模型，讓使用者選擇。
*   加入使用者帳號系統，保存歷史紀錄。
*   將圖片儲存到雲端儲存服務 (如 AWS S3, Google Cloud Storage)。

希望您玩得開心！🎉