/**
 * The page the PDF editor runs in (task #94: KRAP worksheets under "Templates").
 *
 * The same file lives in the web app and in the mobile app, so a worksheet is
 * filled in the same way on both: the web shows it in an <iframe>, the app in a
 * WebView. Keep the two copies identical.
 *
 * PDF.js draws the pages; the worksheet's own form fields (text and check
 * boxes) are laid over them as inputs, and "Add text" puts a free text box
 * anywhere - for the worksheets that have no fields, or a note beside one.
 * On save, pdf-lib writes the answers into the PDF's fields (free text becomes
 * a field of its own), so the saved copy can still be edited in any PDF reader.
 * The blank worksheet is never changed: the host uploads the copy as a new file.
 *
 * The PDF comes in as base64 data, not a URL: the API needs the user's token.
 *
 * Messages to the host (JSON): {type: 'ready', pages, fields}, {type: 'changed'},
 * {type: 'saved', data: <base64 PDF>}, {type: 'failed', stage: 'load' | 'save'}.
 * The host asks for the PDF with window.ctxEditor.save() (the app) or by
 * posting {type: 'save'} to the frame (the web).
 */

export const PDF_EDITOR_PDFJS_VERSION = '3.11.174'
export const PDF_EDITOR_PDF_LIB_VERSION = '1.17.1'
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_EDITOR_PDFJS_VERSION}`
const PDF_LIB_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/${PDF_EDITOR_PDF_LIB_VERSION}/pdf-lib.min.js`

export interface PdfFormEditorLabels {
    addText: string
    addTextHint: string
    done: string
    remove: string
    textPlaceholder: string
    noFields: string
}

/** Base64 never contains these, so it can be dropped into a script as is. */
const isBase64 = (value: string) => /^[A-Za-z0-9+/=\s]*$/.test(value)

/** JSON that is safe inside a <script> element. */
const scriptJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

export function pdfFormEditorHtml(base64: string, labels: PdfFormEditorLabels, background = '#E5E9EE'): string {
    if (!isBase64(base64)) throw new Error('pdfFormEditorHtml expects base64 data')

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  #bar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; background: rgba(255,255,255,0.96); border-bottom: 1px solid #DCE6F0; }
  #bar button { font: inherit; font-size: 14px; font-weight: 600; border-radius: 8px; padding: 7px 12px; border: 1px solid #0F4C75; background: #FFFFFF; color: #0F4C75; cursor: pointer; }
  #bar button.on { background: #0F4C75; color: #FFFFFF; }
  #hint { font-size: 13px; color: #5E6E82; flex: 1; min-width: 160px; }
  #pages { padding: 12px 0 40px; }
  .page { position: relative; margin: 0 auto 14px; background: #FFFFFF; box-shadow: 0 1px 3px rgba(0,0,0,0.18); }
  .page canvas { display: block; width: 100%; height: 100%; }
  .layer { position: absolute; inset: 0; }
  .adding .layer { cursor: crosshair; }
  .field { position: absolute; margin: 0; padding: 1px 2px; border: 1px solid rgba(66,174,217,0.55); background: rgba(66,174,217,0.10); color: #111111; font-family: Helvetica, Arial, sans-serif; line-height: 1.15; resize: none; outline: none; overflow: hidden; border-radius: 2px; }
  .field:focus, .field.active { border-color: #0F4C75; background: rgba(66,174,217,0.18); }
  div.field { white-space: pre-wrap; word-break: break-word; cursor: text; }
  .check { display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; font-weight: 700; color: #0F4C75; }
  .note { position: absolute; border: 1px dashed #0F4C75; background: rgba(255,255,255,0.55); border-radius: 3px; }
  .note .field { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: transparent; }
  .note .handle, .note .remove, .note .size { position: absolute; width: 22px; height: 22px; border-radius: 11px; background: #0F4C75; color: #FFFFFF; font-size: 13px; line-height: 22px; text-align: center; touch-action: none; user-select: none; -webkit-user-select: none; z-index: 2; }
  .note .handle { left: -11px; top: -11px; cursor: move; }
  .note .remove { right: -11px; top: -11px; cursor: pointer; background: #C0392B; }
  .note .size { right: -11px; bottom: -11px; cursor: nwse-resize; }
  #sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; display: none; padding: 12px; background: #FFFFFF; border-top: 1px solid #DCE6F0; box-shadow: 0 -4px 16px rgba(0,0,0,0.12); }
  #sheet.open { display: block; }
  #sheet textarea { width: 100%; min-height: 96px; font: inherit; font-size: 16px; padding: 10px; border: 1px solid #0F4C75; border-radius: 8px; resize: vertical; }
  /* Done sits above the box: below it, the phone's keyboard bar covers it. */
  #sheet .row { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 8px; }
  #sheet button { font: inherit; font-size: 15px; font-weight: 600; border-radius: 8px; padding: 9px 16px; border: 0; background: #0F4C75; color: #FFFFFF; }
</style>
<script src="${PDFJS_BASE}/pdf.min.js"></script>
<script src="${PDF_LIB_URL}"></script>
</head>
<body>
<div id="bar">
  <button type="button" id="add"></button>
  <span id="hint"></span>
</div>
<div id="pages"></div>
<div id="sheet"><div class="row"><button type="button" id="sheetDone"></button></div><textarea id="sheetText"></textarea></div>
<script>
(function () {
  var labels = ${scriptJson(labels)};

  function tell(message) {
    var data = JSON.stringify(message);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(data);
    else if (window.parent && window.parent !== window) window.parent.postMessage(data, '*');
  }
  if (!window.pdfjsLib || !window.PDFLib) { tell({ type: 'failed', stage: 'load' }); return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = '${PDFJS_BASE}/pdf.worker.min.js';

  var raw = atob('${base64.replace(/\s/g, '')}');
  var bytes = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  var container = document.getElementById('pages');
  var addButton = document.getElementById('add');
  var hint = document.getElementById('hint');
  var sheet = document.getElementById('sheet');
  var sheetText = document.getElementById('sheetText');
  addButton.textContent = labels.addText;
  document.getElementById('sheetDone').textContent = labels.done;

  // On a phone the fields are drawn at a size too small to type in, so a tap
  // opens a sheet with a full-size box instead of typing on the page itself.
  var compact = window.innerWidth < 700;
  var fields = {};   // field name -> { type, value, multiline, maxLen, els: [] }
  var notes = [];    // { page, x, y, w, h, text, el } in page units (PDF points, top-left origin)
  var pages = [];    // { index, base (viewport at scale 1), scale, el, layer }
  var adding = false;
  var editing = null;

  function changed() { tell({ type: 'changed' }); }

  function setHint() {
    hint.textContent = adding ? labels.addTextHint : (Object.keys(fields).length ? '' : labels.noFields);
    addButton.className = adding ? 'on' : '';
    document.body.className = adding ? 'adding' : '';
  }
  addButton.addEventListener('click', function () { adding = !adding; setHint(); });

  // --- the sheet (compact screens) ----------------------------------------
  function openSheet(target) {
    editing = target;
    sheetText.value = target.get();
    sheetText.placeholder = labels.textPlaceholder;
    sheet.className = 'open';
    setTimeout(function () { sheetText.focus(); }, 30);
  }
  function closeSheet() {
    if (editing) editing.set(sheetText.value);
    editing = null;
    sheet.className = '';
    sheetText.blur();
  }
  document.getElementById('sheetDone').addEventListener('click', closeSheet);

  function showText(el, value) {
    if (el.tagName === 'DIV') el.textContent = value; else el.value = value;
  }

  // --- the worksheet's own fields -----------------------------------------
  function textField(page, annotation, rect) {
    var name = annotation.fieldName;
    var field = fields[name] || (fields[name] = {
      type: 'text',
      value: typeof annotation.fieldValue === 'string' ? annotation.fieldValue : '',
      multiline: !!annotation.multiLine,
      maxLen: annotation.maxLen || 0,
      els: []
    });
    var fontSize = (annotation.defaultAppearanceData && annotation.defaultAppearanceData.fontSize) || 0;
    var size = fontSize ? fontSize : (field.multiline ? 10 : Math.min(12, Math.max(7, (rect[3] - rect[1]) / page.scale * 0.62)));
    var el = document.createElement(compact ? 'div' : (field.multiline ? 'textarea' : 'input'));
    el.className = 'field';
    el.style.fontSize = (size * page.scale) + 'px';
    if (annotation.alternativeText) el.title = annotation.alternativeText;
    if (!compact && field.maxLen) el.maxLength = field.maxLen;
    showText(el, field.value);

    function set(value) {
      if (field.maxLen) value = value.slice(0, field.maxLen);
      if (!field.multiline) value = value.replace(/\\r?\\n/g, ' ');
      if (value === field.value) return;
      field.value = value;
      field.els.forEach(function (other) { if (other !== el || compact) showText(other, value); });
      changed();
    }
    if (compact) {
      el.addEventListener('click', function () { if (!adding) openSheet({ get: function () { return field.value; }, set: set }); });
    } else {
      el.addEventListener('input', function () { set(el.value); });
    }
    field.els.push(el);
    return el;
  }

  function checkBox(annotation) {
    var name = annotation.fieldName;
    var field = fields[name] || (fields[name] = {
      type: 'check',
      value: !!annotation.fieldValue && annotation.fieldValue !== 'Off',
      els: []
    });
    var el = document.createElement('div');
    el.className = 'field check';
    el.setAttribute('role', 'checkbox');
    function draw() { field.els.forEach(function (box) { box.textContent = field.value ? '\\u2713' : ''; box.setAttribute('aria-checked', field.value ? 'true' : 'false'); }); }
    el.addEventListener('click', function (event) {
      if (adding) return;
      event.stopPropagation();
      field.value = !field.value;
      draw();
      changed();
    });
    field.els.push(el);
    draw();
    return el;
  }

  function place(el, page, rect) {
    var left = Math.min(rect[0], rect[2]), top = Math.min(rect[1], rect[3]);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.width = Math.abs(rect[2] - rect[0]) + 'px';
    el.style.height = Math.abs(rect[3] - rect[1]) + 'px';
    if (el.classList.contains('check')) el.style.fontSize = Math.max(10, Math.abs(rect[3] - rect[1]) * 0.8) + 'px';
    page.layer.appendChild(el);
  }

  // --- free text ------------------------------------------------------------
  var MIN_W = 40, MIN_H = 16;

  function drawNote(note) {
    var s = pages[note.page].scale;
    note.el.style.left = (note.x * s) + 'px';
    note.el.style.top = (note.y * s) + 'px';
    note.el.style.width = (note.w * s) + 'px';
    note.el.style.height = (note.h * s) + 'px';
    note.input.style.fontSize = (10 * s) + 'px';
  }

  function drag(handle, note, move) {
    handle.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var s = pages[note.page].scale;
      var startX = event.clientX, startY = event.clientY;
      var start = { x: note.x, y: note.y, w: note.w, h: note.h };
      var base = pages[note.page].base;
      function onMove(e) {
        var dx = (e.clientX - startX) / s, dy = (e.clientY - startY) / s;
        if (move) {
          note.x = Math.max(0, Math.min(base.width - note.w, start.x + dx));
          note.y = Math.max(0, Math.min(base.height - note.h, start.y + dy));
        } else {
          note.w = Math.max(MIN_W, Math.min(base.width - note.x, start.w + dx));
          note.h = Math.max(MIN_H, Math.min(base.height - note.y, start.h + dy));
        }
        drawNote(note);
      }
      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        changed();
      }
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    });
  }

  function addNote(pageIndex, x, y) {
    var base = pages[pageIndex].base;
    var note = { page: pageIndex, w: Math.min(180, base.width), h: 42, text: '' };
    note.x = Math.max(0, Math.min(base.width - note.w, x));
    note.y = Math.max(0, Math.min(base.height - note.h, y));
    note.el = document.createElement('div');
    note.el.className = 'note';
    note.input = document.createElement(compact ? 'div' : 'textarea');
    note.input.className = 'field';
    if (!compact) note.input.placeholder = labels.textPlaceholder;

    function set(value) {
      if (value === note.text) return;
      note.text = value;
      if (compact) showText(note.input, value);
      changed();
    }
    if (compact) {
      note.input.addEventListener('click', function () { openSheet({ get: function () { return note.text; }, set: set }); });
    } else {
      note.input.addEventListener('input', function () { set(note.input.value); });
    }

    var handle = document.createElement('div'); handle.className = 'handle'; handle.textContent = '\\u2725';
    var size = document.createElement('div'); size.className = 'size'; size.textContent = '\\u2198';
    var remove = document.createElement('div'); remove.className = 'remove'; remove.textContent = '\\u00d7';
    remove.setAttribute('aria-label', labels.remove);
    remove.addEventListener('click', function (event) {
      event.stopPropagation();
      notes.splice(notes.indexOf(note), 1);
      note.el.remove();
      changed();
    });
    drag(handle, note, true);
    drag(size, note, false);
    [note.input, handle, size, remove].forEach(function (child) { note.el.appendChild(child); });
    note.el.addEventListener('click', function (event) { event.stopPropagation(); });
    pages[pageIndex].layer.appendChild(note.el);
    notes.push(note);
    drawNote(note);
    changed();
    if (compact) openSheet({ get: function () { return note.text; }, set: set });
    else note.input.focus();
  }

  // --- pages ------------------------------------------------------------------
  var pdfDocument = null;

  function layout() {
    var width = Math.min(document.documentElement.clientWidth - 24, 980);
    pages.forEach(function (page) {
      page.scale = width / page.base.width;
      page.el.style.width = Math.floor(page.base.width * page.scale) + 'px';
      page.el.style.height = Math.floor(page.base.height * page.scale) + 'px';
    });
  }

  function render(page) {
    var ratio = window.devicePixelRatio || 1;
    return pdfDocument.getPage(page.index + 1).then(function (pdfPage) {
      var viewport = pdfPage.getViewport({ scale: page.scale * ratio });
      var canvas = page.canvas;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      return pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise.then(function () {
        return pdfPage.getAnnotations({ intent: 'display' });
      }).then(function (annotations) {
        var view = pdfPage.getViewport({ scale: page.scale });
        annotations.forEach(function (annotation) {
          if (annotation.subtype !== 'Widget' || !annotation.fieldName || annotation.hidden) return;
          var rect = view.convertToViewportRectangle(annotation.rect);
          if (annotation.fieldType === 'Tx') place(textField(page, annotation, rect), page, rect);
          else if (annotation.fieldType === 'Btn' && annotation.checkBox) place(checkBox(annotation), page, rect);
        });
      });
    });
  }

  pdfjsLib.getDocument({ data: bytes.slice() }).promise.then(function (pdf) {
    pdfDocument = pdf;
    var chain = Promise.resolve();
    for (var n = 0; n < pdf.numPages; n++) {
      (function (index) {
        chain = chain.then(function () { return pdf.getPage(index + 1); }).then(function (pdfPage) {
          var el = document.createElement('div');
          el.className = 'page';
          var canvas = document.createElement('canvas');
          var layer = document.createElement('div');
          layer.className = 'layer';
          el.appendChild(canvas);
          el.appendChild(layer);
          container.appendChild(el);
          var page = { index: index, base: pdfPage.getViewport({ scale: 1 }), el: el, canvas: canvas, layer: layer, scale: 1 };
          layer.addEventListener('click', function (event) {
            if (!adding) return;
            var box = layer.getBoundingClientRect();
            addNote(index, (event.clientX - box.left) / page.scale, (event.clientY - box.top) / page.scale);
            adding = false;
            setHint();
          });
          pages.push(page);
        });
      })(n);
    }
    return chain;
  }).then(function () {
    layout();
    return pages.reduce(function (chain, page) { return chain.then(function () { return render(page); }); }, Promise.resolve());
  }).then(function () {
    setHint();
    tell({ type: 'ready', pages: pages.length, fields: Object.keys(fields).length });
  }).catch(function () { tell({ type: 'failed', stage: 'load' }); });

  // --- saving ------------------------------------------------------------------
  function toBase64(data) {
    var out = '';
    for (var i = 0; i < data.length; i += 0x8000) out += String.fromCharCode.apply(null, data.subarray(i, i + 0x8000));
    return btoa(out);
  }

  function save() {
    if (editing) closeSheet();
    var L = PDFLib;
    return L.PDFDocument.load(bytes).then(function (doc) {
      return doc.embedFont(L.StandardFonts.Helvetica).then(function (font) {
        // The standard font covers Danish, Norwegian and Swedish; anything it
        // cannot draw (an emoji) would stop the whole save, so it is replaced.
        var known = {};
        font.getCharacterSet().forEach(function (code) { known[code] = true; });
        function clean(text) {
          return Array.from(text || '').map(function (c) { return c === '\\n' || known[c.codePointAt(0)] ? c : '?'; }).join('').replace(/\\r/g, '');
        }
        var form = doc.getForm();
        Object.keys(fields).forEach(function (name) {
          var field = fields[name];
          try {
            var target = form.getField(name);
            if (field.type === 'text' && target instanceof L.PDFTextField) {
              var text = clean(field.value);
              var max = target.getMaxLength();
              target.setText(max ? text.slice(0, max) : text);
            } else if (field.type === 'check' && target instanceof L.PDFCheckBox) {
              if (field.value) target.check(); else target.uncheck();
            }
          } catch (e) { /* a field pdf-lib cannot read keeps its blank value */ }
        });
        var stamp = Date.now();
        notes.forEach(function (note, index) {
          if (!note.text.trim()) return;
          var base = pages[note.page].base;
          var a = base.convertToPdfPoint(note.x, note.y);
          var b = base.convertToPdfPoint(note.x + note.w, note.y + note.h);
          var page = doc.getPage(note.page);
          // On a turned page (a landscape worksheet stored as portrait) the
          // box turns with it, so its text reads the way the page is shown.
          // pdf-lib then wants the box as seen and its corner on the page.
          var rotation = ((page.getRotation().angle % 360) + 360) % 360;
          var rx = Math.min(a[0], b[0]), ry = Math.min(a[1], b[1]);
          var rw = Math.abs(b[0] - a[0]), rh = Math.abs(b[1] - a[1]);
          var turned = rotation === 90 || rotation === 270;
          var field = form.createTextField('citizenone_text_' + stamp + '_' + index);
          field.enableMultiline();
          field.setText(clean(note.text));
          field.addToPage(page, {
            x: rotation === 90 || rotation === 180 ? rx + rw : rx,
            y: rotation === 180 || rotation === 270 ? ry + rh : ry,
            width: turned ? rh : rw,
            height: turned ? rw : rh,
            rotate: L.degrees(rotation),
            font: font,
            textColor: L.rgb(0, 0, 0),
            backgroundColor: undefined,
            borderColor: undefined,
            borderWidth: 0
          });
          field.setFontSize(10);
        });
        form.updateFieldAppearances(font);
        return doc.save();
      });
    }).then(function (saved) {
      tell({ type: 'saved', data: toBase64(saved) });
    }).catch(function () { tell({ type: 'failed', stage: 'save' }); });
  }

  window.ctxEditor = { save: save };
  window.addEventListener('message', function (event) {
    var message = event.data;
    if (typeof message === 'string') { try { message = JSON.parse(message); } catch (e) { return; } }
    if (message && message.type === 'save') save();
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (!pdfDocument || compact) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var before = pages.map(function (page) { return page.scale; });
      layout();
      pages.forEach(function (page, index) {
        var factor = page.scale / before[index];
        if (Math.abs(factor - 1) < 0.01) return;
        Array.prototype.forEach.call(page.layer.querySelectorAll(':scope > .field'), function (el) {
          ['left', 'top', 'width', 'height', 'fontSize'].forEach(function (prop) { el.style[prop] = (parseFloat(el.style[prop]) * factor) + 'px'; });
        });
        notes.forEach(function (note) { if (note.page === page.index) drawNote(note); });
        var ratio = window.devicePixelRatio || 1;
        pdfDocument.getPage(page.index + 1).then(function (pdfPage) {
          var viewport = pdfPage.getViewport({ scale: page.scale * ratio });
          page.canvas.width = Math.floor(viewport.width);
          page.canvas.height = Math.floor(viewport.height);
          pdfPage.render({ canvasContext: page.canvas.getContext('2d'), viewport: viewport });
        });
      });
    }, 200);
  });
})();
</script>
</body>
</html>`
}
