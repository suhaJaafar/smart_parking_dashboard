/**
 * Normalisation helpers that map free-text geocoder responses into the
 * project's *closed* country/state enums.
 *
 * Returning `null` is a first-class outcome — when we can't confidently map
 * a name we leave the dropdown blank rather than guess.
 */

import { Country, COUNTRY_LABEL } from '@/app/types/country';
import { State, STATE_LABEL } from '@/app/types/state';

/** Lowercase, strip accents/non-alphanumerics, collapse whitespace. */
function normalize(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Names a geocoder might return that map to our enum members. */
const STATE_ALIASES: Record<string, State> = {
	baghdad: State.BAGHDAD,
	basrah: State.BASRAH,
	basra: State.BASRAH,
	mosul: State.MOSUL,
	erbil: State.ERBIL,
	arbil: State.ERBIL,
	sulaymaniyah: State.SULAYMANIYAH,
	suleymaniyeh: State.SULAYMANIYAH,
	'al sulaymaniyah': State.SULAYMANIYAH,
	diyala: State.DIYALA,
	nineveh: State.NINEVEH,
	ninawa: State.NINEVEH,
	'ninawa governorate': State.NINEVEH,
	anbar: State.ANBAR,
	'al anbar': State.ANBAR,
	kirkuk: State.KIRKUK,
	'salah al din': State.SALAH_AL_DIN,
	saladin: State.SALAH_AL_DIN,
	'salah ad din': State.SALAH_AL_DIN,
	wasit: State.WASIT,
	muthanna: State.MUTHANNA,
	'al muthanna': State.MUTHANNA,
	qadissiya: State.QADISSIYA,
	'al qadisiyyah': State.QADISSIYA,
	qadisiyya: State.QADISSIYA,
	najaf: State.NAJAF,
	diwaniya: State.DIWANIYA,
	karbala: State.KARBALA,
	maysan: State.MAYSAN,
	missan: State.MAYSAN,
};

const STATE_LABEL_INDEX: Record<string, State> = Object.fromEntries(
	(Object.values(State).filter((v) => typeof v === 'number') as State[]).map(
		(v) => [normalize(STATE_LABEL[v]), v],
	),
);

/** Match a free-text country name to our enum; defaults to OTHER. */
export function matchCountry(name: string | null | undefined): Country {
	if (!name) return Country.OTHER;
	const key = normalize(name);
	if (key === normalize(COUNTRY_LABEL[Country.IRAQ])) return Country.IRAQ;
	return Country.OTHER;
}

/** Match a free-text state name to our enum; `null` if no confident match. */
export function matchState(name: string | null | undefined): State | null {
	if (!name) return null;
	// Strip common suffixes like "Governorate" / "Province".
	const cleaned = normalize(name)
		.replace(/\b(governorate|province|muhafazah|muhafazat)\b/g, '')
		.replace(/\s+/g, ' ')
		.trim();

	return STATE_ALIASES[cleaned] ?? STATE_LABEL_INDEX[cleaned] ?? null;
}
