import MultipleChoiceQuestion from "./components/creation-page/MultipleChoiceQuestion";
import OpenQuestion from "./components/creation-page/OpenQuestion";
import RangeQuestion from "./components/creation-page/RangeQuestion";

export const QuestionTypes = {
    OpenQuestion: {
      component: OpenQuestion,
      desc: "Otevřená otázka",
    },
    RangeQuestion: {
      component: RangeQuestion,
      desc: "Výběr čísla z rozmezí",
    },
    MultipleChoiceQuestion: {
      component: MultipleChoiceQuestion,
      desc: "Výběr z možností",
    },
  };