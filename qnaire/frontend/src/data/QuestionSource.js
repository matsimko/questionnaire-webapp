import { Resources } from "./Resources";
import { OrderedSource } from "./OrderedSource";

const QuestionEvents = {
  TYPE: "type",
};

export class QuestionSource extends OrderedSource {
  constructor(data = null) {
    super(Resources.QUESTIONS, data);
    this._addEvents(QuestionEvents);
  }

  getQuestionsForSection(id) {
    const filtered = this.getFilteredList((question) => question.section == id);
    const sorted = this._sortByOrder(filtered);
    return sorted;
  }

  subscribeType(callback) {
    this._subscribe(QuestionEvents.TYPE, callback);
  }

  unsubscribeType(callback) {
    this._unsubscribe(QuestionEvents.TYPE, callback);
  }

  updateType(id, resourcetype) {
    return this.gateway
      .customUpdate(id, "type", { resourcetype })
      .then((obj) => {
        this._setObj(obj);
        this._notify(QuestionEvents.TYPE, obj);
        return obj;
      });
  }

  move(id, orderNum, sectionId) {
    return this._move(id, { section: sectionId, order_num: orderNum });
  }

}
