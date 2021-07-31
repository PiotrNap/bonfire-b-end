import { Request, Response, NextFunction, response } from "express";
import { v4 as uuidv4 } from "uuid";
let eventID = uuidv4();
import { isoTime, localTime, utcTime, localDate } from "../utils/utils";

export async function logger(req: Request, res: Response, next: NextFunction) {
  const request = {
    string : req.params[0],
    path : req.path,
    readableObject : req.readableObjectMode,
    secureRequest : req.secure,

  };
  console.log(
    "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
  );

  console.log(
    `${eventID} initiated logging event @ ${localTime} on ${localDate}`
  );
  console.log(
    `New ${req.socket.remoteFamily} request from [${req.socket.remoteAddress}]:${req.socket.remotePort}`
  );
  console.log(request.string);
  next();
  console.log(res.statusMessage);
  console.log(`${eventID} complete ....!`);
  console.log(
    "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
  );
}
