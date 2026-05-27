import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UploadService } from '../upload/upload.service';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { PropertiesService } from './properties.service';

@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly uploadService: UploadService,
  ) {}

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
    @CurrentUser() user?: { id: string; role: string },
  ) {
    // Allow owner dashboard to fetch only their own properties via ?ownerId=me
    if (filters.ownerId === 'me' && user?.id) {
      filters.ownerId = user.id;
    }
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

  @Roles(UserRole.OWNER)
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file'))
  async addImages(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const secureUrl = await this.uploadService.uploadImage(file);
    return this.propertiesService.addImages(id, ownerId, [secureUrl]);
  }

  @Roles(UserRole.OWNER)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.propertiesService.update(id, ownerId, dto);
  }

  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.propertiesService.remove(id, user);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/disable')
  async disable(@Param('id') id: string) {
    return this.propertiesService.disable(id);
  }
}

