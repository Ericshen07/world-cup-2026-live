(() => {
  "use strict";

  const API = "https://en.wikipedia.org/w/api.php";
  const MAIN_PAGE = "2026_FIFA_World_Cup";
  const KNOCKOUT_PAGE = "2026_FIFA_World_Cup_knockout_stage";
  const PUBLIC_URL = "https://ericshen07.github.io/world-cup-2026-live/";
  const FETCH_TIMEOUT_MS = 8000;
  const SNAPSHOT_FILES = {
    [MAIN_PAGE]: "./data/wiki_main_parse.json",
    [KNOCKOUT_PAGE]: "./data/wiki_knockout_parse.json",
  };
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

  const BRACKET_LAYOUT = [
    { match: 73, col: 1, row: 1, span: 1 },
    { match: 75, col: 1, row: 2, span: 1 },
    { match: 74, col: 1, row: 3, span: 1 },
    { match: 77, col: 1, row: 4, span: 1 },
    { match: 83, col: 1, row: 5, span: 1 },
    { match: 84, col: 1, row: 6, span: 1 },
    { match: 81, col: 1, row: 7, span: 1 },
    { match: 82, col: 1, row: 8, span: 1 },
    { match: 76, col: 1, row: 9, span: 1 },
    { match: 78, col: 1, row: 10, span: 1 },
    { match: 79, col: 1, row: 11, span: 1 },
    { match: 80, col: 1, row: 12, span: 1 },
    { match: 86, col: 1, row: 13, span: 1 },
    { match: 88, col: 1, row: 14, span: 1 },
    { match: 85, col: 1, row: 15, span: 1 },
    { match: 87, col: 1, row: 16, span: 1 },
    { match: 90, col: 2, row: 1, span: 2 },
    { match: 89, col: 2, row: 3, span: 2 },
    { match: 93, col: 2, row: 5, span: 2 },
    { match: 94, col: 2, row: 7, span: 2 },
    { match: 91, col: 2, row: 9, span: 2 },
    { match: 92, col: 2, row: 11, span: 2 },
    { match: 95, col: 2, row: 13, span: 2 },
    { match: 96, col: 2, row: 15, span: 2 },
    { match: 97, col: 3, row: 1, span: 4 },
    { match: 98, col: 3, row: 5, span: 4 },
    { match: 99, col: 3, row: 9, span: 4 },
    { match: 100, col: 3, row: 13, span: 4 },
    { match: 101, col: 4, row: 1, span: 8 },
    { match: 102, col: 4, row: 9, span: 8 },
    { match: 104, col: 5, row: 1, span: 16 },
  ];

  const state = {
    timer: null,
    refreshMs: 3600000,
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
    window.addEventListener("resize", () => requestAnimationFrame(drawBracketLines));

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
      const forceSnapshot = new URLSearchParams(window.location.search).has("snapshot");
      const [main, knockout] = forceSnapshot
        ? await fetchSnapshotPages()
        : await fetchLivePages();
      const data = buildData(main, knockout);
      data.sourceMode = forceSnapshot ? "snapshot" : "live";
      state.data = data;
      renderData(data);
    } catch (liveError) {
      console.warn("Live data failed, trying bundled snapshot.", liveError);
      try {
        setNotice("实时 Wikipedia API 暂不可用，正在读取内置快照...");
        const [main, knockout] = await fetchSnapshotPages();
        const data = buildData(main, knockout);
        data.sourceMode = "snapshot";
        data.sourceError = liveError.message;
        state.data = data;
        renderData(data);
      } catch (snapshotError) {
        console.error(snapshotError);
        el.loadState.textContent = "更新失败";
        setNotice(`数据更新失败：${snapshotError.message}`, true);
      }
    } finally {
      el.refreshBtn.disabled = false;
    }
  }

  function fetchLivePages() {
    return Promise.all([
      fetchParsedPage(MAIN_PAGE),
      fetchParsedPage(KNOCKOUT_PAGE),
    ]);
  }

  function fetchSnapshotPages() {
    return Promise.all([
      fetchParsedPage(MAIN_PAGE, SNAPSHOT_FILES[MAIN_PAGE]),
      fetchParsedPage(KNOCKOUT_PAGE, SNAPSHOT_FILES[KNOCKOUT_PAGE]),
    ]);
  }

  async function fetchParsedPage(page, snapshotUrl = "") {
    const params = new URLSearchParams({
      action: "parse",
      page,
      prop: "text|revid|sections",
      format: "json",
      origin: "*",
      disableeditsection: "1",
      _: String(Date.now()),
    });
    const url = snapshotUrl || `${API}?${params.toString()}`;
    const response = await fetchWithTimeout(url, page, {
      cache: snapshotUrl ? "reload" : "no-store",
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

  async function fetchWithTimeout(url, label, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error(`${label} 请求超过 ${FETCH_TIMEOUT_MS / 1000} 秒`);
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function buildData(main, knockout) {
    const groups = parseGroups(main.doc);
    const thirdRanking = parseThirdRanking(main.doc, groups);
    const qualifiedSlots = parseQualifiedSlots(main.doc);
    annotateThirdSafety(thirdRanking, groups, qualifiedSlots);
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
      qualifiedSlots,
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
    const standings = [];
    for (let i = 0; i < tables.length && standings.length < 12; i += 1) {
      if (!isGroupStandingTable(tables[i])) continue;
      const fixtures = [];
      for (let j = i + 1; j < tables.length && fixtures.length < 6; j += 1) {
        if (isGroupStandingTable(tables[j]) || isThirdTable(tables[j])) break;
        if (tables[j].classList.contains("fevent")) {
          fixtures.push(parseGroupFixture(tables[j]));
        }
      }
      standings.push({ table: tables[i], fixtures });
    }

    if (standings.length < 12) {
      throw new Error(`只找到 ${standings.length} 个小组积分表，页面结构可能变化`);
    }

    return Object.fromEntries(
      GROUPS.map((group, index) => [
        group,
        parseGroupTable(standings[index].table, group, standings[index].fixtures),
      ]),
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

  function parseGroupTable(table, group, fixtures = []) {
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
      fixtures,
      complete: teams.length === 4 && teams.every((team) => team.pld >= 3),
      started: teams.some((team) => team.pld > 0),
    };
  }

  function parseGroupFixture(table) {
    const scoreText = cleanText(table.querySelector(".fscore"));
    const scoreMatch = scoreText
      .replace(/\u2212/g, "-")
      .match(/(\d+)\s*[–-]\s*(\d+)/);
    return {
      home: cleanTeamName(extractTeam(table.querySelector(".fhome")).name),
      away: cleanTeamName(extractTeam(table.querySelector(".faway")).name),
      scoreText,
      played: Boolean(scoreMatch),
      homeGoals: scoreMatch ? Number(scoreMatch[1]) : null,
      awayGoals: scoreMatch ? Number(scoreMatch[2]) : null,
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

  function parseQualifiedSlots(doc) {
    const table = Array.from(doc.querySelectorAll("table")).find((candidate) => {
      const headers = Array.from(candidate.querySelectorAll("tr:first-child th")).map(
        cleanText,
      );
      return (
        headers.includes("Group") &&
        headers.includes("Winners") &&
        headers.includes("Runners-up") &&
        headers.some((header) => header.includes("Third-placed teams"))
      );
    });

    const slots = Object.fromEntries(
      GROUPS.map((group) => [
        group,
        {
          1: null,
          2: null,
          3: null,
        },
      ]),
    );
    if (!table) return slots;

    Array.from(table.rows)
      .slice(1)
      .forEach((row) => {
        const cells = Array.from(row.cells);
        if (cells.length < 4) return;
        const group = cleanText(cells[0]).match(/[A-L]/)?.[0];
        if (!group || !slots[group]) return;
        slots[group][1] = extractTeam(cells[1]);
        slots[group][2] = extractTeam(cells[2]);
        slots[group][3] = extractTeam(cells[3]);
      });

    return slots;
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

  function annotateThirdSafety(thirdRanking, groups, qualifiedSlots) {
    thirdRanking.forEach((entry) => {
      const officialThird = qualifiedSlots[entry.group]?.[3];
      entry.lockedTop8 =
        sameTeamName(officialThird?.name, entry.team?.name) ||
        isThirdLockedTop8(entry, thirdRanking, groups);
    });
  }

  function isThirdLockedTop8(entry, thirdRanking, groups) {
    const ownGroup = groups[entry.group];
    if (!ownGroup?.complete || entry.rank > 8) return false;

    let guaranteedBelow = 0;
    for (const groupLetter of GROUPS) {
      if (groupLetter === entry.group) continue;
      const group = groups[groupLetter];
      if (!group) continue;

      if (group.complete) {
        const other = thirdRanking.find((item) => item.group === groupLetter);
        if (other && compareThirdStats(entry, other) > 0) {
          guaranteedBelow += 1;
        }
      } else if (maxPossibleThirdPoints(group) < entry.pts) {
        guaranteedBelow += 1;
      }
    }

    return guaranteedBelow >= 4;
  }

  function compareThirdStats(a, b) {
    return (
      a.pts - b.pts ||
      a.gd - b.gd ||
      a.gf - b.gf
    );
  }

  function maxPossibleThirdPoints(group) {
    const remaining = group.fixtures.filter((fixture) => !fixture.played);
    if (!remaining.length) {
      const third = group.teams.find((team) => team.position === 3);
      return third?.pts || 0;
    }

    let maxThird = 0;
    const initialPoints = new Map(
      group.teams.map((team) => [team.team.name, team.pts]),
    );

    function enumerate(index, points) {
      if (index >= remaining.length) {
        const ordered = Array.from(points.values()).sort((a, b) => b - a);
        maxThird = Math.max(maxThird, ordered[2] || 0);
        return;
      }

      const fixture = remaining[index];
      const home = fixture.home;
      const away = fixture.away;
      if (!points.has(home) || !points.has(away)) {
        enumerate(index + 1, points);
        return;
      }

      const outcomes = [
        [home, 3, away, 0],
        [home, 1, away, 1],
        [home, 0, away, 3],
      ];
      for (const [teamA, ptsA, teamB, ptsB] of outcomes) {
        const next = new Map(points);
        next.set(teamA, next.get(teamA) + ptsA);
        next.set(teamB, next.get(teamB) + ptsB);
        enumerate(index + 1, next);
      }
    }

    enumerate(0, initialPoints);
    return maxThird;
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
    el.loadState.textContent =
      data.sourceMode === "snapshot"
        ? `快照 ${formatTime(data.fetchedAt)}`
        : `已更新 ${formatTime(data.fetchedAt)}`;
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
    if (data.sourceMode === "snapshot") {
      setNotice(
        `手机或当前网络访问 Wikipedia API 不稳定，已显示内置快照。实时源错误：${data.sourceError || "手动快照模式"}`,
      );
    } else if (usingFallback) {
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
    requestAnimationFrame(drawBracketLines);
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
      const official = data.qualifiedSlots?.[slot.group]?.[slot.position];
      const locked = group?.complete || sameTeamName(official?.name, row?.team?.name);
      return {
        name: row?.team?.name || `${slot.group}组第${slot.position}`,
        nameZh: row?.team?.nameZh || "",
        flag: row?.team?.flag || "",
        source: label,
        slot: label,
        provisional: !locked,
        statusLabel: locked ? label : "当前",
        statusClass: locked ? "locked" : "warn",
      };
    }

    if (slot.type === "third") {
      const mappedGroup = data.matrixRow?.slots?.[slot.slot];
      if (mappedGroup) {
        const entry = data.thirdByGroup[mappedGroup] || thirdFromGroup(data, mappedGroup);
        const locked = data.allGroupsComplete || Boolean(entry?.lockedTop8);
        return {
          name: entry?.team?.name || `${mappedGroup}组第3`,
          nameZh: entry?.team?.nameZh || "",
          flag: entry?.team?.flag || "",
          source: `${mappedGroup}组第3`,
          slot: `3${mappedGroup}`,
          provisional: !locked,
          statusLabel: locked ? `3${mappedGroup}` : "当前",
          statusClass: locked ? "locked" : "warn",
        };
      }
      return {
        name: `第3名 ${THIRD_ALLOWED[slot.slot] || ""}`,
        flag: "",
        source: "待组合确定",
        slot: slot.slot,
        provisional: true,
        statusLabel: "待定",
        statusClass: "warn",
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
        statusLabel: "待定",
        statusClass: "warn",
      };
    }

    return {
      name: "待定",
      flag: "",
      source: "",
      slot: "",
      provisional: true,
      statusLabel: "待定",
      statusClass: "warn",
    };
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

  function sameTeamName(a, b) {
    return Boolean(a && b && cleanTeamName(a) === cleanTeamName(b));
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
    const tagClass = `slot ${team.statusClass || (team.provisional ? "warn" : "locked")}`;
    const tagText =
      team.statusLabel ||
      (team.provisional && !data.allGroupsComplete ? "当前" : team.slot || team.source);
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
        const locked = entry.lockedTop8;
        const status = data.allGroupsComplete
          ? qualified
            ? "晋级"
            : "淘汰"
          : locked
            ? "已锁定"
          : qualified
            ? "晋级区"
            : "淘汰区";
        const rowClass = locked ? "rank-locked" : qualified ? "rank-in" : "rank-risk";
        const badgeClass = locked ? "locked" : qualified ? "qualify" : "out";
        return `
          <tr class="${rowClass}">
            <td class="num">${entry.rank}</td>
            <td>${esc(entry.group)}</td>
            <td>${teamCell(entry.team)}</td>
            <td class="num">${entry.pld}</td>
            <td class="num">${entry.pts}</td>
            <td class="num">${esc(entry.gdText)}</td>
            <td class="num">${entry.gf}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
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
    const nodes = BRACKET_LAYOUT.map((layout) => renderBracketNode(layout, data)).join("");
    const thirdPlace = renderBracketSideMatch(103, data);
    return `
      <div class="bracket-map" aria-label="淘汰赛树状路径图">
        <svg class="bracket-lines" aria-hidden="true"></svg>
        <div class="bracket-stage stage-1">32 强</div>
        <div class="bracket-stage stage-2">16 强</div>
        <div class="bracket-stage stage-3">8 强</div>
        <div class="bracket-stage stage-4">半决赛</div>
        <div class="bracket-stage stage-5">决赛</div>
        ${nodes}
      </div>
      <div class="bracket-side">${thirdPlace}</div>
    `;
  }

  function renderBracketNode(layout, data) {
    const meta = getMatchMeta(layout.match);
    if (!meta) return "";
    const match = resolveMatch(meta.match, meta.round.name, data);
    const target = nextMatchFor(match.match, "winner");
    const style = `grid-column:${layout.col};grid-row:${layout.row + 1} / span ${layout.span}`;
    return `
      <article class="bracket-node ${match.match === 104 ? "final-node" : ""}" data-match="${match.match}" style="${style}">
        <div class="bracket-node-head">
          <strong>M${match.match}</strong>
          <span>${esc(meta.round.name)}</span>
        </div>
        <div class="bracket-teams">
          ${renderBracketTeam(match.home)}
          ${renderBracketTeam(match.away)}
        </div>
        <div class="bracket-node-foot">
          ${match.match === 104 ? "冠军诞生" : target ? `胜者 → M${target}` : ""}
        </div>
      </article>
    `;
  }

  function renderBracketSideMatch(matchNo, data) {
    const meta = getMatchMeta(matchNo);
    if (!meta) return "";
    const match = resolveMatch(meta.match, meta.round.name, data);
    return `
      <article class="match-card third-place-card">
        <div class="match-head">
          <span class="match-number">M${match.match}</span>
          <span>季军赛</span>
        </div>
        ${renderTeamRow(match.home, data)}
        ${renderTeamRow(match.away, data)}
      </article>
    `;
  }

  function renderBracketTeam(team) {
    const name = displayTeamName(team);
    const sub = team.nameZh ? team.name : team.source;
    return `
      <div class="bracket-team">
        ${flagHtml(team.flag, name)}
        <div>
          <strong title="${attr(team.name || name)}">${esc(name)}</strong>
          <span>${esc(sub || "")}</span>
        </div>
        <em class="slot ${team.statusClass || (team.provisional ? "warn" : "locked")}">${esc(team.statusLabel || (team.provisional ? "当前" : team.slot || ""))}</em>
      </div>
    `;
  }

  function getMatchMeta(matchNo) {
    for (const round of ROUNDS) {
      const match = round.matches.find((item) => item.match === matchNo);
      if (match) return { round, match };
    }
    return null;
  }

  function drawBracketLines() {
    const map = el.bracket?.querySelector(".bracket-map");
    const svg = el.bracket?.querySelector(".bracket-lines");
    if (!map || !svg) return;
    const mapRect = map.getBoundingClientRect();
    const paths = [];

    BRACKET_LAYOUT.forEach((layout) => {
      const target = nextMatchFor(layout.match, "winner");
      if (!target) return;
      const from = map.querySelector(`[data-match="${layout.match}"]`);
      const to = map.querySelector(`[data-match="${target}"]`);
      if (!from || !to) return;
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const x1 = fromRect.right - mapRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - mapRect.top;
      const x2 = toRect.left - mapRect.left;
      const y2 = toRect.top + toRect.height / 2 - mapRect.top;
      const mid = x1 + Math.max(28, (x2 - x1) / 2);
      paths.push(`M ${x1} ${y1} L ${mid} ${y1} L ${mid} ${y2} L ${x2} ${y2}`);
    });

    svg.setAttribute("viewBox", `0 0 ${map.scrollWidth} ${map.scrollHeight}`);
    svg.style.width = `${map.scrollWidth}px`;
    svg.style.height = `${map.scrollHeight}px`;
    svg.innerHTML = paths
      .map((d) => `<path d="${d}" vector-effect="non-scaling-stroke"></path>`)
      .join("");
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
