import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
let eventID = uuidv4();
const currentTime = Math.floor(Date.now());

export async function logger(req: Request, res: Response, next: NextFunction) {
  console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
  console.log(`${eventID} initiated logging event @ ${new Date(currentTime + 1000 * 3600)}`)
  console.log(
    `New ${req.socket.remoteFamily} request from [${req.socket.remoteAddress}]:${req.socket.remotePort}`
  );
  //console.log(`Raw Headers     :: ${req.rawHeaders.toString()}`);
  console.log(`${eventID} calling next()`);
  next();
  console.log(`${eventID} sending response....`)
  //  console.log(res)
  console.log(`${eventID} complete ....!`);
  console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
}
