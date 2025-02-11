export const PHONE_ERROR_MESSAGES = {
  INVALID_FORMAT: 'Номер телефона должен начинаться с 7 и содержать ровно 11 цифр',
  DUPLICATE_IN_REQUEST: 'Дублирование номеров телефона не допускается',
  ALREADY_EXISTS: (phone: string) => `Номер телефона +${phone} уже зарегистрирован`,
  ALREADY_EXISTS_OTHER: (phone: string) => `Номер телефона +${phone} уже зарегистрирован у другого контакта`,
} as const;

export const COMMON_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Ошибка валидации',
} as const; 