import {
  $,
  RESOLUTION_LABELS,
  benchmarkPagePath,
  benchmarkPath,
  card,
  escapeHtml,
  formatDate,
  getJson,
  language,
  localized,
  memoryLabel,
  setupRelatedCardLayout,
  siteUrl,
  t,
  vendorClass,
  versionSeasonDetails,
  versionSeasonLabel,
  youtubePlayer
} from './shared.js';
import { getBenchmarkIndex, sameConfigurationBenchmarks } from './index-page.js';
import { activeResultGroupFields, resultOverview, resultRows } from './results.js';

async function copyCurrentUrl() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(location.href);
    return;
  }
  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = location.href;
  temporaryInput.style.position = 'fixed';
  temporaryInput.style.opacity = '0';
  document.body.append(temporaryInput);
  temporaryInput.select();
  document.execCommand('copy');
  temporaryInput.remove();
}

function setupCopyLink() {
  const button = $('#copy-link');
  let resetTimer;
  button.addEventListener('click', async () => {
    try {
      await copyCurrentUrl();
      const label = button.querySelector('.copy-label');
      const icon = button.querySelector('.copy-icon');
      clearTimeout(resetTimer);
      label.textContent = t('copied');
      icon.textContent = 'check';
      button.setAttribute('aria-label', t('copied'));
      resetTimer = setTimeout(() => {
        label.textContent = t('copyLink');
        icon.textContent = 'link';
        button.setAttribute('aria-label', t('copyLink'));
      }, 2000);
    } catch {
      // Browsers may block clipboard access outside a secure context.
    }
  });
}

function setDetailSearchMetadata(id, data, game, cpu, gpu) {
  const canonicalUrl = new URL(benchmarkPagePath(id));
  const description = language === 'en'
    ? `${game} benchmark results on ${cpu} and ${gpu}, including graphics settings, average FPS, and 1% low FPS.`
    : `${cpu} と ${gpu} で実施した ${game} のベンチマーク結果。グラフィック設定、平均 FPS、1% Low FPS を掲載。`;
  let descriptionTag = document.querySelector('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement('meta');
    descriptionTag.name = 'description';
    document.head.append(descriptionTag);
  }
  descriptionTag.content = description;
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.rel = 'canonical';
    document.head.append(canonicalTag);
  }
  canonicalTag.href = canonicalUrl.href;
  let structuredData = document.querySelector('#benchmark-structured-data');
  if (!structuredData) {
    structuredData = document.createElement('script');
    structuredData.id = 'benchmark-structured-data';
    structuredData.type = 'application/ld+json';
    document.head.append(structuredData);
  }
  structuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: document.title,
    description,
    url: canonicalUrl.href,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creator: { '@type': 'Organization', name: 'WeaBenchmark' },
    dateCreated: data.testedAt,
    variableMeasured: ['Average FPS', '1% low FPS']
  });
}

async function renderDetail() {
  const target = $('#benchmark-detail');
  const generatedPageId = document.body.dataset.benchmarkId;
  const id = generatedPageId || new URLSearchParams(location.search).get('id');
  if (!id) {
    target.innerHTML = `<p class="error">${t('idMissing')}</p>`;
    return;
  }
  if (!generatedPageId) {
    document.body.dataset.benchmarkId = id;
    history.replaceState(null, '', benchmarkPagePath(id));
  }
  try {
    const [d, benchmarkItems, resolutionLabels] = await Promise.all([
      getJson(benchmarkPath(id)),
      getBenchmarkIndex(),
      getJson(siteUrl(RESOLUTION_LABELS))
    ]);
    const game = localized(d.game), driver = String(d.system.gpuDriver || '').match(/[0-9]+(?:\.[0-9]+)+/)?.[0] || '', versionSeason = versionSeasonLabel(d.version, d.season);
    const resultsOverview = resultOverview(d.results);
    const resultsAreGrouped = activeResultGroupFields(d.display).length > 0;
    const cpuShortName = d.system.cpuShortName || d.system.cpu;
    const gpuShortName = d.system.gpuShortName || d.system.gpu;
    const graphicsCardName = d.system.graphicsCardName || d.system.gpu;
    const relatedBenchmarks = sameConfigurationBenchmarks(benchmarkItems, d);
    document.title = language === 'en'
      ? `${cpuShortName} + ${gpuShortName} — ${game} benchmark results | Wea's Benchmark Archives`
      : `${cpuShortName} + ${gpuShortName} で ${game} 検証結果 | うぇあのゲームベンチまとめ`;
    setDetailSearchMetadata(id, d, game, cpuShortName, gpuShortName);
    const xPostUrl = `https://x.com/intent/post?text=${encodeURIComponent(`${document.title}\n${location.href}\n\n#WeaBenchmark\n@Wea017net `)}`;
    target.innerHTML = `
      <div class="detail-actions">
        <a class="back-button" href="${siteUrl('index.html')}" aria-label="${t('back')}"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span><span class="action-label">${t('back')}</span></a>
        <div class="detail-share-actions">
          <a class="post-to-x" href="${xPostUrl}" target="_blank" rel="noopener" aria-label="${t('postToX')}"><img class="x-logo" src="${siteUrl('assets/x-logo.svg')}" alt=""><span class="action-label">${t('postToX')}</span></a>
          <button class="copy-link" id="copy-link" type="button" aria-label="${t('copyLink')}"><span class="material-symbols-outlined copy-icon" aria-hidden="true">link</span><span class="copy-label action-label">${t('copyLink')}</span></button>
        </div>
      </div>
      <p class="eyebrow detail-eyebrow">BENCHMARK RESULT</p>
      <h1>${escapeHtml(game)}</h1>
      <p class="lead">${[formatDate(d.testedAt), versionSeason].filter(Boolean).map(escapeHtml).join(' · ')}</p>
      <div class="detail-grid">
        <section class="info-box">
          <h2>${t('testEnvironment')}</h2>
          <dl>
            ${d.system.pcModel ? `<dt>${t('pcModel')}</dt><dd>${escapeHtml(d.system.pcModel)}</dd>` : ''}
            <dt>CPU</dt><dd class="component-name ${vendorClass(d.system.cpu, 'cpu')}">${escapeHtml(d.system.cpu)}</dd>
            <dt>GPU</dt><dd class="component-name ${vendorClass(d.system.gpu, 'gpu')}">${escapeHtml(graphicsCardName)}${driver ? ` <small class="driver-version">/ ${escapeHtml(driver)}</small>` : ''}</dd>
            ${d.system.motherboard ? `<dt>${t('motherboard')}</dt><dd>${escapeHtml(d.system.motherboard)}</dd>` : ''}
            <dt>${t('memory')}</dt><dd>${escapeHtml(memoryLabel(d.system.memory))}</dd>
            <dt>OS</dt><dd>${escapeHtml(d.system.os)}</dd>
          </dl>
        </section>
        <section class="info-box">
          <h2>${t('testConditions')}</h2>
          <dl>
            ${versionSeasonDetails(d.version, d.season)}
            <dt>${t('method')}</dt><dd>${escapeHtml(localized(d.method))}</dd>
            <dt class="video-label">${t('video')}</dt><dd>${youtubePlayer(d.videoUrl)}</dd>
          </dl>
        </section>
      </div>
      <section class="results-panel" aria-labelledby="results-title">
        <div class="results-panel-heading">
          <div>
            <p class="results-kicker">PERFORMANCE</p>
            <h2 id="results-title">${t('resultsTable')}</h2>
            <p>${t('resultsDescription')}</p>
          </div>
          <div class="results-legend" aria-hidden="true"><span class="legend-average">${t('averageShort')}</span><span class="legend-low">${t('lowShort')}</span></div>
        </div>
        ${resultsOverview.markup}
        <div class="results-table-scroll">
          <table class="results-table${resultsAreGrouped ? ' results-table-grouped' : ''}">
            <thead>
              <tr><th>${t('conditions')}</th><th>${t('frameRate')}</th></tr>
              ${resultsAreGrouped ? '<tr class="results-table-heading-gap" aria-hidden="true"><td colspan="2"></td></tr>' : ''}
            </thead>
            <tbody>${resultRows(d.results, resultsOverview.maximumFps, resolutionLabels, d.display)}</tbody>
          </table>
        </div>
      </section>
      <section class="info-box">
        <h2>${t('notes')}</h2>
        <p class="note">${escapeHtml(localized(d.notes) || '—')}</p>
      </section>
      <section class="related-benchmarks" aria-labelledby="related-benchmarks-title">
        <h2 id="related-benchmarks-title">${t('sameConfiguration')(relatedBenchmarks.length)}</h2>
        ${relatedBenchmarks.length
          ? `<div class="related-benchmark-grid">${relatedBenchmarks.map(card).join('')}</div>`
          : `<p class="related-benchmarks-empty">${t('noSameConfiguration')}</p>`}
      </section>
      <div class="detail-actions detail-actions-bottom">
        <a class="back-button" href="${siteUrl('index.html')}" aria-label="${t('back')}"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span><span class="action-label">${t('back')}</span></a>
      </div>`;
    setupRelatedCardLayout();
    setupCopyLink();
  } catch (e) {
    target.innerHTML = `<p class="error">${escapeHtml(e.message)}</p>`;
  }
}

export { renderDetail };

