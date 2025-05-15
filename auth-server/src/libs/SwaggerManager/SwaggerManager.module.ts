import { Module } from "@nestjs/common";
import { SwaggerManager } from "./SwaggerManager.service";

@Module({
    imports: [],
    providers: [SwaggerManager],
    exports: [SwaggerManager],
})
export class SwaggerManagerModule {}