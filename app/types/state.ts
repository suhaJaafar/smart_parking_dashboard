/**
 * State enum — mirrors Laravel `App\Enums\StateTypes` (int-backed).
 */
export enum State {
	BAGHDAD = 1,
	BASRAH = 2,
	MOSUL = 3,
	ERBIL = 4,
	SULAYMANIYAH = 5,
	DIYALA = 6,
	NINEVEH = 7,
	ANBAR = 8,
	KIRKUK = 9,
	SALAH_AL_DIN = 10,
	WASIT = 11,
	MUTHANNA = 12,
	QADISSIYA = 13,
	NAJAF = 14,
	DIWANIYA = 15,
	KARBALA = 16,
	MAYSAN = 17,
}

export const STATE_LABEL: Record<State, string> = {
	[State.BAGHDAD]: 'Baghdad',
	[State.BASRAH]: 'Basrah',
	[State.MOSUL]: 'Mosul',
	[State.ERBIL]: 'Erbil',
	[State.SULAYMANIYAH]: 'Sulaymaniyah',
	[State.DIYALA]: 'Diyala',
	[State.NINEVEH]: 'Nineveh',
	[State.ANBAR]: 'Anbar',
	[State.KIRKUK]: 'Kirkuk',
	[State.SALAH_AL_DIN]: 'Salah al-Din',
	[State.WASIT]: 'Wasit',
	[State.MUTHANNA]: 'Muthanna',
	[State.QADISSIYA]: 'Qadissiya',
	[State.NAJAF]: 'Najaf',
	[State.DIWANIYA]: 'Diwaniya',
	[State.KARBALA]: 'Karbala',
	[State.MAYSAN]: 'Maysan',
};

export const STATE_OPTIONS: ReadonlyArray<{ value: State; label: string }> =
	Object.values(State)
		.filter((v): v is State => typeof v === 'number')
		.map((value) => ({ value, label: STATE_LABEL[value] }));
