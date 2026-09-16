/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Controller, UseFormRegister, Control, FieldErrors } from "react-hook-form";
import Checkbox from "../../../components/form/input/Checkbox";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import {
  domainsslList,
  domainSslPurposeList,
  domainsslTypeList,
  functionalScopeList,
  relatedProgramList,
} from "../../../common/DomainSSLTypeList";

interface DigitalDomainSslProps {
  register: UseFormRegister<any>;
  control: Control<any, any>;
  errors: FieldErrors<any>;
}

const DigitalDomainSslPage: React.FC<DigitalDomainSslProps> = ({
  register,
  control,
  errors,
}) => {
  const domainErrors = errors?.domaindetail as any;

  return (
    <div className="space-y-4">
      {/* 1. Loại bản ghi */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loại bản ghi
        </Label>
        <Controller
          control={control}
          name="domaindetail.recordtype"
          defaultValue="DOMAIN"
          render={({ field }) => (
            <Select
              options={domainsslList.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              placeholder="Chọn loại bản ghi"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {domainErrors?.recordtype && (
          <p className="text-red-500 text-xs mt-1">{domainErrors.recordtype.message}</p>
        )}
      </div>

      {/* 2. Tên miền kỹ thuật */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tên miền kỹ thuật
        </Label>
        <Input
          type="text"
          placeholder="VD: aum.edu.vn, sambala.net"
          {...register("domaindetail.domainname")}
          error={!!domainErrors?.domainname}
          hint={domainErrors?.domainname?.message}
        />
      </div>

      {/* 3. Chương trình / hệ thống liên quan */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Chương trình / hệ thống liên quan
        </Label>
        <Controller
          control={control}
          name="domaindetail.programtag"
          render={({ field }) => (
            <Select
              options={relatedProgramList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Chọn chương trình / hệ thống liên quan"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {domainErrors?.programtag && (
          <p className="text-red-500 text-xs mt-1">{domainErrors.programtag.message}</p>
        )}
      </div>

      {/* 4. Phạm vi chức năng */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phạm vi chức năng
        </Label>
        <Controller
          control={control}
          name="domaindetail.functionalscope"
          render={({ field }) => (
            <Select
              options={functionalScopeList.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              placeholder="Chọn phạm vi chức năng"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {domainErrors?.functionalscope && (
          <p className="text-red-500 text-xs mt-1">{domainErrors.functionalscope.message}</p>
        )}
      </div>

      {/* 5. Mục tiêu / chức năng Marketing */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mục tiêu / chức năng Marketing
        </Label>
        <Controller
          control={control}
          name="domaindetail.marketingtarget"
          render={({ field }) => (
            <Select
              options={domainSslPurposeList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Chọn mục tiêu / chức năng Marketing"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {domainErrors?.marketingtarget && (
          <p className="text-red-500 text-xs mt-1">{domainErrors.marketingtarget.message}</p>
        )}
      </div>

      {/* 6. Loại SSL */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loại SSL
        </Label>
        <Controller
          control={control}
          name="domaindetail.ssltype"
          render={({ field }) => (
            <Select
              options={domainsslTypeList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Chọn loại SSL"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {domainErrors?.ssltype && (
          <p className="text-red-500 text-xs mt-1">{domainErrors.ssltype.message}</p>
        )}
      </div>

      {/* 7. Danh sách Domain được SSL trỏ tới / SAN List */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Danh sách Domain được SSL trỏ tới / SAN List
        </Label>
        <Input
          type="text"
          placeholder="VD: *.aum.edu.vn, aum.edu.vn"
          {...register("domaindetail.bounddomainlist")}
          error={!!domainErrors?.bounddomainlist}
          hint={domainErrors?.bounddomainlist?.message}
        />
      </div>

      {/* 8. Checkbox Tự động gia hạn */}
      <div className="flex items-center gap-3 pt-2">
        <Controller
          control={control}
          name="domaindetail.autorenew"
          defaultValue={false}
          render={({ field }) => (
            <Checkbox
              checked={Boolean(field.value)}
              onChange={(checked: boolean) => field.onChange(checked)}
            />
          )}
        />
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Tự động gia hạn khi đến hạn
        </span>
      </div>
    </div>
  );
};

export default DigitalDomainSslPage;