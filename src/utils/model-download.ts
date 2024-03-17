import * as fs from 'fs';

export function downloadBuffer(filePath: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.buffer); // Convierte el buffer de Node.js en un ArrayBuffer
      }
    });
  });
}
