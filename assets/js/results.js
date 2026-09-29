import {
  escapeHtml,
  graphicsApiText,
  language,
  localized,
  t
} from './shared.js';

function upscalingLabel(result) {
  return [result.upscalingType, result.upscalingQuality]
    .map(value => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

function upscalingClass(result) {
  const type = String(result.upscalingType || '').toLowerCase();
  const quality = String(result.upscalingQuality || '').toLowerCase();
  if (type.includes('dlss') || (type.includes('nvidia') && quality.includes('dlaa'))) return 'upscaling-dlss';
  if (type.includes('fsr')) return 'upscaling-fsr';
  if (type.includes('xess')) return 'upscaling-xess';
  return '';
}

function frameGenerationLabel(result) {
  return [result.frameGenerationType, result.frameGenerationMultiplier]
    .map(value => String(value ?? '').trim())
    .filter(Boolean)
    .join(' ');
}

function frameGenerationClass(result) {
  const type = String(result.frameGenerationType || '').toLowerCase();
  if (type.includes('dlss')) return 'upscaling-dlss';
  if (type.includes('fsr') || type.includes('afmf')) return 'upscaling-fsr';
  if (type.includes('xess')) return 'upscaling-xess';
  return '';
}

function numericFps(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function fpsBarWidth(value, maximum) {
  if (!maximum) return 0;
  return Math.min(100, (numericFps(value) / maximum) * 100).toFixed(2);
}

function fpsMetric(label, value, maximum, type) {
  return `<div class="fps-metric fps-metric-${type}">
    <span class="fps-metric-label">${escapeHtml(label)}</span>
    <span class="fps-track" aria-hidden="true"><span class="fps-bar" style="width:${fpsBarWidth(value, maximum)}%"></span></span>
    <span class="fps-value"><strong>${escapeHtml(value)}</strong><small>FPS</small></span>
  </div>`;
}

function resolutionLabel(result, resolutionLabels) {
  const dimensions = `${result.resolutionX}x${result.resolutionY}`;
  const name = resolutionLabels[dimensions];
  return name ? `${name} (${dimensions})` : dimensions;
}

function overviewResolutionLabel(result) {
  const width = Number.parseInt(result?.resolutionX, 10);
  const height = Number.parseInt(result?.resolutionY, 10);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return '';
  return width >= height ? `${height}p` : `${width}x${height}`;
}

function resultChip(key, label, value, className = '') {
  if (!value) return '';
  const fullLabel = `${label}: ${value}`;
  return `<span class="result-chip ${className}" title="${escapeHtml(fullLabel)}"><span class="sr-only">${escapeHtml(fullLabel)}</span><span class="result-chip-key" aria-hidden="true">${escapeHtml(key)}</span><span class="result-chip-value" aria-hidden="true">${escapeHtml(value)}</span></span>`;
}

const RESULT_GROUP_FIELDS = new Set(['gameMode', 'resolution', 'preset', 'upscaling', 'frameGeneration', 'graphicsApi']);

function stableLocalizedValue(value) {
  if (value === null || typeof value !== 'object') return String(value ?? '').trim();
  return JSON.stringify(Object.keys(value).sort().map(key => [key, String(value[key] ?? '').trim()]));
}

function resultField(result, field, resolutionLabels) {
  if (field === 'gameMode') {
    const key = String(localized(result.gameModeKey) ?? '').trim() || 'MODE';
    return { identity: `${key}\u0000${stableLocalizedValue(result.gameMode)}`, key, label: t('gameMode'), value: String(localized(result.gameMode) ?? '').trim(), className: '' };
  }
  if (field === 'resolution') {
    return { identity: `${result.resolutionX}x${result.resolutionY}`, key: 'RES', label: t('resolution'), value: resolutionLabel(result, resolutionLabels), className: 'result-resolution' };
  }
  if (field === 'preset') {
    return { identity: stableLocalizedValue(result.preset), key: 'PRESET', label: t('graphics'), value: String(localized(result.preset) ?? '').trim(), className: 'result-resolution' };
  }
  if (field === 'upscaling') {
    return { identity: `${String(result.upscalingType ?? '').trim()}\u0000${String(result.upscalingQuality ?? '').trim()}`, key: 'SR', label: t('upscaling'), value: upscalingLabel(result), className: upscalingClass(result) };
  }
  if (field === 'frameGeneration') {
    return { identity: `${String(result.frameGenerationType ?? '').trim()}\u0000${String(result.frameGenerationMultiplier ?? '').trim()}`, key: 'FG', label: t('frameGeneration'), value: frameGenerationLabel(result), className: frameGenerationClass(result) };
  }
  return { identity: String(result.graphicsApi ?? '').trim(), key: 'API', label: t('graphicsApi'), value: String(graphicsApiText(result.graphicsApi) || '').trim(), className: '' };
}

function activeResultGroupFields(display) {
  if (display?.groupResults !== true) return [];
  const requested = Array.isArray(display.groupBy) ? display.groupBy : [display.groupBy];
  return [...new Set(requested.filter(field => RESULT_GROUP_FIELDS.has(field)))];
}

function resultRow(result, maximumFps, resolutionLabels, groupedFields = new Set(), groupClass = '') {
  const fields = Object.fromEntries([...RESULT_GROUP_FIELDS].map(field => [field, resultField(result, field, resolutionLabels)]));
  const primaryChips = [
    !groupedFields.has('gameMode') ? resultChip(fields.gameMode.key, fields.gameMode.label, fields.gameMode.value) : '',
    !groupedFields.has('resolution') ? resultChip(fields.resolution.key, fields.resolution.label, fields.resolution.value, fields.resolution.className) : ''
  ].join('');
  const technologyChips = [
    !groupedFields.has('upscaling') ? resultChip(fields.upscaling.key, fields.upscaling.label, fields.upscaling.value, fields.upscaling.className) : '',
    !groupedFields.has('frameGeneration') ? resultChip(fields.frameGeneration.key, fields.frameGeneration.label, fields.frameGeneration.value, fields.frameGeneration.className) : '',
    !groupedFields.has('graphicsApi') ? resultChip(fields.graphicsApi.key, fields.graphicsApi.label, fields.graphicsApi.value) : ''
  ].join('');
  const chipGroups = `${primaryChips ? `<div class="result-chips result-chips-primary">${primaryChips}</div>` : ''}${technologyChips ? `<div class="result-chips result-chips-technology">${technologyChips}</div>` : ''}`;
  return `<tr class="result-data-row${groupClass ? ` ${groupClass}` : ''}">
    <td class="result-config-cell">
      <strong class="result-preset">${escapeHtml(localized(result.preset))}</strong>
      ${chipGroups ? `<div class="result-chip-groups">${chipGroups}</div>` : ''}
    </td>
    <td class="result-performance-cell">
      ${fpsMetric(t('averageShort'), result.averageFps, maximumFps, 'average')}
      ${fpsMetric(t('lowShort'), result.onePercentLowFps, maximumFps, 'low')}
    </td>
  </tr>`;
}

function resultGroupHeading(fields, index, count) {
  const chips = fields.map(field => resultChip(field.key, field.label, field.value || t('notSpecified'), field.className)).join('');
  return `<tr class="result-group-heading"><td colspan="2"><div class="result-group-heading-content"><span class="result-group-label">${escapeHtml(t('resultGroup')(index, count))}</span><div class="result-chips">${chips}</div></div></td></tr>`;
}

function resultRows(results, maximumFps, resolutionLabels, display) {
  const groupFields = activeResultGroupFields(display);
  if (!groupFields.length) return results.map(result => resultRow(result, maximumFps, resolutionLabels)).join('');

  const groups = new Map();
  for (const result of results) {
    const fields = groupFields.map(field => resultField(result, field, resolutionLabels));
    const identity = JSON.stringify(fields.map(field => field.identity));
    if (!groups.has(identity)) groups.set(identity, { fields, results: [] });
    groups.get(identity).results.push(result);
  }
  const groupedFields = new Set(groupFields);
  return [...groups.values()].map((group, groupIndex) => {
    const rows = group.results.map((result, resultIndex) => resultRow(
      result,
      maximumFps,
      resolutionLabels,
      groupedFields,
      `result-group-member${resultIndex === group.results.length - 1 ? ' result-group-end' : ''}`
    )).join('');
    const gap = groupIndex ? '<tr class="result-group-gap" aria-hidden="true"><td colspan="2"></td></tr>' : '';
    return `${gap}${resultGroupHeading(group.fields, groupIndex + 1, group.results.length)}${rows}`;
  }).join('');
}

function resultOverview(results) {
  const peakResult = results.reduce((best, result) => {
    if (!best) return result;
    const averageDifference = numericFps(result.averageFps) - numericFps(best.averageFps);
    if (averageDifference !== 0) return averageDifference > 0 ? result : best;
    return numericFps(result.onePercentLowFps) > numericFps(best.onePercentLowFps) ? result : best;
  }, null);
  const peakAverage = numericFps(peakResult?.averageFps);
  const peakLow = numericFps(peakResult?.onePercentLowFps);
  const maximumFps = Math.max(0, ...results.flatMap(result => [numericFps(result.averageFps), numericFps(result.onePercentLowFps)]));
  const peakResolution = overviewResolutionLabel(peakResult);
  const peakUsesFrameGeneration = Boolean(peakResult && frameGenerationClass(peakResult));
  const resolutionMarkup = peakResolution ? ` <small class="result-stat-resolution">@ ${escapeHtml(peakResolution)}</small>` : '';
  const frameGenerationMarkup = peakUsesFrameGeneration ? ` <small class="frame-generation-note">${escapeHtml(t('frameGenerationNote'))}</small>` : '';
  return {
    maximumFps,
    markup: `<div class="results-overview">
      <div class="result-stat"><span>${t('peakAverage')}</span><strong>${escapeHtml(peakAverage)} <small>FPS</small>${resolutionMarkup}${frameGenerationMarkup}</strong></div>
      <div class="result-stat"><span>${t('peakLow')}</span><strong>${escapeHtml(peakLow)} <small>FPS</small>${resolutionMarkup}${frameGenerationMarkup}</strong></div>
      <div class="result-stat"><span>${t('testPattern')}</span><strong>${escapeHtml(results.length)} <small>${language === 'ja' ? '件' : ''}</small></strong></div>
    </div>`
  };
}

export {
  activeResultGroupFields,
  resultOverview,
  resultRows
};

