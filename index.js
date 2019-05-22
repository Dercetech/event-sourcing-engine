import { KeyboardController } from './keyboard-controller.js';
import { Action } from './action.js';
import { GameObject, Bullet } from './game-object.js';

const DEBUG = true;
const DEBUG_FRAME_COUNT_HISTORY = 1000;
const DEBUG_ACTION_COUNT_HISTORY = 1000;

const OPERATE = {
  idle: 0,
  running: 1,
  paused: 2,
  destroy: 2,
  destroyed: -1
}

const ACTION_DEBUG = 'DEBUG';

const ACTION_SHOOT = 'SHOOT';
const ACTION_MOVE_LEFT = 'MOVE_LEFT';

class Engine {

  actions;
  state;
  objects;

  lifecycle = OPERATE.idle;

  debugFrames = [];
  debugActions = [];

  constructor() {
    this.keyboard = new KeyboardController();
    this.init();
  }

  destroy() {
    this.actions = null;
    this.state = null;
    this.objects = null;
    this.debugFrames = null;
    this.debugActions = null;
    this.lifecycle = OPERATE.destroyed;
  }

  init() {

    // Init engine
    this.actions = [];
    this.state = {
      time: -1,
      action: -1,
      frame: -1,
      objects: {}
    };
    this.objects = [];

    // Init level
    const obj1 = new GameObject('Jib');
    this.addObject(obj1);

  }

  start() {
    this.lifecycle = OPERATE.running;
    // this.update();
    // this.dispatch(new Action(ACTION_SHOOT, {}));
    // this.update();
    // this.dispatch(new Action(ACTION_MOVE_LEFT, {}));
    // this.update();
    // this.update();

    this.interval = setInterval(() => {
      this.update();
    }, 3000);
  }

  stop() {

  }

  dispatch(action) {
    action.id = ++this.state.action;
    this.actions.push(action);
  }

  update() {
    const dt = 1 / 60;
    this.state = { ...this.cloneState(), frame: this.state.frame + 1, time: new Date().getTime() };
    const frameDebug = this.debugFrame().frameStarted();
    this.updateInput(dt);
    frameDebug.afterInput();
    this.reduceActions(dt);
    frameDebug.beforePhysics();
    this.updatePhysics(dt);
    frameDebug.afterPhysics();
    this.reduceActions(dt);
    frameDebug.beforeRender();
    this.render();
    this.updateLifecycle();
    frameDebug.afterFrame();
  }

  cloneState() {
    return { ...this.state, objects: { ...this.state.objects } };
  }

  debugFrame() {

    const steps = ['0_frameStarted', '10_afterInput', '20_beforePhysics', '30_afterPhysics', '40_beforeRender', '50_afterFrame'];

    const snapshot = { frame: this.state.frame };

    this.debugFrames.unshift(snapshot);
    this.debugFrames.splice(DEBUG_FRAME_COUNT_HISTORY);

    const handle = steps.reduce((accumulator, stepNameWithPrefix) => {
      const result = { ...accumulator };
      const stepName = stepNameWithPrefix.split('_')[1];
      result[stepName] = () => {
        snapshot['time_' + stepNameWithPrefix] = new Date().getTime();
        snapshot['state_' + stepNameWithPrefix] = this.state;
        return handle;
      }
      return result;
    }, {});
    return handle;
  }

  debugAction(action) {

    const snapshot = { frame: this.state.frame, action, stateIn: this.state, stateOut: null };
    this.debugActions.unshift(snapshot)
    this.debugActions.splice(DEBUG_ACTION_COUNT_HISTORY);

    return {
      actionComplete: () => snapshot.stateOut = this.state
    }
  }

  updateInput(dt) {
    if (this.keyboard) {
      this.keyboard.flushASCIIBuffer().forEach(ascii => {
        switch (ascii) {
          case 65: {
            this.dispatch(new Action(ACTION_DEBUG));
            break;
          }
          case 83: {
            this.dispatch(new Action(ACTION_SHOOT));
            break;
          }
        }
      });
      this.keyboard.flushKeyBuffer();
    }
  }

  updatePhysics(dt) {

    // Update world
    this.objects.forEach(object => {
      object.posX += object.velX;
      object.posY += object.velY;
      object.posZ += object.velZ;
    })

    // Clone state
    this.state = this.cloneState();

    // Transpose values
    this.objects.forEach(object => {
      this.state.objects[object.guid] = object.serialize();
    });
  }

  addObject(obj) {
    this.objects.push(obj);
    this.state.objects[obj.guid] = obj.serialize();
  }

  reduceActions(dt) {
    this.actions.splice(0).forEach(action => {
      const actionDebug = this.debugAction(action);

      this.state = this.cloneState();

      switch (action.type) {
        case ACTION_SHOOT: {
          console.log('shooting');
          this.addObject(new Bullet());
          break;
        }

        case ACTION_DEBUG: {
          console.warn('entering debug mode.')
          debugger;
          break;
        }
      }

      // Update state snapshot after processing action
      actionDebug.actionComplete();      
    });
  }

  render(dt) {
  }

  updateLifecycle() {
    if (this.lifecycle === OPERATE.destroy) {
      this.destroy();
    }
  }
}

const engine = new Engine();
window.engine = engine;
engine.start();
