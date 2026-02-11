function parsePagination(query) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  if (!Number.isFinite(page) && !Number.isFinite(limit)) {
    return { enabled: false };
  }

  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 20;
  const safePage = Number.isFinite(page) ? Math.max(page, 1) : 1;
  const skip = (safePage - 1) * safeLimit;

  return {
    enabled: true,
    page: safePage,
    limit: safeLimit,
    skip
  };
}

function applyPaginationHeaders(res, pagination, totalCount) {
  if (!pagination || !pagination.enabled) return;
  res.set('X-Total-Count', String(totalCount));
  res.set('X-Page', String(pagination.page));
  res.set('X-Limit', String(pagination.limit));
}

module.exports = {
  parsePagination,
  applyPaginationHeaders
};
