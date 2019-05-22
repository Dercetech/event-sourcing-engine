class Action {

  _id;
  _type;
  _data;

  constructor(type, data){
    this.type = type;
    this.data = data;
  }

  set id(id){
    this._id = id;
  }

  get id() {
    return this._id;
  }

  set type(type){
    this._type = type;
  }

  get type() {
    return this._type;
  }

  set data(data){
    this._data = data;
  }

  get data() {
    return this._data;
  }
}

exports.Action = Action;