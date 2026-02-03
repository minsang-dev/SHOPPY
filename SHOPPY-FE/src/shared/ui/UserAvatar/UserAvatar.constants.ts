export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #434343 0%, #000000 100%)',
  'linear-gradient(135deg, #3b82f6 0%, #bae6fd 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

export const getAvatarGradient = (colorKey: string | number): string => {
  const key = typeof colorKey === 'number' ? colorKey : colorKey.toString().charCodeAt(0);
  const index = Math.abs(key) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

export const getAvatarInitial = (name: string): string => name.charAt(0) || '?';
