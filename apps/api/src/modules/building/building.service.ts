import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  create(dto: CreateBuildingDto) {
    void dto;
    throw new NotImplementedException();
  }

  findAll() {
    throw new NotImplementedException();
  }

  findOne(id: number) {
    void id;
    throw new NotImplementedException();
  }

  update(id: number, dto: UpdateBuildingDto) {
    void id;
    void dto;
    throw new NotImplementedException();
  }

  remove(id: number) {
    void id;
    throw new NotImplementedException();
  }
}
