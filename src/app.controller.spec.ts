import { Test } from '@nestjs/testing';

import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = moduleRef.get(AppController);
  });

  it('reports a healthy scaffold', () => {
    expect(controller.health()).toEqual({
      status: 'ok',
      project: 'aros-studio-tokenomics',
    });
  });
});
