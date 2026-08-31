import { State } from '@/app/types/state';

/**
 * Arabic governorate names for the Mini App.
 *
 * Kept separate from `STATE_LABEL` (English, used by the dashboard) so neither
 * surface has to compromise — same numeric enum, different presentation.
 */
export const STATE_LABEL_AR: Record<State, string> = {
	[State.BAGHDAD]: 'بغداد',
	[State.BASRAH]: 'البصرة',
	[State.MOSUL]: 'الموصل',
	[State.ERBIL]: 'أربيل',
	[State.SULAYMANIYAH]: 'السليمانية',
	[State.DIYALA]: 'ديالى',
	[State.NINEVEH]: 'نينوى',
	[State.ANBAR]: 'الأنبار',
	[State.KIRKUK]: 'كركوك',
	[State.SALAH_AL_DIN]: 'صلاح الدين',
	[State.WASIT]: 'واسط',
	[State.MUTHANNA]: 'المثنى',
	[State.QADISSIYA]: 'القادسية',
	[State.NAJAF]: 'النجف',
	[State.DIWANIYA]: 'الديوانية',
	[State.KARBALA]: 'كربلاء',
	[State.MAYSAN]: 'ميسان',
};

export const STATE_OPTIONS_AR: ReadonlyArray<{ value: State; label: string }> =
	Object.values(State)
		.filter((v): v is State => typeof v === 'number')
		.map((value) => ({ value, label: STATE_LABEL_AR[value] }));
