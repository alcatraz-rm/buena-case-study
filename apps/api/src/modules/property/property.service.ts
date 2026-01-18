import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  create(dto: CreatePropertyDto) {
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

  update(id: number, dto: UpdatePropertyDto) {
    void id;
    void dto;
    throw new NotImplementedException();
  }

  remove(id: number) {
    void id;
    throw new NotImplementedException();
  }
}
