import { Module } from '@nestjs/common';
import { RecipientResolverService } from './recipient-resolver.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RecipientResolverService],
  exports: [RecipientResolverService],
})
export class RecipientModule {}
