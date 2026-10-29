export interface hardwareassetdto {
  id: string;
  assetcode: string;
  assetsubtype: string;
  name: string;
  model: string;
  serialnumber: string;
  barcode: string;
  categoryid: string;
  statusid: string;
  brandid: string;
  supplierid: string;
  locationid: string;
  departmentid: string;
  purchaseprice: string;
  purchasedate: Date;
  effectivedate: Date;
  warrantymonths: number;
  description: string;
  createdate: Date;
  updatedate: Date;
}

export interface assetSpecnasstoragedto {
  id: string;
  hardwareassetid: string;
  devicetype: string;
  cpuprocessor: string;
  installedramgb: number;
  maxramsupportedgb: number;
  drivebayscount: number;
  installedcapacitytb: number;
  maxsinglevolumetb: number;
  cacheslots: string;
  powerratingva: number;
}
export interface assetspecdisplayprojectordto {
  id: string;
  hardwareassetid: string;
  devicetype: string;
  displaytype: string;
  screensizeinches: number;
  resolution: string;
  refreshratehz: number;
  operatingsystem: string;
  brightnessansilumens: number;
  contrastratio: string;
  lampLifehours: number;
  supportedports: string;
}
export interface assetspecnetworkdevicedto {
  id: string;
  hardwareassetid: string;
  devicetype: string;
  firewallthroughput: string;
  ipsthroughput: number;
  vpnthroughput: string;
  concurrentsessions: number;
  portcount: string;
  portspeed: number;
  uplinkports: string;
  antennaspec: number;
  concurrentuserslimit: string;
  maxvlans: number;
  ispoesupported: boolean;
  powerconsumptionw: number;
}
export interface assetspeccameranvrdto {
  id: string;
  hardwareassetid: string;
  devicetype: string;
  resolution: string;
  sensorsize: number;
  lenssize: string;
  irdistancemeters: number;
  compressionstandard: string;
  hastwowayaudio: boolean;
  haswdr: boolean;
  channelcount: number;
  maxstoragetb: number;
  inputbandwidthmbps: number;
  outputbandwidthmbps: number;
}
export interface assetspecprintercopierdto {
  id: string;
  hardwareassetid: string;
  devicetype: string;
  ipsetup: string;
  maxpapersize: number;
  printspeedppm: string;
  printresolution: number;
  inkcartridgetype: string;
  drumlifepages: number;
  lastinkrefilldate: Date;
  lastcleaningdate: Date;
  shredstyle: string;
  shredcapacitysheets: number;
  bincapacityliters: number;
}

export interface hardwareassetobject {
  hardwareassetdto: hardwareassetdto;
  assetSpecnasstoragedto: assetSpecnasstoragedto;
  assetspecdisplayprojectordto: assetspecdisplayprojectordto;
  assetspecnetworkdevicedto: assetspecnetworkdevicedto;
  assetspeccameranvrdto: assetspeccameranvrdto;
  assetspecprintercopierdto: assetspecprintercopierdto;
}

export interface hardwareassetviewdto {
  id: string;
  assetcode: string;
  assetsubtype: string;
  name: string;
  model: string;
  serialnumber: string;
  barcode: string;
  categoryname: string;
  statusname: string;
  suppliername: string;
  locationname: string;
  departmentname: string;
  totalcount: number;
}