export function getPageStartIndex(
	currentPage: number,
	perPage: number,
): number {
	if (!Number.isFinite(currentPage) || currentPage <= 1) return 1;
	if (!Number.isFinite(perPage) || perPage <= 0) return 1;
	return (Math.floor(currentPage) - 1) * Math.floor(perPage) + 1;
}
