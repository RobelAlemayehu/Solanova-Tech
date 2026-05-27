import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
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

  @Public()
  @Get()
  async findAll(
    @Query() filters: FilterPropertiesDto,
    @CurrentUser() user?: { role: string },
  ) {
    return this.propertiesService.findAll(filters, user?.role);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: { id: string; role: string },
  ) {
    return this.propertiesService.findOne(id, user);
  }

  @Roles(UserRole.OWNER)
  @Post(':id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.publish(id, ownerId);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.propertiesService.remove(id, user);
  }
}
