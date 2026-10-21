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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Loại bản ghi */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
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
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {domainErrors?.recordtype && (
            <p className="text-red-500 text-xs mt-1">{domainErrors.recordtype.message}</p>
          )}
        </div>

        {/* 2. Tên miền kỹ thuật */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Tên miền kỹ thuật (FQDN)
          </Label>
          <Input
            type="text"
            placeholder="VD: aum.edu.vn, api.aum.edu.vn"
            {...register("domaindetail.domainname")}
            error={!!domainErrors?.domainname}
            hint={domainErrors?.domainname?.message}
          />
        </div>

        {/* 3. Chương trình / hệ thống liên quan */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Chương trình / Hệ thống phục vụ
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
                placeholder="Chọn chương trình / hệ thống"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {domainErrors?.programtag && (
            <p className="text-red-500 text-xs mt-1">{domainErrors.programtag.message}</p>
          )}
        </div>

        {/* 4. Phạm vi chức năng */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
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
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {domainErrors?.functionalscope && (
            <p className="text-red-500 text-xs mt-1">{domainErrors.functionalscope.message}</p>
          )}
        </div>

        {/* 5. Mục tiêu / chức năng Marketing */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Mục tiêu Marketing / SEO
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
                placeholder="Chọn mục tiêu / chiến dịch"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {domainErrors?.marketingtarget && (
            <p className="text-red-500 text-xs mt-1">{domainErrors.marketingtarget.message}</p>
          )}
        </div>

        {/* 6. Loại SSL */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Loại chứng thư SSL
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
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {domainErrors?.ssltype && (
            <p className="text-red-500 text-xs mt-1">{domainErrors.ssltype.message}</p>
          )}
        </div>

        {/* 7. Danh sách Domain được SSL trỏ tới / SAN List */}
        <div className="col-span-1 md:col-span-2">
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Danh sách SAN Domains (Subject Alternative Names)
          </Label>
          <Input
            type="text"
            placeholder="VD: *.aum.edu.vn, aum.edu.vn, portal.aum.edu.vn"
            {...register("domaindetail.bounddomainlist")}
            error={!!domainErrors?.bounddomainlist}
            hint={domainErrors?.bounddomainlist?.message || "Cách nhau bằng dấu phẩy nếu bảo vệ nhiều tên miền"}
          />
        </div>
      </div>

      {/* 8. Checkbox Tự động gia hạn */}
      <div className="mt-3 p-3.5 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 flex items-start gap-3 transition-colors">
        <Controller
          control={control}
          name="domaindetail.autorenew"
          defaultValue={false}
          render={({ field }) => (
            <div className="pt-0.5">
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(checked: boolean) => field.onChange(checked)}
              />
            </div>
          )}
        />
        <div className="text-sm">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Tự động kích hoạt quy trình gia hạn khi đến hạn
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Hệ thống sẽ gửi cảnh báo tới quản trị viên trước 30 ngày và chuẩn bị yêu cầu thanh toán gia hạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalDomainSslPage;