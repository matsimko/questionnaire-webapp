import { Resources } from "./Resources";
import { DataSource } from "./DataSource";

class PrivateQnaireIdSource extends DataSource {
  constructor() {
    super(Resources.PRIVATE_QNAIRE_IDS);
  }
}

//singleton
const privateQnaireIdSource = new PrivateQnaireIdSource();
export default privateQnaireIdSource;
