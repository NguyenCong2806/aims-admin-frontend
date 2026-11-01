// Định nghĩa enum cho loại tài sản số để tránh gõ sai chính tả
export type DigitalAssetSubType =
  | 'DOMAIN'
  | 'SSL'
  | 'CLOUD_SERVER'
  | 'SOFTWARE_LICENSE'
  | 'SAAS_SUBSCRIPTION'
  | 'INTERNET_LINE';

// Interface dữ liệu đầy đủ trả về từ Backend (GET)
export interface DigitalAssetDto {
  id: string;
  assetcode?: string;
  name: string;
  assetsubtype?: DigitalAssetSubType | string;
  contractnumber?: string | null;
  categoryid?: number | null;
  statusid?: number | null;
  supplierid?: number | null;
  departmentid?: number | null;
  costamount?: number | null;
  currency?: string | null;       // 'VND', 'USD'...
  billingcycle?: string | null;   // 'Hàng tháng', 'Hàng năm', 'Vĩnh viễn'...
  startdate?: Date | null;
  expirydate?: Date | null;
  renewalalertdate?: Date | null;
  description?: string | null;
  suppliername?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// 1. Interface cơ sở cho toàn bộ các thông số kỹ thuật (Spec)
// Tương đương IDigitalAssetSpec của C# Backend
export interface IDigitalAssetSpec {
  id: string;
  digitalassetid?: string;
}

// 2. Spec: INTERNET_LINE (Tương đương InternetLineSpecDto của C# Backend)
export interface DigitalInternetLineDto extends IDigitalAssetSpec {
  id: string;
  digitalassetid?: string;
  linetype?: string | null;
  domesticbandwidthmbps?: number | null;
  internationalminbandwidthmbps?: number | null;
  monthlyfee?: number | null;
  annualfee?: number | null;
  iptype?: string | null;
  staticipaddress?: string | null;
}

// 3. Spec: DOMAIN / SSL (Tương đương DomainSslSpecDto của C# Backend)
export interface DigitalDomainSslDto extends IDigitalAssetSpec {
  id: string;
  digitalassetid?: string;
  recordtype?: string | null;
  domainname?: string | null;
  programtag?: string | null;
  functionalscope?: string | null;
  marketingtarget?: string | null;
  ssltype?: string | null;
  bounddomainlist?: string | null;
  autorenew?: boolean;
}

// 4. Spec: CLOUD_SERVER (Tương đương CloudServerSpecDto của C# Backend)
export interface DigitalCloudServerDto extends IDigitalAssetSpec {
  id: string;
  digitalassetid?: string;
  clustername?: string | null;
  purpose?: string | null;
  vcpucount?: number | null;
  ramgb?: number | null;
  storagespec?: string | null;
  operatingsystem?: string | null;
  ipprivate?: string | null;
  ippublic?: string | null;
  allocatedipcount?: number;
  costpermonth?: number | null;
}

// 5. Spec: SOFTWARE_LICENSE (Tương đương SoftwareLicenseSpecDto của C# Backend)
export interface DigitalSoftwareLicenseDto extends IDigitalAssetSpec {
  id: string;
  digitalassetid?: string;
  softwarename?: string | null;
  licensekey?: string | null;
  boundhardwareserial?: string | null;
  totalseats?: number;
  allocatedseats?: number;
  isperpetual?: boolean;
}

// 6. Spec: SAAS_SUBSCRIPTION (Tương đương SaasSubscriptionSpecDto của C# Backend)
export interface DigitalSaasAccountDto extends IDigitalAssetSpec {
  id: string;
  digitalassetid?: string;
  servicebrand?: string | null;
  plantier?: string | null;
  adminaccountemail?: string | null;
  totallicensesbought?: number;
  storagequota?: string | null;
}

// Đối tượng bao gói tài sản số tổng hợp (tương đương DigitalAssetObject của Backend)
export interface DigitalAssetObject {
  digitalAssetDto: DigitalAssetDto;
  digitalCloudServerDto?: DigitalCloudServerDto | null;
  digitalDomainSslDto?: DigitalDomainSslDto | null;
  digitalInternetLineDto?: DigitalInternetLineDto | null;
  digitalSaasAccountDto?: DigitalSaasAccountDto | null;
  digitalSoftwareLicenseDto?: DigitalSoftwareLicenseDto | null;
}

export interface DigitalAssetViewdDto {
  id: string;
  assetCode?: string;
  assetSubType?: string;
  name: string;
  model?: string;
  serialNumber?: string;
  barcode?: string;
  contractNumber?: string | null;
  categoryId?: number | null;
  categoryName?: string;
  statusId?: number | null;
  statusName?: string;
  supplierId?: number | null;
  supplierName?: string;
  departmentId?: number | null;
  departmentName?: string;
  costAmount?: number;
  currency?: string;
  billingCycle?: string;
  startDate?: string | Date | null;
  expiryDate?: string | Date | null;
  renewalAlertDate?: string | Date | null;
  description?: string | null;
  notes?: string | null;
  specs?: any;
  customAttributes?: Array<{ name: string; value: string }>;
}

export type DigitalAsset = DigitalAssetViewdDto;
