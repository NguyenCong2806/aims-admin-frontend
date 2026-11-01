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
  digital_asset_id?: string;
  digitalAssetId?: string;
}

// 2. Spec: INTERNET_LINE (Tương đương InternetLineSpecDto của C# Backend)
export interface DigitalInternetLineDto extends IDigitalAssetSpec {
  id: string;
  line_type?: string | null;
  domestic_bandwidth_mbps?: number | null;
  international_min_bandwidth_mbps?: number | null;
  monthly_fee?: number | null;
  annual_fee?: number | null;
  ip_type?: string | null;
  static_ip_address?: string | null;
}

// 3. Spec: DOMAIN / SSL (Tương đương DomainSslSpecDto của C# Backend)
export interface DigitalDomainSslDto extends IDigitalAssetSpec {
  id: string;
  record_type?: string | null;
  domain_name?: string | null;
  program_tag?: string | null;
  functional_scope?: string | null;
  marketing_target?: string | null;
  ssl_type?: string | null;
  bound_domain_list?: string | null;
  auto_renew?: boolean;
}

// 4. Spec: CLOUD_SERVER (Tương đương CloudServerSpecDto của C# Backend)
export interface DigitalCloudServerDto extends IDigitalAssetSpec {
  id: string;
  cluster_name?: string | null;
  purpose?: string | null;
  vcpu_count?: number | null;
  ram_gb?: number | null;
  storage_spec?: string | null;
  operating_system?: string | null;
  ip_private?: string | null;
  ip_public?: string | null;
  allocated_ip_count?: number;
  cost_per_month?: number | null;
}

// 5. Spec: SOFTWARE_LICENSE (Tương đương SoftwareLicenseSpecDto của C# Backend)
export interface DigitalSoftwareLicenseDto extends IDigitalAssetSpec {
  id: string;
  software_name?: string | null;
  license_key?: string | null;
  bound_hardware_serial?: string | null;
  total_seats?: number;
  allocated_seats?: number;
  is_perpetual?: boolean;
}

// 6. Spec: SAAS_SUBSCRIPTION (Tương đương SaasSubscriptionSpecDto của C# Backend)
export interface DigitalSaasAccountDto extends IDigitalAssetSpec {
  id: string;
  service_brand?: string | null;
  plan_tier?: string | null;
  admin_account_email?: string | null;
  total_licenses_bought?: number;
  storage_quota?: string | null;
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
