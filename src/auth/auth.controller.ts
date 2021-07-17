import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
@Controller("auth")
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Get("login")
  async login(@Res() response: Response): Promise<any> {
    // do username and password, typically
    const userID = uuidv4(); // if userID was userDiD we'd need a DiD resolution method
    const payload = { userID: userID }; // no sensitive data in the payload!!
    const token = this.jwtService.sign(payload);
    const exp = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    response
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: true,
        domain: "localhost", // for now...
        expires: exp,
      })
      .send({
        success: true,
        expires: exp,
      });
  }

  @Get("events")
  @UseGuards(AuthGuard("jwt"))
  async devices(): Promise<any> {
    const events = [
      {
        date: new Date().getUTCDate().toString(),
        description: "Super event 1",
      },
      {
        date: new Date().getUTCDate().toString(),
        description: "Super event 2",
      },
      {
        date: new Date().getUTCDate().toString(),
        description: "Super event 3",
      },
      {
        date: new Date().getUTCDate().toString(),
        description: "Super event 4",
      },
    ];
    return events;
  }

  /* 
# Guarded objects
- User's Google calendar availability data
- 

I will need to be able to pull CIDs from IPFS, DAT
check txids on bitcoin, cardano and ethereum networks, etc etc.

Pull google calendar events



organizer needs to create an event, with a description, avatar, etc.

Should specify the length of the event and the availabilty within that window

query his calendar to see his listed events and based on this data we can show to potential 
attendee on which days the organizer is offering, updated in real time? rxjs??

event registry should be considered
graphql traversal of the event registry needs to be protected endpoint

*/
}
