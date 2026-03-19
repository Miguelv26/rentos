export type TemplateVariables = Record<string, string | number>;

export const applyTemplateString = (template: string, variables: TemplateVariables): string => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    const token = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(token, String(value));
  }, template);
};

export const calculateReminderSendAt = (fechaInicio: string): string => {
  const start = new Date(fechaInicio);
  const sendAt = new Date(start.getTime() - (24 * 60 * 60 * 1000));
  return sendAt.toISOString();
};

export const shouldTrigger24hReminder = (fechaInicio: string, nowIso: string): boolean => {
  const now = new Date(nowIso).getTime();
  const start = new Date(fechaInicio).getTime();
  const reminderAt = start - (24 * 60 * 60 * 1000);

  return now >= reminderAt && now < start;
};
