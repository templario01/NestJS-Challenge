import { Test, TestingModule } from '@nestjs/testing';
import { ImageRepositoryService } from './image-repository.service';

describe('ImageRepositoryService', () => {
  let service: ImageRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageRepositoryService],
    }).compile();

    service = module.get<ImageRepositoryService>(ImageRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
