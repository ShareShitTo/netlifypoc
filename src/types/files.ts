export type FileMeta = {
  id: string;
  name: string;
  size: number;
  mime: string;
  ext: string;
  uploadedAt: string;
};

export type ListFilesResponse = {
  files: FileMeta[];
};

export type UploadFileResponse = {
  file: FileMeta;
};

export type DeleteFileResponse = {
  deleted: true;
  id: string;
};

export type ApiErrorResponse = {
  error: string;
};
