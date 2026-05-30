import { bootstrap } from './app';

bootstrap().catch((error) => {
  console.error('Failed to start app:', error);
});
