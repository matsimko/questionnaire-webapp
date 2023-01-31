import { Resources } from "./Resources";
import { GET, PATCH, POST, DELETE } from "../request";
import { SectionSource } from "./SectionSource";
import { DataSource } from "./DataSource";
import { QuestionSource } from "./QuestionSource";
import { ChoiceSource } from "./ChoiceSource";

const QnaireEvents = {
  LOAD: "load",
};

class QnaireSource extends DataSource {
  constructor() {
    super(Resources.QNAIRES);
    this.id = null;

    this.sectionSource = new SectionSource();
    this.questionSource = new QuestionSource();
    this.choiceSource = new ChoiceSource();
    this._addEvents(QnaireEvents);
  }

  //The sources could've been in a map, but I normally want them to be used explicitly.
  //Only use this when the caller would have to do the branching himself.
  getSource(resource) {
    switch (resource) {
      case Resources.QNAIRES:
        return this;
      case Resources.SECTIONS:
        return this.sectionSource;
      case Resources.QUESTIONS:
        return this.questionSource;
      case Resources.CHOICES:
        return this.choiceSource;
      default:
        return null;
    }
  }

  getQnaire() {
    if (this.id !== null) {
      return this.get(this.id);
    }
    return null;
  }

  subscribeLoad(callback) {
    this._subscribe(QnaireEvents.LOAD, callback);
  }

  unsubscribeLoad(callback) {
    this._unsubscribe(QnaireEvents.LOAD, callback);
  }

  retrieve(id) {
    this.id = id;
    return this.gateway.retrieve(this.id).then((data) => {
      const { sections, questions, choices, ...qnaire } = data;
      this.sectionSource._setData(sections);
      this.questionSource._setData(questions);
      this.choiceSource._setData(choices);
      this._setObj(qnaire);
      this._notify(QnaireEvents.LOAD, qnaire);
      return qnaire;
    });
  }

  retrieveAll(params) {
    return this.gateway.retrieveAll(params).then((data) => {
      this._setData(data);
      this._notify(QnaireEvents.LOAD, this.data);
      return this.data;
    });
  }

  retrieveResult(id, format='json') {
    return this.gateway.customRetrieve(id, `result.${format}`);
  }

  createResponse(id, data) {
    return this.gateway.customCreate(id, "response", data);
  }

  retrieveStats(id) {
    return this.gateway.customRetrieve(id, "stats");
  }
}

//singleton
const qnaireSource = new QnaireSource();
export default qnaireSource;
