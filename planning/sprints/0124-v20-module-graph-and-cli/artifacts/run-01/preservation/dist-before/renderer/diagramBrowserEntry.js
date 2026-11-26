import { AmxError } from '../diagnostics/errors';
import { deserializeDiagramSceneModel, evaluateDiagramFrame } from '../runtime/diagramModel';
const SVG_NS = 'http://www.w3.org/2000/svg';
const activeStates = new Set();
function svgElement(name, attributes = {}) {
    const element = document.createElementNS(SVG_NS, name);
    for (const [key, value] of Object.entries(attributes))
        element.setAttribute(key, String(value));
    return element;
}
function positionText(element, x, y) {
    element.setAttribute('x', String(x));
    element.setAttribute('y', String(y));
    element.setAttribute('transform', `translate(0 ${2 * y}) scale(1 -1)`);
}
function renderFrame(state, frame) {
    const { model, canvas } = state;
    const defs = svgElement('defs');
    const marker = svgElement('marker', {
        id: `${canvas.dataset.diagramId}-arrowhead`,
        markerWidth: 6,
        markerHeight: 6,
        refX: 10,
        refY: 5,
        orient: 'auto-start-reverse',
        markerUnits: 'strokeWidth',
        viewBox: '0 0 10 10'
    });
    marker.append(svgElement('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: 'context-stroke' }));
    defs.append(marker);
    const coordinates = svgElement('g', { transform: `translate(0 ${model.canvas.height}) scale(1 -1)` });
    for (const item of frame.elements) {
        if (item.primitive === 'line') {
            const line = svgElement('line', {
                x1: item.x1, y1: item.y1, x2: item.x2, y2: item.y2,
                stroke: item.stroke, 'stroke-width': item.lineWidth, 'stroke-linecap': 'round'
            });
            line.setAttribute('data-diagram-element', item.name);
            if (item.arrow === 'start' || item.arrow === 'both')
                line.setAttribute('marker-start', `url(#${canvas.dataset.diagramId}-arrowhead)`);
            if (item.arrow === 'end' || item.arrow === 'both')
                line.setAttribute('marker-end', `url(#${canvas.dataset.diagramId}-arrowhead)`);
            coordinates.append(line);
        }
        else if (item.primitive === 'rectangle') {
            const rectangle = svgElement('rect', {
                x: item.x, y: item.y, width: item.width, height: item.height,
                stroke: item.stroke, fill: item.fill ?? 'none', 'stroke-width': item.lineWidth
            });
            rectangle.setAttribute('data-diagram-element', item.name);
            coordinates.append(rectangle);
        }
        else if (item.primitive === 'circle') {
            const circle = svgElement('circle', {
                cx: item.cx, cy: item.cy, r: item.r,
                stroke: item.stroke, fill: item.fill ?? 'none', 'stroke-width': item.lineWidth
            });
            circle.setAttribute('data-diagram-element', item.name);
            coordinates.append(circle);
        }
        else {
            const text = svgElement('text', { fill: item.fill, 'font-family': 'sans-serif', 'font-size': 12 });
            positionText(text, item.x, item.y);
            text.setAttribute('data-diagram-element', item.name);
            text.textContent = item.value;
            coordinates.append(text);
        }
    }
    canvas.replaceChildren(defs, coordinates);
    canvas.removeAttribute('aria-hidden');
}
function sendFailure(detail) {
    window.dispatchEvent(new CustomEvent('openamx-diagram-frame', { detail }));
}
async function deserializePayload(payload) {
    if (payload.dataset.encoding !== 'gzip-base64')
        throw new Error('Unsupported diagram data encoding.');
    const encoded = atob(payload.textContent ?? '');
    const bytes = new Uint8Array(encoded.length);
    for (let index = 0; index < encoded.length; index++)
        bytes[index] = encoded.charCodeAt(index);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return deserializeDiagramSceneModel(await new Response(stream).text());
}
function syncControls(state) {
    const title = state.model.title;
    const displayTime = state.time.toFixed(3).toString();
    state.playButton.textContent = state.running ? 'Pause' : 'Play';
    state.playButton.setAttribute('aria-label', `${state.running ? 'Pause' : 'Play'} ${title}`);
    state.scrubber.value = String(state.time);
    state.scrubber.setAttribute('aria-valuetext', displayTime);
    state.timeOutput.value = displayTime;
    state.timeOutput.textContent = displayTime;
}
function stop(state) {
    state.running = false;
    if (state.animationFrame !== undefined)
        cancelAnimationFrame(state.animationFrame);
    state.animationFrame = undefined;
    syncControls(state);
}
function selectTime(state, time) {
    state.time = time;
    syncControls(state);
    try {
        const frame = evaluateDiagramFrame(state.model, time);
        renderFrame(state, frame);
        state.alert.hidden = true;
        state.alert.textContent = '';
        if (state.failed) {
            state.failed = false;
            sendFailure({ version: 1, type: 'diagram-recovered', diagramId: state.canvas.dataset.diagramId });
        }
        return true;
    }
    catch (error) {
        stop(state);
        state.canvas.replaceChildren();
        state.canvas.setAttribute('aria-hidden', 'true');
        state.failed = true;
        const failure = error instanceof AmxError
            ? {
                code: error.code,
                message: error.message,
                file: error.file ?? state.model.file,
                line: error.line ?? state.model.source?.line,
                column: error.column ?? state.model.source?.column
            }
            : {
                code: 'DIAGRAM_RUNTIME',
                message: 'The diagram frame could not be evaluated.',
                file: state.model.file,
                line: state.model.source?.line,
                column: state.model.source?.column
            };
        const location = failure.file
            ? `${failure.file}${failure.line ? `:${failure.line}${failure.column ? `:${failure.column}` : ''}` : ''}`
            : failure.line ? `${failure.line}${failure.column ? `:${failure.column}` : ''}` : '';
        state.alert.textContent = `${failure.code}: ${failure.message}${location ? ` (${location})` : ''}`;
        state.alert.hidden = false;
        sendFailure({
            version: 1,
            type: 'diagram-error',
            diagramId: state.canvas.dataset.diagramId,
            ...failure
        });
        return false;
    }
}
function play(state) {
    if (state.running || state.failed)
        return;
    if (state.time >= state.model.timeline.to) {
        const loop = state.canvas.closest('[data-openamx-diagram]')?.querySelector('[data-diagram-loop]');
        if (!loop?.checked)
            return;
        selectTime(state, state.model.timeline.from);
    }
    state.running = true;
    state.startedAt = performance.now() - ((state.time - state.model.timeline.from)
        / (state.model.timeline.to - state.model.timeline.from)) * state.model.timeline.duration * 1000;
    syncControls(state);
    state.animationFrame = requestAnimationFrame(timestamp => advance(state, timestamp));
}
function advance(state, timestamp) {
    if (!state.running || !document.contains(state.canvas)) {
        stop(state);
        return;
    }
    const durationSeconds = state.model.timeline.duration;
    const progress = (timestamp - state.startedAt) / 1000 / durationSeconds;
    if (progress >= 1) {
        const root = state.canvas.closest('[data-openamx-diagram]');
        const loop = root?.querySelector('[data-diagram-loop]')?.checked ?? false;
        if (!loop) {
            selectTime(state, state.model.timeline.to);
            stop(state);
            return;
        }
        if (!selectTime(state, state.model.timeline.from))
            return;
        state.startedAt = timestamp;
    }
    else {
        const from = state.model.timeline.from;
        const to = state.model.timeline.to;
        const time = progress <= 0 ? from : from * (1 - progress) + to * progress;
        if (!selectTime(state, time))
            return;
    }
    state.animationFrame = requestAnimationFrame(next => advance(state, next));
}
async function initialize(root) {
    const payload = root.querySelector('[data-diagram-model]');
    const canvas = root.querySelector('[data-diagram-canvas]');
    const playButton = root.querySelector('[data-diagram-play]');
    const resetButton = root.querySelector('[data-diagram-reset]');
    const scrubber = root.querySelector('[data-diagram-scrubber]');
    const loop = root.querySelector('[data-diagram-loop]');
    const timeOutput = root.querySelector('[data-diagram-time]');
    const alert = root.querySelector('[data-diagram-error]');
    if (!payload || !canvas || !playButton || !resetButton || !scrubber || !loop || !timeOutput || !alert) {
        throw new Error('Diagram HTML is missing required runtime elements.');
    }
    const model = await deserializePayload(payload);
    canvas.dataset.diagramId = root.dataset.diagramId;
    const state = {
        model, canvas, playButton, scrubber, timeOutput, alert,
        running: false, failed: false, time: model.timeline.from, startedAt: 0
    };
    activeStates.add(state);
    syncControls(state);
    playButton.addEventListener('click', () => {
        if (state.running)
            stop(state);
        else
            play(state);
    });
    resetButton.addEventListener('click', () => {
        stop(state);
        selectTime(state, model.timeline.from);
    });
    scrubber.addEventListener('input', () => {
        const selectedTime = Number(scrubber.value);
        stop(state);
        selectTime(state, selectedTime);
    });
    selectTime(state, model.timeline.from);
}
async function initializeAll() {
    for (const root of Array.from(document.querySelectorAll('[data-openamx-diagram]'))) {
        try {
            await initialize(root);
        }
        catch (error) {
            const alert = root.querySelector('[data-diagram-error]');
            if (!alert)
                throw error;
            alert.textContent = `DIAGRAM_RUNTIME: ${error instanceof Error ? error.message : 'The diagram could not be initialized.'}`;
            alert.hidden = false;
            sendFailure({
                version: 1,
                type: 'diagram-error',
                diagramId: root.dataset.diagramId ?? '',
                code: 'DIAGRAM_RUNTIME',
                message: alert.textContent
            });
        }
    }
}
document.addEventListener('DOMContentLoaded', () => { void initializeAll(); }, { once: true });
window.addEventListener('pagehide', () => {
    for (const state of activeStates)
        stop(state);
    activeStates.clear();
}, { once: true });
//# sourceMappingURL=diagramBrowserEntry.js.map