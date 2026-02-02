export interface Segment {
	start: number;
	end: number;
}

function isWordChar(c: string): boolean {
	return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
}

function isIdentifierChar(c: string): boolean {
	return isWordChar(c) || c === '_' || c === '-';
}

function isUpperCase(c: string): boolean {
	return c >= 'A' && c <= 'Z';
}

export function getSegments(word: string): Segment[] {
	const segments: Segment[] = [];
	let i = 0;

	while (i < word.length) {
		if (word[i] === '_' || word[i] === '-') {
			i++;
			continue;
		}
		if (!isWordChar(word[i])) {
			i++;
			continue;
		}
		const start = i;
		let end = i;
		let prevUpper = isUpperCase(word[i]);
		i++;

		while (i < word.length) {
			if (word[i] === '_' || word[i] === '-') break;
			if (!isWordChar(word[i])) break;
			const currUpper = isUpperCase(word[i]);
			if (prevUpper && !currUpper) {
				let j = i - 2;
				while (j >= start && isUpperCase(word[j])) j--;
				if (i - 1 - j >= 2) break;
			}
			if (!prevUpper && currUpper) break;
			prevUpper = currUpper;
			end = i;
			i++;
		}
		segments.push({ start, end: end + 1 });
	}
	return segments;
}

export function findWordBoundaries(
	text: string,
	position: number,
): { start: number; end: number } | null {
	if (position < 0 || position > text.length) return null;
	let start = position;
	while (start > 0 && isIdentifierChar(text[start - 1])) start--;
	let end = position;
	while (end < text.length && isIdentifierChar(text[end])) end++;
	const word = text.slice(start, end);
	if (word.length === 0 || /^[_\-\s]+$/.test(word)) return null;
	if (!/[a-zA-Z0-9]/.test(word)) return null;
	return { start, end };
}

function findPreviousWord(text: string, beforePos: number): { start: number; end: number } | null {
	let pos = beforePos - 1;
	while (pos >= 0 && !isIdentifierChar(text[pos])) pos--;
	if (pos < 0) return null;
	return findWordBoundaries(text, pos);
}

function findNextWord(text: string, afterPos: number): { start: number; end: number } | null {
	let pos = afterPos;
	while (pos < text.length && !isIdentifierChar(text[pos])) pos++;
	if (pos >= text.length) return null;
	return findWordBoundaries(text, pos);
}

export function navigate(
	text: string,
	position: number,
	direction: 'left' | 'right',
): number | null {
	const bounds = findWordBoundaries(text, position);
	if (!bounds) {
		if (direction === 'right') {
			const next = findNextWord(text, position);
			if (!next) return null;

			const word = text.slice(next.start, next.end);
			const segments = getSegments(word);

			if (segments.length > 1) {
				return next.start + segments[0].end;
			}

			return next.end;
		} else {
			const prev = findPreviousWord(text, position);
			return prev ? prev.end : null;
		}
	}

	const word = text.slice(bounds.start, bounds.end);
	const segments = getSegments(word);
	const hasInternalSegments = segments.length > 1;

	if (!hasInternalSegments) return null;

	const absSegments = segments.map((s) => ({
		start: bounds.start + s.start,
		end: bounds.start + s.end,
	}));
	const relPos = position - bounds.start;

	let segmentIndex = -1;
	let onSeparator = false;

	for (let i = 0; i < absSegments.length; i++) {
		if (position > absSegments[i].start && position < absSegments[i].end) {
			segmentIndex = i;
			break;
		}
	}
	if (segmentIndex === -1 && position >= bounds.start && position < bounds.end) {
		if (word[relPos] === '_' || word[relPos] === '-') onSeparator = true;
	}

	if (direction === 'right') {
		if (position === bounds.start) return absSegments[1].start;
		if (position === bounds.end) {
			const next = findNextWord(text, bounds.end);
			return next ? next.start : null;
		}
		if (onSeparator) {
			let idx = relPos + 1;
			while (idx < word.length && (word[idx] === '_' || word[idx] === '-')) idx++;
			if (idx < word.length) {
				const seg = segments.find((s) => s.start <= idx && idx < s.end);
				if (seg) return bounds.start + seg.end;
			}
			return bounds.end;
		}
		if (segmentIndex >= 0) {
			if (segmentIndex < absSegments.length - 1) return absSegments[segmentIndex + 1].start;
			return bounds.end;
		}
	} else {
		if (position === bounds.start) {
			const prev = findPreviousWord(text, bounds.start);
			return prev ? prev.end : null;
		}
		if (position === bounds.end) return absSegments[absSegments.length - 1].start;
		if (onSeparator) {
			let idx = relPos - 1;
			while (idx >= 0 && (word[idx] === '_' || word[idx] === '-')) idx--;
			if (idx >= 0) {
				const seg = segments.find((s) => s.start <= idx && idx < s.end);
				if (seg) return bounds.start + seg.start;
			}
			return bounds.start;
		}
		if (segmentIndex >= 0) return absSegments[segmentIndex].start;
		if (segmentIndex === -1 && position > bounds.start && position < bounds.end) {
			const candidates = absSegments.filter((s) => s.end <= position);
			const leftSeg = candidates.length > 0 ? candidates[candidates.length - 1] : null;
			if (leftSeg) return leftSeg.start;
		}
	}
	return null;
}
