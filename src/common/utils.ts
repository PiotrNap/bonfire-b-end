import { getConnectionOptions, getConnection } from "typeorm"
import { Buffer } from "buffer"

let MODEL

import tf from "@tensorflow/tfjs-node"
import nsfw from "nsfwjs"
import qs from "qs"
import decode from "image-decode"

import bcrypt from "bcrypt"
import crypto from "crypto"

export const loadModel = async () => {
  if (process.env.NODE_ENV !== "dev") {
    tf.enableProdMode()
  }
  MODEL = await nsfw.load("file://./src/model/tf/", { size: 299 })
}

export class Random {
  private readonly CHARSET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  public generateRandomString(size: number): string {
    let buffer = new Uint8Array(size)
    buffer = this.generateRandomBytes(buffer, size)

    return this.convertBufferToString(buffer)
  }

  public generateRandomBytes(input: Uint8Array, size: number): Uint8Array {
    if (input.byteLength !== size) input = new Uint8Array(input.buffer)

    const output = crypto.randomBytes(size)

    for (let i = 0; i < size; i++) input[i] = output[i]

    return output
  }

  public convertBufferToString(buffer: Uint8Array): string {
    const charsArr: string[] = []

    for (let i = 0; i < buffer.byteLength; i++) {
      const index = buffer[i] % this.CHARSET.length
      charsArr.push(this.CHARSET[index])
    }
    return charsArr.join("")
  }
}

// currency
export const cent = Buffer.from([0xc2, 0xa2])
export const euro = Buffer.from([0xe2, 0x82, 0xac])

export const unixTime = Math.floor(Date.now())
export function localTimeStamp() {
  return new Date().toISOString()
}
export const isoTime = new Date(Math.floor(Date.now())).toISOString()
export const expiry = new Date(Math.floor(Date.now()) + 1000 * 3600)
export const expirationTime = expiry.toLocaleTimeString()
export const expirationDate = expiry.toLocaleDateString()
export const localTime = new Date(Math.floor(Date.now())).toLocaleTimeString()
export const localDate = new Date(Math.floor(Date.now())).toLocaleDateString()
export const utcTime = new Date(Math.floor(Date.now())).toUTCString()
export const argCounter = (...i) => {
  let argCounter = 0
  for (const acc of i) argCounter++
  return argCounter
}
export const elementCounter = (i) => {
  let elemCounter = 0
  for (const acc of i) elemCounter++
  return elemCounter
}
export const sum = (i: number[]) => {
  return i.reduce((a, b) => a + b, 0)
}
export const stripSentence = (i) => {
  const re = /(\.)/
  return i.split(re).filter((i) => i != "" && i != ".")
}

export const stripWords = (i) => {
  for (const x of i) {
  }
  i = i.replace(".", "")
  i = i.replace(",", "")
  i = i.replace(":", "")
  i = i.replace(";", "")
  return i.split(" ")
}

export const stripValues = (r) => {
  const res = []
  for (const i of r) {
    res.push(i)
  }
  return res
}

export const stripType = (r) => {
  const res = []
  for (const i of r) {
    res.push(typeof i)
  }
  return res
}

export const range = (s, e) =>
  e > s
    ? Array(e - s + 1)
        .fill(0)
        .map((x, y) => y + s)
    : Array(s - e + 1)
        .fill(0)
        .map((x, y) => -y + s)

export const toPromise = <T>(data: T): Promise<T> => {
  return new Promise<T>((resolve) => {
    resolve(data)
  })
}

export const getDbConnectionOptions = async (connectionName: string = "default") => {
  const options = await getConnectionOptions(process.env.NODE_ENV || "development")
  return {
    ...options,
    name: connectionName,
  }
}

export const getDbConnection = async (connectionName: string = "default") => {
  return await getConnection(connectionName)
}

export const runDbMigrations = async (connectionName: string = "default") => {
  const conn = await getDbConnection(connectionName)
  await conn.runMigrations()
}

export const comparePasswords = async (userPassword, currentPassword) => {
  return await bcrypt.compare(currentPassword, userPassword)
}

export const base64ToUint8Array = (val: string): Uint8Array => {
  const buff = Buffer.from(val, "base64")
  return new Uint8Array(buff)
}

export const base64ToUTF8 = (val: string) => {
  return Buffer.from(val, "base64").toString("utf-8")
}

export const utf8ToBase64 = (val: string) => {
  return Buffer.from(val, "utf-8").toString("base64")
}

export const buildRedirectURL = (
  queryObj: { [key: string]: any },
  uri: string
): string => {
  const queryString = qs.stringify(queryObj)
  return uri + `?${queryString}`
}

export const isNSFW = async (file: Express.Multer.File): Promise<boolean> => {
  const { width, height, data } = decode(file.buffer, file.mimetype)
  const numChannels = 3
  const numPixels = width * height

  const values = new Int32Array(numPixels * numChannels)

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; c++) values[i * numChannels + c] = data[i * 4 + c]

  const tfImg = tf.tensor3d(values, [height, width, numChannels], "int32")
  const predictions = await MODEL.classify(tfImg)
  tfImg.dispose() // otherwise our server will explode

  const sexy = predictions.find((p) => p.className === "Sexy").probability * 100
  const porn = predictions.find((p) => p.className === "Porn").probability * 100

  if ((porn > 10 && sexy > 10) || (porn <= 10 && sexy >= 30)) return true

  return false
}
