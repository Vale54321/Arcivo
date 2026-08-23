import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { BaseService } from 'logging/base.service';

@Injectable()
export class FileHashService extends BaseService {
  async getSha1(filePath: string): Promise<string> {
    this.logger.debug(`Calculating SHA-1 hash for file: ${filePath}`);

    const hash = createHash('sha1');
    const fileStream = createReadStream(filePath);

    await pipeline(fileStream, hash);

    const digest = hash.digest('hex');
    this.logger.log(`SHA-1 hash for file ${filePath}: ${digest}`);

    return digest;
  }
}
