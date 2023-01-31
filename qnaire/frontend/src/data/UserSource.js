import { Resources } from "./Resources";
import { DataSource } from "./DataSource";

class UserSource extends DataSource {
  constructor() {
    super(Resources.USERS);
  }
}

//singleton
const userSource = new UserSource();
export default userSource;
