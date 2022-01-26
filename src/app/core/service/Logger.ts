import { Injectable } from '@angular/core';
import { RuntimeConfiguration } from '../../core/configuration/RuntimeConfiguration';

const noop = (): any => undefined;

export enum LogLevel {
  none = 0,
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
}

@Injectable()
export class Logger {

  private _logLevel: LogLevel;
  private _console: Console;

  constructor(runtime: RuntimeConfiguration) {
    let lvl = 'none';
    if (runtime?.logLevel) {
      lvl = runtime.logLevel;
    }

    this._logLevel = LogLevel[lvl];
    this._console = console;
  }

  get debug(): (msg: string, event?: any) => void {
    if (this.isEnabledFor(LogLevel.debug)) {
      return this._console.debug.bind(this._console);
    } else {
      return noop;
    }
  }

  get info(): (msg: string, event?: any) => void {
    if (this.isEnabledFor(LogLevel.info)) {
      return this._console.info.bind(this._console);
    } else {
      return noop;
    }
  }

  get warn(): (msg: string, event?: any) => void {
    if (this.isEnabledFor(LogLevel.warn)) {
      return this._console.warn.bind(this._console);
    } else {
      return noop;
    }
  }

  get error(): (msg: string, event?: any) => void {
    if (this.isEnabledFor(LogLevel.error)) {
      return this._console.error.bind(this._console);
    } else {
      return noop;
    }
  }

  private isEnabledFor(level: LogLevel): boolean {
    if (this._logLevel == LogLevel.none) {
      return false;
    } 
    
    return level >= this._logLevel;
  }
}