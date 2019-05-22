import { Subject, merge, fromEvent } from 'rxjs';
import { map, filter, takeUntil } from 'rxjs/operators';

class KeyboardController {

  _destroy$ = new Subject();

  asciiStates = {};
  asciiBuffer = [];

  keyStates = {};
  keyBuffer = [];

  constructor() {
    this.registerEventListeners();
  }

  destroy() {
    this.asciiStates = null;
    this.asciiBuffer = null;
    this.keyStates = null;
    this.keyBuffer = null;
    this._destroy$.next();
    this._destroy$.complete();
  }

  flushASCIIBuffer() {
    return this.asciiBuffer.splice(0);
  }

  flushKeyBuffer() {
    return this.keyBuffer.splice(0);
  }

  registerEventListeners() {

    // Reminder:
    // - which: the ascii code
    // - key: the letter. Is lower case with keydown, is case sensitive with keypress
    // - code: the layout-agnostic version. WASD will always be WASD-located, even on DVORAK.

    const keyboardEvents$ = merge(fromEvent(document, 'keydown'), fromEvent(document, 'keyup')).pipe(
      takeUntil(this._destroy$),
      map(({ which, key, code, type }) => ({ which, key, code, isDown: type === 'keydown' })));

    // Register ASCII codes (eg. a = 65, case insensitive)
    keyboardEvents$.pipe(filter(({ which, isDown }) => this.asciiStates[which] !== isDown))
      .subscribe(({ which, key, isDown }) => {
        isDown && this.asciiBuffer.push(which);
        this.asciiStates[which] = isDown;
      });

    // Register key codes (eg. AZERTY z = keyW, keep WAZD in mind for QWERTY-ers)
    keyboardEvents$.pipe(filter(({ code, isDown }) => this.keyStates[code] !== isDown))
      .subscribe(({ code, key, isDown }) => {
        isDown && this.keyBuffer.push(code);
        this.keyStates[code] = isDown;
      });
  }
}

exports.KeyboardController = KeyboardController;