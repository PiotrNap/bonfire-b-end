import { Request, Response, NextFunction } from 'express';

export async function logger(req: Request, res: Response, next: NextFunction) {
  console.log('----------------- Begin logger -----------------')
  console.log(`Raw Headers     :: ` + req);
  console.log(`Response Status :: ` + res.statusCode)
  console.log('--------------------- next() -------------------')
  next();
  console.log('----------------- End logger -------------------')
};