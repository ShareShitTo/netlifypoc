export type Item = {
  id: string;
  text: string;
  createdAt: string;
};

export type ListItemsResponse = {
  items: Item[];
};

export type CreateItemRequest = {
  text: string;
};

export type CreateItemResponse = {
  item: Item;
};

export type DeleteItemResponse = {
  deleted: true;
  id: string;
};

export type ApiErrorResponse = {
  error: string;
};
