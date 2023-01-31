import { PATCH } from "../request";
import { DataGateway } from "./DataGateway";

export class OrderedGateway extends DataGateway {
  move(id, data) {
    return PATCH(`${this.resource}/${id}/move`, data);
  }
}
