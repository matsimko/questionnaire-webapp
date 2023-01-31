import { DataEvents, DataSource } from "./DataSource";
import { OrderedGateway } from "./OrderedGateway";

const OrderedEvents = {
  MOVE: "move",
};

export class OrderedSource extends DataSource {
  constructor(resource, data) {
    super(resource, data);
    this.gateway = new OrderedGateway(resource); //"override" the gateway
    //initialize subs for the new events
    this._addEvents(OrderedEvents);
  }

  subscribeMove(callback) {
    this._subscribe(OrderedEvents.MOVE, callback);
  }

  unsubscribeMove(callback) {
    this._unsubscribe(OrderedEvents.MOVE, callback);
  }

  _move(id, data) {
    return this.gateway.move(id, data).then((dict) => {
      const ids = Object.keys(dict);
      if (ids.length > 0) {
        ids.forEach((id) => {
          this.data[id] = dict[id];
        });
        this._notify(OrderedEvents.MOVE, { id, ...data });
      }
    });
  }

  //when a new object is created or deleted, the order of other objects may change
  create(obj) {
    return this.gateway.create(obj).then(({ changed_data, ...newObj }) => {
      this._setObj(newObj);
      if (changed_data) {
        Object.values(changed_data).forEach((obj) => {
          this.data[obj.id] = obj;
        });
      }
      this._notify(DataEvents.CREATE, newObj);
      return newObj;
    });
  }

  delete(id) {
    return this.gateway.delete(id).then(({ changed_data }) => {
      delete this.data[id];
      if (changed_data) {
        Object.values(changed_data).forEach((obj) => {
          this.data[obj.id] = obj;
        });
      }
      this._notify(DataEvents.DELETE, id);
    });
  }

  _sortByOrder(list) {
    return list.sort((a, b) => a.order_num - b.order_num);
  }
}
