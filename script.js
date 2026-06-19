const eventForm = document.querySelector("#eventForm");
const eventGrid = document.querySelector("#eventGrid");
const recommendationGrid = document.querySelector("#recommendationGrid");
const letterForm = document.querySelector("#letterForm");
const letterList = document.querySelector("#letterList");
const calendarSettings = document.querySelector("#calendarSettings");
const calendarFrame = document.querySelector("#calendarFrame");
const calendarHelp = document.querySelector("#calendarHelp");
const googleEventList = document.querySelector("#googleEventList");
const nextEventTitle = document.querySelector("#nextEventTitle");
const nextEventMeta = document.querySelector("#nextEventMeta");

const keys = {
  events: "family-board-events",
  letters: "family-board-letters",
  calendar: "family-board-calendar",
};

const categoryLabels = {
  palsoon: "팔순잔치",
  birthday: "생신/기념일",
  meal: "식사 모임",
  trip: "여행",
  family: "가족 모임",
  custom: "기타",
};

const defaultEvents = [
  {
    id: makeId(),
    title: "할머니 팔순잔치",
    date: "2026-08-01",
    time: "12:00",
    place: "장소를 입력해 주세요",
    category: "palsoon",
    memo: "가족들이 함께 모여 할머니의 여든 번째 생신을 축하하는 중요한 일정입니다.",
    image: "assets/palsoon-hero.png",
  },
];

const defaultLetters = [
  {
    id: makeId(),
    to: "가족 모두",
    from: "가족 일정판",
    body: "중요한 일정은 여기에서 함께 확인하고, 필요한 준비물이나 마음을 메모로 남겨 주세요.",
  },
];

const recommendations = [
  {
    category: "palsoon",
    title: "팔순잔치 전용",
    text: "숫자 80 장식이 있는 팔순잔치 대표 이미지",
    preview: "linear-gradient(135deg, #f8d7d9, #fff5cf 48%, #b86f65)",
    previewImage: "assets/palsoon-hero.png",
    image: "assets/palsoon-hero.png",
  },
  {
    category: "birthday",
    title: "꽃과 생신상",
    text: "숫자 없이 생신, 기념일, 가족 축하에 어울리는 이미지",
    preview: "linear-gradient(135deg, #f7e6e8, #fff7dc 48%, #7b8b68)",
    previewImage: "assets/birthday-table.png",
    image: "assets/birthday-table.png",
  },
  {
    category: "meal",
    title: "가족 식사",
    text: "외식, 명절 식탁, 모임 공지에 잘 맞는 차분한 색감",
    preview: "linear-gradient(135deg, #f7efe2, #d6a85f 52%, #6d7b54)",
    image: "gradient:linear-gradient(135deg, #f7efe2, #d6a85f 52%, #6d7b54)",
  },
  {
    category: "trip",
    title: "여행과 나들이",
    text: "여행, 소풍, 드라이브 일정에 어울리는 맑은 이미지",
    preview: "linear-gradient(135deg, #b9dced, #f8f4d8 52%, #5f9b78)",
    image: "gradient:linear-gradient(135deg, #b9dced, #f8f4d8 52%, #5f9b78)",
  },
  {
    category: "family",
    title: "가족 단체 모임",
    text: "집들이, 정기모임, 가족회의에 쓰기 좋은 담백한 톤",
    preview: "linear-gradient(135deg, #dce8dd, #ffffff 48%, #9ba88c)",
    image: "gradient:linear-gradient(135deg, #dce8dd, #ffffff 48%, #9ba88c)",
  },
];

let events = loadList(keys.events, defaultEvents);
let letters = loadList(keys.letters, defaultLetters);
let selectedEventId = events[0]?.id ?? null;
normalizeSavedEvents();

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadList(key, fallback) {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeSavedEvents() {
  let changed = false;
  events = events.map((event) => {
    const isPalsoon = event.title?.includes("팔순");
    if (!isPalsoon || event.category === "palsoon") return event;
    changed = true;
    return { ...event, category: "palsoon", image: event.image || "assets/palsoon-hero.png" };
  });
  if (changed) saveList(keys.events, events);
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function formatDate(date, time) {
  if (!date) return "날짜 미정";
  const dateText = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T${time || "00:00"}`));
  return time ? `${dateText} ${time}` : dateText;
}

function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return [...events]
    .filter((event) => !event.date || new Date(`${event.date}T00:00`) >= today)
    .sort((a, b) => (a.date || "9999-12-31").localeCompare(b.date || "9999-12-31"));
}

function updateSummary() {
  const next = getUpcomingEvents()[0] || events[0];
  if (!next) return;
  nextEventTitle.textContent = next.title;
  nextEventMeta.textContent = `${formatDate(next.date, next.time)} · ${next.place || "장소 미정"}`;
}

function createGoogleCalendarLink(event) {
  if (!event.date) {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.title,
      details: event.memo || "",
      location: event.place || "",
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const start = `${event.date.replaceAll("-", "")}T${(event.time || "00:00").replace(":", "")}00`;
  const endDate = new Date(`${event.date}T${event.time || "00:00"}`);
  endDate.setHours(endDate.getHours() + 2);
  const end = `${event.date.replaceAll("-", "")}T${String(endDate.getHours()).padStart(2, "0")}${String(endDate.getMinutes()).padStart(2, "0")}00`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.memo || "",
    location: event.place || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function renderEvents() {
  eventGrid.innerHTML = "";

  events.forEach((event) => {
    const article = document.createElement("article");
    article.className = "event-card";

    const photo = document.createElement("div");
    photo.className = "event-photo";
    if (event.image?.startsWith("gradient:")) {
      photo.style.background = event.image.replace("gradient:", "");
    } else if (event.image) {
      const img = document.createElement("img");
      img.src = event.image;
      img.alt = `${event.title} 사진`;
      photo.append(img);
    }

    const tag = document.createElement("span");
    tag.className = "event-tag";
    tag.textContent = categoryLabels[event.category] || "중요 일정";
    photo.append(tag);

    const body = document.createElement("div");
    body.className = "event-body";

    const date = document.createElement("div");
    date.className = "event-date";
    date.textContent = formatDate(event.date, event.time);

    const title = document.createElement("h3");
    title.textContent = event.title;

    const place = document.createElement("p");
    place.textContent = event.place || "장소 미정";

    const memo = document.createElement("textarea");
    memo.rows = 3;
    memo.value = event.memo || "";
    memo.placeholder = "이 일정의 메모를 적어 주세요.";
    memo.addEventListener("input", () => {
      event.memo = memo.value;
      saveList(keys.events, events);
    });

    const file = document.createElement("input");
    file.className = "file-input";
    file.type = "file";
    file.accept = "image/*";
    file.addEventListener("change", () => updateEventImage(event.id, file.files[0]));

    const fields = document.createElement("div");
    fields.className = "event-fields";
    fields.append(memo, file);

    const selectButton = document.createElement("button");
    selectButton.className = "button small ghost";
    selectButton.type = "button";
    selectButton.textContent = "추천 이미지 적용 대상";
    selectButton.addEventListener("click", () => {
      selectedEventId = event.id;
      renderRecommendations();
    });

    const calendarLink = document.createElement("a");
    calendarLink.className = "button small secondary";
    calendarLink.href = createGoogleCalendarLink(event);
    calendarLink.target = "_blank";
    calendarLink.rel = "noopener";
    calendarLink.textContent = "구글 캘린더에 추가";

    const actions = document.createElement("div");
    actions.className = "event-actions";
    actions.append(selectButton, calendarLink);

    body.append(date, title, place, fields, actions);
    article.append(photo, body);
    eventGrid.append(article);
  });

  updateSummary();
}

function updateEventImage(eventId, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    events = events.map((event) =>
      event.id === eventId ? { ...event, image: reader.result } : event
    );
    saveList(keys.events, events);
    renderEvents();
  });
  reader.readAsDataURL(file);
}

function renderRecommendations() {
  recommendationGrid.innerHTML = "";

  recommendations.forEach((item) => {
    const card = document.createElement("button");
    card.className = "recommend-card";
    card.type = "button";
    card.style.setProperty("--preview", item.preview);

    const preview = document.createElement("div");
    preview.className = "recommend-preview";
    if (item.previewImage) {
      const img = document.createElement("img");
      img.src = item.previewImage;
      img.alt = `${item.title} 추천 이미지`;
      preview.append(img);
    }

    const copy = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const text = document.createElement("p");
    text.textContent = item.text;
    copy.append(title, text);

    card.append(preview, copy);
    card.addEventListener("click", () => applyRecommendation(item));
    recommendationGrid.append(card);
  });
}

function applyRecommendation(item) {
  const targetId = selectedEventId || events[0]?.id;
  if (!targetId) return;

  events = events.map((event) => {
    if (event.id !== targetId) return event;
    return {
      ...event,
      category: item.category,
      image: item.image || `gradient:${item.preview}`,
      memo: event.memo || `${item.title} 분위기의 사진을 넣어 보세요.`,
    };
  });
  saveList(keys.events, events);
  renderEvents();
}

eventForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.querySelector("#eventTitle").value.trim();
  if (!title) {
    document.querySelector("#eventTitle").focus();
    return;
  }

  const newEvent = {
    id: makeId(),
    title,
    date: document.querySelector("#eventDate").value,
    time: document.querySelector("#eventTime").value,
    place: document.querySelector("#eventPlace").value.trim(),
    category: document.querySelector("#eventCategory").value,
    memo: document.querySelector("#eventMemo").value.trim(),
    image: "",
  };

  events = [newEvent, ...events];
  selectedEventId = newEvent.id;
  saveList(keys.events, events);
  renderEvents();
  renderRecommendations();
  eventForm.reset();
});

function renderLetters() {
  letterList.innerHTML = "";

  letters.forEach((letter) => {
    const article = document.createElement("article");
    article.className = "letter-note";
    article.innerHTML = `
      <span>To. ${escapeHtml(letter.to)}</span>
      <h3>${escapeHtml(letter.from)}</h3>
      <p>${escapeHtml(letter.body)}</p>
    `;
    letterList.append(article);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

letterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const to = document.querySelector("#letterTo").value.trim() || "가족 모두";
  const from = document.querySelector("#letterFrom").value.trim() || "익명의 가족";
  const body = document.querySelector("#letterBody").value.trim();
  if (!body) {
    document.querySelector("#letterBody").focus();
    return;
  }

  letters = [{ id: makeId(), to, from, body }, ...letters];
  saveList(keys.letters, letters);
  renderLetters();
  letterForm.reset();
});

function loadCalendarSettings() {
  const saved = localStorage.getItem(keys.calendar);
  if (!saved) return { calendarId: "", apiKey: "" };

  try {
    return JSON.parse(saved);
  } catch {
    return { calendarId: "", apiKey: "" };
  }
}

function saveCalendarSettings(settings) {
  localStorage.setItem(keys.calendar, JSON.stringify(settings));
}

function updateCalendarFrame(settings) {
  document.querySelector("#calendarIdInput").value = settings.calendarId || "";
  document.querySelector("#apiKeyInput").value = settings.apiKey || "";

  if (!settings.calendarId) {
    calendarFrame.src = "about:blank";
    calendarHelp.textContent = "캘린더 ID를 입력하면 이 자리에 구글 캘린더가 표시됩니다.";
    googleEventList.innerHTML = '<article class="google-event">연동된 캘린더가 없습니다.</article>';
    return;
  }

  const src = new URL("https://calendar.google.com/calendar/embed");
  src.searchParams.set("src", settings.calendarId);
  src.searchParams.set("ctz", "Asia/Seoul");
  src.searchParams.set("mode", "AGENDA");
  calendarFrame.src = src.toString();
  calendarHelp.textContent = "캘린더 공개 설정이 되어 있어야 표시됩니다.";

  if (settings.apiKey) {
    fetchGoogleEvents(settings);
  } else {
    googleEventList.innerHTML = '<article class="google-event">API 키를 넣으면 주요일정 목록도 불러옵니다.</article>';
  }
}

async function fetchGoogleEvents(settings) {
  googleEventList.innerHTML = '<article class="google-event">구글 캘린더 일정을 불러오는 중입니다.</article>';
  const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(settings.calendarId)}/events`);
  url.searchParams.set("key", settings.apiKey);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("timeMin", new Date().toISOString());
  url.searchParams.set("maxResults", "6");

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("calendar fetch failed");
    const data = await response.json();
    renderGoogleEvents(data.items || []);
  } catch {
    googleEventList.innerHTML = '<article class="google-event">일정을 불러오지 못했습니다. 캘린더 공개 설정, ID, API 키를 확인해 주세요.</article>';
  }
}

function renderGoogleEvents(items) {
  if (!items.length) {
    googleEventList.innerHTML = '<article class="google-event">다가오는 구글 캘린더 일정이 없습니다.</article>';
    return;
  }

  googleEventList.innerHTML = "";
  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "google-event";
    const start = item.start?.dateTime || item.start?.date || "";
    const dateText = start ? new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(new Date(start)) : "날짜 미정";
    article.innerHTML = `
      <time>${escapeHtml(dateText)}</time>
      <h3>${escapeHtml(item.summary || "제목 없는 일정")}</h3>
      <p>${escapeHtml(item.location || "장소 미정")}</p>
    `;
    googleEventList.append(article);
  });
}

calendarSettings.addEventListener("submit", (event) => {
  event.preventDefault();
  const settings = {
    calendarId: document.querySelector("#calendarIdInput").value.trim(),
    apiKey: document.querySelector("#apiKeyInput").value.trim(),
  };
  saveCalendarSettings(settings);
  updateCalendarFrame(settings);
});

document.querySelector("#clearCalendar").addEventListener("click", () => {
  localStorage.removeItem(keys.calendar);
  updateCalendarFrame({ calendarId: "", apiKey: "" });
});

renderEvents();
renderRecommendations();
renderLetters();
updateCalendarFrame(loadCalendarSettings());
