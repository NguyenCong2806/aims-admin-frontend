import { BaseLookupEntity } from "../../BaseEntriy/BaseLookupEntity";

export interface DigitalDomainSSL extends BaseLookupEntity {
  recordtype?: string;
  domainname?: string;
  ssltype?: string;
  programtag?: string;
  functionalscope?: string;
  marketingtarget?: string;
  bounddomainlist?: string;
  autorenew?: boolean;
}

export interface CreateDigitalDomainSSL extends BaseLookupEntity {
  recordtype?: string;
  domainname?: string;
  ssltype?: string;
  programtag?: string;
  functionalscope?: string;
  marketingtarget?: string;
  bounddomainlist?: string;
  autorenew?: boolean;
}

export interface UpdateDigitalDomainSSL extends BaseLookupEntity {
  recordtype?: string;
  domainname?: string;
  ssltype?: string;
  programtag?: string;
  functionalscope?: string;
  marketingtarget?: string;
  bounddomainlist?: string;
  autorenew?: boolean;
}
