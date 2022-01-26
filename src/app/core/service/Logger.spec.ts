import { RuntimeConfiguration } from "../configuration/RuntimeConfiguration";
import { Logger, LogLevel } from "./Logger";

describe('Logger', () => {

    it('test default', () => {
        const logger = new Logger(null);
        logger.debug('toto', {});

        expect(logger['_logLevel'].toString()).toBe('0');
    });

    it('test logging', () => {
        const config = new RuntimeConfiguration(null, null, null);
        var levels = ['debug', 'info', 'warn', 'error'];

        for (let index = 0; index < levels.length; index++) {
            const level = levels[index];

            config.logLevel = level;
            const consoleMock = new ConsoleMock();
            const logger = new Logger(config);

            logger['_console'] = consoleMock;
            logger[level]('toto', {});

            var key = level + 's';
            expect(consoleMock[key].length).toBe(1);
        }
    });

    it('test none', () => {
        const config = new RuntimeConfiguration(null, null, null);
        var levels = ['debug', 'info', 'warn', 'error'];

        for (let index = 0; index < levels.length; index++) {
            const level = levels[index];

            config.logLevel = 'none';
            const consoleMock = new ConsoleMock();
            const logger = new Logger(config);

            logger['_console'] = consoleMock;
            logger[level]('toto', {});

            var key = level + 's';
            expect(consoleMock[key].length).toBe(0);
        }
    });

    /*it('test isEnabledFor', () => {
        const config = new RuntimeConfiguration(null, null);        
        var tests = [
            { level: LogLevel.none, expected: [] },
            { level: LogLevel.debug, expected: [LogLevel.debug, LogLevel.info, LogLevel.warn, LogLevel.error] },
            { level: LogLevel.info, expected: [LogLevel.info, LogLevel.warn, LogLevel.error] },
            { level: LogLevel.warn, expected: [LogLevel.warn, LogLevel.error] },
            { level: LogLevel.error, expected: [LogLevel.error] },
        ];

        for (let index = 0; index < tests.length; index++) {          

            const test = tests[index];
            config.logLevel = test.level as unknown as string;  
            const logger = new Logger(config);        

            var levels = Object.keys(LogLevel).filter(x=>x != 'none');
            for (let x = 0; x < levels.length; x++) {             
                const level:LogLevel = LogLevel[levels[x]];

                const expected = (test.expected.indexOf(level) > -1);
                const result = logger['isEnabledFor'](level);

                expect(result).toBe(expected, {logLevel: config.logLevel, isEnabledFor : level, test, expected, result, index : test.expected.indexOf(level)});
            }
        }
    });*/

    class ConsoleMock implements Console {
        memory: any = [];

        debugs: any = [];
        infos: any = [];
        warns: any = [];
        errors: any = [];

        assert(condition?: boolean, ...data: any[]): void { }

        clear(): void {

        }
        count(label?: string): void {
            throw new Error("Method not implemented.");
        }
        countReset(label?: string): void {
            throw new Error("Method not implemented.");
        }
        debug(...data: any[]): void {
            this.debugs.push(data);
        }
        dir(item?: any, options?: any): void {
            throw new Error("Method not implemented.");
        }
        dirxml(...data: any[]): void {
            throw new Error("Method not implemented.");
        }
        error(...data: any[]): void {
            this.errors.push(data);
        }
        exception(message?: string, ...optionalParams: any[]): void {
            throw new Error("Method not implemented.");
        }
        group(...data: any[]): void {
            throw new Error("Method not implemented.");
        }
        groupCollapsed(...data: any[]): void {
            throw new Error("Method not implemented.");
        }
        groupEnd(): void {
            throw new Error("Method not implemented.");
        }
        info(...data: any[]): void {
            this.infos.push(data);
        }
        log(...data: any[]): void {
            throw new Error("Method not implemented.");
        }
        table(tabularData?: any, properties?: string[]): void {
            throw new Error("Method not implemented.");
        }
        time(label?: string): void {
            throw new Error("Method not implemented.");
        }
        timeEnd(label?: string): void {
            throw new Error("Method not implemented.");
        }
        timeLog(label?: string, ...data: any[]): void {
            throw new Error("Method not implemented.");
        }
        timeStamp(label?: string): void {
            throw new Error("Method not implemented.");
        }
        trace(...data: any[]): void {
            throw new Error("Method not implemented.");
        }
        warn(...data: any[]): void {
            this.warns.push(data);
        }
    }
});