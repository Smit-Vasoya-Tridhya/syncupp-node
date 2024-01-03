exports.paginationObject = (paginationObject) => {
  const page = paginationObject.page || 1;
  const resultPerPage = paginationObject.itemsPerPage || 10;
  const skip = resultPerPage * (page - 1);
  const sortOrder = paginationObject.sortOrder === "asc" ? 1 : -1;

  const sortField =
    paginationObject.sortField !== ""
      ? paginationObject.sortField
      : "createdAt";
  const sort = {};
  sort[sortField] = sortOrder;

  return { page, skip, resultPerPage, sort };
};

exports.getKeywordType = (keyword) => {
  if (!isNaN(keyword)) {
    return "number";
  } else if (Date.parse(keyword)) {
    return "date";
  } else {
    return "string";
  }
};
