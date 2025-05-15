import { Module } from "@nestjs/common";
import { LoggerManager } from "./LoggerManager.service";

@Module({
    imports: [],
    providers: [LoggerManager],
    exports: [LoggerManager],
})
export class LoggerManagerModule {}