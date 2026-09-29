import { $, applyTranslations, setupLanguage, setupTheme } from './js/shared.js';
import { renderIndex } from './js/index-page.js';
import { renderDetail } from './js/detail-page.js';

function renderPage() {
  if ($('#benchmark-list')) renderIndex();
  else renderDetail();
}

setupTheme();
setupLanguage(renderPage);
applyTranslations();
renderPage();
