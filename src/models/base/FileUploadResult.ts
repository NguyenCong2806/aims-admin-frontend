export interface FileUploadResult{
  fileName: string;
  storedFileName:string;
  relativeUrl: string;
  fileSizeBytes: number;
  contentType: string;
}