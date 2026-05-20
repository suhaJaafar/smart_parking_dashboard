/** Stateless presentational primitives shared by every form in the app. */

import type {
	InputHTMLAttributes,
	LabelHTMLAttributes,
	ReactNode,
	SelectHTMLAttributes,
	TextareaHTMLAttributes,
} from 'react';

const CONTROL_BASE =
	'rounded-md border border-zinc-300 bg-white text-sm shadow-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-zinc-800';
const INPUT_HEIGHT = 'h-10 px-3';
const TEXTAREA_PADDING = 'px-3 py-2';

interface BaseFieldProps {
	label: ReactNode;
	hint?: ReactNode;
	error?: string;
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

function Label({
	htmlFor,
	children,
	...rest
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
	return (
		<label
			htmlFor={htmlFor}
			{...rest}
			className='text-sm font-medium text-zinc-800 dark:text-zinc-200'
		>
			{children}
		</label>
	);
}

function FieldError({ error }: { error?: string }) {
	if (!error) return null;
	return <p className='text-xs text-red-600 dark:text-red-400'>{error}</p>;
}

function FieldHint({ hint }: { hint?: ReactNode }) {
	if (!hint) return null;
	return <p className='text-xs text-zinc-500 dark:text-zinc-400'>{hint}</p>;
}

/** Single-line text/number/email/password input. */
export function Field({
	label,
	hint,
	error,
	labelProps,
	...input
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
	const id = input.id ?? input.name;
	return (
		<div className='flex flex-col gap-1.5'>
			<Label htmlFor={id} {...labelProps}>
				{label}
			</Label>
			<input
				id={id}
				{...input}
				aria-invalid={error ? true : undefined}
				className={`${CONTROL_BASE} ${INPUT_HEIGHT}`}
			/>
			<FieldHint hint={hint} />
			<FieldError error={error} />
		</div>
	);
}

/** Multi-line textarea. */
export function Textarea({
	label,
	hint,
	error,
	labelProps,
	...input
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
	const id = input.id ?? input.name;
	return (
		<div className='flex flex-col gap-1.5'>
			<Label htmlFor={id} {...labelProps}>
				{label}
			</Label>
			<textarea
				id={id}
				rows={3}
				{...input}
				aria-invalid={error ? true : undefined}
				className={`${CONTROL_BASE} ${TEXTAREA_PADDING}`}
			/>
			<FieldHint hint={hint} />
			<FieldError error={error} />
		</div>
	);
}

export interface SelectOption {
	value: number | string;
	label: string;
}

/** `<select>` with consistent styling and a placeholder option. */
export function Select({
	label,
	hint,
	error,
	labelProps,
	options,
	placeholder = 'Select…',
	...select
}: BaseFieldProps &
	SelectHTMLAttributes<HTMLSelectElement> & {
		options: readonly SelectOption[];
		placeholder?: string;
	}) {
	const id = select.id ?? select.name;
	return (
		<div className='flex flex-col gap-1.5'>
			<Label htmlFor={id} {...labelProps}>
				{label}
			</Label>
			<select
				id={id}
				{...select}
				aria-invalid={error ? true : undefined}
				className={`${CONTROL_BASE} ${INPUT_HEIGHT}`}
			>
				<option value=''>{placeholder}</option>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			<FieldHint hint={hint} />
			<FieldError error={error} />
		</div>
	);
}

/** Titled, bordered section that groups related fields. */
export function Fieldset({
	title,
	description,
	children,
}: {
	title: string;
	description?: ReactNode;
	children: ReactNode;
}) {
	return (
		<fieldset className='space-y-3 rounded-xl border border-black/[.06] bg-white p-4 dark:border-white/[.08] dark:bg-zinc-950'>
			<legend className='px-1 text-xs font-medium uppercase tracking-wide text-zinc-500'>
				{title}
			</legend>
			{description ? (
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>
					{description}
				</p>
			) : null}
			{children}
		</fieldset>
	);
}

/** Top-of-form banner for non-field errors (`state.message`). */
export function FormErrorBanner({ message }: { message?: string }) {
	if (!message) return null;
	return (
		<p
			role='alert'
			className='rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
		>
			{message}
		</p>
	);
}

/**
 * Renders a flat list of field-level error messages.
 *
 * Useful for surfacing server-side validation errors for inputs that have no
 * visible control of their own (e.g. hidden `latitude` / `longitude` inputs
 * driven by a map picker). Returns `null` when there is nothing to show.
 */
export function FieldErrorList({
	errors,
}: {
	errors: ReadonlyArray<string | undefined>;
}) {
	const visible = errors.filter(
		(msg): msg is string => typeof msg === 'string' && msg.length > 0,
	);
	if (visible.length === 0) return null;
	return (
		<ul className='space-y-0.5 text-xs text-red-600 dark:text-red-400'>
			{visible.map((msg, i) => (
				<li key={i}>{msg}</li>
			))}
		</ul>
	);
}

/** Primary submit button. Renders a pending label while the action is in flight. */
export function SubmitButton({
	pending,
	idleLabel,
	pendingLabel,
	className = '',
}: {
	pending: boolean;
	idleLabel: string;
	pendingLabel?: string;
	className?: string;
}) {
	return (
		<button
			type='submit'
			disabled={pending}
			className={
				'mt-2 inline-flex h-10 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc] ' +
				className
			}
		>
			{pending ? (pendingLabel ?? `${idleLabel}…`) : idleLabel}
		</button>
	);
}
