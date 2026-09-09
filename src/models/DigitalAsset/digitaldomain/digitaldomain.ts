import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface DigitalDomainSSL extends BaseLookupEntity {
  domainname?: string;
  ssltype?: string;
  autorenew?: boolean;
  expiredate?: Date;
  dnsprovider?: string;
}

export interface CreateDigitalDomainSSL extends BaseLookupEntity {
  domainname?: string;
  ssltype?: string;
  autorenew?: boolean;
  expiredate?: Date;
  dnsprovider?: string;
}

export interface UpdateDigitalDomainSSL extends BaseLookupEntity {
  domainname?: string;
  ssltype?: string;
  autorenew?: boolean;
  expiredate?: Date;
  dnsprovider?: string;
}
