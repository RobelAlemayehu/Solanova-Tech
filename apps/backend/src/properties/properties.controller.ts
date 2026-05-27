import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Roles(UserRole.OWNER)
  @Post()
  async create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.create(dto, ownerId);
  }
}
