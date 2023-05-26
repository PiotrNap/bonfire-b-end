import { HttpService } from "@nestjs/axios"
import { Injectable } from "@nestjs/common"

@Injectable()
export class GoogleService {
  constructor(private http: HttpService) {}
}
