import type { Exercise } from '../content/schemas';
import { t } from './t';

/** The correct answer as Gujarati/German text, shown when the learner asks for it. */
export function correctAnswerText(ex: Exercise): string {
  switch (ex.type) {
    case 'mcq':
      return ex.options[ex.answer];
    case 'fill':
      return ex.sentence_de.replace('___', ex.answers[0]);
    case 'article':
      return `${ex.answer} ${ex.noun}`;
    case 'match':
      return ex.pairs.map((p) => `${p.de} = ${p.gu}`).join(' · ');
    case 'order':
      return ex.answer;
    case 'listen':
      return typeof ex.answer === 'number' && ex.options
        ? ex.options[ex.answer]
        : String(ex.answer);
    case 'translate':
      return ex.answers_de[0];
    case 'speak':
      return ex.text_de;
    case 'truefalse':
      return ex.statements
        .map((s) => `${s.de} → ${s.answer ? t('words.correct') : t('words.wrong')}`)
        .join(' · ');
  }
}
