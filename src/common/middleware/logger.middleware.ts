import { Request, Response, NextFunction } from 'express';

export async function logger(req: Request, res: Response, next: NextFunction) {
  console.log('***************** Begin logger -----------------')
  console.log(`New ${req.socket.remoteFamily} request from [${req.socket.remoteAddress}]:${req.socket.remotePort}`)
  //console.log(`Raw Headers     :: ${req.rawHeaders.toString()}`);
  console.log('--------------------- next() -------------------')
  next();
  console.log('----------------- End logger *******************')
};