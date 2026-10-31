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
  createdat?: string;
  updatedAt?: string;
  updatedat?: string;
}

// Thông số Cloud Server
export interface DigitalCloudServerDto {
  id: string;
  digitalassetid?: string;

  /** Tên cụm / Cluster (VD: FPT - AUM.Phụ lục 01, VPS-AD01) */
  clustername?: string | null;

  /** Mục đích sử dụng (VD: LMS, Hệ thống Active Directory, Kas-Center) */
  purpose?: string | null;

  /** Số lượng vCPU (VD: 4, 8, 42, 97 vCPU) */
  vcpucount?: number | null;

  /** Dung lượng RAM (GB) */
  ramgb?: number | null;
  /** Thông số Storage (VD: 3545GB SSD 2000IOPS, 100GB) */
  storagespec?: string | null;
  operatingsystem?: string | null;
  ipprivate?: string | null;
  ippublic?: string | null;
  allocatedipcount?: number;
  costpermonth?: number | null;
}

// Thông số Domain & SSL
export interface DigitalDomainSslDto {
  id: string;
  digitalassetid?: string;
  recordtype?: string;
  domainname?: string;
  programtag?: string | null;
  functionalscope?: string | null;
  marketingtarget?: string | null;
  ssltype?: string | null;
  bounddomainlist?: string | null;
  autorenew?: boolean;
}

// Thông số Đường truyền Internet
export interface DigitalInternetLineDto {
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

// Thông số Tài khoản SaaS
export interface DigitalSaasAccountDto {
  id: string;
  digitalassetid?: string;
  servicebrand?: string;
  plantier?: string | null;
  adminaccountemail?: string | null;
  totallicensesbought?: number;
  storagequota?: string | null;
}

// Thông số Giấy phép phần mềm (Software License)
export interface DigitalSoftwareLicenseDto {
  id: string;
  digitalassetid?: string;
  softwarename?: string;
  licensekey?: string | null;
  boundhardwareserial?: string | null;
  totalseats?: number;
  allocatedseats?: number;
  isperpetual?: boolean;
}

// Thông số Phân bổ tài khoản SaaS
export interface DigitalSaasAllocationDto {
  id: string;
  digitalassetid?: string;
  assignedemail?: string;
  assignedemployeename?: string | null;
  departmentid?: number | null;
  allocateddate?: Date | string;
  notes?: string | null;
}

// Đối tượng bao gói tài sản số tổng hợp (tương đương DigitalAssetObject của Backend)
export interface DigitalAssetObject {
  digitalAssetDto: DigitalAssetDto;
  digitalCloudServerDto?: DigitalCloudServerDto | null;
  digitalDomainSslDto?: DigitalDomainSslDto | null;
  digitalInternetLineDto?: DigitalInternetLineDto | null;
  digitalSaasAccountDto?: DigitalSaasAccountDto | null;
  digitalSoftwareLicenseDto?: DigitalSoftwareLicenseDto | null;
  digitalSaasAllocationDto?: DigitalSaasAllocationDto | null;
}

export interface DigitalAssetViewdDto {
  id: string;
  assetcode?: string;
  assetCode?: string;
  assetsubtype?: string;
  assetSubType?: string;
  name: string;
  model?: string;
  serialnumber?: string;
  serialNumber?: string;
  barcode?: string;
  contractnumber?: string | null;
  contractNumber?: string | null;
  categoryid?: number | null;
  categoryId?: number | null;
  categoryname?: string;
  categoryName?: string;
  statusid?: number | null;
  statusId?: number | null;
  statusname?: string;
  statusName?: string;
  supplierid?: number | null;
  supplierId?: number | null;
  suppliername?: string;
  supplierName?: string;
  departmentid?: number | null;
  departmentId?: number | null;
  departmentname?: string;
  departmentName?: string;
  costamount?: number;
  costAmount?: number;
  currency?: string;
  billingcycle?: string;
  billingCycle?: string;
  startdate?: string | Date | null;
  startDate?: string | Date | null;
  expirydate?: string | Date | null;
  expiryDate?: string | Date | null;
  renewalalertdate?: string | Date | null;
  renewalAlertDate?: string | Date | null;
  description?: string | null;
  notes?: string | null;
  specs?: any;
  customAttributes?: Array<{ name: string; value: string }>;
}

export type DigitalAsset = DigitalAssetViewdDto;
