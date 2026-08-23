import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService {
  private readonly logger = new Logger();
  private context = 'App';

  setContext(context: string) {
    this.context = context;
  }

  log(message: string) {
    this.logger.log(message, this.context);
  }

  warn(message: string) {
    this.logger.warn(message, this.context);
  }

  error(message: string | Error, stack?: string) {
    this.logger.error(message, stack, this.context);
  }

  debug(message: string) {
    this.logger.debug(message, this.context);
  }

  verbose(message: string) {
    this.logger.verbose(message, this.context);
  }
}
