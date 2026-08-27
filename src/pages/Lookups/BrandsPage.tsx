import React from 'react';
import { DynamicLookupManager } from '../../components/DynamicLookupManager';
import { BrandItem } from '../../types/brand';


const BrandsPage: React.FC = () => {
  return (
    <DynamicLookupManager<BrandItem>
      config={{
        title: 'Hãng Sản Xuất (Brands)',
        endpoint: '/brands',
        
        // 1. Cấu hình hiển thị thêm các cột Website, Hotline, Quốc gia ra bảng
        columns: [
          {
            key: 'website',
            label: 'Trang Web',
            render: (value) =>
              value ? (
                <a
                  href={String(value).startsWith('http') ? String(value) : `https://${value}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {String(value)}
                </a>
              ) : (
                '-'
              ),
          },
          { key: 'supportcontact', label: 'Hotline Hỗ Trợ' },
        ],

        // 2. Giá trị mặc định khi tạo mới
        initialCustomData: {
          website: '',
          supportcontact: '',
        },

        // 3. Render các ô nhập liệu mở rộng trong Modal Thêm/Sửa
        renderCustomFields: (formData, setFormData) => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Trang Web</label>
                <input
                  type="text"
                  placeholder="https://dell.com"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full rounded border border-stroke px-3 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Hotline Hỗ Trợ</label>
                <input
                  type="text"
                  placeholder="1800 545455"
                  value={formData.supportcontact || ''}
                  onChange={(e) => setFormData({ ...formData, supportcontact: e.target.value })}
                  className="w-full rounded border border-stroke px-3 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
              </div>
            </div>
          </div>
        ),
      }}
    />
  );
};
export default BrandsPage;