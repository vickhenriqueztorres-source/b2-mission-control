"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionToFireflyBridge = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../event-hub/logger");
class MotionToFireflyBridge {
    static convert(motionPackagePath, outputPath) {
        logger_1.Logger.info('MotionToFireflyBridge', `Convertendo Motion Package: ${motionPackagePath}`);
        if (!fs_1.default.existsSync(motionPackagePath)) {
            throw new Error(`Arquivo de Motion Package não encontrado: ${motionPackagePath}`);
        }
        const outputDir = path_1.default.dirname(outputPath);
        const imagesDir = path_1.default.join(outputDir, 'imagens');
        if (!fs_1.default.existsSync(imagesDir)) {
            fs_1.default.mkdirSync(imagesDir, { recursive: true });
        }
        const rawData = fs_1.default.readFileSync(motionPackagePath, 'utf-8');
        const motionData = JSON.parse(rawData);
        const rawItems = Array.isArray(motionData)
            ? motionData
            : (motionData.shots || motionData.items || [motionData]);
        const fireflyGuide = rawItems.map((item, index) => {
            const shotName = item.shot_id || `SHOT_${(index + 1).toString().padStart(2, '0')}`;
            const takeName = item.take_id || 'TAKE_01';
            const promptText = item.motion_prompt || item.prompt || 'Cinematic movement';
            const origImagePath = item.start_frame_path || item.image_path || '';
            const destImageName = `${shotName}_${takeName}_start.png`;
            const destImagePath = path_1.default.join(imagesDir, destImageName);
            if (fs_1.default.existsSync(origImagePath)) {
                fs_1.default.copyFileSync(origImagePath, destImagePath);
            }
            else {
                // Criar imagem de teste válida de 100x100 para PNG
                fs_1.default.writeFileSync(destImagePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'));
            }
            return {
                name: `${shotName}_${takeName}`,
                prompt: promptText,
                image_path: destImageName, // Exigido pelo Firefly JobStore dentro da pasta imagens/
                model: item.model || 'Kling 3.0',
                resolution: item.resolution || '720p',
                aspect_ratio: item.aspect_ratio || '9:16',
                duration_seconds: item.generation_duration_seconds || item.duration_seconds || 5
            };
        });
        const fireflyOutputFormat = {
            model: "Kling 3.0",
            resolution: "720p",
            aspect_ratio: "9:16",
            duration_seconds: 5,
            items: fireflyGuide.map(item => ({
                name: item.name,
                image: item.image_path,
                prompt: item.prompt
            }))
        };
        fs_1.default.writeFileSync(outputPath, JSON.stringify(fireflyOutputFormat, null, 2), 'utf-8');
        logger_1.Logger.info('MotionToFireflyBridge', `Guia Firefly gerada com sucesso em ${outputPath} com ${fireflyGuide.length} itens.`);
        return fireflyGuide;
    }
}
exports.MotionToFireflyBridge = MotionToFireflyBridge;
