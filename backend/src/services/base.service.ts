import { Injectable } from '@nestjs/common';
import { LoggingRepository } from 'src/repositories/logging.repository';

@Injectable()
export abstract class BaseService {
  constructor(protected readonly logger: LoggingRepository) {
    this.logger.setContext(this.constructor.name);
  }
}
