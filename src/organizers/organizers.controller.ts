import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('organizers')
export class OrganizersController {
    @Get()
    getOrganizers(){
        return 'all the organizers'
    }
    @Get('/:organizerID')
    getOrganizersByID(
        @Param('organizerID') organizerID: string
    ){
        return `that organizer is ${organizerID}`
    }

}
