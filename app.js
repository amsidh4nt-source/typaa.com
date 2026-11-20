const routes = [...document.querySelectorAll("[data-view]")];
const routeButtons = [...document.querySelectorAll("[data-route]")];

function showRoute(route) {
  const target = routes.find((view) => view.dataset.view === route) || routes[0];
  routes.forEach((view) => view.classList.toggle("active", view === target));
  document.querySelectorAll(".nav-item, .mobile-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === target.dataset.view);
  });

  document.querySelectorAll("[data-chart-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      liveChartMode = button.dataset.chartMode;
      if (liveCandles.length) drawLiveCandles(liveCandles);
    });
  });
  if (target.dataset.view === "trade") window.setTimeout(loadLiveChart, 0);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2400);
}

function applyTheme(preference, persist = false) {
  const validPreference = ["dark", "light", "system"].includes(preference) ? preference : "dark";
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = validPreference === "system" ? (systemPrefersDark ? "dark" : "light") : validPreference;
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("active", button.textContent.trim().toLowerCase() === validPreference);
  });
  if (persist) window.localStorage.setItem("typaa-theme", validPreference);
}

routeButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    showRoute(button.dataset.route);
  });
});

document.querySelectorAll(".story").forEach((story) => {
  story.addEventListener("click", () => showToast(`${story.querySelector("span")?.textContent || "Story"} opened`));
});

document.querySelectorAll(".follow-button").forEach((button) => {
  button.addEventListener("click", () => {
    const following = button.textContent === "Following";
    button.textContent = following ? "Follow" : "Following";
    button.style.background = following ? "transparent" : "var(--lime)";
    button.style.color = following ? "var(--lime)" : "#18200f";
  });
});

document.querySelectorAll(".action-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("save")) {
      button.textContent = button.textContent === "◆" ? "◇" : "◆";
      return;
    }
    if (button.textContent.includes("♡")) {
      button.classList.toggle("liked");
    }
  });
});

document.querySelectorAll(".more-button").forEach((button) => {
  button.addEventListener("click", () => showToast("Post options opened"));
});

document.querySelectorAll(".market-row").forEach((row) => {
  row.addEventListener("click", () => {
    const symbol = row.querySelector("strong")?.textContent?.trim();
    if (symbol) openMarketDetails(symbol);
    else showRoute("trade");
  });
});

document.querySelector("#add-watchlist")?.addEventListener("click", () => {
  const symbol = window.prompt("Enter a market symbol to add", "SOL/USD");
  if (!symbol) return;
  const marketPanel = document.querySelector(".market-panel");
  const link = marketPanel?.querySelector(".panel-link");
  if (!marketPanel || !link) return;
  const row = document.createElement("div");
  row.className = "market-row";
  row.innerHTML = `<div><strong>${symbol.toUpperCase()}</strong><small>Custom watchlist</small></div><div class="sparkline up">↗</div><div class="market-value"><b>--</b><span>Waiting for data</span></div>`;
  row.addEventListener("click", () => showRoute("trade"));
  marketPanel.insertBefore(row, link);
  showToast(`${symbol.toUpperCase()} added to watchlist`);
});

document.querySelectorAll(".order-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".order-tabs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  });
});

document.querySelectorAll(".timeframes button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".timeframes button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const intervals = { "1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "4h": "4h", "1D": "1d", "1W": "1w", "1M": "1M", "3M": "1d", "1Y": "1d" };
    liveInterval = intervals[button.textContent] || "1m";
    loadLiveChart();
  });
});

document.querySelectorAll(".setting-edit").forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.closest("[data-setting]");
    const setting = row?.dataset.setting;
    const current = button.textContent.replace("›", "").trim();
    const next = window.prompt(`Update ${setting?.replace("-", " ") || "setting"}`, current);
    if (!next) return;
    button.innerHTML = `${next} <b>›</b>`;
    if (setting === "display-name") updateProfileName(next);
    showToast("Setting updated");
  });
});

document.querySelectorAll(".settings-nav button").forEach((button, index) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".settings-nav button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    document.querySelectorAll(".settings-section")[Math.min(index, 2)]?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.textContent.trim().toLowerCase();
    applyTheme(theme, true);
    showToast(`${theme[0].toUpperCase()}${theme.slice(1)} theme selected`);
  });
});

document.querySelector("#alert-ringtone")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (file) {
    document.querySelector("#ringtone-name").textContent = file.name;
    showToast("Custom market alert ringtone selected");
  }
});

const marketDetails = {
  "BTC / USD": "Bitcoin / US Dollar",
  "EUR / USD": "Euro / US Dollar · Forex",
  "NIFTY 50": "National Stock Exchange · India",
  AAPL: "Apple Inc. · US Stocks",
  "ETH / USD": "Ethereum / US Dollar",
};
const usStocks = [
  ["AAPL", "Apple Inc."], ["MSFT", "Microsoft Corporation"], ["NVDA", "NVIDIA Corporation"],
  ["AMZN", "Amazon.com, Inc."], ["GOOGL", "Alphabet Inc."], ["META", "Meta Platforms, Inc."],
  ["TSLA", "Tesla, Inc."], ["JPM", "JPMorgan Chase & Co."], ["AVGO", "Broadcom Inc."],
  ["BRK.B", "Berkshire Hathaway Inc."],
];
const indiaStocks = [
  ["NIFTY 50", "NIFTY 50 · NSE India"], ["RELIANCE", "Reliance Industries · NSE India"],
  ["TCS", "Tata Consultancy Services · NSE India"], ["HDFCBANK", "HDFC Bank · NSE India"],
  ["ICICIBANK", "ICICI Bank · NSE India"], ["INFY", "Infosys · NSE India"],
  ["BHARTIARTL", "Bharti Airtel · NSE India"], ["ITC", "ITC Limited · NSE India"],
  ["SBIN", "State Bank of India · NSE India"], ["LT", "Larsen & Toubro · NSE India"],
];

const liveSymbols = {
  "BTC / USDT": "BTCUSDT",
  "ETH / USDT": "ETHUSDT",
};
const cryptoSymbols = new Map(Object.entries(liveSymbols));
const forexPairs = [
  "EUR / USD", "GBP / USD", "USD / JPY", "USD / CHF", "AUD / USD", "USD / CAD", "NZD / USD",
  "EUR / GBP", "EUR / JPY", "EUR / CHF", "EUR / AUD", "EUR / CAD", "EUR / NZD",
  "GBP / JPY", "GBP / CHF", "GBP / AUD", "GBP / CAD", "GBP / NZD",
  "AUD / JPY", "AUD / CHF", "AUD / CAD", "AUD / NZD", "CAD / JPY", "CAD / CHF",
  "CHF / JPY", "NZD / JPY", "NZD / CHF", "USD / INR", "USD / SGD", "USD / HKD",
  "USD / SEK", "USD / NOK", "USD / DKK", "USD / ZAR", "USD / MXN", "USD / TRY",
  "USD / BRL", "USD / PLN", "USD / HUF", "USD / CZK", "EUR / SEK", "EUR / NOK",
  "EUR / DKK", "EUR / PLN", "EUR / HUF", "EUR / CZK", "GBP / PLN", "GBP / ZAR",
  "AUD / SGD", "CAD / SGD", "NZD / SGD", "SGD / JPY", "ZAR / JPY", "TRY / JPY",
];

function addMarketOption(group, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label || value;
  group.appendChild(option);
}

async function loadMarketCatalog() {
  const selector = document.querySelector("#market-selector");
  if (!selector) return;
  selector.innerHTML = "";
  const forexGroup = document.createElement("optgroup");
  forexGroup.label = "Forex · server-side provider required";
  forexPairs.forEach((pair) => addMarketOption(forexGroup, pair, pair));
  selector.appendChild(forexGroup);
  const cryptoGroup = document.createElement("optgroup");
  cryptoGroup.label = "Top 50 crypto by 24h volume · Binance";
  selector.appendChild(cryptoGroup);
  try {
    const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    if (!response.ok) throw new Error(`Market catalog returned ${response.status}`);
    const tickers = await response.json();
    const topCrypto = tickers
      .filter((ticker) => ticker.symbol.endsWith("USDT") && !ticker.symbol.includes("UP") && !ticker.symbol.includes("DOWN"))
      .sort((left, right) => Number(right.quoteVolume) - Number(left.quoteVolume))
      .slice(0, 50);
    topCrypto.forEach((ticker) => {
        const base = ticker.symbol.replace("USDT", "");
        const value = `${base} / USDT`;
      cryptoSymbols.set(value, ticker.symbol);
      marketDetails[value] = `${base} / US Dollar · Crypto`;
      addMarketOption(cryptoGroup, value, value);
    });
  } catch (error) {
    console.error("Could not load the Binance instrument catalog.", error);
    addMarketOption(cryptoGroup, "BTC / USDT", "BTC / USDT");
    addMarketOption(cryptoGroup, "ETH / USDT", "ETH / USDT");
  }
  const usGroup = document.createElement("optgroup");
  usGroup.label = "US stocks · quotes require a licensed provider";
  usStocks.forEach(([symbol, name]) => {
    marketDetails[symbol] = `${name} · US Stocks`;
    addMarketOption(usGroup, symbol, `${symbol} · ${name}`);
  });
  selector.appendChild(usGroup);
  const indiaGroup = document.createElement("optgroup");
  indiaGroup.label = "Indian stocks · quotes require a licensed provider";
  indiaStocks.forEach(([symbol, name]) => {
    marketDetails[symbol] = name;
    addMarketOption(indiaGroup, symbol, `${symbol} · ${name}`);
  });
  selector.appendChild(indiaGroup);
  const savedMarket = window.sessionStorage.getItem("typaa:selected-market");
  const availableMarkets = new Set([...selector.options].map((option) => option.value));
  selector.value = savedMarket && availableMarkets.has(savedMarket) ? savedMarket : "EUR / USD";
  const marketName = document.querySelector("#market-name");
  if (marketName) marketName.textContent = marketDetails[selector.value] || "Market instrument";
  renderMarketSearchResults();
  if (document.querySelector('[data-view="trade"].active')) loadLiveChart();
}

function normalizeMarketSearch(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function renderMarketSearchResults() {
  const input = document.querySelector("#market-search");
  const results = document.querySelector("#market-search-results");
  const selector = document.querySelector("#market-selector");
  if (!input || !results || !selector) return;

  const query = normalizeMarketSearch(input.value.trim());
  results.replaceChildren();
  if (!query) {
    results.hidden = true;
    return;
  }

  const matches = [...selector.options]
    .filter((option) => option.value)
    .filter((option) => {
      const searchable = normalizeMarketSearch(`${option.value} ${option.textContent || ""} ${marketDetails[option.value] || ""}`);
      return searchable.includes(query);
    })
    .slice(0, 12);

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "market-search-empty";
    empty.textContent = "No matching instruments in the loaded list.";
    results.appendChild(empty);
    results.hidden = false;
    return;
  }

  matches.forEach((option) => {
    const result = document.createElement("button");
    result.type = "button";
    result.className = "market-search-result";
    const title = document.createElement("strong");
    title.textContent = option.value;
    const detail = document.createElement("small");
    detail.textContent = marketDetails[option.value] || option.textContent || "Market instrument";
    result.append(title, detail);
    result.addEventListener("click", () => openMarketDetails(option.value));
    results.appendChild(result);
  });
  results.hidden = false;
}

function openMarketDetails(symbol) {
  const selector = document.querySelector("#market-selector");
  if (!selector) return;
  const aliases = { "BTC/USD": "BTC / USDT", "ETH/USD": "ETH / USDT" };
  const selectedSymbol = aliases[symbol] || symbol;
  selector.value = selectedSymbol;
  window.sessionStorage.setItem("typaa:selected-market", selectedSymbol);
  const posts = [...document.querySelectorAll('[data-view="home"] .post-card')].map((post) => ({
    author: post.querySelector(".post-header strong")?.textContent?.trim() || "Typaa member",
    text: post.textContent?.trim() || "",
  }));
  window.sessionStorage.setItem("typaa:market-related-posts", JSON.stringify(posts));
  const slug = selectedSymbol.replace(/\s*\/\s*/g, "-").trim().replace(/\s+/g, "-");
  document.dispatchEvent(
    new CustomEvent("typaa:navigate", { detail: { href: `/markets/${encodeURIComponent(slug)}` } }),
  );
}

function initializeMarketSearch() {
  const selector = document.querySelector("#market-selector");
  if (!selector || document.querySelector("#market-search")) return;
  selector.classList.add("market-selector-native");

  const finder = document.createElement("div");
  finder.className = "market-finder";
  const input = document.createElement("input");
  input.id = "market-search";
  input.type = "search";
  input.placeholder = "Search pair or symbol…";
  input.autocomplete = "off";
  input.setAttribute("aria-label", "Search market instruments");
  input.setAttribute("aria-controls", "market-search-results");
  const results = document.createElement("div");
  results.id = "market-search-results";
  results.className = "market-search-results";
  results.hidden = true;
  finder.append(input, results);
  selector.parentElement?.insertBefore(finder, selector);
  input.addEventListener("input", renderMarketSearchResults);
  input.addEventListener("focus", renderMarketSearchResults);
  document.addEventListener("click", (event) => {
    if (!finder.contains(event.target)) results.hidden = true;
  });
}
let liveInterval = "1d";
let liveSocket;
let liveCandles = [];
let liveChartMode = "candles";
let liveLoading = false;
let liveDrawFrame;
const paperPortfolio = { capital: 1000, cash: 1000, invested: 0 };

function renderPortfolio() {
  const balance = paperPortfolio.cash + paperPortfolio.invested;
  const pnl = balance - paperPortfolio.capital;
  const percent = paperPortfolio.capital ? (pnl / paperPortfolio.capital) * 100 : 0;
  const values = {
    balance: `$${balance.toFixed(2)}`,
    cash: `$${paperPortfolio.cash.toFixed(2)}`,
    invested: `$${paperPortfolio.invested.toFixed(2)}`,
    pnl: `+$${pnl.toFixed(2)} (${percent.toFixed(2)}%)`,
    "pnl-value": `+$${pnl.toFixed(2)}`,
    "profile-balance": `$${balance.toFixed(2)}`,
  };
  Object.entries(values).forEach(([key, value]) => {
    const element = document.querySelector(`[data-portfolio="${key}"]`);
    if (element) element.textContent = value;
  });
  const empty = document.querySelector(".portfolio-empty");
  if (empty && paperPortfolio.invested > 0) {
    empty.innerHTML = `<strong>Paper position created</strong><span>Invested margin: $${paperPortfolio.invested.toFixed(2)} · Mark-to-market P&L is calculated from the live price.</span>`;
  }
}

function updateOrderEstimate() {
  const price = liveCandles.length ? liveCandles[liveCandles.length - 1].close : 0;
  const quantity = Number(document.querySelector(".order-panel input[type='number']")?.value || 0);
  const leverage = Number.parseInt(document.querySelector("#leverage")?.value || "1", 10);
  const estimate = price && quantity ? (price * quantity) / leverage : 0;
  const output = document.querySelector("[data-order='estimated']");
  if (output) output.textContent = estimate ? `$${estimate.toFixed(2)}` : "--";
}

function drawLiveCandles(candles) {
  const canvas = document.querySelector("#live-chart");
  if (!canvas || !candles.length) return;
  const width = canvas.clientWidth || 900;
  const height = 340;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  const prices = candles.flatMap((candle) => [candle.high, candle.low]);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min || 1;
  const chartTop = 18;
  const chartBottom = height - 20;
  const candleWidth = Math.max(4, width / candles.length * 0.58);
  const xStep = width / candles.length;
  const y = (price) => chartTop + ((max - price) / range) * (chartBottom - chartTop);
  context.strokeStyle = "#30402c";
  context.setLineDash([3, 5]);
  for (let index = 1; index < 5; index += 1) {
    const lineY = chartTop + ((chartBottom - chartTop) / 5) * index;
    context.beginPath();
    context.moveTo(0, lineY);
    context.lineTo(width, lineY);
    context.stroke();
  }
  context.setLineDash([]);
  if (liveChartMode === "line" || liveChartMode === "area") {
    context.strokeStyle = "#b7f34a";
    context.lineWidth = 2;
    context.beginPath();
    candles.forEach((candle, index) => {
      const pointX = index * xStep + xStep / 2;
      const pointY = y(candle.close);
      if (index === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    });
    context.stroke();
    if (liveChartMode === "area") {
      context.lineTo(width, chartBottom);
      context.lineTo(0, chartBottom);
      context.closePath();
      context.fillStyle = "rgba(183,243,74,.18)";
      context.fill();
    }
    return;
  }
  candles.forEach((candle, index) => {
    const center = index * xStep + xStep / 2;
    const rising = candle.close >= candle.open;
    const color = rising ? "#b7f34a" : "#ff7777";
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(center, y(candle.high));
    context.lineTo(center, y(candle.low));
    context.stroke();
    const top = y(Math.max(candle.open, candle.close));
    const bodyHeight = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
    context.fillRect(center - candleWidth / 2, top, candleWidth, bodyHeight);
  });
}

async function loadLiveChart() {
  if (liveLoading) return;
  const selectedMarket = document.querySelector("#market-selector")?.value;
  const status = document.querySelector("#market-status");
  const chart = document.querySelector(".large-chart");
  const symbol = cryptoSymbols.get(selectedMarket);
  if (!symbol) {
    connectAllTickStream(selectedMarket);
    chart?.classList.remove("live-ready");
    const price = document.querySelector("#market-price");
    if (price) price.textContent = "--";
    updateOrderEstimate();
    return;
  }
  if (status) status.textContent = "Connecting to live Binance feed...";
  const badge = document.querySelector(".live-dot");
  if (badge) badge.textContent = "Connecting";
  liveLoading = true;
  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${liveInterval}&limit=80`);
    if (!response.ok) throw new Error(`Market feed returned ${response.status}`);
    const rows = await response.json();
    liveCandles = rows.map((row) => ({
      open: Number(row[1]),
      high: Number(row[2]),
      low: Number(row[3]),
      close: Number(row[4]),
    }));
    drawLiveCandles(liveCandles);
    chart?.classList.add("live-ready");
    const price = document.querySelector("#market-price");
    if (price) price.textContent = `$${liveCandles[liveCandles.length - 1].close.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    updateOrderEstimate();
    if (status) status.textContent = `Live ${selectedMarket} candles · Binance`;
    if (badge) badge.textContent = "Binance snapshot";
    connectLiveStream(symbol);
  } catch (error) {
    console.error("Could not load market candles.", error);
    chart?.classList.remove("live-ready");
    if (status) status.textContent = "Live feed unavailable; no price chart is shown";
    if (badge) badge.textContent = "Data unavailable";
    showToast("Live market feed could not be reached");
  } finally {
    liveLoading = false;
  }
}

function connectAllTickStream(pair) {
  const status = document.querySelector("#market-status");
  if (liveSocket) liveSocket.close();
  const price = document.querySelector("#market-price");
  if (price) price.textContent = "--";
  if (status) status.textContent = `${pair} data unavailable · secure server-side provider not configured`;
  const badge = document.querySelector(".live-dot");
  if (badge) badge.textContent = "Provider not connected";
}

function connectLiveStream(symbol) {
  if (liveSocket) liveSocket.close();
  liveSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`);
  liveSocket.addEventListener("open", () => {
    const status = document.querySelector("#market-status");
    if (status) status.textContent = `Live ${document.querySelector("#market-selector")?.value} · streaming`;
    const badge = document.querySelector(".live-dot");
    if (badge) badge.textContent = "Live · Binance";
  });
  liveSocket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    const candle = payload.k;
    if (!candle || !liveCandles.length) return;
    const nextCandle = {
      open: Number(candle.o),
      high: Number(candle.h),
      low: Number(candle.l),
      close: Number(candle.c),
    };
    liveCandles[liveCandles.length - 1] = nextCandle;
    window.cancelAnimationFrame(liveDrawFrame);
    liveDrawFrame = window.requestAnimationFrame(() => drawLiveCandles(liveCandles));
    const price = document.querySelector("#market-price");
    if (price) price.textContent = `$${nextCandle.close.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    updateOrderEstimate();
  });
  liveSocket.addEventListener("close", () => {
    const status = document.querySelector("#market-status");
    if (status && cryptoSymbols.has(document.querySelector("#market-selector")?.value)) status.textContent = "Live stream disconnected; reconnecting...";
    const badge = document.querySelector(".live-dot");
    if (badge && cryptoSymbols.has(document.querySelector("#market-selector")?.value)) badge.textContent = "Reconnecting";
    window.setTimeout(() => {
      if (cryptoSymbols.has(document.querySelector("#market-selector")?.value)) loadLiveChart();
    }, 3000);
  });
  liveSocket.addEventListener("error", () => {
    const status = document.querySelector("#market-status");
    if (status) status.textContent = "Live stream unavailable";
    const badge = document.querySelector(".live-dot");
    if (badge) badge.textContent = "Data unavailable";
  });
}

document.querySelector("#market-selector")?.addEventListener("change", (event) => {
  const symbol = event.target.value;
  document.querySelector("#market-name").textContent = marketDetails[symbol] || "Market instrument";
  showToast(`${symbol} chart selected`);
  loadLiveChart();
});

document.querySelectorAll("[data-chart-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    button.parentElement.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const chart = button.closest(".terminal-panel")?.querySelector(".large-chart");
    chart?.classList.toggle("line-mode", button.dataset.chartMode === "line");
    chart?.classList.toggle("area-mode", button.dataset.chartMode === "area");
    showToast(`${button.textContent} chart selected`);
  });
});

document.querySelectorAll("[data-chart-tool]").forEach((button) => {
  button.addEventListener("click", () => {
    const tool = button.dataset.chartTool;
    if (tool === "fullscreen") {
      button.closest(".terminal-panel")?.classList.toggle("chart-fullscreen");
    }
    button.classList.toggle("active");
    showToast(tool === "fullscreen" ? "Fullscreen chart toggled" : `${button.textContent} tool toggled`);
  });
});

document.querySelector("[data-action='edit-profile']")?.addEventListener("click", () => {
  const name = window.prompt("Display name", "Abhishek Verma");
  if (!name) return;
  updateProfileName(name);
  const bio = window.prompt("Profile bio", "Building products, trading charts, and a life worth compounding.");
  if (bio) document.querySelector(".profile-info p:last-of-type").textContent = bio;
  showToast("Profile updated");
});

function updateProfileName(name) {
  document.querySelectorAll(".profile-info h1, .profile-grid .post-header strong, .settings-section [data-setting='display-name'], .mini-profile strong").forEach((element) => {
    if (element.matches(".profile-info h1")) element.firstChild.textContent = `${name} `;
    else if (element.matches(".mini-profile strong") || element.matches(".profile-grid .post-header strong")) element.textContent = name;
  });
  const displayName = document.querySelector("[data-setting='display-name'] .setting-edit");
  if (displayName) displayName.innerHTML = `${name} <b>›</b>`;
}

document.querySelector("[data-action='upload-reel']")?.addEventListener("click", () => showToast("Reel upload will connect to Supabase Storage"));
function youtubeId(value) {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v") || url.pathname.split("/").pop();
  } catch {
    return "";
  }
  return "";
}

let activeVideoCategory = "ALL";
let activeVideoSource = "ALL";
let visibleVideoCount = 60;
const recommendedMovies = [
  ["Project Hail Mary", "2026"], ["The Odyssey", "2026"], ["Spider-Man: Brand New Day", "2026"],
  ["Supergirl", "2026"], ["Toy Story 5", "2026"], ["The Super Mario Galaxy Movie", "2026"],
  ["The Mandalorian and Grogu", "2026"], ["Dune: Part Three", "2026"], ["Shrek 5", "2026"],
  ["Ice Age: Boiling Point", "2026"], ["Moana (Live-Action)", "2026"], ["Jumanji 4", "2026"],
  ["The Batman Part II", "2026"], ["Avengers: Doomsday", "2026"], ["Mortal Kombat 2", "2025"],
  ["Jurassic World Rebirth", "2025"], ["Mission: Impossible - The Final Reckoning", "2025"],
  ["How to Train Your Dragon", "2025"], ["Wicked: For Good", "2025"],
  ["The Hunger Games: Sunrise on the Reaping", "2026"], ["Tron: Ares", "2025"],
  ["Now You See Me: Now You Don't", "2025"], ["The Conjuring: Last Rites", "2025"],
  ["Five Nights at Freddy's 2", "2025"], ["The Running Man", "2025"], ["Ballerina", "2025"],
  ["28 Years Later", "2025"], ["Predator: Badlands", "2025"], ["Zootopia 2", "2025"],
  ["Avatar: Fire and Ash", "2025"], ["Paddington in Peru", "2025"],
  ["The SpongeBob Movie: Search for SquarePants", "2025"], ["The Housemaid", "2025"],
  ["Good Fortune", "2025"], ["Michael", "2026"], ["The Bride!", "2026"],
  ["Peaky Blinders: The Immortal Man", "2026"], ["The Smashing Machine", "2025"],
  ["F1", "2025"], ["Superman", "2025"], ["Elio", "2025"], ["Lilo & Stitch", "2025"],
  ["Karate Kid: Legends", "2025"], ["The Amateur", "2025"], ["Black Bag", "2025"],
  ["Mickey 17", "2025"], ["Flow", "2025"], ["Captain America: Brave New World", "2025"],
  ["Thunderbolts*", "2025"], ["The Fantastic Four: First Steps", "2025"]
].map(([title, year], index) => ({
  id: `recommendation-${index + 1}`,
  title,
  year,
  type: "FILM",
  source: "RECOMMENDED",
  thumbnail: `https://tse1.mm.bing.net/th?q=${encodeURIComponent(`${title} ${year} official movie poster`)}&w=600&h=840&c=7&rs=1`,
  imageSearch: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${title} ${year} official movie poster`)}`,
  link: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${year} official trailer`)}`
}));
let archiveMovies = [];
let archivePage = 1;
let archiveTotal = 0;
let archiveLoading = false;
let archiveError = "";
let youtubeCcMovies = [];
let youtubeCcNextPage = "";
let youtubeCcLoading = false;
let youtubeCcError = "";

function renderVideoCatalog() {
  const container = document.querySelector("#video-catalog");
  if (!container) return;
  const savedVideos = JSON.parse(window.localStorage.getItem("typaa-video-catalog") || "[]")
    .map((video) => ({ ...video, source: "YOUTUBE", type: "FILM" }));
  container.innerHTML = "";
  const catalog = activeVideoSource === "RECOMMENDED" ? recommendedMovies
    : activeVideoSource === "ARCHIVE" ? archiveMovies
    : activeVideoSource === "YOUTUBE" ? savedVideos
      : activeVideoSource === "YOUTUBE_CC" ? youtubeCcMovies
        : [...recommendedMovies, ...savedVideos, ...archiveMovies, ...youtubeCcMovies];
  const filtered = activeVideoCategory === "ALL" ? catalog : catalog.filter((video) => {
    const subjects = Array.isArray(video.subject) ? video.subject.join(" ") : (video.subject || "");
    return video.type === activeVideoCategory || subjects.toUpperCase().includes(activeVideoCategory);
  });
  const visible = filtered.slice(0, visibleVideoCount);
  const count = document.querySelector("#video-count");
  if (count) count.textContent = youtubeCcLoading ? "Loading YouTube films…" : `${visible.length.toLocaleString()} shown · ${filtered.length.toLocaleString()} loaded`;
  const loadMore = document.querySelector("#load-more-videos");
  if (loadMore) {
    loadMore.hidden = activeVideoSource === "YOUTUBE" || activeVideoSource === "RECOMMENDED"
      || (activeVideoSource === "ARCHIVE" && !archiveLoading && archiveMovies.length >= archiveTotal)
      || (activeVideoSource === "YOUTUBE_CC" && !youtubeCcLoading && Boolean(youtubeCcError))
      || (activeVideoSource === "YOUTUBE_CC" && !youtubeCcLoading && visible.length >= filtered.length && (!youtubeCcNextPage || youtubeCcMovies.length >= 1000))
      || (activeVideoSource === "ALL" && !archiveLoading && !youtubeCcLoading && visible.length >= filtered.length && archiveMovies.length >= archiveTotal && (!youtubeCcNextPage || youtubeCcMovies.length >= 1000));
    loadMore.textContent = visible.length < filtered.length ? "Show more" : "Load more";
  }
  const loadError = activeVideoSource === "YOUTUBE_CC" ? youtubeCcError : archiveError;
  const isErrorRelevant = activeVideoSource === "YOUTUBE_CC" ? !youtubeCcLoading : !archiveLoading;
  if (loadError && isErrorRelevant && !filtered.length) {
    const sourceName = activeVideoSource === "YOUTUBE_CC" ? "YouTube catalog unavailable" : "Internet Archive catalog unavailable";
    container.innerHTML = `<div class="video-empty"><strong>${sourceName}</strong><span>${loadError}</span><button class="secondary-button" id="retry-free-catalog">Retry</button></div>`;
    container.querySelector("#retry-free-catalog").addEventListener("click", activeVideoSource === "YOUTUBE_CC" ? loadYouTubeCcPage : loadArchiveMovies);
    return;
  }
  if (!filtered.length) {
    const loading = archiveLoading || youtubeCcLoading;
    container.innerHTML = `<div class="video-empty"><strong>${loading ? "Loading free titles…" : "No free titles loaded yet"}</strong><span>${loading ? "Fetching embeddable free videos." : "Try another category or select a free source."}</span></div>`;
    return;
  }
  visible.forEach((video) => {
    const card = document.createElement("article");
    card.className = "video-card";
    const embedUrl = video.source === "ARCHIVE"
      ? `https://archive.org/embed/${encodeURIComponent(video.id)}`
      : ["YOUTUBE", "YOUTUBE_CC"].includes(video.source)
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0`
        : "";
    const sourceLabel = video.source === "ARCHIVE" ? "OPEN-LICENSE · INTERNET ARCHIVE"
      : video.source === "YOUTUBE_CC" ? "YOUTUBE · CREATIVE COMMONS"
        : video.source === "RECOMMENDED" ? "RECOMMENDED · YOUTUBE SEARCH" : "YOUTUBE";
    const safeTitle = escapeHTML(video.title);
    const safeThumbnail = escapeHTML(video.thumbnail);
    const fallbackThumbnail = `https://placehold.co/600x840/171c16/b7f34a?text=${encodeURIComponent(video.title)}`;
    const cardActions = video.source === "RECOMMENDED"
      ? `<a class="text-button" href="${escapeHTML(video.link)}" target="_blank" rel="noopener noreferrer">Find trailer on YouTube →</a><a class="text-button" href="${escapeHTML(video.imageSearch)}" target="_blank" rel="noopener noreferrer">Images →</a>`
      : `<button class="text-button video-watch" type="button" data-embed-url="${embedUrl}">Play in Typaa →</button>${video.source === "YOUTUBE" ? '<button class="text-button video-remove" type="button">Remove</button>' : ""}`;
    card.innerHTML = `<button class="video-poster video-watch" type="button" data-embed-url="${embedUrl}" aria-label="Play ${safeTitle} inside Typaa"><img src="${safeThumbnail}" onerror="this.onerror=null;this.src='${fallbackThumbnail}'" alt="${safeTitle} poster" loading="lazy"><span class="play-badge">▶</span></button><div class="video-card-copy"><span class="eyebrow lime-text">${sourceLabel} · ${escapeHTML(video.year || "FILM")}</span><strong>${safeTitle}</strong>${cardActions}</div>`;
    card.querySelectorAll(".video-watch").forEach((watchButton) => watchButton.addEventListener("click", () => {
      if (video.source === "ARCHIVE") openArchiveVideo(video);
      else if (video.source === "RECOMMENDED") openRecommendationInfo(video);
      else openVideoModal(watchButton.dataset.embedUrl, video.title);
    }));
    if (video.source === "YOUTUBE") card.querySelector(".video-remove").addEventListener("click", () => {
      const next = savedVideos.filter((item) => item.id !== video.id);
      window.localStorage.setItem("typaa-video-catalog", JSON.stringify(next));
      renderVideoCatalog();
    });
    container.appendChild(card);
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

async function loadArchiveMovies() {
  if (archiveLoading || (archiveTotal > 0 && archiveMovies.length >= archiveTotal)) return;
  archiveLoading = true;
  archiveError = "";
  renderVideoCatalog();
  const query = 'mediatype:movies AND collection:feature_films AND licenseurl:"https://creativecommons.org/publicdomain/zero/1.0/"';
  const params = new URLSearchParams({
    q: query,
    "fl[]": "identifier,title,year,subject",
    "sort[]": "downloads desc",
    rows: "24",
    page: String(archivePage),
    output: "json"
  });
  try {
    const response = await fetch(`https://archive.org/advancedsearch.php?${params}`);
    if (!response.ok) throw new Error(`Free catalog request returned ${response.status}`);
    const payload = await response.json();
    const docs = payload.response?.docs || [];
    archiveTotal = payload.response?.numFound || 0;
    const known = new Set(archiveMovies.map((movie) => movie.id));
    docs.forEach((item) => {
      if (!item.identifier || known.has(item.identifier)) return;
      archiveMovies.push({
        id: item.identifier,
        title: item.title || item.identifier.replace(/[-_]/g, " "),
        year: item.year || "PUBLIC DOMAIN",
        type: "FILM",
        source: "ARCHIVE",
        subject: item.subject || [],
        thumbnail: `https://archive.org/services/img/${encodeURIComponent(item.identifier)}`
      });
    });
    archivePage += 1;
  } catch (error) {
    console.error("Could not load Internet Archive open-license catalog.", error);
    archiveError = `${error.message}. Check your connection and retry.`;
  } finally {
    archiveLoading = false;
    renderVideoCatalog();
  }
}

async function loadYouTubeCcPage() {
  if (youtubeCcLoading || youtubeCcMovies.length >= 1000) return;
  if (window.location.protocol === "file:") {
    youtubeCcError = "YouTube results need the deployed web app and a server-side YOUTUBE_DATA_API_KEY. The Internet Archive free catalog works locally.";
    renderVideoCatalog();
    return;
  }
  youtubeCcLoading = true;
  youtubeCcError = "";
  renderVideoCatalog();
  try {
    const url = new URL("/api/youtube-films", window.location.origin);
    if (youtubeCcNextPage) url.searchParams.set("pageToken", youtubeCcNextPage);
    const response = await fetch(url);
    const body = await response.text();
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      throw new Error(`YouTube catalog endpoint returned ${response.status}. Deploy to Vercel and configure YOUTUBE_DATA_API_KEY.`);
    }
    if (!response.ok) throw new Error(payload.error || `YouTube request returned ${response.status}`);
    const knownIds = new Set(youtubeCcMovies.map((movie) => movie.id));
    (payload.videos || []).forEach((video) => {
      if (!video.id || knownIds.has(video.id)) return;
      youtubeCcMovies.push({ ...video, source: "YOUTUBE_CC", type: "FILM" });
    });
    youtubeCcNextPage = youtubeCcMovies.length < 1000 ? (payload.nextPageToken || "") : "";
    if (!payload.videos?.length && !youtubeCcNextPage) {
      youtubeCcError = "No more embeddable Creative Commons long-form results were returned.";
    }
  } catch (error) {
    console.error("Could not load Creative Commons YouTube films.", error);
    youtubeCcError = `${error.message}. Check the server-side YouTube API key and quota.`;
  } finally {
    youtubeCcLoading = false;
    renderVideoCatalog();
  }
}

function getVideoModal() {
  let modal = document.querySelector("#video-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "video-modal";
    modal.className = "video-modal";
    modal.innerHTML = `<div class="video-modal-backdrop"></div><div class="video-modal-card" role="dialog" aria-modal="true" aria-label="Video player"><button class="video-modal-close" type="button" aria-label="Close video">×</button><h3></h3><p class="video-modal-status" hidden></p><div class="video-modal-frame"><iframe referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe><video controls playsinline hidden></video></div></div>`;
    document.body.appendChild(modal);
    const close = () => {
      modal.classList.remove("visible");
      modal.querySelector("iframe").src = "about:blank";
      const video = modal.querySelector("video");
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    modal.querySelector(".video-modal-close").addEventListener("click", close);
    modal.querySelector(".video-modal-backdrop").addEventListener("click", close);
  }
  return modal;
}

function openVideoModal(embedUrl, title) {
  const modal = getVideoModal();
  modal.querySelector("h3").textContent = title;
  const frame = modal.querySelector("iframe");
  const video = modal.querySelector("video");
  video.pause();
  video.hidden = true;
  video.removeAttribute("src");
  frame.hidden = false;
  frame.src = embedUrl;
  modal.querySelector(".video-modal-status").hidden = true;
  modal.classList.add("visible");
}

function openRecommendationInfo(item) {
  const modal = getVideoModal();
  modal.querySelector("h3").textContent = item.title;
  const frame = modal.querySelector("iframe");
  const video = modal.querySelector("video");
  const status = modal.querySelector(".video-modal-status");
  frame.src = "about:blank";
  frame.hidden = true;
  video.pause();
  video.hidden = true;
  video.removeAttribute("src");
  video.load();
  status.replaceChildren(document.createTextNode("Recommendation card only — open its YouTube search to choose an official trailer. "));
  const link = document.createElement("a");
  link.href = item.link;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Search YouTube";
  status.appendChild(link);
  status.hidden = false;
  modal.classList.add("visible");
}

async function openArchiveVideo(item) {
  const modal = getVideoModal();
  modal.querySelector("h3").textContent = item.title;
  const frame = modal.querySelector("iframe");
  const video = modal.querySelector("video");
  const status = modal.querySelector(".video-modal-status");
  frame.src = "about:blank";
  frame.hidden = true;
  video.hidden = true;
  video.removeAttribute("src");
  video.load();
  status.textContent = "Preparing the open-license video stream…";
  status.hidden = false;
  modal.classList.add("visible");
  try {
    const response = await fetch(`https://archive.org/metadata/${encodeURIComponent(item.id)}`);
    if (!response.ok) throw new Error(`Video metadata request returned ${response.status}`);
    const metadata = await response.json();
    const file = metadata.files?.find((candidate) => candidate.format === "MPEG4" || /\.mp4$/i.test(candidate.name || ""));
    if (!file) throw new Error("No playable MP4 stream is available for this title.");
    const filePath = file.name.split("/").map(encodeURIComponent).join("/");
    video.src = `https://archive.org/download/${encodeURIComponent(item.id)}/${filePath}`;
    video.hidden = false;
    status.hidden = true;
  } catch (error) {
    console.error("Could not start the Internet Archive video stream.", error);
    status.textContent = `${error.message} Please try another title.`;
  }
}

document.querySelector("#video-category")?.addEventListener("change", (event) => {
  activeVideoCategory = event.target.value;
  visibleVideoCount = 60;
  renderVideoCatalog();
});
document.querySelector("#video-source")?.addEventListener("change", (event) => {
  activeVideoSource = event.target.value;
  activeVideoCategory = "ALL";
  const categorySelect = document.querySelector("#video-category");
  if (categorySelect) {
    categorySelect.value = "ALL";
    categorySelect.querySelectorAll("option").forEach((option) => {
      option.hidden = ["RECOMMENDED", "YOUTUBE_CC", "YOUTUBE"].includes(activeVideoSource)
        ? !["ALL", "FILM"].includes(option.value)
        : false;
    });
  }
  visibleVideoCount = 60;
  renderVideoCatalog();
  if (activeVideoSource === "YOUTUBE_CC" && !youtubeCcMovies.length) loadYouTubeCcPage();
});
document.querySelector("#load-more-videos")?.addEventListener("click", () => {
  const loadedCount = activeVideoSource === "YOUTUBE_CC" ? youtubeCcMovies.length
    : activeVideoSource === "ARCHIVE" ? archiveMovies.length
      : activeVideoSource === "YOUTUBE" ? JSON.parse(window.localStorage.getItem("typaa-video-catalog") || "[]").length
        : archiveMovies.length + youtubeCcMovies.length + recommendedMovies.length + JSON.parse(window.localStorage.getItem("typaa-video-catalog") || "[]").length;
  if (visibleVideoCount < loadedCount) {
    visibleVideoCount += 60;
    renderVideoCatalog();
  } else if (activeVideoSource === "YOUTUBE_CC") {
    loadYouTubeCcPage();
  } else {
    loadArchiveMovies();
  }
});

document.querySelectorAll("[data-action='add-video']").forEach((button) => {
  button.addEventListener("click", () => {
    const url = window.prompt("Paste an official YouTube video URL");
    const id = url && youtubeId(url);
    if (!id) {
      if (url) showToast("Please paste a valid YouTube URL");
      return;
    }
    const title = window.prompt("Title", "New film or web series");
    const videos = JSON.parse(window.localStorage.getItem("typaa-video-catalog") || "[]");
    if (videos.some((video) => video.id === id)) {
      showToast("That YouTube video is already in your list");
      return;
    }
    videos.unshift({ id, title: title || "Untitled video" });
    window.localStorage.setItem("typaa-video-catalog", JSON.stringify(videos.slice(0, 30)));
    renderVideoCatalog();
    showToast("Title added to Typaa Watch");
  });
});

function setComposerStatus(message, isError = false) {
  const status = document.querySelector("#composer-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
  status.hidden = !message;
}

function renderPublishedPost(post) {
  const feed = document.querySelector('[data-view="home"] .feed-column');
  if (!feed || !post?.id || feed.querySelector(`[data-post-id="${CSS.escape(post.id)}"]`)) return;

  const article = document.createElement("article");
  article.className = "post-card";
  article.dataset.postId = post.id;

  const header = document.createElement("div");
  header.className = "post-header";
  const avatar = document.createElement("div");
  avatar.className = "avatar avatar-green";
  avatar.textContent = "AV";
  const authorBlock = document.createElement("div");
  const author = document.createElement("strong");
  author.textContent = document.querySelector(".mini-profile strong")?.textContent?.trim() || "Typaa member";
  const timestamp = document.createElement("small");
  timestamp.textContent = "Just now";
  authorBlock.append(author, timestamp);
  header.append(avatar, authorBlock);
  article.appendChild(header);

  if (post.content) {
    const copy = document.createElement("p");
    copy.className = "post-copy";
    copy.textContent = post.content;
    article.appendChild(copy);
  }
  if (post.feeling || post.location) {
    const metadata = document.createElement("p");
    metadata.className = "post-metadata";
    metadata.textContent = [post.feeling, post.location].filter(Boolean).join(" · ");
    article.appendChild(metadata);
  }
  if (post.mediaUrl) {
    const media = post.mediaType?.startsWith("video/") ? document.createElement("video") : document.createElement("img");
    media.className = "published-media";
    media.src = post.mediaUrl;
    media.setAttribute("aria-label", "Post media");
    if (media instanceof HTMLVideoElement) {
      media.controls = true;
      media.playsInline = true;
    } else {
      media.alt = "Post attachment";
      media.loading = "lazy";
    }
    article.appendChild(media);
  }

  const firstPost = feed.querySelector(".post-card");
  feed.insertBefore(article, firstPost || null);
}

async function loadUserPosts() {
  try {
    const response = await fetch("/api/posts", { cache: "no-store" });
    const payload = await response.json();
    if (response.status === 401) return;
    if (response.status === 503) {
      setComposerStatus(payload.error || "Post storage is not configured.", true);
      return;
    }
    if (!response.ok) throw new Error(payload.error || `Posts request failed (${response.status}).`);
    (payload.posts || []).reverse().forEach((post) =>
      renderPublishedPost({ ...post, mediaUrl: post.media_url, mediaType: post.media_type }),
    );
  } catch (error) {
    console.error("Could not load saved Typaa posts.", error);
    showToast(error instanceof Error ? error.message : "Posts could not be loaded.");
  }
}

function initializePostComposer() {
  const panel = document.querySelector(".create-panel");
  const toolbar = panel?.querySelector(".create-toolbar");
  const textarea = panel?.querySelector("textarea");
  const buttons = toolbar ? [...toolbar.querySelectorAll("button")] : [];
  if (!panel || !toolbar || !textarea || buttons.length < 4) return;

  const [mediaButton, feelingButton, locationButton, publishButton] = buttons;
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/jpeg,image/png,image/webp,video/mp4,video/webm";
  fileInput.hidden = true;
  fileInput.setAttribute("aria-label", "Choose post media");
  panel.appendChild(fileInput);

  const fields = document.createElement("div");
  fields.className = "composer-fields";
  const feelingSelect = document.createElement("select");
  feelingSelect.id = "post-feeling";
  feelingSelect.setAttribute("aria-label", "Choose a feeling or activity");
  feelingSelect.hidden = true;
  [
    ["", "Choose a feeling or activity"],
    ["Feeling happy", "Feeling happy"],
    ["Feeling creative", "Feeling creative"],
    ["Celebrating", "Celebrating"],
    ["Traveling", "Traveling"],
    ["Learning", "Learning"],
    ["Watching a film", "Watching a film"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    feelingSelect.appendChild(option);
  });
  const locationInput = document.createElement("input");
  locationInput.id = "post-location";
  locationInput.type = "text";
  locationInput.maxLength = 120;
  locationInput.placeholder = "Add a location (optional; no device location is collected)";
  locationInput.setAttribute("aria-label", "Add an optional location");
  locationInput.hidden = true;
  fields.append(feelingSelect, locationInput);

  const preview = document.createElement("div");
  preview.className = "composer-media-preview";
  preview.hidden = true;
  const status = document.createElement("p");
  status.id = "composer-status";
  status.className = "composer-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.hidden = true;
  const characterCount = document.createElement("small");
  characterCount.className = "composer-character-count";
  characterCount.textContent = "0 / 2,200";
  textarea.maxLength = 2200;
  panel.insertBefore(fields, toolbar);
  panel.insertBefore(preview, toolbar);
  panel.insertBefore(status, toolbar);
  toolbar.insertBefore(characterCount, publishButton);

  let selectedMedia = null;
  let previewUrl = "";
  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = "";
    selectedMedia = null;
    preview.replaceChildren();
    preview.hidden = true;
    fileInput.value = "";
  };

  const showPreview = (file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    selectedMedia = file;
    previewUrl = URL.createObjectURL(file);
    preview.replaceChildren();
    const media = file.type.startsWith("video/") ? document.createElement("video") : document.createElement("img");
    media.className = "composer-preview-media";
    media.src = previewUrl;
    if (media instanceof HTMLVideoElement) {
      media.controls = true;
      media.playsInline = true;
    } else {
      media.alt = "Selected post media preview";
    }
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "secondary-button";
    removeButton.textContent = "Remove media";
    removeButton.addEventListener("click", clearPreview);
    preview.append(media, removeButton);
    preview.hidden = false;
  };

  mediaButton.type = "button";
  feelingButton.type = "button";
  locationButton.type = "button";
  publishButton.type = "button";
  mediaButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"]);
    if (!supportedTypes.has(file.type)) {
      fileInput.value = "";
      setComposerStatus("Choose a JPEG, PNG, WebP, MP4, or WebM file.", true);
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      fileInput.value = "";
      setComposerStatus("Media must be 20 MB or smaller.", true);
      return;
    }
    setComposerStatus("");
    showPreview(file);
  });
  feelingButton.addEventListener("click", () => {
    feelingSelect.hidden = !feelingSelect.hidden;
    if (!feelingSelect.hidden) feelingSelect.focus();
  });
  locationButton.addEventListener("click", () => {
    locationInput.hidden = !locationInput.hidden;
    if (!locationInput.hidden) locationInput.focus();
  });
  textarea.addEventListener("input", () => {
    characterCount.textContent = `${textarea.value.length.toLocaleString()} / 2,200`;
  });
  publishButton.addEventListener("click", async () => {
    const content = textarea.value.trim();
    if (!content && !selectedMedia) {
      setComposerStatus("Write something or add a photo/video before publishing.", true);
      return;
    }
    if (content.length > 2200) {
      setComposerStatus("Post text must be 2,200 characters or fewer.", true);
      return;
    }

    publishButton.disabled = true;
    publishButton.setAttribute("aria-busy", "true");
    setComposerStatus("Publishing securely…");
    const formData = new FormData();
    formData.set("content", content);
    formData.set("feeling", feelingSelect.value);
    formData.set("location", locationInput.value.trim());
    if (selectedMedia) formData.set("media", selectedMedia);

    try {
      const response = await fetch("/api/posts", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || `Post publishing failed (${response.status}).`);
      renderPublishedPost(payload.post);
      textarea.value = "";
      characterCount.textContent = "0 / 2,200";
      feelingSelect.value = "";
      feelingSelect.hidden = true;
      locationInput.value = "";
      locationInput.hidden = true;
      clearPreview();
      setComposerStatus("");
      showToast("Post published");
      showRoute("home");
    } catch (error) {
      console.error("Could not publish the Typaa post.", error);
      setComposerStatus(error instanceof Error ? error.message : "Post publishing failed. Please retry.", true);
    } finally {
      publishButton.disabled = false;
      publishButton.removeAttribute("aria-busy");
    }
  });
}

renderVideoCatalog();
loadArchiveMovies();
document.querySelector(".topbar-actions .icon-button")?.addEventListener("click", () => showToast("No new notifications"));
initializePostComposer();
loadUserPosts();
document.querySelector(".order-panel .primary-button.full-width")?.addEventListener("click", () => {
  const quantity = Number(document.querySelector(".order-panel input[type='number']")?.value || 0);
  const leverage = Number.parseInt(document.querySelector("#leverage")?.value || "1", 10);
  const livePrice = liveCandles.length ? liveCandles[liveCandles.length - 1].close : 0;
  const margin = livePrice && quantity ? (livePrice * quantity) / leverage : 0;
  if (!margin || margin > paperPortfolio.cash) {
    showToast("Enter a valid quantity or reduce the order size");
    return;
  }
  paperPortfolio.cash -= margin;
  paperPortfolio.invested += margin;
  renderPortfolio();
  showToast("Paper order calculated from live price");
});
document.querySelector("[data-action='reset-portfolio']")?.addEventListener("click", () => {
  paperPortfolio.cash = paperPortfolio.capital;
  paperPortfolio.invested = 0;
  renderPortfolio();
  showToast("Portfolio reset to $1,000");
});

document.querySelectorAll(".order-panel input, .order-panel select").forEach((input) => {
  input.addEventListener("input", updateOrderEstimate);
  input.addEventListener("change", updateOrderEstimate);
});

document.querySelector(".topbar-search input")?.addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();
  const normalizedQuery = normalizeMarketSearch(query);
  const hasMarketMatch = Boolean(normalizedQuery) && [...(document.querySelector("#market-selector")?.options || [])].some((option) =>
    normalizeMarketSearch(`${option.value} ${option.textContent || ""}`).includes(normalizedQuery),
  );
  if (query.includes("trade") || query.includes("btc") || hasMarketMatch) {
    showRoute("trade");
    const marketSearch = document.querySelector("#market-search");
    if (marketSearch && hasMarketMatch) {
      marketSearch.value = event.target.value;
      renderMarketSearchResults();
    }
  }
  if (query.includes("profile") || query.includes("abhishek")) showRoute("profile");
  if (query.includes("reel")) showRoute("reels");
});

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (liveCandles.length) drawLiveCandles(liveCandles);
  }, 180);
});
window.addEventListener("hashchange", () => showRoute(window.location.hash.slice(1) || "home"));
showRoute(window.location.hash.slice(1) || "home");
renderPortfolio();
initializeMarketSearch();
loadMarketCatalog();
applyTheme(window.localStorage.getItem("typaa-theme") || "dark");
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (window.localStorage.getItem("typaa-theme") === "system") applyTheme("system");
});
