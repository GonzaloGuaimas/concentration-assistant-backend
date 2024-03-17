import { Injectable } from '@nestjs/common';
import { InferenceSession, Tensor } from 'onnxruntime-node';
import { detectImage } from 'src/utils/model-detect';
import { downloadBuffer } from 'src/utils/model-download';
import { resultTransform } from 'src/utils/model-results';
import { File } from 'buffer';
const CUSTOM_MODEL_PATH =
  '/Users/gonzaloguaimas/Documents/tesis/2024/concentration-assistant-backend/src/utils/custom_model.onnx';
const NMS_MODEL_PATH =
  '/Users/gonzaloguaimas/Documents/tesis/2024/concentration-assistant-backend/src/utils/nms-yolov8.onnx';
const MODEL_SHAPES = [1, 3, 640, 640];

@Injectable()
export class DetectionService {
  private session: { net: InferenceSession; nms: InferenceSession };

  constructor() {
    this.initializeSession().catch((error) => {
      console.error('Failed to initialize session:', error);
    });
  }
  private async initializeSession(): Promise<void> {
    const arrBufNet = await downloadBuffer(CUSTOM_MODEL_PATH);
    const yolov8 = await InferenceSession.create(arrBufNet);
    const arrBufNMS = await downloadBuffer(NMS_MODEL_PATH);
    const nms = await InferenceSession.create(arrBufNMS);

    const tensor = new Tensor(
      'float32',
      new Float32Array(MODEL_SHAPES.reduce((a, b) => a * b)),
      MODEL_SHAPES,
    );
    await yolov8.run({ images: tensor });

    this.session = { net: yolov8, nms: nms };
    console.log('Session initialized');
  }

  async objectDetection(image: File): Promise<any> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    const result = await detectImage(image, this.session);
    const resultTransformed = resultTransform(result);
    console.log(
      `label: ${resultTransformed[0].label} | ${resultTransformed[0].confidence}`,
    );

    return result;
  }
}
