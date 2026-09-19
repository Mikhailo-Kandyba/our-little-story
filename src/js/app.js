import { onReady } from './modules/utils';
import { initIntro } from './modules/intro';
import { initReveal } from './modules/reveal';
import { initTimeline } from './modules/timeline';
import { initCarousel } from './modules/carousel';
import { initPolaroid } from './modules/polaroid';
import { initRandomMemory } from './modules/random-memory';
import { initQuiz } from './modules/quiz';
import { initMood } from './modules/mood';
import { initMemoryModal } from './modules/memory-modal';
import { initFinal } from './modules/booking';
import { initEffects } from './modules/effects';
import { initEasterEggs } from './modules/easter-eggs';
import { restoreMoodTheme } from './modules/mood-theme';
import {
  story,
  message,
  betweenSections,
  finalSection,
  closing,
  carouselSection,
  polaroidSection,
  moodSection,
  ui
} from './siteConfig';

onReady(() => {
  hydrateStaticCopy();

  const memoryModal = initMemoryModal();

  initIntro({
    onOpen: () => {
      initReveal();
    }
  });

  initTimeline({
    onOpenMemory: (item) => memoryModal.open(item)
  });
  initCarousel();
  initPolaroid();
  initRandomMemory();
  initQuiz();
  initEffects();
  restoreMoodTheme();
  initMood();
  initFinal();
  initEasterEggs();

  if (!document.body.classList.contains('is-locked')) {
    initReveal();
  }
});

function hydrateStaticCopy() {
  setText('#story-title', story.heading);
  fillParagraphs('.story__copy', 'story__p', story.paragraphs);

  setText('#message-title', message.heading);
  fillParagraphs('.message__copy', 'message__p', message.paragraphs);

  document.querySelectorAll('.whisper').forEach((el, i) => {
    if (betweenSections[i]) {
      el.textContent = betweenSections[i];
    }
  });

  setText('#final-title', finalSection.heading);
  setText('#final .section__lead', finalSection.subheading);
  document.querySelectorAll('[data-choice]').forEach((btn) => {
    const key = btn.getAttribute('data-choice');
    const label = btn.querySelector('.final__choice-label');
    const hint = btn.querySelector('.final__choice-hint');
    if (label && finalSection.choices[key]) {
      label.textContent = finalSection.choices[key];
    }
    if (hint && finalSection.choiceHints[key]) {
      hint.textContent = finalSection.choiceHints[key];
    }
  });

  setText('[data-carousel-eyebrow]', carouselSection.eyebrow);
  setText('#carousel-title', carouselSection.heading);
  setText('[data-carousel-lead]', carouselSection.lead);

  setText('[data-polaroid-eyebrow]', polaroidSection.eyebrow);
  setText('#polaroid-title', polaroidSection.heading);
  setText('[data-polaroid-lead]', polaroidSection.lead);

  setText('#mood-title', moodSection.heading);
  setText('[data-mood-lead]', moodSection.subheading);

  setText('#closing-title', closing.title);
  const closingText = document.querySelector('[data-closing-text]');
  if (closingText) {
    closingText.innerHTML = closing.text.replace(/\n/g, '<br>');
  }
  setText('[data-closing-sign]', closing.signature);

  setText('[data-story-eyebrow]', ui.storyEyebrow);
  setText('[data-timeline-eyebrow]', ui.timelineEyebrow);
  setText('#timeline-title', ui.timelineTitle);
  setText('[data-timeline-lead]', ui.timelineLead);
  setText('[data-quiz-eyebrow]', ui.quizEyebrow);
  setText('#quiz-title', ui.quizTitle);
}

function setText(sel, value) {
  const el = document.querySelector(sel);
  if (el && value != null) {
    el.textContent = value;
  }
}

function fillParagraphs(rootSel, className, paragraphs) {
  const root = document.querySelector(rootSel);
  if (!root || !paragraphs) {
    return;
  }
  root.innerHTML = paragraphs
    .map((p) => `<p class="${className}" data-reveal>${p}</p>`)
    .join('');
}
