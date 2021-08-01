import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
let eventID = uuidv4();
import { unixTime, localTimeStamp } from "../utils/utils";

let bob = localTimeStamp

export async function logger(req: Request, res: Response, next: NextFunction) {
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  console.log(eventID + ":" + localTimeStamp());
  console.log()
//  console.log(req.rawHeaders)
  console.log(`New ${req.socket.remoteFamily} request from [${req.socket.remoteAddress}]:${req.socket.remotePort}`);
  
  // done logging, call next
  next();

  // all done ;)
  console.log(`${eventID}:${localTimeStamp()}`);
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
}
