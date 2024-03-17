import Jimp from 'jimp';
import { Tensor } from 'onnxruntime-node';
import { File } from 'buffer';

export async function getImageTensorFromPath(
  path: File,
  modelWidth: number,
  modelHeight: number,
) {
  const image = await loadImageFromPath(path);

  const imageTensor = imageDataToTensor(image, modelWidth, modelHeight);

  return imageTensor;
}

async function loadImageFromPath(file: any) {
  const image = await Jimp.read(file.buffer);
  const resizedImage = await image.resize(640, 640);

  return resizedImage;
}

function imageDataToTensor(
  image: Jimp,
  modelWidth: number,
  modelHeight: number,
) {
  const imageBufferData = image.bitmap.data;
  const [redArray, greenArray, blueArray] = [[], [], []];

  for (let i = 0; i < imageBufferData.length; i += 4) {
    redArray.push(imageBufferData[i]);
    greenArray.push(imageBufferData[i + 1]);
    blueArray.push(imageBufferData[i + 2]);
  }

  const transposedData = redArray.concat(greenArray).concat(blueArray);

  let i;
  const l = transposedData.length;

  const float32Data = new Float32Array(3 * modelWidth * modelHeight);

  for (i = 0; i < l; i++) {
    float32Data[i] = transposedData[i] / 255;
  }

  const inputTensor = new Tensor('float32', float32Data);

  return inputTensor;
}
