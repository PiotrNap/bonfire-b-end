import * as crypto from "crypto";

export class Random {
  private readonly CHARSET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  public generateRandomString(size: number): string {
    var buffer = new Uint8Array(size);
    buffer = this.generateRandomBytes(buffer, size);

    return this.convertBufferToString(buffer);
  }

  public generateRandomBytes(input: Uint8Array, size: number): Uint8Array {
    if (input.byteLength !== size) input = new Uint8Array(input.buffer);

    var output = crypto.randomBytes(size);

    for (let i = 0; i < size; i++) input[i] = output[i];

    return output;
  }

  public convertBufferToString(buffer: Uint8Array): string {
    const charsArr: string[] = [];

    for (let i = 0; i < buffer.byteLength; i++) {
      const index = buffer[i] % this.CHARSET.length;
      console.log(buffer[i]);
      charsArr.push(this.CHARSET[index]);
    }
    return charsArr.join("");
  }
}
