(() => {
  "use strict";

  const API = "https://en.wikipedia.org/w/api.php";
  const MAIN_PAGE = "2026_FIFA_World_Cup";
  const KNOCKOUT_PAGE = "2026_FIFA_World_Cup_knockout_stage";
  const PUBLIC_URL = "https://ericshen07.github.io/world-cup-2026-live/";
  const GROUPS = "ABCDEFGHIJKL".split("");
  const TEAM_ZH = {
    Algeria: "阿尔及利亚",
    Argentina: "阿根廷",
    Australia: "澳大利亚",
    Austria: "奥地利",
    Belgium: "比利时",
    "Bosnia and Herzegovina": "波黑",
    Brazil: "巴西",
    Canada: "加拿大",
    "Cape Verde": "佛得角",
    Colombia: "哥伦比亚",
    Croatia: "克罗地亚",
    "Czech Republic": "捷克",
    "Curaçao": "库拉索",
    "DR Congo": "刚果民主共和国",
    Ecuador: "厄瓜多尔",
    Egypt: "埃及",
    England: "英格兰",
    France: "法国",
    Germany: "德国",
    Ghana: "加纳",
    Haiti: "海地",
    Iran: "伊朗",
    Iraq: "伊拉克",
    "Ivory Coast": "科特迪瓦",
    Japan: "日本",
    Jordan: "约旦",
    Mexico: "墨西哥",
    Morocco: "摩洛哥",
    Netherlands: "荷兰",
    "New Zealand": "新西兰",
    Norway: "挪威",
    Panama: "巴拿马",
    Paraguay: "巴拉圭",
    Portugal: "葡萄牙",
    Qatar: "卡塔尔",
    "Saudi Arabia": "沙特阿拉伯",
    Scotland: "苏格兰",
    Senegal: "塞内加尔",
    "South Africa": "南非",
    "South Korea": "韩国",
    Spain: "西班牙",
    Sweden: "瑞典",
    Switzerland: "瑞士",
    Tunisia: "突尼斯",
    Turkey: "土耳其",
    "United States": "美国",
    Uruguay: "乌拉圭",
    Uzbekistan: "乌兹别克斯坦",
  };
  const THIRD_SLOTS = ["1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L"];
  const THIRD_ALLOWED = {
    "1A": "C/E/F/H/I",
    "1B": "E/F/G/I/J",
    "1D": "B/I",
    "1E": "A/B/C/D/F",
    "1G": "A/H/I/J",
    "1I": "C/D/F/G/H",
    "1K": "D/E/I/J/L",
    "1L": "E/H/I/J/K",
  };

  const ROUND32 = [
    { match: 73, home: runner("A"), away: runner("B") },
    { match: 76, home: winner("C"), away: runner("F") },
    { match: 74, home: winner("E"), away: third("1E") },
    { match: 75, home: winner("F"), away: runner("C") },
    { match: 78, home: runner("E"), away: runner("I") },
    { match: 77, home: winner("I"), away: third("1I") },
    { match: 79, home: winner("A"), away: third("1A") },
    { match: 80, home: winner("L"), away: third("1L") },
    { match: 82, home: winner("G"), away: third("1G") },
    { match: 81, home: winner("D"), away: third("1D") },
    { match: 84, home: winner("H"), away: runner("J") },
    { match: 83, home: runner("K"), away: runner("L") },
    { match: 85, home: winner("B"), away: third("1B") },
    { match: 88, home: runner("D"), away: runner("G") },
    { match: 86, home: winner("J"), away: runner("H") },
    { match: 87, home: winner("K"), away: third("1K") },
  ];

  const ROUNDS = [
    { name: "32 强", matches: ROUND32 },
    {
      name: "16 强",
      matches: [
        { match: 90, home: matchWinner(73), away: matchWinner(75) },
        { match: 89, home: matchWinner(74), away: matchWinner(77) },
        { match: 91, home: matchWinner(76), away: matchWinner(78) },
        { match: 92, home: matchWinner(79), away: matchWinner(80) },
        { match: 93, home: matchWinner(83), away: matchWinner(84) },
        { match: 94, home: matchWinner(81), away: matchWinner(82) },
        { match: 95, home: matchWinner(86), away: matchWinner(88) },
        { match: 96, home: matchWinner(85), away: matchWinner(87) },
      ],
    },
    {
      name: "四分之一决赛",
      matches: [
        { match: 97, home: matchWinner(89), away: matchWinner(90) },
        { match: 98, home: matchWinner(93), away: matchWinner(94) },
        { match: 99, home: matchWinner(91), away: matchWinner(92) },
        { match: 100, home: matchWinner(95), away: matchWinner(96) },
      ],
    },
    {
      name: "半决赛",
      matches: [
        { match: 101, home: matchWinner(97), away: matchWinner(98) },
        { match: 102, home: matchWinner(99), away: matchWinner(100) },
      ],
    },
    {
      name: "季军赛",
      matches: [{ match: 103, home: matchLoser(101), away: matchLoser(102) }],
    },
    {
      name: "决赛",
      matches: [{ match: 104, home: matchWinner(101), away: matchWinner(102) }],
    },
  ];

  const EVENT_ORDER = [
    73, 76, 74, 75, 78, 77, 79, 80, 82, 81, 84, 83, 85, 88, 86, 87, 90, 89,
    91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104,
  ];

  const state = {
    timer: null,
    refreshMs: 120000,
    data: null,
  };

  const el = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    [
      "refreshBtn",
      "autoRefresh",
      "refreshInterval",
      "copyLinkBtn",
      "qrBtn",
      "sharePanel",
      "shareUrl",
      "qrImage",
      "copyShareBtn",
      "closeShareBtn",
      "loadState",
      "revisionState",
      "comboState",
      "completeState",
      "matrixState",
      "notice",
      "round32",
      "thirdRanking",
      "bracket",
      "groups",
    ].forEach((id) => {
      el[id] = document.getElementById(id);
    });

    el.refreshBtn.addEventListener("click", () => loadData());
    el.autoRefresh.addEventListener("change", scheduleRefresh);
    el.refreshInterval.addEventListener("change", () => {
      state.refreshMs = Number(el.refreshInterval.value);
      scheduleRefresh();
    });
    el.copyLinkBtn.addEventListener("click", copyShareLink);
    el.qrBtn.addEventListener("click", () => toggleSharePanel(true));
    el.copyShareBtn.addEventListener("click", copyShareLink);
    el.closeShareBtn.addEventListener("click", () => toggleSharePanel(false));

    renderSkeleton();
    hydrateSharePanel();
    loadData();
    scheduleRefresh();
  }

  function winner(group) {
    return { type: "group", group, position: 1 };
  }

  function runner(group) {
    return { type: "group", group, position: 2 };
  }

  function third(slot) {
    return { type: "third", slot };
  }

  function matchWinner(match) {
    return { type: "match", result: "winner", match };
  }

  function matchLoser(match) {
    return { type: "match", result: "loser", match };
  }

  function scheduleRefresh() {
    clearInterval(state.timer);
    state.timer = null;
    if (el.autoRefresh.checked) {
      state.timer = setInterval(loadData, state.refreshMs);
    }
  }

  function getShareUrl() {
    if (window.location.protocol === "file:") return PUBLIC_URL;
    return window.location.href.split("#")[0];
  }

  function hydrateSharePanel() {
    const url = getShareUrl();
    el.shareUrl.value = url;
    el.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=164x164&margin=8&data=${encodeURIComponent(url)}`;
  }

  function toggleSharePanel(show) {
    hydrateSharePanel();
    el.sharePanel.hidden = !show;
  }

  async function copyShareLink() {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    hydrateSharePanel();
    setNotice("分享链接已复制。");
  }

  async function loadData() {
    el.refreshBtn.disabled = true;
    setNotice("正在从 Wikipedia API 更新数据...");
    el.loadState.textContent = "更新中";

    try {
      const [main, knockout] = await Promise.all([
        fetchParsedPage(MAIN_PAGE),
        fetchParsedPage(KNOCKOUT_PAGE),
      ]);
      const data = buildData(main, knockout);
      state.data = data;
      renderData(data);
    } catch (error) {
      console.error(error);
      el.loadState.textContent = "更新失败";
      setNotice(`数据更新失败：${error.message}`, true);
    } finally {
      el.refreshBtn.disabled = false;
    }
  }

  async function fetchParsedPage(page) {
    const params = new URLSearchParams({
      action: "parse",
      page,
      prop: "text|revid|sections",
      format: "json",
      origin: "*",
      disableeditsection: "1",
      _: String(Date.now()),
    });
    const response = await fetch(`${API}?${params.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`${page} HTTP ${response.status}`);
    }
    const json = await response.json();
    if (json.error) {
      throw new Error(`${page}: ${json.error.info || json.error.code}`);
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(json.parse.text["*"], "text/html");
    return {
      title: json.parse.title,
      revid: json.parse.revid,
      sections: json.parse.sections || [],
      doc,
    };
  }

  function buildData(main, knockout) {
    const groups = parseGroups(main.doc);
    const thirdRanking = parseThirdRanking(main.doc, groups);
    const thirdByGroup = Object.fromEntries(
      thirdRanking.map((entry) => [entry.group, entry]),
    );
    const matrix = parseThirdMatrix(knockout.doc);
    const comboGroups = thirdRanking
      .slice(0, 8)
      .map((entry) => entry.group)
      .filter(Boolean);
    const comboKey = comboGroups.slice().sort().join("");
    const matrixRow = matrix.byCombo.get(comboKey) || null;
    const events = parseKnockoutEvents(knockout.doc);
    const completeGroups = GROUPS.filter((group) => groups[group]?.complete);

    return {
      fetchedAt: new Date(),
      source: {
        mainRevision: main.revid,
        knockoutRevision: knockout.revid,
      },
      groups,
      completeGroups,
      allGroupsComplete: completeGroups.length === 12,
      thirdRanking,
      thirdByGroup,
      comboGroups,
      comboKey,
      matrix,
      matrixRow,
      events,
    };
  }

  function parseGroups(doc) {
    const tables = Array.from(doc.querySelectorAll("table"));
    const standings = tables.filter(isGroupStandingTable);
    if (standings.length < 12) {
      throw new Error(`只找到 ${standings.length} 个小组积分表，页面结构可能变化`);
    }

    return Object.fromEntries(
      GROUPS.map((group, index) => [group, parseGroupTable(standings[index], group)]),
    );
  }

  function isGroupStandingTable(table) {
    const headers = Array.from(table.querySelectorAll("tr:first-child th")).map(
      cleanText,
    );
    const joined = headers.join("|");
    return (
      headers.includes("Pos") &&
      headers.some((header) => header.startsWith("Team")) &&
      headers.includes("Pld") &&
      headers.includes("Pts") &&
      !joined.includes("Grp")
    );
  }

  function parseGroupTable(table, group) {
    const teams = Array.from(table.rows)
      .slice(1)
      .map((row) => {
        const cells = Array.from(row.cells);
        if (cells.length < 10) return null;
        const position = parseInteger(cells[0]);
        if (!position || position < 1 || position > 4) return null;
        const team = extractTeam(cells[1]);
        return {
          position,
          group,
          team,
          pld: parseInteger(cells[2]),
          w: parseInteger(cells[3]),
          d: parseInteger(cells[4]),
          l: parseInteger(cells[5]),
          gf: parseInteger(cells[6]),
          ga: parseInteger(cells[7]),
          gd: parseSigned(cells[8]),
          gdText: cleanText(cells[8]),
          pts: parseInteger(cells[9]),
          qualification: cleanText(cells[10] || ""),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);

    return {
      group,
      teams,
      complete: teams.length === 4 && teams.every((team) => team.pld >= 3),
      started: teams.some((team) => team.pld > 0),
    };
  }

  function parseThirdRanking(doc, groups) {
    const table = Array.from(doc.querySelectorAll("table")).find(isThirdTable);
    if (!table) {
      return fallbackThirdRanking(groups);
    }

    const rows = Array.from(table.rows)
      .slice(1)
      .map((row) => {
        const cells = Array.from(row.cells);
        if (cells.length < 11) return null;
        const rank = parseInteger(cells[0]);
        const group = cleanText(cells[1]).match(/[A-L]/)?.[0] || "";
        if (!rank || !group) return null;
        const team = extractTeam(cells[2]);
        return {
          source: "wikipedia-third-table",
          rank,
          group,
          team,
          pld: parseInteger(cells[3]),
          w: parseInteger(cells[4]),
          d: parseInteger(cells[5]),
          l: parseInteger(cells[6]),
          gf: parseInteger(cells[7]),
          ga: parseInteger(cells[8]),
          gd: parseSigned(cells[9]),
          gdText: cleanText(cells[9]),
          pts: parseInteger(cells[10]),
          qualification: cleanText(cells[11] || ""),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.rank - b.rank);

    if (rows.length < 8) {
      throw new Error("小组第三排名表不足 8 行，无法生成 32 强投影");
    }
    return rows;
  }

  function isThirdTable(table) {
    const headers = Array.from(table.querySelectorAll("tr:first-child th")).map(
      cleanText,
    );
    return (
      headers.includes("Pos") &&
      headers.includes("Grp") &&
      headers.some((header) => header.startsWith("Team")) &&
      headers.includes("Pts")
    );
  }

  function fallbackThirdRanking(groups) {
    return GROUPS.map((group) => groups[group]?.teams?.find((team) => team.position === 3))
      .filter(Boolean)
      .sort(
        (a, b) =>
          b.pts - a.pts ||
          b.gd - a.gd ||
          b.gf - a.gf ||
          a.group.localeCompare(b.group),
      )
      .map((team, index) => ({
        source: "computed-basic",
        rank: index + 1,
        group: team.group,
        team: team.team,
        pld: team.pld,
        w: team.w,
        d: team.d,
        l: team.l,
        gf: team.gf,
        ga: team.ga,
        gd: team.gd,
        gdText: team.gdText,
        pts: team.pts,
        qualification: "",
      }));
  }

  function parseThirdMatrix(doc) {
    const table = Array.from(doc.querySelectorAll("table")).find((candidate) =>
      cleanText(candidate.caption || candidate).includes(
        "Combinations of matches in the round of 32",
      ),
    );
    if (!table) {
      throw new Error("未找到第三名分配矩阵");
    }

    const rows = [];
    const byCombo = new Map();
    Array.from(table.rows)
      .slice(1)
      .forEach((row) => {
        const cells = Array.from(row.cells);
        const texts = cells.map(cleanText);
        const no = parseInteger(texts[0]);
        if (!no) return;

        const advancing = texts
          .slice(1, 13)
          .filter((text) => /^[A-L]$/.test(text));
        const mapTexts = texts.filter((text) => /^3[A-L]$/.test(text)).slice(-8);
        if (advancing.length !== 8 || mapTexts.length !== 8) return;

        const slots = Object.fromEntries(
          THIRD_SLOTS.map((slot, index) => [slot, mapTexts[index].slice(1)]),
        );
        const entry = {
          no,
          comboKey: advancing.slice().sort().join(""),
          advancing,
          stillPossible:
            texts.find((text) => text === "Yes" || text === "No") || "Unknown",
          slots,
        };
        rows.push(entry);
        byCombo.set(entry.comboKey, entry);
      });

    if (rows.length < 400) {
      throw new Error(`第三名分配矩阵只解析到 ${rows.length} 行`);
    }
    return { rows, byCombo };
  }

  function parseKnockoutEvents(doc) {
    const tables = Array.from(doc.querySelectorAll("table.fevent"));
    const events = {};
    tables.forEach((table, index) => {
      const scoreText = cleanText(table.querySelector(".fscore"));
      const visibleMatch = scoreText.match(/Match\s+(\d+)/i);
      const match = visibleMatch ? Number(visibleMatch[1]) : EVENT_ORDER[index];
      if (!match) return;
      const score = visibleMatch ? "" : scoreText;
      events[match] = {
        match,
        score,
        rawScore: scoreText,
        home: extractTeam(table.querySelector(".fhome")),
        away: extractTeam(table.querySelector(".faway")),
      };
    });
    return events;
  }

  function extractTeam(cell) {
    if (!cell) {
      return { name: "", flag: "", status: [] };
    }
    const links = Array.from(cell.querySelectorAll("a")).filter((link) =>
      cleanText(link),
    );
    const teamLink =
      links.find((link) => {
        const href = link.getAttribute("href") || "";
        const title = link.getAttribute("title") || "";
        return /national|soccer_team|football_team/i.test(href + " " + title);
      }) || links[0];
    const rawName = teamLink ? cleanText(teamLink) : cleanText(cell);
    const name = cleanTeamName(rawName);
    const fullText = cleanText(cell);
    return {
      name,
      nameZh: localizeTeam(name),
      flag: extractFlag(cell),
      status: extractStatus(fullText),
    };
  }

  function extractFlag(cell) {
    const img = cell?.querySelector("img");
    if (!img) return "";
    const src = img.getAttribute("src") || "";
    if (src.startsWith("//")) return `https:${src}`;
    if (src.startsWith("/")) return `https://en.wikipedia.org${src}`;
    return src;
  }

  function extractStatus(text) {
    const match = text.match(/\(([^)]{1,10})\)\s*$/);
    if (!match) return [];
    const codes = match[1].split(",").map((code) => code.trim());
    return codes.every((code) => ["H", "A", "E"].includes(code)) ? codes : [];
  }

  function cleanTeamName(name) {
    return normalizeText(name).replace(/\s*\((?:H|A|E)(?:,\s*(?:H|A|E))*\)\s*$/, "");
  }

  function localizeTeam(name) {
    return TEAM_ZH[name] || "";
  }

  function cleanText(input) {
    if (!input) return "";
    if (typeof input === "string") return normalizeText(input);
    const clone = input.cloneNode(true);
    clone
      .querySelectorAll("style,script,sup,.reference,.sortkey,.navbar")
      .forEach((node) => node.remove());
    return normalizeText(clone.textContent || "");
  }

  function normalizeText(text) {
    return String(text)
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+v t e$/i, "")
      .trim();
  }

  function parseInteger(input) {
    const text = typeof input === "string" ? input : cleanText(input);
    const match = text.replace(/\u2212/g, "-").match(/-?\d+/);
    return match ? Number(match[0]) : 0;
  }

  function parseSigned(input) {
    const text = typeof input === "string" ? input : cleanText(input);
    const clean = text.replace(/\u2212/g, "-").replace(/^\+/, "");
    const number = Number(clean);
    return Number.isFinite(number) ? number : 0;
  }

  function renderSkeleton() {
    el.round32.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
    el.thirdRanking.innerHTML = '<div class="skeleton"></div>';
    el.bracket.innerHTML = '<div class="skeleton"></div>';
    el.groups.innerHTML = '<div class="skeleton"></div>';
  }

  function renderData(data) {
    el.loadState.textContent = `已更新 ${formatTime(data.fetchedAt)}`;
    el.revisionState.textContent = `总 ${data.source.mainRevision} / KO ${data.source.knockoutRevision}`;
    el.comboState.textContent = data.comboKey ? data.comboKey.split("").join(" ") : "--";
    el.completeState.textContent = `${data.completeGroups.length}/12`;

    if (data.matrixRow) {
      const possible =
        data.matrixRow.stillPossible === "No" ? "源表标注不可最终成形" : "源表标注仍可能";
      el.matrixState.textContent = `矩阵 No. ${data.matrixRow.no} · ${possible}`;
      el.matrixState.className =
        data.matrixRow.stillPossible === "No" ? "badge warn" : "badge qualify";
    } else {
      el.matrixState.textContent = "当前组合未匹配矩阵";
      el.matrixState.className = "badge out";
    }

    const usingFallback = data.thirdRanking.some(
      (entry) => entry.source === "computed-basic",
    );
    if (usingFallback) {
      setNotice(
        "Wikipedia 第三名专表未解析到，当前使用积分/净胜球/进球数基础排序，需等待源表恢复。",
        true,
      );
    } else if (!data.allGroupsComplete) {
      setNotice("部分小组尚未完赛；带“当前”的队名和第三名组合是即时投影。");
    } else {
      setNotice("小组赛已完赛；32 强对阵按源数据和第三名分配矩阵生成。");
    }

    el.round32.innerHTML = ROUND32.map((match) =>
      renderMatchCard(resolveMatch(match, "32 强", data), data),
    ).join("");
    el.thirdRanking.innerHTML = renderThirdRanking(data);
    el.bracket.innerHTML = renderBracket(data);
    el.groups.innerHTML = renderGroups(data);
  }

  function setNotice(message, isError = false) {
    el.notice.textContent = message;
    el.notice.className = isError ? "notice error" : "notice";
  }

  function resolveMatch(matchDef, round, data) {
    let home = resolveSlot(matchDef.home, data);
    let away = resolveSlot(matchDef.away, data);
    const event = data.events[matchDef.match];

    if (event) {
      if (event.score) {
        home = event.home.name ? { ...event.home, source: "淘汰赛页" } : home;
        away = event.away.name ? { ...event.away, source: "淘汰赛页" } : away;
      } else {
        if (isPlaceholder(home.name) && !isPlaceholder(event.home.name)) {
          home = { ...event.home, source: "淘汰赛页" };
        }
        if (isPlaceholder(away.name) && !isPlaceholder(event.away.name)) {
          away = { ...event.away, source: "淘汰赛页" };
        }
      }
    }

    return {
      match: matchDef.match,
      round,
      home,
      away,
      score: event?.score || "",
    };
  }

  function resolveSlot(slot, data) {
    if (slot.type === "group") {
      const group = data.groups[slot.group];
      const row = group?.teams?.find((team) => team.position === slot.position);
      const label = `${slot.position}${slot.group}`;
      return {
        name: row?.team?.name || `${slot.group}组第${slot.position}`,
        nameZh: row?.team?.nameZh || "",
        flag: row?.team?.flag || "",
        source: label,
        slot: label,
        provisional: !group?.complete,
      };
    }

    if (slot.type === "third") {
      const mappedGroup = data.matrixRow?.slots?.[slot.slot];
      if (mappedGroup) {
        const entry = data.thirdByGroup[mappedGroup] || thirdFromGroup(data, mappedGroup);
        return {
          name: entry?.team?.name || `${mappedGroup}组第3`,
          nameZh: entry?.team?.nameZh || "",
          flag: entry?.team?.flag || "",
          source: `${mappedGroup}组第3`,
          slot: `3${mappedGroup}`,
          provisional: !data.allGroupsComplete,
        };
      }
      return {
        name: `第3名 ${THIRD_ALLOWED[slot.slot] || ""}`,
        flag: "",
        source: "待组合确定",
        slot: slot.slot,
        provisional: true,
      };
    }

    if (slot.type === "match") {
      const prefix = slot.result === "winner" ? "胜者" : "负者";
      return {
        name: `${prefix} M${slot.match}`,
        flag: "",
        source: `M${slot.match}`,
        slot: `${slot.result === "winner" ? "W" : "L"}${slot.match}`,
        provisional: true,
      };
    }

    return { name: "待定", flag: "", source: "", slot: "", provisional: true };
  }

  function thirdFromGroup(data, group) {
    const row = data.groups[group]?.teams?.find((team) => team.position === 3);
    if (!row) return null;
    return {
      group,
      team: row.team,
      pld: row.pld,
      pts: row.pts,
      gd: row.gd,
      gdText: row.gdText,
      gf: row.gf,
    };
  }

  function isPlaceholder(name) {
    return /^(胜者|负者|第3名|待定|[A-L]组第|Winner|Runner-up|Loser|3rd)/i.test(
      name || "",
    );
  }

  function renderMatchCard(match, data) {
    const score = match.score ? `<span class="score">${esc(match.score)}</span>` : "";
    return `
      <article class="match-card">
        <div class="match-head">
          <span class="match-number">M${match.match}</span>
          <span>${esc(match.round)}</span>
          ${score}
        </div>
        ${renderTeamRow(match.home, data)}
        ${renderTeamRow(match.away, data)}
      </article>
    `;
  }

  function renderPathMatchCard(matchDef, round, data) {
    const match = resolveMatch(matchDef, round.name, data);
    const winnerTarget = nextMatchFor(match.match, "winner");
    const loserTarget = nextMatchFor(match.match, "loser");
    const destinations = [];
    if (winnerTarget) destinations.push(`胜者 → M${winnerTarget}`);
    if (loserTarget) destinations.push(`负者 → M${loserTarget}`);
    if (!winnerTarget && match.match === 104) destinations.push("胜者 = 世界冠军");
    const score = match.score ? `<span class="score">${esc(match.score)}</span>` : "";

    return `
      <article class="match-card path-card ${winnerTarget ? "has-next" : ""}">
        <div class="match-head">
          <span class="match-number">M${match.match}</span>
          <span>${esc(round.name)}</span>
          ${score}
        </div>
        ${renderTeamRow(match.home, data)}
        ${renderTeamRow(match.away, data)}
        <div class="path-footer">${esc(destinations.join(" · "))}</div>
      </article>
    `;
  }

  function nextMatchFor(matchNo, result) {
    for (const round of ROUNDS) {
      for (const match of round.matches) {
        if (slotReferencesMatch(match.home, matchNo, result)) return match.match;
        if (slotReferencesMatch(match.away, matchNo, result)) return match.match;
      }
    }
    return null;
  }

  function slotReferencesMatch(slot, matchNo, result) {
    return slot?.type === "match" && slot.match === matchNo && slot.result === result;
  }

  function renderTeamRow(team, data) {
    const tagClass = team.provisional ? "slot warn" : "slot qualify";
    const tagText = team.provisional && !data.allGroupsComplete ? "当前" : esc(team.slot || team.source);
    const primary = displayTeamName(team);
    const secondary = team.nameZh
      ? [team.name, team.source].filter(Boolean).join(" · ")
      : team.source || "";
    return `
      <div class="team-row">
        ${flagHtml(team.flag, primary)}
        <div>
          <div class="team-name" title="${attr(team.name || primary)}">${esc(primary)}</div>
          <div class="team-sub">${esc(secondary)}</div>
        </div>
        <span class="${tagClass}">${tagText}</span>
      </div>
    `;
  }

  function renderThirdRanking(data) {
    const rows = data.thirdRanking
      .map((entry) => {
        const qualified = entry.rank <= 8;
        const status = data.allGroupsComplete
          ? qualified
            ? "晋级"
            : "淘汰"
          : qualified
            ? "晋级区"
            : "淘汰区";
        return `
          <tr class="${qualified ? "rank-in" : "rank-risk"}">
            <td class="num">${entry.rank}</td>
            <td>${esc(entry.group)}</td>
            <td>${teamCell(entry.team)}</td>
            <td class="num">${entry.pld}</td>
            <td class="num">${entry.pts}</td>
            <td class="num">${esc(entry.gdText)}</td>
            <td class="num">${entry.gf}</td>
            <td><span class="badge ${qualified ? "qualify" : "out"}">${status}</span></td>
          </tr>
        `;
      })
      .join("");

    return `
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>组</th>
            <th>球队</th>
            <th class="num">Pld</th>
            <th class="num">Pts</th>
            <th class="num">GD</th>
            <th class="num">GF</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderBracket(data) {
    return ROUNDS.map((round, index) => {
      const matches = round.matches
        .map((match) => renderPathMatchCard(match, round, data))
        .join("");
      return `
        <div class="round-column" data-round="${index}">
          <div class="round-title">
            <span>${esc(round.name)}</span>
            <small>${round.matches.length} 场</small>
          </div>
          ${matches}
        </div>
      `;
    }).join("");
  }

  function renderGroups(data) {
    return GROUPS.map((group) => {
      const table = data.groups[group];
      const thirdEntry = data.thirdByGroup[group];
      const rows = table.teams
        .map((row) => {
          const topTwo = row.position <= 2;
          const thirdIn = row.position === 3 && thirdEntry?.rank <= 8;
          const rowClass = topTwo || thirdIn ? "rank-in" : row.position === 4 ? "rank-risk" : "";
          return `
            <tr class="${rowClass}">
              <td class="num">${row.position}</td>
              <td>${teamCell(row.team)}</td>
              <td class="num">${row.pld}</td>
              <td class="num">${row.pts}</td>
              <td class="num">${esc(row.gdText)}</td>
              <td class="num">${row.gf}</td>
            </tr>
          `;
        })
        .join("");
      return `
        <article class="group-card">
          <div class="group-title">
            <h3>Group ${group}</h3>
            <span class="badge ${table.complete ? "qualify" : "warn"}">${table.complete ? "已完赛" : "进行中"}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Team</th>
                <th class="num">Pld</th>
                <th class="num">Pts</th>
                <th class="num">GD</th>
                <th class="num">GF</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </article>
      `;
    }).join("");
  }

  function teamCell(team) {
    return `
      <span class="team-cell">
        ${flagHtml(team.flag, displayTeamName(team))}
        <span class="team-cell-label">
          <span>${esc(displayTeamName(team))}</span>
          ${team.nameZh ? `<small>${esc(team.name)}</small>` : ""}
        </span>
      </span>
    `;
  }

  function displayTeamName(team) {
    return team?.nameZh || team?.name || "待定";
  }

  function flagHtml(url, name) {
    if (!url) return '<span class="flag-empty" aria-hidden="true"></span>';
    return `<img class="flag" src="${attr(url)}" alt="${attr(name)} flag" loading="lazy" referrerpolicy="no-referrer" />`;
  }

  function formatTime(date) {
    return date.toLocaleString("zh-CN", {
      hour12: false,
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function attr(value) {
    return esc(value);
  }
})();
