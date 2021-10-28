export enum FileExtensionEnum {
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg',
}

export enum ContentTypeEnum {
  'PNG' = 'image/png',
  'JPG' = 'image/jpg',
  'JPEG' = 'image/jpeg',
}

export type FileExtensionType = keyof typeof FileExtensionEnum;
export type ContentTypeType = keyof typeof ContentTypeEnum;
