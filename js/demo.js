(function () {
  const STRESS_COLOR = '#7768DF';
  const EMPTY_CELL = '#E3E2E7';
  const EXAMPLE_RATINGS = [
    3, 4, 5, 7, 8, 6, 4, 2, 1, 3, null, 5, 7, 9, 10, 8, 6, 5, 3, 2, 0, 2, 4, null, 5, 7, 6, 4, 3, 5, 4,
  ];
  const CONTEXTS = [
    'Work',
    'Family',
    'Public event',
    'Health',
    'Money',
    'Exercise',
    'Relationships',
    'Commute',
    'Screens',
  ];

  function heatmapColor(value) {
    if (value == null) return EMPTY_CELL;
    const level = Math.round(Math.min(1, Math.max(0, value / 10)) * 4);
    const opacity = 0.2 + (level / 4) * 0.8;
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return STRESS_COLOR + alpha;
  }

  function monthCells(year, monthIndex) {
    const first = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const offset = (first.getDay() + 6) % 7;
    const cells = Array(offset).fill(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const mm = String(monthIndex + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      cells.push(`${year}-${mm}-${dd}`);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function renderCalendar() {
    const root = document.getElementById('demo-calendar');
    if (!root) return;

    const now = new Date();
    const month = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const title = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(month);
    const cells = monthCells(month.getFullYear(), month.getMonth());

    const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
      .map((day) => `<span class="demo-weekday">${day}</span>`)
      .join('');

    let weeks = '';
    for (let i = 0; i < cells.length; i += 7) {
      const days = cells
        .slice(i, i + 7)
        .map((date) => {
          if (!date) return '<span class="demo-day-slot"></span>';
          const dayNum = Number(date.slice(8));
          const rating = EXAMPLE_RATINGS[dayNum - 1];
          const score = rating == null ? null : rating;
          const label =
            score == null ? `${date}, no rating` : `${date}, stress ${score} out of 10`;
          return `<span class="demo-day-slot"><span class="demo-day${score != null ? ' has-rating' : ''}" style="background:${heatmapColor(score)}" aria-label="${label}"><span>${dayNum}</span></span></span>`;
        })
        .join('');
      weeks += `<div class="demo-week">${days}</div>`;
    }

    const legendSwatches = [0, 1, 2, 3, 4]
      .map((level) => {
        const value = (level / 4) * 10;
        return `<span class="demo-swatch" style="background:${heatmapColor(value)}"></span>`;
      })
      .join('');

    root.innerHTML = `
      <p class="demo-month">${title}</p>
      <div class="demo-weekdays">${weekdays}</div>
      ${weeks}
      <div class="demo-legend">
        <div class="demo-legend-group"><span>0</span>${legendSwatches}<span>10</span></div>
        <div class="demo-legend-group"><span class="demo-swatch" style="background:${EMPTY_CELL}"></span><span>No rating</span></div>
      </div>
    `;
  }

  function renderChips() {
    const root = document.getElementById('demo-chips');
    if (!root) return;
    root.innerHTML = CONTEXTS.map(
      (label) =>
        `<button type="button" class="demo-chip" aria-pressed="false" data-label="${label}">${label}</button>`,
    ).join('');

    root.addEventListener('click', (event) => {
      const chip = event.target.closest('.demo-chip');
      if (!chip) return;
      const pressed = chip.getAttribute('aria-pressed') === 'true';
      chip.setAttribute('aria-pressed', pressed ? 'false' : 'true');
      chip.classList.toggle('is-active', !pressed);
    });
  }

  function setupSlider() {
    const range = document.getElementById('demo-range');
    const valueEl = document.getElementById('demo-value');
    const maxEl = document.getElementById('demo-value-max');
    const chip = document.getElementById('demo-value-chip');
    const dec = document.getElementById('demo-dec');
    const inc = document.getElementById('demo-inc');
    const summary = document.getElementById('demo-stress-summary');
    const scaleNumbers = document.querySelectorAll('.demo-scale-numbers span');
    if (!range || !valueEl || !maxEl || !chip || !dec || !inc) return;

    let answered = false;
    let value = 5;

    function paint() {
      const shown = answered ? value : null;
      range.value = String(value);
      range.classList.toggle('is-answered', answered);
      chip.classList.toggle('is-answered', answered);
      valueEl.textContent = answered ? String(value) : 'Select value';
      maxEl.textContent = answered ? '/10' : '';
      dec.disabled = !answered || value <= 0;
      inc.disabled = answered && value >= 10;
      scaleNumbers.forEach((el, index) => {
        el.classList.toggle('is-selected', answered && index === value);
      });
      if (summary) {
        summary.textContent = answered
          ? `Today’s stress: ${value}/10. Add details you want to remember.`
          : 'Add details you want to remember.';
      }
      range.setAttribute(
        'aria-valuetext',
        answered ? `${value} out of 10` : 'Not answered',
      );
    }

    function setValue(next, markAnswered = true) {
      value = Math.min(10, Math.max(0, next));
      if (markAnswered) answered = true;
      paint();
    }

    range.addEventListener('input', () => setValue(Number(range.value)));
    range.addEventListener('change', () => setValue(Number(range.value)));
    dec.addEventListener('click', () => {
      if (!answered) setValue(value);
      else setValue(value - 1);
    });
    inc.addEventListener('click', () => {
      if (!answered) setValue(value);
      else setValue(value + 1);
    });

    paint();
  }

  renderCalendar();
  renderChips();
  setupSlider();
})();
