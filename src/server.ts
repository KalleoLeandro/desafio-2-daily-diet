import { server } from './app';
import { env } from './env/index';

server.listen({
    port: env.PORT
}).then(()=>{
    console.log(`HTTP server running at PORT: ${env.PORT}`);
});