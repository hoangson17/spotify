import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { entityId } from 'src/utils/input';

@Injectable()
export class IdPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    return metadata.type === 'param' &&
      /^(id|userId)$/.test(metadata.data ?? '')
      ? entityId(value)
      : value;
  }
}
