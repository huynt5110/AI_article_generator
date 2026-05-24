import { registerAs } from '@nestjs/config';

export default registerAs('worker', () => ({
  concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? '5', 10),
}));
