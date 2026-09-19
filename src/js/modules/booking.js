import {
  availableDates,
  availableCallDates,
  finalSection,
  CONTACT_URL,
  confirmationCopy,
  ui
} from '../siteConfig';
import { formatLongDate, trapFocus } from './utils';
import { sendNotification } from '../services/notify';

export function initFinal() {
  const modal = document.querySelector('[data-booking-modal]');
  if (!modal) {
    return;
  }

  const panel = modal.querySelector('[data-booking-panel]');
  const titleEl = modal.querySelector('#booking-title');
  const closeBtns = modal.querySelectorAll('[data-booking-close]');
  let mode = 'meet';
  let selectedDate = null;
  let selectedTime = null;
  let lastFocus = null;

  if (titleEl) {
    titleEl.textContent = ui.bookingTitle;
  }

  document.querySelectorAll('[data-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const choice = btn.getAttribute('data-choice');
      if (choice === 'text') {
        openTextFlow();
        return;
      }
      mode = choice === 'call' ? 'call' : 'meet';
      selectedDate = null;
      selectedTime = null;
      openModal();
      renderStep();
    });
  });

  closeBtns.forEach((btn) => btn.addEventListener('click', closeModal));
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.hasAttribute('data-booking-close')) {
      if (event.target === modal || event.target.classList.contains('booking__backdrop')) {
        closeModal();
      }
    }
  });
  document.addEventListener('keydown', (event) => {
    if (modal.hidden) {
      return;
    }
    if (event.key === 'Escape') {
      closeModal();
    }
    if (event.key === 'Tab') {
      trapFocus(modal, event);
    }
  });

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-modal');
    requestAnimationFrame(() => modal.classList.add('is-open'));
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('has-modal');
    window.setTimeout(() => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      if (lastFocus && typeof lastFocus.focus === 'function') {
        lastFocus.focus();
      }
    }, 280);
  }

  function datesMap() {
    return mode === 'call' ? availableCallDates : availableDates;
  }

  function renderStep() {
    if (!panel) {
      return;
    }
    const intro =
      mode === 'call' ? finalSection.callIntro : finalSection.meetIntro;

    if (!selectedDate) {
      panel.innerHTML = `
        <p class="booking__intro">${intro}</p>
        <h3 class="booking__step-title">${finalSection.pickDate}</h3>
        <div class="booking__dates" role="list">
          ${Object.keys(datesMap())
    .map(
      (iso) => `
              <button type="button" class="booking__date" data-date="${iso}" role="listitem">
                ${formatLongDate(iso)}
              </button>
            `
    )
    .join('')}
        </div>
      `;
      panel.querySelectorAll('[data-date]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedDate = btn.getAttribute('data-date');
          selectedTime = null;
          renderStep();
        });
      });
      return;
    }

    if (!selectedTime) {
      const times = datesMap()[selectedDate] || [];
      panel.innerHTML = `
        <button type="button" class="booking__back" data-back>${finalSection.back}</button>
        <h3 class="booking__step-title">${formatLongDate(selectedDate)}</h3>
        <p class="booking__hint">${finalSection.pickTime}</p>
        <div class="booking__times" role="list">
          ${times
    .map(
      (time) => `
            <button type="button" class="booking__time" data-time="${time}" role="listitem">${time}</button>
          `
    )
    .join('')}
        </div>
      `;
      panel.querySelector('[data-back]').addEventListener('click', () => {
        selectedDate = null;
        renderStep();
      });
      panel.querySelectorAll('[data-time]').forEach((btn) => {
        btn.addEventListener('click', () => {
          selectedTime = btn.getAttribute('data-time');
          renderStep();
        });
      });
      return;
    }

    panel.innerHTML = `
      <button type="button" class="booking__back" data-back>${finalSection.back}</button>
      <h3 class="booking__step-title">${finalSection.confirmTitle}</h3>
      <p class="booking__confirm-line">${formatLongDate(selectedDate)}</p>
      <p class="booking__confirm-time">${selectedTime}</p>
      <button type="button" class="btn btn_primary booking__confirm" data-confirm>${finalSection.confirmBtn}</button>
    `;
    panel.querySelector('[data-back]').addEventListener('click', () => {
      selectedTime = null;
      renderStep();
    });
    panel.querySelector('[data-confirm]').addEventListener('click', () => {
      const btn = panel.querySelector('[data-confirm]');
      btn.disabled = true;
      btn.textContent = ui.sending;
      const payload = {
        type: 'booking',
        bookingType: mode,
        date: selectedDate,
        dateLabel: formatLongDate(selectedDate),
        time: selectedTime
      };
      sendNotification(payload).then(() => renderSuccess());
    });
  }

  function renderSuccess() {
    panel.innerHTML = `
      <div class="booking__success">
        <p class="booking__success-title">${confirmationCopy.title}</p>
        <p class="booking__success-date">${formatLongDate(selectedDate)}</p>
        <p class="booking__success-time">${selectedTime}</p>
        <p class="booking__success-sub">${confirmationCopy.subtitle}</p>
        <button type="button" class="btn btn_ghost" data-change>${confirmationCopy.change}</button>
      </div>
    `;
    panel.querySelector('[data-change]').addEventListener('click', () => {
      selectedDate = null;
      selectedTime = null;
      renderStep();
    });
  }

  function openTextFlow() {
    openModal();
    panel.innerHTML = `
      <div class="booking__text-flow">
        <p class="booking__success-title">${finalSection.textFlow.title}</p>
        <a class="btn btn_primary" href="${CONTACT_URL}" data-contact-link>${finalSection.textFlow.button}</a>
      </div>
    `;
  }
}
