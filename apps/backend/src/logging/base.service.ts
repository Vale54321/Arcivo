import { Injectable } from '@nestjs/common';
import { LoggingService } from './logging.service';

@Injectable()
export abstract class BaseService {
  constructor(protected readonly logger: LoggingService) {
    this.logger.setContext(this.constructor.name);
  }
}
