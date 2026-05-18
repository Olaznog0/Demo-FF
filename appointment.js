(function () {
  const services = [
    { id: 'apk', icon: '✓', duration: 45, names: { nl: 'APK check', en: 'MOT check' }, tags: { nl: 'Keuring', en: 'Inspection' } },
    { id: 'general', icon: '◎', duration: 60, names: { nl: 'General check', en: 'General check' }, tags: { nl: 'Controle', en: 'Check-up' } },
    { id: 'tires', icon: '◔', duration: 40, names: { nl: 'Tire changes', en: 'Tyre changes' }, tags: { nl: 'Banden', en: 'Tyres' } },
    { id: 'oil', icon: '◉', duration: 30, names: { nl: 'Oil change', en: 'Oil change' }, tags: { nl: 'Onderhoud', en: 'Maintenance' } },
    { id: 'brakes', icon: '□', duration: 45, names: { nl: 'Brake check', en: 'Brake check' }, tags: { nl: 'Veiligheid', en: 'Safety' } },
    { id: 'diagnostic', icon: '⌁', duration: 50, names: { nl: 'Diagnostics', en: 'Diagnostics' }, tags: { nl: 'Elektronica', en: 'Electronics' } }
  ];
  const state = { service: services[0], selectedDate: null, selectedSlot: null, weekOffset: 0 };
  const els = {};
  const slots = [];
  for (let h = 8; h <= 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 17 && m > 30) continue;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  const lang = () => window.__SITE_LANG__ || 'nl';
  const dict = () => window.__SITE_I18N__ || {};
  const locale = () => lang() === 'en' ? 'en-GB' : 'nl-NL';
  const longDate = (d) => new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const shortDay = (d) => new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(d);
  const shortMonth = (d) => new Intl.DateTimeFormat(locale(), { month: 'short' }).format(d);
  const duration = (m) => `${m} min`;

  function monday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  }
  function weekDays(offset) {
    const base = monday(new Date());
    base.setDate(base.getDate() + offset * 7);
    return Array.from({ length: 6 }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return d; });
  }
  function disabledSlots(date) {
    if (!date) return [];
    return {1:['09:00','12:30'],2:['10:30','14:00'],3:['08:30','15:30'],4:['11:00','13:30'],5:['09:30','16:00'],6:['10:00','12:00']}[date.getDay()] || [];
  }
  function renderServices() {
    els.serviceList.innerHTML = '';
    services.forEach((service) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'service-card' + (state.service.id === service.id ? ' is-active' : '');
      btn.innerHTML = `<div class="service-head"><div><span class="service-name">${service.names[lang()]}</span><div class="service-meta">${duration(service.duration)}</div></div><span class="service-icon">${service.icon}</span></div><span class="service-tag">${service.tags[lang()]}</span>`;
      btn.addEventListener('click', () => { state.service = service; renderServices(); renderSummary(); });
      els.serviceList.appendChild(btn);
    });
  }
  function renderDays() {
    const days = weekDays(state.weekOffset);
    els.dayStrip.innerHTML = '';
    document.getElementById('calendarMonthLabel').textContent = `${longDate(days[0])} — ${longDate(days[days.length - 1])}`;
    days.forEach((date) => {
      const key = date.toISOString().slice(0,10);
      const active = state.selectedDate && key === state.selectedDate.toISOString().slice(0,10);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-card' + (active ? ' is-active' : '');
      btn.innerHTML = `<span class="day-name">${shortDay(date)}</span><span class="day-date">${date.getDate()}</span><span class="day-month">${shortMonth(date)}</span>`;
      btn.addEventListener('click', () => { state.selectedDate = date; state.selectedSlot = null; renderDays(); renderSlots(); renderSummary(); });
      els.dayStrip.appendChild(btn);
    });
  }
  function renderSlots() {
    els.slotGrid.innerHTML = '';
    if (!state.selectedDate) {
      els.slotTitle.textContent = dict()['booking.selectDayFirst'] || '';
      return;
    }
    els.slotTitle.textContent = `${dict()['booking.slotTitleHeader'] || ''}: ${longDate(state.selectedDate)}`;
    const disabled = disabledSlots(state.selectedDate);
    slots.forEach((slot) => {
      const btn = document.createElement('button');
      const off = disabled.includes(slot);
      const active = state.selectedSlot === slot;
      btn.type = 'button';
      btn.className = 'slot-btn' + (active ? ' is-active' : '') + (off ? ' is-disabled' : '');
      btn.textContent = slot;
      if (off) btn.disabled = true;
      else btn.addEventListener('click', () => { state.selectedSlot = slot; renderSlots(); renderSummary(); });
      els.slotGrid.appendChild(btn);
    });
  }
  function renderSummary() {
    document.getElementById('summaryService').textContent = state.service ? state.service.names[lang()] : '—';
    document.getElementById('summaryDuration').textContent = state.service ? duration(state.service.duration) : '—';
    document.getElementById('summaryDate').textContent = state.selectedDate ? longDate(state.selectedDate) : '—';
    document.getElementById('summaryTime').textContent = state.selectedSlot || '—';
  }
  function bind() {
    document.getElementById('calendarPrev').addEventListener('click', () => { state.weekOffset -= 1; renderDays(); renderSlots(); renderSummary(); });
    document.getElementById('calendarNext').addEventListener('click', () => { state.weekOffset += 1; renderDays(); renderSlots(); renderSummary(); });
    document.getElementById('bookingDemoBtn').addEventListener('click', () => {
      const ok = state.service && state.selectedDate && state.selectedSlot;
      window.alert(ok ? (dict()['booking.bookedAlert'] || '') : (dict()['booking.incompleteAlert'] || ''));
    });
  }
  function init() {
    els.serviceList = document.getElementById('serviceList');
    els.dayStrip = document.getElementById('dayStrip');
    els.slotGrid = document.getElementById('slotGrid');
    els.slotTitle = document.getElementById('slotTitle');
    if (!els.serviceList) return;
    renderServices(); renderDays(); renderSlots(); renderSummary(); bind();
  }
  document.addEventListener('site:lang-ready', () => { if (document.getElementById('serviceList')) { renderServices(); renderDays(); renderSlots(); renderSummary(); } });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();