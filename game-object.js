class GameObject{

  state = null;

  name;

  posX = 0;
  posY = 0;
  posZ = 1;

  velX = 0;
  velY = 0;
  velZ = 0;

  constructor(name) {
    this.name = name;
  }

  static reduce(slice, action){
    console.log('reducing object...');
  }

  destroy() {
    state = null;
  }

  serialize(){
    const { name, posX, posY, posZ } = this;
    return { name, posX, posY, posZ };
  }

  get guid(){
    return 'GUID_' + this.name;
  }

  update(dt){

  }

}

class Bullet extends GameObject{

  constructor(data) {
    super('Bullet' + Math.random());

    this.velX = 1;
  }
}

exports.GameObject = GameObject;
exports.Bullet = Bullet;