/**
 * Country enum — mirrors Laravel `App\Enums\CountryTypes` (int-backed).
 * Keep numeric values in sync with the backend enum.
 */
export enum Country {
	IRAQ = 1,
	OTHER = 2,
}

export const COUNTRY_LABEL: Record<Country, string> = {
	[Country.IRAQ]: 'Iraq',
	[Country.OTHER]: 'Other',
};

/** Convenience list for `<select>` options. */
export const COUNTRY_OPTIONS: ReadonlyArray<{
	value: Country;
	label: string;
}> = Object.values(Country)
	.filter((v): v is Country => typeof v === 'number')
	.map((value) => ({ value, label: COUNTRY_LABEL[value] }));
