import { Resources } from "./Resources";
import { OrderedSource } from "./OrderedSource";

export class ChoiceSource extends OrderedSource {
  constructor(data = null) {
    super(Resources.CHOICES, data);
  }

  getChoicesForQuestion(id) {
    const filtered = this.getFilteredList((choice) => choice.question == id);
    const sorted = this._sortByOrder(filtered);
    return sorted;
  }

  move(id, orderNum) {
    return this._move(id, { order_num: orderNum });
  }
}
