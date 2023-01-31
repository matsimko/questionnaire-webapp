import { Resources } from "./Resources";
import { DataSource } from "./DataSource";

class RespondentSource extends DataSource {
  constructor() {
    super(Resources.RESPONDENTS);
  }
}

//singleton
const respondentSource = new RespondentSource();
respondentSource.setShouldAuth(false);
export default respondentSource;
