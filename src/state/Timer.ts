type TimerSubscription = {
  callback: () => void;
  interval: number;
  numIntervalsCalled: number;
  start: number;
};

type TimerTimeout = {
  callback: () => void;
  timeToCall: number;
};

class Timer {
  private static instance: Timer;

  private _startTime: number;
  private _currTimeElapsed: number = 0;
  private _prevTimeElapsed: number = 0;
  private _isRunning: boolean = false;

  private _subscriptions: Map<number, TimerSubscription> = new Map();
  private _timeouts: Map<number, TimerTimeout> = new Map();

  private constructor() {
    this._startTime = performance.now();
  }

  public static getInstance(): Timer {
    if (!Timer.instance) {
      Timer.instance = new Timer();
    }

    return Timer.instance;
  }

  update() {
    if (!this._isRunning) return;

    this._currTimeElapsed = performance.now() - this._startTime;

    this._subscriptions.forEach((subscription) => {
      while (
        this.timeElapsed >
        subscription.numIntervalsCalled * subscription.interval +
          subscription.start
      ) {
        subscription.callback();
        subscription.numIntervalsCalled++;
      }
    });

    this._timeouts.forEach((timeout, timeoutID) => {
      if (this.timeElapsed > timeout.timeToCall) {
        this.removeTimeout(timeoutID);
        timeout.callback();
      }
    });
  }

  pause() {
    this.update();
    this._isRunning = false;
    this._prevTimeElapsed += this._currTimeElapsed;
    this._currTimeElapsed = 0;
  }

  resume() {
    this._isRunning = true;
    this._startTime = performance.now();
    this._currTimeElapsed = 0;
  }

  start() {
    this.resume();
  }

  subscribe(callback: () => void, interval: number): number {
    const id = Math.random();
    this._subscriptions.set(id, {
      callback,
      interval,
      numIntervalsCalled: 0,
      start: this.timeElapsed,
    });

    return id;
  }

  setTimeout(callback: () => void, interval: number): number {
    const id = Math.random();
    this._timeouts.set(id, {
      callback,
      timeToCall: this.timeElapsed + interval,
    });

    return id;
  }

  reset() {
    this._subscriptions = new Map();
    this._timeouts = new Map();
    this._currTimeElapsed = 0;
    this._prevTimeElapsed = 0;
    this._isRunning = false;
  }

  unsubscribe(id: number) {
    this._subscriptions.delete(id);
  }

  removeTimeout(id: number) {
    this._timeouts.delete(id);
  }

  get timeElapsed() {
    return this._currTimeElapsed + this._prevTimeElapsed;
  }

  getTimeElapsed() {
    return this.timeElapsed;
  }

  get isRunning() {
    return this._isRunning;
  }
}

export default Timer;
