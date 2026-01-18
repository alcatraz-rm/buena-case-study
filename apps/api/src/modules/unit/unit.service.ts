import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  create(dto: CreateUnitDto) {
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

  update(id: number, dto: UpdateUnitDto) {
    void id;
    void dto;
    throw new NotImplementedException();
  }

  remove(id: number) {
    void id;
    throw new NotImplementedException();
  }
}
