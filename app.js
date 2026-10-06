(function () {
  "use strict";

  const byId = function (id) { return document.getElementById(id); };
  const branches = [
    "Central", "Northside", "Eastgate", "West End", "Riverside", "Maplewood",
    "South Market", "Hillcrest", "Harbor Point", "Oak Terrace", "Cedar Grove", "Lakeside"
  ];
  const templates = [
    { title: "Family Storytime", type: "Kids & families", description: "Songs, picture books, and activities for young children and caregivers.", time: "10:30 AM", tone: "#E9D4F8", motif: "book" },
    { title: "Author Talk: The Places We Keep", type: "Author talk", description: "A conversation with a local writer followed by audience questions.", time: "6:00 PM", tone: "#DED3F4", motif: "mic" },
    { title: "Digital Skills for Everyday Life", type: "Technology", description: "Practical help with email, forms, and everyday online tasks.", time: "2:00 PM", tone: "#D5E6F6", motif: "screen" },
    { title: "Neighborhood Advisory Meeting", type: "Community meeting", description: "Residents and library staff share local updates and ideas.", time: "5:30 PM", tone: "#E9DFD2", motif: "people" },
    { title: "Teen Maker Lab", type: "Teens", description: "Hands-on making, simple circuits, and open creative projects.", time: "3:30 PM", tone: "#EAD6EF", motif: "spark" },
    { title: "Job Search and Resume Clinic", type: "Career support", description: "Drop-in guidance for applications, resumes, and interviews.", time: "4:00 PM", tone: "#D8E8E2", motif: "screen" },
    { title: "Bilingual Story Circle", type: "Kids & families", description: "Stories and songs in English and Spanish for families.", time: "10:00 AM", tone: "#F5DFC9", motif: "book" },
    { title: "Seed Swap and Garden Basics", type: "Workshop", description: "Exchange seeds and learn beginner-friendly growing tips.", time: "11:00 AM", tone: "#DDE9D6", motif: "leaf" },
    { title: "Local History Workshop", type: "Workshop", description: "Explore photographs and stories from the neighborhood archive.", time: "1:00 PM", tone: "#E8DDCF", motif: "book" },
    { title: "Book Club: New Voices", type: "Book club", description: "A welcoming discussion of a recent community-selected read.", time: "6:30 PM", tone: "#DADDF6", motif: "book" },
    { title: "Accessible Technology Help", type: "Technology", description: "One-to-one help with device settings and accessible tools.", time: "1:30 PM", tone: "#D9E8F5", motif: "screen" },
    { title: "Family Craft Hour: Paper Worlds", type: "Kids & families", description: "An afternoon of simple crafts using everyday materials.", time: "2:30 PM", tone: "#F3DEDF", motif: "spark" }
  ];

  function dayStart(value) { return new Date(value.getFullYear(), value.getMonth(), value.getDate()); }
  function addDays(value, days) {
    const next = new Date(value);
    next.setDate(next.getDate() + days);
    return next;
  }
  function atNoon(value) {
    const next = new Date(value);
    next.setHours(12, 0, 0, 0);
    return next;
  }
  function dayDifference(a, b) {
    const aUtc = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const bUtc = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((aUtc - bUtc) / 86400000);
  }
  function isoDate(value) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return value.getFullYear() + "-" + month + "-" + day;
  }
  function parseDate(value) {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12);
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
    });
  }
  function formatDate(value) {
    return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(value);
  }
  function formatLongDate(value) {
    return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(value);
  }

  const today = atNoon(new Date());
  const todayStart = dayStart(today);
  const weekStart = dayStart(today);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const pastOffsets = [-250, -210, -180, -150, -120, -90, -60, -45, -30, -21, -14, -7];
  const thisWeekDays = [0, 2, 4, 6];
  const currentWeekday = (today.getDay() + 6) % 7;
  if (thisWeekDays.indexOf(currentWeekday) === -1) thisWeekDays[1] = currentWeekday;
  thisWeekDays.sort(function (a, b) { return a - b; });
  const futureOffsets = [8, 10, 13, 20, 28, 41, 55, 73];
  const dates = pastOffsets.map(function (offset) { return atNoon(addDays(today, offset)); })
    .concat(thisWeekDays.map(function (weekday) { return atNoon(addDays(weekStart, weekday)); }))
    .concat(futureOffsets.map(function (offset) { return atNoon(addDays(today, offset)); }));

  function makeAction(date, slot, branchIndex, status) {
    if (status === "Cancelled") return null;
    const offset = dayDifference(date, today);
    if (offset < 0) {
      if (offset >= -30 && ((slot + branchIndex) % 9 === 0 || (slot >= 12 && (slot + branchIndex) % 7 === 0) || (slot === 12 && branchIndex === 0))) {
        return { type: "followup", label: "Send event follow-up", dueDate: atNoon(addDays(date, 1)) };
      }
      return null;
    }
    if ((slot + branchIndex) % 4 === 0) {
      return { type: "confirm", label: (slot + branchIndex) % 8 === 0 ? "Confirm speaker" : "Confirm room setup", dueDate: atNoon(addDays(date, -2)) };
    }
    if ((slot + branchIndex) % 5 === 0) {
      return { type: "materials", label: "Prepare materials", dueDate: atNoon(addDays(date, -1)) };
    }
    if ((slot + branchIndex) % 7 === 0) {
      return { type: "registration", label: "Review registrations", dueDate: atNoon(addDays(date, -1)) };
    }
    return null;
  }

  const events = [];
  branches.forEach(function (branch, branchIndex) {
    dates.forEach(function (date, slot) {
      const template = templates[(slot + branchIndex * 3) % templates.length];
      const offset = dayDifference(date, today);
      let status;
      if (offset < 0) status = "Completed";
      else if (offset === 0 && (branchIndex + slot) % 3 === 0) status = "Happening";
      else if ((offset <= 7 && (branchIndex + slot) % 8 === 0) || (offset > 14 && (branchIndex + slot) % 3 === 0)) status = "Planning";
      else status = "Upcoming";
      if ((branchIndex * 9 + slot) % 67 === 0 || (offset > 1 && (branchIndex * 11 + slot) % 53 === 0)) status = "Cancelled";
      events.push({
        title: template.title,
        type: template.type,
        description: template.description,
        time: template.time,
        tone: template.tone,
        motif: template.motif,
        date: date,
        branch: branch,
        status: status,
        action: makeAction(date, slot, branchIndex, status),
        missingArt: (branchIndex * 4 + slot) % 19 === 0
      });
    });
  });

  const state = {
    branches: new Set(branches),
    timeframe: "week",
    status: "all",
    actions: new Set(),
    sort: "latest",
    customStart: "",
    customEnd: "",
    searchCategory: "",
    searchTerms: [],
    searchApplied: [],
    searchRaw: "",
    page: 1,
    pageSize: 8
  };

  const table = document.querySelector(".table-scroll table");
  const rows = byId("eventRows");
  const branchPanel = byId("branchPanel");
  const branchTrigger = byId("branchTrigger");
  const branchOptions = byId("branchOptions");
  const searchInput = byId("searchInput");
  function artworkMarkup(event) {
    if (event.missingArt) {
      return "<div class='event-art event-art-fallback' aria-hidden='true'>✦</div>";
    }
    const motifs = {
      book: "<path d='M19 23c8-4 14-3 21 2v29c-7-5-13-6-21-2V23Zm21 2c7-5 13-6 21-2v29c-8-4-14-3-21 2V25Z' fill='none' stroke='#563F69' stroke-width='2.5' stroke-linejoin='round'/><path d='M40 25v29' stroke='#563F69' stroke-width='2.5'/>",
      mic: "<rect x='33' y='18' width='14' height='26' rx='7' fill='none' stroke='#563F69' stroke-width='2.5'/><path d='M27 34c0 10 6 16 13 16s13-6 13-16M40 50v10m-8 0h16' fill='none' stroke='#563F69' stroke-width='2.5' stroke-linecap='round'/>",
      screen: "<rect x='19' y='20' width='42' height='31' rx='4' fill='none' stroke='#563F69' stroke-width='2.5'/><path d='M33 59h14m-7-8v8M27 29h12m-12 7h20' stroke='#563F69' stroke-width='2.5' stroke-linecap='round'/>",
      people: "<circle cx='32' cy='28' r='6' fill='none' stroke='#563F69' stroke-width='2.5'/><circle cx='50' cy='28' r='6' fill='none' stroke='#563F69' stroke-width='2.5'/><path d='M19 50c1-9 6-13 13-13s12 4 13 13m-7 0c1-9 5-13 12-13s11 4 12 13' fill='none' stroke='#563F69' stroke-width='2.5' stroke-linecap='round'/>",
      spark: "<path d='m40 17 4.4 17.6L62 39l-17.6 4.4L40 61l-4.4-17.6L18 39l17.6-4.4L40 17Z' fill='none' stroke='#563F69' stroke-width='2.5' stroke-linejoin='round'/>",
      leaf: "<path d='M57 19C35 20 23 30 23 46c0 9 6 15 15 15 16 0 23-19 19-42Z' fill='none' stroke='#563F69' stroke-width='2.5' stroke-linejoin='round'/><path d='M25 57c6-11 14-18 25-26' stroke='#563F69' stroke-width='2.5' stroke-linecap='round'/>"
    };
    return "<svg class='event-art' viewBox='0 0 80 80' aria-hidden='true' focusable='false'><rect width='80' height='80' rx='10' fill='" + event.tone + "'/><circle cx='68' cy='14' r='19' fill='#FFFFFF' fill-opacity='.24'/><path d='M0 66c18-11 34-10 50-3 12 5 21 6 30 1v16H0Z' fill='#FFFFFF' fill-opacity='.22'/>" + motifs[event.motif] + "</svg>";
  }
  function isOverdue(event) { return !!event.action && dayDifference(event.action.dueDate, today) < 0; }
  function dueLabel(event) {
    if (!event.action) return "";
    const offset = dayDifference(event.action.dueDate, today);
    if (offset < 0) return "Past due";
    if (offset === 0) return "Due today";
    if (offset === 1) return "Due tomorrow";
    return "Due " + formatDate(event.action.dueDate);
  }
  function statusMarkup(status) {
    return "<span class='status-pill status-" + status + "'>" + escapeHtml(status === "Happening" ? "Happening now" : status) + "</span>";
  }
  function actionMarkup(event) {
    if (!event.action) return "<span class='no-action'>No action flagged</span>";
    const overdue = isOverdue(event);
    return "<div class='action-label" + (overdue ? " is-overdue" : "") + "'>" + escapeHtml(event.action.label) + "</div><div class='action-due" + (overdue ? " is-overdue" : "") + "'>" + escapeHtml(dueLabel(event)) + "</div>";
  }
  function eventRow(event) {
    return "<tr><td><div class='event-cell'>" + artworkMarkup(event) +
      "<div><span class='event-title'>" + escapeHtml(event.title) +
      "</span><div class='event-type'>" + escapeHtml(event.type) + "</div></div></div></td>" +
      "<td>" + statusMarkup(event.status) + "</td>" +
      "<td><span class='branch-name'>" + escapeHtml(event.branch) + "</span></td>" +
      "<td><div class='date-primary'>" + escapeHtml(formatDate(event.date)) + "</div><div class='date-secondary'>" + escapeHtml(event.time) + "</div></td>" +
      "<td class='action-cell'>" + actionMarkup(event) + "</td></tr>";
  }
  function rangeIssue() {
    if (state.timeframe !== "custom") return "";
    const start = parseDate(state.customStart);
    const end = parseDate(state.customEnd);
    if (!start || !end) return "Choose both dates to view a custom range.";
    if (start > end) return "The end date must be on or after the start date.";
    return "";
  }
  function withinTimeframe(event, timeframe) {
    const date = event.date;
    const selected = timeframe || state.timeframe;
    if (selected === "week") return date >= weekStart && date < addDays(weekStart, 7);
    if (selected === "next7") return date >= todayStart && date < addDays(todayStart, 7);
    if (selected === "next30") return date >= todayStart && date < addDays(todayStart, 30);
    if (selected === "past") return date < todayStart;
    if (selected === "custom") {
      const start = parseDate(state.customStart);
      const end = parseDate(state.customEnd);
      return !!start && !!end && date >= start && date <= end;
    }
    return true;
  }
  function actionMatches(event) {
    if (!state.actions.size) return true;
    return Array.from(state.actions).some(function (action) {
      if (action === "needs") return !!event.action;
      if (action === "overdue") return isOverdue(event);
      return !!event.action && event.action.type === action;
    });
  }
  function timeMinutes(value) {
    const parts = value.split(" ");
    const clock = parts[0].split(":").map(Number);
    return (clock[0] % 12 + (parts[1] === "PM" ? 12 : 0)) * 60 + clock[1];
  }
  function compareEvents(a, b) {
    const dateDifference = a.date - b.date || timeMinutes(a.time) - timeMinutes(b.time);
    return (state.sort === "earliest" ? dateDifference : -dateDifference) || a.branch.localeCompare(b.branch);
  }
  function filteredEvents() {
    if (!state.branches.size || rangeIssue()) return [];
    return events.filter(function (event) {
      return matchesOtherFilters(event) && actionMatches(event);
    }).sort(compareEvents);
  }
  function matchesOtherFilters(event) {
    return matchesScopeAndSearch(event) && withinTimeframe(event);
  }
  function matchesScopeAndSearch(event) {
    if (!state.branches.has(event.branch)) return false;
    if (state.status !== "all" && event.status !== state.status) return false;
    if (state.searchCategory && event.type !== state.searchCategory) return false;
    const haystack = (event.title + " " + event.type + " " + event.description + " " + event.branch).toLowerCase();
    return state.searchTerms.every(function (word) { return haystack.indexOf(word) !== -1; });
  }

  function buildBranchOptions() {
    branchOptions.innerHTML = branches.map(function (branch) {
      return "<label class='branch-option'><input type='checkbox' value='" + escapeHtml(branch) + "' checked><span>" + escapeHtml(branch) + "</span></label>";
    }).join("");
  }
  function syncBranchOptions() {
    branchOptions.querySelectorAll("input").forEach(function (input) { input.checked = state.branches.has(input.value); });
    byId("selectedBranchCount").textContent = state.branches.size + " selected";
  }
  function syncControls() {
    byId("timeframeSelect").value = state.timeframe;
    byId("statusSelect").value = state.status;
    byId("sortSelect").value = state.sort;
    byId("startDate").value = state.customStart;
    byId("endDate").value = state.customEnd;
    byId("customRange").hidden = state.timeframe !== "custom";
    byId("rangeError").textContent = rangeIssue();
    let branchLabel = "All 12 branches";
    if (!state.branches.size) branchLabel = "No branches selected";
    else if (state.branches.size === 1) branchLabel = Array.from(state.branches)[0];
    else if (state.branches.size < branches.length) branchLabel = state.branches.size + " branches selected";
    byId("branchValue").textContent = branchLabel;
    syncBranchOptions();
  }
  function renderScope() {
    const count = state.branches.size;
    const scope = byId("scopeLabel");
    const description = byId("pageDescription");
    const actionTasks = { needs: "Find events that need attention", overdue: "Find past-due work", confirm: "Find details to confirm", materials: "Find materials to prepare", followup: "Find follow-ups" };
    const selectedAction = state.actions.size === 1 ? Array.from(state.actions)[0] : "";
    const task = state.actions.size > 1 ? "Find events with selected actions" : actionTasks[selectedAction] || (state.timeframe === "past" ? "Revisit past events" : state.timeframe === "week" ? "Find what matters this week" : "Browse events");
    if (count === branches.length) {
      scope.textContent = "SYSTEM-WIDE VIEW";
      description.textContent = task + " across your library system.";
    } else if (count === 1) {
      const branch = Array.from(state.branches)[0];
      scope.textContent = branch.toUpperCase() + " BRANCH";
      description.textContent = task + " at " + branch + ".";
    } else if (count === 0) {
      scope.textContent = "NO BRANCHES SELECTED";
      description.textContent = "Choose a branch to see its events.";
    } else {
      scope.textContent = count + " BRANCHES SELECTED";
      description.textContent = task + " across selected branches.";
    }
    byId("scopeReset").hidden = count === branches.length;
  }
  function quickCounts() {
    const scoped = events.filter(function (event) { return matchesScopeAndSearch(event) && actionMatches(event); });
    const countIds = { week: "sideWeekCount", next7: "sideNext7Count", next30: "sideNext30Count", past: "sidePastCount", all: "sideAllCount", custom: "sideCustomCount" };
    byId("navAllCount").textContent = events.length;
    document.querySelectorAll(".quick-side").forEach(function (button) {
      const timeframe = button.getAttribute("data-timeframe");
      const active = timeframe === state.timeframe;
      byId(countIds[timeframe]).textContent = scoped.filter(function (event) { return withinTimeframe(event, timeframe); }).length;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const cardEvents = rangeIssue() ? [] : events.filter(matchesOtherFilters);
    const actionCounts = {
      needs: cardEvents.filter(function (event) { return !!event.action; }).length,
      overdue: cardEvents.filter(isOverdue).length,
      confirm: cardEvents.filter(function (event) { return !!event.action && event.action.type === "confirm"; }).length,
      materials: cardEvents.filter(function (event) { return !!event.action && event.action.type === "materials"; }).length,
      followup: cardEvents.filter(function (event) { return !!event.action && event.action.type === "followup"; }).length
    };
    const actionCountIds = { needs: "actionNeedsCount", overdue: "actionOverdueCount", confirm: "actionConfirmCount", materials: "actionMaterialsCount", followup: "actionFollowupCount" };
    document.querySelectorAll(".action-card").forEach(function (card) {
      const action = card.getAttribute("data-action");
      const active = state.actions.has(action);
      card.classList.toggle("is-active", active);
      card.querySelector(".action-checkbox").checked = active;
      byId(actionCountIds[action]).textContent = actionCounts[action];
    });
  }
  function chip(label, key) {
    return "<span class='active-chip'><span>" + escapeHtml(label) + "</span><button type='button' data-remove='" + key + "' aria-label='Remove " + escapeHtml(label) + " filter'>×</button></span>";
  }
  function renderActiveFilters() {
    const chips = [];
    if (state.branches.size !== branches.length) {
      const label = state.branches.size === 0 ? "No branches" : state.branches.size === 1 ? Array.from(state.branches)[0] : state.branches.size + " branches";
      chips.push(chip(label, "branches"));
    }
    if (state.timeframe !== "week") {
      const labels = { next7: "Next 7 days", next30: "Next 30 days", past: "Past events", all: "All time", custom: "Custom dates" };
      chips.push(chip(labels[state.timeframe], "timeframe"));
    }
    if (state.status !== "all") chips.push(chip(state.status, "status"));
    const actionLabels = { needs: "Needs attention", overdue: "Past due", confirm: "Confirm details", materials: "Prepare materials", followup: "Follow up" };
    state.actions.forEach(function (action) { chips.push(chip(actionLabels[action], "action:" + action)); });
    if (state.searchCategory) chips.push(chip(state.searchCategory, "search"));
    if (state.searchTerms.length) chips.push(chip("Search: " + state.searchTerms.join(" "), "search"));
    byId("activeFilterRow").innerHTML = chips.join("");
  }
  function renderSearchFeedback() {
    const area = byId("searchFeedback");
    let tags = state.searchApplied.slice();
    let intro = "Applied from your search:";
    if (!tags.length && (state.searchCategory || state.searchTerms.length)) {
      tags = [];
      if (state.searchCategory) tags.push(state.searchCategory);
      if (state.searchTerms.length) tags.push(state.searchTerms.join(" "));
      intro = "Search text still active:";
    }
    if (!tags.length) { area.hidden = true; area.innerHTML = ""; return; }
    area.hidden = false;
    area.innerHTML = "<strong>" + intro + "</strong>" + tags.map(function (tag) { return "<span class='interpret-pill'>" + escapeHtml(tag) + "</span>"; }).join("") + "<button type='button' data-reset-search>Reset all filters</button>";
  }
  function resultsDescription(count) {
    const timeframeLabels = { week: "this week", next7: "in the next 7 days", next30: "in the next 30 days", past: "before today", all: "across all dates", custom: "in the selected date range" };
    const scope = state.branches.size === branches.length ? "the library system" : state.branches.size === 1 ? Array.from(state.branches)[0] : state.branches.size + " branches";
    return count + " matching " + (count === 1 ? "event" : "events") + " " + timeframeLabels[state.timeframe] + " across " + scope + ".";
  }
  function renderEmpty() {
    const empty = byId("emptyState");
    let title = "No events match these filters";
    let message = "Try a wider timeframe or remove a filter to bring events back into view.";
    let button = "Reset filters";
    if (!state.branches.size) { title = "Choose a branch to see events"; message = "Select one or more branches to browse their schedules."; button = "Select all branches"; }
    else if (rangeIssue()) { title = "Check the custom dates"; message = rangeIssue(); button = "Use this week"; }
    empty.innerHTML = "<div class='empty-icon' aria-hidden='true'>⌕</div><h3>" + escapeHtml(title) + "</h3><p>" + escapeHtml(message) + "</p><button type='button' id='emptyAction'>" + escapeHtml(button) + "</button>";
    empty.hidden = false;
    table.hidden = true;
    byId("tableFooter").hidden = true;
  }
  function renderPagination(pageCount) {
    if (pageCount < 2) { byId("pagination").innerHTML = ""; return; }
    let html = "<button class='page-button' type='button' data-page='prev' aria-label='Previous page'" + (state.page === 1 ? " disabled" : "") + ">‹</button>";
    let first = Math.max(1, state.page - 2);
    let last = Math.min(pageCount, first + 4);
    if (last - first < 4) first = Math.max(1, last - 4);
    for (let page = first; page <= last; page++) {
      html += "<button class='page-button" + (page === state.page ? " is-current" : "") + "' type='button' data-page='" + page + "' aria-label='Page " + page + "'" + (page === state.page ? " aria-current='page'" : "") + ">" + page + "</button>";
    }
    html += "<span class='page-of'>of " + pageCount + "</span><button class='page-button' type='button' data-page='next' aria-label='Next page'" + (state.page === pageCount ? " disabled" : "") + ">›</button>";
    byId("pagination").innerHTML = html;
  }
  function renderTable() {
    const filtered = filteredEvents();
    byId("resultsDescription").textContent = resultsDescription(filtered.length);
    if (!filtered.length) { renderEmpty(); return; }
    byId("emptyState").hidden = true;
    table.hidden = false;
    byId("tableFooter").hidden = false;
    const pageCount = Math.max(1, Math.ceil(filtered.length / state.pageSize));
    if (state.page > pageCount) state.page = pageCount;
    const start = (state.page - 1) * state.pageSize;
    rows.innerHTML = filtered.slice(start, start + state.pageSize).map(eventRow).join("");
    byId("rangeLabel").textContent = "Showing " + (start + 1) + "–" + Math.min(start + state.pageSize, filtered.length) + " of " + filtered.length + " events";
    renderPagination(pageCount);
  }
  function render() {
    syncControls();
    renderScope();
    quickCounts();
    renderActiveFilters();
    renderSearchFeedback();
    renderTable();
  }

  function closeBranchPanel() {
    branchPanel.hidden = true;
    branchTrigger.setAttribute("aria-expanded", "false");
  }
  function openBranchPanel() {
    branchPanel.hidden = false;
    branchTrigger.setAttribute("aria-expanded", "true");
  }
  function markManual() {
    state.page = 1;
    state.searchApplied = [];
  }
  function resetFilters() {
    state.branches = new Set(branches);
    state.timeframe = "week";
    state.status = "all";
    state.actions = new Set();
    state.sort = "latest";
    state.customStart = "";
    state.customEnd = "";
    state.searchCategory = "";
    state.searchTerms = [];
    state.searchApplied = [];
    state.searchRaw = "";
    state.page = 1;
    searchInput.value = "";
    closeBranchPanel();
    render();
  }
  function selectTimeframe(timeframe) {
    state.timeframe = timeframe;
    if (timeframe === "custom" && !state.customStart && !state.customEnd) {
      state.customStart = isoDate(weekStart);
      state.customEnd = isoDate(addDays(weekStart, 6));
    }
    markManual();
    render();
  }
  function removeChip(key) {
    markManual();
    if (key === "branches") state.branches = new Set(branches);
    if (key === "timeframe") state.timeframe = "week";
    if (key === "status") state.status = "all";
    if (key.indexOf("action:") === 0) state.actions.delete(key.slice(7));
    if (key === "search") { state.searchCategory = ""; state.searchTerms = []; state.searchRaw = ""; searchInput.value = ""; }
    render();
  }

  function applySearch(query) {
    const raw = query.trim();
    if (!raw) {
      state.searchCategory = "";
      state.searchTerms = [];
      state.searchApplied = [];
      state.searchRaw = "";
      state.page = 1;
      render();
      return;
    }
    let remaining = raw.toLowerCase();
    const tags = [];
    function consumeAny(phrases) {
      let found = false;
      phrases.forEach(function (phrase) {
        if (remaining.indexOf(phrase) !== -1) {
          remaining = remaining.split(phrase).join(" ");
          found = true;
        }
      });
      return found;
    }
    const matchedBranches = branches.filter(function (branch) {
      const found = remaining.indexOf(branch.toLowerCase()) !== -1;
      if (found) remaining = remaining.split(branch.toLowerCase()).join(" ");
      return found;
    });
    if (matchedBranches.length) {
      state.branches = new Set(matchedBranches);
      tags.push(matchedBranches.length === 1 ? matchedBranches[0] : matchedBranches.length + " branches");
    }
    if (consumeAny(["this week"])) { state.timeframe = "week"; tags.push("This week"); }
    else if (consumeAny(["next 7 days", "next seven days"])) { state.timeframe = "next7"; tags.push("Next 7 days"); }
    else if (consumeAny(["next 30 days", "next month"])) { state.timeframe = "next30"; tags.push("Next 30 days"); }
    else if (consumeAny(["past events", "previous events", "past"])) { state.timeframe = "past"; tags.push("Past events"); }
    else if (consumeAny(["all time"])) { state.timeframe = "all"; tags.push("All time"); }

    const searchedActions = [];
    if (consumeAny(["past due", "overdue"])) { searchedActions.push("overdue"); tags.push("Past due"); }
    if (consumeAny(["prepare materials", "materials to prepare"])) { searchedActions.push("materials"); tags.push("Prepare materials"); }
    if (consumeAny(["confirm details", "confirm room", "confirm speaker"])) { searchedActions.push("confirm"); tags.push("Confirm details"); }
    if (consumeAny(["follow up", "follow-up"])) { searchedActions.push("followup"); tags.push("Follow up"); }
    if (consumeAny(["needing attention", "needs attention", "need attention", "action needed", "needs action", "need action"])) { searchedActions.push("needs"); tags.push("Needs attention"); }
    if (searchedActions.length) state.actions = new Set(searchedActions);

    if (consumeAny(["happening now", "in progress"])) { state.status = "Happening"; tags.push("Happening now"); }
    else if (consumeAny(["completed", "finished"])) { state.status = "Completed"; tags.push("Completed"); }
    else if (consumeAny(["cancelled", "canceled"])) { state.status = "Cancelled"; tags.push("Cancelled"); }
    else if (consumeAny(["planning", "being planned"])) { state.status = "Planning"; tags.push("Planning"); }
    else if (consumeAny(["upcoming", "scheduled"])) { state.status = "Upcoming"; tags.push("Upcoming"); }

    state.searchCategory = "";
    if (consumeAny(["kids", "children", "childrens", "storytime", "story time", "families"])) state.searchCategory = "Kids & families";
    else if (consumeAny(["teen", "teens"])) state.searchCategory = "Teens";
    else if (consumeAny(["technology", "digital skills", "computer", "smartphone"])) state.searchCategory = "Technology";
    else if (consumeAny(["author talks", "author talk"])) state.searchCategory = "Author talk";
    else if (consumeAny(["community meetings", "community meeting"])) state.searchCategory = "Community meeting";
    if (state.searchCategory) tags.push(state.searchCategory);

    const stopwords = new Set(["show", "me", "find", "events", "event", "at", "in", "on", "for", "from", "the", "that", "which", "with", "all", "please", "need", "needing", "have", "a", "an", "are", "is", "by", "branch", "what", "about", "to", "my"]);
    state.searchTerms = Array.from(new Set(remaining.split(/[^a-z0-9]+/).filter(function (word) { return word.length > 1 && !stopwords.has(word); })));
    if (state.searchTerms.length) tags.push("Text: " + state.searchTerms.join(" "));
    state.searchApplied = tags.length ? tags : ["Matching event text"];
    state.searchRaw = raw;
    state.page = 1;
    closeBranchPanel();
    render();
  }

  buildBranchOptions();
  byId("todayLabel").textContent = formatLongDate(today);
  byId("scopeReset").addEventListener("click", function () { state.branches = new Set(branches); markManual(); render(); });
  document.querySelectorAll("[data-timeframe]").forEach(function (button) {
    button.addEventListener("click", function () { selectTimeframe(button.getAttribute("data-timeframe")); });
  });
  document.querySelector(".action-grid").addEventListener("change", function (event) {
    if (!event.target.matches(".action-checkbox")) return;
    if (event.target.checked) state.actions.add(event.target.value);
    else state.actions.delete(event.target.value);
    markManual();
    render();
  });
  byId("topResetFilters").addEventListener("click", resetFilters);
  branchTrigger.addEventListener("click", function () {
    if (branchPanel.hidden) openBranchPanel();
    else closeBranchPanel();
  });
  branchOptions.addEventListener("change", function (event) {
    if (!event.target.matches("input[type=checkbox]")) return;
    if (event.target.checked) state.branches.add(event.target.value);
    else state.branches.delete(event.target.value);
    markManual();
    render();
  });
  byId("selectAllBranches").addEventListener("click", function () { state.branches = new Set(branches); markManual(); render(); });
  byId("clearAllBranches").addEventListener("click", function () { state.branches = new Set(); markManual(); render(); });
  byId("timeframeSelect").addEventListener("change", function (event) {
    selectTimeframe(event.target.value);
  });
  byId("startDate").addEventListener("change", function (event) { state.customStart = event.target.value; markManual(); render(); });
  byId("endDate").addEventListener("change", function (event) { state.customEnd = event.target.value; markManual(); render(); });
  byId("statusSelect").addEventListener("change", function (event) { state.status = event.target.value; markManual(); render(); });
  byId("sortSelect").addEventListener("change", function (event) { state.sort = event.target.value; markManual(); render(); });
  byId("activeFilterRow").addEventListener("click", function (event) {
    const button = event.target.closest("[data-remove]");
    if (button) removeChip(button.getAttribute("data-remove"));
  });
  byId("searchForm").addEventListener("submit", function (event) { event.preventDefault(); applySearch(searchInput.value); });
  searchInput.addEventListener("search", function () {
    if (searchInput.value) return;
    state.searchCategory = ""; state.searchTerms = []; state.searchApplied = []; state.searchRaw = ""; state.page = 1; render();
  });
  byId("searchFeedback").addEventListener("click", function (event) {
    if (event.target.closest("[data-reset-search]")) resetFilters();
  });
  byId("pagination").addEventListener("click", function (event) {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    const target = button.getAttribute("data-page");
    const last = Math.max(1, Math.ceil(filteredEvents().length / state.pageSize));
    if (target === "prev") state.page = Math.max(1, state.page - 1);
    else if (target === "next") state.page = Math.min(last, state.page + 1);
    else state.page = Number(target);
    renderTable();
    byId("resultsTitle").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  byId("emptyState").addEventListener("click", function (event) {
    if (!event.target.closest("#emptyAction")) return;
    if (!state.branches.size) { state.branches = new Set(branches); render(); }
    else if (rangeIssue()) { state.timeframe = "week"; render(); }
    else resetFilters();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") { closeBranchPanel(); return; }
    const target = event.target;
    const typing = target && (target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName));
    if (!typing && (event.key === "/" || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"))) {
      event.preventDefault();
      searchInput.focus();
    }
  });
  render();
}());
