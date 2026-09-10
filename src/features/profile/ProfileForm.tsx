import { FormEvent, useEffect, useState } from 'react';
import type { ProfileFormValues } from '../../services/memberService';
import type { Member } from '../../types/member';

type ProfileFormProps = {
  member: Member;
  isSubmitting?: boolean;
  onSubmit: (values: ProfileFormValues) => void;
};

export const ProfileForm = ({ member, isSubmitting, onSubmit }: ProfileFormProps) => {
  const [values, setValues] = useState<ProfileFormValues>({
    fullName: member.fullName,
    dateOfBirth: member.dateOfBirth ?? '',
    gender: member.gender ?? '',
    phone: member.phone ?? '',
    email: member.email ?? '',
    address: member.address ?? '',
  });

  useEffect(() => {
    setValues({
      fullName: member.fullName,
      dateOfBirth: member.dateOfBirth ?? '',
      gender: member.gender ?? '',
      phone: member.phone ?? '',
      email: member.email ?? '',
      address: member.address ?? '',
    });
  }, [member]);

  const updateField = (field: keyof ProfileFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <label>
        Họ tên
        <input
          required
          maxLength={255}
          value={values.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          maxLength={255}
          value={values.email ?? ''}
          onChange={(event) => updateField('email', event.target.value)}
        />
      </label>
      <label>
        Số điện thoại
        <input
          maxLength={30}
          value={values.phone ?? ''}
          onChange={(event) => updateField('phone', event.target.value)}
        />
      </label>
      <label>
        Ngày sinh
        <input
          type="date"
          value={values.dateOfBirth ?? ''}
          onChange={(event) => updateField('dateOfBirth', event.target.value)}
        />
      </label>
      <label>
        Giới tính
        <select value={values.gender ?? ''} onChange={(event) => updateField('gender', event.target.value)}>
          <option value="">Chưa chọn</option>
          <option value="MALE">Nam</option>
          <option value="FEMALE">Nữ</option>
          <option value="OTHER">Khác</option>
        </select>
      </label>
      <label className="form-wide">
        Địa chỉ
        <input
          maxLength={500}
          value={values.address ?? ''}
          onChange={(event) => updateField('address', event.target.value)}
        />
      </label>
      <div className="form-actions form-wide">
        <button className="primary-button inline-button" type="submit" disabled={isSubmitting}>
          Lưu thông tin
        </button>
      </div>
    </form>
  );
};
