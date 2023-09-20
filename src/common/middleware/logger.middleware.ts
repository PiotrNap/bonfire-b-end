import { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"
import { localTimeStamp } from "../utils.js"

export async function logger(req: Request, res: Response, next: NextFunction) {
  const eventID = uuidv4()
  const baseLog = `${localTimeStamp().replace("T", " ")} [${eventID.substring(
    eventID.length - 8,
    eventID.length
  )}]`
  console.log(baseLog + " --> ", req.originalUrl, " | ", "Method: ", req.method)

  if (req.method === "POST" || req.method === "PUT")
    console.log("Request body: ", req.body)

  res.on("finish", () => {
    console.log(baseLog + " <-- ", res.statusCode + " " + res.statusMessage)
    // Here you can access response object properties like res.statusCode
  })

  next()
}
