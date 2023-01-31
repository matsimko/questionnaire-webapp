import { DataGateway } from "./DataGateway";

export const DataEvents = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

//The data source always starts with initial data and allows creates, updates and deletes
// and allows subscribers to be notified on these events. It keeps the latest VALID data.
export class DataSource {
  constructor(resource, data = null) {
    this.gateway = new DataGateway(resource);
    this.data = data;
    this.subscribers = {};
    Object.keys(DataEvents).forEach((key) => {
      this.subscribers[DataEvents[key]] = [];
    });
  }

  setShouldAuth(shouldAuth) {
    this.gateway.setShouldAuth(shouldAuth);
  }

  _setData(data) {
    this.data = data;
  }

  _setObj(obj) {
    if (this.data === null) {
      this.data = {};
    }
    this.data[obj.id] = obj;
  }

  _addEvents(eventMap) {
    Object.keys(eventMap).forEach((key) => {
      this.subscribers[eventMap[key]] = [];
    });
  }

  _notify(event, data) {
    this.subscribers[event].forEach((sub) => {
      sub(data);
    });
  }

  _subscribe(event, callback) {
    this.subscribers[event].push(callback);
  }

  subscribeCreate(callback) {
    this._subscribe(DataEvents.CREATE, callback);
  }

  subscribeUpdate(callback) {
    this._subscribe(DataEvents.UPDATE, callback);
  }

  subscribeDelete(callback) {
    this._subscribe(DataEvents.DELETE, callback);
  }

  _unsubscribe(event, callback) {
    this.subscribers[event] = this.subscribers[event].filter(
      (sub) => sub !== callback
    );
  }

  unsubscribeCreate(callback) {
    this._unsubscribe(DataEvents.CREATE, callback);
  }

  unsubscribeUpdate(callback) {
    this._unsubscribe(DataEvents.UPDATE, callback);
  }

  unsubscribeDelete(callback) {
    this._unsubscribe(DataEvents.DELETE, callback);
  }

  //get from "cache"
  get(id) {
    if (this.data && id in this.data) {
      return this.data[id];
    }
    return null;
  }
  getAll() {
    return this.data;
  }

  retrieve(id) {
    return this.gateway.retrieve(id).then((obj) => {
      this._setObj(obj);
      return obj;
    });
  }

  retrieveAll(params) {
    return this.gateway.retrieveAll(params).then((data) => {
      this._setData(data);
      return this.data;
    });
  }

  getFilteredList(filterFunc) {
    return Object.values(this.data).reduce((filtered, obj) => {
      if (filterFunc(obj)) {
        filtered.push(obj);
      }
      return filtered;
    }, []);
  }

  create(obj) {
    return this.gateway.create(obj).then((obj) => {
      this._setObj(obj);
      this._notify(DataEvents.CREATE, obj);
      return obj;
    });
  }

  //partial update
  update(id, updatedData, notify = true) {
    return this.gateway.update(id, updatedData).then((obj) => {
      this._setObj(obj);
      if (notify) {
        this._notify(DataEvents.UPDATE, obj);
      }
      return obj;
    });
  }

  delete(id) {
    return this.gateway.delete(id).then(() => {
      delete this.data[id];
      this._notify(DataEvents.DELETE, id);
    });
  }

  deleteFromCache(id) {
    delete this.data[id];
  }
}
