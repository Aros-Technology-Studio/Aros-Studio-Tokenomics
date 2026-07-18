import { Controller, Get, Post } from '@nestjs/common';
import { ReleaseDaemon } from '../release/release-daemon';

@Controller('v1/core/release')
export class CoreReleaseController {
  constructor(private readonly release: ReleaseDaemon) {}

  @Get()
  async status() {
    return this.release.status();
  }

  @Post('tick')
  async tick() {
    return this.release.tick();
  }
}
