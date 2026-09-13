import React, { useEffect } from "react";
import Checkbox from "../../../components/form/input/Checkbox";
import Input from "../../../components/form/input/InputField";
import { DigitalDomainSSL } from "../../../models/DigitalAsset/digitaldomain/digitaldomain";
import { DigitalDomainSSLFormData, digitaldomainsslSchema } from "../../../validations/digitaldomainssl.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Select from "../../../components/form/Select";
import { domainsslList, domainSslPurposeList, domainsslTypeList, functionalScopeList, relatedProgramList } from "../../../common/DomainSSLTypeList";
import Label from "../../../components/form/Label";

interface DigitalDomainSslProps {
  digitaldomainssl?: DigitalDomainSSL | null;
  onChange?: (data: Partial<DigitalDomainSSL>, isValid: boolean) => void;
}

const DigitalDomainSslPage: React.FC<DigitalDomainSslProps> = ({
  digitaldomainssl,
  onChange,
}) => {
  const {
    register,
    control,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<DigitalDomainSSLFormData>({
    resolver: zodResolver(digitaldomainsslSchema),
    mode: "onChange",
    defaultValues: {
      recordtype: digitaldomainssl?.recordtype || "",
      domainname: digitaldomainssl?.domainname || "",
      programtag: digitaldomainssl?.programtag || "",
      functionalscope: digitaldomainssl?.functionalscope || "",
      marketingtarget: digitaldomainssl?.marketingtarget || "",
      ssltype: digitaldomainssl?.ssltype || "",
      bounddomainlist: digitaldomainssl?.bounddomainlist || "",
      autorenew: digitaldomainssl?.autorenew ?? false,
    },
  });

  // Đồng bộ lại form khi props từ ngoài truyền vào thay đổi (Edit mode)
  useEffect(() => {
    if (digitaldomainssl) {
      reset({
        recordtype: digitaldomainssl.recordtype || "",
        domainname: digitaldomainssl.domainname || "",
        programtag: digitaldomainssl.programtag || "",
        functionalscope: digitaldomainssl.functionalscope || "",
        marketingtarget: digitaldomainssl.marketingtarget || "",
        ssltype: digitaldomainssl.ssltype || "",
        bounddomainlist: digitaldomainssl.bounddomainlist || "",
        autorenew: digitaldomainssl.autorenew ?? false,
      });
    }
  }, [digitaldomainssl, reset]);

  // Lắng nghe thay đổi dữ liệu form và gửi ngược lại trang cha
  useEffect(() => {
    const subscription = watch((value) => {
      onChange?.(value as Partial<DigitalDomainSSL>, isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, isValid]);

  return (
    <div className="space-y-4">
      {/* Loại bản ghi */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Loại bản ghi
        </Label>
        <Controller
          control={control}
          name="recordtype"
          render={({ field }) => (
            <Select
              options={domainsslList.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              placeholder="Chọn loại bản ghi"
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.recordtype && (
          <p className="text-red-500 text-xs mt-1">{errors.recordtype.message}</p>
        )}
      </div>

      {/* Tên miền kỹ thuật */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Tên miền kỹ thuật <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          placeholder="aum.edu.vn, sambala.net"
          {...register("domainname")}
          error={!!errors.domainname}
          hint={errors.domainname?.message}
        />
      </div>

      {/* Chương trình / hệ thống liên quan */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Chương trình / hệ thống liên quan
        </Label>
         <Controller
          control={control}
          name="functionalscope"
          render={({ field }) => (
            <Select
              options={relatedProgramList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Chương trình / hệ thống liên quan"
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.functionalscope && (
          <p className="text-red-500 text-xs mt-1">{errors.functionalscope.message}</p>
        )}
      </div>

      {/* Phạm vi chức năng */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Phạm vi chức năng
        </Label>
        <Controller
          control={control}
          name="functionalscope"
          render={({ field }) => (
            <Select
              options={functionalScopeList.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              placeholder="Phạm vi chức năng"
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.functionalscope && (
          <p className="text-red-500 text-xs mt-1">{errors.functionalscope.message}</p>
        )}
      </div>

      {/* Mục tiêu / chức năng Marketing */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Mục tiêu / chức năng Marketing
        </Label>
        <Controller
          control={control}
          name="marketingtarget"
          render={({ field }) => (
            <Select
              options={domainSslPurposeList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Mục tiêu / chức năng Marketing"
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.marketingtarget && (
          <p className="text-red-500 text-xs mt-1">{errors.marketingtarget.message}</p>
        )}
      </div>

      {/* Loại SSL */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Loại SSL
        </Label>
        <Controller
          control={control}
          name="recordtype"
          render={({ field }) => (
            <Select
              options={domainsslTypeList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Chọn loại bản ghi"
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.recordtype && (
          <p className="text-red-500 text-xs mt-1">{errors.recordtype.message}</p>
        )}
      </div>

      {/* Danh sách Domain được SSL trỏ tới / SAN List */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Danh sách Domain được SSL trỏ tới / SAN List
        </Label>
        <Input
          type="text"
          placeholder="Danh sách Domain được SSL trỏ tới / SAN List"
          {...register("bounddomainlist")}
          error={!!errors.bounddomainlist}
          hint={errors.bounddomainlist?.message}
        />
      </div>

      {/* Checkbox Tự động gia hạn */}
      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="autorenew"
          render={({ field }) => (
            <Checkbox
              checked={Boolean(field.value)}
              onChange={(checked: boolean) => field.onChange(checked)}
            />
          )}
        />
        <span className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          Tự động gia hạn
        </span>
      </div>
    </div>
  );
};

export default DigitalDomainSslPage;