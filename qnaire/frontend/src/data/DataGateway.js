import { DELETE, GET, PATCH, POST } from "../request";

export class DataGateway {
  constructor(resource) {
    this.resource = resource;
    this.shouldAuth = true;
  }

  setShouldAuth(shouldAuth) {
    this.shouldAuth = shouldAuth;
  }

  retrieve(id) {
    return GET(`${this.resource}/${id}`, this.shouldAuth);
  }
  retrieveAll(params = null) {
    return GET(`${this.resource}`, this.shouldAuth, params);
  }

  customRetrieve(id, action) {
    return GET(`${this.resource}/${id}/${action}`, this.shouldAuth);
  }

  create(data) {
    return POST(this.resource, data, this.shouldAuth);
  }

  customCreate(id, action, data) {
    return POST(`${this.resource}/${id}/${action}`, data, this.shouldAuth);
  }

  //partial update
  update(id, updatedData) {
    return PATCH(`${this.resource}/${id}`, updatedData, this.shouldAuth);
  }

  customUpdate(id, action, updatedData) {
    return PATCH(`${this.resource}/${id}/${action}`, updatedData, this.shouldAuth);
  }

  delete(id) {
    return DELETE(`${this.resource}/${id}`, this.shouldAuth);
  }
}
